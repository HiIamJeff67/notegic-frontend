import type {
  GetMyInfoRequest,
  UpdateMyInfoRequest,
} from "@shared/api/interfaces/userInfo.interface";
import {
  mutationFnUpdateMyInfo,
  queryFnGetMyInfo,
} from "@shared/api/invokers/userInfo.invoker";
import { getQueryClient } from "@shared/api/queryClient";
import { UseQueryDefaultOptions } from "@shared/api/queryHookOptions";
import { queryKeys } from "@shared/api/queryKeys";
import { useMutation, useQuery } from "@tanstack/react-query";

export const useGetMyInfo = (
  func: Parameters<typeof queryFnGetMyInfo>[1],
  request?: Parameters<typeof queryFnGetMyInfo>[0]
) =>
  useQuery({
    queryKey: queryKeys.userInfo.my(),
    enabled: request !== undefined,
    queryFn: () => queryFnGetMyInfo(request as GetMyInfoRequest, func),
    staleTime: UseQueryDefaultOptions.staleTime,
    refetchOnWindowFocus: UseQueryDefaultOptions.refetchOnWindowFocus,
    refetchOnMount: UseQueryDefaultOptions.refetchOnMount,
  });

export const useUpdateMyInfo = (
  func: Parameters<typeof mutationFnUpdateMyInfo>[1]
) => {
  const queryClient = getQueryClient();
  return useMutation({
    mutationFn: (request: UpdateMyInfoRequest) =>
      mutationFnUpdateMyInfo(request, func),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.userInfo.all(),
      });
    },
  });
};
