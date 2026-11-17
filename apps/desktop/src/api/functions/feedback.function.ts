import type {
  SubmitFeedbackReportRequest,
  SubmitFeedbackReportResponse,
} from "@shared/api/interfaces/feedback.interface";
import { APIURLPathDictionary, CurrentAPIBaseURL } from "@shared/lib/url/api";
import { getAccessToken } from "../tokens/accessToken";

export const SubmitFeedbackReport = async (
  request: SubmitFeedbackReportRequest
): Promise<SubmitFeedbackReportResponse> => {
  const response = await fetch(
    `${APIURLPathDictionary.origin()}/${CurrentAPIBaseURL}/${APIURLPathDictionary.feedback.submitReport}`,
    {
      method: "POST",
      headers: {
        ...(getAccessToken()
          ? { Authorization: `Bearer ${getAccessToken()}` }
          : {}),
        "Content-Type": "application/json",
        "Idempotency-Key": request.header.idempotencyKey,
        "User-Agent":
          request.header.userAgent ??
          (typeof navigator !== "undefined" ? navigator.userAgent : "unknown"),
      },
      body: JSON.stringify(request.body),
      credentials: "omit",
    }
  );

  return (await response.json()) as SubmitFeedbackReportResponse;
};
