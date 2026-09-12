import { NotegicAPIError, NotegicException } from "@shared/api/exceptions";
import type {
  UpdateMyInfoRequest,
  UpdateMyInfoResponse,
} from "@shared/api/interfaces/userInfo.interface";
import { APIURLPathDictionary, CurrentAPIBaseURL } from "@shared/api/url";
import { isJsonResponse } from "@shared/util/isJsonContext";

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

  const response = await fetch(
    `${import.meta.env.VITE_API_DOMAIN_URL}/${CurrentAPIBaseURL}/${APIURLPathDictionary.userInfo.updateMyInfo}`,
    {
      method: "PUT",
      headers: {
        "User-Agent": request.header?.userAgent ?? navigator.userAgent,
        ...(request.header?.csrfToken
          ? { "X-CSRF-Token": request.header.csrfToken }
          : {}),
      },
      body: formData,
      credentials: "include",
    }
  );

  if (!isJsonResponse(response)) {
    throw new Error("error.encounterUnknownError");
  }
  const formattedResponse = (await response.json()) as UpdateMyInfoResponse;
  if (formattedResponse.exception != null) {
    throw new NotegicAPIError(
      new NotegicException(formattedResponse.exception)
    );
  }

  return formattedResponse;
}
