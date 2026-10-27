import { getClientCSRFToken, setClientCSRFToken } from "@/api/clientHeaders";

export const fetchServerFunction: typeof fetch = async (input, init) => {
  const token = getClientCSRFToken();
  const headers = new Headers(init?.headers);
  if (token) headers.set("X-CSRF-Token", token);
  else headers.delete("X-CSRF-Token");

  const response = await fetch(input, { ...init, headers });
  if (response.ok && getClientCSRFToken() === token)
    setClientCSRFToken(response.headers.get("X-CSRF-Token"));
  return response;
};
