import { RealtimeBinaryFrameType } from "@shared/api/websocket/types";
import {
  NOTEZY_REALTIME_YJS_DOCUMENT_DEBOUNCE_MS,
  NOTEZY_REALTIME_YJS_LOCAL_AWARENESS_REMOVAL_ORIGIN,
  NOTEZY_REALTIME_YJS_REMOTE_ORIGIN,
} from "@shared/blockpack/core/contract";
import { LocalYjsDocumentStore } from "@shared/blockpack/core/localYjsDocumentStore";
import type { UUID } from "crypto";
import {
  Awareness,
  applyAwarenessUpdate,
  encodeAwarenessUpdate,
  removeAwarenessStates,
} from "y-protocols/awareness";
import * as Y from "yjs";

const logRealtimeYjs = (message: string, data?: Record<string, unknown>) => {
  if (import.meta.env.DEV) {
    console.debug(`[RealtimeYjs] ${message}`, data ?? "");
  }
};

export class RealtimeYjsProvider {
  readonly awareness: Awareness;

  private send:
    | ((type: RealtimeBinaryFrameType, payload: Uint8Array) => boolean)
    | null = null;
  private readOnly = false;
  private readonly pendingDocumentUpdates: Uint8Array[] = [];
  private readonly persistedDocumentStateVector = new Map<number, number>();
  private documentFlushTimeout: ReturnType<typeof setTimeout> | null = null;
  private persistencePromise: Promise<void> = Promise.resolve();

  private readonly doc: Y.Doc;
  private readonly blockPackId: UUID;
  private readonly hydrationPromise: Promise<void>;
  private readonly handleDocUpdate = (update: Uint8Array, origin: unknown) => {
    if (origin === NOTEZY_REALTIME_YJS_REMOTE_ORIGIN) return;
    if (this.readOnly) {
      logRealtimeYjs(
        "skipped local document update because channel is read-only",
        {
          byteLength: update.byteLength,
        }
      );
      return;
    }
    this.sendOrQueue(RealtimeBinaryFrameType.YjsDocument, update);
  };
  private readonly handleAwarenessUpdate = (
    changes: { added: number[]; updated: number[]; removed: number[] },
    origin: unknown
  ) => {
    if (origin === NOTEZY_REALTIME_YJS_REMOTE_ORIGIN) return;
    const changedClients = [
      ...changes.added,
      ...changes.updated,
      ...changes.removed,
    ];
    if (changedClients.length === 0) return;
    this.sendOrQueue(
      RealtimeBinaryFrameType.Awareness,
      encodeAwarenessUpdate(this.awareness, changedClients)
    );
  };

  constructor(doc: Y.Doc, blockPackId: UUID) {
    this.doc = doc;
    this.blockPackId = blockPackId;
    this.awareness = new Awareness(doc);
    this.doc.on("update", this.handleDocUpdate);
    this.awareness.on("update", this.handleAwarenessUpdate);
    this.hydrationPromise = this.hydrateLocalDocument();
  }

  connect(
    send: (type: RealtimeBinaryFrameType, payload: Uint8Array) => boolean
  ) {
    this.send = send;
    logRealtimeYjs("provider connected", {
      pendingDocumentUpdates: this.pendingDocumentUpdates.length,
    });
    this.flushPendingUpdates();
    void this.hydrationPromise.then(() => this.flushPendingUpdates());
    this.announceLocalAwarenessState();
  }

  disconnect() {
    if (this.send !== null) {
      logRealtimeYjs("provider disconnected");
    }
    this.clearDocumentFlushTimeout();
    this.send = null;
    this.clearRemoteAwarenessStates();
  }

  flushPendingDocumentUpdatesNow() {
    this.clearDocumentFlushTimeout();
    return this.flushPendingDocumentUpdates();
  }

  async clearLocalDocument() {
    this.setReadOnly(true);
    await this.persistencePromise;
    await LocalYjsDocumentStore.remove(this.blockPackId);
  }

  async snapshotLocalDocument(): Promise<Uint8Array> {
    await this.hydrationPromise;
    await this.persistencePromise;
    return Y.encodeStateAsUpdate(this.doc);
  }

  setReadOnly(readOnly: boolean) {
    this.readOnly = readOnly;
    if (readOnly) {
      this.clearDocumentFlushTimeout();
      this.pendingDocumentUpdates.length = 0;
    }
  }

  applyDocumentUpdate(update: Uint8Array) {
    logRealtimeYjs("received document update", {
      byteLength: update.byteLength,
    });
    Y.applyUpdate(this.doc, update, NOTEZY_REALTIME_YJS_REMOTE_ORIGIN);
    for (const [clientId, clock] of Y.decodeStateVector(
      Y.encodeStateVectorFromUpdate(update)
    )) {
      if ((this.persistedDocumentStateVector.get(clientId) ?? 0) < clock) {
        this.persistedDocumentStateVector.set(clientId, clock);
      }
    }

    let needsFlush = this.pendingDocumentUpdates.length > 0;
    if (!needsFlush) {
      for (const [clientId, clock] of Y.decodeStateVector(
        Y.encodeStateVector(this.doc)
      )) {
        if ((this.persistedDocumentStateVector.get(clientId) ?? 0) < clock) {
          needsFlush = true;
          break;
        }
      }
    }
    void this.persistLocalDocument(needsFlush);
  }

  applyAwarenessUpdate(update: Uint8Array) {
    logRealtimeYjs("received awareness update", {
      byteLength: update.byteLength,
    });
    applyAwarenessUpdate(
      this.awareness,
      update,
      NOTEZY_REALTIME_YJS_REMOTE_ORIGIN
    );
  }

