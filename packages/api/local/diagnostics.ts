import { isPhase, type Phase } from "./phase";
import { isResult, type Result } from "./result";

export const AllDiagnosticStages = [
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

export type DiagnosticStage = (typeof AllDiagnosticStages)[number];

const isDiagnosticStage = (value: unknown): value is DiagnosticStage =>
  typeof value === "string" &&
  (AllDiagnosticStages as readonly string[]).includes(value);

export type Diagnostic = {
  stage: DiagnosticStage;
  details?: Record<string, unknown>;
  updatedAt: number;
};

const isDiagnostic = (value: unknown): value is Diagnostic => {
  if (!value || typeof value !== "object") return false;

  const diagnostic = value as Partial<Diagnostic>;
  return (
    isDiagnosticStage(diagnostic.stage) &&
    typeof diagnostic.updatedAt === "number"
  );
};

export const DiagnosticMessageType = "notegic-local-db-diagnostic" as const;

export type DiagnosticMessage = {
  type: typeof DiagnosticMessageType;
  event: Diagnostic;
};

export const isDiagnosticMessage = (
  value: unknown
): value is DiagnosticMessage => {
  if (!value || typeof value !== "object") return false;

  const message = value as Partial<DiagnosticMessage>;
  return message.type === DiagnosticMessageType && isDiagnostic(message.event);
};

export type Diagnostics = {
  phase: Phase;
  previousPhase: Phase | null;
  result: Result;
  recoverability: Result;
  currentVersion: number | null;
  targetVersion: number | null;
  pendingCount: number;
  terminalFailureCount: number;
  activeOperationCount: number;
  errorCode: string | null;
  errorMessage: string | null;
  error: string | null;
  updatedAt: number;
  rebuildAttemptedAt: number | null;
  workerEvents: Diagnostic[];
};

export type DiagnosticTransition = Partial<
  Pick<
    Diagnostics,
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
    | "rebuildAttemptedAt"
  >
>;

type DiagnosticsStorage = Pick<Storage, "getItem" | "setItem">;

type PersistedDiagnostics = Pick<
  Diagnostics,
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
  | "rebuildAttemptedAt"
>;

const persistedResult = (value: unknown, phase: Phase): Result => {
  if (isResult(value)) return value;
  return phase === "failed" ? "manual-recovery" : "success";
};

export class DiagnosticManager {
  static read(
    storage: DiagnosticsStorage | null,
    storageKey: string
  ): PersistedDiagnostics | null {
    if (!storage) return null;

    try {
      const value: unknown = JSON.parse(storage.getItem(storageKey) ?? "null");
      if (!value || typeof value !== "object") return null;

      const persisted = value as Partial<Diagnostics>;
      if (!isPhase(persisted.phase)) return null;

      return {
        phase: persisted.phase,
        result: persistedResult(persisted.result, persisted.phase),
        recoverability: persistedResult(
          persisted.recoverability,
          persisted.phase
        ),
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
        rebuildAttemptedAt:
          typeof persisted.rebuildAttemptedAt === "number"
            ? persisted.rebuildAttemptedAt
            : null,
        workerEvents: Array.isArray(persisted.workerEvents)
          ? persisted.workerEvents.filter(isDiagnostic).slice(-100)
          : [],
      };
    } catch {
      return null;
    }
  }

  static create(
    storage: DiagnosticsStorage | null,
    storageKey: string,
    initialPhase: Phase
  ): DiagnosticManager {
    return new DiagnosticManager(storage, storageKey, initialPhase);
  }

  private state: Diagnostics;
  private readonly workerEvents: Diagnostic[];
  private readonly listeners = new Set<() => void>();

  private constructor(
    private readonly storage: DiagnosticsStorage | null,
    private readonly storageKey: string,
    initialPhase: Phase
  ) {
    const persisted = DiagnosticManager.read(storage, storageKey);
    this.workerEvents = [...(persisted?.workerEvents ?? [])];
    this.state = {
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
      rebuildAttemptedAt: persisted?.rebuildAttemptedAt ?? null,
      workerEvents: [...this.workerEvents],
    };
    this.persist();
    console.debug("[LocalDB] phase", this.state);
  }

  getState = (): Diagnostics => this.state;

  subscribe = (listener: () => void): (() => void) => {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  };

  transition = (
    phase: Phase,
    details: DiagnosticTransition = {}
  ): Diagnostics => {
    this.state = {
      ...this.state,
      ...details,
      phase,
      previousPhase: this.state.phase,
      updatedAt: Date.now(),
    };
    this.persist();
    console.debug("[LocalDB] phase", this.state);
    this.notify();
    return this.state;
  };

  recordWorkerEvent = (event: Diagnostic): Diagnostic => {
    this.workerEvents.push(event);
    if (this.workerEvents.length > 100) this.workerEvents.shift();
    this.state = { ...this.state, workerEvents: [...this.workerEvents] };
    this.persist();
    console.debug("[LocalDB] worker", event);
    this.notify();
    return event;
  };

  private persist(): void {
    if (!this.storage) return;

    try {
      this.storage.setItem(this.storageKey, JSON.stringify(this.state));
    } catch {
      // Diagnostics must never prevent the local database from starting.
    }
  }

  private notify(): void {
    for (const listener of this.listeners) listener();
  }
}
