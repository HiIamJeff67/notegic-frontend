import {
  RealtimePermission,
  RealtimePermissionSchema,
} from "@shared/api/interfaces/enums";
import { getRealtimeWebSocketURL } from "@shared/api/url";
import type { z } from "zod";
import {
  encodeRealtimeBinaryFrame,
  encodeRealtimePingFrame,
  encodeRealtimeSubscribeFrame,
  encodeRealtimeUnsubscribeFrame,
  parseRealtimeBinaryFrame,
  parseRealtimeServerFrame,
  type RealtimeBinaryFrame,
  RealtimeBinaryFrameType,
  type RealtimeBlockPackChannelStatus,
  type RealtimeBlockPackChannelTicket,
  type RealtimeConnectionState,
  type RealtimeConnectionTicket,
  type RealtimeErrorFrame,
  type RealtimeNotificationFrame,
  type RealtimePresenceFrame,
  type RealtimeRegisteredChannel,
  type RealtimeResourceEventFrame,
  type RealtimeRoutineTaskLifecycleFrame,
  type RealtimeSubscribedFrame,
} from "@shared/api/websocket/types";

type RealtimeClientOptions = {
  getConnectionTicket: () => Promise<RealtimeConnectionTicket>;
  getBlockPackChannelTicket: (
    blockPackId: string,
    permission: z.infer<typeof RealtimePermissionSchema>
  ) => Promise<RealtimeBlockPackChannelTicket>;
  onState?: (state: RealtimeConnectionState) => void;
  onReady?: (connectionId: string) => void;
  onReconnect?: (connectionId: string) => void;
  onChannelStatus?: (
    blockPackId: string,
    status: RealtimeBlockPackChannelStatus
  ) => void;
  onChannelSubscribed?: (
    blockPackId: string,
    frame: RealtimeSubscribedFrame,
    permission: z.infer<typeof RealtimePermissionSchema>
  ) => void;
  onChannelTicket?: (
    blockPackId: string,
    ticket: RealtimeBlockPackChannelTicket
  ) => void;
  onChannelBinary?: (blockPackId: string, frame: RealtimeBinaryFrame) => void;
  onChannelError?: (blockPackId: string, frame: RealtimeErrorFrame) => void;
  onPresence?: (blockPackId: string, frame: RealtimePresenceFrame) => void;
  onResourceEvent?: (frame: RealtimeResourceEventFrame) => void;
  onNotification?: (frame: RealtimeNotificationFrame) => void;
  onRoutineTaskLifecycle?: (frame: RealtimeRoutineTaskLifecycleFrame) => void;
  onError?: (error: unknown) => void;
};

const logRealtimeClient = (message: string, data?: Record<string, unknown>) => {
  if (import.meta.env.DEV) {
    console.debug(`[RealtimeClient] ${message}`, data ?? "");
  }
};

const serverDetachedChannelCodes = new Set<RealtimeErrorFrame["code"]>([
  "permission_revoked",
  "resource_unavailable",
  "resync_required",
  "channel_backpressure",
  "worker_unavailable",
  "block_pack_quota_exceeded",
]);

export class RealtimeClient {
  private socket: WebSocket | null = null;
  private reconnectTimeout: ReturnType<typeof setTimeout> | null = null;
  private reconnectAttempt = 0;
  private shouldReconnect = false;
  private readonly channels = new Map<string, RealtimeRegisteredChannel>();
  private readonly channelByConnectorId = new Map<number, string>();
  private readonly channelByRequestId = new Map<string, string>();
  private readonly seenResourceEventIds = new Set<string>();
  private readonly seenResourceEventOrder: string[] = [];
  private readonly seenRoutineTaskLifecycleEventIds = new Set<string>();
  private hasEstablishedConnection = false;
  private readonly textEncoder = new TextEncoder();

  private static readonly MaxSeenResourceEvents = 2048;

  constructor(private readonly options: RealtimeClientOptions) {}

  start() {
    if (this.socket !== null || this.shouldReconnect) return;
    this.shouldReconnect = true;
    void this.connect();
  }

  stop() {
    this.shouldReconnect = false;
    this.hasEstablishedConnection = false;
    this.seenResourceEventIds.clear();
    this.seenResourceEventOrder.length = 0;
    this.seenRoutineTaskLifecycleEventIds.clear();
    if (this.reconnectTimeout !== null) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
    for (const channel of this.channels.values()) {
      channel.connectorChannelId = null;
      channel.pendingRequestId = null;
      channel.ticketRetryCount = 0;
    }
    this.channelByConnectorId.clear();
    this.channelByRequestId.clear();
    if (this.socket !== null) {
      const socket = this.socket;
      this.socket = null;
      socket.close(1000, "Realtime root client stopped.");
    }
    this.options.onState?.("closed");
  }

