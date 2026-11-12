import { localDB } from "./localDatabase";

describe("desktop local database boundary", () => {
  it("stays disabled and does not open a database worker", async () => {
    expect(localDB.isReadOnly).toBe(true);
    expect(localDB.isEnabled).toBe(false);
    expect(localDB.isReady).toBe(false);
    expect(localDB.getDiagnostics().phase).toBe("disabled");
    expect(localDB.getDiagnostics().rebuildAttemptedAt).toBeNull();

    const unsubscribe = localDB.subscribeToDiagnostics(() => undefined);
    unsubscribe();

    await expect(localDB.ensureReady()).resolves.toEqual({ finalVersion: 0 });
    await expect(localDB.select().from({}).where({}).limit(1)).resolves.toEqual(
      []
    );
  });
});
