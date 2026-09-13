jest.mock("@shared/blockpack/localYjsDocumentStore", () => ({
  LocalYjsDocumentStore: {
    load: jest.fn(),
    remove: jest.fn(),
  },
}));

import { BlockPackYjsCoordinator } from "@shared/blockpack/blockPackYjsCoordinator";
import { LocalYjsDocumentStore } from "@shared/blockpack/localYjsDocumentStore";
import * as Y from "yjs";

const load = jest.mocked(LocalYjsDocumentStore.load);
const remove = jest.mocked(LocalYjsDocumentStore.remove);

describe("BlockPackYjsCoordinator", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    remove.mockResolvedValue();
  });

  it("waits for hydration before clearing a local document", async () => {
    let resolveLoad: (value: null) => void = () => undefined;
    load.mockReturnValue(
      new Promise(resolve => {
        resolveLoad = resolve;
      })
    );

    const provider = new BlockPackYjsCoordinator(
      new Y.Doc(),
      "block-pack-id" as never,
      "user-id"
    );
    const clearPromise = provider.clearLocalDocument();

    await Promise.resolve();
    expect(remove).not.toHaveBeenCalled();

    resolveLoad(null);
    await clearPromise;

    expect(remove).toHaveBeenCalledWith("user-id", "block-pack-id");
    await provider.destroy();
  });
});
