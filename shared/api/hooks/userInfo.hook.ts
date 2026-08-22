import { NotegicValidationError } from "@shared/api/exceptions/errors/validation.error";
import { ValidationClientException } from "@shared/api/exceptions/client/validation.exception";
import type {
  GetMyInfoRequest,
  GetMyInfoResponse,
} from "@shared/api/interfaces/userInfo.interface";
import {
  mutationFnUpdateMyInfo,
  queryFnGetMyInfo,
} from "@shared/api/invokers/userInfo.invoker";
import { getQueryClient } from "@shared/api/queryClient";
import { UseQueryDefaultOptions } from "@shared/api/queryHookOptions";
import { queryKeys } from "@shared/api/queryKeys";

import { SessionStorageManipulator } from "@shared/lib/sessionStorageManipulator";

import { SessionStorageKey } from "@shared/types/sessionStorage.type";
import {
  type UseQueryOptions,
  useMutation,
  useQuery,
} from "@tanstack/react-query";

export const useGetMyInfo = (
  hookRequest?: GetMyInfoRequest,
  options?: Partial<UseQueryOptions<GetMyInfoResponse, Error>>,
) => {
  const queryClient = getQueryClient();

  const perform = async (
    request?: GetMyInfoRequest,
  ): Promise<GetMyInfoResponse> => {
    try {
      if (!request) {
        throw new NotegicValidationError(
          ValidationClientException.ReceivedUndefinedRequest(),
        );
      }

      const response = await queryFnGetMyInfo(request);
      SessionStorageManipulator.ensureItem(
        SessionStorageKey.csrfToken,
        response.refreshableTokens?.newCSRFToken,
      );
      return response;
    } catch (error) {
      throw error;
    }
  };

  const query = useQuery<GetMyInfoResponse, Error>({
    queryKey: queryKeys.userInfo.my(),
    queryFn: async () => perform(hookRequest),
    staleTime: UseQueryDefaultOptions.staleTime,
    refetchOnWindowFocus: UseQueryDefaultOptions.refetchOnWindowFocus,
    refetchOnMount: UseQueryDefaultOptions.refetchOnMount,
    ...options,
    enabled: hookRequest ? (options?.enabled ?? true) : false,
  });

  const fetch = async (
    callbackRequest: GetMyInfoRequest,
  ): Promise<GetMyInfoResponse> => {
    return queryClient.fetchQuery({
      queryKey: queryKeys.userInfo.my(),
      queryFn: async () => perform(callbackRequest),
      staleTime: UseQueryDefaultOptions.staleTime,
      ...options,
    });
  };

  return { ...query, fetch };
};

export const useUpdateMyInfo = () => {
  const queryClient = getQueryClient();

  const mutation = useMutation({
    mutationFn: mutationFnUpdateMyInfo,
    onSuccess: (response, request) => {
      SessionStorageManipulator.ensureItem(
        SessionStorageKey.csrfToken,
        response.refreshableTokens?.newCSRFToken,
      );
      queryClient.invalidateQueries({ queryKey: queryKeys.userInfo.my() });
    },
    onError: (error) => {},
  });

  return mutation;
};
