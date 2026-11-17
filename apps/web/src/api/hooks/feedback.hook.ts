import type {
  SubmitFeedbackReportRequest,
  SubmitFeedbackReportResponse,
} from "@shared/api/interfaces/feedback.interface";
import { mutationFnSubmitFeedbackReport } from "@shared/api/invokers/feedback.invoker";
import { useMutation } from "@tanstack/react-query";
import { SubmitFeedbackReport } from "@/api/functions/feedback.serverFn";
import { getClientRequestHeaders } from "@/api/functions/headers/clientHeaders";

export const useSubmitFeedbackReport = () =>
  useMutation<
    SubmitFeedbackReportResponse,
    Error,
    Omit<SubmitFeedbackReportRequest, "header"> & {
      header: Omit<
        SubmitFeedbackReportRequest["header"],
        "userAgent" | "csrfToken"
      >;
    }
  >({
    mutationFn: request =>
      mutationFnSubmitFeedbackReport(
        {
          ...request,
          header: {
            ...getClientRequestHeaders(),
            ...request.header,
          },
        },
        SubmitFeedbackReport
      ),
  });
