import type { UUID } from "node:crypto";
import { useApolloClient } from "@apollo/client/react";
import { NotezyFetchError } from "@shared/api/exceptions/errors/fetch.error";
import { NotezyValidationError } from "@shared/api/exceptions/errors/validation.error";
import { NotezyAPIError } from "@shared/api/exceptions";
import { FetchClientExceptions } from "@shared/api/exceptions/client/fetch.exception";
import { ValidationClientException } from "@shared/api/exceptions/client/validation.exception";
import {
  RoutinePeriod as GraphQLRoutinePeriod,
  RoutineTaskPurpose as GraphQLRoutineTaskPurpose,
  RoutineTaskStatus as GraphQLRoutineTaskStatus,
} from "@shared/api/graphql/generated/graphql";
import type {
  CreateRoutineTaskByRoutineIdRequest,
  GetAllMyRoutineTasksByRoutineIdsRequest,
  GetAllMyRoutineTasksByRoutineIdsResponse,
  GetAllMyRoutineTasksRequest,
  GetAllMyRoutineTasksResponse,
  GetMyRoutineTaskByIdRequest,
  GetMyRoutineTaskByIdResponse,
  HardDeleteMyRoutineTaskByIdRequest,
  HardDeleteMyRoutineTasksByIdsRequest,
  PauseMyRoutineTaskByIdRequest,
  ResumeMyRoutineTaskByIdRequest,
  UpdateMyRoutineTaskByIdRequest,
  VisualizeMyRoutineTaskActualEndedAtCountRequest,
  VisualizeMyRoutineTaskActualEndedAtCountResponse,
  VisualizeMyRoutineTaskActualStartedAtCountRequest,
  VisualizeMyRoutineTaskActualStartedAtCountResponse,
  VisualizeMyRoutineTaskPurposeCountRequest,
  VisualizeMyRoutineTaskPurposeCountResponse,
  VisualizeMyRoutineTaskScheduledAtCountRequest,
  VisualizeMyRoutineTaskScheduledAtCountResponse,
  VisualizeMyRoutineTaskStatusCountRequest,
  VisualizeMyRoutineTaskStatusCountResponse,
} from "@shared/api/interfaces/routineTask.interface";
import {
  mutationFnCreateRoutineTaskByRoutineId,
  mutationFnHardDeleteMyRoutineTaskById,
  mutationFnHardDeleteMyRoutineTasksByIds,
  mutationFnPauseMyRoutineTaskById,
  mutationFnResumeMyRoutineTaskById,
  mutationFnUpdateMyRoutineTaskById,
  queryFnGetAllMyRoutineTasks,
  queryFnGetAllMyRoutineTasksByRoutineIds,
  queryFnGetMyRoutineTaskById,
  queryFnVisualizeMyRoutineTaskActualEndedAtCount,
  queryFnVisualizeMyRoutineTaskActualStartedAtCount,
  queryFnVisualizeMyRoutineTaskPurposeCount,
  queryFnVisualizeMyRoutineTaskScheduledAtCount,
  queryFnVisualizeMyRoutineTaskStatusCount,
} from "@shared/api/invokers/routineTask.invoker";
import { RoutineTaskLocalSimulator } from "@shared/api/local/simulators/routineTask.simulator";
import { RoutineTaskLocalSynchronizer } from "@shared/api/local/synchronizers/routineTask.synchronizer";
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
import { useVisualizeQuery } from "./visualize.hook";

const getSearchInput = (storeFieldName: string) => {
  const start = storeFieldName.indexOf("(");
  if (start === -1) return undefined;
  try {
    return JSON.parse(storeFieldName.slice(start + 1, -1)).input;
  } catch {
    return undefined;
  }
};

const toGraphQLRoutineTaskPurpose = (purpose?: string | null) =>
  purpose
    ? (GraphQLRoutineTaskPurpose[
        `RoutineTaskPurpose${purpose}` as keyof typeof GraphQLRoutineTaskPurpose
      ] ?? GraphQLRoutineTaskPurpose.RoutineTaskPurposeCreateBlockPack)
    : GraphQLRoutineTaskPurpose.RoutineTaskPurposeCreateBlockPack;

