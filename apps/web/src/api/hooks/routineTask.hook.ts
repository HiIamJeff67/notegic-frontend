import type { UUID } from "node:crypto";
import { useApolloClient } from "@apollo/client/react";
import { NotegicAPIError } from "@shared/api/exceptions";
import { FetchClientExceptions } from "@shared/api/exceptions/client/fetch.exception";
import { ValidationClientException } from "@shared/api/exceptions/client/validation.exception";
import { NotegicFetchError } from "@shared/api/exceptions/errors/fetch.error";
import { NotegicValidationError } from "@shared/api/exceptions/errors/validation.error";
import type {
  CreateRoutineTaskByRoutineIdRequest,
  GetAllMyRoutineTasksRequest,
  GetAllMyRoutineTasksResponse,
  GetMyRoutineTaskByIdRequest,
  GetMyRoutineTaskByIdResponse,
  GetMyRoutineTasksByRoutineIdRequest,
  GetMyRoutineTasksByRoutineIdResponse,
  HardDeleteMyRoutineTaskByIdRequest,
  HardDeleteMyRoutineTasksByIdsRequest,
  UpdateMyRoutineTaskByIdRequest,
  VisualizeMyRoutineTaskPurposeCountRequest,
  VisualizeMyRoutineTaskPurposeCountResponse,
} from "@shared/api/interfaces/routineTask.interface";
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
import { useCallback } from "react";
import {
  mutationFnCreateRoutineTaskByRoutineId,
  mutationFnHardDeleteMyRoutineTaskById,
  mutationFnHardDeleteMyRoutineTasksByIds,
  mutationFnUpdateMyRoutineTaskById,
  queryFnGetAllMyRoutineTasks,
  queryFnGetMyRoutineTaskById,
  queryFnGetMyRoutineTasksByRoutineId,
  queryFnVisualizeMyRoutineTaskPurposeCount,
} from "@/api/invokers/routineTask.invoker";
import { RoutineTaskLocalSimulator } from "@/api/local/simulators/routineTask.simulator";
import { RoutineTaskLocalSynchronizer } from "@/api/local/synchronizers/routineTask.synchronizer";
import { useVisualizeQuery } from "./visualize.hook";

export const useVisualizeMyRoutineTaskPurposeCount = (
  request?: VisualizeMyRoutineTaskPurposeCountRequest,
  options?: Partial<
    UseQueryOptions<VisualizeMyRoutineTaskPurposeCountResponse, Error>
  >
) =>
  useVisualizeQuery(
    request,
    currentRequest =>
      queryKeys.routineTask.visualizeMyPurposeCount(
        currentRequest?.param.permission
      ),
    queryFnVisualizeMyRoutineTaskPurposeCount,
    options
  );

