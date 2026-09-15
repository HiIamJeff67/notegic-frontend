const turnstileTokenStorageKey = "notegic_turnstile_token";

type TurnstileDebugDetails = Record<
  string,
  boolean | number | string | null | undefined
>;

export const debugTurnstile = (
  message: string,
  details: TurnstileDebugDetails = {}
): void => {
  console.debug(`[Turnstile] ${message}`, details);
};

export const isTurnstileEnabled = (): boolean => {
  const siteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY?.trim();
  const enabled = Boolean(siteKey);

  debugTurnstile("configuration checked", {
    enabled,
    siteKeyPresent: enabled,
    siteKeyLength: siteKey?.length ?? 0,
  });

  return enabled;
};

export const getTurnstileToken = (): string | null => {
  if (typeof window === "undefined") {
    debugTurnstile("read skipped because window is unavailable");
    return null;
  }

  const token = window.sessionStorage.getItem(turnstileTokenStorageKey);
  debugTurnstile("token read from session storage", {
    tokenPresent: Boolean(token),
    tokenLength: token?.length ?? 0,
  });
  return token;
};

export const setTurnstileToken = (token: string): void => {
  if (typeof window === "undefined") {
    debugTurnstile("token write skipped because window is unavailable");
    return;
  }

  debugTurnstile("writing token to session storage", {
    tokenPresent: Boolean(token),
    tokenLength: token.length,
  });
  window.sessionStorage.setItem(turnstileTokenStorageKey, token);
  debugTurnstile("token write completed", {
    tokenPresent: Boolean(
      window.sessionStorage.getItem(turnstileTokenStorageKey)
    ),
  });
};

export const clearTurnstileToken = (): void => {
  if (typeof window === "undefined") {
    debugTurnstile("token clear skipped because window is unavailable");
    return;
  }

  debugTurnstile("clearing token from session storage");
  window.sessionStorage.removeItem(turnstileTokenStorageKey);
  debugTurnstile("token clear completed", {
    tokenPresent: Boolean(
      window.sessionStorage.getItem(turnstileTokenStorageKey)
    ),
  });
};