const toGraphQLRoutineTaskStatus = (status?: string | null) =>
  status
    ? {
        Idle: GraphQLRoutineTaskStatus.RoutineTaskStatusIdle,
        Waiting: GraphQLRoutineTaskStatus.RoutineTaskStatusWaiting,
        Running: GraphQLRoutineTaskStatus.RoutineTaskStatusRunning,
        Pause: GraphQLRoutineTaskStatus.RoutineTaskStatusPause,
      }[status]
    : GraphQLRoutineTaskStatus.RoutineTaskStatusIdle;

const toGraphQLRoutinePeriod = (period?: string | null) =>
  period
    ? {
        Daily: GraphQLRoutinePeriod.RoutinePeriodDaily,
        Weekly: GraphQLRoutinePeriod.RoutinePeriodWeekly,
        Monthly: GraphQLRoutinePeriod.RoutinePeriodMonthly,
      }[period]
    : null;

const routineTaskMatchesSearchInput = (routineTask: any, input: any) => {
  const query = input?.query?.trim().toLowerCase();
  if (query && !routineTask.title.toLowerCase().includes(query)) return false;
  if (
    input?.routineIds?.length > 0 &&
    !input.routineIds.includes(routineTask.routineId)
  ) {
    return false;
  }
  return true;
};

const upsertSearchRoutineTask = (
  apolloClient: ReturnType<typeof useApolloClient>,
  routineTask: any
) => {
  apolloClient.cache.modify({
    fields: {
      searchRoutineTasks(existing, { readField, storeFieldName }) {
        if (!existing?.searchEdges) return existing;
        const input = getSearchInput(storeFieldName);
        if (input?.after) return existing;
        if (!routineTaskMatchesSearchInput(routineTask, input)) return existing;

        const existed = existing.searchEdges.some(
          (edge: any) => readField("id", edge.node) === routineTask.id
        );
        const edges = existing.searchEdges.filter(
          (edge: any) => readField("id", edge.node) !== routineTask.id
        );
        const nextEdges = [
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
            ? (existing.totalCount ?? nextEdges.length)
            : Math.max(existing.totalCount ?? 0, edges.length) + 1,
          searchEdges: nextEdges,
        };
      },
    },
  });
};

const patchSearchRoutineTask = (
  apolloClient: ReturnType<typeof useApolloClient>,
  routineTaskId: string,
  patch: any
) => {
  apolloClient.cache.modify({
    fields: {
      searchRoutineTasks(existing, { readField, storeFieldName }) {
        if (!existing?.searchEdges) return existing;
        const input = getSearchInput(storeFieldName);
        const nextEdges = existing.searchEdges.flatMap((edge: any) => {
          if (readField("id", edge.node) !== routineTaskId) return [edge];
          const node = {
            ...edge.node,
            id: routineTaskId,
            routineId: readField("routineId", edge.node),
            title: readField("title", edge.node),
            ...patch,
          };
          return routineTaskMatchesSearchInput(node, input)
            ? [{ ...edge, node }]
            : [];
        });
        return {
          ...existing,
          totalCount: Math.max(
            0,
            (existing.totalCount ?? nextEdges.length) -
              (existing.searchEdges.length - nextEdges.length)
          ),
          searchEdges: nextEdges,
        };
      },
    },
  });
};

const removeSearchRoutineTasks = (
  apolloClient: ReturnType<typeof useApolloClient>,
  routineTaskIds: string[]
) => {
  apolloClient.cache.modify({
    fields: {
      searchRoutineTasks(existing, { readField }) {
        if (!existing?.searchEdges) return existing;
        const nextEdges = existing.searchEdges.filter(
          (edge: any) =>
            !routineTaskIds.includes(readField("id", edge.node) as string)
        );
        return {
          ...existing,
          totalCount: Math.max(
            0,
            (existing.totalCount ?? nextEdges.length) -
              (existing.searchEdges.length - nextEdges.length)
          ),
          searchEdges: nextEdges,
        };
      },
    },
  });
};

