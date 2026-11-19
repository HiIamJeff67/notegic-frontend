import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { initialize, readRootShelf, saveRootShelf } from "./db";

const timestamp = new Date("2026-01-01T00:00:00.000Z");
const shelfId = "11111111-1111-4111-8111-111111111111";

describe("desktop sqlite driver", () => {
  it("writes a shelf row and reads it back after the file is reopened", async () => {
    const directory = mkdtempSync(path.join(tmpdir(), "notegic-driver-"));
    const filePath = path.join(directory, "notegic.sqlite");
    const opened = await initialize(filePath);
    saveRootShelf(opened.database, {
      id: shelfId,
      name: "Desk",
      createdAt: timestamp,
      updatedAt: timestamp,
      lastAnalyzedAt: timestamp,
    });
    opened.close();

    const reopened = await initialize(filePath);
    const shelf = readRootShelf(reopened.database, shelfId);
    reopened.close();

    expect(shelf).toMatchObject({
      id: shelfId,
      name: "Desk",
      createdAt: timestamp,
      updatedAt: timestamp,
      lastAnalyzedAt: timestamp,
    });
  });
});
