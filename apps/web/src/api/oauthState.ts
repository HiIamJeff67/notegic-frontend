const configuredOAuthStateTtlMs = Number.parseInt(
  import.meta.env.VITE_OAUTH_STATE_TTL_MS ?? "",
  10
);

export const OAUTH_STATE_TTL_MS =
  configuredOAuthStateTtlMs > 0 ? configuredOAuthStateTtlMs : 5 * 60 * 1000;
