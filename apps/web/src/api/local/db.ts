import { isLocalPreferenceEnabled } from "@/api/local/policy";
import { CurrentEnvironment } from "@shared/constants/project";
import { Environment } from "@shared/types/environment.type";
import { drizzle } from "drizzle-orm/sqlite-proxy";
import { SQLocalDrizzle } from "sqlocal/drizzle";
import { LocalDBMigrator } from "./migrator";
import { isOPFSMissingFileError, recoverOPFSError } from "./recover";
import * as schema from "./schemas";

// extract hot reloadable data with the sqlocal drizzle instance
const hotReloadable = import.meta.hot?.data as
  | {
      sqlocalDrizzle?: SQLocalDrizzle;
    }
  | undefined;
// create the sqlocal drizzle using either the data from HMR hot reload whose type is defined on the above
// or the new sqlocal drizzle instance created here
const sqlocalDrizzle =
  hotReloadable?.sqlocalDrizzle ??
  new SQLocalDrizzle({
    databasePath: import.meta.env.VITE_LOCAL_DATABASE_PATH,
    onInit: () => [],
  });

if (import.meta.hot) {
  // store the sqlocal drizzle instance to the HMR data for next hot reload
  import.meta.hot.data.sqlocalDrizzle = sqlocalDrizzle;

  // destroy the sqlocal drizzle instance before full reload to avoid remaining worker connections
  import.meta.hot.on("vite:beforeFullReload", () => {
    void sqlocalDrizzle.destroy().catch(error => {
      console.warn(
        "Failed to destroy local SQL worker before full reload.",
        error
      );
    });
  });

  // place the sqlocal drizzle instance for the next hot reload
  import.meta.hot.dispose((data: { sqlocalDrizzle?: SQLocalDrizzle }) => {
    data.sqlocalDrizzle = sqlocalDrizzle;
  });
}

const { driver: sqlocalDriver, batchDriver: sqlocalBatchDriver } =
  sqlocalDrizzle;
const rawDriver: typeof sqlocalDriver = async (...args) => {
  if (!isLocalPreferenceEnabled("localVault")) {
    return { rows: [], columns: [] };
  }
  return await sqlocalDriver(...args);
};
const rawBatchDriver: typeof sqlocalBatchDriver = async (...args) => {
  if (!isLocalPreferenceEnabled("localVault")) {
    return args[0].map(() => ({ rows: [], columns: [] }));
  }
  return await sqlocalBatchDriver(...args);
};
let _SQLOperationChain: Promise<void> = Promise.resolve(); // the chain that make sure the sql operations are executed in sequences
let _SQLOperationSequence = 0;
let markLocalDBNotReady = () => {};

// run with OPFS error handling
const recoverableRun = async <T>(operation: () => Promise<T>) => {
  try {
    return await operation();
  } catch (error) {
    if (!isOPFSMissingFileError(error)) throw error;
    markLocalDBNotReady();

    console.warn(
      "OPFS local database issue detected. Trying a non-destructive retry before rebuilding database file.",
      error
    );

    try {
      await new Promise(resolve => setTimeout(resolve, 100));
      return await operation();
    } catch (retryError) {
      if (!isOPFSMissingFileError(retryError)) throw retryError;
      markLocalDBNotReady();

      console.warn(
        "OPFS retry still failed. Rebuilding local database file and retrying once.",
        retryError
      );

      await recoverOPFSError(sqlocalDrizzle);
      return await operation();
    }
  }
};

// use this function to make sure the sql operations are execute in sequences,
// so that no miss order issues or multiple sql executing at the same interval
const runOperations = async <T>(operation: () => Promise<T>): Promise<T> => {
  const execute = async () => {
    const result = await recoverableRun(operation);
    return result;
  };

  const task = _SQLOperationChain.then(execute, execute);
  _SQLOperationChain = task.then(
    () => undefined,
    () => undefined
  );
  return task;
};

// create drizzle database instance with the driver and batch driver from sqlocal drizzle instance
const drizzleDB = drizzle(rawDriver, rawBatchDriver, { schema });
export const localDB = drizzleDB as LocalDB; // export the database instance as `localDB`

