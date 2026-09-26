import { NotegicAPIError, NotegicException } from "@shared/api/exceptions";
import type {
  SubmitFeedbackReportRequest,
  SubmitFeedbackReportResponse,
} from "@shared/api/interfaces/feedback.interface";
import { APIURLPathDictionary, CurrentAPIBaseURL } from "@shared/api/url";
import { isJsonResponse } from "@shared/util/isJsonContext";
import { createServerFn } from "@tanstack/react-start";
import { getRequestHeader } from "@tanstack/react-start/server";
import { forwardUpstreamSetCookies } from "@/api/cookieBridge";

const toFeedbackException = (exception: unknown): NotegicException => {
  const value =
    typeof exception === "object" && exception !== null
      ? (exception as Record<string, unknown>)
      : {};
  const status =
    typeof value.status === "number" && value.status > 0 ? value.status : 500;

  return new NotegicException({
    code:
      typeof value.code === "number" && value.code > 0 ? value.code : status,
    prefix:
      typeof value.prefix === "string"
        ? value.prefix
        : typeof value.domain === "string"
          ? value.domain
          : "Gateway",
    reason:
      typeof value.reason === "string" ? value.reason : "FeedbackRequestFailed",
    message:
      typeof value.message === "string"
        ? value.message
        : "Feedback request failed.",
    status,
    retryable: value.retryable === true,
    ...(value.details !== undefined ? { details: value.details } : {}),
    ...(typeof value.origin === "string" ? { origin: value.origin } : {}),
  });
};

export const SubmitFeedbackReport = createServerFn({ method: "POST" })
  .inputValidator((data: SubmitFeedbackReportRequest) => data)
  .handler(async ({ data: request }): Promise<SubmitFeedbackReportResponse> => {
    const response = await fetch(
      `${import.meta.env.VITE_API_DOMAIN_URL}/${CurrentAPIBaseURL}/${APIURLPathDictionary.feedback.submitReport}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Idempotency-Key": request.header.idempotencyKey,
          "User-Agent":
            request.header.userAgent ??
            getRequestHeader("User-Agent") ??
            "unknown",
          ...(request.header.csrfToken
            ? { "X-CSRF-Token": request.header.csrfToken }
            : {}),
          ...(getRequestHeader("cookie")
            ? { Cookie: getRequestHeader("cookie") }
            : {}),
        },
        body: JSON.stringify(request.body),
        credentials: "include",
      }
    );

    if (!isJsonResponse(response)) {
      throw new Error("error.encounterUnknownError");
    }

    forwardUpstreamSetCookies(response);
    const formattedResponse =
      (await response.json()) as SubmitFeedbackReportResponse;
    if (formattedResponse.exception != null) {
      throw new NotegicAPIError(
        toFeedbackException(formattedResponse.exception)
      );
    }

    return formattedResponse;
  });
