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

export type LocalDBDiagnostics = {
  phase: LocalDBPhase;
  previousPhase: LocalDBPhase | null;
  currentVersion: number | null;
  targetVersion: number | null;
  error: string | null;
  updatedAt: number;
};

type DiagnosticsStorage = Pick<Storage, "getItem" | "setItem">;

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

const readPersistedDiagnostics = (
  storage: DiagnosticsStorage | null,
  storageKey: string
): Pick<
  LocalDBDiagnostics,
  "phase" | "currentVersion" | "targetVersion" | "error"
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
  };

  const persist = () => {
    if (!storage) return;

    try {
      storage.setItem(storageKey, JSON.stringify(state));
    } catch {
      // Diagnostics must never prevent the local database from starting.
    }
  };

  persist();
  console.info("[LocalDB] phase", state);

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
    console.info("[LocalDB] phase", state);
    return state;
  };

  return {
    getState: (): LocalDBDiagnostics => ({ ...state }),
    transition,
  };
};
