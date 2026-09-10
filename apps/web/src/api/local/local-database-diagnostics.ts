export type LocalDBPhase =
  | "disabled"
  | "worker-starting"
  | "worker-connection-pending"
  | "worker-connected"
  | "reading-version"
  | "bootstrapping"
  | "migrating"
  | "verifying"
  | "ready"
  | "failed";

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
  currentVersion: number | null;
  targetVersion: number | null;
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
    "reading-version",
    "bootstrapping",
    "migrating",
    "verifying",
    "ready",
    "failed",
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
  "phase" | "currentVersion" | "targetVersion" | "error" | "workerEvents"
> | null => {
  if (!storage) return null;

  try {
    const value: unknown = JSON.parse(storage.getItem(storageKey) ?? "null");
    if (!value || typeof value !== "object") return null;

    const persisted = value as Partial<LocalDBDiagnostics>;
    if (!isLocalDBPhase(persisted.phase)) return null;

    return {
      phase: persisted.phase,
      currentVersion:
        typeof persisted.currentVersion === "number"
          ? persisted.currentVersion
          : null,
      targetVersion:
        typeof persisted.targetVersion === "number"
          ? persisted.targetVersion
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
    currentVersion: persisted?.currentVersion ?? null,
    targetVersion: persisted?.targetVersion ?? null,
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
      Pick<LocalDBDiagnostics, "currentVersion" | "targetVersion" | "error">
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
    return state;
  };

  const recordWorkerEvent = (
    event: LocalDBWorkerDiagnostic
  ): LocalDBWorkerDiagnostic => {
    workerEvents.push(event);
    if (workerEvents.length > 100) workerEvents.shift();
    state = { ...state, workerEvents: [...workerEvents] };
    persist();
    console.debug("[LocalDB] worker", event);
    return event;
  };

  return {
    getState: (): LocalDBDiagnostics => ({ ...state }),
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
