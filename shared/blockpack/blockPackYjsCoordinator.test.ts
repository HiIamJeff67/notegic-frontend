jest.mock("@shared/blockpack/localYjsDocumentStore", () => ({
  LocalYjsDocumentStore: {
    load: jest.fn(),
    remove: jest.fn(),
    save: jest.fn(),
  },
}));

import { BlockPackYjsCoordinator } from "@shared/blockpack/blockPackYjsCoordinator";
import { LocalYjsDocumentStore } from "@shared/blockpack/localYjsDocumentStore";
import { RealtimeBinaryFrameType } from "@shared/api/websocket/types";
import * as Y from "yjs";

const load = jest.mocked(LocalYjsDocumentStore.load);
const remove = jest.mocked(LocalYjsDocumentStore.remove);

describe("BlockPackYjsCoordinator", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    remove.mockResolvedValue();
    load.mockResolvedValue(null);
    jest.mocked(LocalYjsDocumentStore.save).mockResolvedValue();
  });

  it("replays sent but unconfirmed changes after disconnect without rebuilding the document", async () => {
    const document = new Y.Doc();
    const provider = new BlockPackYjsCoordinator(
      document,
      "block-pack-id" as never,
      "user-id"
    );
    const originalSend = jest.fn((type: number) => type > 0);
    provider.connect(originalSend);
    document.getMap("draft").set("text", "retained");
    await provider.flushPendingDocumentUpdatesNow();
    expect(
      originalSend.mock.calls.filter(
        ([type]) => type === RealtimeBinaryFrameType.YjsDocument
      )
    ).toHaveLength(1);

    provider.disconnect();
    const restored = new Y.Doc();
    const restoredSend = jest.fn((type: number, payload: Uint8Array) => {
      if (type === RealtimeBinaryFrameType.YjsDocument)
        Y.applyUpdate(restored, payload);
      return true;
    });
    provider.connect(restoredSend);
    await provider.flushPendingDocumentUpdatesNow();
    expect(
      restoredSend.mock.calls.filter(
        ([type]) => type === RealtimeBinaryFrameType.YjsDocument
      )
    ).toHaveLength(1);
    expect(restored.getMap("draft").get("text")).toBe("retained");
    expect(document.getMap("draft").get("text")).toBe("retained");
    expect(remove).not.toHaveBeenCalled();
    await provider.destroy();
    document.destroy();
    restored.destroy();
  });

  it("does not replay document changes after permission becomes read-only", async () => {
    const document = new Y.Doc();
    const provider = new BlockPackYjsCoordinator(
      document,
      "block-pack-id" as never,
      "user-id"
    );
    provider.connect(() => true);
    document.getMap("draft").set("text", "retained");
    await provider.flushPendingDocumentUpdatesNow();
    provider.setReadOnly(true);
    provider.disconnect();
    const send = jest.fn((type: number) => type > 0);
    provider.connect(send);
    await provider.flushPendingDocumentUpdatesNow();
    expect(
      send.mock.calls.filter(
        ([type]) => type === RealtimeBinaryFrameType.YjsDocument
      )
    ).toHaveLength(0);
    await provider.destroy();
    document.destroy();
  });

  it("replays a sent deletion without a new clock and tolerates duplicate recovery", async () => {
    const document = new Y.Doc();
    const server = new Y.Doc();
    server.getMap("draft").set("text", "remove me");
    const provider = new BlockPackYjsCoordinator(
      document,
      "block-pack-id" as never,
      "user-id"
    );
    provider.applyDocumentUpdate(Y.encodeStateAsUpdate(server));
    provider.connect(() => true);
    document.getMap("draft").delete("text");
    await provider.flushPendingDocumentUpdatesNow();
    for (let attempt = 0; attempt < 2; attempt++) {
      provider.disconnect();
      provider.connect((type, payload) => {
        if (type === RealtimeBinaryFrameType.YjsDocument)
          Y.applyUpdate(server, payload);
        return true;
      });
      await provider.flushPendingDocumentUpdatesNow();
      expect(server.getMap("draft").size).toBe(0);
    }
    await provider.destroy();
    document.destroy();
    server.destroy();
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
