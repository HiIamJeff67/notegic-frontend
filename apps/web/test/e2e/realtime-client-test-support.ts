import { RealtimeClient } from "@/api/websocketClient";
import { NotegicAPIError, NotegicException } from "@shared/api/exceptions";
import { RealtimePermission } from "@shared/api/interfaces/enums";
import type {
  RealtimeBlockPackChannelTicket,
  RealtimeConnectionTicket,
} from "@shared/api/websocket";

export class RealtimeTestSocket {
  static CONNECTING = 0;
  static OPEN = 1;
  static CLOSING = 2;
  static CLOSED = 3;
  static instances: RealtimeTestSocket[] = [];

  readyState = RealtimeTestSocket.CONNECTING;
  binaryType = "arraybuffer";
  autoPong = true;
  sent: (string | ArrayBuffer)[] = [];
  onopen: ((event: Event) => void) | null = null;
  onerror: ((event: Event) => void) | null = null;
  onclose: ((event: CloseEvent) => void) | null = null;
  onmessage: ((event: MessageEvent) => void) | null = null;

  constructor() {
    RealtimeTestSocket.instances.push(this);
  }

  open() {
    this.readyState = RealtimeTestSocket.OPEN;
    this.onopen?.(new Event("open"));
    this.message({
      version: 1,
      type: "ready",
      connectionId: `connection-${RealtimeTestSocket.instances.indexOf(this)}`,
      resubscribeRequired: true,
    });
  }

  message(frame: unknown) {
    this.onmessage?.(
      new MessageEvent("message", { data: JSON.stringify(frame) })
    );
  }

  send(data: string | ArrayBuffer) {
    this.sent.push(data);
    if (typeof data !== "string" || !this.autoPong) return;
    const frame = JSON.parse(data);
    if (frame.type === "ping") {
      queueMicrotask(() => {
        this.message({ version: 1, type: "pong", requestId: frame.requestId });
      });
    }
  }

  close() {
    this.readyState = RealtimeTestSocket.CLOSED;
  }
}

export const expiredRealtimeSession = () =>
  new NotegicAPIError(
    new NotegicException(
      {
        reason: "InvalidSession",
        domain: "Auth",
        operation: "VerifySession",
        message: "Fixture session expired",
        retryable: false,
      },
      401
    )
  );

export const createRealtimeExample = (
  socketImplementation = RealtimeTestSocket as unknown as typeof WebSocket
) => {
  RealtimeTestSocket.instances = [];
  window.WebSocket = socketImplementation;
  const events = {
    states: [] as string[],
    errors: [] as string[],
    authFailures: 0,
    reconnects: 0,
    ticketRequests: 0,
    binaryFrames: 0,
    subscriptions: 0,
  };
  const connectionTickets: (() => Promise<RealtimeConnectionTicket>)[] = [];
  const channelTickets: (() => Promise<RealtimeBlockPackChannelTicket>)[] = [];
  const ticket = (): RealtimeConnectionTicket => ({
    connectionTicket: `fixture-ticket-${events.ticketRequests}`,
    expiresAt: new Date(Date.now() + 300_000),
    realtimeEndpoint: "fixture-realtime",
    realtimeProtocolVersion: 1,
  });
  const client = new RealtimeClient({
    getConnectionTicket: () => {
      events.ticketRequests += 1;
      return connectionTickets.shift()?.() ?? Promise.resolve(ticket());
    },
    getBlockPackChannelTicket: () => {
      const next = channelTickets.shift();
      if (!next) return Promise.reject(new Error("Missing fixture ticket"));
      return next();
    },
    onState: state => events.states.push(state),
    onError: error => events.errors.push(String(error)),
    onAuthFailure: () => events.authFailures++,
    onReconnect: () => events.reconnects++,
    onChannelBinary: () => events.binaryFrames++,
    onChannelSubscribed: () => events.subscriptions++,
  });
  return {
    client,
    sockets: RealtimeTestSocket.instances,
    events,
    connectionTickets,
    channelTickets,
    ticket,
    expiredRealtimeSession,
    permission: RealtimePermission.Write,
  };
};

export type RealtimeExample = ReturnType<typeof createRealtimeExample>;
