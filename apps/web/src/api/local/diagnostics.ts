export type LocalDBPhase =
  | "disabled"
  | "worker-starting"
  | "worker-connection-pending"
  | "worker-connected"
  | "migration-lock-pending"
  | "migration-lock-acquired"
  | "reading-version"
  | "freezing-local-writes"
  | "waiting-for-local-operations"
  | "checking-transaction-queue"
  | "flushing-yjs"
  | "checking-rebuildability"
  | "exporting-local-data"
  | "clearing-local-storage"
  | "rebuild-in-progress"
  | "bootstrapping"
  | "migrating"
  | "verifying"
  | "verifying-schema"
  | "resynchronizing"
  | "ready"
  | "failed"
  | "needs-action"
  | "manual-recovery";

export type LocalDBResult =
  | "success"
  | "retryable"
  | "needs-action"
  | "safe-to-rebuild"
  | "manual-recovery";

export type LocalDBWorkerDiagnosticStage =
  | "worker-module-evaluated"
  | "worker-config-received"
  | "worker-capabilities"
  | "sqlite-wasm-import-start"
  | "sqlite-wasm-imported"
  | "sqlite-wasm-init-start"
  | "sqlite-wasm-init-complete"
  | "opfs-driver-init-start"
  | "opfs-driver-init-complete"
  | "opfs-driver-init-failed"
  | "nested-worker-constructing"
  | "nested-worker-created"
  | "nested-worker-message"
  | "nested-worker-error"
  | "nested-worker-message-error"
  | "query-start"
  | "query-complete"
  | "query-failed"
  | "worker-connected"
  | "processor-error"
  | "worker-runtime-error"
  | "worker-unhandled-rejection"
  | "main-worker-error"
  | "main-worker-message-error"
  | "main-worker-timeout";

export type LocalDBWorkerDiagnostic = {
  stage: LocalDBWorkerDiagnosticStage;
  details?: Record<string, unknown>;
  updatedAt: number;
};

export const localDBWorkerDiagnosticMessageType =
  "notegic-local-db-diagnostic" as const;

export type LocalDBWorkerDiagnosticMessage = {
  type: typeof localDBWorkerDiagnosticMessageType;
  event: LocalDBWorkerDiagnostic;
};

export type LocalDBDiagnostics = {
  phase: LocalDBPhase;
  previousPhase: LocalDBPhase | null;
  result: LocalDBResult;
  recoverability: LocalDBResult;
  currentVersion: number | null;
  targetVersion: number | null;
  pendingCount: number;
  terminalFailureCount: number;
  activeOperationCount: number;
  errorCode: string | null;
  errorMessage: string | null;
  error: string | null;
  updatedAt: number;
  workerEvents: LocalDBWorkerDiagnostic[];
};

type DiagnosticsStorage = Pick<Storage, "getItem" | "setItem">;

const localDBWorkerDiagnosticStages = [
  "worker-module-evaluated",
  "worker-config-received",
  "worker-capabilities",
  "sqlite-wasm-import-start",
  "sqlite-wasm-imported",
  "sqlite-wasm-init-start",
  "sqlite-wasm-init-complete",
  "opfs-driver-init-start",
  "opfs-driver-init-complete",
  "opfs-driver-init-failed",
  "nested-worker-constructing",
  "nested-worker-created",
  "nested-worker-message",
  "nested-worker-error",
  "nested-worker-message-error",
  "query-start",
  "query-complete",
  "query-failed",
  "worker-connected",
  "processor-error",
  "worker-runtime-error",
  "worker-unhandled-rejection",
  "main-worker-error",
  "main-worker-message-error",
  "main-worker-timeout",
] as const;

const isLocalDBPhase = (value: unknown): value is LocalDBPhase =>
  typeof value === "string" &&
  [
    "disabled",
    "worker-starting",
    "worker-connection-pending",
    "worker-connected",
    "migration-lock-pending",
    "migration-lock-acquired",
    "reading-version",
    "freezing-local-writes",
    "waiting-for-local-operations",
    "checking-transaction-queue",
    "flushing-yjs",
    "checking-rebuildability",
    "exporting-local-data",
    "clearing-local-storage",
    "rebuild-in-progress",
    "bootstrapping",
    "migrating",
    "verifying",
    "verifying-schema",
    "resynchronizing",
    "ready",
    "failed",
    "needs-action",
    "manual-recovery",
  ].includes(value);

const isLocalDBResult = (value: unknown): value is LocalDBResult =>
  typeof value === "string" &&
  [
    "success",
    "retryable",
    "needs-action",
    "safe-to-rebuild",
    "manual-recovery",
  ].includes(value);

const isLocalDBWorkerDiagnosticStage = (
  value: unknown
): value is LocalDBWorkerDiagnosticStage =>
  typeof value === "string" &&
  localDBWorkerDiagnosticStages.includes(value as LocalDBWorkerDiagnosticStage);

const isLocalDBWorkerDiagnostic = (
  value: unknown
): value is LocalDBWorkerDiagnostic => {
  if (!value || typeof value !== "object") return false;

  const diagnostic = value as Partial<LocalDBWorkerDiagnostic>;
  return (
    isLocalDBWorkerDiagnosticStage(diagnostic.stage) &&
    typeof diagnostic.updatedAt === "number"
  );
};

