import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import {
  readBlockPackDocument,
  saveBlockPackDocument,
} from "./blockPackDocument";
import { initialize } from "./db";

const timestamp = new Date("2026-01-01T00:00:00.000Z");
const blockPackId = "22222222-2222-4222-8222-222222222222";

describe("block pack document", () => {
  it("stores the update and state vector in sqlite", async () => {
    const directory = mkdtempSync(path.join(tmpdir(), "notegic-document-"));
    const filePath = path.join(directory, "notegic.sqlite");
    const update = Uint8Array.from([1, 2, 3, 4]);
    const stateVector = Uint8Array.from([9, 8]);
    const opened = await initialize(filePath);
    saveBlockPackDocument(opened.db, {
      blockPackId,
      update,
      stateVector,
      needsFlush: true,
      updatedAt: timestamp,
    });
    opened.close();

    const reopened = await initialize(filePath);
    const document = readBlockPackDocument(reopened.db, blockPackId);
    reopened.close();

    expect(document?.blockPackId).toBe(blockPackId);
    expect(document?.needsFlush).toBe(true);
    expect(document?.updatedAt).toEqual(timestamp);
    expect(Array.from(document?.update ?? [])).toEqual(Array.from(update));
    expect(Array.from(document?.stateVector ?? [])).toEqual(
      Array.from(stateVector)
    );
  });
});
