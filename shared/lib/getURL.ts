/* ============================== Search Params ============================== */

export const getOAuthGoogleSearchParamsString = (state: string): string => {
  const config = {
    redirect_uri: import.meta.env.VITE_OAUTH_GOOGLE_REDIRECT_URL,
    client_id: import.meta.env.VITE_OAUTH_GOOGLE_CLIENT_ID,
    access_type: "offline",
    response_type: "code",
    prompt: "consent",
    scope: [
      "https://www.googleapis.com/auth/userinfo.profile",
      "https://www.googleapis.com/auth/userinfo.email",
    ].join(" "),
    state: state,
  };

  return new URLSearchParams(config as Record<string, string>).toString();
};

export const getOAuthXSearchParamsString = (
  state: string,
  codeChallenge: string
): string => {
  const config = {
    response_type: "code",
    redirect_uri: import.meta.env.VITE_OAUTH_X_REDIRECT_URL,
    client_id:
      import.meta.env.VITE_OAUTH_X_CLIENT_ID ||
      import.meta.env.VITE_OAUTH_X_CONSUMER_KEY,
    scope: "tweet.read users.read offline.access",
    state: state,
    code_challenge: codeChallenge,
    code_challenge_method: "S256",
  };

  return new URLSearchParams(config as Record<string, string>).toString();
};