export const useVisualizeMyRoutineTaskStatusCount = (
  request?: VisualizeMyRoutineTaskStatusCountRequest,
  options?: Partial<
    UseQueryOptions<VisualizeMyRoutineTaskStatusCountResponse, Error>
  >
) =>
  useVisualizeQuery(
    request,
    currentRequest =>
      queryKeys.routineTask.visualizeMyStatusCount(
        currentRequest?.param.permission
      ),
    queryFnVisualizeMyRoutineTaskStatusCount,
    options
  );

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

export const useVisualizeMyRoutineTaskScheduledAtCount = (
  request?: VisualizeMyRoutineTaskScheduledAtCountRequest,
  options?: Partial<
    UseQueryOptions<VisualizeMyRoutineTaskScheduledAtCountResponse, Error>
  >
) =>
  useVisualizeQuery(
    request,
    currentRequest =>
      queryKeys.routineTask.visualizeMyScheduledAtCount(
        currentRequest?.param.permission,
        currentRequest?.param.timeHourUnit,
        currentRequest?.param.queryRangeStartedAt,
        currentRequest?.param.queryRangeEndedAt
      ),
    queryFnVisualizeMyRoutineTaskScheduledAtCount,
    options
  );

export const useVisualizeMyRoutineTaskActualStartedAtCount = (
  request?: VisualizeMyRoutineTaskActualStartedAtCountRequest,
  options?: Partial<
    UseQueryOptions<VisualizeMyRoutineTaskActualStartedAtCountResponse, Error>
  >
) =>
  useVisualizeQuery(
    request,
    currentRequest =>
      queryKeys.routineTask.visualizeMyActualStartedAtCount(
        currentRequest?.param.permission,
        currentRequest?.param.timeHourUnit,
        currentRequest?.param.queryRangeStartedAt,
        currentRequest?.param.queryRangeEndedAt
      ),
    queryFnVisualizeMyRoutineTaskActualStartedAtCount,
    options
  );

