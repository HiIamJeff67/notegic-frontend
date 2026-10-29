import {
  classifyLocalDBError,
  createLocalDBDiagnosticsExport,
  createLocalDataExport,
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

  it("exports SQLite, attachments and Yjs byte slices without losing their contents", async () => {
    const bytes = new Uint8Array([99, 1, 2, 3, 99]);
    const exported = JSON.parse(
      await createLocalDataExport(
        new File(["sqlite fixture"], "database.sqlite3", {
          type: "application/x-sqlite3",
        }),
        {
          document: {
            update: bytes.subarray(1, 4),
            updatedAt: new Date("2026-01-01T00:00:00Z"),
          },
          attachment: new Blob(["private file"], { type: "text/plain" }),
        }
      )
    );
    expect(exported.formatVersion).toBe(2);
    expect(atob(exported.database.base64)).toBe("sqlite fixture");
    expect(exported.database.name).toBe("database.sqlite3");
    expect(exported.indexedDB.document.update).toEqual({
      type: "Uint8Array",
      base64: "AQID",
    });
    expect(exported.indexedDB.document.updatedAt).toBe(
      "2026-01-01T00:00:00.000Z"
    );
    expect(atob(exported.indexedDB.attachment.base64)).toBe("private file");
    expect(exported.indexedDB.attachment.contentType).toBe("text/plain");
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
      rebuildAttemptedAt: null,
      workerEvents: [],
    });

    expect(output).toContain("LOCAL_DB_MIGRATION_FAILURE");
    expect(output).not.toMatch(
      /accessToken|refreshToken|csrfToken|password|cookie/i
    );
  });
});
