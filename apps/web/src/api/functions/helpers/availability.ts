// Vite replaces this exact expression. Jest leaves it unset, so unit tests stay remote.
export const isVirtualMode = (): boolean =>
  process.env.NOTEGIC_VITE_MODE === "virtual";

export const isRemoteUnavailable = (): boolean =>
  isVirtualMode() ||
  (typeof navigator !== "undefined" && navigator.onLine === false);
