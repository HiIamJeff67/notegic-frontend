export type RealtimeConnectionState =
  | "idle"
  | "connecting"
  | "open"
  | "ready"
  | "pinging"
  | "connected"
  | "reconnecting"
  | "closed"
  | "error";
