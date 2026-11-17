import { NotegicAPIError } from "@shared/api/exceptions";
import { FetchClientExceptions } from "@shared/api/exceptions/client/fetch.exception";
import { ValidationClientException } from "@shared/api/exceptions/client/validation.exception";
import { NotegicFetchError } from "@shared/api/exceptions/errors/fetch.error";
import { NotegicValidationError } from "@shared/api/exceptions/errors/validation.error";
import {
  type SubmitFeedbackReportRequest,
  SubmitFeedbackReportRequestSchema,
  type SubmitFeedbackReportResponse,
  SubmitFeedbackReportResponseSchema,
} from "@shared/api/interfaces/feedback.interface";
import { parse } from "@shared/api/validation";
import { ZodError } from "zod";

export const mutationFnSubmitFeedbackReport = async (
  request: SubmitFeedbackReportRequest,
  func: (
    request: SubmitFeedbackReportRequest
  ) => Promise<SubmitFeedbackReportResponse>
): Promise<SubmitFeedbackReportResponse> => {
  const validatedRequest = parse(SubmitFeedbackReportRequestSchema, request);
  try {
    return SubmitFeedbackReportResponseSchema.parse(
      await func(validatedRequest)
    );
  } catch (error) {
    if (error instanceof ZodError) {
      throw new NotegicValidationError(
        ValidationClientException.ZodParsingFailed(error)
      ).setPresentation("validation.invalidResponse");
    }
    if (error instanceof NotegicAPIError) throw error;
    if (error instanceof TypeError) {
      throw new NotegicFetchError(FetchClientExceptions.MissingNetwork());
    }
    throw error;
  }
};
