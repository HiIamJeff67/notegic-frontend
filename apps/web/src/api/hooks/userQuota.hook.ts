import { ValidationClientException } from "@shared/api/exceptions/client/validation.exception";
import { NotegicValidationError } from "@shared/api/exceptions/errors/validation.error";
import type {
  GetMyQuotaRequest,
  GetMyQuotaResponse,
} from "@shared/api/interfaces/userQuota.interface";
import { getQueryClient } from "@shared/api/queryClient";
import { UseQueryDefaultOptions } from "@shared/api/queryHookOptions";
import { queryKeys } from "@shared/api/queryKeys";
import { type UseQueryOptions, useQuery } from "@tanstack/react-query";
import { queryFnGetMyQuota } from "@/api/invokers/userQuota.invoker";

export const useGetMyQuota = (
  hookRequest?: GetMyQuotaRequest,
  options?: Partial<UseQueryOptions<GetMyQuotaResponse, Error>>
) => {
  const queryClient = getQueryClient();

  const perform = async (
    request?: GetMyQuotaRequest
  ): Promise<GetMyQuotaResponse> => {
    if (!request) {
      throw new NotegicValidationError(
        ValidationClientException.ReceivedUndefinedRequest()
      );
    }
    const response = await queryFnGetMyQuota(request);
    return response;
  };

  const query = useQuery<GetMyQuotaResponse, Error>({
    queryKey: queryKeys.userQuota.my(),
    queryFn: async () => perform(hookRequest),
    staleTime: UseQueryDefaultOptions.staleTime,
    refetchOnWindowFocus: UseQueryDefaultOptions.refetchOnWindowFocus,
    refetchOnMount: UseQueryDefaultOptions.refetchOnMount,
    ...options,
    enabled: hookRequest ? (options?.enabled ?? true) : false,
  });

  const fetch = async (
    callbackRequest: GetMyQuotaRequest
  ): Promise<GetMyQuotaResponse> => {
    return queryClient.fetchQuery({
      queryKey: queryKeys.userQuota.my(),
      queryFn: async () => perform(callbackRequest),
      staleTime: 0,
      ...options,
    });
  };

  return { ...query, fetch };
};
