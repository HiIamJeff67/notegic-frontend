import { CurrentEnvironment } from "@shared/constants/project";
import { Environment } from "@shared/types/environment.type";
import { drizzle } from "drizzle-orm/sqlite-proxy";
import { SQLocalDrizzle } from "sqlocal/drizzle";
import { isLocalPreferenceEnabled } from "@/api/local/policy";
import currentLocalSchemaSql from "./bootstrap.sql?raw";
import {
  createLocalDBDiagnostics,
  isLocalDBWorkerDiagnosticMessage,
  type LocalDBDiagnostics,
} from "./local-database-diagnostics";
import { getOrderedMigrations } from "./migration-catalog";
import { LocalDBMigrator } from "./migrator";
import { isOPFSMissingFileError, recoverOPFSError } from "./recover";
import * as schema from "./schemas";

const isClient = typeof window !== "undefined";

const localDBDiagnosticsStorageKey = `notegic-local-db-diagnostics:${String(
  import.meta.env.VITE_LOCAL_DATABASE_PATH ?? "default"
)}`;
const localDBDiagnosticsStorage = (() => {
  if (!isClient) return null;
  try {
    return window.localStorage;
  } catch {
    return null;
  }
})();
const localDBDiagnostics = createLocalDBDiagnostics(
  localDBDiagnosticsStorage,
  localDBDiagnosticsStorageKey,
  isClient ? "worker-connection-pending" : "disabled"
);

const getLocalDBErrorMessage = (error: unknown): string =>
  error instanceof Error ? error.message : String(error);

const runWithMigrationLock = async <T>(
  operation: () => Promise<T>
): Promise<T> => {
  if (!isClient || !navigator.locks) return await operation();
  return await navigator.locks.request(
    "notegic-local-database-migration",
    { mode: "exclusive" },
    operation
  );
};

// extract hot reloadable data with the sqlocal drizzle instance
const hotReloadable = import.meta.hot?.data as
  | {
      sqlocalDrizzle?: SQLocalDrizzle;
      sqlocalConnectionReady?: Promise<void>;
      sqlocalWorker?: Worker;
    }
  | undefined;
const LOCAL_DB_WORKER_CONNECTION_TIMEOUT_MS = 15_000;
let resolveSQLocalConnectionReady = () => {};
let rejectSQLocalConnectionReady = (_error: unknown) => {};
let sqlocalConnectionReady = Promise.resolve();
let sqlocalConnectionSettled = false;
let sqlocalWorkerConnectionTimeout: number | undefined;
const settleSQLocalConnection = () => {
  if (sqlocalConnectionSettled) return false;
  sqlocalConnectionSettled = true;
  if (sqlocalWorkerConnectionTimeout !== undefined) {
    window.clearTimeout(sqlocalWorkerConnectionTimeout);
  }
  return true;
};
const failSQLocalConnection = (error: unknown) => {
  if (!settleSQLocalConnection()) return;
  const connectionError =
    error instanceof Error
      ? error
      : new Error(`SQLocal worker failed to initialize: ${String(error)}`);
  localDBDiagnostics.transition("failed", {
    error: connectionError.message,
  });
  console.error("SQLocal worker failed to initialize.", connectionError);
  rejectSQLocalConnectionReady(connectionError);
};
const handleSQLocalWorkerMessage = (event: MessageEvent<unknown>) => {
  if (!isLocalDBWorkerDiagnosticMessage(event.data)) return;
  localDBDiagnostics.recordWorkerEvent(event.data.event);
};
const markSQLocalConnectionReady = () => {
  if (!settleSQLocalConnection()) return;
  localDBDiagnostics.transition("worker-connected", { error: null });
  resolveSQLocalConnectionReady();
};
if (isClient) {
  sqlocalConnectionReady =
    hotReloadable?.sqlocalConnectionReady ??
    new Promise<void>((resolve, reject) => {
      resolveSQLocalConnectionReady = resolve;
      rejectSQLocalConnectionReady = reject;
    });
}
const hasReusableHotReloadState =
  hotReloadable?.sqlocalDrizzle && hotReloadable.sqlocalConnectionReady;
