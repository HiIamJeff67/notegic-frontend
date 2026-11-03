import type { UUID } from "node:crypto";
import { useApolloClient } from "@apollo/client/react";
import { NotegicAPIError } from "@shared/api/exceptions";
import { FetchClientExceptions } from "@shared/api/exceptions/client/fetch.exception";
import { ValidationClientException } from "@shared/api/exceptions/client/validation.exception";
import { NotegicFetchError } from "@shared/api/exceptions/errors/fetch.error";
import { NotegicValidationError } from "@shared/api/exceptions/errors/validation.error";
import { NetworkExceptions } from "@shared/api/exceptions/network.exception";
import type {
  CreateStationRequest,
  CreateStationsRequest,
  DeleteMyStationByIdRequest,
  DeleteMyStationsByIdsRequest,
  GetAllMyStationsRequest,
  GetAllMyStationsResponse,
  GetMyStationByIdRequest,
  GetMyStationByIdResponse,
  HardDeleteMyStationByIdRequest,
  HardDeleteMyStationsByIdsRequest,
  LeaveMyStationRequest,
  LeaveMyStationResponse,
  RestoreMyStationByIdRequest,
  RestoreMyStationsByIdsRequest,
  TransferMyStationOwnershipRequest,
  TransferMyStationOwnershipResponse,
  UpdateMyStationByIdRequest,
  UpdateMyStationsByIdsRequest,
  VisualizeMyTotalCountRequest,
  VisualizeMyTotalCountResponse,
} from "@shared/api/interfaces/station.interface";
import {
  CreateStationRequestSchema,
  CreateStationsRequestSchema,
  UpdateMyStationByIdRequestSchema,
  UpdateMyStationsByIdsRequestSchema,
} from "@shared/api/interfaces/station.interface";
import { getQueryClient } from "@shared/api/queryClient";
import { UseQueryDefaultOptions } from "@shared/api/queryHookOptions";
import { queryKeys } from "@shared/api/queryKeys";
import { parseRequest } from "@shared/api/validation";
import {
  type UseQueryOptions,
  useMutation,
  useQuery,
} from "@tanstack/react-query";
import { isRemoteUnavailable } from "@/api/availability";
import {
  mutationFnCreateStation,
  mutationFnCreateStations,
  mutationFnDeleteMyStationById,
  mutationFnDeleteMyStationsByIds,
  mutationFnHardDeleteMyStationById,
  mutationFnHardDeleteMyStationsByIds,
  mutationFnLeaveMyStation,
  mutationFnRestoreMyStationById,
  mutationFnRestoreMyStationsByIds,
  mutationFnTransferMyStationOwnership,
  mutationFnUpdateMyStationById,
  mutationFnUpdateMyStationsByIds,
  queryFnGetAllMyStations,
  queryFnGetMyStationById,
  queryFnVisualizeMyTotalCount,
} from "@/api/invokers/station.invoker";
import { StationLocalSimulator } from "@/api/local/simulators/station.simulator";
import { StationLocalSynchronizer } from "@/api/local/synchronizers/station.synchronizer";
import { clearSearchRoutines } from "@/api/policies/searchRoutines.policy";
import { clearSearchRoutineTasks } from "@/api/policies/searchRoutineTasks.policy";
import { clearSearchStations } from "@/api/policies/searchStations.policy";
import { useVisualizeQuery } from "./visualize.hook";

export const useVisualizeMyTotalCount = (
  request?: VisualizeMyTotalCountRequest,
  options?: Partial<UseQueryOptions<VisualizeMyTotalCountResponse, Error>>
) =>
  useVisualizeQuery(
    request,
    currentRequest =>
      queryKeys.station.visualizeMyTotalCount(currentRequest?.param.permission),
    queryFnVisualizeMyTotalCount,
    options
  );