  destroy() {
    void this.flushPendingDocumentUpdatesNow();
    this.announceLocalAwarenessRemoval();
    this.disconnect();
    this.pendingDocumentUpdates.length = 0;
    this.doc.off("update", this.handleDocUpdate);
    this.awareness.off("update", this.handleAwarenessUpdate);
    this.awareness.destroy();
  }

  private sendOrQueue(type: RealtimeBinaryFrameType, payload: Uint8Array) {
    if (this.readOnly && type === RealtimeBinaryFrameType.YjsDocument) return;

    if (type === RealtimeBinaryFrameType.YjsDocument) {
      this.queueDocumentUpdate(payload);
      return;
    }

    if (this.send === null) {
      logRealtimeYjs("dropped awareness update before channel connect", {
        type,
        byteLength: payload.byteLength,
      });
      return;
    }

    logRealtimeYjs("sending update", {
      type,
      byteLength: payload.byteLength,
    });
    this.send(type, payload);
  }

  private queueDocumentUpdate(payload: Uint8Array) {
    this.pendingDocumentUpdates.push(payload);
    void this.persistLocalDocument(true);

    if (this.send === null) {
      logRealtimeYjs("queued document update before channel connect", {
        byteLength: payload.byteLength,
        queuedUpdates: this.pendingDocumentUpdates.length,
      });
      return;
    }

    this.scheduleDocumentFlush();
  }

  private scheduleDocumentFlush() {
    this.clearDocumentFlushTimeout();
    this.documentFlushTimeout = setTimeout(() => {
      this.documentFlushTimeout = null;
      this.flushPendingDocumentUpdates();
    }, NOTEZY_REALTIME_YJS_DOCUMENT_DEBOUNCE_MS);
  }

  private clearDocumentFlushTimeout() {
    if (this.documentFlushTimeout === null) return;
    clearTimeout(this.documentFlushTimeout);
    this.documentFlushTimeout = null;
  }

  private async flushPendingDocumentUpdates() {
    const send = this.send;
    if (
      send === null ||
      this.readOnly ||
      this.pendingDocumentUpdates.length === 0
    )
      return;

    const updates = this.pendingDocumentUpdates.splice(0);
    const payload = updates.length === 1 ? updates[0] : Y.mergeUpdates(updates);
    if (this.send !== send) {
      this.pendingDocumentUpdates.unshift(...updates);
      return;
    }
    if (this.readOnly) return;
    logRealtimeYjs("sending debounced document update", {
      updateCount: updates.length,
      byteLength: payload.byteLength,
    });
    if (!send(RealtimeBinaryFrameType.YjsDocument, payload)) {
      this.pendingDocumentUpdates.unshift(...updates);
    }
  }

  private flushPendingUpdates() {
    const send = this.send;
    if (send === null) return;

    if (this.readOnly) {
      this.pendingDocumentUpdates.length = 0;
    }

    void this.flushPendingDocumentUpdates();
  }

  private async hydrateLocalDocument() {
    try {
      const cachedDocument = await LocalYjsDocumentStore.load(this.blockPackId);
      if (!cachedDocument) return;
      Y.applyUpdate(
        this.doc,
        cachedDocument.update,
        NOTEZY_REALTIME_YJS_REMOTE_ORIGIN
      );
      if (cachedDocument.needsFlush && !this.readOnly) {
        this.pendingDocumentUpdates.push(cachedDocument.update);
      }
      logRealtimeYjs("hydrated local document cache", {
        byteLength: cachedDocument.update.byteLength,
        needsFlush: cachedDocument.needsFlush,
      });
    } catch (error) {
      console.error(
        "[RealtimeYjs] failed to hydrate local document cache",
        error
      );
    }
  }

  private persistLocalDocument(needsFlush: boolean) {
    const update = Y.encodeStateAsUpdate(this.doc);
    this.persistencePromise = this.persistencePromise
      .catch(() => undefined)
      .then(() =>
        LocalYjsDocumentStore.save(this.blockPackId, update, needsFlush)
      )
      .catch(error => {
        console.error(
          "[RealtimeYjs] failed to persist local document cache",
          error
        );
      });
    return this.persistencePromise;
  }

  private announceLocalAwarenessState() {
    const send = this.send;
    const localState = this.awareness.getLocalState();
    if (send === null || localState === null) return;

    const payload = encodeAwarenessUpdate(this.awareness, [
      this.awareness.clientID,
    ]);
    logRealtimeYjs("announcing local awareness state", {
      clientId: this.awareness.clientID,
      byteLength: payload.byteLength,
    });
    send(RealtimeBinaryFrameType.Awareness, payload);
  }

  private announceLocalAwarenessRemoval() {
    if (this.awareness.getLocalState() === null) return;
    logRealtimeYjs("announcing local awareness removal", {
      clientId: this.awareness.clientID,
    });
    removeAwarenessStates(
      this.awareness,
      [this.awareness.clientID],
      NOTEZY_REALTIME_YJS_LOCAL_AWARENESS_REMOVAL_ORIGIN
    );
  }

  private clearRemoteAwarenessStates() {
    const remoteClientIds = Array.from(
      this.awareness.getStates().keys()
    ).filter(clientId => clientId !== this.awareness.clientID);
    if (remoteClientIds.length === 0) return;

    logRealtimeYjs("clearing remote awareness states", {
      clientIds: remoteClientIds,
    });
    removeAwarenessStates(
      this.awareness,
      remoteClientIds,
      NOTEZY_REALTIME_YJS_REMOTE_ORIGIN
    );
  }
}
