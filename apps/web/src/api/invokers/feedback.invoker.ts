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
import { parseRequest } from "@shared/api/validation";
import { ZodError } from "zod";
import { SubmitFeedbackReport } from "@/api/functions/feedback.serverFn";

export const mutationFnSubmitFeedbackReport = async (
  request: SubmitFeedbackReportRequest
): Promise<SubmitFeedbackReportResponse> => {
  const validatedRequest = parseRequest(
    SubmitFeedbackReportRequestSchema,
    request
  );
  try {
    return SubmitFeedbackReportResponseSchema.parse(
      await SubmitFeedbackReport({
        data: validatedRequest,
      })
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
