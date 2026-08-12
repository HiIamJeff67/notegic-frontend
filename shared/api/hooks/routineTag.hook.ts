import type { UUID } from "node:crypto";
import { useApolloClient } from "@apollo/client/react";
import {
  ExceptionReasonDictionary,
  NotezyAPIError,
} from "@shared/api/exceptions";
import { FetchClientExceptions } from "@shared/api/exceptions/client/fetch.exception";
import { ValidationClientException } from "@shared/api/exceptions/client/validation.exception";
import { NotezyFetchError } from "@shared/api/exceptions/errors/fetch.error";
import { NotezyValidationError } from "@shared/api/exceptions/errors/validation.error";
import type {
  CreateRoutineTagRequest,
  CreateRoutineTagsRequest,
  GetAllMyRoutineTagsRequest,
  GetAllMyRoutineTagsResponse,
  GetMyRoutineTagByIdRequest,
  GetMyRoutineTagByIdResponse,
  HardDeleteMyRoutineTagByIdRequest,
  HardDeleteMyRoutineTagsByIdsRequest,
  UpdateMyRoutineTagByIdRequest,
  UpdateMyRoutineTagsByIdsRequest,
} from "@shared/api/interfaces/routineTag.interface";
import {
  mutationFnCreateRoutineTag,
  mutationFnCreateRoutineTags,
  mutationFnHardDeleteMyRoutineTagById,
  mutationFnHardDeleteMyRoutineTagsByIds,
  mutationFnUpdateMyRoutineTagById,
  mutationFnUpdateMyRoutineTagsByIds,
  queryFnGetAllMyRoutineTags,
  queryFnGetMyRoutineTagById,
} from "@shared/api/invokers/routineTag.invoker";
import { RoutineTagLocalSimulator } from "@shared/api/local/simulators/routineTag.simulator";
import { RoutineTagLocalSynchronizer } from "@shared/api/local/synchronizers/routineTag.synchronizer";
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

export const useGetMyRoutineTagById = (
  hookRequest?: GetMyRoutineTagByIdRequest,
  options?: Partial<UseQueryOptions<GetMyRoutineTagByIdResponse, Error>>
) => {
  const queryClient = getQueryClient();

  const perform = async (
    request?: GetMyRoutineTagByIdRequest
  ): Promise<GetMyRoutineTagByIdResponse> => {
    if (!request) {
      throw new NotezyValidationError(
        ValidationClientException.ReceivedUndefinedRequest()
      );
    }

    try {
      if (typeof navigator !== "undefined" && navigator.onLine === false) {
        throw new NotezyFetchError(FetchClientExceptions.MissingNetwork());
      }

      const response = await queryFnGetMyRoutineTagById(request);
      SessionStorageManipulator.ensureItem(
        SessionStorageKey.csrfToken,
        response.refreshableTokens?.newCSRFToken,
        response.embedded?.publicId
      );
      await RoutineTagLocalSynchronizer.syncGetMyRoutineTagById(response);
      return response;
    } catch (error) {
      if (
        error instanceof NotezyAPIError ||
        error instanceof NotezyFetchError
      ) {
        const routineTag =
          await RoutineTagLocalSimulator.simulateGetMyRoutineTagById(request);
        return {
          success: false,
          data: routineTag,
          exception: error.unWrap,
          embedded: { publicId: "" },
        } as GetMyRoutineTagByIdResponse;
      }

      throw error;
    }
  };

  const query = useQuery<GetMyRoutineTagByIdResponse, Error>({
    queryKey: queryKeys.routineTag.oneById(
      hookRequest?.param.routineTagId as UUID | undefined,
      hookRequest?.param.isDeleted ?? false
    ),
    queryFn: async () => perform(hookRequest),
    staleTime: UseQueryDefaultOptions.staleTime,
    refetchOnWindowFocus: UseQueryDefaultOptions.refetchOnWindowFocus,
    refetchOnMount: UseQueryDefaultOptions.refetchOnMount,
    ...options,
    enabled: hookRequest ? (options?.enabled ?? true) : false,
  });

  const fetch = async (
    callbackRequest: GetMyRoutineTagByIdRequest
  ): Promise<GetMyRoutineTagByIdResponse> => {
    return queryClient.fetchQuery({
      queryKey: queryKeys.routineTag.oneById(
        callbackRequest.param.routineTagId as UUID | undefined,
        callbackRequest.param.isDeleted ?? false
      ),
      queryFn: async () => perform(callbackRequest),
      staleTime: UseQueryDefaultOptions.staleTime,
      ...options,
    });
  };

  return { ...query, fetch };
};

