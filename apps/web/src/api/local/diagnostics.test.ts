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