const sqlocalWorker = isClient
  ? (hotReloadable?.sqlocalWorker ??
    new Worker(new URL("./sqlocal.worker.ts", import.meta.url), {
      type: "module",
    }))
  : undefined;

if (isClient && sqlocalWorker && !hotReloadable?.sqlocalWorker) {
  sqlocalWorker.addEventListener("message", handleSQLocalWorkerMessage);
  sqlocalWorker.addEventListener("error", event => {
    localDBDiagnostics.recordWorkerEvent({
      stage: "main-worker-error",
      details: {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        error:
          event.error instanceof Error
            ? {
                name: event.error.name,
                message: event.error.message,
                stack: event.error.stack,
              }
            : undefined,
      },
      updatedAt: Date.now(),
    });
    const message =
      "message" in event && typeof event.message === "string"
        ? event.message
        : "unknown worker error";
    failSQLocalConnection(new Error(message));
  });
  sqlocalWorker.addEventListener("messageerror", () => {
    localDBDiagnostics.recordWorkerEvent({
      stage: "main-worker-message-error",
      updatedAt: Date.now(),
    });
    failSQLocalConnection(
      new Error("worker message could not be deserialized")
    );
  });
  sqlocalWorkerConnectionTimeout = window.setTimeout(() => {
    localDBDiagnostics.recordWorkerEvent({
      stage: "main-worker-timeout",
      details: {
        timeoutMs: LOCAL_DB_WORKER_CONNECTION_TIMEOUT_MS,
      },
      updatedAt: Date.now(),
    });
    failSQLocalConnection(
      new Error(
        `SQLocal worker connection timed out after ${LOCAL_DB_WORKER_CONNECTION_TIMEOUT_MS}ms.`
      )
    );
  }, LOCAL_DB_WORKER_CONNECTION_TIMEOUT_MS);
}
// create the sqlocal drizzle using either the data from HMR hot reload whose type is defined on the above
// or the new sqlocal drizzle instance created here
const sqlocalDrizzle = isClient
  ? hasReusableHotReloadState
    ? hotReloadable.sqlocalDrizzle
    : new SQLocalDrizzle({
        databasePath: import.meta.env.VITE_LOCAL_DATABASE_PATH,
        onInit: () => [],
        processor: sqlocalWorker,
        onConnect: () => {
          markSQLocalConnectionReady();
        },
      })
  : undefined;

if (import.meta.hot && sqlocalDrizzle) {
  // store the sqlocal drizzle instance to the HMR data for next hot reload
  import.meta.hot.data.sqlocalDrizzle = sqlocalDrizzle;
  import.meta.hot.data.sqlocalConnectionReady = sqlocalConnectionReady;
  import.meta.hot.data.sqlocalWorker = sqlocalWorker;

  // destroy the sqlocal drizzle instance before full reload to avoid remaining worker connections
  import.meta.hot.on("vite:beforeFullReload", () => {
    void sqlocalConnectionReady
      .then(() => _SQLOperationChain)
      .then(() => sqlocalDrizzle.destroy())
      .catch(error => {
        console.warn(
          "Failed to destroy local SQL worker before full reload.",
          error
        );
      });
  });

  // place the sqlocal drizzle instance for the next hot reload
  import.meta.hot.dispose(
    (data: {
      sqlocalDrizzle?: SQLocalDrizzle;
      sqlocalConnectionReady?: Promise<void>;
      sqlocalWorker?: Worker;
    }) => {
      data.sqlocalDrizzle = sqlocalDrizzle;
      data.sqlocalConnectionReady = sqlocalConnectionReady;
      data.sqlocalWorker = sqlocalWorker;
    }
  );
}

