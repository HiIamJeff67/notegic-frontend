jest.mock("@shared/blockpack/localYjsDocumentStore", () => ({
  LocalYjsDocumentStore: {
    load: jest.fn(),
    remove: jest.fn(),
    save: jest.fn(),
  },
}));

import { RealtimeBinaryFrameType } from "@shared/api/websocket/types";
import { BlockPackYjsCoordinator } from "@shared/blockpack/blockPackYjsCoordinator";
import { LocalYjsDocumentStore } from "@shared/blockpack/localYjsDocumentStore";
import {
  Awareness,
  applyAwarenessUpdate,
  encodeAwarenessUpdate,
  removeAwarenessStates,
} from "y-protocols/awareness";
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

  afterEach(() => {
    jest.useRealTimers();
  });

  it("does not publish a remote awareness timeout as a local removal", async () => {
    jest.useFakeTimers();
    const document = new Y.Doc();
    const remoteDocument = new Y.Doc();
    const remoteAwareness = new Awareness(remoteDocument);
    remoteAwareness.setLocalState({ user: "remote-fixture" });
    const provider = new BlockPackYjsCoordinator(
      document,
      "block-pack-id" as never,
      "user-id"
    );
    const observerDocument = new Y.Doc();
    const observer = new Awareness(observerDocument);
    observer.setLocalState(null);
    const sentClientIds: number[] = [];
    observer.on(
      "update",
      (changes: { added: number[]; updated: number[]; removed: number[] }) => {
        sentClientIds.push(
          ...changes.added,
          ...changes.updated,
          ...changes.removed
        );
      }
    );
    provider.connect((type, payload) => {
      if (type === RealtimeBinaryFrameType.Awareness) {
        applyAwarenessUpdate(observer, payload, "fixture");
      }
      return true;
    });
    provider.applyAwarenessUpdate(
      encodeAwarenessUpdate(remoteAwareness, [remoteAwareness.clientID])
    );
    expect(provider.awareness.getStates().has(remoteAwareness.clientID)).toBe(
      true
    );
    sentClientIds.length = 0;

    // lib0 captures Date.now at import time, before Jest installs its clock.
    provider.awareness.meta.get(remoteAwareness.clientID)!.lastUpdated -=
      31_000;
    provider.awareness.meta.get(provider.awareness.clientID)!.lastUpdated -=
      16_000;
    jest.advanceTimersByTime(3_000);

    expect(provider.awareness.getStates().has(remoteAwareness.clientID)).toBe(
      false
    );
    expect(sentClientIds.length).toBeGreaterThan(0);
    expect(new Set(sentClientIds)).toEqual(
      new Set([provider.awareness.clientID])
    );

    await provider.destroy();
    document.destroy();
    remoteAwareness.destroy();
    remoteDocument.destroy();
    observer.destroy();
    observerDocument.destroy();
  });

  it("advances its awareness clock on reattachment after a server removal", async () => {
    const document = new Y.Doc();
    const serverDocument = new Y.Doc();
    const server = new Awareness(serverDocument);
    server.setLocalState(null);
    const provider = new BlockPackYjsCoordinator(
      document,
      "block-pack-id" as never,
      "user-id"
    );
    const send = (type: RealtimeBinaryFrameType, payload: Uint8Array) => {
      if (type === RealtimeBinaryFrameType.Awareness)
        applyAwarenessUpdate(server, payload, "fixture");
      return true;
    };
    provider.awareness.setLocalState({ user: "local-fixture" });
    const clientId = provider.awareness.clientID;
    provider.connect(send);
    const originalClock = server.meta.get(clientId)!.clock;
    provider.disconnect();
    removeAwarenessStates(server, [clientId], "detached");
    document.getMap("draft").set("text", "offline edit");

    provider.connect(send);

    expect(server.meta.get(clientId)!.clock).toBeGreaterThan(originalClock);
    expect(server.getStates().get(clientId)).toEqual({ user: "local-fixture" });
    expect(provider.awareness.clientID).toBe(clientId);
    expect(document.getMap("draft").get("text")).toBe("offline edit");
    expect(remove).not.toHaveBeenCalled();
    await provider.destroy();
    document.destroy();
    server.destroy();
    serverDocument.destroy();
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