  registerBlockPackChannel(
    blockPackId: string,
    permission: z.infer<typeof RealtimePermissionSchema>
  ) {
    const existing = this.channels.get(blockPackId);
    if (existing) {
      const previousPermission = existing.permission;
      existing.permission = permission;
      logRealtimeClient("register existing block pack channel", {
        blockPackId,
        permission,
        previousPermission,
        connectorChannelId: existing.connectorChannelId,
        pendingRequestId: existing.pendingRequestId,
      });
      if (
        existing.connectorChannelId !== null &&
        previousPermission !== permission
      ) {
        this.unregisterBlockPackChannel(blockPackId);
        this.registerBlockPackChannel(blockPackId, permission);
        return;
      }
      if (existing.resyncRequired) return;
      if (
        existing.connectorChannelId === null &&
        existing.pendingRequestId === null
      ) {
        void this.subscribeBlockPackChannel(existing);
      }
      return;
    }

    const channel: RealtimeRegisteredChannel = {
      blockPackId,
      permission,
      connectorChannelId: null,
      pendingRequestId: null,
      ticketRetryCount: 0,
      resyncRequired: false,
      documentQuotaPolicyVersion: null,
      maximumBlockCount: null,
    };
    this.channels.set(blockPackId, channel);
    logRealtimeClient("register block pack channel", {
      blockPackId,
      permission,
    });
    void this.subscribeBlockPackChannel(channel);
  }

  unregisterBlockPackChannel(blockPackId: string) {
    const channel = this.channels.get(blockPackId);
    if (!channel) return;

    const connectorChannelId = channel.connectorChannelId;
    const pendingRequestId = channel.pendingRequestId;
    if (
      connectorChannelId !== null &&
      pendingRequestId === null &&
      this.isSocketOpen()
    ) {
      this.sendControlFrame(
        "unsubscribe",
        encodeRealtimeUnsubscribeFrame({
          requestId: this.createRequestId("unsubscribe"),
          connectorChannelId,
        })
      );
      this.channelByConnectorId.delete(connectorChannelId);
    }
    if (connectorChannelId !== null) {
      this.channelByConnectorId.delete(connectorChannelId);
    }
    if (pendingRequestId !== null) {
      this.channelByRequestId.delete(pendingRequestId);
    }
    channel.connectorChannelId = null;
    channel.pendingRequestId = null;
    channel.resyncRequired = false;
    this.channels.delete(blockPackId);
    this.options.onChannelStatus?.(blockPackId, "unsubscribed");
  }

  resetBlockPackChannel(blockPackId: string) {
    const channel = this.channels.get(blockPackId);
    if (!channel) return;

    if (channel.connectorChannelId !== null) {
      this.channelByConnectorId.delete(channel.connectorChannelId);
    }
    if (channel.pendingRequestId !== null) {
      this.channelByRequestId.delete(channel.pendingRequestId);
    }
    channel.connectorChannelId = null;
    channel.pendingRequestId = null;
    channel.ticketRetryCount = 0;
    channel.resyncRequired = false;
    this.channels.delete(blockPackId);
  }

  sendBlockPackBinary(
    blockPackId: string,
    type: RealtimeBinaryFrameType,
    payload: Uint8Array
  ): boolean {
    const channel = this.channels.get(blockPackId);
    if (!channel) {
      logRealtimeClient("skip binary send: channel not registered", {
        blockPackId,
        type,
        byteLength: payload.byteLength,
      });
      return false;
    }
    if (channel.resyncRequired) {
      logRealtimeClient("skip binary send: channel requires explicit resync", {
        blockPackId,
        type,
        byteLength: payload.byteLength,
      });
      return false;
    }
    if (channel.connectorChannelId === null) {
      logRealtimeClient("skip binary send: channel not subscribed", {
        blockPackId,
        type,
        byteLength: payload.byteLength,
      });
      return false;
    }
    if (!this.isSocketOpen()) {
      logRealtimeClient("skip binary send: socket not open", {
        blockPackId,
        type,
        byteLength: payload.byteLength,
      });
      return false;
    }
    if (
      channel.permission === RealtimePermission.Read &&
      type === RealtimeBinaryFrameType.YjsDocument
    ) {
      logRealtimeClient("skip binary send: read-only channel", {
        blockPackId,
        type,
        byteLength: payload.byteLength,
      });
      return false;
    }

    logRealtimeClient("send binary frame", {
      blockPackId,
      connectorChannelId: channel.connectorChannelId,
      type,
      byteLength: payload.byteLength,
    });
    this.sendBinaryFrame(
      encodeRealtimeBinaryFrame({
        type,
        connectorChannelId: channel.connectorChannelId,
        payload,
      })
    );
    return true;
  }

