import type { UUID } from "node:crypto";
import { useApolloClient } from "@apollo/client/react";
import { NotegicAPIError } from "@shared/api/exceptions";
import { FetchClientExceptions } from "@shared/api/exceptions/client/fetch.exception";
import { ValidationClientException } from "@shared/api/exceptions/client/validation.exception";
import { NotegicFetchError } from "@shared/api/exceptions/errors/fetch.error";
import { NotegicValidationError } from "@shared/api/exceptions/errors/validation.error";
import { toGraphQLRoutineTaskPurpose } from "@shared/api/graphql/conversions";
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
      const routineTask = {
        __typename: "PrivateRoutineTask",
        id: response.data.id,
        routineId: request.body.routineId,
        title: request.body.title,
        purpose: toGraphQLRoutineTaskPurpose(request.body.purpose),
        costUnit: Math.ceil(
          new TextEncoder().encode(JSON.stringify(request.body.payload ?? {}))
            .length / 1024
        ),
        priority: request.body.priority ?? 0,
        maxAttempts: request.body.maxAttempts ?? 1,
        updatedAt: response.data.createdAt,
        createdAt: response.data.createdAt,
      };
      apolloClient.cache.modify({
        fields: {
          searchRoutineTasks(existing, { readField, storeFieldName }) {
            if (!existing?.searchEdges) return existing;
            const input = JSON.parse(
              storeFieldName.slice(storeFieldName.indexOf("(") + 1, -1)
            ).input;
            if (input.after) return existing;
            const query = input.query.trim().toLowerCase();
            if (
              (query && !routineTask.title.toLowerCase().includes(query)) ||
              (input.routineIds.length > 0 &&
                !input.routineIds.includes(routineTask.routineId))
            ) {
              return existing;
            }
            const existed = existing.searchEdges.some(
              (edge: any) => readField("id", edge.node) === routineTask.id
            );
            const edges = existing.searchEdges.filter(
              (edge: any) => readField("id", edge.node) !== routineTask.id
            );
            const searchEdges = [
              {
                __typename: "SearchRoutineTaskEdge",
                encodedSearchCursor: routineTask.id,
                node: routineTask,
              },
              ...edges,
            ];
            return {
              ...existing,
              totalCount: existed
                ? (existing.totalCount ?? searchEdges.length)
                : Math.max(existing.totalCount ?? 0, edges.length) + 1,
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
      const patch = {
        ...("routineId" in request.body.values
          ? { routineId: request.body.values.routineId }
          : {}),
        ...("title" in request.body.values
          ? { title: request.body.values.title }
          : {}),
        ...("purpose" in request.body.values
          ? {
              purpose: toGraphQLRoutineTaskPurpose(request.body.values.purpose),
            }
          : {}),
        ...("priority" in request.body.values
          ? { priority: request.body.values.priority }
          : {}),
        ...("maxAttempts" in request.body.values
          ? { maxAttempts: request.body.values.maxAttempts }
          : {}),
        ...("payload" in request.body.values
          ? { payload: request.body.values.payload }
          : {}),
        updatedAt: response.data.updatedAt,
      };
      apolloClient.cache.modify({
        fields: {
          searchRoutineTasks(existing, { readField, storeFieldName }) {
            if (!existing?.searchEdges) return existing;
            const input = JSON.parse(
              storeFieldName.slice(storeFieldName.indexOf("(") + 1, -1)
            ).input;
            const query = input.query.trim().toLowerCase();
            const searchEdges = existing.searchEdges.flatMap((edge: any) => {
              if (readField("id", edge.node) !== request.body.routineTaskId) {
                return [edge];
              }
              const node = {
                ...edge.node,
                id: request.body.routineTaskId,
                routineId: readField("routineId", edge.node),
                title: readField("title", edge.node),
                ...patch,
              };
              return query && !node.title.toLowerCase().includes(query)
                ? []
                : input.routineIds.length > 0 &&
                    !input.routineIds.includes(node.routineId)
                  ? []
                  : [{ ...edge, node }];
            });
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
