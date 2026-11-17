import { IndexedDB } from "@shared/lib/storage/indexedDB";
import { entries } from "idb-keyval";

jest.mock("idb-keyval", () => ({ entries: jest.fn() }));

it("exports every Notegic namespace without including unrelated keys", async () => {
  jest.mocked(entries).mockResolvedValue([
    ["notegic_user_blockPackYjsDocuments", { contents: [1] }],
    ["unrelated", "ignored"],
  ]);
  await expect(IndexedDB.getAllItems()).resolves.toEqual({
    user_blockPackYjsDocuments: { contents: [1] },
  });
});

it("fails a recovery backup when IndexedDB cannot be read", async () => {
  jest.mocked(entries).mockRejectedValue(new Error("unavailable storage"));
  await expect(IndexedDB.getAllItems()).rejects.toThrow("unavailable storage");
});
