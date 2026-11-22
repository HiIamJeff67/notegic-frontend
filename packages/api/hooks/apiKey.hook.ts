import type {
  CreateMyAPIKeyRequest,
  ListMyAPIKeysRequest,
  RevokeMyAPIKeyRequest,
} from "@shared/api/interfaces/apiKey.interface";
import {
  mutationFnCreateMyAPIKey,
  mutationFnRevokeMyAPIKey,
  queryFnListMyAPIKeys,
} from "@shared/api/invokers/apiKey.invoker";
import { getQueryClient } from "@shared/api/queryClient";
import { UseQueryDefaultOptions } from "@shared/api/queryHookOptions";
import { queryKeys } from "@shared/api/queryKeys";
import { useMutation, useQuery } from "@tanstack/react-query";

export const useMyAPIKeys = (
  func: Parameters<typeof queryFnListMyAPIKeys>[1],
  request?: Parameters<typeof queryFnListMyAPIKeys>[0]
) =>
  useQuery({
    queryKey: queryKeys.apiKey.my(),
    enabled: request !== undefined,
    queryFn: () => queryFnListMyAPIKeys(request as ListMyAPIKeysRequest, func),
    staleTime: UseQueryDefaultOptions.staleTime,
    refetchOnWindowFocus: UseQueryDefaultOptions.refetchOnWindowFocus,
    refetchOnMount: UseQueryDefaultOptions.refetchOnMount,
  });

export const useCreateMyAPIKey = (
  func: Parameters<typeof mutationFnCreateMyAPIKey>[1]
) => {
  const queryClient = getQueryClient();
  return useMutation({
    mutationFn: (request: CreateMyAPIKeyRequest) =>
      mutationFnCreateMyAPIKey(request, func),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.apiKey.my() });
    },
  });
};

export const useRevokeMyAPIKey = (
  func: Parameters<typeof mutationFnRevokeMyAPIKey>[1]
) => {
  const queryClient = getQueryClient();
  return useMutation({
    mutationFn: (request: RevokeMyAPIKeyRequest) =>
      mutationFnRevokeMyAPIKey(request, func),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.apiKey.my() });
    },
  });
};
