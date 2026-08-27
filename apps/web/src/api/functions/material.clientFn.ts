import { NotegicAPIError, NotegicException } from "@shared/api/exceptions";
import {
  SaveMyMaterialByIdRequest,
  SaveMyMaterialByIdResponse,
} from "@shared/api/interfaces/material.interface";
import { APIURLPathDictionary, CurrentAPIBaseURL } from "@shared/api/url";
import { isJsonResponse } from "@shared/util/isJsonContext";

export async function SaveMyMaterialById(
  request: SaveMyMaterialByIdRequest
): Promise<SaveMyMaterialByIdResponse> {
  const formData = new FormData();
  formData.append("contentFile", request.body.contentFile);

  const userAgent = request.header?.userAgent ?? "unknown";
  const response = await fetch(
    `${import.meta.env.VITE_API_DOMAIN_URL}/${CurrentAPIBaseURL}/${APIURLPathDictionary.material.saveMyMaterialById(request.body.materialId)}`,
    {
      method: "PUT",
      headers: {
        "User-Agent": userAgent,
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
  const formattedResponse =
    (await response.json()) as SaveMyMaterialByIdResponse;
  if (formattedResponse.exception != null) {
    throw new NotegicAPIError(
      new NotegicException(formattedResponse.exception)
    );
  }

  return formattedResponse;
}