  private async connect() {
    if (typeof WebSocket === "undefined" || !this.shouldReconnect) return;

    this.options.onState?.(
      this.reconnectAttempt > 0 ? "reconnecting" : "connecting"
    );

    try {
      const ticket = await this.options.getConnectionTicket();
      if (!this.shouldReconnect) return;

      const socket = new WebSocket(
        getRealtimeWebSocketURL(ticket.realtimeEndpoint),
        ticket.connectionTicket
      );
      socket.binaryType = "arraybuffer";
      this.socket = socket;

      socket.onopen = () => {
        this.options.onState?.("open");
      };

      socket.onmessage = event => {
        this.handleMessage(event);
      };

      socket.onerror = event => {
        this.options.onState?.("error");
        this.options.onError?.(event);
      };

      socket.onclose = () => {
        if (this.socket === socket) this.socket = null;
        this.clearConnectorState();
        if (this.shouldReconnect) this.scheduleReconnect();
        else this.options.onState?.("closed");
      };
    } catch (error) {
      this.options.onState?.("error");
      this.options.onError?.(error);
      if (this.shouldReconnect) this.scheduleReconnect();
    }
  }

  private handleMessage(event: MessageEvent) {
    try {
      if (typeof event.data === "string") {
        this.handleControlMessage(event.data);
        return;
      }

      if (event.data instanceof ArrayBuffer) {
        const frame = parseRealtimeBinaryFrame(event.data);
        const blockPackId = this.channelByConnectorId.get(
          frame.connectorChannelId
        );
        if (blockPackId) {
          logRealtimeClient("received binary frame", {
            blockPackId,
            connectorChannelId: frame.connectorChannelId,
            type: frame.type,
            byteLength: frame.payload.byteLength,
          });
          this.options.onChannelBinary?.(blockPackId, frame);
        }
        return;
      }

      if (event.data instanceof Blob) {
        void event.data.arrayBuffer().then(buffer => {
          const frame = parseRealtimeBinaryFrame(buffer);
          const blockPackId = this.channelByConnectorId.get(
            frame.connectorChannelId
          );
          if (blockPackId) {
            logRealtimeClient("received binary frame", {
              blockPackId,
              connectorChannelId: frame.connectorChannelId,
              type: frame.type,
              byteLength: frame.payload.byteLength,
            });
            this.options.onChannelBinary?.(blockPackId, frame);
          }
        });
      }
    } catch (error) {
      this.options.onError?.(error);
    }
  }

  private handleControlMessage(data: string) {
    const frame = parseRealtimeServerFrame(data);

    switch (frame.type) {
      case "ready":
        if (this.hasEstablishedConnection) {
          this.options.onReconnect?.(frame.connectionId);
        }
        this.hasEstablishedConnection = true;
        this.reconnectAttempt = 0;
        logRealtimeClient("received ready frame", {
          connectionId: frame.connectionId,
          registeredChannels: this.channels.size,
        });
        this.options.onState?.("ready");
        this.options.onReady?.(frame.connectionId);
        this.sendControlFrame(
          "ping",
          encodeRealtimePingFrame(this.createRequestId("ping"))
        );
        if (frame.resubscribeRequired) {
          this.clearConnectorState();
        }
        for (const channel of this.channels.values()) {
          if (
            !channel.resyncRequired &&
            (frame.resubscribeRequired || channel.connectorChannelId === null)
          ) {
            void this.subscribeBlockPackChannel(channel);
          }
        }
        break;
      case "pong":
        this.options.onState?.("connected");
        break;
      case "subscribed":
        this.handleSubscribed(frame);
        break;
      case "resource-event":
        this.handleResourceEvent(frame);
        break;
      case "notification":
        this.options.onNotification?.(frame);
        break;
      case "routine-task-lifecycle":
        if (this.seenRoutineTaskLifecycleEventIds.has(frame.eventId)) break;
        this.seenRoutineTaskLifecycleEventIds.add(frame.eventId);
        this.options.onRoutineTaskLifecycle?.(frame);
        break;
      case "presence-joined":
      case "presence-left":
      case "presence-updated":
        this.options.onPresence?.(frame.channelId, frame);
        break;
      case "unsubscribed":
        this.channelByConnectorId.delete(frame.connectorChannelId);
        break;
      case "error":
        this.handleServerError(frame);
        break;
      case "heartbeat":
      case "ack":
      case "acknowledged":
        break;
    }
  }

