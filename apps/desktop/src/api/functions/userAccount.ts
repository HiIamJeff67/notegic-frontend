import {
  GetMyAccountResponse,
  GetMyAccountResponseSchema,
} from "@shared/api/interfaces/userAccount.interface";
import { APIURLPathDictionary, CurrentAPIBaseURL } from "@shared/lib/url/api";
import { getAccessToken } from "../tokens/accessToken";

export const GetMyAccount = async (): Promise<GetMyAccountResponse> => {
  const response = await fetch(
    `${APIURLPathDictionary.origin()}/${CurrentAPIBaseURL}/${APIURLPathDictionary.userAccount.getMyAccount}`,
    {
      method: "GET",
      credentials: "omit",
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
