import { NotegicFetchError } from "@shared/api/exceptions/errors/fetch.error";
import { NotegicValidationError } from "@shared/api/exceptions/errors/validation.error";
import { NotegicAPIError } from "@shared/api/exceptions";
import { FetchClientExceptions } from "@shared/api/exceptions/client/fetch.exception";
import { ValidationClientException } from "@shared/api/exceptions/client/validation.exception";
import {
  SubmitFeedbackReportRequestSchema,
  SubmitFeedbackReportResponseSchema,
  type SubmitFeedbackReportRequest,
  type SubmitFeedbackReportResponse,
} from "@shared/api/interfaces/feedback.interface";
import { SubmitFeedbackReport } from "@/api/functions/feedback.serverFn";
import { ZodError } from "zod";

export const mutationFnSubmitFeedbackReport = async (
  request: SubmitFeedbackReportRequest
): Promise<SubmitFeedbackReportResponse> => {
  try {
    return SubmitFeedbackReportResponseSchema.parse(
      await SubmitFeedbackReport({
        data: SubmitFeedbackReportRequestSchema.parse(request),
      })
    );
  } catch (error) {
    if (error instanceof ZodError) {
      throw new NotegicValidationError(
        ValidationClientException.ZodParsingFailed(error)
      );
    }
    if (error instanceof NotegicAPIError) throw error;
    if (error instanceof TypeError) {
      throw new NotegicFetchError(FetchClientExceptions.MissingNetwork());
    }
    throw error;
  }
};
