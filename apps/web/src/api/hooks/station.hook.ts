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
  RestoreMyStationByIdRequest,
  RestoreMyStationsByIdsRequest,
  UpdateMyStationByIdRequest,
  UpdateMyStationsByIdsRequest,
  VisualizeMyTotalCountRequest,
  VisualizeMyTotalCountResponse,
  LeaveMyStationRequest,
  LeaveMyStationResponse,
  TransferMyStationOwnershipRequest,
  TransferMyStationOwnershipResponse,
} from "@shared/api/interfaces/station.interface";
import {
  mutationFnCreateStation,
  mutationFnCreateStations,
  mutationFnDeleteMyStationById,
  mutationFnDeleteMyStationsByIds,
  mutationFnHardDeleteMyStationById,
  mutationFnHardDeleteMyStationsByIds,
  mutationFnRestoreMyStationById,
  mutationFnRestoreMyStationsByIds,
  mutationFnUpdateMyStationById,
  mutationFnUpdateMyStationsByIds,
  mutationFnLeaveMyStation,
  mutationFnTransferMyStationOwnership,
  queryFnGetAllMyStations,
  queryFnGetMyStationById,
  queryFnVisualizeMyTotalCount,
} from "@/api/invokers/station.invoker";
import { StationLocalSimulator } from "@/api/local/simulators/station.simulator";
import { StationLocalSynchronizer } from "@/api/local/synchronizers/station.synchronizer";
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
      if (typeof navigator !== "undefined" && navigator.onLine === false) {
        throw new NotegicFetchError(FetchClientExceptions.MissingNetwork());
      }

      const response = await queryFnGetMyStationById(request);
      SessionStorageManipulator.ensureItem(
        SessionStorageKey.csrfToken,
        response.refreshableTokens?.newCSRFToken
      );
      await StationLocalSynchronizer.syncGetMyStationById(response);
      return response;
    } catch (error) {
      if (
        error instanceof NotegicAPIError ||
        error instanceof NotegicFetchError
      ) {
        const station =
          await StationLocalSimulator.simulateGetMyStationById(request);
        return {
          success: false,
          data: station,
          exception: error.unWrap,
          embedded: { publicId: "" },
        } as GetMyStationByIdResponse;
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
      if (typeof navigator !== "undefined" && navigator.onLine === false) {
        throw new NotegicFetchError(FetchClientExceptions.MissingNetwork());
      }

      const response = await queryFnGetAllMyStations(request);
      SessionStorageManipulator.ensureItem(
        SessionStorageKey.csrfToken,
        response.refreshableTokens?.newCSRFToken
      );
      await StationLocalSynchronizer.syncGetAllMyStations(response);
      return response;
    } catch (error) {
      if (
        error instanceof NotegicAPIError ||
        error instanceof NotegicFetchError
      ) {
        const stations =
          await StationLocalSimulator.simulateGetAllMyStations(request);
        return {
          success: false,
          data: stations,
          exception: error.unWrap,
          embedded: { publicId: "" },
        } as GetAllMyStationsResponse;
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
    if (typeof navigator !== "undefined" && navigator.onLine === false) {
      throw new NotegicFetchError(FetchClientExceptions.MissingNetwork());
    }
    return await mutationFnCreateStation(request);
  };

  const mutation = useMutation({
    mutationFn: perform,
    onSuccess: async (response, request: CreateStationRequest) => {
      if (response.success === false) return;
      SessionStorageManipulator.ensureItem(
        SessionStorageKey.csrfToken,
        response.refreshableTokens?.newCSRFToken
      );
      const targetKeys = [
        queryKeys.station.all(),
        queryKeys.station.oneById(response.data.id as UUID),
      ];
      await Promise.all(
        targetKeys.map(queryKey => queryClient.invalidateQueries({ queryKey }))
      );
      apolloClient.cache.evict({ fieldName: "searchStations" });
      apolloClient.cache.gc();
      await StationLocalSynchronizer.syncCreateStation(request, response);
    },
    onError: async (error, request) => {
      if (
        error instanceof NotegicFetchError &&
        error.unWrap.reason ===
          ExceptionReasonDictionary.client.fetch.missingNetwork
      ) {
        await StationLocalSimulator.simulateCreateStation(request);
      }
    },
  });

  return mutation;
};

export const useCreateStations = () => {
  const queryClient = getQueryClient();
  const apolloClient = useApolloClient();

  const perform = async (request: CreateStationsRequest) => {
    if (typeof navigator !== "undefined" && navigator.onLine === false) {
      throw new NotegicFetchError(FetchClientExceptions.MissingNetwork());
    }
    return await mutationFnCreateStations(request);
  };

  const mutation = useMutation({
    mutationFn: perform,
    onSuccess: async (response, request: CreateStationsRequest) => {
      if (response.success === false) return;
      SessionStorageManipulator.ensureItem(
        SessionStorageKey.csrfToken,
        response.refreshableTokens?.newCSRFToken
      );
      const targetKeys = [
        queryKeys.station.all(),
        ...response.data.ids.map(id => queryKeys.station.oneById(id as UUID)),
      ];
      await Promise.all(
        targetKeys.map(queryKey => queryClient.invalidateQueries({ queryKey }))
      );
      apolloClient.cache.evict({ fieldName: "searchStations" });
      apolloClient.cache.gc();
      await StationLocalSynchronizer.syncCreateStations(request, response);
    },
    onError: async (error, request) => {
      if (
        error instanceof NotegicFetchError &&
        error.unWrap.reason ===
          ExceptionReasonDictionary.client.fetch.missingNetwork
      ) {
        await StationLocalSimulator.simulateCreateStations(request);
      }
    },
  });

  return mutation;
};

export const useUpdateMyStationById = () => {
  const queryClient = getQueryClient();
  const apolloClient = useApolloClient();

  const perform = async (request: UpdateMyStationByIdRequest) => {
    if (typeof navigator !== "undefined" && navigator.onLine === false) {
      throw new NotegicFetchError(FetchClientExceptions.MissingNetwork());
    }
    return await mutationFnUpdateMyStationById(request);
  };

  const mutation = useMutation({
    mutationFn: perform,
    onSuccess: async (response, request: UpdateMyStationByIdRequest) => {
      if (response.success === false) return;
      SessionStorageManipulator.ensureItem(
        SessionStorageKey.csrfToken,
        response.refreshableTokens?.newCSRFToken
      );
      const targetKeys = [
        queryKeys.station.all(),
        queryKeys.station.oneById(request.body.stationId as UUID),
      ];
      await Promise.all(
        targetKeys.map(queryKey => queryClient.invalidateQueries({ queryKey }))
      );
      apolloClient.cache.evict({ fieldName: "searchStations" });
      apolloClient.cache.evict({ fieldName: "searchRoutines" });
      apolloClient.cache.evict({ fieldName: "searchRoutineTasks" });
      apolloClient.cache.gc();
      await StationLocalSynchronizer.syncUpdateMyStationById(request, response);
    },
    onError: async (error, request) => {
      if (
        error instanceof NotegicFetchError &&
        error.unWrap.reason ===
          ExceptionReasonDictionary.client.fetch.missingNetwork
      ) {
        await StationLocalSimulator.simulateUpdateMyStationById(request);
      }
    },
  });

  return mutation;
};

export const useUpdateMyStationsByIds = () => {
  const queryClient = getQueryClient();
  const apolloClient = useApolloClient();

  const perform = async (request: UpdateMyStationsByIdsRequest) => {
    if (typeof navigator !== "undefined" && navigator.onLine === false) {
      throw new NotegicFetchError(FetchClientExceptions.MissingNetwork());
    }
    return await mutationFnUpdateMyStationsByIds(request);
  };

  const mutation = useMutation({
    mutationFn: perform,
    onSuccess: async (response, request: UpdateMyStationsByIdsRequest) => {
      if (response.success === false) return;
      SessionStorageManipulator.ensureItem(
        SessionStorageKey.csrfToken,
        response.refreshableTokens?.newCSRFToken
      );
      const targetKeys = [
        queryKeys.station.all(),
        ...request.body.updatedStations.map(station =>
          queryKeys.station.oneById(station.stationId as UUID)
        ),
      ];
      await Promise.all(
        targetKeys.map(queryKey => queryClient.invalidateQueries({ queryKey }))
      );
      apolloClient.cache.evict({ fieldName: "searchStations" });
      apolloClient.cache.evict({ fieldName: "searchRoutines" });
      apolloClient.cache.evict({ fieldName: "searchRoutineTasks" });
      apolloClient.cache.gc();
      await StationLocalSynchronizer.syncUpdateMyStationsByIds(
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
        await StationLocalSimulator.simulateUpdateMyStationsByIds(request);
      }
    },
  });

  return mutation;
};

export const useRestoreMyStationById = () => {
  const queryClient = getQueryClient();
  const apolloClient = useApolloClient();

  const perform = async (request: RestoreMyStationByIdRequest) => {
    if (typeof navigator !== "undefined" && navigator.onLine === false) {
      throw new NotegicFetchError(FetchClientExceptions.MissingNetwork());
    }
    return await mutationFnRestoreMyStationById(request);
  };

  const mutation = useMutation({
    mutationFn: perform,
    onSuccess: async (response, request: RestoreMyStationByIdRequest) => {
      if (response.success === false) return;
      SessionStorageManipulator.ensureItem(
        SessionStorageKey.csrfToken,
        response.refreshableTokens?.newCSRFToken
      );
      const targetKeys = [
        queryKeys.station.all(),
        queryKeys.station.oneById(request.body.stationId as UUID),
      ];
      await Promise.all(
        targetKeys.map(queryKey => queryClient.invalidateQueries({ queryKey }))
      );
      apolloClient.cache.evict({ fieldName: "searchStations" });
      apolloClient.cache.evict({ fieldName: "searchRoutines" });
      apolloClient.cache.evict({ fieldName: "searchRoutineTasks" });
      apolloClient.cache.gc();
      await StationLocalSynchronizer.syncRestoreMyStationById(
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
        await StationLocalSimulator.simulateRestoreMyStationById(request);
      }
    },
  });

  return mutation;
};

export const useRestoreMyStationsByIds = () => {
  const queryClient = getQueryClient();
  const apolloClient = useApolloClient();

  const perform = async (request: RestoreMyStationsByIdsRequest) => {
    if (typeof navigator !== "undefined" && navigator.onLine === false) {
      throw new NotegicFetchError(FetchClientExceptions.MissingNetwork());
    }
    return await mutationFnRestoreMyStationsByIds(request);
  };

  const mutation = useMutation({
    mutationFn: perform,
    onSuccess: async (response, request: RestoreMyStationsByIdsRequest) => {
      if (response.success === false) return;
      SessionStorageManipulator.ensureItem(
        SessionStorageKey.csrfToken,
        response.refreshableTokens?.newCSRFToken
      );
      const targetKeys = [
        queryKeys.station.all(),
        ...request.body.stationIds.map(stationId =>
          queryKeys.station.oneById(stationId as UUID)
        ),
      ];
      await Promise.all(
        targetKeys.map(queryKey => queryClient.invalidateQueries({ queryKey }))
      );
      apolloClient.cache.evict({ fieldName: "searchStations" });
      apolloClient.cache.evict({ fieldName: "searchRoutines" });
      apolloClient.cache.evict({ fieldName: "searchRoutineTasks" });
      apolloClient.cache.gc();
      await StationLocalSynchronizer.syncRestoreMyStationsByIds(
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
        await StationLocalSimulator.simulateRestoreMyStationsByIds(request);
      }
    },
  });

  return mutation;
};

export const useDeleteMyStationById = () => {
  const queryClient = getQueryClient();
  const apolloClient = useApolloClient();

  const perform = async (request: DeleteMyStationByIdRequest) => {
    if (typeof navigator !== "undefined" && navigator.onLine === false) {
      throw new NotegicFetchError(FetchClientExceptions.MissingNetwork());
    }
    return await mutationFnDeleteMyStationById(request);
  };

  const mutation = useMutation({
    mutationFn: perform,
    onSuccess: async (response, request: DeleteMyStationByIdRequest) => {
      if (response.success === false) return;
      SessionStorageManipulator.ensureItem(
        SessionStorageKey.csrfToken,
        response.refreshableTokens?.newCSRFToken
      );
      const targetKeys = [
        queryKeys.station.all(),
        queryKeys.station.oneById(request.body.stationId as UUID),
      ];
      await Promise.all(
        targetKeys.map(queryKey => queryClient.invalidateQueries({ queryKey }))
      );
      apolloClient.cache.evict({ fieldName: "searchStations" });
      apolloClient.cache.evict({ fieldName: "searchRoutines" });
      apolloClient.cache.evict({ fieldName: "searchRoutineTasks" });
      apolloClient.cache.gc();
      await StationLocalSynchronizer.syncDeleteMyStationById(request, response);
    },
    onError: async (error, request) => {
      if (
        error instanceof NotegicFetchError &&
        error.unWrap.reason ===
          ExceptionReasonDictionary.client.fetch.missingNetwork
      ) {
        await StationLocalSimulator.simulateDeleteMyStationById(request);
      }
    },
  });

  return mutation;
};

export const useDeleteMyStationsByIds = () => {
  const queryClient = getQueryClient();
  const apolloClient = useApolloClient();

  const perform = async (request: DeleteMyStationsByIdsRequest) => {
    if (typeof navigator !== "undefined" && navigator.onLine === false) {
      throw new NotegicFetchError(FetchClientExceptions.MissingNetwork());
    }
    return await mutationFnDeleteMyStationsByIds(request);
  };

  const mutation = useMutation({
    mutationFn: perform,
    onSuccess: async (response, request: DeleteMyStationsByIdsRequest) => {
      if (response.success === false) return;
      SessionStorageManipulator.ensureItem(
        SessionStorageKey.csrfToken,
        response.refreshableTokens?.newCSRFToken
      );
      const targetKeys = [
        queryKeys.station.all(),
        ...request.body.stationIds.map(stationId =>
          queryKeys.station.oneById(stationId as UUID)
        ),
      ];
      await Promise.all(
        targetKeys.map(queryKey => queryClient.invalidateQueries({ queryKey }))
      );
      apolloClient.cache.evict({ fieldName: "searchStations" });
      apolloClient.cache.evict({ fieldName: "searchRoutines" });
      apolloClient.cache.evict({ fieldName: "searchRoutineTasks" });
      apolloClient.cache.gc();
      await StationLocalSynchronizer.syncDeleteMyStationsByIds(
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
        await StationLocalSimulator.simulateDeleteMyStationsByIds(request);
      }
    },
  });

  return mutation;
};

export const useHardDeleteMyStationById = () => {
  const queryClient = getQueryClient();
  const apolloClient = useApolloClient();

  const perform = async (request: HardDeleteMyStationByIdRequest) => {
    if (typeof navigator !== "undefined" && navigator.onLine === false) {
      throw new NotegicFetchError(FetchClientExceptions.MissingNetwork());
    }
    return await mutationFnHardDeleteMyStationById(request);
  };

  const mutation = useMutation({
    mutationFn: perform,
    onSuccess: async (response, request: HardDeleteMyStationByIdRequest) => {
      if (response.success === false) return;
      SessionStorageManipulator.ensureItem(
        SessionStorageKey.csrfToken,
        response.refreshableTokens?.newCSRFToken
      );
      const targetKeys = [
        queryKeys.station.all(),
        queryKeys.station.oneById(request.body.stationId as UUID),
      ];
      await Promise.all(
        targetKeys.map(queryKey => queryClient.invalidateQueries({ queryKey }))
      );
      apolloClient.cache.evict({ fieldName: "searchStations" });
      apolloClient.cache.evict({ fieldName: "searchRoutines" });
      apolloClient.cache.evict({ fieldName: "searchRoutineTasks" });
      apolloClient.cache.gc();
      await StationLocalSynchronizer.syncHardDeleteMyStationById(
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
        await StationLocalSimulator.simulateHardDeleteMyStationById(request);
      }
    },
  });

  return mutation;
};

export const useHardDeleteMyStationsByIds = () => {
  const queryClient = getQueryClient();
  const apolloClient = useApolloClient();

  const perform = async (request: HardDeleteMyStationsByIdsRequest) => {
    if (typeof navigator !== "undefined" && navigator.onLine === false) {
      throw new NotegicFetchError(FetchClientExceptions.MissingNetwork());
    }
    return await mutationFnHardDeleteMyStationsByIds(request);
  };

  const mutation = useMutation({
    mutationFn: perform,
    onSuccess: async (response, request: HardDeleteMyStationsByIdsRequest) => {
      if (response.success === false) return;
      SessionStorageManipulator.ensureItem(
        SessionStorageKey.csrfToken,
        response.refreshableTokens?.newCSRFToken
      );
      const targetKeys = [
        queryKeys.station.all(),
        ...request.body.stationIds.map(stationId =>
          queryKeys.station.oneById(stationId as UUID)
        ),
      ];
      await Promise.all(
        targetKeys.map(queryKey => queryClient.invalidateQueries({ queryKey }))
      );
      apolloClient.cache.evict({ fieldName: "searchStations" });
      apolloClient.cache.evict({ fieldName: "searchRoutines" });
      apolloClient.cache.evict({ fieldName: "searchRoutineTasks" });
      apolloClient.cache.gc();
      await StationLocalSynchronizer.syncHardDeleteMyStationsByIds(
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
        await StationLocalSimulator.simulateHardDeleteMyStationsByIds(request);
      }
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
