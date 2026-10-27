import { FetchClientExceptions } from "@shared/api/exceptions/client/fetch.exception";
import { ValidationClientException } from "@shared/api/exceptions/client/validation.exception";
import { NotegicFetchError } from "@shared/api/exceptions/errors/fetch.error";
import { NotegicValidationError } from "@shared/api/exceptions/errors/validation.error";
import { getQueryClient } from "@shared/api/queryClient";
import { UseQueryDefaultOptions } from "@shared/api/queryHookOptions";
import {
  type QueryKey,
  type UseQueryOptions,
  useQuery,
} from "@tanstack/react-query";
import { getClientRequestHeaders } from "@/api/clientHeaders";

interface VisualizeResponseEnvelope {
  refreshableTokens?: {
    newCSRFToken?: string;
  };
  embedded?: {
    publicId?: string;
  };
}

export function useVisualizeQuery<
  TRequest extends {
    header?: { userAgent?: string; csrfToken?: string };
    param: Record<string, unknown>;
  },
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

    const response = await queryFunction({
      ...request,
      header: getClientRequestHeaders(request.header?.userAgent),
    });
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