  private async subscribeBlockPackChannel(channel: RealtimeRegisteredChannel) {
    if (!this.isSocketOpen()) {
      logRealtimeClient("delay subscribe: socket not open", {
        blockPackId: channel.blockPackId,
        permission: channel.permission,
      });
      return;
    }
    if (channel.resyncRequired) {
      logRealtimeClient("skip subscribe: explicit resync required", {
        blockPackId: channel.blockPackId,
      });
      return;
    }
    if (channel.pendingRequestId !== null) {
      logRealtimeClient("skip subscribe: request already pending", {
        blockPackId: channel.blockPackId,
        pendingRequestId: channel.pendingRequestId,
      });
      return;
    }
    if (channel.connectorChannelId !== null) {
      logRealtimeClient("skip subscribe: channel already subscribed", {
        blockPackId: channel.blockPackId,
        connectorChannelId: channel.connectorChannelId,
      });
      return;
    }

    const requestId = this.createRequestId("subscribe");
    channel.pendingRequestId = requestId;
    this.options.onChannelStatus?.(channel.blockPackId, "ticketing");
    try {
      const ticket = await this.options.getBlockPackChannelTicket(
        channel.blockPackId,
        channel.permission
      );
      if (
        !this.isSocketOpen() ||
        !this.channels.has(channel.blockPackId) ||
        channel.pendingRequestId !== requestId
      )
        return;

      const requestedPermission = channel.permission;
      channel.permission = ticket.permission;
      channel.documentQuotaPolicyVersion = ticket.documentQuotaPolicyVersion;
      channel.maximumBlockCount = ticket.maximumBlockCount;
      this.options.onChannelTicket?.(channel.blockPackId, ticket);
      this.channelByRequestId.set(requestId, channel.blockPackId);
      this.options.onChannelStatus?.(channel.blockPackId, "subscribing");
      logRealtimeClient("send subscribe frame", {
        blockPackId: channel.blockPackId,
        requestId,
        requestedPermission,
        grantedPermission: channel.permission,
      });
      this.sendControlFrame(
        "subscribe",
        encodeRealtimeSubscribeFrame({
          requestId,
          channelId: ticket.channelId,
          channelTicket: ticket.channelTicket,
        })
      );
    } catch (error) {
      if (channel.pendingRequestId === requestId) {
        channel.pendingRequestId = null;
      }
      this.channelByRequestId.delete(requestId);
      this.options.onChannelStatus?.(channel.blockPackId, "error");
      this.options.onError?.(error);
    }
  }

  private handleSubscribed(frame: RealtimeSubscribedFrame) {
    const blockPackId =
      frame.requestId !== undefined
        ? this.channelByRequestId.get(frame.requestId)
        : frame.channelId;
    if (!blockPackId) return;
    const channel = this.channels.get(blockPackId);
    if (!channel) return;
    if (
      frame.requestId !== undefined &&
      channel.pendingRequestId !== frame.requestId
    ) {
      logRealtimeClient("ignore stale subscribed frame", {
        blockPackId,
        requestId: frame.requestId,
        pendingRequestId: channel.pendingRequestId,
      });
      return;
    }

    if (channel.pendingRequestId) {
      this.channelByRequestId.delete(channel.pendingRequestId);
    }
    channel.pendingRequestId = null;
    channel.connectorChannelId = frame.connectorChannelId;
    channel.ticketRetryCount = 0;
    this.channelByConnectorId.set(frame.connectorChannelId, blockPackId);
    logRealtimeClient("received subscribed frame", {
      blockPackId,
      connectorChannelId: frame.connectorChannelId,
      permission: channel.permission,
    });
    this.options.onChannelStatus?.(
      blockPackId,
      channel.permission === RealtimePermission.Read ? "readOnly" : "subscribed"
    );
    this.options.onChannelSubscribed?.(blockPackId, frame, channel.permission);
  }

  private handleResourceEvent(frame: RealtimeResourceEventFrame) {
    if (this.seenResourceEventIds.has(frame.eventId)) return;

    this.seenResourceEventIds.add(frame.eventId);
    this.seenResourceEventOrder.push(frame.eventId);
    while (
      this.seenResourceEventOrder.length > RealtimeClient.MaxSeenResourceEvents
    ) {
      const oldestEventId = this.seenResourceEventOrder.shift();
      if (oldestEventId) this.seenResourceEventIds.delete(oldestEventId);
    }

    this.options.onResourceEvent?.(frame);
  }