export const useGetAllMyRoutineTags = (
  hookRequest?: GetAllMyRoutineTagsRequest,
  options?: Partial<UseQueryOptions<GetAllMyRoutineTagsResponse, Error>>
) => {
  const queryClient = getQueryClient();

  const perform = async (
    request?: GetAllMyRoutineTagsRequest
  ): Promise<GetAllMyRoutineTagsResponse> => {
    if (!request) {
      throw new NotezyValidationError(
        ValidationClientException.ReceivedUndefinedRequest()
      );
    }

    try {
      if (typeof navigator !== "undefined" && navigator.onLine === false) {
        throw new NotezyFetchError(FetchClientExceptions.MissingNetwork());
      }

      const response = await queryFnGetAllMyRoutineTags(request);
      SessionStorageManipulator.ensureItem(
        SessionStorageKey.csrfToken,
        response.refreshableTokens?.newCSRFToken,
        response.embedded?.publicId
      );
      await RoutineTagLocalSynchronizer.syncGetAllMyRoutineTags(response);
      return response;
    } catch (error) {
      if (
        error instanceof NotezyAPIError ||
        error instanceof NotezyFetchError
      ) {
        const routineTags =
          await RoutineTagLocalSimulator.simulateGetAllMyRoutineTags(request);
        return {
          success: false,
          data: routineTags,
          exception: error.unWrap,
          embedded: { publicId: "" },
        } as GetAllMyRoutineTagsResponse;
      }

      throw error;
    }
  };

  const query = useQuery<GetAllMyRoutineTagsResponse, Error>({
    queryKey: queryKeys.routineTag.myAll(
      hookRequest?.param?.areDeleted ?? false
    ),
    queryFn: async () => perform(hookRequest),
    staleTime: UseQueryDefaultOptions.staleTime,
    refetchOnWindowFocus: UseQueryDefaultOptions.refetchOnWindowFocus,
    refetchOnMount: UseQueryDefaultOptions.refetchOnMount,
    ...options,
    enabled: hookRequest ? (options?.enabled ?? true) : false,
  });

  const fetch = async (
    callbackRequest: GetAllMyRoutineTagsRequest
  ): Promise<GetAllMyRoutineTagsResponse> => {
    return queryClient.fetchQuery({
      queryKey: queryKeys.routineTag.myAll(
        callbackRequest.param?.areDeleted ?? false
      ),
      queryFn: async () => perform(callbackRequest),
      staleTime: UseQueryDefaultOptions.staleTime,
      ...options,
    });
  };

  return { ...query, fetch };
};

export const useCreateRoutineTag = () => {
  const queryClient = getQueryClient();
  const apolloClient = useApolloClient();

  const perform = async (request: CreateRoutineTagRequest) => {
    if (typeof navigator !== "undefined" && navigator.onLine === false) {
      throw new NotezyFetchError(FetchClientExceptions.MissingNetwork());
    }
    return await mutationFnCreateRoutineTag(request);
  };

  const mutation = useMutation({
    mutationFn: perform,
    onSuccess: async (response, request: CreateRoutineTagRequest) => {
      if (response.success === false) return;
      SessionStorageManipulator.ensureItem(
        SessionStorageKey.csrfToken,
        response.refreshableTokens?.newCSRFToken,
        response.embedded?.publicId
      );
      const targetKeys = [
        queryKeys.routineTag.all(),
        queryKeys.routineTag.oneById(response.data.id as UUID),
      ];
      await Promise.all(
        targetKeys.map(queryKey => queryClient.invalidateQueries({ queryKey }))
      );
      apolloClient.cache.evict({ fieldName: "searchRoutineTags" });
      apolloClient.cache.evict({ fieldName: "searchRoutines" });
      apolloClient.cache.gc();
      await RoutineTagLocalSynchronizer.syncCreateRoutineTag(request, response);
    },
    onError: async (error, request) => {
      if (
        error instanceof NotezyFetchError &&
        error.unWrap.reason ===
          ExceptionReasonDictionary.client.fetch.missingNetwork
      ) {
        await RoutineTagLocalSimulator.simulateCreateRoutineTag(request);
      }
    },
  });

  return mutation;
};