const rawDriver: SQLocalDrizzle["driver"] = async (...args) => {
  if (!sqlocalDrizzle || !isLocalPreferenceEnabled("localVault")) {
    return { rows: [], columns: [] };
  }
  await sqlocalConnectionReady;
  return await sqlocalDrizzle.driver(...args);
};
const rawBatchDriver: SQLocalDrizzle["batchDriver"] = async (...args) => {
  if (!sqlocalDrizzle || !isLocalPreferenceEnabled("localVault")) {
    return args[0].map(() => ({ rows: [], columns: [] }));
  }
  await sqlocalConnectionReady;
  return await sqlocalDrizzle.batchDriver(...args);
};
let _SQLOperationChain: Promise<void> = Promise.resolve(); // the chain that make sure the sql operations are executed in sequences
let _SQLOperationSequence = 0;
let markLocalDBNotReady = () => {};
type OperationRecoveryMode = "recoverable" | "nonRecoverable";

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

      if (!sqlocalDrizzle) throw retryError;
      await recoverOPFSError(sqlocalDrizzle);
      return await operation();
    }
  }
};

// use this function to make sure the sql operations are execute in sequences,
// so that no miss order issues or multiple sql executing at the same interval
const runOperations = async <T>(
  operation: () => Promise<T>,
  recoveryMode: OperationRecoveryMode = "recoverable"
): Promise<T> => {
  const execute = async () => {
    const result =
      recoveryMode === "recoverable"
        ? await recoverableRun(operation)
        : await operation();
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

const localDBMigrator = new LocalDBMigrator(
  {
    transaction: async operation =>
      await runOperations(
        async () =>
          !sqlocalDrizzle
            ? await operation({
                run: async () => {
                  throw new Error("local database is unavailable");
                },
              })
            : await sqlocalConnectionReady.then(() =>
                sqlocalDrizzle.transaction(
                  async transaction =>
                    await operation({
                      run: async query =>
                        await transaction.query({ sql: query, params: [] }),
                    })
                )
              ),
        "nonRecoverable"
      ),
  },
  getOrderedMigrations()
);

let isMigrated = false;
let isReady = false;
let migrationError: unknown = null;

// automatically reset the isReady signal to false every 60 seconds
const LOCAL_DB_READY_REVALIDATE_MS = 60_000;
const isLocalDBReadyInvalidationInterval = isClient
  ? setInterval(() => {
      isReady = false;
    }, LOCAL_DB_READY_REVALIDATE_MS)
  : undefined;
markLocalDBNotReady = () => {
  isReady = false;
};

if (import.meta.hot && isLocalDBReadyInvalidationInterval) {
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
  readonly migrationError: unknown | null;
  getDiagnostics: () => LocalDBDiagnostics;
  getLatestMigrationVersion: () => number;
  ensureMigrated: (
    options?: Parameters<LocalDBMigrator["ensureMigrated"]>[0]
  ) => ReturnType<LocalDBMigrator["ensureMigrated"]>;
  ensureReady: (
    options?: Parameters<LocalDBMigrator["ensureMigrated"]>[0]
  ) => ReturnType<LocalDBMigrator["ensureMigrated"]>;
  getVersion: () => Promise<number>;
  download: () => Promise<File>;
};

// Get the version from the raw SQLite PRAGMA user_version result. Drizzle's
// sqlite-proxy `get` returns the first row as an array for raw SQL.
const getVersion = async (): Promise<number> => {
  const result = await wrappedGet<[number]>(`PRAGMA user_version`);
  const version = result?.[0];
  if (!Number.isInteger(version) || version < 0) {
    throw new Error("Invalid local database user_version result.");
  }
  return version;
};

const verifyMigrationVersion = async (
  migrationResult: Awaited<ReturnType<LocalDBMigrator["ensureMigrated"]>>,
  targetVersion: number
) => {
  const verifiedVersion = await getVersion();
  if (verifiedVersion !== targetVersion) {
    throw new Error(
      `local database migration stopped at version ${verifiedVersion}; expected ${targetVersion}.`
    );
  }
  return { ...migrationResult, finalVersion: verifiedVersion };
};

const ensureMigrated = async (
  options?: Parameters<LocalDBMigrator["ensureMigrated"]>[0]
): ReturnType<LocalDBMigrator["ensureMigrated"]> => {
  if (!isClient || !isLocalPreferenceEnabled("localVault")) {
    localDBDiagnostics.transition("disabled");
    return { appliedTags: [], finalVersion: 0 };
  }

  try {
    const migrationResult = await runWithMigrationLock(async () => {
      const targetVersion =
        options?.targetVersion ?? localDBMigrator.getLatestMigrationVersion();
      localDBDiagnostics.transition("reading-version", {
        currentVersion: null,
        targetVersion,
        error: null,
      });
      const currentVersion = await getVersion();

      if (currentVersion === 0 && targetVersion > 0) {
        if (!sqlocalDrizzle) {
          throw new Error("local database is unavailable for bootstrap");
        }
        localDBDiagnostics.transition("bootstrapping", {
          currentVersion,
          targetVersion,
          error: null,
        });
        const tableCountResult = await wrappedGet<[number]>(
          "SELECT count(*) FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%'"
        );
        const tableCount = tableCountResult?.[0];
        if (!Number.isInteger(tableCount) || tableCount < 0) {
          throw new Error("Invalid local database table count result.");
        }
        if (tableCount > 0) {
          throw new Error(
            "local database contains schema objects but has user_version 0; refusing destructive bootstrap."
          );
        }
        return await verifyMigrationVersion(
          await localDBMigrator.bootstrapCurrentSchema(
            currentLocalSchemaSql,
            targetVersion
          ),
          targetVersion
        );
      }

      localDBDiagnostics.transition(
        currentVersion < targetVersion ? "migrating" : "verifying",
        { currentVersion, targetVersion, error: null }
      );
      return await verifyMigrationVersion(
        await localDBMigrator.ensureMigrated({
          currentVersion,
          targetVersion,
        }),
        targetVersion
      );
    });
    isMigrated =
      migrationResult.finalVersion ===
      localDBMigrator.getLatestMigrationVersion();
    localDBDiagnostics.transition("verifying", {
      currentVersion: migrationResult.finalVersion,
      targetVersion:
        options?.targetVersion ?? localDBMigrator.getLatestMigrationVersion(),
      error: null,
    });
    migrationError = null;
    return migrationResult;
  } catch (error) {
    isMigrated = false;
    isReady = false;
    migrationError = error;
    localDBDiagnostics.transition("failed", {
      error: getLocalDBErrorMessage(error),
    });
    throw error;
  }
};

const ensureReady = async (
  options?: Parameters<LocalDBMigrator["ensureMigrated"]>[0]
): ReturnType<LocalDBMigrator["ensureMigrated"]> => {
  if (!isClient || !isLocalPreferenceEnabled("localVault")) {
    localDBDiagnostics.transition("disabled");
    return { appliedTags: [], finalVersion: 0 };
  }

  const targetVersion =
    options?.targetVersion ?? localDBMigrator.getLatestMigrationVersion();

  try {
    const migrationResult = await ensureMigrated({
      targetVersion,
    });

    if (migrationResult.finalVersion !== targetVersion) {
      throw new Error(
        `local database verification stopped at version ${migrationResult.finalVersion}; expected ${targetVersion}.`
      );
    }

    isReady = true;
    localDBDiagnostics.transition("ready", {
      currentVersion: migrationResult.finalVersion,
      targetVersion,
      error: null,
    });
    return migrationResult;
  } catch (error) {
    isReady = false;
    localDBDiagnostics.transition("failed", {
      targetVersion,
      error: getLocalDBErrorMessage(error),
    });
    throw error;
  }
};

const download = async (): Promise<File> => {
  if (
    !isClient ||
    !sqlocalDrizzle ||
    CurrentEnvironment !== Environment.Development
  ) {
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
    get: () => isClient && isLocalPreferenceEnabled("localVault") && isMigrated,
    enumerable: true,
  },
  isEnabled: {
    get: () => isClient && isLocalPreferenceEnabled("localVault"),
    enumerable: true,
  },
  isReady: {
    get: () => isClient && isLocalPreferenceEnabled("localVault") && isReady,
    enumerable: true,
  },
  migrationError: {
    get: () =>
      isClient && isLocalPreferenceEnabled("localVault")
        ? migrationError
        : null,
    enumerable: true,
  },
  getDiagnostics: {
    value: () => localDBDiagnostics.getState(),
    writable: false,
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
  download: {
    value: download,
    writable: false,
    enumerable: true,
  },
});