export const useGetMyRoutineTaskById = (
  hookRequest?: GetMyRoutineTaskByIdRequest,
  options?: Partial<UseQueryOptions<GetMyRoutineTaskByIdResponse, Error>>
) => {
  const queryClient = getQueryClient();

  const perform = async (
    request?: GetMyRoutineTaskByIdRequest
  ): Promise<GetMyRoutineTaskByIdResponse> => {
    if (!request) {
      throw new NotegicValidationError(
        ValidationClientException.ReceivedUndefinedRequest()
      );
    }

    try {
      if (typeof navigator !== "undefined" && navigator.onLine === false) {
        throw new NotegicFetchError(FetchClientExceptions.MissingNetwork());
      }

      const response = await queryFnGetMyRoutineTaskById(request);
      SessionStorageManipulator.ensureItem(
        SessionStorageKey.csrfToken,
        response.refreshableTokens?.newCSRFToken
      );
      await RoutineTaskLocalSynchronizer.syncGetMyRoutineTaskById(response);
      return response;
    } catch (error) {
      if (
        error instanceof NotegicAPIError ||
        error instanceof NotegicFetchError
      ) {
        const routineTask =
          await RoutineTaskLocalSimulator.simulateGetMyRoutineTaskById(request);
        return {
          success: false,
          data: routineTask,
          exception: error.unWrap,
          embedded: { publicId: "" },
        } as GetMyRoutineTaskByIdResponse;
      }

      throw error;
    }
  };

  const query = useQuery<GetMyRoutineTaskByIdResponse, Error>({
    queryKey: queryKeys.routineTask.oneById(
      hookRequest?.param.routineTaskId as UUID | undefined,
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
    callbackRequest: GetMyRoutineTaskByIdRequest
  ): Promise<GetMyRoutineTaskByIdResponse> => {
    return queryClient.fetchQuery({
      queryKey: queryKeys.routineTask.oneById(
        callbackRequest.param.routineTaskId as UUID | undefined,
        callbackRequest.param.isDeleted ?? false
      ),
      queryFn: async () => perform(callbackRequest),
      staleTime: UseQueryDefaultOptions.staleTime,
      ...options,
    });
  };

  return { ...query, fetch };
};

export const useGetMyRoutineTasksByRoutineId = (
  hookRequest?: GetMyRoutineTasksByRoutineIdRequest,
  options?: Partial<
    UseQueryOptions<GetMyRoutineTasksByRoutineIdResponse, Error>
  >
) => {
  const queryClient = getQueryClient();

  const perform = useCallback(
    async (
      request?: GetMyRoutineTasksByRoutineIdRequest
    ): Promise<GetMyRoutineTasksByRoutineIdResponse> => {
      if (!request) {
        throw new NotegicValidationError(
          ValidationClientException.ReceivedUndefinedRequest()
        );
      }

      try {
        if (typeof navigator !== "undefined" && navigator.onLine === false) {
          throw new NotegicFetchError(FetchClientExceptions.MissingNetwork());
        }

        const response = await queryFnGetMyRoutineTasksByRoutineId(request);
        SessionStorageManipulator.ensureItem(
          SessionStorageKey.csrfToken,
          response.refreshableTokens?.newCSRFToken
        );
        await RoutineTaskLocalSynchronizer.syncGetMyRoutineTasksByRoutineId(
          response
        );
        return response;
      } catch (error) {
        if (
          error instanceof NotegicAPIError ||
          error instanceof NotegicFetchError
        ) {
          const routineTasks =
            await RoutineTaskLocalSimulator.simulateGetMyRoutineTasksByRoutineId(
              request
            );
          return {
            success: false,
            data: routineTasks,
            exception: error.unWrap,
            embedded: { publicId: "" },
          } as GetMyRoutineTasksByRoutineIdResponse;
        }

        throw error;
      }
    },
    []
  );

  const query = useQuery<GetMyRoutineTasksByRoutineIdResponse, Error>({
    queryKey: queryKeys.routineTask.manyByRoutineId(
      hookRequest?.param.routineId as UUID | undefined,
      hookRequest?.param.areDeleted ?? false
    ),
    queryFn: async () => perform(hookRequest),
    staleTime: UseQueryDefaultOptions.staleTime,
    refetchOnWindowFocus: UseQueryDefaultOptions.refetchOnWindowFocus,
    refetchOnMount: UseQueryDefaultOptions.refetchOnMount,
    ...options,
    enabled: hookRequest ? (options?.enabled ?? true) : false,
  });

  const fetch = useCallback(
    async (
      callbackRequest: GetMyRoutineTasksByRoutineIdRequest
    ): Promise<GetMyRoutineTasksByRoutineIdResponse> =>
      queryClient.fetchQuery({
        queryKey: queryKeys.routineTask.manyByRoutineId(
          callbackRequest.param.routineId as UUID,
          callbackRequest.param.areDeleted ?? false
        ),
        queryFn: async () => perform(callbackRequest),
        staleTime: UseQueryDefaultOptions.staleTime,
        ...options,
      }),
    [options, perform, queryClient]
  );

  return { ...query, fetch };
};

export const useGetAllMyRoutineTasks = (
  hookRequest?: GetAllMyRoutineTasksRequest,
  options?: Partial<UseQueryOptions<GetAllMyRoutineTasksResponse, Error>>
) => {
  const queryClient = getQueryClient();

  const perform = async (
    request?: GetAllMyRoutineTasksRequest
  ): Promise<GetAllMyRoutineTasksResponse> => {
    if (!request) {
      throw new NotegicValidationError(
        ValidationClientException.ReceivedUndefinedRequest()
      );
    }

    try {
      if (typeof navigator !== "undefined" && navigator.onLine === false) {
        throw new NotegicFetchError(FetchClientExceptions.MissingNetwork());
      }

      const response = await queryFnGetAllMyRoutineTasks(request);
      SessionStorageManipulator.ensureItem(
        SessionStorageKey.csrfToken,
        response.refreshableTokens?.newCSRFToken
      );
      await RoutineTaskLocalSynchronizer.syncGetAllMyRoutineTasks(response);
      return response;
    } catch (error) {
      if (
        error instanceof NotegicAPIError ||
        error instanceof NotegicFetchError
      ) {
        const routineTasks =
          await RoutineTaskLocalSimulator.simulateGetAllMyRoutineTasks(request);
        return {
          success: false,
          data: routineTasks,
          exception: error.unWrap,
          embedded: { publicId: "" },
        } as GetAllMyRoutineTasksResponse;
      }

      throw error;
    }
  };

  const query = useQuery<GetAllMyRoutineTasksResponse, Error>({
    queryKey: queryKeys.routineTask.myAll(
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
    callbackRequest: GetAllMyRoutineTasksRequest
  ): Promise<GetAllMyRoutineTasksResponse> => {
    return queryClient.fetchQuery({
      queryKey: queryKeys.routineTask.myAll(
        callbackRequest.param?.areDeleted ?? false
      ),
      queryFn: async () => perform(callbackRequest),
      staleTime: UseQueryDefaultOptions.staleTime,
      ...options,
    });
  };

  return { ...query, fetch };
};

export const useCreateRoutineTaskByRoutineId = () => {
  const queryClient = getQueryClient();
  const apolloClient = useApolloClient();

  const mutation = useMutation({
    mutationFn: mutationFnCreateRoutineTaskByRoutineId,
    onSuccess: async (
      response,
      request: CreateRoutineTaskByRoutineIdRequest
    ) => {
      SessionStorageManipulator.ensureItem(
        SessionStorageKey.csrfToken,
        response.refreshableTokens?.newCSRFToken
      );
      const targetKeys = [
        queryKeys.routineTask.all(),
        queryKeys.routineTask.myAll(),
        queryKeys.routineTask.oneById(response.data.id as UUID),
        queryKeys.routineTask.manyByRoutineId(request.body.routineId as UUID),
      ];
      await Promise.all(
        targetKeys.map(queryKey => queryClient.invalidateQueries({ queryKey }))
      );
      apolloClient.cache.evict({ fieldName: "searchRoutineTasks" });
      apolloClient.cache.evict({ fieldName: "searchRoutines" });
      apolloClient.cache.gc();
    },
    onError: error => {},
  });

  return mutation;
};

export const useUpdateMyRoutineTaskById = () => {
  const queryClient = getQueryClient();
  const apolloClient = useApolloClient();

  const mutation = useMutation({
    mutationFn: mutationFnUpdateMyRoutineTaskById,
    onSuccess: async (response, request: UpdateMyRoutineTaskByIdRequest) => {
      SessionStorageManipulator.ensureItem(
        SessionStorageKey.csrfToken,
        response.refreshableTokens?.newCSRFToken
      );
      const targetKeys = [
        queryKeys.routineTask.all(),
        queryKeys.routineTask.myAll(),
        queryKeys.routineTask.oneById(request.body.routineTaskId as UUID),
      ];
      await Promise.all(
        targetKeys.map(queryKey => queryClient.invalidateQueries({ queryKey }))
      );
      apolloClient.cache.evict({ fieldName: "searchRoutineTasks" });
      if ("routineId" in request.body.values) {
        apolloClient.cache.evict({ fieldName: "searchRoutines" });
      }
      apolloClient.cache.gc();
    },
    onError: error => {},
  });

  return mutation;
};

export const useHardDeleteMyRoutineTaskById = () => {
  const queryClient = getQueryClient();
  const apolloClient = useApolloClient();

  const mutation = useMutation({
    mutationFn: mutationFnHardDeleteMyRoutineTaskById,
    onSuccess: async (
      response,
      request: HardDeleteMyRoutineTaskByIdRequest
    ) => {
      SessionStorageManipulator.ensureItem(
        SessionStorageKey.csrfToken,
        response.refreshableTokens?.newCSRFToken
      );
      const targetKeys = [
        queryKeys.routineTask.all(),
        queryKeys.routineTask.myAll(),
        queryKeys.routineTask.oneById(request.body.routineTaskId as UUID),
      ];
      await Promise.all(
        targetKeys.map(queryKey => queryClient.invalidateQueries({ queryKey }))
      );
      apolloClient.cache.modify({
        fields: {
          searchRoutineTasks(existing, { readField }) {
            if (!existing?.searchEdges) return existing;
            const searchEdges = existing.searchEdges.filter(
              (edge: any) =>
                readField("id", edge.node) !== request.body.routineTaskId
            );
            return {
              ...existing,
              totalCount: Math.max(
                0,
                (existing.totalCount ?? searchEdges.length) -
                  (existing.searchEdges.length - searchEdges.length)
              ),
              searchEdges,
            };
          },
        },
      });
      apolloClient.cache.gc();
    },
    onError: error => {},
  });

  return mutation;
};

export const useHardDeleteMyRoutineTasksByIds = () => {
  const queryClient = getQueryClient();
  const apolloClient = useApolloClient();

  const mutation = useMutation({
    mutationFn: mutationFnHardDeleteMyRoutineTasksByIds,
    onSuccess: async (
      response,
      request: HardDeleteMyRoutineTasksByIdsRequest
    ) => {
      SessionStorageManipulator.ensureItem(
        SessionStorageKey.csrfToken,
        response.refreshableTokens?.newCSRFToken
      );
      const targetKeys = [
        queryKeys.routineTask.all(),
        queryKeys.routineTask.myAll(),
        ...request.body.routineTaskIds.map(routineTaskId =>
          queryKeys.routineTask.oneById(routineTaskId as UUID)
        ),
      ];
      await Promise.all(
        targetKeys.map(queryKey => queryClient.invalidateQueries({ queryKey }))
      );
      apolloClient.cache.modify({
        fields: {
          searchRoutineTasks(existing, { readField }) {
            if (!existing?.searchEdges) return existing;
            const searchEdges = existing.searchEdges.filter(
              (edge: any) =>
                !request.body.routineTaskIds.includes(
                  readField("id", edge.node) as string
                )
            );
            return {
              ...existing,
              totalCount: Math.max(
                0,
                (existing.totalCount ?? searchEdges.length) -
                  (existing.searchEdges.length - searchEdges.length)
              ),
              searchEdges,
            };
          },
        },
      });
      apolloClient.cache.gc();
    },
    onError: error => {},
  });

  return mutation;
};