export const useCreateRoutineTags = () => {
  const queryClient = getQueryClient();
  const apolloClient = useApolloClient();

  const perform = async (request: CreateRoutineTagsRequest) => {
    if (typeof navigator !== "undefined" && navigator.onLine === false) {
      throw new NotezyFetchError(FetchClientExceptions.MissingNetwork());
    }
    return await mutationFnCreateRoutineTags(request);
  };

  const mutation = useMutation({
    mutationFn: perform,
    onSuccess: async (response, request: CreateRoutineTagsRequest) => {
      if (response.success === false) return;
      SessionStorageManipulator.ensureItem(
        SessionStorageKey.csrfToken,
        response.refreshableTokens?.newCSRFToken,
        response.embedded?.publicId
      );
      const targetKeys = [
        queryKeys.routineTag.all(),
        ...response.data.ids.map(id =>
          queryKeys.routineTag.oneById(id as UUID)
        ),
      ];
      await Promise.all(
        targetKeys.map(queryKey => queryClient.invalidateQueries({ queryKey }))
      );
      apolloClient.cache.evict({ fieldName: "searchRoutineTags" });
      apolloClient.cache.evict({ fieldName: "searchRoutines" });
      apolloClient.cache.gc();
      await RoutineTagLocalSynchronizer.syncCreateRoutineTags(
        request,
        response
      );
    },
    onError: async (error, request) => {
      if (
        error instanceof NotezyFetchError &&
        error.unWrap.reason ===
          ExceptionReasonDictionary.client.fetch.missingNetwork
      ) {
        await RoutineTagLocalSimulator.simulateCreateRoutineTags(request);
      }
    },
  });

  return mutation;
};

export const useUpdateMyRoutineTagById = () => {
  const queryClient = getQueryClient();
  const apolloClient = useApolloClient();

  const perform = async (request: UpdateMyRoutineTagByIdRequest) => {
    if (typeof navigator !== "undefined" && navigator.onLine === false) {
      throw new NotezyFetchError(FetchClientExceptions.MissingNetwork());
    }
    return await mutationFnUpdateMyRoutineTagById(request);
  };

  const mutation = useMutation({
    mutationFn: perform,
    onSuccess: async (response, request: UpdateMyRoutineTagByIdRequest) => {
      if (response.success === false) return;
      SessionStorageManipulator.ensureItem(
        SessionStorageKey.csrfToken,
        response.refreshableTokens?.newCSRFToken,
        response.embedded?.publicId
      );
      const targetKeys = [
        queryKeys.routineTag.all(),
        queryKeys.routineTag.oneById(request.body.routineTagId as UUID),
      ];
      await Promise.all(
        targetKeys.map(queryKey => queryClient.invalidateQueries({ queryKey }))
      );
      apolloClient.cache.evict({ fieldName: "searchRoutineTags" });
      apolloClient.cache.evict({ fieldName: "searchRoutines" });
      apolloClient.cache.gc();
      await RoutineTagLocalSynchronizer.syncUpdateMyRoutineTagById(
        request,
        response
      );
    },
    onError: async (error, request) => {
      if (
        error instanceof NotezyFetchError &&
        error.unWrap.reason ===
          ExceptionReasonDictionary.client.fetch.missingNetwork
      ) {
        await RoutineTagLocalSimulator.simulateUpdateMyRoutineTagById(request);
      }
    },
  });

  return mutation;
};

export const useUpdateMyRoutineTagsByIds = () => {
  const queryClient = getQueryClient();
  const apolloClient = useApolloClient();

  const perform = async (request: UpdateMyRoutineTagsByIdsRequest) => {
    if (typeof navigator !== "undefined" && navigator.onLine === false) {
      throw new NotezyFetchError(FetchClientExceptions.MissingNetwork());
    }
    return await mutationFnUpdateMyRoutineTagsByIds(request);
  };

  const mutation = useMutation({
    mutationFn: perform,
    onSuccess: async (response, request: UpdateMyRoutineTagsByIdsRequest) => {
      if (response.success === false) return;
      SessionStorageManipulator.ensureItem(
        SessionStorageKey.csrfToken,
        response.refreshableTokens?.newCSRFToken,
        response.embedded?.publicId
      );
      const targetKeys = [
        queryKeys.routineTag.all(),
        ...request.body.updatedRoutineTags.map(tag =>
          queryKeys.routineTag.oneById(tag.routineTagId as UUID)
        ),
      ];
      await Promise.all(
        targetKeys.map(queryKey => queryClient.invalidateQueries({ queryKey }))
      );
      apolloClient.cache.evict({ fieldName: "searchRoutineTags" });
      apolloClient.cache.evict({ fieldName: "searchRoutines" });
      apolloClient.cache.gc();
      await RoutineTagLocalSynchronizer.syncUpdateMyRoutineTagsByIds(
        request,
        response
      );
    },
    onError: async (error, request) => {
      if (
        error instanceof NotezyFetchError &&
        error.unWrap.reason ===
          ExceptionReasonDictionary.client.fetch.missingNetwork
      ) {
        await RoutineTagLocalSimulator.simulateUpdateMyRoutineTagsByIds(
          request
        );
      }
    },
  });

  return mutation;
};

