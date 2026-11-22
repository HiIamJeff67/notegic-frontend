import type { SubmitFeedbackReportRequest } from "@shared/api/interfaces/feedback.interface";
import { mutationFnSubmitFeedbackReport } from "@shared/api/invokers/feedback.invoker";
import { useMutation } from "@tanstack/react-query";

export const useSubmitFeedbackReport = (
  func: Parameters<typeof mutationFnSubmitFeedbackReport>[1]
) =>
  useMutation({
    mutationFn: (request: SubmitFeedbackReportRequest) =>
      mutationFnSubmitFeedbackReport(request, func),
  });
