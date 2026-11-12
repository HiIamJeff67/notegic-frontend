let accessToken = "";

export const getAccessToken = (): string => accessToken;

export const setAccessToken = (token: string): void => {
  accessToken = token.trim();
};
