import { RealtimeBinaryFrameType } from "@shared/api/websocket/types";
import { LocalYjsDocumentStore } from "@shared/lib/blockpack/localYjsDocumentStore";
import type { UUID } from "crypto";
import {
  Awareness,
  applyAwarenessUpdate,
  encodeAwarenessUpdate,
  removeAwarenessStates,
} from "y-protocols/awareness";
import * as Y from "yjs";

export const NOTEGIC_BLOCK_PACK_CHANNEL_TYPE = "BlockPack";
export const NOTEGIC_BLOCKNOTE_DOCUMENT_SCHEMA_ID = "notegic.blocknote";
export const NOTEGIC_BLOCKNOTE_DOCUMENT_SCHEMA_VERSION = 1 as const;
export const NOTEGIC_BLOCKNOTE_YJS_FRAGMENT_NAME = "document-store";
export const NOTEGIC_REALTIME_YJS_REMOTE_ORIGIN = Symbol(
  "notegic-realtime-remote"
);
export const NOTEGIC_REALTIME_YJS_LOCAL_AWARENESS_REMOVAL_ORIGIN = Symbol(
  "notegic-awareness-local-removal"
);
export const NOTEGIC_REALTIME_YJS_DOCUMENT_DEBOUNCE_MS = 100;

export class BlockPackYjsCoordinator {
  readonly awareness: Awareness;

  private send:
    | ((type: RealtimeBinaryFrameType, payload: Uint8Array) => boolean)
    | null = null;
  private readOnly = false;
  private hasLocalUpdates = false;
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
    this.hasLocalUpdates = true;
    this.pendingDocumentUpdates.push(update);
    void this.persistLocalDocument(true);
    if (this.send === null) return;

    this.clearDocumentFlushTimeout();
    this.documentFlushTimeout = setTimeout(() => {
      this.documentFlushTimeout = null;
      void this.flushPendingDocumentUpdates();
    }, NOTEGIC_REALTIME_YJS_DOCUMENT_DEBOUNCE_MS);
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
    ].filter(clientId => clientId === this.awareness.clientID);
    if (changedClients.length === 0 || this.send === null) return;
    this.send(
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
    void this.flushPendingDocumentUpdates();
    void this.hydrationPromise.then(() => this.flushPendingDocumentUpdates());
    const localState = this.awareness.getLocalState();
    if (localState !== null) {
      // A previous attachment may have published a removal at this clock.
      this.awareness.setLocalState(localState);
    }
  }

  disconnect() {
    this.clearDocumentFlushTimeout();
    if (this.send !== null && !this.readOnly && this.hasLocalUpdates) {
      // Replay local state idempotently, including deletes not represented by a state vector.
      this.pendingDocumentUpdates.push(Y.encodeStateAsUpdate(this.doc));
    }
    this.send = null;
    const remoteClientIds = Array.from(
      this.awareness.getStates().keys()
    ).filter(clientId => clientId !== this.awareness.clientID);
    if (remoteClientIds.length > 0) {
      removeAwarenessStates(
        this.awareness,
        remoteClientIds,
        NOTEGIC_REALTIME_YJS_REMOTE_ORIGIN
      );
    }
  }

  flushPendingDocumentUpdatesNow() {
    this.clearDocumentFlushTimeout();
    return this.flushPendingDocumentUpdates();
  }

  async clearLocalDocument() {
    this.setReadOnly(true);
    await this.hydrationPromise;
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
    if (this.awareness.getLocalState() !== null) {
      removeAwarenessStates(
        this.awareness,
        [this.awareness.clientID],
        NOTEGIC_REALTIME_YJS_LOCAL_AWARENESS_REMOVAL_ORIGIN
      );
    }
    this.disconnect();
    this.pendingDocumentUpdates.length = 0;
    this.doc.off("update", this.handleDocUpdate);
    this.awareness.off("update", this.handleAwarenessUpdate);
    this.awareness.destroy();
  }

  private clearDocumentFlushTimeout() {
    if (this.documentFlushTimeout === null) return;
    clearTimeout(this.documentFlushTimeout);
    this.documentFlushTimeout = null;
  }

  private async flushPendingDocumentUpdates() {
    const send = this.send;
    if (this.readOnly) {
      this.pendingDocumentUpdates.length = 0;
      return;
    }
    if (send === null || this.pendingDocumentUpdates.length === 0) return;

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
        this.hasLocalUpdates = true;
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
}
