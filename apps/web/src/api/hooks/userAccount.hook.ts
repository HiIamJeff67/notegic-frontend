import { ValidationClientException } from "@shared/api/exceptions/client/validation.exception";
import { NotegicValidationError } from "@shared/api/exceptions/errors/validation.error";
import type {
  GetMyAccountRequest,
  GetMyAccountResponse,
} from "@shared/api/interfaces/userAccount.interface";
import { getQueryClient } from "@shared/api/queryClient";
import { UseQueryDefaultOptions } from "@shared/api/queryHookOptions";
import { queryKeys } from "@shared/api/queryKeys";
import {
  type UseQueryOptions,
  useMutation,
  useQuery,
} from "@tanstack/react-query";
import {
  mutationFnBindGoogleAccount,
  mutationFnUnbindGoogleAccount,
  mutationFnUpdateMyAccount,
  queryFnGetMyAccount,
} from "@/api/invokers/userAccount.invoker";

export const useGetMyAccount = (
  hookRequest?: GetMyAccountRequest,
  options?: Partial<UseQueryOptions<GetMyAccountResponse, Error>>
) => {
  const queryClient = getQueryClient();

  const perform = async (
    request?: GetMyAccountRequest
  ): Promise<GetMyAccountResponse> => {
    try {
      if (!request) {
        throw new NotegicValidationError(
          ValidationClientException.ReceivedUndefinedRequest()
        );
      }

      const response = await queryFnGetMyAccount(request);
      return response;
    } catch (error) {
      throw error;
    }
  };

  const query = useQuery<GetMyAccountResponse, Error>({
    queryKey: queryKeys.userAccount.my(),
    queryFn: async () => perform(hookRequest),
    staleTime: UseQueryDefaultOptions.staleTime,
    refetchOnWindowFocus: UseQueryDefaultOptions.refetchOnWindowFocus,
    refetchOnMount: UseQueryDefaultOptions.refetchOnMount,
    ...options,
    enabled: hookRequest ? (options?.enabled ?? true) : false,
  });

  const fetch = async (
    callbackRequest: GetMyAccountRequest
  ): Promise<GetMyAccountResponse> => {
    return queryClient.fetchQuery({
      queryKey: queryKeys.userAccount.my(),
      queryFn: async () => perform(callbackRequest),
      staleTime: UseQueryDefaultOptions.staleTime,
      ...options,
    });
  };

  return { ...query, fetch };
};

export const useUpdateMyAccount = () => {
  const queryClient = getQueryClient();

  const mutation = useMutation({
    mutationFn: mutationFnUpdateMyAccount,
    onSuccess: (response, request) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.userAccount.my() });
    },
    onError: error => {},
  });

  return mutation;
};

export const useBindGoogleAccount = () => {
  const queryClient = getQueryClient();

  const mutation = useMutation({
    mutationFn: mutationFnBindGoogleAccount,
    onSuccess: (response, request) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.userAccount.my() });
    },
    onError: error => {},
  });

  return mutation;
};

export const useUnbindGoogleAccount = () => {
  const queryClient = getQueryClient();

  const mutation = useMutation({
    mutationFn: mutationFnUnbindGoogleAccount,
    onSuccess: (response, request) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.userAccount.my() });
    },
    onError: error => {},
  });

  return mutation;
};
