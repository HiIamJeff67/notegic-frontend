import type { UUID } from "node:crypto";
import { useApolloClient } from "@apollo/client/react";
import { NotegicAPIError } from "@shared/api/exceptions";
import { FetchClientExceptions } from "@shared/api/exceptions/client/fetch.exception";
import { ValidationClientException } from "@shared/api/exceptions/client/validation.exception";
import { NotegicFetchError } from "@shared/api/exceptions/errors/fetch.error";
import { NotegicValidationError } from "@shared/api/exceptions/errors/validation.error";
import { NetworkExceptions } from "@shared/api/exceptions/network.exception";
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
import { getQueryClient } from "@shared/api/queryClient";
import { UseQueryDefaultOptions } from "@shared/api/queryHookOptions";
import { queryKeys } from "@shared/api/queryKeys";
import {
  type UseQueryOptions,
  useMutation,
  useQuery,
} from "@tanstack/react-query";
import { isRemoteUnavailable } from "@/api/availability";
import {
  mutationFnCreateRoutineTag,
  mutationFnCreateRoutineTags,
  mutationFnHardDeleteMyRoutineTagById,
  mutationFnHardDeleteMyRoutineTagsByIds,
  mutationFnUpdateMyRoutineTagById,
  mutationFnUpdateMyRoutineTagsByIds,
  queryFnGetAllMyRoutineTags,
  queryFnGetMyRoutineTagById,
} from "@/api/invokers/routineTag.invoker";
import { RoutineTagLocalSimulator } from "@/api/local/simulators/routineTag.simulator";
import { RoutineTagLocalSynchronizer } from "@/api/local/synchronizers/routineTag.synchronizer";
import { clearSearchRoutines } from "@/api/policies/searchRoutines.policy";
import { clearSearchRoutineTags } from "@/api/policies/searchRoutineTags.policy";

