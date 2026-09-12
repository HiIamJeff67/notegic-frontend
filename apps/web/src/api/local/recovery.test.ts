import {
  classifyLocalDBError,
  createLocalDBDiagnosticsExport,
  isOPFSMissingFileError,
} from "./recovery";

describe("local database recovery policy", () => {
  it("recognizes missing OPFS database files through wrapped errors", () => {
    expect(
      isOPFSMissingFileError(
        new Error("worker failed", {
          cause: new Error("SQLITE_CANTOPEN"),
        })
      )
    ).toBe(true);
    expect(isOPFSMissingFileError(new Error("unrelated failure"))).toBe(false);
  });

  it("classifies transient worker failures as retryable", () => {
    expect(
      classifyLocalDBError(
        new Error("SQLocal worker connection timed out"),
        "worker-connection-pending"
      )
    ).toMatchObject({
      result: "retryable",
      errorCode: "LOCAL_DB_TRANSIENT_FAILURE",
    });
  });

  it("classifies driver and storage failures as manual recovery", () => {
    expect(
      classifyLocalDBError(
        new Error("Driver not initialized"),
        "reading-version"
      )
    ).toMatchObject({
      result: "manual-recovery",
      errorCode: "LOCAL_DB_RUNTIME_FAILURE",
    });
  });

  it("exports diagnostics without authentication material", () => {
    const output = createLocalDBDiagnosticsExport({
      phase: "needs-action",
      previousPhase: "migrating",
      result: "needs-action",
      recoverability: "needs-action",
      currentVersion: 1,
      targetVersion: 2,
      pendingCount: 1,
      terminalFailureCount: 0,
      activeOperationCount: 0,
      errorCode: "LOCAL_DB_MIGRATION_FAILURE",
      errorMessage: "migration failed",
      error: "migration failed",
      updatedAt: 1,
      workerEvents: [],
    });

    expect(output).toContain("LOCAL_DB_MIGRATION_FAILURE");
    expect(output).not.toMatch(
      /accessToken|refreshToken|csrfToken|password|cookie/i
    );
  });
});
