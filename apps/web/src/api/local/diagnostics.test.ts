import {
  createLocalDBDiagnostics,
  type LocalDBDiagnostics,
} from "./diagnostics";

const createStorage = () => {
  const values = new Map<string, string>();
  return {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => values.set(key, value),
  };
};

describe("local database diagnostics", () => {
  it("persists the last phase for the next startup", () => {
    const storage = createStorage();
    const firstRun = createLocalDBDiagnostics(
      storage,
      "diagnostics",
      "worker-connection-pending"
    );

    firstRun.transition("worker-connected");
    firstRun.transition("migrating", {
      currentVersion: 2,
      targetVersion: 4,
    });

    const nextRun = createLocalDBDiagnostics(
      storage,
      "diagnostics",
      "worker-connection-pending"
    );
    const state: LocalDBDiagnostics = nextRun.getState();

    expect(state.phase).toBe("worker-connection-pending");
    expect(state.previousPhase).toBe("migrating");
    expect(state.currentVersion).toBe(2);
    expect(state.targetVersion).toBe(4);
    expect(state.result).toBe("success");
    expect(state.pendingCount).toBe(0);
  });

  it("retains the recovery follow-up across reload and clears it on dismissal", () => {
    const storage = createStorage();
    const firstRun = createLocalDBDiagnostics(storage, "diagnostics", "failed");
    firstRun.transition("bootstrapping", { rebuildAttemptedAt: 123 });
    const nextRun = createLocalDBDiagnostics(
      storage,
      "diagnostics",
      "worker-connection-pending"
    );
    expect(nextRun.getState().rebuildAttemptedAt).toBe(123);
    nextRun.transition("ready", { rebuildAttemptedAt: null });
    expect(
      createLocalDBDiagnostics(
        storage,
        "diagnostics",
        "worker-connection-pending"
      ).getState().rebuildAttemptedAt
    ).toBeNull();
  });

  it("provides a stable external-store snapshot until a transition", () => {
    const diagnostics = createLocalDBDiagnostics(null, "diagnostics", "failed");
    const before = diagnostics.getState();
    expect(diagnostics.getState()).toBe(before);
    diagnostics.transition("ready");
    expect(diagnostics.getState()).not.toBe(before);
    expect(before.phase).toBe("failed");
  });

  it("keeps the latest worker events for failure diagnosis", () => {
    const diagnostics = createLocalDBDiagnostics(
      createStorage(),
      "diagnostics",
      "worker-connection-pending"
    );

    diagnostics.recordWorkerEvent({
      stage: "worker-module-evaluated",
      details: { crossOriginIsolated: true },
      updatedAt: 1,
    });

    expect(diagnostics.getState().workerEvents).toEqual([
      {
        stage: "worker-module-evaluated",
        details: { crossOriginIsolated: true },
        updatedAt: 1,
      },
    ]);
  });

  it("notifies subscribers when a phase changes", () => {
    const diagnostics = createLocalDBDiagnostics(
      createStorage(),
      "diagnostics",
      "worker-connection-pending"
    );
    const listener = jest.fn();
    const unsubscribe = diagnostics.subscribe(listener);

    diagnostics.transition("manual-recovery", {
      result: "manual-recovery",
      recoverability: "manual-recovery",
      errorCode: "LOCAL_DB_RUNTIME_FAILURE",
      errorMessage: "worker failed",
    });

    expect(listener).toHaveBeenCalledTimes(1);
    unsubscribe();
    diagnostics.transition("ready", {
      result: "success",
      recoverability: "success",
    });
    expect(listener).toHaveBeenCalledTimes(1);
  });
});
