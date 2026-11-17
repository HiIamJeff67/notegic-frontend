import { NotegicAPIError } from "@shared/api/exceptions";
import type {
  CreateMyAPIKeyRequest,
  CreateMyAPIKeyResponse,
  ListMyAPIKeysRequest,
  ListMyAPIKeysResponse,
  RevokeMyAPIKeyRequest,
  RevokeMyAPIKeyResponse,
} from "@shared/api/interfaces/apiKey.interface";
import {
  mutationFnCreateMyAPIKey,
  mutationFnRevokeMyAPIKey,
  queryFnListMyAPIKeys,
} from "@shared/api/invokers/apiKey.invoker";
import { getQueryClient } from "@shared/api/queryClient";
import { queryKeys } from "@shared/api/queryKeys";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  CreateMyAPIKey,
  ListMyAPIKeys,
  RevokeMyAPIKey,
} from "@/api/functions/apiKey.serverFn";
import { getClientRequestHeaders } from "@/api/functions/headers/clientHeaders";

export const useMyAPIKeys = (enabled = true) =>
  useQuery<ListMyAPIKeysResponse, Error>({
    queryKey: queryKeys.apiKey.my(),
    queryFn: () =>
      queryFnListMyAPIKeys(
        {
          header: getClientRequestHeaders(),
        } satisfies ListMyAPIKeysRequest,
        ListMyAPIKeys
      ),
    staleTime: 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    networkMode: "always",
    retry: (failureCount, error) =>
      failureCount < 1 &&
      error instanceof NotegicAPIError &&
      error.unWrap.retryable === true,
    enabled,
  });

export const useCreateMyAPIKey = () => {
  const queryClient = getQueryClient();
  return useMutation<
    CreateMyAPIKeyResponse,
    Error,
    Omit<CreateMyAPIKeyRequest, "header">
  >({
    mutationFn: request => {
      const header = getClientRequestHeaders();
      return mutationFnCreateMyAPIKey(
        {
          ...request,
          header: { ...header, csrfToken: header.csrfToken ?? "" },
        },
        CreateMyAPIKey
      );
    },
    onSuccess: response => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.apiKey.my() });
    },
    retry: (failureCount, error) =>
      failureCount < 1 &&
      error instanceof NotegicAPIError &&
      error.unWrap.retryable === true,
  });
};

export const useRevokeMyAPIKey = () => {
  const queryClient = getQueryClient();
  return useMutation<
    RevokeMyAPIKeyResponse,
    Error,
    Omit<RevokeMyAPIKeyRequest, "header">
  >({
    mutationFn: request => {
      const header = getClientRequestHeaders();
      return mutationFnRevokeMyAPIKey(
        {
          ...request,
          header: { ...header, csrfToken: header.csrfToken ?? "" },
        },
        RevokeMyAPIKey
      );
    },
    onSuccess: response => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.apiKey.my() });
    },
    retry: (failureCount, error) =>
      failureCount < 1 &&
      error instanceof NotegicAPIError &&
      error.unWrap.retryable === true,
  });
};
