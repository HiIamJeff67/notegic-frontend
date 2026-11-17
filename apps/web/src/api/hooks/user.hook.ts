import { ValidationClientException } from "@shared/api/exceptions/client/validation.exception";
import { NotegicValidationError } from "@shared/api/exceptions/errors/validation.error";
import type {
  GetMeRequest,
  GetMeResponse,
  GetUserDataRequest,
  GetUserDataResponse,
} from "@shared/api/interfaces/user.interface";
import {
  mutationFnUpdateMe,
  queryFnGetMe,
  queryFnGetUserData,
} from "@shared/api/invokers/user.invoker";
import { getQueryClient } from "@shared/api/queryClient";
import {
  PresignedObjectURLStaleTime,
  UseQueryDefaultOptions,
} from "@shared/api/queryHookOptions";
import { queryKeys } from "@shared/api/queryKeys";
import {
  type UseQueryOptions,
  useMutation,
  useQuery,
} from "@tanstack/react-query";
import { GetMe, GetUserData, UpdateMe } from "@/api/functions/user.serverFn";
import { UserLocalSynchronizer } from "@/api/local/synchronizers/user.synchronizer";

export const useGetUserData = (
  hookRequest?: GetUserDataRequest,
  options?: Partial<UseQueryOptions<GetUserDataResponse, Error>>
) => {
  const queryClient = getQueryClient();

  const perform = async (
    request?: GetUserDataRequest
  ): Promise<GetUserDataResponse> => {
    try {
      if (!request) {
        throw new NotegicValidationError(
          ValidationClientException.ReceivedUndefinedRequest()
        );
      }

      const response = await queryFnGetUserData(request, GetUserData);
      await UserLocalSynchronizer.syncGetUserData(response);
      return response;
    } catch (error) {
      throw error;
    }
  };

  const query = useQuery<GetUserDataResponse, Error>({
    queryKey: queryKeys.user.data(),
    queryFn: async () => perform(hookRequest),
    staleTime: PresignedObjectURLStaleTime,
    refetchOnWindowFocus: UseQueryDefaultOptions.refetchOnWindowFocus,
    refetchOnMount: UseQueryDefaultOptions.refetchOnMount,
    ...options,
    enabled: hookRequest ? (options?.enabled ?? true) : false,
  });

  const fetch = async (
    callbackRequest: GetUserDataRequest
  ): Promise<GetUserDataResponse> => {
    return queryClient.fetchQuery({
      queryKey: queryKeys.user.data(true),
      queryFn: async () => perform(callbackRequest),
      staleTime: 0,
      ...options,
    });
  };

  return { ...query, fetch };
};

export const useGetMe = (
  hookRequest?: GetMeRequest,
  options?: Partial<UseQueryOptions<GetMeResponse, Error>>
) => {
  const queryClient = getQueryClient();

  const perform = async (request?: GetMeRequest): Promise<GetMeResponse> => {
    try {
      if (!request) {
        throw new NotegicValidationError(
          ValidationClientException.ReceivedUndefinedRequest()
        );
      }

      const response = await queryFnGetMe(request, GetMe);
      await UserLocalSynchronizer.syncGetMe(response);
      return response;
    } catch (error) {
      throw error;
    }
  };

  const query = useQuery<GetMeResponse, Error>({
    queryKey: queryKeys.user.me(),
    queryFn: async () => perform(hookRequest),
    staleTime: UseQueryDefaultOptions.staleTime, // sync with the access token expired duration
    refetchOnWindowFocus: UseQueryDefaultOptions.refetchOnWindowFocus,
    refetchOnMount: UseQueryDefaultOptions.refetchOnMount,
    ...options,
    enabled: hookRequest ? (options?.enabled ?? true) : false,
  });

  const fetch = async (
    callbackRequest: GetMeRequest
  ): Promise<GetMeResponse> => {
    return queryClient.fetchQuery({
      queryKey: queryKeys.user.me(true),
      queryFn: async () => perform(callbackRequest),
      staleTime: UseQueryDefaultOptions.staleTime,
      ...options,
    });
  };

  return { ...query, fetch };
};

export const useUpdateMe = () => {
  const queryClient = getQueryClient();

  const mutation = useMutation({
    mutationFn: (request: Parameters<typeof mutationFnUpdateMe>[0]) =>
      mutationFnUpdateMe(request, UpdateMe),
    onSuccess: (response, request) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.user.me() });
    },
    onError: error => {},
  });

  return mutation;
};