  private handleServerError(frame: RealtimeErrorFrame) {
    const blockPackId =
      frame.channelId ??
      (frame.connectorChannelId !== undefined
        ? this.channelByConnectorId.get(frame.connectorChannelId)
        : undefined) ??
      (frame.requestId
        ? this.channelByRequestId.get(frame.requestId)
        : undefined);

    if (!blockPackId) {
      if (frame.code === "channel_not_found") {
        logRealtimeClient("ignore channel_not_found for detached channel", {
          connectorChannelId: frame.connectorChannelId,
          requestId: frame.requestId,
        });
        return;
      }
      this.options.onError?.(frame);
      return;
    }

    if (
      (frame.code === "ticket_already_used" ||
        frame.code === "invalid_channel_ticket") &&
      this.channels.get(blockPackId)?.ticketRetryCount === 0
    ) {
      const channel = this.channels.get(blockPackId);
      if (channel) {
        if (channel.connectorChannelId !== null) {
          this.channelByConnectorId.delete(channel.connectorChannelId);
          channel.connectorChannelId = null;
        }
        if (channel.pendingRequestId) {
          this.channelByRequestId.delete(channel.pendingRequestId);
        }
        channel.pendingRequestId = null;
        channel.ticketRetryCount = 1;
        this.options.onChannelStatus?.(blockPackId, "ticketing");
        queueMicrotask(() => {
          void this.subscribeBlockPackChannel(channel);
        });
        return;
      }
    }

    if (frame.code === "channel_not_found") {
      const channel = this.channels.get(blockPackId);
      if (channel) {
        if (channel.connectorChannelId !== null) {
          this.channelByConnectorId.delete(channel.connectorChannelId);
        }
        if (channel.pendingRequestId !== null) {
          this.channelByRequestId.delete(channel.pendingRequestId);
        }
        channel.connectorChannelId = null;
        channel.pendingRequestId = null;
      }
      this.options.onChannelError?.(blockPackId, frame);
      return;
    }

    if (serverDetachedChannelCodes.has(frame.code)) {
      const channel = this.channels.get(blockPackId);
      const connectorChannelId = frame.connectorChannelId ?? null;
      if (connectorChannelId !== null)
        this.channelByConnectorId.delete(connectorChannelId);
      if (channel) {
        if (channel.connectorChannelId !== null) {
          this.channelByConnectorId.delete(channel.connectorChannelId);
        }
        if (channel.pendingRequestId !== null) {
          this.channelByRequestId.delete(channel.pendingRequestId);
        }
        channel.connectorChannelId = null;
        channel.pendingRequestId = null;
        channel.ticketRetryCount = 0;
        channel.resyncRequired = true;
      }
    }

    this.options.onChannelStatus?.(blockPackId, "error");
    this.options.onChannelError?.(blockPackId, frame);
  }

  private clearConnectorState() {
    this.channelByConnectorId.clear();
    this.channelByRequestId.clear();
    for (const channel of this.channels.values()) {
      channel.connectorChannelId = null;
      channel.pendingRequestId = null;
      channel.ticketRetryCount = 0;
      this.options.onChannelStatus?.(channel.blockPackId, "idle");
    }
  }

  private scheduleReconnect() {
    this.options.onState?.("reconnecting");
    const delay = Math.min(500 * 2 ** this.reconnectAttempt, 10_000);
    this.reconnectAttempt += 1;
    this.reconnectTimeout = setTimeout(() => {
      this.reconnectTimeout = null;
      void this.connect();
    }, delay);
  }

  private isSocketOpen() {
    return this.socket?.readyState === WebSocket.OPEN;
  }

  private sendControlFrame(label: string, frame: Record<string, unknown>) {
    const payload = JSON.stringify(frame);
    logRealtimeClient("send control frame", {
      label,
      byteLength: this.textEncoder.encode(payload).byteLength,
      preview: payload,
    });
    this.socket?.send(payload);
  }

  private sendBinaryFrame(payload: ArrayBuffer) {
    logRealtimeClient("send encoded binary frame", {
      byteLength: payload.byteLength,
    });
    this.socket?.send(payload);
  }

  private createRequestId(prefix: string) {
    return typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `realtime-${prefix}-${Date.now()}-${Math.random()}`;
  }
}
