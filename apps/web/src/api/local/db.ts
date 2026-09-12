import { LocalYjsDocumentStore } from "@shared/blockpack/localYjsDocumentStore";
import { IndexedDBManipulator } from "@shared/lib/indexedDBManipulator";
import { IndexedDBKey } from "@shared/types/indexedDB.type";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/sqlite-proxy";
import { SQLocalDrizzle } from "sqlocal/drizzle";
import { isLocalPreferenceEnabled } from "@/api/local/policy";
import currentLocalSchemaSql from "./bootstrap.sql?raw";
import {
  createLocalDBDiagnostics,
  isLocalDBWorkerDiagnosticMessage,
  type LocalDBDiagnostics,
} from "./diagnostics";
import { getOrderedMigrations } from "./migration-catalog";
import { LocalDBMigrator } from "./migrator";
import {
  classifyLocalDBError,
  createLocalDBDiagnosticsExport,
  downloadTextFile,
  isOPFSMissingFileError,
} from "./recovery";
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
let localDBReadOnly = false;
const isLocalDBReadOnly = (): boolean => localDBReadOnly;
const setLocalDBReadOnly = (value: boolean): void => {
  localDBReadOnly = value;
  LocalYjsDocumentStore.setReadOnly(value);
};
const wasRebuildInterrupted =
  localDBDiagnostics.getState().previousPhase === "rebuild-in-progress";

const getLocalDBErrorMessage = (error: unknown): string =>
  error instanceof Error ? error.message : String(error);

const runWithMigrationLock = async <T>(
  operation: () => Promise<T>
): Promise<T> => {
  localDBDiagnostics.transition("migration-lock-pending");
  if (!isClient || !navigator.locks) {
    localDBDiagnostics.transition("migration-lock-acquired");
    return await operation();
  }
  return await navigator.locks.request(
    "notegic-local-database-migration",
    { mode: "exclusive" },
    async () => {
      localDBDiagnostics.transition("migration-lock-acquired");
      return await operation();
    }
  );
};