export const useGetMyRoutineTagById = (
  hookRequest?: GetMyRoutineTagByIdRequest,
  options?: Partial<UseQueryOptions<GetMyRoutineTagByIdResponse, Error>>
) => {
  const queryClient = getQueryClient();

  const perform = async (
    request?: GetMyRoutineTagByIdRequest
  ): Promise<GetMyRoutineTagByIdResponse> => {
    if (!request) {
      throw new NotegicValidationError(
        ValidationClientException.ReceivedUndefinedRequest()
      );
    }

    try {
      if (isRemoteUnavailable()) {
        throw new NotegicFetchError(FetchClientExceptions.MissingNetwork());
      }

      const response = await queryFnGetMyRoutineTagById(request);
      await RoutineTagLocalSynchronizer.syncGetMyRoutineTagById(response);
      return response;
    } catch (error) {
      if (
        error instanceof NotegicAPIError ||
        error instanceof NotegicFetchError
      ) {
        const routineTag =
          await RoutineTagLocalSimulator.simulateGetMyRoutineTagById(request);
        return (
          NetworkExceptions.isMissingNetworkError(error)
            ? {
                success: true,
                data: routineTag,
                exception: null,
                embedded: { publicId: "" },
              }
            : {
                success: false,
                data: routineTag,
                exception: error.unWrap,
                embedded: { publicId: "" },
              }
        ) as GetMyRoutineTagByIdResponse;
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
      throw new NotegicValidationError(
        ValidationClientException.ReceivedUndefinedRequest()
      );
    }

    try {
      if (isRemoteUnavailable()) {
        throw new NotegicFetchError(FetchClientExceptions.MissingNetwork());
      }

      const response = await queryFnGetAllMyRoutineTags(request);
      await RoutineTagLocalSynchronizer.syncGetAllMyRoutineTags(response);
      return response;
    } catch (error) {
      if (
        error instanceof NotegicAPIError ||
        error instanceof NotegicFetchError
      ) {
        const routineTags =
          await RoutineTagLocalSimulator.simulateGetAllMyRoutineTags(request);
        return (
          NetworkExceptions.isMissingNetworkError(error)
            ? {
                success: true,
                data: routineTags,
                exception: null,
                embedded: { publicId: "" },
              }
            : {
                success: false,
                data: routineTags,
                exception: error.unWrap,
                embedded: { publicId: "" },
              }
        ) as GetAllMyRoutineTagsResponse;
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

export const useCreateRoutineTag = (
  options: { offlineFallback?: boolean } = {}
) => {
  const queryClient = getQueryClient();
  const apolloClient = useApolloClient();

  const perform = async (request: CreateRoutineTagRequest) => {
    try {
      if (isRemoteUnavailable()) {
        throw new NotegicFetchError(FetchClientExceptions.MissingNetwork());
      }
      return await mutationFnCreateRoutineTag(request);
    } catch (error) {
      if (
        options.offlineFallback === false ||
        !NetworkExceptions.isMissingNetworkError(error)
      )
        throw error;
      try {
        await RoutineTagLocalSimulator.simulateCreateRoutineTag(request);
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
    onSuccess: async (response, request: CreateRoutineTagRequest) => {
      if (response.success === false) return;
      const targetKeys = [
        queryKeys.routineTag.all(),
        queryKeys.routineTag.oneById(response.data.id as UUID),
      ];
      await Promise.all(
        targetKeys.map(queryKey => queryClient.invalidateQueries({ queryKey }))
      );
      clearSearchRoutineTags(apolloClient.cache);
      clearSearchRoutines(apolloClient.cache);
      apolloClient.cache.gc();
      if (response.embedded?.publicId === "") return;
      await RoutineTagLocalSynchronizer.syncCreateRoutineTag(request, response);
    },
  });

  return mutation;
};

export const useCreateRoutineTags = (
  options: { offlineFallback?: boolean } = {}
) => {
  const queryClient = getQueryClient();
  const apolloClient = useApolloClient();

  const perform = async (request: CreateRoutineTagsRequest) => {
    try {
      if (isRemoteUnavailable()) {
        throw new NotegicFetchError(FetchClientExceptions.MissingNetwork());
      }
      return await mutationFnCreateRoutineTags(request);
    } catch (error) {
      if (
        options.offlineFallback === false ||
        !NetworkExceptions.isMissingNetworkError(error)
      )
        throw error;
      await RoutineTagLocalSimulator.simulateCreateRoutineTags(request);
      return {
        success: true as const,
        data: {
          ids: request.body.createdRoutineTags.map(item => item.id as UUID),
          createdAt: new Date(),
        },
        exception: null,
        embedded: { publicId: "" },
      } as Awaited<ReturnType<typeof mutationFnCreateRoutineTags>>;
    }
  };

  const mutation = useMutation({
    mutationFn: perform,
    onSuccess: async (response, request: CreateRoutineTagsRequest) => {
      if (response.success === false) return;
      const targetKeys = [
        queryKeys.routineTag.all(),
        ...response.data.ids.map(id =>
          queryKeys.routineTag.oneById(id as UUID)
        ),
      ];
      await Promise.all(
        targetKeys.map(queryKey => queryClient.invalidateQueries({ queryKey }))
      );
      clearSearchRoutineTags(apolloClient.cache);
      clearSearchRoutines(apolloClient.cache);
      apolloClient.cache.gc();
      if (response.embedded?.publicId === "") return;
      await RoutineTagLocalSynchronizer.syncCreateRoutineTags(
        request,
        response
      );
    },
  });

  return mutation;
};

export const useUpdateMyRoutineTagById = (
  options: { offlineFallback?: boolean } = {}
) => {
  const queryClient = getQueryClient();
  const apolloClient = useApolloClient();

  const perform = async (request: UpdateMyRoutineTagByIdRequest) => {
    try {
      if (isRemoteUnavailable()) {
        throw new NotegicFetchError(FetchClientExceptions.MissingNetwork());
      }
      return await mutationFnUpdateMyRoutineTagById(request);
    } catch (error) {
      if (
        options.offlineFallback === false ||
        !NetworkExceptions.isMissingNetworkError(error)
      )
        throw error;
      await RoutineTagLocalSimulator.simulateUpdateMyRoutineTagById(request);
      return {
        success: true as const,
        data: { updatedAt: new Date() },
        exception: null,
        embedded: { publicId: "" },
      } as Awaited<ReturnType<typeof mutationFnUpdateMyRoutineTagById>>;
    }
  };

  const mutation = useMutation({
    mutationFn: perform,
    onSuccess: async (response, request: UpdateMyRoutineTagByIdRequest) => {
      if (response.success === false) return;
      const targetKeys = [
        queryKeys.routineTag.all(),
        queryKeys.routineTag.oneById(request.body.routineTagId as UUID),
      ];
      await Promise.all(
        targetKeys.map(queryKey => queryClient.invalidateQueries({ queryKey }))
      );
      clearSearchRoutineTags(apolloClient.cache);
      clearSearchRoutines(apolloClient.cache);
      apolloClient.cache.gc();
      if (response.embedded?.publicId === "") return;
      await RoutineTagLocalSynchronizer.syncUpdateMyRoutineTagById(
        request,
        response
      );
    },
  });

  return mutation;
};

export const useUpdateMyRoutineTagsByIds = (
  options: { offlineFallback?: boolean } = {}
) => {
  const queryClient = getQueryClient();
  const apolloClient = useApolloClient();

  const perform = async (request: UpdateMyRoutineTagsByIdsRequest) => {
    try {
      if (isRemoteUnavailable()) {
        throw new NotegicFetchError(FetchClientExceptions.MissingNetwork());
      }
      return await mutationFnUpdateMyRoutineTagsByIds(request);
    } catch (error) {
      if (
        options.offlineFallback === false ||
        !NetworkExceptions.isMissingNetworkError(error)
      )
        throw error;
      await RoutineTagLocalSimulator.simulateUpdateMyRoutineTagsByIds(request);
      return {
        success: true as const,
        data: { updatedAt: new Date() },
        exception: null,
        embedded: { publicId: "" },
      } as Awaited<ReturnType<typeof mutationFnUpdateMyRoutineTagsByIds>>;
    }
  };

  const mutation = useMutation({
    mutationFn: perform,
    onSuccess: async (response, request: UpdateMyRoutineTagsByIdsRequest) => {
      if (response.success === false) return;
      const targetKeys = [
        queryKeys.routineTag.all(),
        ...request.body.updatedRoutineTags.map(tag =>
          queryKeys.routineTag.oneById(tag.routineTagId as UUID)
        ),
      ];
      await Promise.all(
        targetKeys.map(queryKey => queryClient.invalidateQueries({ queryKey }))
      );
      clearSearchRoutineTags(apolloClient.cache);
      clearSearchRoutines(apolloClient.cache);
      apolloClient.cache.gc();
      if (response.embedded?.publicId === "") return;
      await RoutineTagLocalSynchronizer.syncUpdateMyRoutineTagsByIds(
        request,
        response
      );
    },
  });

  return mutation;
};

export const useHardDeleteMyRoutineTagById = (
  options: { offlineFallback?: boolean } = {}
) => {
  const queryClient = getQueryClient();
  const apolloClient = useApolloClient();

  const perform = async (request: HardDeleteMyRoutineTagByIdRequest) => {
    try {
      if (isRemoteUnavailable()) {
        throw new NotegicFetchError(FetchClientExceptions.MissingNetwork());
      }
      return await mutationFnHardDeleteMyRoutineTagById(request);
    } catch (error) {
      if (
        options.offlineFallback === false ||
        !NetworkExceptions.isMissingNetworkError(error)
      )
        throw error;
      await RoutineTagLocalSimulator.simulateHardDeleteMyRoutineTagById(
        request
      );
      return {
        success: true as const,
        data: { deletedAt: new Date() },
        exception: null,
        embedded: { publicId: "" },
      } as Awaited<ReturnType<typeof mutationFnHardDeleteMyRoutineTagById>>;
    }
  };

  const mutation = useMutation({
    mutationFn: perform,
    onSuccess: async (response, request: HardDeleteMyRoutineTagByIdRequest) => {
      if (response.success === false) return;
      const targetKeys = [
        queryKeys.routineTag.all(),
        queryKeys.routineTag.oneById(request.body.routineTagId as UUID),
      ];
      await Promise.all(
        targetKeys.map(queryKey => queryClient.invalidateQueries({ queryKey }))
      );
      clearSearchRoutineTags(apolloClient.cache);
      clearSearchRoutines(apolloClient.cache);
      apolloClient.cache.gc();
      if (response.embedded?.publicId === "") return;
      await RoutineTagLocalSynchronizer.syncHardDeleteMyRoutineTagById(
        request,
        response
      );
    },
  });

  return mutation;
};

export const useHardDeleteMyRoutineTagsByIds = (
  options: { offlineFallback?: boolean } = {}
) => {
  const queryClient = getQueryClient();
  const apolloClient = useApolloClient();

  const perform = async (request: HardDeleteMyRoutineTagsByIdsRequest) => {
    try {
      if (isRemoteUnavailable()) {
        throw new NotegicFetchError(FetchClientExceptions.MissingNetwork());
      }
      return await mutationFnHardDeleteMyRoutineTagsByIds(request);
    } catch (error) {
      if (
        options.offlineFallback === false ||
        !NetworkExceptions.isMissingNetworkError(error)
      )
        throw error;
      await RoutineTagLocalSimulator.simulateHardDeleteMyRoutineTagsByIds(
        request
      );
      return {
        success: true as const,
        data: { deletedAt: new Date() },
        exception: null,
        embedded: { publicId: "" },
      } as Awaited<ReturnType<typeof mutationFnHardDeleteMyRoutineTagsByIds>>;
    }
  };

  const mutation = useMutation({
    mutationFn: perform,
    onSuccess: async (
      response,
      request: HardDeleteMyRoutineTagsByIdsRequest
    ) => {
      if (response.success === false) return;
      const targetKeys = [
        queryKeys.routineTag.all(),
        ...request.body.routineTagIds.map(routineTagId =>
          queryKeys.routineTag.oneById(routineTagId as UUID)
        ),
      ];
      await Promise.all(
        targetKeys.map(queryKey => queryClient.invalidateQueries({ queryKey }))
      );
      clearSearchRoutineTags(apolloClient.cache);
      clearSearchRoutines(apolloClient.cache);
      apolloClient.cache.gc();
      if (response.embedded?.publicId === "") return;
      await RoutineTagLocalSynchronizer.syncHardDeleteMyRoutineTagsByIds(
        request,
        response
      );
    },
  });

  return mutation;
};
