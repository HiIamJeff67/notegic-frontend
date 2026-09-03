import { RealtimeBinaryFrameType } from "@shared/api/websocket/types";
import {
  NOTEGIC_REALTIME_YJS_DOCUMENT_DEBOUNCE_MS,
  NOTEGIC_REALTIME_YJS_LOCAL_AWARENESS_REMOVAL_ORIGIN,
  NOTEGIC_REALTIME_YJS_REMOTE_ORIGIN,
} from "@shared/blockpack/contract";
import { LocalYjsDocumentStore } from "@shared/blockpack/localYjsDocumentStore";
import type { UUID } from "crypto";
import {
  Awareness,
  applyAwarenessUpdate,
  encodeAwarenessUpdate,
  removeAwarenessStates,
} from "y-protocols/awareness";
import * as Y from "yjs";

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
  private readonly userPublicId: string | null;
  private readonly hydrationPromise: Promise<void>;
  private readonly handleDocUpdate = (update: Uint8Array, origin: unknown) => {
    if (origin === NOTEGIC_REALTIME_YJS_REMOTE_ORIGIN) return;
    if (this.readOnly) return;
    this.sendOrQueue(RealtimeBinaryFrameType.YjsDocument, update);
  };
  private readonly handleAwarenessUpdate = (
    changes: { added: number[]; updated: number[]; removed: number[] },
    origin: unknown
  ) => {
    if (origin === NOTEGIC_REALTIME_YJS_REMOTE_ORIGIN) return;
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

  constructor(doc: Y.Doc, blockPackId: UUID, userPublicId: string | null) {
    this.doc = doc;
    this.blockPackId = blockPackId;
    this.userPublicId = userPublicId;
    this.awareness = new Awareness(doc);
    this.doc.on("update", this.handleDocUpdate);
    this.awareness.on("update", this.handleAwarenessUpdate);
    this.hydrationPromise = this.hydrateLocalDocument();
  }

  connect(
    send: (type: RealtimeBinaryFrameType, payload: Uint8Array) => boolean
  ) {
    this.send = send;
    this.flushPendingUpdates();
    void this.hydrationPromise.then(() => this.flushPendingUpdates());
    this.announceLocalAwarenessState();
  }

  disconnect() {
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
    await LocalYjsDocumentStore.remove(this.userPublicId, this.blockPackId);
  }

  async snapshotLocalDocument(): Promise<Uint8Array> {
    await this.hydrationPromise;
    await this.persistencePromise;
    return Y.encodeStateAsUpdate(this.doc);
  }

  hasUnconfirmedLocalChanges() {
    if (this.pendingDocumentUpdates.length > 0) return true;

    for (const [clientId, clock] of Y.decodeStateVector(
      Y.encodeStateVector(this.doc)
    )) {
      if (clock > (this.persistedDocumentStateVector.get(clientId) ?? 0)) {
        return true;
      }
    }

    return false;
  }

  setReadOnly(readOnly: boolean) {
    this.readOnly = readOnly;
    if (readOnly) {
      this.clearDocumentFlushTimeout();
      this.pendingDocumentUpdates.length = 0;
    }
  }

  applyDocumentUpdate(update: Uint8Array) {
    Y.applyUpdate(this.doc, update, NOTEGIC_REALTIME_YJS_REMOTE_ORIGIN);
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
    applyAwarenessUpdate(
      this.awareness,
      update,
      NOTEGIC_REALTIME_YJS_REMOTE_ORIGIN
    );
  }

  async destroy() {
    await this.flushPendingDocumentUpdatesNow();
    await this.persistencePromise;
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
      return;
    }

    this.send(type, payload);
  }

  private queueDocumentUpdate(payload: Uint8Array) {
    this.pendingDocumentUpdates.push(payload);
    void this.persistLocalDocument(true);

    if (this.send === null) {
      return;
    }

    this.scheduleDocumentFlush();
  }

  private scheduleDocumentFlush() {
    this.clearDocumentFlushTimeout();
    this.documentFlushTimeout = setTimeout(() => {
      this.documentFlushTimeout = null;
      this.flushPendingDocumentUpdates();
    }, NOTEGIC_REALTIME_YJS_DOCUMENT_DEBOUNCE_MS);
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
      const cachedDocument = await LocalYjsDocumentStore.load(
        this.userPublicId,
        this.blockPackId
      );
      if (!cachedDocument) return;
      Y.applyUpdate(
        this.doc,
        cachedDocument.update,
        NOTEGIC_REALTIME_YJS_REMOTE_ORIGIN
      );
      if (cachedDocument.needsFlush && !this.readOnly) {
        this.pendingDocumentUpdates.push(cachedDocument.update);
      }
      for (const [clientId, clock] of Y.decodeStateVector(
        cachedDocument.stateVector ??
          Y.encodeStateVectorFromUpdate(cachedDocument.update)
      ) ?? []) {
        if ((this.persistedDocumentStateVector.get(clientId) ?? 0) < clock) {
          this.persistedDocumentStateVector.set(clientId, clock);
        }
      }
    } catch (error) {
      console.error(
        "[RealtimeYjs] failed to hydrate local document cache",
        error
      );
    }
  }

  private persistLocalDocument(needsFlush: boolean) {
    const update = Y.encodeStateAsUpdate(this.doc);
    const stateVector = Y.encodeStateVector(this.doc);
    this.persistencePromise = this.persistencePromise
      .catch(() => undefined)
      .then(() =>
        LocalYjsDocumentStore.save(
          this.userPublicId,
          this.blockPackId,
          update,
          stateVector,
          needsFlush
        )
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
    send(RealtimeBinaryFrameType.Awareness, payload);
  }

  private announceLocalAwarenessRemoval() {
    if (this.awareness.getLocalState() === null) return;
    removeAwarenessStates(
      this.awareness,
      [this.awareness.clientID],
      NOTEGIC_REALTIME_YJS_LOCAL_AWARENESS_REMOVAL_ORIGIN
    );
  }

  private clearRemoteAwarenessStates() {
    const remoteClientIds = Array.from(
      this.awareness.getStates().keys()
    ).filter(clientId => clientId !== this.awareness.clientID);
    if (remoteClientIds.length === 0) return;

    removeAwarenessStates(
      this.awareness,
      remoteClientIds,
      NOTEGIC_REALTIME_YJS_REMOTE_ORIGIN
    );
  }
}