const readPersistedDiagnostics = (
  storage: DiagnosticsStorage | null,
  storageKey: string
): Pick<
  LocalDBDiagnostics,
  | "phase"
  | "result"
  | "recoverability"
  | "currentVersion"
  | "targetVersion"
  | "pendingCount"
  | "terminalFailureCount"
  | "activeOperationCount"
  | "errorCode"
  | "errorMessage"
  | "error"
  | "workerEvents"
> | null => {
  if (!storage) return null;

  try {
    const value: unknown = JSON.parse(storage.getItem(storageKey) ?? "null");
    if (!value || typeof value !== "object") return null;

    const persisted = value as Partial<LocalDBDiagnostics>;
    if (!isLocalDBPhase(persisted.phase)) return null;

    return {
      phase: persisted.phase,
      result: isLocalDBResult(persisted.result)
        ? persisted.result
        : persisted.phase === "failed"
          ? "manual-recovery"
          : "success",
      recoverability: isLocalDBResult(persisted.recoverability)
        ? persisted.recoverability
        : persisted.phase === "failed"
          ? "manual-recovery"
          : "success",
      currentVersion:
        typeof persisted.currentVersion === "number"
          ? persisted.currentVersion
          : null,
      targetVersion:
        typeof persisted.targetVersion === "number"
          ? persisted.targetVersion
          : null,
      pendingCount:
        typeof persisted.pendingCount === "number"
          ? Math.max(0, Math.trunc(persisted.pendingCount))
          : 0,
      terminalFailureCount:
        typeof persisted.terminalFailureCount === "number"
          ? Math.max(0, Math.trunc(persisted.terminalFailureCount))
          : 0,
      activeOperationCount:
        typeof persisted.activeOperationCount === "number"
          ? Math.max(0, Math.trunc(persisted.activeOperationCount))
          : 0,
      errorCode:
        typeof persisted.errorCode === "string" ? persisted.errorCode : null,
      errorMessage:
        typeof persisted.errorMessage === "string"
          ? persisted.errorMessage
          : typeof persisted.error === "string"
            ? persisted.error
            : null,
      error: typeof persisted.error === "string" ? persisted.error : null,
      workerEvents: Array.isArray(persisted.workerEvents)
        ? persisted.workerEvents.filter(isLocalDBWorkerDiagnostic).slice(-100)
        : [],
    };
  } catch {
    return null;
  }
};

export const createLocalDBDiagnostics = (
  storage: DiagnosticsStorage | null,
  storageKey: string,
  initialPhase: LocalDBPhase
) => {
  const persisted = readPersistedDiagnostics(storage, storageKey);
  let state: LocalDBDiagnostics = {
    phase: initialPhase,
    previousPhase: persisted?.phase ?? null,
    result: persisted?.result ?? "success",
    recoverability: persisted?.recoverability ?? "success",
    currentVersion: persisted?.currentVersion ?? null,
    targetVersion: persisted?.targetVersion ?? null,
    pendingCount: persisted?.pendingCount ?? 0,
    terminalFailureCount: persisted?.terminalFailureCount ?? 0,
    activeOperationCount: persisted?.activeOperationCount ?? 0,
    errorCode: persisted?.errorCode ?? null,
    errorMessage: persisted?.errorMessage ?? null,
    error: persisted?.error ?? null,
    updatedAt: Date.now(),
    workerEvents: persisted?.workerEvents ?? [],
  };

  const workerEvents: LocalDBWorkerDiagnostic[] = [...state.workerEvents];

  const persist = () => {
    if (!storage) return;

    try {
      storage.setItem(storageKey, JSON.stringify(state));
    } catch {
      // Diagnostics must never prevent the local database from starting.
    }
  };

  persist();
  console.debug("[LocalDB] phase", state);

  const transition = (
    phase: LocalDBPhase,
    details: Partial<
      Pick<
        LocalDBDiagnostics,
        | "result"
        | "recoverability"
        | "currentVersion"
        | "targetVersion"
        | "pendingCount"
        | "terminalFailureCount"
        | "activeOperationCount"
        | "errorCode"
        | "errorMessage"
        | "error"
      >
    > = {}
  ): LocalDBDiagnostics => {
    state = {
      ...state,
      ...details,
      phase,
      previousPhase: state.phase,
      updatedAt: Date.now(),
    };
    persist();
    console.debug("[LocalDB] phase", state);
    notify();
    return state;
  };

  const listeners = new Set<() => void>();
  const subscribe = (listener: () => void) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  };

  const notify = () => {
    for (const listener of listeners) listener();
  };

  const recordWorkerEvent = (
    event: LocalDBWorkerDiagnostic
  ): LocalDBWorkerDiagnostic => {
    workerEvents.push(event);
    if (workerEvents.length > 100) workerEvents.shift();
    state = { ...state, workerEvents: [...workerEvents] };
    persist();
    console.debug("[LocalDB] worker", event);
    notify();
    return event;
  };

  return {
    getState: (): LocalDBDiagnostics => ({ ...state }),
    subscribe,
    transition,
    recordWorkerEvent,
  };
};

export const isLocalDBWorkerDiagnosticMessage = (
  value: unknown
): value is LocalDBWorkerDiagnosticMessage => {
  if (!value || typeof value !== "object") return false;

  const message = value as Partial<LocalDBWorkerDiagnosticMessage>;
  return (
    message.type === localDBWorkerDiagnosticMessageType &&
    isLocalDBWorkerDiagnostic(message.event)
  );
};
