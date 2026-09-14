export const OAuthActions = ["register", "login", "binding"] as const;

export type OAuthAction = (typeof OAuthActions)[number];

export interface PendingOAuthState {
  state: string;
  action: OAuthAction;
  createdAt: number;
}
