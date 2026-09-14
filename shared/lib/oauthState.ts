import {
  OAuthActions,
  type OAuthAction,
  type PendingOAuthState,
} from "@shared/types/redirectState.type";
import { SessionStorageManipulator } from "@shared/lib/sessionStorageManipulator";
import { SessionStorageKey } from "@shared/types/sessionStorage.type";

const oauthStatePattern = /^[0-9a-f]{64}$/;

const removePendingOAuthState = (): void => {
  if (typeof window === "undefined") return;

  SessionStorageManipulator.removeItem(SessionStorageKey.pendingOAuthState);
};

const isOAuthAction = (value: unknown): value is OAuthAction =>
  OAuthActions.includes(value as OAuthAction);

const isPendingOAuthState = (value: unknown): value is PendingOAuthState => {
  if (typeof value !== "object" || value === null) return false;

  const pending = value as Partial<PendingOAuthState>;
  return (
    typeof pending.state === "string" &&
    oauthStatePattern.test(pending.state) &&
    isOAuthAction(pending.action) &&
    typeof pending.createdAt === "number" &&
    Number.isFinite(pending.createdAt)
  );
};

export const createOAuthState = (): string => {
  if (typeof window === "undefined") {
    throw new Error("OAuth state can only be created in a browser");
  }

  const bytes = new Uint8Array(32);
  window.crypto.getRandomValues(bytes);
  return Array.from(bytes, byte => byte.toString(16).padStart(2, "0")).join("");
};

export const savePendingOAuthState = (pending: PendingOAuthState): boolean => {
  if (typeof window === "undefined" || !isPendingOAuthState(pending)) {
    return false;
  }

  return SessionStorageManipulator.setItem(
    SessionStorageKey.pendingOAuthState,
    pending
  );
};

export const createPendingOAuthState = (action: OAuthAction): string | null => {
  const pending = {
    state: createOAuthState(),
    action,
    createdAt: Date.now(),
  } satisfies PendingOAuthState;

  return savePendingOAuthState(pending) ? pending.state : null;
};

export const getPendingOAuthState = (): PendingOAuthState | null => {
  if (typeof window === "undefined") return null;

  const pending: unknown = SessionStorageManipulator.getItemByKey(
    SessionStorageKey.pendingOAuthState
  );
  if (isPendingOAuthState(pending)) return pending;

  removePendingOAuthState();

  return null;
};

export const consumePendingOAuthState = (
  state: string | null,
  now: number = Date.now(),
  ttlMs: number
): PendingOAuthState | null => {
  const pending = getPendingOAuthState();

  removePendingOAuthState();

  if (
    pending === null ||
    state === null ||
    !oauthStatePattern.test(state) ||
    state !== pending.state ||
    pending.createdAt > now ||
    now - pending.createdAt > ttlMs
  ) {
    return null;
  }

  return pending;
};
