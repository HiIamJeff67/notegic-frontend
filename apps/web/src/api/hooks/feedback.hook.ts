import { getClientRequestHeaders } from "@/api/clientHeaders";
import { mutationFnSubmitFeedbackReport } from "@/api/invokers/feedback.invoker";
import type {
  SubmitFeedbackReportRequest,
  SubmitFeedbackReportResponse,
} from "@shared/api/interfaces/feedback.interface";
import { useMutation } from "@tanstack/react-query";

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
      mutationFnSubmitFeedbackReport({
        ...request,
        header: {
          ...getClientRequestHeaders(),
          ...request.header,
        },
      }),
  });
