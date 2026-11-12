import { GetMyAccountResponseSchema } from "@shared/api/interfaces/userAccount.interface";
import { APIURLPathDictionary, CurrentAPIBaseURL } from "@shared/api/url";
import { getAccessToken } from "../session";

export const getMyAccount = async () => {
  const domain = import.meta.env.VITE_API_DOMAIN_URL || "http://localhost";
  const response = await fetch(
    `${domain}/${CurrentAPIBaseURL}/${APIURLPathDictionary.userAccount.getMyAccount}`,
    {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${getAccessToken()}`,
      },
    }
  );
  const payload: unknown = await response.json();
  if (!response.ok) {
    throw new Error(`Account request failed with status ${response.status}`);
  }
  return GetMyAccountResponseSchema.parse(payload);
};
