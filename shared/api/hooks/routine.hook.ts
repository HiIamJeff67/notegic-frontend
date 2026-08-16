import type { UUID } from "node:crypto";
import { useApolloClient } from "@apollo/client/react";
import { NotegicFetchError } from "@shared/api/exceptions/errors/fetch.error";
import { NotegicValidationError } from "@shared/api/exceptions/errors/validation.error";
import {
  ExceptionReasonDictionary,
  NotegicAPIError,
} from "@shared/api/exceptions";
import { FetchClientExceptions } from "@shared/api/exceptions/client/fetch.exception";
import { ValidationClientException } from "@shared/api/exceptions/client/validation.exception";
import {
  FragmentedBasicPrivateSearchableRoutineFragmentDoc,
  RoutinePeriod as GraphQLRoutinePeriod,
  RoutineStatus as GraphQLRoutineStatus,
} from "@shared/api/graphql/generated/graphql";
import type {
  CreateRoutineByStationIdRequest,
  CreateRoutinesByStationIdsRequest,
  DeleteMyRoutineByIdRequest,
  DeleteMyRoutinesByIdsRequest,
  GetAllMyRoutinesByTimeRangeRequest,
  GetAllMyRoutinesByTimeRangeResponse,
  GetMyRoutineByIdRequest,
  GetMyRoutineByIdResponse,
  GetMyRoutinesByStationIdRequest,
  GetMyRoutinesByStationIdResponse,
  HardDeleteMyRoutineByIdRequest,
  HardDeleteMyRoutinesByIdsRequest,
  LinkRoutineItemByIdRequest,
  LinkRoutineItemsByIdsRequest,
  LinkRoutineTagByIdRequest,
  LinkRoutineTagsByIdsRequest,
  LinkRoutineTaskByIdRequest,
  LinkRoutineTasksByIdsRequest,
  RestoreMyRoutineByIdRequest,
  RestoreMyRoutinesByIdsRequest,
  UpdateMyRoutineByIdRequest,
  UpdateMyRoutinesByIdsRequest,
  VisualizeMyRoutinePeriodCountRequest,
  VisualizeMyRoutinePeriodCountResponse,
  VisualizeMyRoutineScheduledEndAtCountRequest,
  VisualizeMyRoutineScheduledEndAtCountResponse,
  VisualizeMyRoutineScheduledStartAtCountRequest,
  VisualizeMyRoutineScheduledStartAtCountResponse,
  VisualizeMyRoutineStatusCountRequest,
  VisualizeMyRoutineStatusCountResponse,
} from "@shared/api/interfaces/routine.interface";
import {
  mutationFnCreateRoutineByStationId,
  mutationFnCreateRoutinesByStationIds,
  mutationFnDeleteMyRoutineById,
  mutationFnDeleteMyRoutinesByIds,
  mutationFnHardDeleteMyRoutineById,
  mutationFnHardDeleteMyRoutinesByIds,
  mutationFnLinkRoutineItemById,
  mutationFnLinkRoutineItemsByIds,
  mutationFnLinkRoutineTagById,
  mutationFnLinkRoutineTagsByIds,
  mutationFnLinkRoutineTaskById,
  mutationFnLinkRoutineTasksByIds,
  mutationFnRestoreMyRoutineById,
  mutationFnRestoreMyRoutinesByIds,
  mutationFnUpdateMyRoutineById,
  mutationFnUpdateMyRoutinesByIds,
  queryFnGetAllMyRoutinesByTimeRange,
  queryFnGetMyRoutineById,
  queryFnGetMyRoutinesByStationId,
  queryFnVisualizeMyRoutinePeriodCount,
  queryFnVisualizeMyRoutineScheduledEndAtCount,
  queryFnVisualizeMyRoutineScheduledStartAtCount,
  queryFnVisualizeMyRoutineStatusCount,
} from "@shared/api/invokers/routine.invoker";
import { RoutineLocalSimulator } from "@shared/api/local/simulators/routine.simulator";
import { RoutineLocalSynchronizer } from "@shared/api/local/synchronizers/routine.synchronizer";
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

const toGraphQLRoutineStatus = (status?: string | null) =>
  status
    ? {
        Scheduled: GraphQLRoutineStatus.RoutineStatusScheduled,
        InProgress: GraphQLRoutineStatus.RoutineStatusInProgress,
        Completed: GraphQLRoutineStatus.RoutineStatusCompleted,
        OverDue: GraphQLRoutineStatus.RoutineStatusOverDue,
      }[status]
    : GraphQLRoutineStatus.RoutineStatusScheduled;

const toGraphQLRoutinePeriod = (period?: string | null) =>
  period
    ? {
        Daily: GraphQLRoutinePeriod.RoutinePeriodDaily,
        Weekly: GraphQLRoutinePeriod.RoutinePeriodWeekly,
        Monthly: GraphQLRoutinePeriod.RoutinePeriodMonthly,
      }[period]
    : null;

const toSearchRoutinePatch = (values: Record<string, any>, updatedAt: Date) => {
  const patch: Record<string, any> = { updatedAt };
  for (const key of [
    "stationId",
    "title",
    "isPinned",
    "scheduledStartAt",
    "scheduledEndAt",
    "timezone",
  ]) {
    if (values[key] !== undefined) patch[key] = values[key];
  }
  if (values.status !== undefined)
    patch.status = toGraphQLRoutineStatus(values.status);
  if (values.period !== undefined)
    patch.period = toGraphQLRoutinePeriod(values.period);
  return patch;
};

const routineMatchesSearchInput = (routine: any, input: any) => {
  const query = input?.query?.trim().toLowerCase();
  const stationIds = input?.stationIds ?? [];
  const tagIds = input?.tagIds ?? [];
  if (query && !routine.title.toLowerCase().includes(query)) return false;
  if (stationIds.length > 0 && !stationIds.includes(routine.stationId))
    return false;
  if (
    tagIds.length > 0 &&
    !tagIds.some((tagId: string) => routine.tagIds.includes(tagId))
  )
    return false;
  return true;
};