// extract hot reloadable data with the sqlocal drizzle instance
const hotReloadable = import.meta.hot?.data as
  | {
      sqlocalDrizzle?: SQLocalDrizzle;
      sqlocalConnectionReady?: Promise<void>;
      sqlocalWorker?: Worker;
      sqlocalOperationChain?: Promise<void>;
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
  const classification = classifyLocalDBError(connectionError, "worker");
  localDBDiagnostics.transition("failed", {
    result: classification.result,
    recoverability: classification.result,
    errorCode: classification.errorCode,
    errorMessage: connectionError.message,
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
  localDBDiagnostics.transition("worker-connected", {
    result: "success",
    recoverability: "success",
    errorCode: null,
    errorMessage: null,
    error: null,
  });
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

let _SQLOperationChain: Promise<void> =
  hotReloadable?.sqlocalOperationChain ?? Promise.resolve();
let sqlocalLifecycle: "open" | "closing" | "closed" = "open";
let sqlocalTeardownPromise: Promise<void> | null = null;
const localDBRecoveryChannel =
  isClient && "BroadcastChannel" in window
    ? new BroadcastChannel("notegic-local-db-recovery")
    : null;

localDBRecoveryChannel?.addEventListener("message", event => {
  if (event.data?.type !== "local-db-rebuild-started") return;
  setLocalDBReadOnly(true);
  localDBDiagnostics.transition("manual-recovery", {
    result: "manual-recovery",
    recoverability: "manual-recovery",
    errorCode: "LOCAL_DB_REBUILD_IN_ANOTHER_TAB",
    errorMessage:
      "Another browser tab is rebuilding the local database. Reconnect after it finishes.",
    error:
      "Another browser tab is rebuilding the local database. Reconnect after it finishes.",
  });
});

if (import.meta.hot && sqlocalDrizzle) {
  // store the sqlocal drizzle instance to the HMR data for next hot reload
  import.meta.hot.data.sqlocalDrizzle = sqlocalDrizzle;
  import.meta.hot.data.sqlocalConnectionReady = sqlocalConnectionReady;
  import.meta.hot.data.sqlocalWorker = sqlocalWorker;
  import.meta.hot.data.sqlocalOperationChain = _SQLOperationChain;

  const teardownSQLocal = (): Promise<void> => {
    if (!sqlocalDrizzle || sqlocalTeardownPromise) {
      return sqlocalTeardownPromise ?? Promise.resolve();
    }

    sqlocalLifecycle = "closing";
    sqlocalTeardownPromise = sqlocalConnectionReady
      .catch(() => undefined)
      .then(() => _SQLOperationChain)
      .then(() => sqlocalDrizzle.destroy())
      .then(() => {
        sqlocalLifecycle = "closed";
      });
    return sqlocalTeardownPromise;
  };

  // destroy the sqlocal drizzle instance before full reload to avoid remaining worker connections
  import.meta.hot.on("vite:beforeFullReload", async () => {
    try {
      await teardownSQLocal();
    } catch (error) {
      console.warn(
        "Failed to destroy local SQL worker before full reload.",
        error
      );
    }
  });

  // place the sqlocal drizzle instance for the next hot reload
  import.meta.hot.dispose(
    (data: {
      sqlocalDrizzle?: SQLocalDrizzle;
      sqlocalConnectionReady?: Promise<void>;
      sqlocalWorker?: Worker;
      sqlocalOperationChain?: Promise<void>;
    }) => {
      data.sqlocalDrizzle = sqlocalDrizzle;
      data.sqlocalConnectionReady = sqlocalConnectionReady;
      data.sqlocalWorker = sqlocalWorker;
      data.sqlocalOperationChain = _SQLOperationChain;
    }
  );
}

const rawDriver: SQLocalDrizzle["driver"] = async (...args) => {
  if (!sqlocalDrizzle || !isLocalPreferenceEnabled("localVault")) {
    return { rows: [], columns: [] };
  }
  if (
    isLocalDBReadOnly() &&
    (args[2] === "run" ||
      /^(insert|update|delete|replace|create|alter|drop)\b/i.test(
        args[0].trim()
      ))
  ) {
    throw new Error("local database is in read-only recovery mode");
  }
  await sqlocalConnectionReady;
  return await sqlocalDrizzle.driver(...args);
};
const rawBatchDriver: SQLocalDrizzle["batchDriver"] = async (...args) => {
  if (!sqlocalDrizzle || !isLocalPreferenceEnabled("localVault")) {
    return args[0].map(() => ({ rows: [], columns: [] }));
  }
  if (
    isLocalDBReadOnly() &&
    args[0].some(
      query =>
        query.method === "run" ||
        /^(insert|update|delete|replace|create|alter|drop)\b/i.test(
          query.sql.trim()
        )
    )
  ) {
    throw new Error("local database is in read-only recovery mode");
  }
  await sqlocalConnectionReady;
  return await sqlocalDrizzle.batchDriver(...args);
};
let _SQLOperationSequence = 0;
let activeOperationCount = 0;
let markLocalDBNotReady = () => {};
type OperationRecoveryMode = "recoverable" | "nonRecoverable";

// run with OPFS error handling
const recoverableRun = async <T>(operation: () => Promise<T>) => {
  try {
    return await operation();
  } catch (error) {
    if (
      !isOPFSMissingFileError(error, import.meta.env.VITE_LOCAL_DATABASE_PATH)
    ) {
      throw error;
    }
    markLocalDBNotReady();

    console.warn(
      "OPFS local database issue detected. Trying a non-destructive retry before rebuilding database file.",
      error
    );

    try {
      await new Promise(resolve => setTimeout(resolve, 100));
      return await operation();
    } catch (retryError) {
      if (
        !isOPFSMissingFileError(
          retryError,
          import.meta.env.VITE_LOCAL_DATABASE_PATH
        )
      ) {
        throw retryError;
      }
      markLocalDBNotReady();

      console.warn(
        "OPFS retry still failed. Preserving the local database and surfacing the recoverable error.",
        retryError
      );
      throw retryError;
    }
  }
};

// use this function to make sure the sql operations are execute in sequences,
// so that no miss order issues or multiple sql executing at the same interval
const runOperations = async <T>(
  operation: () => Promise<T>,
  recoveryMode: OperationRecoveryMode = "recoverable"
): Promise<T> => {
  if (sqlocalLifecycle !== "open") {
    throw new Error("local SQL worker is closing or closed");
  }

  const execute = async () => {
    const result =
      recoveryMode === "recoverable"
        ? await recoverableRun(operation)
        : await operation();
    return result;
  };

  const task = _SQLOperationChain.then(execute, execute);
  activeOperationCount += 1;
  localDBDiagnostics.transition(localDBDiagnostics.getState().phase, {
    activeOperationCount,
  });
  _SQLOperationChain = task.then(
    () => {
      activeOperationCount = Math.max(0, activeOperationCount - 1);
      localDBDiagnostics.transition(localDBDiagnostics.getState().phase, {
        activeOperationCount,
      });
      return undefined;
    },
    () => {
      activeOperationCount = Math.max(0, activeOperationCount - 1);
      localDBDiagnostics.transition(localDBDiagnostics.getState().phase, {
        activeOperationCount,
      });
      return undefined;
    }
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
  !isLocalPreferenceEnabled("localVault") || isLocalDBReadOnly()
    ? (() => {
        throw new Error("local database is in read-only recovery mode");
      })()
    : !isLocalPreferenceEnabled("offlineQueue") &&
        typeof navigator !== "undefined" &&
        navigator.onLine === false
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
  subscribeToDiagnostics: (listener: () => void) => () => void;
  transitionDiagnostics: (
    phase: LocalDBDiagnostics["phase"],
    details?: Partial<LocalDBDiagnostics>
  ) => LocalDBDiagnostics;
  getLatestMigrationVersion: () => number;
  ensureMigrated: (
    options?: Parameters<LocalDBMigrator["ensureMigrated"]>[0]
  ) => ReturnType<LocalDBMigrator["ensureMigrated"]>;
  ensureReady: (
    options?: Parameters<LocalDBMigrator["ensureMigrated"]>[0]
  ) => ReturnType<LocalDBMigrator["ensureMigrated"]>;
  getVersion: () => Promise<number>;
  download: () => Promise<File>;
  downloadLocalData: () => Promise<void>;
  downloadDiagnostics: () => void;
  readonly isReadOnly: boolean;
  setReadOnly: (value: boolean) => void;
  getRebuildPreflight: (options?: {
    remoteDataValidated?: boolean;
  }) => Promise<LocalDBRebuildPreflight>;
  rebuild: (options: {
    localDataExported: boolean;
    remoteDataValidated: boolean;
  }) => Promise<void>;
};

export type LocalDBRebuildPreflight = {
  result: "safe-to-rebuild" | "needs-action" | "manual-recovery";
  canRebuild: boolean;
  pendingCount: number;
  terminalFailureCount: number;
  activeOperationCount: number;
  pendingYjsCount: number;
  reason: string | null;
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

  if (wasRebuildInterrupted) {
    const error = new Error(
      "The previous local database rebuild did not finish; manual recovery is required."
    );
    localDBDiagnostics.transition("manual-recovery", {
      result: "manual-recovery",
      recoverability: "manual-recovery",
      errorCode: "LOCAL_DB_REBUILD_INTERRUPTED",
      errorMessage: error.message,
      error: error.message,
    });
    throw error;
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
      result: "success",
      recoverability: "success",
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
    const classification = classifyLocalDBError(
      error,
      localDBDiagnostics.getState().phase
    );
    localDBDiagnostics.transition(
      classification.result === "needs-action"
        ? "needs-action"
        : classification.result === "manual-recovery"
          ? "manual-recovery"
          : "failed",
      {
        result: classification.result,
        recoverability: classification.result,
        errorCode: classification.errorCode,
        errorMessage: classification.errorMessage,
        error: getLocalDBErrorMessage(error),
      }
    );
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
      result: "success",
      recoverability: "success",
      currentVersion: migrationResult.finalVersion,
      targetVersion,
      error: null,
    });
    return migrationResult;
  } catch (error) {
    isReady = false;
    const classification = classifyLocalDBError(
      error,
      localDBDiagnostics.getState().phase
    );
    localDBDiagnostics.transition(
      classification.result === "needs-action"
        ? "needs-action"
        : classification.result === "manual-recovery"
          ? "manual-recovery"
          : "failed",
      {
        result: classification.result,
        recoverability: classification.result,
        errorCode: classification.errorCode,
        errorMessage: classification.errorMessage,
        targetVersion,
        error: getLocalDBErrorMessage(error),
      }
    );
    throw error;
  }
};

const download = async (): Promise<File> => {
  if (!isClient || !sqlocalDrizzle) {
    throw new Error("local database export is unavailable on the server.");
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

const downloadLocalData = async (): Promise<void> => {
  if (!isClient || !sqlocalDrizzle) {
    throw new Error("local data export is unavailable on the server.");
  }

  const databaseFile = await sqlocalDrizzle.getDatabaseFile();
  const databaseBytes = new Uint8Array(await databaseFile.arrayBuffer());
  let binary = "";
  for (let index = 0; index < databaseBytes.length; index += 0x8000) {
    binary += String.fromCharCode(
      ...databaseBytes.subarray(index, index + 0x8000)
    );
  }

  const exportContents = JSON.stringify(
    {
      exportedAt: new Date().toISOString(),
      warning:
        "This export may contain notes, personal workspace data, and local synchronization metadata.",
      database: {
        name: databaseFile.name,
        contentType: databaseFile.type,
        base64: btoa(binary),
      },
      indexedDB: await IndexedDBManipulator.getAllItems(),
    },
    null,
    2
  );
  downloadTextFile(
    exportContents,
    `notegic-local-data-${new Date().toISOString()}.json`
  );
};

const downloadDiagnostics = (): void => {
  downloadTextFile(
    createLocalDBDiagnosticsExport(localDBDiagnostics.getState()),
    `notegic-local-db-diagnostics-${new Date().toISOString()}.json`
  );
};

const getRebuildPreflight = async (options?: {
  remoteDataValidated?: boolean;
}): Promise<LocalDBRebuildPreflight> => {
  localDBDiagnostics.transition("checking-rebuildability", {
    result: "manual-recovery",
    recoverability: "manual-recovery",
    error: null,
    errorCode: null,
    errorMessage: null,
  });

  if (!sqlocalDrizzle) {
    const result: LocalDBRebuildPreflight = {
      result: "manual-recovery",
      canRebuild: false,
      pendingCount: 0,
      terminalFailureCount: 0,
      activeOperationCount,
      pendingYjsCount: 0,
      reason:
        "The local database is not ready, so its contents cannot be classified safely.",
    };
    localDBDiagnostics.transition("manual-recovery", {
      result: result.result,
      recoverability: result.result,
      pendingCount: result.pendingCount,
      terminalFailureCount: result.terminalFailureCount,
      activeOperationCount: result.activeOperationCount,
      errorMessage: result.reason,
      error: result.reason,
    });
    return result;
  }

  try {
    await sqlocalConnectionReady;
    localDBDiagnostics.transition("checking-transaction-queue");
    const loggedInUser = (
      await drizzleDB
        .select({ publicId: schema.User.publicId })
        .from(schema.User)
        .where(eq(schema.User.isLoggedIn, true))
        .limit(1)
    )[0];
    const transactions = loggedInUser
      ? await drizzleDB
          .select({ retryCount: schema.Transaction.retryCount })
          .from(schema.Transaction)
          .where(eq(schema.Transaction.ownerPublicId, loggedInUser.publicId))
      : [];
    const pendingCount = transactions.filter(
      transaction => transaction.retryCount < 5
    ).length;
    const terminalFailureCount = transactions.length - pendingCount;
    const yjsCache = loggedInUser
      ? await IndexedDBManipulator.getItemByKey(
          IndexedDBKey.blockPackYjsDocuments,
          loggedInUser.publicId
        )
      : null;
    const pendingYjsCount =
      yjsCache?.contents.filter(content => content.needsFlush).length ?? 0;

    localDBDiagnostics.transition("waiting-for-local-operations", {
      pendingCount,
      terminalFailureCount,
      activeOperationCount,
    });

    const reason =
      activeOperationCount > 0
        ? "Local database operations are still active; wait for them to finish before rebuilding."
        : pendingCount > 0
          ? "Pending local transactions must be synchronized or reviewed before rebuild."
          : terminalFailureCount > 0
            ? "Failed local transactions must be reviewed before rebuild."
            : pendingYjsCount > 0
              ? "Unsynced Yjs updates must be flushed before rebuild."
              : options?.remoteDataValidated !== true
                ? "The complete remote rebuild source has not been validated."
                : null;
    const result: LocalDBRebuildPreflight = {
      result: reason
        ? activeOperationCount > 0
          ? "manual-recovery"
          : "needs-action"
        : "safe-to-rebuild",
      canRebuild: reason === null,
      pendingCount,
      terminalFailureCount,
      activeOperationCount,
      pendingYjsCount,
      reason,
    };
    localDBDiagnostics.transition(
      reason
        ? result.result === "manual-recovery"
          ? "manual-recovery"
          : "needs-action"
        : "checking-rebuildability",
      {
        result: result.result,
        recoverability: result.result,
        pendingCount,
        terminalFailureCount,
        activeOperationCount,
        errorMessage: reason,
        error: reason,
      }
    );
    return result;
  } catch (error) {
    const classification = classifyLocalDBError(
      error,
      "checking-rebuildability"
    );
    localDBDiagnostics.transition("manual-recovery", {
      result: "manual-recovery",
      recoverability: "manual-recovery",
      errorCode: classification.errorCode,
      errorMessage: classification.errorMessage,
      error: classification.errorMessage,
    });
    return {
      result: "manual-recovery",
      canRebuild: false,
      pendingCount: 0,
      terminalFailureCount: 0,
      activeOperationCount,
      pendingYjsCount: 0,
      reason: classification.errorMessage,
    };
  }
};

const rebuild = async (options: {
  localDataExported: boolean;
  remoteDataValidated: boolean;
}): Promise<void> => {
  if (!options.localDataExported || !options.remoteDataValidated) {
    throw new Error(
      "Local data export and remote source validation are required before rebuild."
    );
  }

  if (!isClient || !navigator.locks) {
    const errorMessage =
      "The browser cannot guarantee that another tab is not using the local database.";
    localDBDiagnostics.transition("manual-recovery", {
      result: "manual-recovery",
      recoverability: "manual-recovery",
      errorCode: "LOCAL_DB_REBUILD_LOCK_UNSUPPORTED",
      errorMessage,
      error: errorMessage,
    });
    throw new Error(errorMessage);
  }

  await navigator.locks.request(
    "notegic-local-database-rebuild",
    { mode: "exclusive", ifAvailable: true },
    async lock => {
      if (!lock) {
        const errorMessage =
          "Another browser tab is using the local database. Close it and retry.";
        localDBDiagnostics.transition("manual-recovery", {
          result: "manual-recovery",
          recoverability: "manual-recovery",
          errorCode: "LOCAL_DB_REBUILD_LOCK_UNAVAILABLE",
          errorMessage,
          error: errorMessage,
        });
        throw new Error(errorMessage);
      }

      const wasReadOnly = isLocalDBReadOnly();
      try {
        setLocalDBReadOnly(true);
        localDBDiagnostics.transition("freezing-local-writes", {
          result: "safe-to-rebuild",
          recoverability: "safe-to-rebuild",
          error: null,
        });
        localDBRecoveryChannel?.postMessage({
          type: "local-db-rebuild-started",
        });
        await _SQLOperationChain;

        const preflight = await getRebuildPreflight({
          remoteDataValidated: options.remoteDataValidated,
        });
        if (!preflight.canRebuild) {
          throw new Error(
            preflight.reason ?? "Local data cannot be rebuilt safely."
          );
        }
        if (!sqlocalDrizzle) throw new Error("local database is unavailable");

        localDBDiagnostics.transition("clearing-local-storage", {
          result: "safe-to-rebuild",
          recoverability: "safe-to-rebuild",
        });
        localDBDiagnostics.transition("rebuild-in-progress", {
          result: "safe-to-rebuild",
          recoverability: "safe-to-rebuild",
        });
        await sqlocalDrizzle.destroy();
        await sqlocalDrizzle.deleteDatabaseFile();
        await Promise.all([
          IndexedDBManipulator.removeItem(IndexedDBKey.backgroundImages),
          IndexedDBManipulator.removeItem(
            IndexedDBKey.backgroundImageThumbnails
          ),
          IndexedDBManipulator.removeItem(IndexedDBKey.currentBackgroundImage),
        ]);
        localDBDiagnostics.transition("bootstrapping", {
          result: "success",
          recoverability: "success",
          currentVersion: 0,
          targetVersion: localDBMigrator.getLatestMigrationVersion(),
        });
        window.location.reload();
      } catch (error) {
        if (localDBDiagnostics.getState().phase !== "rebuild-in-progress") {
          setLocalDBReadOnly(wasReadOnly);
        }
        throw error;
      }
    }
  );
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
  subscribeToDiagnostics: {
    value: localDBDiagnostics.subscribe,
    writable: false,
    enumerable: true,
  },
  transitionDiagnostics: {
    value: localDBDiagnostics.transition,
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
  downloadLocalData: {
    value: downloadLocalData,
    writable: false,
    enumerable: true,
  },
  downloadDiagnostics: {
    value: downloadDiagnostics,
    writable: false,
    enumerable: true,
  },
  isReadOnly: {
    get: isLocalDBReadOnly,
    enumerable: true,
  },
  setReadOnly: {
    value: (value: boolean) => {
      setLocalDBReadOnly(value);
    },
    writable: false,
    enumerable: true,
  },
  getRebuildPreflight: {
    value: getRebuildPreflight,
    writable: false,
    enumerable: true,
  },
  rebuild: {
    value: rebuild,
    writable: false,
    enumerable: true,
  },
});
