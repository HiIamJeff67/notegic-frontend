import {
  getClientMutationHeaders,
  getClientRequestHeaders,
} from "@shared/api/clientHeaders";
import { NotezyAPIError } from "@shared/api/exceptions";
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
import { SessionStorageManipulator } from "@shared/lib/sessionStorageManipulator";
import { SessionStorageKey } from "@shared/types/sessionStorage.type";
import { useMutation, useQuery } from "@tanstack/react-query";

const persistCSRFToken = (response: {
  refreshableTokens?: { newCSRFToken?: string };
  embedded?: { publicId?: string };
}) => {
  if (!response.refreshableTokens?.newCSRFToken) return;
  SessionStorageManipulator.ensureItem(
    SessionStorageKey.csrfToken,
    response.refreshableTokens.newCSRFToken,
    response.embedded?.publicId
  );
};

const apiKeyRetryPolicy = (failureCount: number, error: Error) =>
  failureCount < 1 &&
  error instanceof NotezyAPIError &&
  error.unWrap.retryable === true;

export const useMyAPIKeys = (enabled = true) =>
  useQuery<ListMyAPIKeysResponse, Error>({
    queryKey: queryKeys.apiKey.my(),
    queryFn: () =>
      queryFnListMyAPIKeys({
        header: getClientRequestHeaders(),
      } satisfies ListMyAPIKeysRequest),
    staleTime: 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    networkMode: "always",
    retry: apiKeyRetryPolicy,
    enabled,
  });

export const useCreateMyAPIKey = () => {
  const queryClient = getQueryClient();
  return useMutation<
    CreateMyAPIKeyResponse,
    Error,
    Omit<CreateMyAPIKeyRequest, "header">
  >({
    mutationFn: request =>
      mutationFnCreateMyAPIKey({
        ...request,
        header: getClientMutationHeaders(),
      }),
    onSuccess: response => {
      persistCSRFToken(response);
      void queryClient.invalidateQueries({ queryKey: queryKeys.apiKey.my() });
    },
    retry: apiKeyRetryPolicy,
  });
};

export const useRevokeMyAPIKey = () => {
  const queryClient = getQueryClient();
  return useMutation<
    RevokeMyAPIKeyResponse,
    Error,
    Omit<RevokeMyAPIKeyRequest, "header">
  >({
    mutationFn: request =>
      mutationFnRevokeMyAPIKey({
        ...request,
        header: getClientMutationHeaders(),
      }),
    onSuccess: response => {
      persistCSRFToken(response);
      void queryClient.invalidateQueries({ queryKey: queryKeys.apiKey.my() });
    },
    retry: apiKeyRetryPolicy,
  });
};