export const useHardDeleteMyRoutineTagById = () => {
  const queryClient = getQueryClient();
  const apolloClient = useApolloClient();

  const perform = async (request: HardDeleteMyRoutineTagByIdRequest) => {
    if (typeof navigator !== "undefined" && navigator.onLine === false) {
      throw new NotezyFetchError(FetchClientExceptions.MissingNetwork());
    }
    return await mutationFnHardDeleteMyRoutineTagById(request);
  };

  const mutation = useMutation({
    mutationFn: perform,
    onSuccess: async (response, request: HardDeleteMyRoutineTagByIdRequest) => {
      if (response.success === false) return;
      SessionStorageManipulator.ensureItem(
        SessionStorageKey.csrfToken,
        response.refreshableTokens?.newCSRFToken,
        response.embedded?.publicId
      );
      const targetKeys = [
        queryKeys.routineTag.all(),
        queryKeys.routineTag.oneById(request.body.routineTagId as UUID),
      ];
      await Promise.all(
        targetKeys.map(queryKey => queryClient.invalidateQueries({ queryKey }))
      );
      apolloClient.cache.evict({ fieldName: "searchRoutineTags" });
      apolloClient.cache.evict({ fieldName: "searchRoutines" });
      apolloClient.cache.gc();
      await RoutineTagLocalSynchronizer.syncHardDeleteMyRoutineTagById(
        request,
        response
      );
    },
    onError: async (error, request) => {
      if (
        error instanceof NotezyFetchError &&
        error.unWrap.reason ===
          ExceptionReasonDictionary.client.fetch.missingNetwork
      ) {
        await RoutineTagLocalSimulator.simulateHardDeleteMyRoutineTagById(
          request
        );
      }
    },
  });

  return mutation;
};

export const useHardDeleteMyRoutineTagsByIds = () => {
  const queryClient = getQueryClient();
  const apolloClient = useApolloClient();

  const perform = async (request: HardDeleteMyRoutineTagsByIdsRequest) => {
    if (typeof navigator !== "undefined" && navigator.onLine === false) {
      throw new NotezyFetchError(FetchClientExceptions.MissingNetwork());
    }
    return await mutationFnHardDeleteMyRoutineTagsByIds(request);
  };

  const mutation = useMutation({
    mutationFn: perform,
    onSuccess: async (
      response,
      request: HardDeleteMyRoutineTagsByIdsRequest
    ) => {
      if (response.success === false) return;
      SessionStorageManipulator.ensureItem(
        SessionStorageKey.csrfToken,
        response.refreshableTokens?.newCSRFToken,
        response.embedded?.publicId
      );
      const targetKeys = [
        queryKeys.routineTag.all(),
        ...request.body.routineTagIds.map(routineTagId =>
          queryKeys.routineTag.oneById(routineTagId as UUID)
        ),
      ];
      await Promise.all(
        targetKeys.map(queryKey => queryClient.invalidateQueries({ queryKey }))
      );
      apolloClient.cache.evict({ fieldName: "searchRoutineTags" });
      apolloClient.cache.evict({ fieldName: "searchRoutines" });
      apolloClient.cache.gc();
      await RoutineTagLocalSynchronizer.syncHardDeleteMyRoutineTagsByIds(
        request,
        response
      );
    },
    onError: async (error, request) => {
      if (
        error instanceof NotezyFetchError &&
        error.unWrap.reason ===
          ExceptionReasonDictionary.client.fetch.missingNetwork
      ) {
        await RoutineTagLocalSimulator.simulateHardDeleteMyRoutineTagsByIds(
          request
        );
      }
    },
  });

  return mutation;
};