const rawTransaction = drizzleDB.transaction.bind(drizzleDB);
const rawRun = drizzleDB.run.bind(drizzleDB);
const rawAll = drizzleDB.all.bind(drizzleDB);
const rawGet = drizzleDB.get.bind(drizzleDB);
const rawValues = drizzleDB.values.bind(drizzleDB);
const wrappedRun = (async (...args: Parameters<typeof rawRun>) =>
  await runOperations(async () => await rawRun(...args))) as typeof rawRun;
const wrappedAll = (async (...args: Parameters<typeof rawAll>) =>
  await runOperations(async () => await rawAll(...args))) as typeof rawAll;
const wrappedGet = (async (...args: Parameters<typeof rawGet>) =>
  await runOperations(async () => await rawGet(...args))) as typeof rawGet;
const wrappedValues = (async (...args: Parameters<typeof rawValues>) =>
  await runOperations(
    async () => await rawValues(...args)
  )) as typeof rawValues;
const wrappedTransaction = (async (
  ...args: Parameters<typeof rawTransaction>
) =>
  !isLocalPreferenceEnabled("localVault") ||
  (!isLocalPreferenceEnabled("offlineQueue") &&
    typeof navigator !== "undefined" &&
    navigator.onLine === false)
    ? (undefined as never)
    : await runOperations(
        async () => await rawTransaction(...args)
      )) as typeof rawTransaction;

const localDBMigrator = new LocalDBMigrator({
  run: async query => await wrappedRun(query),
  all: async query => await wrappedAll(query),
});

let isMigrated = false;
let isReady = false;

// automatically reset the isReady signal to false every 60 seconds
const LOCAL_DB_READY_REVALIDATE_MS = 60_000;
const isLocalDBReadyInvalidationInterval = setInterval(() => {
  isReady = false;
}, LOCAL_DB_READY_REVALIDATE_MS);
markLocalDBNotReady = () => {
  isReady = false;
};

if (import.meta.hot) {
  import.meta.hot.dispose(() => {
    clearInterval(isLocalDBReadyInvalidationInterval);
  });
}

type LocalDB = typeof drizzleDB & {
  transaction: typeof rawTransaction;
  run: typeof rawRun;
  all: typeof rawAll;
  get: typeof rawGet;
  values: typeof rawValues;
  readonly isMigrated: boolean;
  readonly isEnabled: boolean;
  readonly isReady: boolean;
  getLatestMigrationVersion: () => number;
  ensureMigrated: (
    options?: Parameters<LocalDBMigrator["ensureMigrated"]>[0]
  ) => ReturnType<LocalDBMigrator["ensureMigrated"]>;
  ensureReady: (
    options?: Parameters<LocalDBMigrator["ensureMigrated"]>[0]
  ) => ReturnType<LocalDBMigrator["ensureMigrated"]>;
  getVersion: () => Promise<number>;
  setVersion: (version: number) => Promise<void>;
  download: () => Promise<File>;
};

// get the version from the local database using SQLite PRAGMA user_version,
// return 0 if the database is not migrated yet, the migration version will be the prefix of the largest migration file name + 1
const getVersion = async (): Promise<number> => {
  const result = await wrappedGet<{ user_version?: number }>(
    `PRAGMA user_version`
  );
  return Math.max(0, Math.trunc(Number(result?.user_version ?? 0)));
};

const setVersion = async (version: number): Promise<void> => {
  const safeVersion = Math.max(0, Math.trunc(version));
  await wrappedRun(`PRAGMA user_version = ${safeVersion}`);
  isMigrated = safeVersion === localDBMigrator.getLatestMigrationVersion();
};

const ensureMigrated = async (
  options?: Parameters<LocalDBMigrator["ensureMigrated"]>[0]
): ReturnType<LocalDBMigrator["ensureMigrated"]> => {
  if (!isLocalPreferenceEnabled("localVault")) {
    return { appliedTags: [], finalVersion: 0 };
  }

  const migrationResult = await localDBMigrator.ensureMigrated({
    currentVersion: options?.currentVersion ?? (await getVersion()),
    targetVersion:
      options?.targetVersion ?? localDBMigrator.getLatestMigrationVersion(),
  });
  await setVersion(migrationResult.finalVersion);
  isMigrated =
    migrationResult.finalVersion ===
    localDBMigrator.getLatestMigrationVersion();
  return migrationResult;
};