const upsertSearchRoutine = (
  apolloClient: ReturnType<typeof useApolloClient>,
  routine: any
) => {
  apolloClient.cache.modify({
    fields: {
      searchRoutines(existing, { readField, storeFieldName }) {
        if (!existing?.searchEdges) return existing;
        const input = getSearchInput(storeFieldName);
        if (input?.after) return existing;
        if (!routineMatchesSearchInput(routine, input)) return existing;

        const existed = existing.searchEdges.some(
          (edge: any) => readField("id", edge.node) === routine.id
        );
        const edges = existing.searchEdges.filter(
          (edge: any) => readField("id", edge.node) !== routine.id
        );
        const nextEdges = [
          {
            __typename: "SearchRoutineEdge",
            encodedSearchCursor: routine.id,
            node: routine,
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

const patchSearchRoutine = (
  apolloClient: ReturnType<typeof useApolloClient>,
  routineId: string,
  patch: any
) => {
  apolloClient.cache.modify({
    fields: {
      searchRoutines(existing, { readField, storeFieldName }) {
        if (!existing?.searchEdges) return existing;
        const input = getSearchInput(storeFieldName);
        const nextEdges = existing.searchEdges.flatMap((edge: any) => {
          if (readField("id", edge.node) !== routineId) return [edge];
          const node = {
            ...edge.node,
            id: routineId,
            stationId: readField("stationId", edge.node),
            title: readField("title", edge.node),
            tagIds: (readField("tagIds", edge.node) as string[]) ?? [],
            ...patch,
          };
          return routineMatchesSearchInput(node, input)
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

const patchSearchRoutineIdList = (
  apolloClient: ReturnType<typeof useApolloClient>,
  routineId: string,
  fieldName: "tagIds" | "taskIds" | "itemIds",
  value: string,
  isRemove: boolean
) => {
  const cachedRoutine = apolloClient.cache.readFragment<any>({
    id: apolloClient.cache.identify({
      __typename: "PrivateSearchableRoutine",
      id: routineId,
    }),
    fragment: FragmentedBasicPrivateSearchableRoutineFragmentDoc,
  });
  const currentIds = (cachedRoutine?.[fieldName] as string[] | undefined) ?? [];
  const nextIds = isRemove
    ? currentIds.filter(id => id !== value)
    : Array.from(new Set([...currentIds, value]));
  const patchedRoutine = cachedRoutine
    ? { ...cachedRoutine, [fieldName]: nextIds }
    : null;

  const cacheId = apolloClient.cache.identify({
    __typename: "PrivateSearchableRoutine",
    id: routineId,
  });
  if (cacheId) {
    apolloClient.cache.modify({
      id: cacheId,
      fields: {
        [fieldName](existing: any = []) {
          return isRemove
            ? existing.filter((id: string) => id !== value)
            : Array.from(new Set([...existing, value]));
        },
      },
    });
  }

  apolloClient.cache.modify({
    fields: {
      searchRoutines(existing, { readField, storeFieldName, toReference }) {
        if (!existing?.searchEdges) return existing;
        const input = getSearchInput(storeFieldName);
        let existed = false;
        const nextEdges = existing.searchEdges.flatMap((edge: any) => {
          if (readField("id", edge.node) !== routineId) return [edge];
          existed = true;
          const current = (readField(fieldName, edge.node) as string[]) ?? [];
          const node = patchedRoutine ?? {
            ...edge.node,
            id: routineId,
            stationId: readField("stationId", edge.node),
            title: readField("title", edge.node),
            tagIds:
              fieldName === "tagIds"
                ? isRemove
                  ? current.filter(id => id !== value)
                  : Array.from(new Set([...current, value]))
                : ((readField("tagIds", edge.node) as string[]) ?? []),
          };
          return routineMatchesSearchInput(node, input)
            ? [
                {
                  ...edge,
                  node: patchedRoutine
                    ? (toReference(patchedRoutine, true) ?? patchedRoutine)
                    : node,
                },
              ]
            : [];
        });
        if (
          !existed &&
          patchedRoutine &&
          routineMatchesSearchInput(patchedRoutine, input)
        ) {
          nextEdges.unshift({
            __typename: "SearchRoutineEdge",
            encodedSearchCursor: routineId,
            node: toReference(patchedRoutine, true) ?? patchedRoutine,
          });
        }
        return {
          ...existing,
          totalCount:
            (existing.totalCount ?? existing.searchEdges.length) +
            nextEdges.length -
            existing.searchEdges.length,
          searchEdges: nextEdges,
        };
      },
    },
  });
};

const patchSearchRoutineTaskRoutineIds = (
  apolloClient: ReturnType<typeof useApolloClient>,
  routineTaskId: string,
  routineId: string,
  isRemove: boolean
) => {
  apolloClient.cache.modify({
    fields: {
      searchRoutineTasks(existing, { readField }) {
        if (!existing?.searchEdges) return existing;
        return {
          ...existing,
          searchEdges: existing.searchEdges.map((edge: any) => {
            if (readField("id", edge.node) !== routineTaskId) return edge;
            const current =
              (readField("routineIds", edge.node) as string[]) ?? [];
            const routineIds = isRemove
              ? current.filter(id => id !== routineId)
              : Array.from(new Set([...current, routineId]));
            return { ...edge, node: { ...edge.node, routineIds } };
          }),
        };
      },
    },
  });
};

const removeSearchRoutines = (
  apolloClient: ReturnType<typeof useApolloClient>,
  routineIds: string[]
) => {
  apolloClient.cache.modify({
    fields: {
      searchRoutines(existing, { readField }) {
        if (!existing?.searchEdges) return existing;
        const nextEdges = existing.searchEdges.filter(
          (edge: any) =>
            !routineIds.includes(readField("id", edge.node) as string)
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

export const useVisualizeMyRoutineStatusCount = (
  request?: VisualizeMyRoutineStatusCountRequest,
  options?: Partial<
    UseQueryOptions<VisualizeMyRoutineStatusCountResponse, Error>
  >
) =>
  useVisualizeQuery(
    request,
    currentRequest =>
      queryKeys.routine.visualizeMyStatusCount(
        currentRequest?.param.permission
      ),
    queryFnVisualizeMyRoutineStatusCount,
    options
  );

export const useVisualizeMyRoutinePeriodCount = (
  request?: VisualizeMyRoutinePeriodCountRequest,
  options?: Partial<
    UseQueryOptions<VisualizeMyRoutinePeriodCountResponse, Error>
  >
) =>
  useVisualizeQuery(
    request,
    currentRequest =>
      queryKeys.routine.visualizeMyPeriodCount(
        currentRequest?.param.permission
      ),
    queryFnVisualizeMyRoutinePeriodCount,
    options
  );

export const useVisualizeMyRoutineScheduledStartAtCount = (
  request?: VisualizeMyRoutineScheduledStartAtCountRequest,
  options?: Partial<
    UseQueryOptions<VisualizeMyRoutineScheduledStartAtCountResponse, Error>
  >
) =>
  useVisualizeQuery(
    request,
    currentRequest =>
      queryKeys.routine.visualizeMyScheduledStartAtCount(
        currentRequest?.param.permission,
        currentRequest?.param.timeHourUnit,
        currentRequest?.param.queryRangeStartedAt,
        currentRequest?.param.queryRangeEndedAt
      ),
    queryFnVisualizeMyRoutineScheduledStartAtCount,
    options
  );

export const useVisualizeMyRoutineScheduledEndAtCount = (
  request?: VisualizeMyRoutineScheduledEndAtCountRequest,
  options?: Partial<
    UseQueryOptions<VisualizeMyRoutineScheduledEndAtCountResponse, Error>
  >
) =>
  useVisualizeQuery(
    request,
    currentRequest =>
      queryKeys.routine.visualizeMyScheduledEndAtCount(
        currentRequest?.param.permission,
        currentRequest?.param.timeHourUnit,
        currentRequest?.param.queryRangeStartedAt,
        currentRequest?.param.queryRangeEndedAt
      ),
    queryFnVisualizeMyRoutineScheduledEndAtCount,
    options
  );

export const useGetMyRoutineById = (
  hookRequest?: GetMyRoutineByIdRequest,
  options?: Partial<UseQueryOptions<GetMyRoutineByIdResponse, Error>>
) => {
  const queryClient = getQueryClient();

  const perform = async (
    request?: GetMyRoutineByIdRequest
  ): Promise<GetMyRoutineByIdResponse> => {
    if (!request) {
      throw new NotegicValidationError(
        ValidationClientException.ReceivedUndefinedRequest()
      );
    }

    try {
      if (typeof navigator !== "undefined" && navigator.onLine === false) {
        throw new NotegicFetchError(FetchClientExceptions.MissingNetwork());
      }

      const response = await queryFnGetMyRoutineById(request);
      SessionStorageManipulator.ensureItem(
        SessionStorageKey.csrfToken,
        response.refreshableTokens?.newCSRFToken,
        response.embedded?.publicId
      );
      await RoutineLocalSynchronizer.syncGetMyRoutineById(response);
      return response;
    } catch (error) {
      if (
        error instanceof NotegicAPIError ||
        error instanceof NotegicFetchError
      ) {
        const routine =
          await RoutineLocalSimulator.simulateGetMyRoutineById(request);
        return {
          success: false,
          data: routine,
          exception: error.unWrap,
          embedded: { publicId: "" },
        } as GetMyRoutineByIdResponse;
      }

      throw error;
    }
  };

  const query = useQuery<GetMyRoutineByIdResponse, Error>({
    queryKey: queryKeys.routine.oneById(
      hookRequest?.param.routineId as UUID | undefined,
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
    callbackRequest: GetMyRoutineByIdRequest
  ): Promise<GetMyRoutineByIdResponse> => {
    return queryClient.fetchQuery({
      queryKey: queryKeys.routine.oneById(
        callbackRequest.param.routineId as UUID | undefined,
        callbackRequest.param.isDeleted ?? false
      ),
      queryFn: async () => perform(callbackRequest),
      staleTime: UseQueryDefaultOptions.staleTime,
      ...options,
    });
  };

  return { ...query, fetch };
};

export const useGetMyRoutinesByStationId = (
  hookRequest?: GetMyRoutinesByStationIdRequest,
  options?: Partial<UseQueryOptions<GetMyRoutinesByStationIdResponse, Error>>
) => {
  const queryClient = getQueryClient();

  const perform = async (
    request?: GetMyRoutinesByStationIdRequest
  ): Promise<GetMyRoutinesByStationIdResponse> => {
    if (!request) {
      throw new NotegicValidationError(
        ValidationClientException.ReceivedUndefinedRequest()
      );
    }

    try {
      if (typeof navigator !== "undefined" && navigator.onLine === false) {
        throw new NotegicFetchError(FetchClientExceptions.MissingNetwork());
      }

      const response = await queryFnGetMyRoutinesByStationId(request);
      SessionStorageManipulator.ensureItem(
        SessionStorageKey.csrfToken,
        response.refreshableTokens?.newCSRFToken,
        response.embedded.publicId
      );
      await RoutineLocalSynchronizer.syncGetMyRoutinesByStationId(response);
      return response;
    } catch (error) {
      if (
        error instanceof NotegicAPIError ||
        error instanceof NotegicFetchError
      ) {
        const routines =
          await RoutineLocalSimulator.simulateGetMyRoutinesByStationId(request);
        return {
          success: false,
          data: routines,
          exception: error.unWrap,
          embedded: { publicId: "" },
        } as GetMyRoutinesByStationIdResponse;
      }

      throw error;
    }
  };

  const query = useQuery<GetMyRoutinesByStationIdResponse, Error>({
    queryKey: queryKeys.routine.manyByStationId(
      hookRequest?.param.stationId as UUID | undefined,
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
    callbackRequest: GetMyRoutinesByStationIdRequest
  ): Promise<GetMyRoutinesByStationIdResponse> => {
    return queryClient.fetchQuery({
      queryKey: queryKeys.routine.manyByStationId(
        callbackRequest.param.stationId as UUID | undefined,
        callbackRequest.param.areDeleted ?? false
      ),
      queryFn: async () => perform(callbackRequest),
      staleTime: UseQueryDefaultOptions.staleTime,
      ...options,
    });
  };

  return { ...query, fetch };
};

export const useGetAllMyRoutinesByTimeRange = (
  hookRequest?: GetAllMyRoutinesByTimeRangeRequest,
  options?: Partial<UseQueryOptions<GetAllMyRoutinesByTimeRangeResponse, Error>>
) => {
  const queryClient = getQueryClient();

  const perform = async (
    request?: GetAllMyRoutinesByTimeRangeRequest
  ): Promise<GetAllMyRoutinesByTimeRangeResponse> => {
    if (!request) {
      throw new NotegicValidationError(
        ValidationClientException.ReceivedUndefinedRequest()
      );
    }

    try {
      if (typeof navigator !== "undefined" && navigator.onLine === false) {
        throw new NotegicFetchError(FetchClientExceptions.MissingNetwork());
      }

      const response = await queryFnGetAllMyRoutinesByTimeRange(request);
      SessionStorageManipulator.ensureItem(
        SessionStorageKey.csrfToken,
        response.refreshableTokens?.newCSRFToken,
        response.embedded.publicId
      );
      await RoutineLocalSynchronizer.syncGetAllMyRoutinesByTimeRange(response);
      return response;
    } catch (error) {
      if (
        error instanceof NotegicAPIError ||
        error instanceof NotegicFetchError
      ) {
        const routines =
          await RoutineLocalSimulator.simulateGetAllMyRoutinesByTimeRange(
            request
          );
        return {
          success: false,
          data: routines,
          exception: error.unWrap,
          embedded: { publicId: "" },
        } as GetAllMyRoutinesByTimeRangeResponse;
      }

      throw error;
    }
  };

  const query = useQuery<GetAllMyRoutinesByTimeRangeResponse, Error>({
    queryKey: queryKeys.routine.manyByTimeRange(
      hookRequest?.param.from as Date | undefined,
      hookRequest?.param.to as Date | undefined,
      hookRequest?.param.stationIds as UUID[] | undefined,
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
    callbackRequest: GetAllMyRoutinesByTimeRangeRequest
  ): Promise<GetAllMyRoutinesByTimeRangeResponse> => {
    const requestedFrom = new Date(
      callbackRequest.param.from as string | number | Date
    );
    const requestedTo = new Date(
      callbackRequest.param.to as string | number | Date
    );
    const requestedFromTime = requestedFrom.getTime();
    const requestedToTime = requestedTo.getTime();
    const requestedStationIdsKey = callbackRequest.param.stationIds
      .slice()
      .sort()
      .join(",");
    const requestedAreDeleted = callbackRequest.param.areDeleted ?? false;
    const coveredCachedQuery = queryClient
      .getQueryCache()
      .findAll({ queryKey: queryKeys.routine.all() })
      .find(query => {
        const queryKey = query.queryKey as readonly unknown[];
        if (queryKey[1] !== "manyByTimeRange") return false;
        if (query.state.isInvalidated || !query.state.data) return false;
        if (queryKey[4] !== requestedStationIdsKey) return false;
        if ((queryKey[5] ?? false) !== requestedAreDeleted) return false;

        const cachedFromTime =
          typeof queryKey[2] === "number"
            ? queryKey[2]
            : typeof queryKey[2] === "string"
              ? new Date(queryKey[2]).getTime()
              : Number.NaN;
        const cachedToTime =
          typeof queryKey[3] === "number"
            ? queryKey[3]
            : typeof queryKey[3] === "string"
              ? new Date(queryKey[3]).getTime()
              : Number.NaN;

        return (
          Number.isFinite(cachedFromTime) &&
          Number.isFinite(cachedToTime) &&
          cachedFromTime <= requestedFromTime &&
          cachedToTime >= requestedToTime
        );
      });

    if (coveredCachedQuery?.state.data) {
      return coveredCachedQuery.state
        .data as GetAllMyRoutinesByTimeRangeResponse;
    }

    return queryClient.fetchQuery({
      queryKey: queryKeys.routine.manyByTimeRange(
        requestedFrom,
        requestedTo,
        callbackRequest.param.stationIds as UUID[],
        callbackRequest.param.areDeleted ?? false
      ),
      queryFn: async () => perform(callbackRequest),
      staleTime: UseQueryDefaultOptions.staleTime,
      ...options,
    });
  };

  return { ...query, fetch };
};

export const useCreateRoutineByStationId = () => {
  const queryClient = getQueryClient();
  const apolloClient = useApolloClient();

  const perform = async (request: CreateRoutineByStationIdRequest) => {
    if (typeof navigator !== "undefined" && navigator.onLine === false) {
      throw new NotegicFetchError(FetchClientExceptions.MissingNetwork());
    }
    return await mutationFnCreateRoutineByStationId(request);
  };

  const mutation = useMutation({
    mutationFn: perform,
    onSuccess: async (response, request: CreateRoutineByStationIdRequest) => {
      if (response.success === false) return;
      SessionStorageManipulator.ensureItem(
        SessionStorageKey.csrfToken,
        response.refreshableTokens?.newCSRFToken,
        response.embedded?.publicId
      );
      const targetKeys = [
        queryKeys.routine.all(),
        queryKeys.station.all(),
        queryKeys.routine.oneById(response.data.id as UUID),
        queryKeys.station.oneById(request.body.stationId as UUID),
        queryKeys.routine.manyByStationId(request.body.stationId as UUID),
      ];
      await Promise.all(
        targetKeys.map(queryKey => queryClient.invalidateQueries({ queryKey }))
      );
      const scheduledStartAt =
        request.body.scheduledStartAt ?? response.data.createdAt;
      upsertSearchRoutine(apolloClient, {
        __typename: "PrivateSearchableRoutine",
        id: response.data.id,
        stationId: request.body.stationId,
        title: request.body.title,
        status: toGraphQLRoutineStatus(request.body.status),
        isPinned: request.body.isPinned ?? false,
        scheduledStartAt,
        scheduledEndAt: request.body.scheduledEndAt ?? scheduledStartAt,
        period: toGraphQLRoutinePeriod(request.body.period),
        timezone:
          request.body.timezone ??
          Intl.DateTimeFormat().resolvedOptions().timeZone,
        deletedAt: null,
        updatedAt: response.data.createdAt,
        createdAt: response.data.createdAt,
        tagIds: [],
        taskIds: [],
        itemIds: [],
      });
      apolloClient.cache.evict({ fieldName: "searchStations" });
      apolloClient.cache.evict({ fieldName: "searchRoutineTags" });
      apolloClient.cache.gc();
      await RoutineLocalSynchronizer.syncCreateRoutineByStationId(
        request,
        response
      );
    },
    onError: async (error, request) => {
      if (
        error instanceof NotegicFetchError &&
        error.unWrap.reason ===
          ExceptionReasonDictionary.client.fetch.missingNetwork
      ) {
        await RoutineLocalSimulator.simulateCreateRoutineByStationId(request);
      }
    },
  });

  return mutation;
};

export const useCreateRoutinesByStationIds = () => {
  const queryClient = getQueryClient();
  const apolloClient = useApolloClient();

  const perform = async (request: CreateRoutinesByStationIdsRequest) => {
    if (typeof navigator !== "undefined" && navigator.onLine === false) {
      throw new NotegicFetchError(FetchClientExceptions.MissingNetwork());
    }
    return await mutationFnCreateRoutinesByStationIds(request);
  };

  const mutation = useMutation({
    mutationFn: perform,
    onSuccess: async (response, request: CreateRoutinesByStationIdsRequest) => {
      if (response.success === false) return;
      SessionStorageManipulator.ensureItem(
        SessionStorageKey.csrfToken,
        response.refreshableTokens?.newCSRFToken,
        response.embedded?.publicId
      );
      const targetKeys = [
        queryKeys.routine.all(),
        queryKeys.station.all(),
        ...response.data.ids.map(id => queryKeys.routine.oneById(id as UUID)),
        ...request.body.createdRoutines.map(routine =>
          queryKeys.station.oneById(routine.stationId as UUID)
        ),
        ...request.body.createdRoutines.map(routine =>
          queryKeys.routine.manyByStationId(routine.stationId as UUID)
        ),
      ];
      await Promise.all(
        targetKeys.map(queryKey => queryClient.invalidateQueries({ queryKey }))
      );
      for (
        let index = 0;
        index < response.data.ids.length &&
        index < request.body.createdRoutines.length;
        index++
      ) {
        const routine = request.body.createdRoutines[index];
        const scheduledStartAt =
          routine.scheduledStartAt ?? response.data.createdAt;
        upsertSearchRoutine(apolloClient, {
          __typename: "PrivateSearchableRoutine",
          id: response.data.ids[index],
          stationId: routine.stationId,
          title: routine.title,
          status: toGraphQLRoutineStatus(routine.status),
          isPinned: routine.isPinned ?? false,
          scheduledStartAt,
          scheduledEndAt: routine.scheduledEndAt ?? scheduledStartAt,
          period: toGraphQLRoutinePeriod(routine.period),
          timezone:
            routine.timezone ??
            Intl.DateTimeFormat().resolvedOptions().timeZone,
          deletedAt: null,
          updatedAt: response.data.createdAt,
          createdAt: response.data.createdAt,
          tagIds: [],
          taskIds: [],
          itemIds: [],
        });
      }
      apolloClient.cache.evict({ fieldName: "searchStations" });
      apolloClient.cache.evict({ fieldName: "searchRoutineTags" });
      apolloClient.cache.gc();
      await RoutineLocalSynchronizer.syncCreateRoutinesByStationIds(
        request,
        response
      );
    },
    onError: async (error, request) => {
      if (
        error instanceof NotegicFetchError &&
        error.unWrap.reason ===
          ExceptionReasonDictionary.client.fetch.missingNetwork
      ) {
        await RoutineLocalSimulator.simulateCreateRoutinesByStationIds(request);
      }
    },
  });

  return mutation;
};

export const useUpdateMyRoutineById = () => {
  const queryClient = getQueryClient();
  const apolloClient = useApolloClient();

  const perform = async (request: UpdateMyRoutineByIdRequest) => {
    if (typeof navigator !== "undefined" && navigator.onLine === false) {
      throw new NotegicFetchError(FetchClientExceptions.MissingNetwork());
    }
    return await mutationFnUpdateMyRoutineById(request);
  };

  const mutation = useMutation({
    mutationFn: perform,
    onSuccess: async (response, request: UpdateMyRoutineByIdRequest) => {
      if (response.success === false) return;
      SessionStorageManipulator.ensureItem(
        SessionStorageKey.csrfToken,
        response.refreshableTokens?.newCSRFToken,
        response.embedded?.publicId
      );
      const targetKeys = [
        queryKeys.routine.all(),
        queryKeys.station.all(),
        queryKeys.routine.oneById(request.body.routineId as UUID),
      ];
      await Promise.all(
        targetKeys.map(queryKey => queryClient.invalidateQueries({ queryKey }))
      );
      patchSearchRoutine(
        apolloClient,
        request.body.routineId,
        toSearchRoutinePatch(request.body.values, response.data.updatedAt)
      );
      apolloClient.cache.evict({ fieldName: "searchRoutineTags" });
      apolloClient.cache.gc();
      await RoutineLocalSynchronizer.syncUpdateMyRoutineById(request, response);
    },
    onError: async (error, request) => {
      if (
        error instanceof NotegicFetchError &&
        error.unWrap.reason ===
          ExceptionReasonDictionary.client.fetch.missingNetwork
      ) {
        await RoutineLocalSimulator.simulateUpdateMyRoutineById(request);
      }
    },
  });

  return mutation;
};

export const useUpdateMyRoutinesByIds = () => {
  const queryClient = getQueryClient();
  const apolloClient = useApolloClient();

  const perform = async (request: UpdateMyRoutinesByIdsRequest) => {
    if (typeof navigator !== "undefined" && navigator.onLine === false) {
      throw new NotegicFetchError(FetchClientExceptions.MissingNetwork());
    }
    return await mutationFnUpdateMyRoutinesByIds(request);
  };

  const mutation = useMutation({
    mutationFn: perform,
    onSuccess: async (response, request: UpdateMyRoutinesByIdsRequest) => {
      if (response.success === false) return;
      SessionStorageManipulator.ensureItem(
        SessionStorageKey.csrfToken,
        response.refreshableTokens?.newCSRFToken,
        response.embedded?.publicId
      );
      const targetKeys = [
        queryKeys.routine.all(),
        ...request.body.updatedRoutines.map(routine =>
          queryKeys.routine.oneById(routine.routineId as UUID)
        ),
      ];
      await Promise.all(
        targetKeys.map(queryKey => queryClient.invalidateQueries({ queryKey }))
      );
      for (const routine of request.body.updatedRoutines) {
        patchSearchRoutine(
          apolloClient,
          routine.routineId,
          toSearchRoutinePatch(routine.values, response.data.updatedAt)
        );
      }
      apolloClient.cache.evict({ fieldName: "searchRoutineTags" });
      apolloClient.cache.gc();
      await RoutineLocalSynchronizer.syncUpdateMyRoutinesByIds(
        request,
        response
      );
    },
    onError: async (error, request) => {
      if (
        error instanceof NotegicFetchError &&
        error.unWrap.reason ===
          ExceptionReasonDictionary.client.fetch.missingNetwork
      ) {
        await RoutineLocalSimulator.simulateUpdateMyRoutinesByIds(request);
      }
    },
  });

  return mutation;
};

export const useLinkRoutineTagById = () => {
  const queryClient = getQueryClient();
  const apolloClient = useApolloClient();

  const perform = async (request: LinkRoutineTagByIdRequest) => {
    if (typeof navigator !== "undefined" && navigator.onLine === false) {
      throw new NotegicFetchError(FetchClientExceptions.MissingNetwork());
    }
    return await mutationFnLinkRoutineTagById(request);
  };

  const mutation = useMutation({
    mutationFn: perform,
    onSuccess: async (response, request: LinkRoutineTagByIdRequest) => {
      if (response.success === false) return;
      SessionStorageManipulator.ensureItem(
        SessionStorageKey.csrfToken,
        response.refreshableTokens?.newCSRFToken,
        response.embedded?.publicId
      );
      const targetKeys = [
        queryKeys.routine.all(),
        queryKeys.routine.oneById(request.body.routineId as UUID),
        queryKeys.routine.oneById(request.body.routineId as UUID),
      ];
      await Promise.all(
        targetKeys.map(queryKey => queryClient.invalidateQueries({ queryKey }))
      );
      patchSearchRoutineIdList(
        apolloClient,
        request.body.routineId,
        "tagIds",
        request.body.routineTagId,
        request.body.isUnlink
      );
      apolloClient.cache.evict({ fieldName: "searchRoutineTags" });
      apolloClient.cache.gc();
      await RoutineLocalSynchronizer.syncLinkRoutineTagById(request, response);
    },
    onError: async (error, request) => {
      if (
        error instanceof NotegicFetchError &&
        error.unWrap.reason ===
          ExceptionReasonDictionary.client.fetch.missingNetwork
      ) {
        await RoutineLocalSimulator.simulateLinkRoutineTagById(request);
      }
    },
  });

  return mutation;
};

export const useLinkRoutineTagsByIds = () => {
  const queryClient = getQueryClient();
  const apolloClient = useApolloClient();

  const perform = async (request: LinkRoutineTagsByIdsRequest) => {
    if (typeof navigator !== "undefined" && navigator.onLine === false) {
      throw new NotegicFetchError(FetchClientExceptions.MissingNetwork());
    }
    return await mutationFnLinkRoutineTagsByIds(request);
  };

  const mutation = useMutation({
    mutationFn: perform,
    onSuccess: async (response, request: LinkRoutineTagsByIdsRequest) => {
      if (response.success === false) return;
      SessionStorageManipulator.ensureItem(
        SessionStorageKey.csrfToken,
        response.refreshableTokens?.newCSRFToken,
        response.embedded?.publicId
      );
      const targetKeys = [
        queryKeys.routine.all(),
        ...request.body.linkedRoutinesAndTags.map(item =>
          queryKeys.routine.oneById(item.routineId as UUID)
        ),
        ...request.body.linkedRoutinesAndTags.map(item =>
          queryKeys.routineTag.oneById(item.routineTagId as UUID)
        ),
      ];
      await Promise.all(
        targetKeys.map(queryKey => queryClient.invalidateQueries({ queryKey }))
      );
      for (const item of request.body.linkedRoutinesAndTags) {
        patchSearchRoutineIdList(
          apolloClient,
          item.routineId,
          "tagIds",
          item.routineTagId,
          request.body.isUnlink
        );
      }
      apolloClient.cache.evict({ fieldName: "searchRoutineTags" });
      apolloClient.cache.gc();
      await RoutineLocalSynchronizer.syncLinkRoutineTagsByIds(
        request,
        response
      );
    },
    onError: async (error, request) => {
      if (
        error instanceof NotegicFetchError &&
        error.unWrap.reason ===
          ExceptionReasonDictionary.client.fetch.missingNetwork
      ) {
        await RoutineLocalSimulator.simulateLinkRoutineTagsByIds(request);
      }
    },
  });

  return mutation;
};

export const useLinkRoutineTaskById = () => {
  const queryClient = getQueryClient();
  const apolloClient = useApolloClient();

  const mutation = useMutation({
    mutationFn: mutationFnLinkRoutineTaskById,
    onSuccess: async (response, request: LinkRoutineTaskByIdRequest) => {
      SessionStorageManipulator.ensureItem(
        SessionStorageKey.csrfToken,
        response.refreshableTokens?.newCSRFToken,
        response.embedded?.publicId
      );
      const targetKeys = [
        queryKeys.routine.all(),
        queryKeys.routine.oneById(request.body.routineId as UUID),
        queryKeys.routine.oneById(request.body.routineId as UUID),
      ];
      await Promise.all(
        targetKeys.map(queryKey => queryClient.invalidateQueries({ queryKey }))
      );
      patchSearchRoutineIdList(
        apolloClient,
        request.body.routineId,
        "taskIds",
        request.body.routineTaskId,
        request.body.isUnlink
      );
      patchSearchRoutineTaskRoutineIds(
        apolloClient,
        request.body.routineTaskId,
        request.body.routineId,
        request.body.isUnlink
      );
      apolloClient.cache.gc();
    },
    onError: error => {},
  });

  return mutation;
};

export const useLinkRoutineTasksByIds = () => {
  const queryClient = getQueryClient();
  const apolloClient = useApolloClient();

  const mutation = useMutation({
    mutationFn: mutationFnLinkRoutineTasksByIds,
    onSuccess: async (response, request: LinkRoutineTasksByIdsRequest) => {
      SessionStorageManipulator.ensureItem(
        SessionStorageKey.csrfToken,
        response.refreshableTokens?.newCSRFToken,
        response.embedded?.publicId
      );
      const targetKeys = [
        queryKeys.routine.all(),
        ...request.body.linkedRoutinesAndTasks.map(item =>
          queryKeys.routine.oneById(item.routineId as UUID)
        ),
        ...request.body.linkedRoutinesAndTasks.map(item =>
          queryKeys.routineTask.oneById(item.routineTaskId as UUID)
        ),
      ];
      await Promise.all(
        targetKeys.map(queryKey => queryClient.invalidateQueries({ queryKey }))
      );
      for (const item of request.body.linkedRoutinesAndTasks) {
        patchSearchRoutineIdList(
          apolloClient,
          item.routineId,
          "taskIds",
          item.routineTaskId,
          request.body.isUnlink
        );
        patchSearchRoutineTaskRoutineIds(
          apolloClient,
          item.routineTaskId,
          item.routineId,
          request.body.isUnlink
        );
      }
      apolloClient.cache.gc();
    },
    onError: error => {},
  });

  return mutation;
};

export const useLinkRoutineItemById = () => {
  const queryClient = getQueryClient();
  const apolloClient = useApolloClient();

  const perform = async (request: LinkRoutineItemByIdRequest) => {
    if (typeof navigator !== "undefined" && navigator.onLine === false) {
      throw new NotegicFetchError(FetchClientExceptions.MissingNetwork());
    }
    return await mutationFnLinkRoutineItemById(request);
  };

  const mutation = useMutation({
    mutationFn: perform,
    onSuccess: async (response, request: LinkRoutineItemByIdRequest) => {
      if (response.success === false) return;
      SessionStorageManipulator.ensureItem(
        SessionStorageKey.csrfToken,
        response.refreshableTokens?.newCSRFToken,
        response.embedded?.publicId
      );
      const targetKeys = [
        queryKeys.routine.all(),
        queryKeys.routine.oneById(request.body.routineId as UUID),
        queryKeys.routine.oneById(request.body.routineId as UUID),
      ];
      await Promise.all(
        targetKeys.map(queryKey => queryClient.invalidateQueries({ queryKey }))
      );
      patchSearchRoutineIdList(
        apolloClient,
        request.body.routineId,
        "itemIds",
        request.body.itemId,
        request.body.isUnlink
      );
      apolloClient.cache.evict({ fieldName: "searchItems" });
      apolloClient.cache.gc();
      await RoutineLocalSynchronizer.syncLinkRoutineItemById(request, response);
    },
    onError: async (error, request) => {
      if (
        error instanceof NotegicFetchError &&
        error.unWrap.reason ===
          ExceptionReasonDictionary.client.fetch.missingNetwork
      ) {
        await RoutineLocalSimulator.simulateLinkRoutineItemById(request);
      }
    },
  });

  return mutation;
};

export const useLinkRoutineItemsByIds = () => {
  const queryClient = getQueryClient();
  const apolloClient = useApolloClient();

  const perform = async (request: LinkRoutineItemsByIdsRequest) => {
    if (typeof navigator !== "undefined" && navigator.onLine === false) {
      throw new NotegicFetchError(FetchClientExceptions.MissingNetwork());
    }
    return await mutationFnLinkRoutineItemsByIds(request);
  };

  const mutation = useMutation({
    mutationFn: perform,
    onSuccess: async (response, request: LinkRoutineItemsByIdsRequest) => {
      if (response.success === false) return;
      SessionStorageManipulator.ensureItem(
        SessionStorageKey.csrfToken,
        response.refreshableTokens?.newCSRFToken,
        response.embedded?.publicId
      );
      const targetKeys = [
        queryKeys.routine.all(),
        ...request.body.linkedRoutinesAndItems.map(item =>
          queryKeys.routine.oneById(item.routineId as UUID)
        ),
      ];
      await Promise.all(
        targetKeys.map(queryKey => queryClient.invalidateQueries({ queryKey }))
      );
      for (const item of request.body.linkedRoutinesAndItems) {
        patchSearchRoutineIdList(
          apolloClient,
          item.routineId,
          "itemIds",
          item.itemId,
          request.body.isUnlink
        );
      }
      apolloClient.cache.evict({ fieldName: "searchItems" });
      apolloClient.cache.gc();
      await RoutineLocalSynchronizer.syncLinkRoutineItemsByIds(
        request,
        response
      );
    },
    onError: async (error, request) => {
      if (
        error instanceof NotegicFetchError &&
        error.unWrap.reason ===
          ExceptionReasonDictionary.client.fetch.missingNetwork
      ) {
        await RoutineLocalSimulator.simulateLinkRoutineItemsByIds(request);
      }
    },
  });

  return mutation;
};

export const useRestoreMyRoutineById = () => {
  const queryClient = getQueryClient();
  const apolloClient = useApolloClient();

  const perform = async (request: RestoreMyRoutineByIdRequest) => {
    if (typeof navigator !== "undefined" && navigator.onLine === false) {
      throw new NotegicFetchError(FetchClientExceptions.MissingNetwork());
    }
    return await mutationFnRestoreMyRoutineById(request);
  };

  const mutation = useMutation({
    mutationFn: perform,
    onSuccess: async (response, request: RestoreMyRoutineByIdRequest) => {
      if (response.success === false) return;
      SessionStorageManipulator.ensureItem(
        SessionStorageKey.csrfToken,
        response.refreshableTokens?.newCSRFToken,
        response.embedded?.publicId
      );
      const targetKeys = [
        queryKeys.routine.all(),
        queryKeys.routine.oneById(request.body.routineId as UUID),
      ];
      await Promise.all(
        targetKeys.map(queryKey => queryClient.invalidateQueries({ queryKey }))
      );
      apolloClient.cache.evict({ fieldName: "searchRoutines" });
      apolloClient.cache.evict({ fieldName: "searchStations" });
      apolloClient.cache.evict({ fieldName: "searchRoutineTags" });
      apolloClient.cache.gc();
      await RoutineLocalSynchronizer.syncRestoreMyRoutineById(
        request,
        response
      );
    },
    onError: async (error, request) => {
      if (
        error instanceof NotegicFetchError &&
        error.unWrap.reason ===
          ExceptionReasonDictionary.client.fetch.missingNetwork
      ) {
        await RoutineLocalSimulator.simulateRestoreMyRoutineById(request);
      }
    },
  });

  return mutation;
};

export const useRestoreMyRoutinesByIds = () => {
  const queryClient = getQueryClient();
  const apolloClient = useApolloClient();

  const perform = async (request: RestoreMyRoutinesByIdsRequest) => {
    if (typeof navigator !== "undefined" && navigator.onLine === false) {
      throw new NotegicFetchError(FetchClientExceptions.MissingNetwork());
    }
    return await mutationFnRestoreMyRoutinesByIds(request);
  };

  const mutation = useMutation({
    mutationFn: perform,
    onSuccess: async (response, request: RestoreMyRoutinesByIdsRequest) => {
      if (response.success === false) return;
      SessionStorageManipulator.ensureItem(
        SessionStorageKey.csrfToken,
        response.refreshableTokens?.newCSRFToken,
        response.embedded?.publicId
      );
      const targetKeys = [
        queryKeys.routine.all(),
        queryKeys.station.all(),
        ...request.body.routineIds.map(routineId =>
          queryKeys.routine.oneById(routineId as UUID)
        ),
      ];
      await Promise.all(
        targetKeys.map(queryKey => queryClient.invalidateQueries({ queryKey }))
      );
      apolloClient.cache.evict({ fieldName: "searchRoutines" });
      apolloClient.cache.evict({ fieldName: "searchStations" });
      apolloClient.cache.evict({ fieldName: "searchRoutineTags" });
      apolloClient.cache.gc();
      await RoutineLocalSynchronizer.syncRestoreMyRoutinesByIds(
        request,
        response
      );
    },
    onError: async (error, request) => {
      if (
        error instanceof NotegicFetchError &&
        error.unWrap.reason ===
          ExceptionReasonDictionary.client.fetch.missingNetwork
      ) {
        await RoutineLocalSimulator.simulateRestoreMyRoutinesByIds(request);
      }
    },
  });

  return mutation;
};

export const useDeleteMyRoutineById = () => {
  const queryClient = getQueryClient();
  const apolloClient = useApolloClient();

  const perform = async (request: DeleteMyRoutineByIdRequest) => {
    if (typeof navigator !== "undefined" && navigator.onLine === false) {
      throw new NotegicFetchError(FetchClientExceptions.MissingNetwork());
    }
    return await mutationFnDeleteMyRoutineById(request);
  };

  const mutation = useMutation({
    mutationFn: perform,
    onSuccess: async (response, request: DeleteMyRoutineByIdRequest) => {
      if (response.success === false) return;
      SessionStorageManipulator.ensureItem(
        SessionStorageKey.csrfToken,
        response.refreshableTokens?.newCSRFToken,
        response.embedded?.publicId
      );
      const targetKeys = [
        queryKeys.routine.all(),
        queryKeys.station.all(),
        queryKeys.routine.oneById(request.body.routineId as UUID),
      ];
      await Promise.all(
        targetKeys.map(queryKey => queryClient.invalidateQueries({ queryKey }))
      );
      removeSearchRoutines(apolloClient, [request.body.routineId]);
      apolloClient.cache.evict({ fieldName: "searchStations" });
      apolloClient.cache.evict({ fieldName: "searchRoutineTags" });
      apolloClient.cache.gc();
      await RoutineLocalSynchronizer.syncDeleteMyRoutineById(request, response);
    },
    onError: async (error, request) => {
      if (
        error instanceof NotegicFetchError &&
        error.unWrap.reason ===
          ExceptionReasonDictionary.client.fetch.missingNetwork
      ) {
        await RoutineLocalSimulator.simulateDeleteMyRoutineById(request);
      }
    },
  });

  return mutation;
};

export const useDeleteMyRoutinesByIds = () => {
  const queryClient = getQueryClient();
  const apolloClient = useApolloClient();

  const perform = async (request: DeleteMyRoutinesByIdsRequest) => {
    if (typeof navigator !== "undefined" && navigator.onLine === false) {
      throw new NotegicFetchError(FetchClientExceptions.MissingNetwork());
    }
    return await mutationFnDeleteMyRoutinesByIds(request);
  };

  const mutation = useMutation({
    mutationFn: perform,
    onSuccess: async (response, request: DeleteMyRoutinesByIdsRequest) => {
      if (response.success === false) return;
      SessionStorageManipulator.ensureItem(
        SessionStorageKey.csrfToken,
        response.refreshableTokens?.newCSRFToken,
        response.embedded?.publicId
      );
      const targetKeys = [
        queryKeys.routine.all(),
        queryKeys.station.all(),
        ...request.body.routineIds.map(routineId =>
          queryKeys.routine.oneById(routineId as UUID)
        ),
      ];
      await Promise.all(
        targetKeys.map(queryKey => queryClient.invalidateQueries({ queryKey }))
      );
      removeSearchRoutines(apolloClient, request.body.routineIds);
      apolloClient.cache.evict({ fieldName: "searchStations" });
      apolloClient.cache.evict({ fieldName: "searchRoutineTags" });
      apolloClient.cache.gc();
      await RoutineLocalSynchronizer.syncDeleteMyRoutinesByIds(
        request,
        response
      );
    },
    onError: async (error, request) => {
      if (
        error instanceof NotegicFetchError &&
        error.unWrap.reason ===
          ExceptionReasonDictionary.client.fetch.missingNetwork
      ) {
        await RoutineLocalSimulator.simulateDeleteMyRoutinesByIds(request);
      }
    },
  });

  return mutation;
};

export const useHardDeleteMyRoutineById = () => {
  const queryClient = getQueryClient();
  const apolloClient = useApolloClient();

  const perform = async (request: HardDeleteMyRoutineByIdRequest) => {
    if (typeof navigator !== "undefined" && navigator.onLine === false) {
      throw new NotegicFetchError(FetchClientExceptions.MissingNetwork());
    }
    return await mutationFnHardDeleteMyRoutineById(request);
  };

  const mutation = useMutation({
    mutationFn: perform,
    onSuccess: async (response, request: HardDeleteMyRoutineByIdRequest) => {
      if (response.success === false) return;
      SessionStorageManipulator.ensureItem(
        SessionStorageKey.csrfToken,
        response.refreshableTokens?.newCSRFToken,
        response.embedded?.publicId
      );
      const targetKeys = [
        queryKeys.routine.all(),
        queryKeys.station.all(),
        queryKeys.routine.oneById(request.body.routineId as UUID),
      ];
      await Promise.all(
        targetKeys.map(queryKey => queryClient.invalidateQueries({ queryKey }))
      );
      removeSearchRoutines(apolloClient, [request.body.routineId]);
      apolloClient.cache.evict({ fieldName: "searchStations" });
      apolloClient.cache.evict({ fieldName: "searchRoutineTags" });
      apolloClient.cache.gc();
      await RoutineLocalSynchronizer.syncHardDeleteMyRoutineById(
        request,
        response
      );
    },
    onError: async (error, request) => {
      if (
        error instanceof NotegicFetchError &&
        error.unWrap.reason ===
          ExceptionReasonDictionary.client.fetch.missingNetwork
      ) {
        await RoutineLocalSimulator.simulateHardDeleteMyRoutineById(request);
      }
    },
  });

  return mutation;
};

export const useHardDeleteMyRoutinesByIds = () => {
  const queryClient = getQueryClient();
  const apolloClient = useApolloClient();

  const perform = async (request: HardDeleteMyRoutinesByIdsRequest) => {
    if (typeof navigator !== "undefined" && navigator.onLine === false) {
      throw new NotegicFetchError(FetchClientExceptions.MissingNetwork());
    }
    return await mutationFnHardDeleteMyRoutinesByIds(request);
  };

  const mutation = useMutation({
    mutationFn: perform,
    onSuccess: async (response, request: HardDeleteMyRoutinesByIdsRequest) => {
      if (response.success === false) return;
      SessionStorageManipulator.ensureItem(
        SessionStorageKey.csrfToken,
        response.refreshableTokens?.newCSRFToken,
        response.embedded?.publicId
      );
      const targetKeys = [
        queryKeys.routine.all(),
        queryKeys.station.all(),
        ...request.body.routineIds.map(routineId =>
          queryKeys.routine.oneById(routineId as UUID)
        ),
      ];
      await Promise.all(
        targetKeys.map(queryKey => queryClient.invalidateQueries({ queryKey }))
      );
      removeSearchRoutines(apolloClient, request.body.routineIds);
      apolloClient.cache.evict({ fieldName: "searchStations" });
      apolloClient.cache.evict({ fieldName: "searchRoutineTags" });
      apolloClient.cache.gc();
      await RoutineLocalSynchronizer.syncHardDeleteMyRoutinesByIds(
        request,
        response
      );
    },
    onError: async (error, request) => {
      if (
        error instanceof NotegicFetchError &&
        error.unWrap.reason ===
          ExceptionReasonDictionary.client.fetch.missingNetwork
      ) {
        await RoutineLocalSimulator.simulateHardDeleteMyRoutinesByIds(request);
      }
    },
  });

  return mutation;
};
