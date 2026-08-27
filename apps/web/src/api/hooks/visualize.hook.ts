import { NotegicFetchError } from "@shared/api/exceptions/errors/fetch.error";
import { NotegicValidationError } from "@shared/api/exceptions/errors/validation.error";
import { FetchClientExceptions } from "@shared/api/exceptions/client/fetch.exception";
import { ValidationClientException } from "@shared/api/exceptions/client/validation.exception";
import { getQueryClient } from "@shared/api/queryClient";
import { UseQueryDefaultOptions } from "@shared/api/queryHookOptions";

import { SessionStorageManipulator } from "@shared/lib/sessionStorageManipulator";

import { SessionStorageKey } from "@shared/types/sessionStorage.type";
import {
  type QueryKey,
  type UseQueryOptions,
  useQuery,
} from "@tanstack/react-query";

interface VisualizeResponseEnvelope {
  refreshableTokens?: {
    newCSRFToken?: string;
  };
  embedded?: {
    publicId?: string;
  };
}

export function useVisualizeQuery<
  TRequest,
  TResponse extends VisualizeResponseEnvelope,
>(
  hookRequest: TRequest | undefined,
  queryKeyFactory: (request: TRequest | undefined) => QueryKey,
  queryFunction: (request: TRequest) => Promise<TResponse>,
  options?: Partial<UseQueryOptions<TResponse, Error>>
) {
  const queryClient = getQueryClient();

  const perform = async (request?: TRequest): Promise<TResponse> => {
    if (!request) {
      throw new NotegicValidationError(
        ValidationClientException.ReceivedUndefinedRequest()
      );
    }
    if (typeof navigator !== "undefined" && navigator.onLine === false) {
      throw new NotegicFetchError(FetchClientExceptions.MissingNetwork());
    }

    const response = await queryFunction(request);
    SessionStorageManipulator.ensureItem(
      SessionStorageKey.csrfToken,
      response.refreshableTokens?.newCSRFToken
    );
    return response;
  };

  const query = useQuery<TResponse, Error>({
    queryKey: queryKeyFactory(hookRequest),
    queryFn: async () => perform(hookRequest),
    staleTime: UseQueryDefaultOptions.staleTime,
    refetchOnWindowFocus: UseQueryDefaultOptions.refetchOnWindowFocus,
    refetchOnMount: UseQueryDefaultOptions.refetchOnMount,
    ...options,
    enabled: hookRequest ? (options?.enabled ?? true) : false,
  });

  const fetch = async (callbackRequest: TRequest): Promise<TResponse> =>
    queryClient.fetchQuery({
      queryKey: queryKeyFactory(callbackRequest),
      queryFn: async () => perform(callbackRequest),
      staleTime: UseQueryDefaultOptions.staleTime,
    });

  return { ...query, fetch };
}
