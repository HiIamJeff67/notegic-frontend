import { LocalYjsDocumentStore } from "@shared/lib/blockpack/localYjsDocumentStore";
import { requiresCrossOriginIsolation } from "@shared/lib/browser/crossOriginIsolation";
import { IndexedDB, IndexedDBKey } from "@shared/lib/storage/indexedDB";
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
import { getOrderedMigrations } from "./migrationCatalog";
import { LocalDBMigrator } from "./migrator";
import {
  classifyLocalDBError,
  createLocalDataExport,
  createLocalDBDiagnosticsExport,
  downloadTextFile,
  isOPFSMissingFileError,
} from "./recovery";
import * as schema from "./schemas";

const isLocalRuntime =
  typeof window !== "undefined" &&
  requiresCrossOriginIsolation(
    window.location.pathname,
    import.meta.env.BASE_URL
  );

const localDBDiagnosticsStorageKey = `notegic-local-db-diagnostics:${String(
  import.meta.env.VITE_LOCAL_DATABASE_PATH ?? "default"
)}`;
const localDBDiagnosticsStorage = (() => {
  if (!isLocalRuntime) return null;
  try {
    return window.localStorage;
  } catch {
    return null;
  }
})();
const localDBDiagnostics = createLocalDBDiagnostics(
  localDBDiagnosticsStorage,
  localDBDiagnosticsStorageKey,
  isLocalRuntime ? "worker-connection-pending" : "disabled"
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
  if (!isLocalRuntime || !navigator.locks) {
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
if (isLocalRuntime) {
  sqlocalConnectionReady =
    hotReloadable?.sqlocalConnectionReady ??
    new Promise<void>((resolve, reject) => {
      resolveSQLocalConnectionReady = resolve;
      rejectSQLocalConnectionReady = reject;
    });
}
const hasReusableHotReloadState =
  hotReloadable?.sqlocalDrizzle && hotReloadable.sqlocalConnectionReady;
const sqlocalWorker = isLocalRuntime
  ? (hotReloadable?.sqlocalWorker ??
    new Worker(new URL("./sqlocal.worker.ts", import.meta.url), {
      type: "module",
    }))
  : undefined;

if (isLocalRuntime && sqlocalWorker && !hotReloadable?.sqlocalWorker) {
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
const sqlocalDrizzle = isLocalRuntime
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
  isLocalRuntime && "BroadcastChannel" in window
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
// Queue at the driver boundary so builders, prepared and relational queries,
// raw SQL and batches all share the same connection isolation boundary.
const drizzleDB = drizzle(
  (...args) => runOperations(() => rawDriver(...args)),
  (...args) => runOperations(() => rawBatchDriver(...args)),
  { schema }
);
export const localDB = drizzleDB as LocalDB; // export the database instance as `localDB`

const rawTransaction = drizzleDB.transaction.bind(drizzleDB);
const rawRun = drizzleDB.run.bind(drizzleDB);
const rawAll = drizzleDB.all.bind(drizzleDB);
const rawGet = drizzleDB.get.bind(drizzleDB);
const rawValues = drizzleDB.values.bind(drizzleDB);
const wrappedRun = rawRun;
const wrappedAll = rawAll;
const wrappedGet = rawGet;
const wrappedValues = rawValues;
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
      : await runOperations(async () => {
          // Only this session's queries bypass the outer queue. Using the
          // exported DB inside the callback is not part of this transaction:
          // use the supplied tx (including for nested savepoints).
          let active = true;
          const transactionDB = drizzle(
            (...query) => {
              if (!active) throw new Error("local transaction has ended");
              return rawDriver(...query);
            },
            (...queries) => {
              if (!active) throw new Error("local transaction has ended");
              return rawBatchDriver(...queries);
            },
            { schema }
          );
          try {
            return await transactionDB.transaction(...args);
          } finally {
            active = false;
          }
        }, "nonRecoverable")) as typeof rawTransaction;

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
const isLocalDBReadyInvalidationInterval = isLocalRuntime
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
    diagnosticsExported: boolean;
    localDataExported: boolean;
    discardLocalData: boolean;
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
  if (!isLocalRuntime || !isLocalPreferenceEnabled("localVault")) {
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
    // Opening OPFS shares the migration lock; connect before acquiring it.
    await sqlocalConnectionReady;
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
  if (!isLocalRuntime || !isLocalPreferenceEnabled("localVault")) {
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
  if (!isLocalRuntime || !sqlocalDrizzle) {
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
  if (!isLocalRuntime || !sqlocalDrizzle) {
    throw new Error("local data export is unavailable on the server.");
  }

  const databaseFile = await sqlocalDrizzle.getDatabaseFile();
  const exportContents = await createLocalDataExport(
    databaseFile,
    await IndexedDB.getAllItems()
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
    return result;
  }

  try {
    await sqlocalConnectionReady;
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
      ? await IndexedDB.getItemByKey(
          IndexedDBKey.blockPackYjsDocuments,
          loggedInUser.publicId
        )
      : null;
    const pendingYjsCount =
      yjsCache?.contents.filter(content => content.needsFlush).length ?? 0;

    localDBDiagnostics.transition(localDBDiagnostics.getState().phase, {
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
    return result;
  } catch (error) {
    const classification = classifyLocalDBError(
      error,
      "checking-rebuildability"
    );
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
  diagnosticsExported: boolean;
  localDataExported: boolean;
  discardLocalData: boolean;
}): Promise<void> => {
  if (
    !options.diagnosticsExported ||
    !options.localDataExported ||
    !options.discardLocalData
  ) {
    throw new Error(
      "Export diagnostics and local data, then confirm discarding local data before rebuild."
    );
  }

  if (!isLocalRuntime || !navigator.locks) {
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
      let deletionStarted = false;
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

        if (!sqlocalDrizzle) throw new Error("local database is unavailable");

        localDBDiagnostics.transition("clearing-local-storage", {
          result: "safe-to-rebuild",
          recoverability: "safe-to-rebuild",
        });
        localDBDiagnostics.transition("rebuild-in-progress", {
          result: "safe-to-rebuild",
          recoverability: "safe-to-rebuild",
          rebuildAttemptedAt: Date.now(),
        });
        deletionStarted = true;
        sqlocalLifecycle = "closing";
        // SQLocal must still have a live worker to delete and reopen the file.
        await sqlocalDrizzle.deleteDatabaseFile();
        if (!(await IndexedDB.clearAllItems())) {
          throw new Error(
            "Failed to clear local document and attachment caches."
          );
        }
        await sqlocalDrizzle.destroy();
        sqlocalLifecycle = "closed";
        localDBDiagnostics.transition("bootstrapping", {
          result: "success",
          recoverability: "success",
          currentVersion: 0,
          targetVersion: localDBMigrator.getLatestMigrationVersion(),
          rebuildAttemptedAt: Date.now(),
          error: null,
          errorCode: null,
          errorMessage: null,
        });
        window.location.reload();
      } catch (error) {
        if (!deletionStarted) setLocalDBReadOnly(wasReadOnly);
        localDBDiagnostics.transition("manual-recovery", {
          result: "manual-recovery",
          recoverability: "manual-recovery",
          errorCode: "LOCAL_DB_REBUILD_FAILED",
          errorMessage: getLocalDBErrorMessage(error),
          error: getLocalDBErrorMessage(error),
        });
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
    get: () =>
      isLocalRuntime && isLocalPreferenceEnabled("localVault") && isMigrated,
    enumerable: true,
  },
  isEnabled: {
    get: () => isLocalRuntime && isLocalPreferenceEnabled("localVault"),
    enumerable: true,
  },
  isReady: {
    get: () =>
      isLocalRuntime && isLocalPreferenceEnabled("localVault") && isReady,
    enumerable: true,
  },
  migrationError: {
    get: () =>
      isLocalRuntime && isLocalPreferenceEnabled("localVault")
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
