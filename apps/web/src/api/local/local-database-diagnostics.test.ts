import {
  createLocalDBDiagnostics,
  type LocalDBDiagnostics,
} from "./local-database-diagnostics";

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
});
