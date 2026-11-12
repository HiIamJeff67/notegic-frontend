import type { LocalDBDiagnostics } from "@/api/local/diagnostics";

const disabledDiagnostics: LocalDBDiagnostics = {
  phase: "disabled",
  previousPhase: null,
  result: "success",
  recoverability: "success",
  currentVersion: null,
  targetVersion: null,
  pendingCount: 0,
  terminalFailureCount: 0,
  activeOperationCount: 0,
  errorCode: null,
  errorMessage: null,
  error: null,
  updatedAt: 0,
  rebuildAttemptedAt: null,
  workerEvents: [],
};

const listeners = new Set<() => void>();

const emptyRows = Promise.resolve([]);

const chain = new Proxy(
  function chain() {
    return chain;
  },
  {
    get(_target, property) {
      if (property === "then") {
        return emptyRows.then.bind(emptyRows);
      }
      return chain;
    },
    apply() {
      return chain;
    },
  }
) as any;

const database = {
  isReadOnly: true,
  isEnabled: false,
  isReady: false,
  isMigrated: false,
  migrationError: null,
  getDiagnostics: () => disabledDiagnostics,
  subscribeToDiagnostics: (listener: () => void) => {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },
  transitionDiagnostics: () => disabledDiagnostics,
  getLatestMigrationVersion: () => 0,
  ensureMigrated: async () => ({ finalVersion: 0 }),
  ensureReady: async () => ({ finalVersion: 0 }),
  run: async () => [],
  all: async () => [],
  get: async () => undefined,
  values: async () => [],
  transaction: async <T>(operation: (tx: unknown) => Promise<T> | T) =>
    operation(chain),
  select: () => chain,
  insert: () => chain,
  update: () => chain,
  delete: () => chain,
  query: chain,
};

export const localDB = database;
