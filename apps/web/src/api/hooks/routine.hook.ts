import type { UUID } from "node:crypto";
import { useApolloClient } from "@apollo/client/react";
import { NotegicAPIError } from "@shared/api/exceptions";
import { FetchClientExceptions } from "@shared/api/exceptions/client/fetch.exception";
import { ValidationClientException } from "@shared/api/exceptions/client/validation.exception";
import { NotegicFetchError } from "@shared/api/exceptions/errors/fetch.error";
import { NotegicValidationError } from "@shared/api/exceptions/errors/validation.error";
import { NetworkExceptions } from "@shared/api/exceptions/network.exception";
import { toGraphQLRoutinePeriod } from "@shared/api/graphql/conversions";
import { FragmentedBasicPrivateSearchableRoutineFragmentDoc } from "@shared/api/graphql/generated/graphql";
import type {
  CreateRoutineByStationIdRequest,
  CreateRoutinesByStationIdsRequest,
  DeleteMyRoutineByIdRequest,
  DeleteMyRoutinesByIdsRequest,
  GetMyRoutineByIdRequest,
  GetMyRoutineByIdResponse,
  GetMyRoutinesByStationIdRequest,
  GetMyRoutinesByStationIdResponse,
  GetMyRoutinesByTimeRangeRequest,
  GetMyRoutinesByTimeRangeResponse,
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
  UpdateMyRoutineByIdResponse,
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
  CreateRoutineByStationIdRequestSchema,
  CreateRoutinesByStationIdsRequestSchema,
  UpdateMyRoutineByIdRequestSchema,
  UpdateMyRoutinesByIdsRequestSchema,
} from "@shared/api/interfaces/routine.interface";
import { getQueryClient } from "@shared/api/queryClient";
import { UseQueryDefaultOptions } from "@shared/api/queryHookOptions";
import { queryKeys } from "@shared/api/queryKeys";
import { parseRequest } from "@shared/api/validation";
import { matchesSearch } from "@shared/lib/search/searchPage";
import {
  type UseQueryOptions,
  useMutation,
  useQuery,
} from "@tanstack/react-query";
import { isRemoteUnavailable } from "@/api/availability";
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
  queryFnGetMyRoutineById,
  queryFnGetMyRoutinesByStationId,
  queryFnGetMyRoutinesByTimeRange,
  queryFnVisualizeMyRoutinePeriodCount,
  queryFnVisualizeMyRoutineScheduledEndAtCount,
  queryFnVisualizeMyRoutineScheduledStartAtCount,
  queryFnVisualizeMyRoutineStatusCount,
} from "@/api/invokers/routine.invoker";
import { RoutineLocalSimulator } from "@/api/local/simulators/routine.simulator";
import { RoutineLocalSynchronizer } from "@/api/local/synchronizers/routine.synchronizer";
import { clearSearchItems } from "@/api/policies/searchItems.policy";
import { readSearchFieldInput } from "@/api/policies/searchPagination.policy";
import {
  clearSearchRoutines,
  placeSearchRoutine,
  removeSearchRoutines,
  routineSearchCursor,
} from "@/api/policies/searchRoutines.policy";
import { clearSearchRoutineTags } from "@/api/policies/searchRoutineTags.policy";
import { clearSearchStations } from "@/api/policies/searchStations.policy";
import { useVisualizeQuery } from "./visualize.hook";

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
      if (isRemoteUnavailable()) {
        throw new NotegicFetchError(FetchClientExceptions.MissingNetwork());
      }

      const response = await queryFnGetMyRoutineById(request);
      await RoutineLocalSynchronizer.syncGetMyRoutineById(response);
      return response;
    } catch (error) {
      if (
        error instanceof NotegicAPIError ||
        error instanceof NotegicFetchError
      ) {
        const routine =
          await RoutineLocalSimulator.simulateGetMyRoutineById(request);
        return (
          NetworkExceptions.isMissingNetworkError(error)
            ? {
                success: true,
                data: routine,
                exception: null,
                embedded: { publicId: "" },
              }
            : {
                success: false,
                data: routine,
                exception: error.unWrap,
                embedded: { publicId: "" },
              }
        ) as GetMyRoutineByIdResponse;
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
      if (isRemoteUnavailable()) {
        throw new NotegicFetchError(FetchClientExceptions.MissingNetwork());
      }

      const response = await queryFnGetMyRoutinesByStationId(request);
      await RoutineLocalSynchronizer.syncGetMyRoutinesByStationId(response);
      return response;
    } catch (error) {
      if (
        error instanceof NotegicAPIError ||
        error instanceof NotegicFetchError
      ) {
        const routines =
          await RoutineLocalSimulator.simulateGetMyRoutinesByStationId(request);
        return (
          NetworkExceptions.isMissingNetworkError(error)
            ? {
                success: true,
                data: routines,
                exception: null,
                embedded: { publicId: "" },
              }
            : {
                success: false,
                data: routines,
                exception: error.unWrap,
                embedded: { publicId: "" },
              }
        ) as GetMyRoutinesByStationIdResponse;
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

export const useGetMyRoutinesByTimeRange = (
  hookRequest?: GetMyRoutinesByTimeRangeRequest,
  options?: Partial<UseQueryOptions<GetMyRoutinesByTimeRangeResponse, Error>>
) => {
  const queryClient = getQueryClient();

  const perform = async (
    request?: GetMyRoutinesByTimeRangeRequest
  ): Promise<GetMyRoutinesByTimeRangeResponse> => {
    if (!request) {
      throw new NotegicValidationError(
        ValidationClientException.ReceivedUndefinedRequest()
      );
    }

    try {
      if (isRemoteUnavailable()) {
        throw new NotegicFetchError(FetchClientExceptions.MissingNetwork());
      }

      const response = await queryFnGetMyRoutinesByTimeRange(request);
      await RoutineLocalSynchronizer.syncGetMyRoutinesByTimeRange(response);
      return response;
    } catch (error) {
      if (
        error instanceof NotegicAPIError ||
        error instanceof NotegicFetchError
      ) {
        const routines =
          await RoutineLocalSimulator.simulateGetMyRoutinesByTimeRange(request);
        return (
          NetworkExceptions.isMissingNetworkError(error)
            ? {
                success: true,
                data: routines,
                exception: null,
                embedded: { publicId: "" },
              }
            : {
                success: false,
                data: routines,
                exception: error.unWrap,
                embedded: { publicId: "" },
              }
        ) as GetMyRoutinesByTimeRangeResponse;
      }

      throw error;
    }
  };

  const query = useQuery<GetMyRoutinesByTimeRangeResponse, Error>({
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
    callbackRequest: GetMyRoutinesByTimeRangeRequest
  ): Promise<GetMyRoutinesByTimeRangeResponse> => {
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
      return coveredCachedQuery.state.data as GetMyRoutinesByTimeRangeResponse;
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

export const useCreateRoutineByStationId = (
  options: { offlineFallback?: boolean } = {}
) => {
  const queryClient = getQueryClient();
  const apolloClient = useApolloClient();

  const perform = async (request: CreateRoutineByStationIdRequest) => {
    try {
      parseRequest(CreateRoutineByStationIdRequestSchema, request);
      if (isRemoteUnavailable()) {
        throw new NotegicFetchError(FetchClientExceptions.MissingNetwork());
      }
      return await mutationFnCreateRoutineByStationId(request);
    } catch (error) {
      if (
        options.offlineFallback === false ||
        !NetworkExceptions.isMissingNetworkError(error)
      )
        throw error;
      try {
        await RoutineLocalSimulator.simulateCreateRoutineByStationId(request);
      } catch (simulateError) {
        console.error(simulateError);
      }
      return {
        success: true as const,
        data: {
          id: request.body.id as UUID,
          createdAt: new Date(),
        },
        exception: null,
        embedded: { publicId: "" },
      };
    }
  };

  const mutation = useMutation({
    mutationFn: perform,
    onSuccess: async (response, request: CreateRoutineByStationIdRequest) => {
      if (response.success === false) return;
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
      const routine: any = {
        __typename: "PrivateSearchableRoutine",
        id: response.data.id,
        stationId: request.body.stationId,
        title: request.body.title,
        phase: null,
        timeoutSeconds: request.body.timeoutSeconds ?? 300,
        isActive: request.body.isActive ?? false,
        hasCustomSchedule:
          request.body.hasCustomSchedule ??
          Boolean(request.body.scheduledStartAt || request.body.scheduledEndAt),
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
      };
      apolloClient.cache.modify({
        fields: {
          searchRoutines(existing, details) {
            return placeSearchRoutine(existing, details, routine);
          },
        },
      });
      clearSearchStations(apolloClient.cache);
      clearSearchRoutineTags(apolloClient.cache);
      apolloClient.cache.gc();
      if (response.embedded.publicId === "") return;
      await RoutineLocalSynchronizer.syncCreateRoutineByStationId(
        request,
        response
      );
    },
  });

  return mutation;
};

export const useCreateRoutinesByStationIds = (
  options: { offlineFallback?: boolean } = {}
) => {
  const queryClient = getQueryClient();
  const apolloClient = useApolloClient();

  const perform = async (request: CreateRoutinesByStationIdsRequest) => {
    try {
      parseRequest(CreateRoutinesByStationIdsRequestSchema, request);
      if (isRemoteUnavailable()) {
        throw new NotegicFetchError(FetchClientExceptions.MissingNetwork());
      }
      return await mutationFnCreateRoutinesByStationIds(request);
    } catch (error) {
      if (
        options.offlineFallback === false ||
        !NetworkExceptions.isMissingNetworkError(error)
      )
        throw error;
      await RoutineLocalSimulator.simulateCreateRoutinesByStationIds(request);
      return {
        success: true as const,
        data: {
          ids: request.body.createdRoutines.map(item => item.id as UUID),
          createdAt: new Date(),
        },
        exception: null,
        embedded: { publicId: "" },
      } as Awaited<ReturnType<typeof mutationFnCreateRoutinesByStationIds>>;
    }
  };

  const mutation = useMutation({
    mutationFn: perform,
    onSuccess: async (response, request: CreateRoutinesByStationIdsRequest) => {
      if (response.success === false) return;
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
        const routineNode: any = {
          __typename: "PrivateSearchableRoutine",
          id: response.data.ids[index],
          stationId: routine.stationId,
          title: routine.title,
          phase: null,
          timeoutSeconds: routine.timeoutSeconds ?? 300,
          isActive: routine.isActive ?? false,
          hasCustomSchedule:
            routine.hasCustomSchedule ??
            Boolean(routine.scheduledStartAt || routine.scheduledEndAt),
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
        };
        apolloClient.cache.modify({
          fields: {
            searchRoutines(existing, details) {
              return placeSearchRoutine(existing, details, routineNode);
            },
          },
        });
      }
      clearSearchStations(apolloClient.cache);
      clearSearchRoutineTags(apolloClient.cache);
      apolloClient.cache.gc();
      if (response.embedded?.publicId === "") return;
      await RoutineLocalSynchronizer.syncCreateRoutinesByStationIds(
        request,
        response
      );
    },
  });

  return mutation;
};

export const useUpdateMyRoutineById = (allowOffline = true) => {
  const queryClient = getQueryClient();
  const apolloClient = useApolloClient();

  const perform = async (
    request: UpdateMyRoutineByIdRequest
  ): Promise<UpdateMyRoutineByIdResponse> => {
    try {
      parseRequest(UpdateMyRoutineByIdRequestSchema, request);
      if (isRemoteUnavailable())
        throw new NotegicFetchError(FetchClientExceptions.MissingNetwork());
      return await mutationFnUpdateMyRoutineById(request);
    } catch (error) {
      if (!allowOffline || !NetworkExceptions.isMissingNetworkError(error))
        throw error;
      await RoutineLocalSimulator.simulateUpdateMyRoutineById(request);
      return {
        success: true as const,
        data: { updatedAt: new Date() },
        exception: null,
        embedded: { publicId: "" },
      };
    }
  };

  const mutation = useMutation({
    mutationFn: perform,
    onSuccess: async (response, request: UpdateMyRoutineByIdRequest) => {
      if (response.success === false) return;
      const targetKeys = [
        queryKeys.routine.all(),
        queryKeys.station.all(),
        queryKeys.routine.oneById(request.body.routineId as UUID),
      ];
      await Promise.all(
        targetKeys.map(queryKey => queryClient.invalidateQueries({ queryKey }))
      );
      const patch = {
        updatedAt: response.data.updatedAt,
        ...(response.data.definitionVersion !== undefined && {
          definitionVersion: response.data.definitionVersion,
        }),
        ...(request.body.values.stationId !== undefined && {
          stationId: request.body.values.stationId,
        }),
        ...(request.body.values.title !== undefined && {
          title: request.body.values.title,
        }),
        ...(request.body.values.hasCustomSchedule !== undefined && {
          hasCustomSchedule: request.body.values.hasCustomSchedule,
        }),
        ...(request.body.values.isActive !== undefined && {
          isActive: request.body.values.isActive,
        }),
        ...(request.body.values.isPinned !== undefined && {
          isPinned: request.body.values.isPinned,
        }),
        ...(request.body.values.scheduledStartAt !== undefined && {
          scheduledStartAt: request.body.values.scheduledStartAt,
        }),
        ...(request.body.values.scheduledEndAt !== undefined && {
          scheduledEndAt: request.body.values.scheduledEndAt,
        }),
        ...(response.data.hasCustomSchedule !== undefined && {
          hasCustomSchedule: response.data.hasCustomSchedule,
        }),
        ...(response.data.scheduledStartAt && {
          scheduledStartAt: response.data.scheduledStartAt,
        }),
        ...(response.data.scheduledEndAt && {
          scheduledEndAt: response.data.scheduledEndAt,
        }),
        ...(request.body.values.timezone !== undefined && {
          timezone: request.body.values.timezone,
        }),
        ...(request.body.values.period !== undefined && {
          period: toGraphQLRoutinePeriod(request.body.values.period),
        }),
      };
      apolloClient.cache.modify({
        fields: {
          searchRoutines(existing, { readField, storeFieldName, DELETE }) {
            if (!existing?.searchEdges) return existing;
            const input = readSearchFieldInput(storeFieldName);
            if (input.isDeletedAt === true) return DELETE;
            const query = input.query;
            const searchEdges = existing.searchEdges.flatMap((edge: any) => {
              if (readField("id", edge.node) !== request.body.routineId) {
                return [edge];
              }
              const node = {
                ...edge.node,
                id: request.body.routineId,
                stationId: readField("stationId", edge.node),
                title: readField("title", edge.node),
                tagIds: (readField("tagIds", edge.node) as string[]) ?? [],
                ...patch,
              };
              return query && !matchesSearch(node.title, query)
                ? []
                : input.stationIds.length > 0 &&
                    !input.stationIds.includes(node.stationId)
                  ? []
                  : input.tagIds.length > 0 &&
                      !input.tagIds.some((tagId: string) =>
                        node.tagIds.includes(tagId)
                      )
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
      clearSearchRoutineTags(apolloClient.cache);
      apolloClient.cache.gc();
      if (response.embedded?.publicId === "") return;
      await RoutineLocalSynchronizer.syncUpdateMyRoutineById(request, response);
    },
  });

  return mutation;
};

export const useUpdateMyRoutinesByIds = (
  options: { offlineFallback?: boolean } = {}
) => {
  const queryClient = getQueryClient();
  const apolloClient = useApolloClient();

  const perform = async (request: UpdateMyRoutinesByIdsRequest) => {
    try {
      parseRequest(UpdateMyRoutinesByIdsRequestSchema, request);
      if (isRemoteUnavailable()) {
        throw new NotegicFetchError(FetchClientExceptions.MissingNetwork());
      }
      return await mutationFnUpdateMyRoutinesByIds(request);
    } catch (error) {
      if (
        options.offlineFallback === false ||
        !NetworkExceptions.isMissingNetworkError(error)
      )
        throw error;
      await RoutineLocalSimulator.simulateUpdateMyRoutinesByIds(request);
      return {
        success: true as const,
        data: { updatedAt: new Date() },
        exception: null,
        embedded: { publicId: "" },
      } as Awaited<ReturnType<typeof mutationFnUpdateMyRoutinesByIds>>;
    }
  };

  const mutation = useMutation({
    mutationFn: perform,
    onSuccess: async (response, request: UpdateMyRoutinesByIdsRequest) => {
      if (response.success === false) return;
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
        const patch = {
          updatedAt: response.data.updatedAt,
          ...(routine.values.stationId !== undefined && {
            stationId: routine.values.stationId,
          }),
          ...(routine.values.title !== undefined && {
            title: routine.values.title,
          }),
          ...(routine.values.hasCustomSchedule !== undefined && {
            hasCustomSchedule: routine.values.hasCustomSchedule,
          }),
          ...(routine.values.isActive !== undefined && {
            isActive: routine.values.isActive,
          }),
          ...(routine.values.isPinned !== undefined && {
            isPinned: routine.values.isPinned,
          }),
          ...(routine.values.scheduledStartAt !== undefined && {
            scheduledStartAt: routine.values.scheduledStartAt,
          }),
          ...(routine.values.scheduledEndAt !== undefined && {
            scheduledEndAt: routine.values.scheduledEndAt,
          }),
          ...(routine.values.timezone !== undefined && {
            timezone: routine.values.timezone,
          }),
          ...(routine.values.period !== undefined && {
            period: toGraphQLRoutinePeriod(routine.values.period),
          }),
        };
        apolloClient.cache.modify({
          fields: {
            searchRoutines(existing, { readField, storeFieldName, DELETE }) {
              if (!existing?.searchEdges) return existing;
              const input = readSearchFieldInput(storeFieldName);
              if (input.isDeletedAt === true) return DELETE;
              const query = input.query;
              const searchEdges = existing.searchEdges.flatMap((edge: any) => {
                if (readField("id", edge.node) !== routine.routineId) {
                  return [edge];
                }
                const node = {
                  ...edge.node,
                  id: routine.routineId,
                  stationId: readField("stationId", edge.node),
                  title: readField("title", edge.node),
                  tagIds: (readField("tagIds", edge.node) as string[]) ?? [],
                  ...patch,
                };
                return query && !matchesSearch(node.title, query)
                  ? []
                  : input.stationIds.length > 0 &&
                      !input.stationIds.includes(node.stationId)
                    ? []
                    : input.tagIds.length > 0 &&
                        !input.tagIds.some((tagId: string) =>
                          node.tagIds.includes(tagId)
                        )
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
      }
      clearSearchRoutineTags(apolloClient.cache);
      apolloClient.cache.gc();
      if (response.embedded?.publicId === "") return;
      await RoutineLocalSynchronizer.syncUpdateMyRoutinesByIds(
        request,
        response
      );
    },
  });

  return mutation;
};

export const useLinkRoutineTagById = (
  options: { offlineFallback?: boolean } = {}
) => {
  const queryClient = getQueryClient();
  const apolloClient = useApolloClient();

  const perform = async (request: LinkRoutineTagByIdRequest) => {
    try {
      if (isRemoteUnavailable()) {
        throw new NotegicFetchError(FetchClientExceptions.MissingNetwork());
      }
      return await mutationFnLinkRoutineTagById(request);
    } catch (error) {
      if (
        options.offlineFallback === false ||
        !NetworkExceptions.isMissingNetworkError(error)
      )
        throw error;
      await RoutineLocalSimulator.simulateLinkRoutineTagById(request);
      return {
        success: true as const,
        data: { updatedAt: new Date() },
        exception: null,
        embedded: { publicId: "" },
      } as Awaited<ReturnType<typeof mutationFnLinkRoutineTagById>>;
    }
  };

  const mutation = useMutation({
    mutationFn: perform,
    onSuccess: async (response, request: LinkRoutineTagByIdRequest) => {
      if (response.success === false) return;
      const targetKeys = [
        queryKeys.routine.all(),
        queryKeys.routine.oneById(request.body.routineId as UUID),
        queryKeys.routine.oneById(request.body.routineId as UUID),
      ];
      await Promise.all(
        targetKeys.map(queryKey => queryClient.invalidateQueries({ queryKey }))
      );
      const routineId = request.body.routineId;
      const fieldName: "tagIds" | "taskIds" | "itemIds" = "tagIds";
      const value = request.body.routineTagId;
      const isRemove = request.body.isUnlink;
      const cachedRoutine = apolloClient.cache.readFragment<any>({
        id: apolloClient.cache.identify({
          __typename: "PrivateSearchableRoutine",
          id: routineId,
        }),
        fragment: FragmentedBasicPrivateSearchableRoutineFragmentDoc,
      });
      const currentIds =
        (cachedRoutine?.[fieldName] as string[] | undefined) ?? [];
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
          searchRoutines(
            existing,
            { readField, storeFieldName, toReference, DELETE }
          ) {
            if (!existing?.searchEdges) return existing;
            const input = readSearchFieldInput(storeFieldName);
            if (input.isDeletedAt === true) return DELETE;
            const query = input.query;
            let existed = false;
            const searchEdges = existing.searchEdges.flatMap((edge: any) => {
              if (readField("id", edge.node) !== routineId) return [edge];
              existed = true;
              const current =
                (readField(fieldName, edge.node) as string[]) ?? [];
              const node = patchedRoutine ?? {
                ...edge.node,
                id: routineId,
                stationId: readField("stationId", edge.node),
                title: readField("title", edge.node),
                tagIds: (readField("tagIds", edge.node) as string[]) ?? [],
              };
              return query && !matchesSearch(node.title, query)
                ? []
                : input.stationIds.length > 0 &&
                    !input.stationIds.includes(node.stationId)
                  ? []
                  : input.tagIds.length > 0 &&
                      !input.tagIds.some((tagId: string) =>
                        node.tagIds.includes(tagId)
                      )
                    ? []
                    : [
                        {
                          ...edge,
                          node: patchedRoutine
                            ? (toReference(patchedRoutine, true) ??
                              patchedRoutine)
                            : node,
                        },
                      ];
            });
            if (
              !existed &&
              patchedRoutine &&
              (!query || matchesSearch(patchedRoutine.title, query)) &&
              (input.stationIds.length === 0 ||
                input.stationIds.includes(patchedRoutine.stationId)) &&
              (input.tagIds.length === 0 ||
                input.tagIds.some((tagId: string) =>
                  patchedRoutine.tagIds.includes(tagId)
                ))
            ) {
              searchEdges.unshift({
                __typename: "SearchRoutineEdge",
                encodedSearchCursor: routineSearchCursor(input, patchedRoutine),
                node: toReference(patchedRoutine, true) ?? patchedRoutine,
              });
            }
            return {
              ...existing,
              totalCount:
                (existing.totalCount ?? existing.searchEdges.length) +
                searchEdges.length -
                existing.searchEdges.length,
              searchEdges,
            };
          },
        },
      });
      clearSearchRoutineTags(apolloClient.cache);
      apolloClient.cache.gc();
      if (response.embedded?.publicId === "") return;
      await RoutineLocalSynchronizer.syncLinkRoutineTagById(request, response);
    },
  });

  return mutation;
};

export const useLinkRoutineTagsByIds = (
  options: { offlineFallback?: boolean } = {}
) => {
  const queryClient = getQueryClient();
  const apolloClient = useApolloClient();

  const perform = async (request: LinkRoutineTagsByIdsRequest) => {
    try {
      if (isRemoteUnavailable()) {
        throw new NotegicFetchError(FetchClientExceptions.MissingNetwork());
      }
      return await mutationFnLinkRoutineTagsByIds(request);
    } catch (error) {
      if (
        options.offlineFallback === false ||
        !NetworkExceptions.isMissingNetworkError(error)
      )
        throw error;
      await RoutineLocalSimulator.simulateLinkRoutineTagsByIds(request);
      return {
        success: true as const,
        data: { updatedAt: new Date() },
        exception: null,
        embedded: { publicId: "" },
      } as Awaited<ReturnType<typeof mutationFnLinkRoutineTagsByIds>>;
    }
  };

  const mutation = useMutation({
    mutationFn: perform,
    onSuccess: async (response, request: LinkRoutineTagsByIdsRequest) => {
      if (response.success === false) return;
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
        const routineId = item.routineId;
        const fieldName: "tagIds" | "taskIds" | "itemIds" = "tagIds";
        const value = item.routineTagId;
        const isRemove = request.body.isUnlink;
        const cachedRoutine = apolloClient.cache.readFragment<any>({
          id: apolloClient.cache.identify({
            __typename: "PrivateSearchableRoutine",
            id: routineId,
          }),
          fragment: FragmentedBasicPrivateSearchableRoutineFragmentDoc,
        });
        const currentIds =
          (cachedRoutine?.[fieldName] as string[] | undefined) ?? [];
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
            searchRoutines(
              existing,
              { readField, storeFieldName, toReference, DELETE }
            ) {
              if (!existing?.searchEdges) return existing;
              const input = readSearchFieldInput(storeFieldName);
              if (input.isDeletedAt === true) return DELETE;
              const query = input.query;
              let existed = false;
              const searchEdges = existing.searchEdges.flatMap((edge: any) => {
                if (readField("id", edge.node) !== routineId) return [edge];
                existed = true;
                const current =
                  (readField(fieldName, edge.node) as string[]) ?? [];
                const node = patchedRoutine ?? {
                  ...edge.node,
                  id: routineId,
                  stationId: readField("stationId", edge.node),
                  title: readField("title", edge.node),
                  tagIds: (readField("tagIds", edge.node) as string[]) ?? [],
                };
                return query && !matchesSearch(node.title, query)
                  ? []
                  : input.stationIds.length > 0 &&
                      !input.stationIds.includes(node.stationId)
                    ? []
                    : input.tagIds.length > 0 &&
                        !input.tagIds.some((tagId: string) =>
                          node.tagIds.includes(tagId)
                        )
                      ? []
                      : [
                          {
                            ...edge,
                            node: patchedRoutine
                              ? (toReference(patchedRoutine, true) ??
                                patchedRoutine)
                              : node,
                          },
                        ];
              });
              if (
                !existed &&
                patchedRoutine &&
                (!query || matchesSearch(patchedRoutine.title, query)) &&
                (input.stationIds.length === 0 ||
                  input.stationIds.includes(patchedRoutine.stationId)) &&
                (input.tagIds.length === 0 ||
                  input.tagIds.some((tagId: string) =>
                    patchedRoutine.tagIds.includes(tagId)
                  ))
              ) {
                searchEdges.unshift({
                  __typename: "SearchRoutineEdge",
                  encodedSearchCursor: routineSearchCursor(
                    input,
                    patchedRoutine
                  ),
                  node: toReference(patchedRoutine, true) ?? patchedRoutine,
                });
              }
              return {
                ...existing,
                totalCount:
                  (existing.totalCount ?? existing.searchEdges.length) +
                  searchEdges.length -
                  existing.searchEdges.length,
                searchEdges,
              };
            },
          },
        });
      }
      clearSearchRoutineTags(apolloClient.cache);
      apolloClient.cache.gc();
      if (response.embedded?.publicId === "") return;
      await RoutineLocalSynchronizer.syncLinkRoutineTagsByIds(
        request,
        response
      );
    },
  });

  return mutation;
};

export const useLinkRoutineTaskById = (
  options: { offlineFallback?: boolean } = {}
) => {
  const queryClient = getQueryClient();
  const apolloClient = useApolloClient();

  const perform = async (
    request: Parameters<typeof mutationFnLinkRoutineTaskById>[0]
  ) => {
    try {
      if (isRemoteUnavailable()) {
        throw new NotegicFetchError(FetchClientExceptions.MissingNetwork());
      }
      return await mutationFnLinkRoutineTaskById(request);
    } catch (error) {
      if (
        options.offlineFallback === false ||
        !NetworkExceptions.isMissingNetworkError(error)
      )
        throw error;
      await RoutineLocalSimulator.simulateLinkRoutineTaskById(request);
      return {
        success: true as const,
        data: { updatedAt: new Date() },
        exception: null,
        embedded: { publicId: "" },
      };
    }
  };

  const mutation = useMutation({
    mutationFn: perform,
    onSuccess: async (response, request: LinkRoutineTaskByIdRequest) => {
      const targetKeys = [
        queryKeys.routine.all(),
        queryKeys.routine.oneById(request.body.routineId as UUID),
        queryKeys.routine.oneById(request.body.routineId as UUID),
      ];
      await Promise.all(
        targetKeys.map(queryKey => queryClient.invalidateQueries({ queryKey }))
      );
      const routineId = request.body.routineId;
      const fieldName: "tagIds" | "taskIds" | "itemIds" = "taskIds";
      const value = request.body.routineTaskId;
      const isRemove = request.body.isUnlink;
      const cachedRoutine = apolloClient.cache.readFragment<any>({
        id: apolloClient.cache.identify({
          __typename: "PrivateSearchableRoutine",
          id: routineId,
        }),
        fragment: FragmentedBasicPrivateSearchableRoutineFragmentDoc,
      });
      const currentIds =
        (cachedRoutine?.[fieldName] as string[] | undefined) ?? [];
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
          searchRoutines(
            existing,
            { readField, storeFieldName, toReference, DELETE }
          ) {
            if (!existing?.searchEdges) return existing;
            const input = readSearchFieldInput(storeFieldName);
            if (input.isDeletedAt === true) return DELETE;
            const query = input.query;
            let existed = false;
            const searchEdges = existing.searchEdges.flatMap((edge: any) => {
              if (readField("id", edge.node) !== routineId) return [edge];
              existed = true;
              const current =
                (readField(fieldName, edge.node) as string[]) ?? [];
              const node = patchedRoutine ?? {
                ...edge.node,
                id: routineId,
                stationId: readField("stationId", edge.node),
                title: readField("title", edge.node),
                tagIds: (readField("tagIds", edge.node) as string[]) ?? [],
              };
              return query && !matchesSearch(node.title, query)
                ? []
                : input.stationIds.length > 0 &&
                    !input.stationIds.includes(node.stationId)
                  ? []
                  : input.tagIds.length > 0 &&
                      !input.tagIds.some((tagId: string) =>
                        node.tagIds.includes(tagId)
                      )
                    ? []
                    : [
                        {
                          ...edge,
                          node: patchedRoutine
                            ? (toReference(patchedRoutine, true) ??
                              patchedRoutine)
                            : node,
                        },
                      ];
            });
            if (
              !existed &&
              patchedRoutine &&
              (!query || matchesSearch(patchedRoutine.title, query)) &&
              (input.stationIds.length === 0 ||
                input.stationIds.includes(patchedRoutine.stationId)) &&
              (input.tagIds.length === 0 ||
                input.tagIds.some((tagId: string) =>
                  patchedRoutine.tagIds.includes(tagId)
                ))
            ) {
              searchEdges.unshift({
                __typename: "SearchRoutineEdge",
                encodedSearchCursor: routineSearchCursor(input, patchedRoutine),
                node: toReference(patchedRoutine, true) ?? patchedRoutine,
              });
            }
            return {
              ...existing,
              totalCount:
                (existing.totalCount ?? existing.searchEdges.length) +
                searchEdges.length -
                existing.searchEdges.length,
              searchEdges,
            };
          },
        },
      });
      apolloClient.cache.modify({
        fields: {
          searchRoutineTasks(existing, { readField }) {
            if (!existing?.searchEdges) return existing;
            return {
              ...existing,
              searchEdges: existing.searchEdges.map((edge: any) => {
                if (readField("id", edge.node) !== request.body.routineTaskId) {
                  return edge;
                }
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
      apolloClient.cache.gc();
    },
    onError: error => {},
  });

  return mutation;
};

export const useLinkRoutineTasksByIds = (
  options: { offlineFallback?: boolean } = {}
) => {
  const queryClient = getQueryClient();
  const apolloClient = useApolloClient();

  const perform = async (
    request: Parameters<typeof mutationFnLinkRoutineTasksByIds>[0]
  ) => {
    try {
      if (isRemoteUnavailable()) {
        throw new NotegicFetchError(FetchClientExceptions.MissingNetwork());
      }
      return await mutationFnLinkRoutineTasksByIds(request);
    } catch (error) {
      if (
        options.offlineFallback === false ||
        !NetworkExceptions.isMissingNetworkError(error)
      )
        throw error;
      await RoutineLocalSimulator.simulateLinkRoutineTasksByIds(request);
      return {
        success: true as const,
        data: { updatedAt: new Date() },
        exception: null,
        embedded: { publicId: "" },
      };
    }
  };

  const mutation = useMutation({
    mutationFn: perform,
    onSuccess: async (response, request: LinkRoutineTasksByIdsRequest) => {
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
        const routineId = item.routineId;
        const fieldName: "tagIds" | "taskIds" | "itemIds" = "taskIds";
        const value = item.routineTaskId;
        const isRemove = request.body.isUnlink;
        const cachedRoutine = apolloClient.cache.readFragment<any>({
          id: apolloClient.cache.identify({
            __typename: "PrivateSearchableRoutine",
            id: routineId,
          }),
          fragment: FragmentedBasicPrivateSearchableRoutineFragmentDoc,
        });
        const currentIds =
          (cachedRoutine?.[fieldName] as string[] | undefined) ?? [];
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
            searchRoutines(
              existing,
              { readField, storeFieldName, toReference, DELETE }
            ) {
              if (!existing?.searchEdges) return existing;
              const input = readSearchFieldInput(storeFieldName);
              if (input.isDeletedAt === true) return DELETE;
              const query = input.query;
              let existed = false;
              const searchEdges = existing.searchEdges.flatMap((edge: any) => {
                if (readField("id", edge.node) !== routineId) return [edge];
                existed = true;
                const current =
                  (readField(fieldName, edge.node) as string[]) ?? [];
                const node = patchedRoutine ?? {
                  ...edge.node,
                  id: routineId,
                  stationId: readField("stationId", edge.node),
                  title: readField("title", edge.node),
                  tagIds: (readField("tagIds", edge.node) as string[]) ?? [],
                };
                return query && !matchesSearch(node.title, query)
                  ? []
                  : input.stationIds.length > 0 &&
                      !input.stationIds.includes(node.stationId)
                    ? []
                    : input.tagIds.length > 0 &&
                        !input.tagIds.some((tagId: string) =>
                          node.tagIds.includes(tagId)
                        )
                      ? []
                      : [
                          {
                            ...edge,
                            node: patchedRoutine
                              ? (toReference(patchedRoutine, true) ??
                                patchedRoutine)
                              : node,
                          },
                        ];
              });
              if (
                !existed &&
                patchedRoutine &&
                (!query || matchesSearch(patchedRoutine.title, query)) &&
                (input.stationIds.length === 0 ||
                  input.stationIds.includes(patchedRoutine.stationId)) &&
                (input.tagIds.length === 0 ||
                  input.tagIds.some((tagId: string) =>
                    patchedRoutine.tagIds.includes(tagId)
                  ))
              ) {
                searchEdges.unshift({
                  __typename: "SearchRoutineEdge",
                  encodedSearchCursor: routineSearchCursor(
                    input,
                    patchedRoutine
                  ),
                  node: toReference(patchedRoutine, true) ?? patchedRoutine,
                });
              }
              return {
                ...existing,
                totalCount:
                  (existing.totalCount ?? existing.searchEdges.length) +
                  searchEdges.length -
                  existing.searchEdges.length,
                searchEdges,
              };
            },
          },
        });
        apolloClient.cache.modify({
          fields: {
            searchRoutineTasks(existing, { readField }) {
              if (!existing?.searchEdges) return existing;
              return {
                ...existing,
                searchEdges: existing.searchEdges.map((edge: any) => {
                  if (readField("id", edge.node) !== item.routineTaskId) {
                    return edge;
                  }
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
      }
      apolloClient.cache.gc();
    },
    onError: error => {},
  });

  return mutation;
};

export const useLinkRoutineItemById = (
  options: { offlineFallback?: boolean } = {}
) => {
  const queryClient = getQueryClient();
  const apolloClient = useApolloClient();

  const perform = async (request: LinkRoutineItemByIdRequest) => {
    try {
      if (isRemoteUnavailable()) {
        throw new NotegicFetchError(FetchClientExceptions.MissingNetwork());
      }
      return await mutationFnLinkRoutineItemById(request);
    } catch (error) {
      if (
        options.offlineFallback === false ||
        !NetworkExceptions.isMissingNetworkError(error)
      )
        throw error;
      await RoutineLocalSimulator.simulateLinkRoutineItemById(request);
      return {
        success: true as const,
        data: { updatedAt: new Date() },
        exception: null,
        embedded: { publicId: "" },
      } as Awaited<ReturnType<typeof mutationFnLinkRoutineItemById>>;
    }
  };

  const mutation = useMutation({
    mutationFn: perform,
    onSuccess: async (response, request: LinkRoutineItemByIdRequest) => {
      if (response.success === false) return;
      const targetKeys = [
        queryKeys.routine.all(),
        queryKeys.routine.oneById(request.body.routineId as UUID),
        queryKeys.routine.oneById(request.body.routineId as UUID),
      ];
      await Promise.all(
        targetKeys.map(queryKey => queryClient.invalidateQueries({ queryKey }))
      );
      const routineId = request.body.routineId;
      const fieldName: "tagIds" | "taskIds" | "itemIds" = "itemIds";
      const value = request.body.itemId;
      const isRemove = request.body.isUnlink;
      const cachedRoutine = apolloClient.cache.readFragment<any>({
        id: apolloClient.cache.identify({
          __typename: "PrivateSearchableRoutine",
          id: routineId,
        }),
        fragment: FragmentedBasicPrivateSearchableRoutineFragmentDoc,
      });
      const currentIds =
        (cachedRoutine?.[fieldName] as string[] | undefined) ?? [];
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
          searchRoutines(
            existing,
            { readField, storeFieldName, toReference, DELETE }
          ) {
            if (!existing?.searchEdges) return existing;
            const input = readSearchFieldInput(storeFieldName);
            if (input.isDeletedAt === true) return DELETE;
            const query = input.query;
            let existed = false;
            const searchEdges = existing.searchEdges.flatMap((edge: any) => {
              if (readField("id", edge.node) !== routineId) return [edge];
              existed = true;
              const current =
                (readField(fieldName, edge.node) as string[]) ?? [];
              const node = patchedRoutine ?? {
                ...edge.node,
                id: routineId,
                stationId: readField("stationId", edge.node),
                title: readField("title", edge.node),
                tagIds: (readField("tagIds", edge.node) as string[]) ?? [],
              };
              return query && !matchesSearch(node.title, query)
                ? []
                : input.stationIds.length > 0 &&
                    !input.stationIds.includes(node.stationId)
                  ? []
                  : input.tagIds.length > 0 &&
                      !input.tagIds.some((tagId: string) =>
                        node.tagIds.includes(tagId)
                      )
                    ? []
                    : [
                        {
                          ...edge,
                          node: patchedRoutine
                            ? (toReference(patchedRoutine, true) ??
                              patchedRoutine)
                            : node,
                        },
                      ];
            });
            if (
              !existed &&
              patchedRoutine &&
              (!query || matchesSearch(patchedRoutine.title, query)) &&
              (input.stationIds.length === 0 ||
                input.stationIds.includes(patchedRoutine.stationId)) &&
              (input.tagIds.length === 0 ||
                input.tagIds.some((tagId: string) =>
                  patchedRoutine.tagIds.includes(tagId)
                ))
            ) {
              searchEdges.unshift({
                __typename: "SearchRoutineEdge",
                encodedSearchCursor: routineSearchCursor(input, patchedRoutine),
                node: toReference(patchedRoutine, true) ?? patchedRoutine,
              });
            }
            return {
              ...existing,
              totalCount:
                (existing.totalCount ?? existing.searchEdges.length) +
                searchEdges.length -
                existing.searchEdges.length,
              searchEdges,
            };
          },
        },
      });
      clearSearchItems(apolloClient.cache);
      apolloClient.cache.gc();
      if (response.embedded?.publicId === "") return;
      await RoutineLocalSynchronizer.syncLinkRoutineItemById(request, response);
    },
  });

  return mutation;
};

export const useLinkRoutineItemsByIds = (
  options: { offlineFallback?: boolean } = {}
) => {
  const queryClient = getQueryClient();
  const apolloClient = useApolloClient();

  const perform = async (request: LinkRoutineItemsByIdsRequest) => {
    try {
      if (isRemoteUnavailable()) {
        throw new NotegicFetchError(FetchClientExceptions.MissingNetwork());
      }
      return await mutationFnLinkRoutineItemsByIds(request);
    } catch (error) {
      if (
        options.offlineFallback === false ||
        !NetworkExceptions.isMissingNetworkError(error)
      )
        throw error;
      await RoutineLocalSimulator.simulateLinkRoutineItemsByIds(request);
      return {
        success: true as const,
        data: { updatedAt: new Date() },
        exception: null,
        embedded: { publicId: "" },
      } as Awaited<ReturnType<typeof mutationFnLinkRoutineItemsByIds>>;
    }
  };

  const mutation = useMutation({
    mutationFn: perform,
    onSuccess: async (response, request: LinkRoutineItemsByIdsRequest) => {
      if (response.success === false) return;
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
        const routineId = item.routineId;
        const fieldName: "tagIds" | "taskIds" | "itemIds" = "itemIds";
        const value = item.itemId;
        const isRemove = request.body.isUnlink;
        const cachedRoutine = apolloClient.cache.readFragment<any>({
          id: apolloClient.cache.identify({
            __typename: "PrivateSearchableRoutine",
            id: routineId,
          }),
          fragment: FragmentedBasicPrivateSearchableRoutineFragmentDoc,
        });
        const currentIds =
          (cachedRoutine?.[fieldName] as string[] | undefined) ?? [];
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
            searchRoutines(
              existing,
              { readField, storeFieldName, toReference, DELETE }
            ) {
              if (!existing?.searchEdges) return existing;
              const input = readSearchFieldInput(storeFieldName);
              if (input.isDeletedAt === true) return DELETE;
              const query = input.query;
              let existed = false;
              const searchEdges = existing.searchEdges.flatMap((edge: any) => {
                if (readField("id", edge.node) !== routineId) return [edge];
                existed = true;
                const current =
                  (readField(fieldName, edge.node) as string[]) ?? [];
                const node = patchedRoutine ?? {
                  ...edge.node,
                  id: routineId,
                  stationId: readField("stationId", edge.node),
                  title: readField("title", edge.node),
                  tagIds: (readField("tagIds", edge.node) as string[]) ?? [],
                };
                return query && !matchesSearch(node.title, query)
                  ? []
                  : input.stationIds.length > 0 &&
                      !input.stationIds.includes(node.stationId)
                    ? []
                    : input.tagIds.length > 0 &&
                        !input.tagIds.some((tagId: string) =>
                          node.tagIds.includes(tagId)
                        )
                      ? []
                      : [
                          {
                            ...edge,
                            node: patchedRoutine
                              ? (toReference(patchedRoutine, true) ??
                                patchedRoutine)
                              : node,
                          },
                        ];
              });
              if (
                !existed &&
                patchedRoutine &&
                (!query || matchesSearch(patchedRoutine.title, query)) &&
                (input.stationIds.length === 0 ||
                  input.stationIds.includes(patchedRoutine.stationId)) &&
                (input.tagIds.length === 0 ||
                  input.tagIds.some((tagId: string) =>
                    patchedRoutine.tagIds.includes(tagId)
                  ))
              ) {
                searchEdges.unshift({
                  __typename: "SearchRoutineEdge",
                  encodedSearchCursor: routineSearchCursor(
                    input,
                    patchedRoutine
                  ),
                  node: toReference(patchedRoutine, true) ?? patchedRoutine,
                });
              }
              return {
                ...existing,
                totalCount:
                  (existing.totalCount ?? existing.searchEdges.length) +
                  searchEdges.length -
                  existing.searchEdges.length,
                searchEdges,
              };
            },
          },
        });
      }
      clearSearchItems(apolloClient.cache);
      apolloClient.cache.gc();
      if (response.embedded?.publicId === "") return;
      await RoutineLocalSynchronizer.syncLinkRoutineItemsByIds(
        request,
        response
      );
    },
  });

  return mutation;
};

export const useRestoreMyRoutineById = (
  options: { offlineFallback?: boolean } = {}
) => {
  const queryClient = getQueryClient();
  const apolloClient = useApolloClient();

  const perform = async (request: RestoreMyRoutineByIdRequest) => {
    try {
      if (isRemoteUnavailable()) {
        throw new NotegicFetchError(FetchClientExceptions.MissingNetwork());
      }
      return await mutationFnRestoreMyRoutineById(request);
    } catch (error) {
      if (
        options.offlineFallback === false ||
        !NetworkExceptions.isMissingNetworkError(error)
      )
        throw error;
      await RoutineLocalSimulator.simulateRestoreMyRoutineById(request);
      return {
        success: true as const,
        data: { updatedAt: new Date() },
        exception: null,
        embedded: { publicId: "" },
      } as Awaited<ReturnType<typeof mutationFnRestoreMyRoutineById>>;
    }
  };

  const mutation = useMutation({
    retry: false,
    mutationFn: perform,
    onSuccess: async (response, request: RestoreMyRoutineByIdRequest) => {
      if (response.success === false) return;
      const targetKeys = [
        queryKeys.routine.all(),
        queryKeys.routine.oneById(request.body.routineId as UUID),
      ];
      await Promise.all(
        targetKeys.map(queryKey => queryClient.invalidateQueries({ queryKey }))
      );
      clearSearchRoutines(apolloClient.cache);
      clearSearchStations(apolloClient.cache);
      clearSearchRoutineTags(apolloClient.cache);
      apolloClient.cache.gc();
      if (response.embedded?.publicId === "") return;
      await RoutineLocalSynchronizer.syncRestoreMyRoutineById(
        request,
        response
      );
    },
  });

  return mutation;
};

export const useRestoreMyRoutinesByIds = (
  options: { offlineFallback?: boolean } = {}
) => {
  const queryClient = getQueryClient();
  const apolloClient = useApolloClient();

  const perform = async (request: RestoreMyRoutinesByIdsRequest) => {
    try {
      if (isRemoteUnavailable()) {
        throw new NotegicFetchError(FetchClientExceptions.MissingNetwork());
      }
      return await mutationFnRestoreMyRoutinesByIds(request);
    } catch (error) {
      if (
        options.offlineFallback === false ||
        !NetworkExceptions.isMissingNetworkError(error)
      )
        throw error;
      const restored =
        await RoutineLocalSimulator.simulateRestoreMyRoutinesByIds(request);
      return {
        success: true as const,
        data: restored,
        exception: null,
        embedded: { publicId: "" },
      } as Awaited<ReturnType<typeof mutationFnRestoreMyRoutinesByIds>>;
    }
  };

  const mutation = useMutation({
    retry: false,
    mutationFn: perform,
    onSuccess: async (response, request: RestoreMyRoutinesByIdsRequest) => {
      if (response.success === false) return;
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
      clearSearchRoutines(apolloClient.cache);
      clearSearchStations(apolloClient.cache);
      clearSearchRoutineTags(apolloClient.cache);
      apolloClient.cache.gc();
      if (response.embedded?.publicId === "") return;
      await RoutineLocalSynchronizer.syncRestoreMyRoutinesByIds(
        request,
        response
      ).catch(error =>
        console.error("Failed to refresh confirmed Trash action", error)
      );
    },
  });

  return mutation;
};

export const useDeleteMyRoutineById = (
  options: { offlineFallback?: boolean } = {}
) => {
  const queryClient = getQueryClient();
  const apolloClient = useApolloClient();

  const perform = async (request: DeleteMyRoutineByIdRequest) => {
    try {
      if (isRemoteUnavailable()) {
        throw new NotegicFetchError(FetchClientExceptions.MissingNetwork());
      }
      return await mutationFnDeleteMyRoutineById(request);
    } catch (error) {
      if (
        options.offlineFallback === false ||
        !NetworkExceptions.isMissingNetworkError(error)
      )
        throw error;
      await RoutineLocalSimulator.simulateDeleteMyRoutineById(request);
      return {
        success: true as const,
        data: { deletedAt: new Date() },
        exception: null,
        embedded: { publicId: "" },
      } as Awaited<ReturnType<typeof mutationFnDeleteMyRoutineById>>;
    }
  };

  const mutation = useMutation({
    mutationFn: perform,
    onSuccess: async (response, request: DeleteMyRoutineByIdRequest) => {
      if (response.success === false) return;
      const targetKeys = [
        queryKeys.routine.all(),
        queryKeys.station.all(),
        queryKeys.routine.oneById(request.body.routineId as UUID),
      ];
      await Promise.all(
        targetKeys.map(queryKey => queryClient.invalidateQueries({ queryKey }))
      );
      apolloClient.cache.modify({
        fields: {
          searchRoutines(existing, { readField }) {
            return removeSearchRoutines(existing, readField, [
              request.body.routineId,
            ]);
          },
        },
      });
      clearSearchStations(apolloClient.cache);
      clearSearchRoutineTags(apolloClient.cache);
      apolloClient.cache.gc();
      if (response.embedded?.publicId === "") return;
      await RoutineLocalSynchronizer.syncDeleteMyRoutineById(request, response);
    },
  });

  return mutation;
};

export const useDeleteMyRoutinesByIds = (
  options: { offlineFallback?: boolean } = {}
) => {
  const queryClient = getQueryClient();
  const apolloClient = useApolloClient();

  const perform = async (request: DeleteMyRoutinesByIdsRequest) => {
    try {
      if (isRemoteUnavailable()) {
        throw new NotegicFetchError(FetchClientExceptions.MissingNetwork());
      }
      return await mutationFnDeleteMyRoutinesByIds(request);
    } catch (error) {
      if (
        options.offlineFallback === false ||
        !NetworkExceptions.isMissingNetworkError(error)
      )
        throw error;
      await RoutineLocalSimulator.simulateDeleteMyRoutinesByIds(request);
      return {
        success: true as const,
        data: { deletedAt: new Date() },
        exception: null,
        embedded: { publicId: "" },
      } as Awaited<ReturnType<typeof mutationFnDeleteMyRoutinesByIds>>;
    }
  };

  const mutation = useMutation({
    mutationFn: perform,
    onSuccess: async (response, request: DeleteMyRoutinesByIdsRequest) => {
      if (response.success === false) return;
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
      apolloClient.cache.modify({
        fields: {
          searchRoutines(existing, { readField }) {
            return removeSearchRoutines(
              existing,
              readField,
              request.body.routineIds
            );
          },
        },
      });
      clearSearchStations(apolloClient.cache);
      clearSearchRoutineTags(apolloClient.cache);
      apolloClient.cache.gc();
      if (response.embedded?.publicId === "") return;
      await RoutineLocalSynchronizer.syncDeleteMyRoutinesByIds(
        request,
        response
      );
    },
  });

  return mutation;
};

export const useHardDeleteMyRoutineById = (
  options: { offlineFallback?: boolean } = {}
) => {
  const queryClient = getQueryClient();
  const apolloClient = useApolloClient();

  const perform = async (request: HardDeleteMyRoutineByIdRequest) => {
    try {
      if (isRemoteUnavailable()) {
        throw new NotegicFetchError(FetchClientExceptions.MissingNetwork());
      }
      return await mutationFnHardDeleteMyRoutineById(request);
    } catch (error) {
      if (
        options.offlineFallback === false ||
        !NetworkExceptions.isMissingNetworkError(error)
      )
        throw error;
      await RoutineLocalSimulator.simulateHardDeleteMyRoutineById(request);
      return {
        success: true as const,
        data: { deletedAt: new Date() },
        exception: null,
        embedded: { publicId: "" },
      } as Awaited<ReturnType<typeof mutationFnHardDeleteMyRoutineById>>;
    }
  };

  const mutation = useMutation({
    retry: false,
    mutationFn: perform,
    onSuccess: async (response, request: HardDeleteMyRoutineByIdRequest) => {
      if (response.success === false) return;
      const targetKeys = [
        queryKeys.routine.all(),
        queryKeys.station.all(),
        queryKeys.routineTask.all(),
        queryKeys.routineTaskDependency.all(),
        queryKeys.routineTaskRecord.all(),
        queryKeys.routine.oneById(request.body.routineId as UUID),
      ];
      await Promise.all(
        targetKeys.map(queryKey => queryClient.invalidateQueries({ queryKey }))
      );
      apolloClient.cache.modify({
        fields: {
          searchRoutines(existing, { readField }) {
            return removeSearchRoutines(existing, readField, [
              request.body.routineId,
            ]);
          },
        },
      });
      clearSearchStations(apolloClient.cache);
      clearSearchRoutineTags(apolloClient.cache);
      apolloClient.cache.gc();
      if (response.embedded?.publicId === "") return;
      await RoutineLocalSynchronizer.syncHardDeleteMyRoutineById(
        request,
        response
      );
    },
  });

  return mutation;
};

export const useHardDeleteMyRoutinesByIds = (
  options: { offlineFallback?: boolean } = {}
) => {
  const queryClient = getQueryClient();
  const apolloClient = useApolloClient();

  const perform = async (request: HardDeleteMyRoutinesByIdsRequest) => {
    try {
      if (isRemoteUnavailable()) {
        throw new NotegicFetchError(FetchClientExceptions.MissingNetwork());
      }
      return await mutationFnHardDeleteMyRoutinesByIds(request);
    } catch (error) {
      if (
        options.offlineFallback === false ||
        !NetworkExceptions.isMissingNetworkError(error)
      )
        throw error;
      await RoutineLocalSimulator.simulateHardDeleteMyRoutinesByIds(request);
      return {
        success: true as const,
        data: { deletedAt: new Date() },
        exception: null,
        embedded: { publicId: "" },
      } as Awaited<ReturnType<typeof mutationFnHardDeleteMyRoutinesByIds>>;
    }
  };

  const mutation = useMutation({
    retry: false,
    mutationFn: perform,
    onSuccess: async (response, request: HardDeleteMyRoutinesByIdsRequest) => {
      if (response.success === false) return;
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
      apolloClient.cache.modify({
        fields: {
          searchRoutines(existing, { readField }) {
            return removeSearchRoutines(
              existing,
              readField,
              request.body.routineIds
            );
          },
        },
      });
      clearSearchStations(apolloClient.cache);
      clearSearchRoutineTags(apolloClient.cache);
      apolloClient.cache.gc();
      if (response.embedded?.publicId === "") return;
      await RoutineLocalSynchronizer.syncHardDeleteMyRoutinesByIds(
        request,
        response
      ).catch(error =>
        console.error("Failed to refresh confirmed Trash action", error)
      );
    },
  });

  return mutation;
};
