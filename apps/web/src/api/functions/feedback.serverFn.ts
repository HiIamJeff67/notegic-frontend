import {
  SubmitFeedbackReportRequestSchema,
  SubmitFeedbackReportResponseSchema,
  type SubmitFeedbackReportResponse,
} from "@shared/api/interfaces/feedback.interface";
import { APIURLPathDictionary, CurrentAPIBaseURL } from "@shared/api/url";
import { readAPIResponse } from "@/api/adapters/apiResponse.adapter";
import { createServerFn } from "@tanstack/react-start";
import { getRequestHeader } from "@tanstack/react-start/server";
import { forwardUpstreamSetCookies } from "@/api/bridges/cookie.bridge";

export const SubmitFeedbackReport = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) =>
    SubmitFeedbackReportRequestSchema.parse(data)
  )
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

    forwardUpstreamSetCookies(response);
    const formattedResponse = (await readAPIResponse(
      response
    )) as SubmitFeedbackReportResponse;

    if (formattedResponse.success !== true) {
      throw new Error("error.encounterUnknownError");
    }

    return SubmitFeedbackReportResponseSchema.parse(formattedResponse);
  });