export const useGetMyStationById = (
  hookRequest?: GetMyStationByIdRequest,
  options?: Partial<UseQueryOptions<GetMyStationByIdResponse, Error>>
) => {
  const queryClient = getQueryClient();

  const perform = async (
    request?: GetMyStationByIdRequest
  ): Promise<GetMyStationByIdResponse> => {
    if (!request) {
      throw new NotegicValidationError(
        ValidationClientException.ReceivedUndefinedRequest()
      );
    }

    try {
      if (isRemoteUnavailable()) {
        throw new NotegicFetchError(FetchClientExceptions.MissingNetwork());
      }

      const response = await queryFnGetMyStationById(request);
      await StationLocalSynchronizer.syncGetMyStationById(response);
      return response;
    } catch (error) {
      if (
        error instanceof NotegicAPIError ||
        error instanceof NotegicFetchError
      ) {
        const station =
          await StationLocalSimulator.simulateGetMyStationById(request);
        return (
          NetworkExceptions.isMissingNetworkError(error)
            ? {
                success: true,
                data: station,
                exception: null,
                embedded: { publicId: "" },
              }
            : {
                success: false,
                data: station,
                exception: error.unWrap,
                embedded: { publicId: "" },
              }
        ) as GetMyStationByIdResponse;
      }

      throw error;
    }
  };

  const query = useQuery<GetMyStationByIdResponse, Error>({
    queryKey: queryKeys.station.oneById(
      hookRequest?.param.stationId as UUID | undefined,
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
    callbackRequest: GetMyStationByIdRequest
  ): Promise<GetMyStationByIdResponse> => {
    return queryClient.fetchQuery({
      queryKey: queryKeys.station.oneById(
        callbackRequest.param.stationId as UUID | undefined,
        callbackRequest.param.isDeleted ?? false
      ),
      queryFn: async () => perform(callbackRequest),
      staleTime: UseQueryDefaultOptions.staleTime,
      ...options,
    });
  };

  return { ...query, fetch };
};

export const useGetAllMyStations = (
  hookRequest?: GetAllMyStationsRequest,
  options?: Partial<UseQueryOptions<GetAllMyStationsResponse, Error>>
) => {
  const queryClient = getQueryClient();

  const perform = async (
    request?: GetAllMyStationsRequest
  ): Promise<GetAllMyStationsResponse> => {
    if (!request) {
      throw new NotegicValidationError(
        ValidationClientException.ReceivedUndefinedRequest()
      );
    }

    try {
      if (isRemoteUnavailable()) {
        throw new NotegicFetchError(FetchClientExceptions.MissingNetwork());
      }

      const response = await queryFnGetAllMyStations(request);
      await StationLocalSynchronizer.syncGetAllMyStations(response);
      return response;
    } catch (error) {
      if (
        error instanceof NotegicAPIError ||
        error instanceof NotegicFetchError
      ) {
        const stations =
          await StationLocalSimulator.simulateGetAllMyStations(request);
        return (
          NetworkExceptions.isMissingNetworkError(error)
            ? {
                success: true,
                data: stations,
                exception: null,
                embedded: { publicId: "" },
              }
            : {
                success: false,
                data: stations,
                exception: error.unWrap,
                embedded: { publicId: "" },
              }
        ) as GetAllMyStationsResponse;
      }

      throw error;
    }
  };

  const query = useQuery<GetAllMyStationsResponse, Error>({
    queryKey: queryKeys.station.myAll(hookRequest?.param?.areDeleted ?? false),
    queryFn: async () => perform(hookRequest),
    staleTime: UseQueryDefaultOptions.staleTime,
    refetchOnWindowFocus: UseQueryDefaultOptions.refetchOnWindowFocus,
    refetchOnMount: UseQueryDefaultOptions.refetchOnMount,
    ...options,
    enabled: hookRequest ? (options?.enabled ?? true) : false,
  });

  const fetch = async (
    callbackRequest: GetAllMyStationsRequest
  ): Promise<GetAllMyStationsResponse> => {
    return queryClient.fetchQuery({
      queryKey: queryKeys.station.myAll(
        callbackRequest.param?.areDeleted ?? false
      ),
      queryFn: async () => perform(callbackRequest),
      staleTime: UseQueryDefaultOptions.staleTime,
      ...options,
    });
  };

  return { ...query, fetch };
};

export const useCreateStation = () => {
  const queryClient = getQueryClient();
  const apolloClient = useApolloClient();

  const perform = async (request: CreateStationRequest) => {
    try {
      parseRequest(CreateStationRequestSchema, request);
      if (isRemoteUnavailable()) {
        throw new NotegicFetchError(FetchClientExceptions.MissingNetwork());
      }
      return await mutationFnCreateStation(request);
    } catch (error) {
      if (!NetworkExceptions.isMissingNetworkError(error)) throw error;
      try {
        await StationLocalSimulator.simulateCreateStation(request);
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
    onSuccess: async (response, request: CreateStationRequest) => {
      if (response.success === false) return;
      const targetKeys = [
        queryKeys.station.all(),
        queryKeys.station.oneById(response.data.id as UUID),
      ];
      await Promise.all(
        targetKeys.map(queryKey => queryClient.invalidateQueries({ queryKey }))
      );
      clearSearchStations(apolloClient.cache);
      apolloClient.cache.gc();
      if (response.embedded.publicId === "") return;
      await StationLocalSynchronizer.syncCreateStation(request, response);
    },
  });

  return mutation;
};

export const useCreateStations = () => {
  const queryClient = getQueryClient();
  const apolloClient = useApolloClient();

  const perform = async (request: CreateStationsRequest) => {
    try {
      parseRequest(CreateStationsRequestSchema, request);
      if (isRemoteUnavailable()) {
        throw new NotegicFetchError(FetchClientExceptions.MissingNetwork());
      }
      return await mutationFnCreateStations(request);
    } catch (error) {
      if (!NetworkExceptions.isMissingNetworkError(error)) throw error;
      try {
        await StationLocalSimulator.simulateCreateStations(request);
      } catch (simulateError) {
        console.error(simulateError);
      }
      return {
        success: true as const,
        data: {
          ids: request.body.createdStations.map(station => station.id as UUID),
          createdAt: new Date(),
        },
        exception: null,
        embedded: { publicId: "" },
      };
    }
  };

  const mutation = useMutation({
    mutationFn: perform,
    onSuccess: async (response, request: CreateStationsRequest) => {
      if (response.success === false) return;
      const targetKeys = [
        queryKeys.station.all(),
        ...response.data.ids.map(id => queryKeys.station.oneById(id as UUID)),
      ];
      await Promise.all(
        targetKeys.map(queryKey => queryClient.invalidateQueries({ queryKey }))
      );
      clearSearchStations(apolloClient.cache);
      apolloClient.cache.gc();
      if (response.embedded.publicId === "") return;
      await StationLocalSynchronizer.syncCreateStations(request, response);
    },
  });

  return mutation;
};

export const useUpdateMyStationById = () => {
  const queryClient = getQueryClient();
  const apolloClient = useApolloClient();

  const perform = async (request: UpdateMyStationByIdRequest) => {
    try {
      parseRequest(UpdateMyStationByIdRequestSchema, request);
      if (isRemoteUnavailable()) {
        throw new NotegicFetchError(FetchClientExceptions.MissingNetwork());
      }
      return await mutationFnUpdateMyStationById(request);
    } catch (error) {
      if (!NetworkExceptions.isMissingNetworkError(error)) throw error;
      try {
        await StationLocalSimulator.simulateUpdateMyStationById(request);
      } catch (simulateError) {
        console.error(simulateError);
      }
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
    onSuccess: async (response, request: UpdateMyStationByIdRequest) => {
      if (response.success === false) return;
      const targetKeys = [
        queryKeys.station.all(),
        queryKeys.station.oneById(request.body.stationId as UUID),
      ];
      await Promise.all(
        targetKeys.map(queryKey => queryClient.invalidateQueries({ queryKey }))
      );
      clearSearchStations(apolloClient.cache);
      clearSearchRoutines(apolloClient.cache);
      clearSearchRoutineTasks(apolloClient.cache);
      apolloClient.cache.gc();
      if (response.embedded.publicId === "") return;
      await StationLocalSynchronizer.syncUpdateMyStationById(request, response);
    },
  });

  return mutation;
};

export const useUpdateMyStationsByIds = () => {
  const queryClient = getQueryClient();
  const apolloClient = useApolloClient();

  const perform = async (request: UpdateMyStationsByIdsRequest) => {
    try {
      parseRequest(UpdateMyStationsByIdsRequestSchema, request);
      if (isRemoteUnavailable()) {
        throw new NotegicFetchError(FetchClientExceptions.MissingNetwork());
      }
      return await mutationFnUpdateMyStationsByIds(request);
    } catch (error) {
      if (!NetworkExceptions.isMissingNetworkError(error)) throw error;
      try {
        await StationLocalSimulator.simulateUpdateMyStationsByIds(request);
      } catch (simulateError) {
        console.error(simulateError);
      }
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
    onSuccess: async (response, request: UpdateMyStationsByIdsRequest) => {
      if (response.success === false) return;
      const targetKeys = [
        queryKeys.station.all(),
        ...request.body.updatedStations.map(station =>
          queryKeys.station.oneById(station.stationId as UUID)
        ),
      ];
      await Promise.all(
        targetKeys.map(queryKey => queryClient.invalidateQueries({ queryKey }))
      );
      clearSearchStations(apolloClient.cache);
      clearSearchRoutines(apolloClient.cache);
      clearSearchRoutineTasks(apolloClient.cache);
      apolloClient.cache.gc();
      if (response.embedded.publicId === "") return;
      await StationLocalSynchronizer.syncUpdateMyStationsByIds(
        request,
        response
      );
    },
  });

  return mutation;
};

export const useRestoreMyStationById = () => {
  const queryClient = getQueryClient();
  const apolloClient = useApolloClient();

  const perform = async (request: RestoreMyStationByIdRequest) => {
    try {
      if (isRemoteUnavailable()) {
        throw new NotegicFetchError(FetchClientExceptions.MissingNetwork());
      }
      return await mutationFnRestoreMyStationById(request);
    } catch (error) {
      if (!NetworkExceptions.isMissingNetworkError(error)) throw error;
      await StationLocalSimulator.simulateRestoreMyStationById(request);
      return {
        success: true as const,
        data: { updatedAt: new Date() },
        exception: null,
        embedded: { publicId: "" },
      } as Awaited<ReturnType<typeof mutationFnRestoreMyStationById>>;
    }
  };

  const mutation = useMutation({
    retry: false,
    mutationFn: perform,
    onSuccess: async (response, request: RestoreMyStationByIdRequest) => {
      if (response.success === false) return;
      const targetKeys = [
        queryKeys.station.all(),
        queryKeys.station.oneById(request.body.stationId as UUID),
      ];
      await Promise.all(
        targetKeys.map(queryKey => queryClient.invalidateQueries({ queryKey }))
      );
      clearSearchStations(apolloClient.cache);
      clearSearchRoutines(apolloClient.cache);
      clearSearchRoutineTasks(apolloClient.cache);
      apolloClient.cache.gc();
      if (response.embedded?.publicId === "") return;
      await StationLocalSynchronizer.syncRestoreMyStationById(
        request,
        response
      );
    },
  });

  return mutation;
};

export const useRestoreMyStationsByIds = (
  options: { offlineFallback?: boolean } = {}
) => {
  const queryClient = getQueryClient();
  const apolloClient = useApolloClient();

  const perform = async (request: RestoreMyStationsByIdsRequest) => {
    try {
      if (isRemoteUnavailable()) {
        throw new NotegicFetchError(FetchClientExceptions.MissingNetwork());
      }
      return await mutationFnRestoreMyStationsByIds(request);
    } catch (error) {
      if (!NetworkExceptions.isMissingNetworkError(error)) throw error;
      await StationLocalSimulator.simulateRestoreMyStationsByIds(request);
      return {
        success: true as const,
        data: [],
        exception: null,
        embedded: { publicId: "" },
      } as Awaited<ReturnType<typeof mutationFnRestoreMyStationsByIds>>;
    }
  };

  const mutation = useMutation({
    retry: false,
    mutationFn: perform,
    onSuccess: async (response, request: RestoreMyStationsByIdsRequest) => {
      if (response.success === false) return;
      const targetKeys = [
        queryKeys.station.all(),
        ...request.body.stationIds.map(stationId =>
          queryKeys.station.oneById(stationId as UUID)
        ),
      ];
      await Promise.all(
        targetKeys.map(queryKey => queryClient.invalidateQueries({ queryKey }))
      );
      clearSearchStations(apolloClient.cache);
      clearSearchRoutines(apolloClient.cache);
      clearSearchRoutineTasks(apolloClient.cache);
      apolloClient.cache.gc();
      if (response.embedded?.publicId === "") return;
      await StationLocalSynchronizer.syncRestoreMyStationsByIds(
        request,
        response
      ).catch(error =>
        console.error("Failed to refresh confirmed Trash action", error)
      );
    },
  });

  return mutation;
};

export const useDeleteMyStationById = () => {
  const queryClient = getQueryClient();
  const apolloClient = useApolloClient();

  const perform = async (request: DeleteMyStationByIdRequest) => {
    try {
      if (isRemoteUnavailable()) {
        throw new NotegicFetchError(FetchClientExceptions.MissingNetwork());
      }
      return await mutationFnDeleteMyStationById(request);
    } catch (error) {
      if (!NetworkExceptions.isMissingNetworkError(error)) throw error;
      try {
        await StationLocalSimulator.simulateDeleteMyStationById(request);
      } catch (simulateError) {
        console.error(simulateError);
      }
      return {
        success: true as const,
        data: { deletedAt: new Date() },
        exception: null,
        embedded: { publicId: "" },
      };
    }
  };

  const mutation = useMutation({
    mutationFn: perform,
    onSuccess: async (response, request: DeleteMyStationByIdRequest) => {
      if (response.success === false) return;
      const targetKeys = [
        queryKeys.station.all(),
        queryKeys.station.oneById(request.body.stationId as UUID),
      ];
      await Promise.all(
        targetKeys.map(queryKey => queryClient.invalidateQueries({ queryKey }))
      );
      clearSearchStations(apolloClient.cache);
      clearSearchRoutines(apolloClient.cache);
      clearSearchRoutineTasks(apolloClient.cache);
      apolloClient.cache.gc();
      if (response.embedded.publicId === "") return;
      await StationLocalSynchronizer.syncDeleteMyStationById(request, response);
    },
  });

  return mutation;
};

export const useDeleteMyStationsByIds = () => {
  const queryClient = getQueryClient();
  const apolloClient = useApolloClient();

  const perform = async (request: DeleteMyStationsByIdsRequest) => {
    try {
      if (isRemoteUnavailable()) {
        throw new NotegicFetchError(FetchClientExceptions.MissingNetwork());
      }
      return await mutationFnDeleteMyStationsByIds(request);
    } catch (error) {
      if (!NetworkExceptions.isMissingNetworkError(error)) throw error;
      try {
        await StationLocalSimulator.simulateDeleteMyStationsByIds(request);
      } catch (simulateError) {
        console.error(simulateError);
      }
      return {
        success: true as const,
        data: { deletedAt: new Date() },
        exception: null,
        embedded: { publicId: "" },
      };
    }
  };

  const mutation = useMutation({
    mutationFn: perform,
    onSuccess: async (response, request: DeleteMyStationsByIdsRequest) => {
      if (response.success === false) return;
      const targetKeys = [
        queryKeys.station.all(),
        ...request.body.stationIds.map(stationId =>
          queryKeys.station.oneById(stationId as UUID)
        ),
      ];
      await Promise.all(
        targetKeys.map(queryKey => queryClient.invalidateQueries({ queryKey }))
      );
      clearSearchStations(apolloClient.cache);
      clearSearchRoutines(apolloClient.cache);
      clearSearchRoutineTasks(apolloClient.cache);
      apolloClient.cache.gc();
      if (response.embedded.publicId === "") return;
      await StationLocalSynchronizer.syncDeleteMyStationsByIds(
        request,
        response
      );
    },
  });

  return mutation;
};

export const useHardDeleteMyStationById = () => {
  const queryClient = getQueryClient();
  const apolloClient = useApolloClient();

  const perform = async (request: HardDeleteMyStationByIdRequest) => {
    try {
      if (isRemoteUnavailable()) {
        throw new NotegicFetchError(FetchClientExceptions.MissingNetwork());
      }
      return await mutationFnHardDeleteMyStationById(request);
    } catch (error) {
      if (!NetworkExceptions.isMissingNetworkError(error)) throw error;
      await StationLocalSimulator.simulateHardDeleteMyStationById(request);
      return {
        success: true as const,
        data: { deletedAt: new Date() },
        exception: null,
        embedded: { publicId: "" },
      } as Awaited<ReturnType<typeof mutationFnHardDeleteMyStationById>>;
    }
  };

  const mutation = useMutation({
    retry: false,
    mutationFn: perform,
    onSuccess: async (response, request: HardDeleteMyStationByIdRequest) => {
      if (response.success === false) return;
      const targetKeys = [
        queryKeys.station.all(),
        queryKeys.routine.all(),
        queryKeys.routineTask.all(),
        queryKeys.routineTaskDependency.all(),
        queryKeys.routineTag.all(),
        queryKeys.routineTaskRecord.all(),
        queryKeys.station.oneById(request.body.stationId as UUID),
      ];
      await Promise.all(
        targetKeys.map(queryKey => queryClient.invalidateQueries({ queryKey }))
      );
      clearSearchStations(apolloClient.cache);
      clearSearchRoutines(apolloClient.cache);
      clearSearchRoutineTasks(apolloClient.cache);
      apolloClient.cache.gc();
      if (response.embedded?.publicId === "") return;
      await StationLocalSynchronizer.syncHardDeleteMyStationById(
        request,
        response
      );
    },
  });

  return mutation;
};

export const useHardDeleteMyStationsByIds = (
  options: { offlineFallback?: boolean } = {}
) => {
  const queryClient = getQueryClient();
  const apolloClient = useApolloClient();

  const perform = async (request: HardDeleteMyStationsByIdsRequest) => {
    try {
      if (isRemoteUnavailable()) {
        throw new NotegicFetchError(FetchClientExceptions.MissingNetwork());
      }
      return await mutationFnHardDeleteMyStationsByIds(request);
    } catch (error) {
      if (!NetworkExceptions.isMissingNetworkError(error)) throw error;
      await StationLocalSimulator.simulateHardDeleteMyStationsByIds(request);
      return {
        success: true as const,
        data: { deletedAt: new Date() },
        exception: null,
        embedded: { publicId: "" },
      } as Awaited<ReturnType<typeof mutationFnHardDeleteMyStationsByIds>>;
    }
  };

  const mutation = useMutation({
    retry: false,
    mutationFn: perform,
    onSuccess: async (response, request: HardDeleteMyStationsByIdsRequest) => {
      if (response.success === false) return;
      const targetKeys = [
        queryKeys.station.all(),
        ...request.body.stationIds.map(stationId =>
          queryKeys.station.oneById(stationId as UUID)
        ),
      ];
      await Promise.all(
        targetKeys.map(queryKey => queryClient.invalidateQueries({ queryKey }))
      );
      clearSearchStations(apolloClient.cache);
      clearSearchRoutines(apolloClient.cache);
      clearSearchRoutineTasks(apolloClient.cache);
      apolloClient.cache.gc();
      if (response.embedded?.publicId === "") return;
      await StationLocalSynchronizer.syncHardDeleteMyStationsByIds(
        request,
        response
      ).catch(error =>
        console.error("Failed to refresh confirmed Trash action", error)
      );
    },
  });

  return mutation;
};

export const useTransferMyStationOwnership = () => {
  const queryClient = getQueryClient();
  return useMutation({
    mutationFn: (
      request: TransferMyStationOwnershipRequest
    ): Promise<TransferMyStationOwnershipResponse> =>
      mutationFnTransferMyStationOwnership(request),
    onSuccess: async (_response, request) => {
      await queryClient.invalidateQueries({
        queryKey: queryKeys.station.permission(request.param.stationId as UUID),
      });
      await queryClient.invalidateQueries({
        queryKey: queryKeys.station.oneById(request.param.stationId as UUID),
      });
    },
  });
};

export const useLeaveMyStation = () => {
  const queryClient = getQueryClient();
  return useMutation({
    mutationFn: (
      request: LeaveMyStationRequest
    ): Promise<LeaveMyStationResponse> => mutationFnLeaveMyStation(request),
    onSuccess: async (_response, request) => {
      await queryClient.invalidateQueries({
        queryKey: queryKeys.station.permission(request.param.stationId as UUID),
      });
      await queryClient.invalidateQueries({
        queryKey: queryKeys.station.oneById(request.param.stationId as UUID),
      });
    },
  });
};
