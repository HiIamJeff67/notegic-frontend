import {
  SaveMyMaterialByIdRequest,
  SaveMyMaterialByIdResponse,
} from "@shared/api/interfaces/material.interface";
import { APIURLPathDictionary, CurrentAPIBaseURL } from "@shared/api/url";
import { readAPIResponse } from "@/api/adapters/apiResponse.adapter";
import { getClientCSRFToken } from "@/api/clientHeaders";

export async function SaveMyMaterialById(
  request: SaveMyMaterialByIdRequest
): Promise<SaveMyMaterialByIdResponse> {
  const formData = new FormData();
  formData.append("contentFile", request.body.contentFile);

  const userAgent = request.header?.userAgent ?? "unknown";
  const csrfToken = getClientCSRFToken();
  const response = await fetch(
    `${import.meta.env.VITE_API_DOMAIN_URL}/${CurrentAPIBaseURL}/${APIURLPathDictionary.material.saveMyMaterialById(request.body.materialId)}`,
    {
      method: "PUT",
      headers: {
        "User-Agent": userAgent,
        ...(csrfToken ? { "X-CSRF-Token": csrfToken } : {}),
      },
      body: formData,
      credentials: "include",
    }
  );

  const formattedResponse = (await readAPIResponse(
    response,
    csrfToken
  )) as SaveMyMaterialByIdResponse;

  return formattedResponse;
}
