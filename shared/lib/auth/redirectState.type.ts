export const OAuthActions = ["register", "login", "binding"] as const;

export type OAuthAction = (typeof OAuthActions)[number];

export interface PendingOAuthState {
  state: string;
  action: OAuthAction;
  createdAt: number;
}

export const oauthStatePattern = /^[0-9a-f]{64}$/;

export const isOAuthAction = (value: unknown): value is OAuthAction =>
  OAuthActions.includes(value as OAuthAction);

export const isPendingOAuthState = (
  value: unknown
): value is PendingOAuthState => {
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