export const useVisualizeMyRoutineTaskActualEndedAtCount = (
  request?: VisualizeMyRoutineTaskActualEndedAtCountRequest,
  options?: Partial<
    UseQueryOptions<VisualizeMyRoutineTaskActualEndedAtCountResponse, Error>
  >
) =>
  useVisualizeQuery(
    request,
    currentRequest =>
      queryKeys.routineTask.visualizeMyActualEndedAtCount(
        currentRequest?.param.permission,
        currentRequest?.param.timeHourUnit,
        currentRequest?.param.queryRangeStartedAt,
        currentRequest?.param.queryRangeEndedAt
      ),
    queryFnVisualizeMyRoutineTaskActualEndedAtCount,
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
      throw new NotezyValidationError(
        ValidationClientException.ReceivedUndefinedRequest()
      );
    }

    try {
      if (typeof navigator !== "undefined" && navigator.onLine === false) {
        throw new NotezyFetchError(FetchClientExceptions.MissingNetwork());
      }

      const response = await queryFnGetMyRoutineTaskById(request);
      SessionStorageManipulator.ensureItem(
        SessionStorageKey.csrfToken,
        response.refreshableTokens?.newCSRFToken,
        response.embedded?.publicId
      );
      await RoutineTaskLocalSynchronizer.syncGetMyRoutineTaskById(response);
      return response;
    } catch (error) {
      if (
        error instanceof NotezyAPIError ||
        error instanceof NotezyFetchError
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

export const useGetAllMyRoutineTasksByRoutineIds = (
  hookRequest?: GetAllMyRoutineTasksByRoutineIdsRequest,
  options?: Partial<
    UseQueryOptions<GetAllMyRoutineTasksByRoutineIdsResponse, Error>
  >
) => {
  const queryClient = getQueryClient();

  const perform = async (
    request?: GetAllMyRoutineTasksByRoutineIdsRequest
  ): Promise<GetAllMyRoutineTasksByRoutineIdsResponse> => {
    if (!request) {
      throw new NotezyValidationError(
        ValidationClientException.ReceivedUndefinedRequest()
      );
    }

    try {
      if (typeof navigator !== "undefined" && navigator.onLine === false) {
        throw new NotezyFetchError(FetchClientExceptions.MissingNetwork());
      }

      const response = await queryFnGetAllMyRoutineTasksByRoutineIds(request);
      SessionStorageManipulator.ensureItem(
        SessionStorageKey.csrfToken,
        response.refreshableTokens?.newCSRFToken,
        response.embedded.publicId
      );
      await RoutineTaskLocalSynchronizer.syncGetAllMyRoutineTasksByRoutineIds(
        response
      );
      return response;
    } catch (error) {
      if (
        error instanceof NotezyAPIError ||
        error instanceof NotezyFetchError
      ) {
        const routineTasks =
          await RoutineTaskLocalSimulator.simulateGetAllMyRoutineTasksByRoutineIds(
            request
          );
        return {
          success: false,
          data: routineTasks,
          exception: error.unWrap,
          embedded: { publicId: "" },
        } as GetAllMyRoutineTasksByRoutineIdsResponse;
      }

      throw error;
    }
  };

  const query = useQuery<GetAllMyRoutineTasksByRoutineIdsResponse, Error>({
    queryKey: queryKeys.routineTask.manyByRoutineIds(
      hookRequest?.param.routineIds as UUID[] | undefined,
      hookRequest?.param.areDeleted ?? false
    ),
    queryFn: async () => perform(hookRequest),
    staleTime: UseQueryDefaultOptions.staleTime,
    refetchOnWindowFocus: UseQueryDefaultOptions.refetchOnWindowFocus,
    refetchOnMount: UseQueryDefaultOptions.refetchOnMount,
    ...options,
    enabled: hookRequest ? (options?.enabled ?? true) : false,
  });

  const fetch = async (
    callbackRequest: GetAllMyRoutineTasksByRoutineIdsRequest
  ): Promise<GetAllMyRoutineTasksByRoutineIdsResponse> => {
    return queryClient.fetchQuery({
      queryKey: queryKeys.routineTask.manyByRoutineIds(
        callbackRequest.param.routineIds as UUID[],
        callbackRequest.param.areDeleted ?? false
      ),
      queryFn: async () => perform(callbackRequest),
      staleTime: UseQueryDefaultOptions.staleTime,
      ...options,
    });
  };

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
      throw new NotezyValidationError(
        ValidationClientException.ReceivedUndefinedRequest()
      );
    }

    try {
      if (typeof navigator !== "undefined" && navigator.onLine === false) {
        throw new NotezyFetchError(FetchClientExceptions.MissingNetwork());
      }

      const response = await queryFnGetAllMyRoutineTasks(request);
      SessionStorageManipulator.ensureItem(
        SessionStorageKey.csrfToken,
        response.refreshableTokens?.newCSRFToken,
        response.embedded.publicId
      );
      await RoutineTaskLocalSynchronizer.syncGetAllMyRoutineTasks(response);
      return response;
    } catch (error) {
      if (
        error instanceof NotezyAPIError ||
        error instanceof NotezyFetchError
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
        response.refreshableTokens?.newCSRFToken,
        response.embedded?.publicId
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
      const scheduledAt =
        request.body.nextScheduledAt ?? response.data.createdAt;
      upsertSearchRoutineTask(apolloClient, {
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
        status: GraphQLRoutineTaskStatus.RoutineTaskStatusIdle,
        attempts: 0,
        maxAttempts: request.body.maxAttempts ?? 1,
        period: toGraphQLRoutinePeriod(request.body.period),
        nextScheduledAt: scheduledAt,
        scheduledAt,
        actualStartedAt: null,
        actualEndedAt: null,
        updatedAt: response.data.createdAt,
        createdAt: response.data.createdAt,
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
        response.refreshableTokens?.newCSRFToken,
        response.embedded?.publicId
      );
      const targetKeys = [
        queryKeys.routineTask.all(),
        queryKeys.routineTask.myAll(),
        queryKeys.routineTask.oneById(request.body.routineTaskId as UUID),
      ];
      await Promise.all(
        targetKeys.map(queryKey => queryClient.invalidateQueries({ queryKey }))
      );
      patchSearchRoutineTask(apolloClient, request.body.routineTaskId, {
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
        ...("period" in request.body.values
          ? { period: toGraphQLRoutinePeriod(request.body.values.period) }
          : {}),
        ...("nextScheduledAt" in request.body.values
          ? { nextScheduledAt: request.body.values.nextScheduledAt }
          : {}),
        updatedAt: response.data.updatedAt,
      });
      apolloClient.cache.gc();
    },
    onError: error => {},
  });

  return mutation;
};

export const usePauseMyRoutineTaskById = () => {
  const queryClient = getQueryClient();
  const apolloClient = useApolloClient();

  const mutation = useMutation({
    mutationFn: mutationFnPauseMyRoutineTaskById,
    onSuccess: async (response, request: PauseMyRoutineTaskByIdRequest) => {
      SessionStorageManipulator.ensureItem(
        SessionStorageKey.csrfToken,
        response.refreshableTokens?.newCSRFToken,
        response.embedded?.publicId
      );
      const targetKeys = [
        queryKeys.routineTask.all(),
        queryKeys.routineTask.myAll(),
        queryKeys.routineTask.oneById(request.body.routineTaskId as UUID),
      ];
      await Promise.all(
        targetKeys.map(queryKey => queryClient.invalidateQueries({ queryKey }))
      );
      patchSearchRoutineTask(apolloClient, request.body.routineTaskId, {
        status: GraphQLRoutineTaskStatus.RoutineTaskStatusPause,
        updatedAt: response.data.updatedAt,
      });
      apolloClient.cache.gc();
    },
    onError: error => {},
  });

  return mutation;
};

export const useResumeMyRoutineTaskById = () => {
  const queryClient = getQueryClient();
  const apolloClient = useApolloClient();

  const mutation = useMutation({
    mutationFn: mutationFnResumeMyRoutineTaskById,
    onSuccess: async (response, request: ResumeMyRoutineTaskByIdRequest) => {
      SessionStorageManipulator.ensureItem(
        SessionStorageKey.csrfToken,
        response.refreshableTokens?.newCSRFToken,
        response.embedded?.publicId
      );
      const targetKeys = [
        queryKeys.routineTask.all(),
        queryKeys.routineTask.myAll(),
        queryKeys.routineTask.oneById(request.body.routineTaskId as UUID),
      ];
      await Promise.all(
        targetKeys.map(queryKey => queryClient.invalidateQueries({ queryKey }))
      );
      patchSearchRoutineTask(apolloClient, request.body.routineTaskId, {
        status: GraphQLRoutineTaskStatus.RoutineTaskStatusIdle,
        updatedAt: response.data.updatedAt,
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
        response.refreshableTokens?.newCSRFToken,
        response.embedded?.publicId
      );
      const targetKeys = [
        queryKeys.routineTask.all(),
        queryKeys.routineTask.myAll(),
        queryKeys.routineTask.oneById(request.body.routineTaskId as UUID),
      ];
      await Promise.all(
        targetKeys.map(queryKey => queryClient.invalidateQueries({ queryKey }))
      );
      removeSearchRoutineTasks(apolloClient, [request.body.routineTaskId]);
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
        response.refreshableTokens?.newCSRFToken,
        response.embedded?.publicId
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
      removeSearchRoutineTasks(apolloClient, request.body.routineTaskIds);
      apolloClient.cache.gc();
    },
    onError: error => {},
  });

  return mutation;
};
