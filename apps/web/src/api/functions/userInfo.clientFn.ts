import type {
  UpdateMyInfoRequest,
  UpdateMyInfoResponse,
} from "@shared/api/interfaces/userInfo.interface";
import { APIURLPathDictionary, CurrentAPIBaseURL } from "@shared/api/url";
import { readAPIResponse } from "@/api/adapters/apiResponse.adapter";
import { getClientCSRFToken } from "@/api/clientHeaders";

export async function UpdateMyInfo(
  request: UpdateMyInfoRequest
): Promise<UpdateMyInfoResponse> {
  const formData = new FormData();
  formData.append("values", JSON.stringify(request.body.values));
  if (request.body.setNull) {
    formData.append("setNull", JSON.stringify(request.body.setNull));
  }
  if (request.body.avatarFile) {
    formData.append("avatarFile", request.body.avatarFile);
  }
  if (request.body.coverBackgroundFile) {
    formData.append("coverBackgroundFile", request.body.coverBackgroundFile);
  }

  const csrfToken = getClientCSRFToken();
  const response = await fetch(
    `${import.meta.env.VITE_API_DOMAIN_URL}/${CurrentAPIBaseURL}/${APIURLPathDictionary.userInfo.updateMyInfo}`,
    {
      method: "PUT",
      headers: {
        "User-Agent": request.header?.userAgent ?? navigator.userAgent,
        ...(csrfToken ? { "X-CSRF-Token": csrfToken } : {}),
      },
      body: formData,
      credentials: "include",
    }
  );

  const formattedResponse = (await readAPIResponse(
    response,
    csrfToken
  )) as UpdateMyInfoResponse;

  return formattedResponse;
}