const ensureReady = async (
  options?: Parameters<LocalDBMigrator["ensureMigrated"]>[0]
): ReturnType<LocalDBMigrator["ensureMigrated"]> => {
  if (!isLocalPreferenceEnabled("localVault")) {
    return { appliedTags: [], finalVersion: 0 };
  }

  const currentVersion = options?.currentVersion ?? (await getVersion());
  const targetVersion =
    options?.targetVersion ?? localDBMigrator.getLatestMigrationVersion();

  const migrationResult = await ensureMigrated({
    currentVersion,
    targetVersion,
  });

  try {
    await wrappedAll(`SELECT 1 FROM "TestTable" LIMIT 1`); // the test table should be always exist for testing
    await wrappedAll(`SELECT 1 FROM "TransactionTable" LIMIT 1`); // the transaction table should be always exist for synchronization
    await wrappedAll(`SELECT 1 FROM "StationTable" LIMIT 1`);
    await wrappedAll(`SELECT 1 FROM "RoutineTable" LIMIT 1`);
    await wrappedAll(`SELECT 1 FROM "RoutineTag" LIMIT 1`);
    await wrappedAll(`SELECT 1 FROM "ItemTable" LIMIT 1`);
    await wrappedAll(`SELECT 1 FROM "UsersToStationsTable" LIMIT 1`);
    await wrappedAll(`SELECT 1 FROM "RoutinesToTags" LIMIT 1`);
    await wrappedAll(`SELECT 1 FROM "RoutinesToItemsTable" LIMIT 1`);
  } catch {
    const fallbackMigrationResult = await ensureMigrated({
      currentVersion: 0,
      targetVersion,
    });
    isReady = true;
    return fallbackMigrationResult;
  }

  isReady = true;
  return migrationResult;
};

const download = async (): Promise<File> => {
  if (CurrentEnvironment !== Environment.Development) {
    throw new Error(
      "local db export is only available in development environment"
    );
  }

  const databaseFile = await sqlocalDrizzle.getDatabaseFile();

  if (typeof window !== "undefined") {
    const url = URL.createObjectURL(databaseFile);
    const link = document.createElement("a");
    link.href = url;
    link.download = databaseFile.name || "database.sqlite3";
    link.click();
    URL.revokeObjectURL(url);
  }

  return databaseFile;
};

localDB.run = wrappedRun;
localDB.all = wrappedAll;
localDB.get = wrappedGet;
localDB.values = wrappedValues;
localDB.transaction = wrappedTransaction;

Object.defineProperties(localDB, {
  isMigrated: {
    get: () => isLocalPreferenceEnabled("localVault") && isMigrated,
    enumerable: true,
  },
  isEnabled: {
    get: () => isLocalPreferenceEnabled("localVault"),
    enumerable: true,
  },
  isReady: {
    get: () => isLocalPreferenceEnabled("localVault") && isReady,
    enumerable: true,
  },
  getLatestMigrationVersion: {
    value: () => localDBMigrator.getLatestMigrationVersion(),
    writable: false,
    enumerable: true,
  },
  ensureMigrated: {
    value: ensureMigrated,
    writable: false,
    enumerable: true,
  },
  ensureReady: {
    value: ensureReady,
    writable: false,
    enumerable: true,
  },
  getVersion: {
    value: getVersion,
    writable: false,
    enumerable: true,
  },
  setVersion: {
    value: setVersion,
    writable: false,
    enumerable: true,
  },
  download: {
    value: download,
    writable: false,
    enumerable: true,
  },
});

// run the getVersion() initially to check and set `isMigrated` and `isReady` to false
// if there's any error which indicate the migration does not happened yet
// or set the `isMigrated` to true to indicate the migration has happened and the database version is up to date
void getVersion()
  .then(version => {
    isMigrated = version === localDBMigrator.getLatestMigrationVersion();
  })
  .catch(() => {
    isMigrated = false;
    isReady = false;
  });
