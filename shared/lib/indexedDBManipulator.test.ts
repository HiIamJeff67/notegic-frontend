import { entries } from "idb-keyval";
import { IndexedDBManipulator } from "./indexedDBManipulator";

jest.mock("idb-keyval", () => ({ entries: jest.fn() }));

it("exports every Notegic namespace without including unrelated keys", async () => {
  jest.mocked(entries).mockResolvedValue([
    ["notegic_user_blockPackYjsDocuments", { contents: [1] }],
    ["unrelated", "ignored"],
  ]);
  await expect(IndexedDBManipulator.getAllItems()).resolves.toEqual({
    user_blockPackYjsDocuments: { contents: [1] },
  });
});

it("fails a recovery backup when IndexedDB cannot be read", async () => {
  jest.mocked(entries).mockRejectedValue(new Error("unavailable storage"));
  await expect(IndexedDBManipulator.getAllItems()).rejects.toThrow(
    "unavailable storage"
  );
});
