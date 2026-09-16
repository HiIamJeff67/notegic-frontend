const turnstileTokenStorageKey = "notegic_turnstile_token";

export const isTurnstileEnabled = (): boolean =>
  Boolean(import.meta.env.VITE_TURNSTILE_SITE_KEY?.trim());

export const getTurnstileToken = (): string | null => {
  if (typeof window === "undefined") return null;
  return window.sessionStorage.getItem(turnstileTokenStorageKey);
};

export const setTurnstileToken = (token: string): void => {
  if (typeof window === "undefined") return;
  window.sessionStorage.setItem(turnstileTokenStorageKey, token);
};

export const clearTurnstileToken = (): void => {
  if (typeof window === "undefined") return;
  window.sessionStorage.removeItem(turnstileTokenStorageKey);
};
