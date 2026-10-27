import { ValidationClientException } from "@shared/api/exceptions/client/validation.exception";
import { NotegicValidationError } from "@shared/api/exceptions/errors/validation.error";
import type {
  GetMyInfoRequest,
  GetMyInfoResponse,
} from "@shared/api/interfaces/userInfo.interface";
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
import {
  mutationFnUpdateMyInfo,
  queryFnGetMyInfo,
} from "@/api/invokers/userInfo.invoker";

export const useGetMyInfo = (
  hookRequest?: GetMyInfoRequest,
  options?: Partial<UseQueryOptions<GetMyInfoResponse, Error>>
) => {
  const queryClient = getQueryClient();

  const perform = async (
    request?: GetMyInfoRequest
  ): Promise<GetMyInfoResponse> => {
    try {
      if (!request) {
        throw new NotegicValidationError(
          ValidationClientException.ReceivedUndefinedRequest()
        );
      }

      const response = await queryFnGetMyInfo(request);
      return response;
    } catch (error) {
      throw error;
    }
  };

  const query = useQuery<GetMyInfoResponse, Error>({
    queryKey: queryKeys.userInfo.my(),
    queryFn: async () => perform(hookRequest),
    staleTime: PresignedObjectURLStaleTime,
    refetchOnWindowFocus: UseQueryDefaultOptions.refetchOnWindowFocus,
    refetchOnMount: UseQueryDefaultOptions.refetchOnMount,
    ...options,
    enabled: hookRequest ? (options?.enabled ?? true) : false,
  });

  const fetch = async (
    callbackRequest: GetMyInfoRequest
  ): Promise<GetMyInfoResponse> => {
    return queryClient.fetchQuery({
      queryKey: queryKeys.userInfo.my(),
      queryFn: async () => perform(callbackRequest),
      staleTime: PresignedObjectURLStaleTime,
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
      queryClient.invalidateQueries({ queryKey: queryKeys.userInfo.my() });
    },
    onError: error => {},
  });

  return mutation;
};
