import type { UUID } from "node:crypto";
import { NotegicAPIError } from "@shared/api/exceptions";
import { FetchClientExceptions } from "@shared/api/exceptions/client/fetch.exception";
import { ValidationClientException } from "@shared/api/exceptions/client/validation.exception";
import { NotegicFetchError } from "@shared/api/exceptions/errors/fetch.error";
import { NotegicValidationError } from "@shared/api/exceptions/errors/validation.error";
import { NetworkExceptions } from "@shared/api/exceptions/network.exception";
import type {
  CreateSubShelfByRootShelfIdRequest,
  CreateSubShelfByRootShelfIdResponse,
  CreateSubShelvesByRootShelfIdsRequest,
  CreateSubShelvesByRootShelfIdsResponse,
  DeleteMySubShelfByIdRequest,
  DeleteMySubShelfByIdResponse,
  DeleteMySubShelvesByIdsRequest,
  DeleteMySubShelvesByIdsResponse,
  GetMySubShelfByIdRequest,
  GetMySubShelfByIdResponse,
  GetMySubShelvesAndItemsByPrevSubShelfIdRequest,
  GetMySubShelvesAndItemsByPrevSubShelfIdResponse,
  GetMySubShelvesByPrevSubShelfIdRequest,
  GetMySubShelvesByPrevSubShelfIdResponse,
  GetMySubShelvesByRootShelfIdRequest,
  GetMySubShelvesByRootShelfIdResponse,
  MoveMySubShelfRequest,
  MoveMySubShelfResponse,
  MoveMySubShelvesByRootShelfIdRequest,
  MoveMySubShelvesByRootShelfIdResponse,
  MoveMySubShelvesByRootShelfIdsRequest,
  MoveMySubShelvesByRootShelfIdsResponse,
  RestoreMySubShelfByIdRequest,
  RestoreMySubShelfByIdResponse,
  RestoreMySubShelvesByIdsRequest,
  RestoreMySubShelvesByIdsResponse,
  UpdateMySubShelfByIdRequest,
  UpdateMySubShelfByIdResponse,
  UpdateMySubShelvesByIdsRequest,
  UpdateMySubShelvesByIdsResponse,
} from "@shared/api/interfaces/subShelf.interface";
import {
  CreateSubShelfByRootShelfIdRequestSchema,
  CreateSubShelvesByRootShelfIdsRequestSchema,
  UpdateMySubShelfByIdRequestSchema,
  UpdateMySubShelvesByIdsRequestSchema,
} from "@shared/api/interfaces/subShelf.interface";
import { getQueryClient } from "@shared/api/queryClient";
import { UseQueryDefaultOptions } from "@shared/api/queryHookOptions";
import { queryKeys } from "@shared/api/queryKeys";
import { parseRequest } from "@shared/api/validation";
import {
  type QueryKey,
  type UseQueryOptions,
  useMutation,
  useQuery,
} from "@tanstack/react-query";
import { isRemoteUnavailable } from "@/api/availability";
import {
  mutationFnCreateSubShelfByRootShelfId,
  mutationFnCreateSubShelvesByRootShelfIds,
  mutationFnDeleteMySubShelfById,
  mutationFnDeleteMySubShelvesByIds,
  mutationFnHardDeleteMySubShelvesByIds,
  mutationFnMoveMySubShelf,
  mutationFnMoveMySubShelvesByRootShelfId,
  mutationFnMoveMySubShelvesByRootShelfIds,
  mutationFnRestoreMySubShelfById,
  mutationFnRestoreMySubShelvesByIds,
  mutationFnUpdateMySubShelfById,
  mutationFnUpdateMySubShelvesByIds,
  queryFnGetMySubShelfById,
  queryFnGetMySubShelvesAndItemsByPrevSubShelfId,
  queryFnGetMySubShelvesByPrevSubShelfId,
  queryFnGetMySubShelvesByRootShelfId,
} from "@/api/invokers/subShelf.invoker";
import { SubShelfLocalSimulator } from "@/api/local/simulators/subShelf.simulator";
import { SubShelfLocalSynchronizer } from "@/api/local/synchronizers/subShelf.synchronizer";

export const useGetMySubShelfById = (
  hookRequest?: GetMySubShelfByIdRequest,
  options?: Partial<UseQueryOptions<GetMySubShelfByIdResponse, Error>>
) => {
  const queryClient = getQueryClient();

  const perform = async (
    request?: GetMySubShelfByIdRequest
  ): Promise<GetMySubShelfByIdResponse> => {
    if (!request) {
      throw new NotegicValidationError(
        ValidationClientException.ReceivedUndefinedRequest()
      );
    }

    try {
      if (isRemoteUnavailable()) {
        throw new NotegicFetchError(FetchClientExceptions.MissingNetwork());
      }

      const response = await queryFnGetMySubShelfById(request);
      await SubShelfLocalSynchronizer.syncGetMySubShelfById(response);
      return response;
    } catch (error) {
      if (
        error instanceof NotegicAPIError ||
        error instanceof NotegicFetchError
      ) {
        const existingSubShelf =
          await SubShelfLocalSimulator.simulateGetMySubShelfById(request);
        return (
          NetworkExceptions.isMissingNetworkError(error)
            ? {
                success: true,
                data: existingSubShelf,
                exception: null,
                embedded: { publicId: "" },
              }
            : {
                success: false,
                data: existingSubShelf,
                exception: error.unWrap,
                embedded: { publicId: "" },
              }
        ) as GetMySubShelfByIdResponse;
      }

      throw error;
    }
  };

  const query = useQuery<GetMySubShelfByIdResponse, Error>({
    queryKey: queryKeys.subShelf.oneById(
      hookRequest?.param.subShelfId as UUID | undefined,
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
    callbackRequest: GetMySubShelfByIdRequest
  ): Promise<GetMySubShelfByIdResponse> => {
    return queryClient.fetchQuery({
      queryKey: queryKeys.subShelf.oneById(
        callbackRequest.param.subShelfId as UUID | undefined,
        callbackRequest.param.isDeleted ?? false
      ),
      queryFn: async () => perform(callbackRequest),
      staleTime: UseQueryDefaultOptions.staleTime,
      ...options,
    });
  };

  return { ...query, fetch };
};

export const useGetMySubShelvesByPrevSubShelfId = (
  hookRequest?: GetMySubShelvesByPrevSubShelfIdRequest,
  options?: Partial<
    UseQueryOptions<GetMySubShelvesByPrevSubShelfIdResponse, Error>
  >
) => {
  const queryClient = getQueryClient();

  const perform = async (
    request?: GetMySubShelvesByPrevSubShelfIdRequest
  ): Promise<GetMySubShelvesByPrevSubShelfIdResponse> => {
    if (!request) {
      throw new NotegicValidationError(
        ValidationClientException.ReceivedUndefinedRequest()
      );
    }

    try {
      if (isRemoteUnavailable()) {
        throw new NotegicFetchError(FetchClientExceptions.MissingNetwork());
      }

      const response = await queryFnGetMySubShelvesByPrevSubShelfId(request);
      await SubShelfLocalSynchronizer.syncGetMySubShelvesByPrevSubShelfId(
        response
      );
      return response;
    } catch (error) {
      if (
        error instanceof NotegicAPIError ||
        error instanceof NotegicFetchError
      ) {
        const existingSubShelves =
          await SubShelfLocalSimulator.simulateGetMySubShelvesByPrevSubShelfId(
            request
          );
        return (
          NetworkExceptions.isMissingNetworkError(error)
            ? {
                success: true,
                data: existingSubShelves,
                exception: null,
                embedded: { publicId: "" },
              }
            : {
                success: false,
                data: existingSubShelves,
                exception: error.unWrap,
                embedded: { publicId: "" },
              }
        ) as GetMySubShelvesByPrevSubShelfIdResponse;
      }

      throw error;
    }
  };

  const query = useQuery<GetMySubShelvesByPrevSubShelfIdResponse, Error>({
    queryKey: queryKeys.subShelf.manyByPrevSubShelfId(
      hookRequest?.param.prevSubShelfId as UUID | undefined,
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
    callbackRequest: GetMySubShelvesByPrevSubShelfIdRequest
  ): Promise<GetMySubShelvesByPrevSubShelfIdResponse> => {
    return queryClient.fetchQuery({
      queryKey: queryKeys.subShelf.manyByPrevSubShelfId(
        callbackRequest.param.prevSubShelfId as UUID | undefined,
        callbackRequest.param.areDeleted ?? false
      ),
      queryFn: async () => perform(callbackRequest),
      staleTime: UseQueryDefaultOptions.staleTime,
      ...options,
    });
  };

  return { ...query, fetch };
};

export const useGetMySubShelvesByRootShelfId = (
  hookRequest?: GetMySubShelvesByRootShelfIdRequest,
  options?: Partial<
    UseQueryOptions<GetMySubShelvesByRootShelfIdResponse, Error>
  >
) => {
  const queryClient = getQueryClient();

  const perform = async (
    request?: GetMySubShelvesByRootShelfIdRequest
  ): Promise<GetMySubShelvesByRootShelfIdResponse> => {
    if (!request) {
      throw new NotegicValidationError(
        ValidationClientException.ReceivedUndefinedRequest()
      );
    }

    try {
      if (isRemoteUnavailable()) {
        throw new NotegicFetchError(FetchClientExceptions.MissingNetwork());
      }

      const response = await queryFnGetMySubShelvesByRootShelfId(request);
      await SubShelfLocalSynchronizer.syncGetMySubShelvesByRootShelfId(
        response
      );
      return response;
    } catch (error) {
      if (
        error instanceof NotegicAPIError ||
        error instanceof NotegicFetchError
      ) {
        const existingSubShelves =
          await SubShelfLocalSimulator.simulateGetMySubShelvesByRootShelfId(
            request
          );
        return (
          NetworkExceptions.isMissingNetworkError(error)
            ? {
                success: true,
                data: existingSubShelves,
                exception: null,
                embedded: { publicId: "" },
              }
            : {
                success: false,
                data: existingSubShelves,
                exception: error.unWrap,
                embedded: { publicId: "" },
              }
        ) as GetMySubShelvesByRootShelfIdResponse;
      }

      throw error;
    }
  };

  const query = useQuery<GetMySubShelvesByRootShelfIdResponse, Error>({
    queryKey: queryKeys.subShelf.manyByRootShelfId(
      hookRequest?.param.rootShelfId as UUID | undefined,
      hookRequest?.param.areDeleted ?? false
    ),
    queryFn: async () => perform(hookRequest),
    staleTime: options?.staleTime ?? UseQueryDefaultOptions.staleTime,
    refetchOnWindowFocus: UseQueryDefaultOptions.refetchOnWindowFocus,
    refetchOnMount: UseQueryDefaultOptions.refetchOnMount,
    ...options,
    enabled: hookRequest ? (options?.enabled ?? true) : false,
  });

  const fetch = async (
    callbackRequest: GetMySubShelvesByRootShelfIdRequest
  ): Promise<GetMySubShelvesByRootShelfIdResponse> => {
    return queryClient.fetchQuery({
      queryKey: queryKeys.subShelf.manyByRootShelfId(
        callbackRequest.param.rootShelfId as UUID | undefined,
        callbackRequest.param.areDeleted ?? false
      ),
      queryFn: async () => perform(callbackRequest),
      staleTime: UseQueryDefaultOptions.staleTime,
      ...options,
    });
  };

  return { ...query, fetch };
};

export const useGetMySubShelvesAndItemsByPrevSubShelfId = (
  hookRequest?: GetMySubShelvesAndItemsByPrevSubShelfIdRequest,
  options?: Partial<
    UseQueryOptions<GetMySubShelvesAndItemsByPrevSubShelfIdResponse, Error>
  >
) => {
  const queryClient = getQueryClient();

  const perform = async (
    request?: GetMySubShelvesAndItemsByPrevSubShelfIdRequest
  ): Promise<GetMySubShelvesAndItemsByPrevSubShelfIdResponse> => {
    if (!request) {
      throw new NotegicValidationError(
        ValidationClientException.ReceivedUndefinedRequest()
      );
    }

    try {
      if (isRemoteUnavailable()) {
        throw new NotegicFetchError(FetchClientExceptions.MissingNetwork());
      }

      const response =
        await queryFnGetMySubShelvesAndItemsByPrevSubShelfId(request);
      await SubShelfLocalSynchronizer.syncGetMySubShelvesAndItemsByPrevSubShelfId(
        response
      );
      return response;
    } catch (error) {
      if (
        error instanceof NotegicAPIError ||
        error instanceof NotegicFetchError
      ) {
        const existing =
          await SubShelfLocalSimulator.simulateGetMySubShelvesAndItemsByPrevSubShelfId(
            request
          );
        return (
          NetworkExceptions.isMissingNetworkError(error)
            ? {
                success: true,
                data: existing,
                exception: null,
                embedded: { publicId: "" },
              }
            : {
                success: false,
                data: existing,
                exception: error.unWrap,
                embedded: { publicId: "" },
              }
        ) as GetMySubShelvesAndItemsByPrevSubShelfIdResponse;
      }

      throw error;
    }
  };

  const query = useQuery<
    GetMySubShelvesAndItemsByPrevSubShelfIdResponse,
    Error
  >({
    queryKey: queryKeys.subShelf.manyByPrevSubShelfId(
      hookRequest?.param.prevSubShelfId as UUID | undefined,
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
    callbackRequest: GetMySubShelvesAndItemsByPrevSubShelfIdRequest
  ): Promise<GetMySubShelvesAndItemsByPrevSubShelfIdResponse> => {
    return queryClient.fetchQuery({
      queryKey: queryKeys.subShelf.manyByPrevSubShelfId(
        callbackRequest.param.prevSubShelfId as UUID | undefined,
        callbackRequest.param.areDeleted ?? false
      ),
      queryFn: async () => perform(callbackRequest),
      staleTime: UseQueryDefaultOptions.staleTime,
      ...options,
    });
  };

  return { ...query, fetch };
};

export const useCreateSubShelfByRootShelfId = () => {
  const queryClient = getQueryClient();

  const perform = async (
    request: CreateSubShelfByRootShelfIdRequest
  ): Promise<CreateSubShelfByRootShelfIdResponse> => {
    try {
      parseRequest(CreateSubShelfByRootShelfIdRequestSchema, request);
      if (isRemoteUnavailable()) {
        throw new NotegicFetchError(FetchClientExceptions.MissingNetwork());
      }
      return await mutationFnCreateSubShelfByRootShelfId(request);
    } catch (error) {
      if (!NetworkExceptions.isMissingNetworkError(error)) throw error;
      try {
        await SubShelfLocalSimulator.simulateCreateSubShelfByRootShelfId(
          request
        );
      } catch (simulateError) {
        console.error(simulateError);
      }
      return {
        success: true,
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
    onSuccess: async (response, request) => {
      if (response.success === false) return;
      const prevSubShelfId = request.affected.prevSubShelfId as UUID;
      const rootShelfId = request.affected.rootShelfId as UUID;
      const targetKeys: QueryKey[] = [
        queryKeys.rootShelf.oneById(rootShelfId),
        queryKeys.subShelf.manyByPrevSubShelfId(prevSubShelfId),
        queryKeys.subShelf.manyByRootShelfId(rootShelfId),
      ];
      Promise.all(
        targetKeys.map(targetKey =>
          queryClient.invalidateQueries({ queryKey: targetKey })
        )
      );
      if (response.embedded.publicId === "") return;
      await SubShelfLocalSynchronizer.syncCreateSubShelfByRootShelfId(
        request,
        response
      );
    },
  });

  return mutation;
};

export const useCreateSubShelvesByRootShelfIds = () => {
  const queryClient = getQueryClient();

  const perform = async (
    request: CreateSubShelvesByRootShelfIdsRequest
  ): Promise<CreateSubShelvesByRootShelfIdsResponse> => {
    try {
      parseRequest(CreateSubShelvesByRootShelfIdsRequestSchema, request);
      if (isRemoteUnavailable()) {
        throw new NotegicFetchError(FetchClientExceptions.MissingNetwork());
      }
      return await mutationFnCreateSubShelvesByRootShelfIds(request);
    } catch (error) {
      if (!NetworkExceptions.isMissingNetworkError(error)) throw error;
      await SubShelfLocalSimulator.simulateCreateSubShelvesByRootShelfIds(
        request
      );
      return {
        success: true as const,
        data: {
          ids: request.body.createdSubShelves.map(item => item.id as UUID),
          createdAt: new Date(),
        },
        exception: null,
        embedded: { publicId: "" },
      } as Awaited<ReturnType<typeof mutationFnCreateSubShelvesByRootShelfIds>>;
    }
  };

  const mutation = useMutation({
    mutationFn: perform,
    onSuccess: async (response, request) => {
      if (response.success === false) return;
      const prevSubShelfIds = request.affected
        .prevSubShelfIds as (UUID | null)[];
      const rootShelfIds = request.affected.rootShelfIds as UUID[];
      const targetKeys: QueryKey[] = [
        ...rootShelfIds.flatMap(rootShelfId => [
          queryKeys.rootShelf.oneById(rootShelfId),
          queryKeys.subShelf.manyByRootShelfId(rootShelfId),
        ]),
        ...prevSubShelfIds.map(prevSubShelfId =>
          queryKeys.subShelf.manyByPrevSubShelfId(prevSubShelfId)
        ),
      ];
      Promise.all(
        targetKeys.map(targetKey =>
          queryClient.invalidateQueries({ queryKey: targetKey })
        )
      );
      if (response.embedded?.publicId === "") return;
      await SubShelfLocalSynchronizer.syncCreateSubShelvesByRootShelfIds(
        request,
        response
      );
    },
  });

  return mutation;
};

export const useUpdateMySubShelfById = () => {
  const queryClient = getQueryClient();

  const perform = async (
    request: UpdateMySubShelfByIdRequest
  ): Promise<UpdateMySubShelfByIdResponse> => {
    try {
      parseRequest(UpdateMySubShelfByIdRequestSchema, request);
      if (isRemoteUnavailable()) {
        throw new NotegicFetchError(FetchClientExceptions.MissingNetwork());
      }
      return await mutationFnUpdateMySubShelfById(request);
    } catch (error) {
      if (!NetworkExceptions.isMissingNetworkError(error)) throw error;
      await SubShelfLocalSimulator.simulateUpdateMySubShelfById(request);
      return {
        success: true as const,
        data: { updatedAt: new Date() },
        exception: null,
        embedded: { publicId: "" },
      } as Awaited<ReturnType<typeof mutationFnUpdateMySubShelfById>>;
    }
  };

  const mutation = useMutation({
    mutationFn: perform,
    onSuccess: async (response, request) => {
      if (response.success === false) return;
      const prevSubShelfId = request.affected.prevSubShelfId as UUID;
      const rootShelfId = request.affected.rootShelfId as UUID;
      const targetKeys: QueryKey[] = [
        queryKeys.rootShelf.oneById(rootShelfId),
        queryKeys.subShelf.manyByPrevSubShelfId(prevSubShelfId),
        queryKeys.subShelf.manyByRootShelfId(rootShelfId),
      ];
      Promise.all(
        targetKeys.map(targetKey =>
          queryClient.invalidateQueries({ queryKey: targetKey })
        )
      );
      if (response.embedded?.publicId === "") return;
      await SubShelfLocalSynchronizer.syncUpdateMySubShelfById(
        request,
        response
      );
    },
  });

  return mutation;
};
export const useUpdateMySubShelvesByIds = () => {
  const queryClient = getQueryClient();

  const perform = async (
    request: UpdateMySubShelvesByIdsRequest
  ): Promise<UpdateMySubShelvesByIdsResponse> => {
    try {
      parseRequest(UpdateMySubShelvesByIdsRequestSchema, request);
      if (isRemoteUnavailable()) {
        throw new NotegicFetchError(FetchClientExceptions.MissingNetwork());
      }
      return await mutationFnUpdateMySubShelvesByIds(request);
    } catch (error) {
      if (!NetworkExceptions.isMissingNetworkError(error)) throw error;
      await SubShelfLocalSimulator.simulateUpdateMySubShelvesByIds(request);
      return {
        success: true as const,
        data: { updatedAt: new Date() },
        exception: null,
        embedded: { publicId: "" },
      } as Awaited<ReturnType<typeof mutationFnUpdateMySubShelvesByIds>>;
    }
  };

  const mutation = useMutation({
    mutationFn: perform,
    onSuccess: async (response, request) => {
      if (response.success === false) return;
      const prevSubShelfIds = request.affected
        .prevSubShelfIds as (UUID | null)[];
      const rootShelfIds = request.affected.rootShelfIds as UUID[];
      const targetKeys: QueryKey[] = [
        ...rootShelfIds.flatMap(rootShelfId => [
          queryKeys.rootShelf.oneById(rootShelfId),
          queryKeys.subShelf.manyByRootShelfId(rootShelfId),
        ]),
        ...prevSubShelfIds.map(prevSubShelfId =>
          queryKeys.subShelf.manyByPrevSubShelfId(prevSubShelfId)
        ),
      ];
      Promise.all(
        targetKeys.map(targetKey =>
          queryClient.invalidateQueries({ queryKey: targetKey })
        )
      );
      if (response.embedded?.publicId === "") return;
      await SubShelfLocalSynchronizer.syncUpdateMySubShelvesByIds(
        request,
        response
      );
    },
  });

  return mutation;
};

export const useMoveMySubShelf = () => {
  const queryClient = getQueryClient();
  const perform = async (
    request: MoveMySubShelfRequest
  ): Promise<MoveMySubShelfResponse> => {
    try {
      if (isRemoteUnavailable()) {
        throw new NotegicFetchError(FetchClientExceptions.MissingNetwork());
      }
      return await mutationFnMoveMySubShelf(request);
    } catch (error) {
      if (!NetworkExceptions.isMissingNetworkError(error)) throw error;
      await SubShelfLocalSimulator.simulateMoveMySubShelf(request);
      return {
        success: true as const,
        data: { updatedAt: new Date() },
        exception: null,
        embedded: { publicId: "" },
      } as Awaited<ReturnType<typeof mutationFnMoveMySubShelf>>;
    }
  };

  const mutation = useMutation({
    mutationFn: perform,
    onSuccess: async (response, request) => {
      if (response.success === false) return;
      const sourceSubShelfId = request.body.sourceSubShelfId as UUID;
      const destinationSubShelfId = request.body
        .destinationSubShelfId as UUID | null;
      const rootShelfId = request.affected.rootShelfId as UUID;
      const childSubShelfIds = (request.affected.childSubShelfIds || []).filter(
        Boolean
      ) as UUID[];
      const targetKeys: QueryKey[] = [
        queryKeys.rootShelf.oneById(rootShelfId),
        ...childSubShelfIds.map(childSubShelfId =>
          queryKeys.subShelf.oneById(childSubShelfId)
        ),
        queryKeys.subShelf.oneById(sourceSubShelfId),
        queryKeys.subShelf.manyByPrevSubShelfId(destinationSubShelfId),
        queryKeys.subShelf.manyByRootShelfId(rootShelfId),
      ];
      Promise.all(
        targetKeys.map(targetKey =>
          queryClient.invalidateQueries({ queryKey: targetKey })
        )
      );
      if (response.embedded?.publicId === "") return;
      await SubShelfLocalSynchronizer.syncMoveMySubShelf(request, response);
    },
  });

  return mutation;
};

export const useMoveMySubShelvesByRootShelfId = () => {
  const queryClient = getQueryClient();

  const perform = async (
    request: MoveMySubShelvesByRootShelfIdRequest
  ): Promise<MoveMySubShelvesByRootShelfIdResponse> => {
    try {
      if (isRemoteUnavailable()) {
        throw new NotegicFetchError(FetchClientExceptions.MissingNetwork());
      }
      return await mutationFnMoveMySubShelvesByRootShelfId(request);
    } catch (error) {
      if (!NetworkExceptions.isMissingNetworkError(error)) throw error;
      await SubShelfLocalSimulator.simulateMoveMySubShelvesByRootShelfId(
        request
      );
      return {
        success: true as const,
        data: { updatedAt: new Date() },
        exception: null,
        embedded: { publicId: "" },
      } as Awaited<ReturnType<typeof mutationFnMoveMySubShelvesByRootShelfId>>;
    }
  };

  const mutation = useMutation({
    mutationFn: perform,
    onSuccess: async (response, request) => {
      if (response.success === false) return;
      const sourceSubShelfIds = (request.body.sourceSubShelfIds || []).filter(
        Boolean
      ) as UUID[];
      const destinationSubShelfId = request.body.destinationSubShelfId as UUID;
      const rootShelfIds = (request.affected.rootShelfIds || []).filter(
        Boolean
      ) as UUID[];
      const childSubShelfIds = (request.affected.childSubShelfIds || []).filter(
        Boolean
      ) as UUID[];
      const targetKeys: QueryKey[] = [
        ...rootShelfIds.flatMap(rootShelfId => [
          queryKeys.rootShelf.oneById(rootShelfId),
          queryKeys.subShelf.manyByRootShelfId(rootShelfId),
        ]),
        ...sourceSubShelfIds.map(sourceSubShelfId =>
          queryKeys.subShelf.oneById(sourceSubShelfId)
        ),
        queryKeys.subShelf.manyByPrevSubShelfId(destinationSubShelfId),
        ...childSubShelfIds.map(childSubShelfId =>
          queryKeys.subShelf.oneById(childSubShelfId)
        ),
      ];
      Promise.all(
        targetKeys.map(targetKey =>
          queryClient.invalidateQueries({ queryKey: targetKey })
        )
      );
      if (response.embedded?.publicId === "") return;
      await SubShelfLocalSynchronizer.syncMoveMySubShelvesByRootShelfId(
        request,
        response
      );
    },
  });

  return mutation;
};

export const useMoveMySubShelvesByRootShelfIds = () => {
  const queryClient = getQueryClient();

  const perform = async (
    request: MoveMySubShelvesByRootShelfIdsRequest
  ): Promise<MoveMySubShelvesByRootShelfIdsResponse> => {
    try {
      if (isRemoteUnavailable()) {
        throw new NotegicFetchError(FetchClientExceptions.MissingNetwork());
      }
      return await mutationFnMoveMySubShelvesByRootShelfIds(request);
    } catch (error) {
      if (!NetworkExceptions.isMissingNetworkError(error)) throw error;
      await SubShelfLocalSimulator.simulateMoveMySubShelvesByRootShelfIds(
        request
      );
      return {
        success: true as const,
        data: { updatedAt: new Date() },
        exception: null,
        embedded: { publicId: "" },
      } as Awaited<ReturnType<typeof mutationFnMoveMySubShelvesByRootShelfIds>>;
    }
  };

  const mutation = useMutation({
    mutationFn: perform,
    onSuccess: async (response, request) => {
      if (response.success === false) return;
      const sourceSubShelfIds = [] as UUID[];
      const destinationSubShelfIds = [] as UUID[];
      for (const movedSubShelf of request.body.moveSubShelves) {
        sourceSubShelfIds.push(...(movedSubShelf.sourceSubShelfIds as UUID[]));
        destinationSubShelfIds.push(
          movedSubShelf.destinationSubShelfId as UUID
        );
      }
      const rootShelfIds = (request.affected.rootShelfIds || []).filter(
        Boolean
      ) as UUID[];
      const childSubShelfIds = (request.affected.childSubShelfIds || []).filter(
        Boolean
      ) as UUID[];
      const targetKeys: QueryKey[] = [
        ...rootShelfIds.flatMap(rootShelfId => [
          queryKeys.rootShelf.oneById(rootShelfId),
          queryKeys.subShelf.manyByRootShelfId(rootShelfId),
        ]),
        ...sourceSubShelfIds.map(sourceSubShelfId =>
          queryKeys.subShelf.oneById(sourceSubShelfId)
        ),
        ...destinationSubShelfIds.map(destinationSubShelfId =>
          queryKeys.subShelf.manyByPrevSubShelfId(destinationSubShelfId)
        ),
        ...childSubShelfIds.map(childSubShelfId =>
          queryKeys.subShelf.oneById(childSubShelfId)
        ),
      ];
      Promise.all(
        targetKeys.map(targetKey =>
          queryClient.invalidateQueries({ queryKey: targetKey })
        )
      );
      if (response.embedded?.publicId === "") return;
      await SubShelfLocalSynchronizer.syncMoveMySubShelvesByRootShelfIds(
        request,
        response
      );
    },
  });

  return mutation;
};

export const useRestoreMySubShelfById = () => {
  const queryClient = getQueryClient();

  const perform = async (
    request: RestoreMySubShelfByIdRequest
  ): Promise<RestoreMySubShelfByIdResponse> => {
    try {
      if (isRemoteUnavailable()) {
        throw new NotegicFetchError(FetchClientExceptions.MissingNetwork());
      }
      return await mutationFnRestoreMySubShelfById(request);
    } catch (error) {
      if (!NetworkExceptions.isMissingNetworkError(error)) throw error;
      await SubShelfLocalSimulator.simulateRestoreMySubShelfById(request);
      return {
        success: true as const,
        data: { updatedAt: new Date() },
        exception: null,
        embedded: { publicId: "" },
      } as Awaited<ReturnType<typeof mutationFnRestoreMySubShelfById>>;
    }
  };

  const mutation = useMutation({
    retry: false,
    mutationFn: perform,
    onSuccess: async (response, request) => {
      if (response.success === false) return;
      const subShelfId = request.body.subShelfId as UUID;
      const prevSubShelfId = request.affected.prevSubShelfId as UUID;
      const rootShelfId = request.affected.rootShelfId as UUID;
      const targetKeys: QueryKey[] = [
        queryKeys.rootShelf.oneById(rootShelfId),
        queryKeys.subShelf.oneById(subShelfId),
        queryKeys.subShelf.manyByPrevSubShelfId(prevSubShelfId),
        queryKeys.subShelf.manyByRootShelfId(rootShelfId),
        queryKeys.material.manyByParentSubShelfId(subShelfId),
      ];
      Promise.all(
        targetKeys.map(targetKey =>
          queryClient.invalidateQueries({ queryKey: targetKey })
        )
      );
      if (response.embedded?.publicId === "") return;
      await SubShelfLocalSynchronizer.syncRestoreMySubShelfById(
        request,
        response
      );
    },
  });

  return mutation;
};
export const useRestoreMySubShelvesByIds = (
  options: { offlineFallback?: boolean } = {}
) => {
  const queryClient = getQueryClient();

  const perform = async (
    request: RestoreMySubShelvesByIdsRequest
  ): Promise<RestoreMySubShelvesByIdsResponse> => {
    try {
      if (isRemoteUnavailable()) {
        throw new NotegicFetchError(FetchClientExceptions.MissingNetwork());
      }
      return await mutationFnRestoreMySubShelvesByIds(request);
    } catch (error) {
      if (!NetworkExceptions.isMissingNetworkError(error)) throw error;
      await SubShelfLocalSimulator.simulateRestoreMySubShelvesByIds(request);
      return {
        success: true as const,
        data: [],
        exception: null,
        embedded: { publicId: "" },
      } as Awaited<ReturnType<typeof mutationFnRestoreMySubShelvesByIds>>;
    }
  };

  const mutation = useMutation({
    retry: false,
    mutationFn: perform,
    onSuccess: async (response, request) => {
      if (response.success === false) return;
      const subShelfIds = (request.body.subShelfIds || []).filter(
        Boolean
      ) as UUID[];
      const rootShelfIds = (request.affected.rootShelfIds || []).filter(
        Boolean
      ) as UUID[];
      const prevSubShelfIds = (request.affected.prevSubShelfIds || []).filter(
        Boolean
      ) as UUID[];
      const targetKeys: QueryKey[] = [
        ...rootShelfIds.flatMap(rootShelfId => [
          queryKeys.rootShelf.oneById(rootShelfId),
          queryKeys.subShelf.manyByRootShelfId(rootShelfId),
        ]),
        ...subShelfIds.flatMap(subShelfId => [
          queryKeys.subShelf.oneById(subShelfId),
          queryKeys.material.manyByParentSubShelfId(subShelfId),
        ]),
        ...prevSubShelfIds.map(prevSubShelfId =>
          queryKeys.subShelf.manyByPrevSubShelfId(prevSubShelfId)
        ),
      ];
      Promise.all(
        targetKeys.map(targetKey =>
          queryClient.invalidateQueries({ queryKey: targetKey })
        )
      );
      if (response.embedded?.publicId === "") return;
      await SubShelfLocalSynchronizer.syncRestoreMySubShelvesByIds(
        request,
        response
      ).catch(error =>
        console.error("Failed to refresh confirmed Trash action", error)
      );
    },
  });

  return mutation;
};

export const useDeleteMySubShelfById = () => {
  const queryClient = getQueryClient();

  const perform = async (
    request: DeleteMySubShelfByIdRequest
  ): Promise<DeleteMySubShelfByIdResponse> => {
    try {
      if (isRemoteUnavailable()) {
        throw new NotegicFetchError(FetchClientExceptions.MissingNetwork());
      }
      return await mutationFnDeleteMySubShelfById(request);
    } catch (error) {
      if (!NetworkExceptions.isMissingNetworkError(error)) throw error;
      await SubShelfLocalSimulator.simulateDeleteMySubShelfById(request);
      return {
        success: true as const,
        data: { deletedAt: new Date() },
        exception: null,
        embedded: { publicId: "" },
      } as Awaited<ReturnType<typeof mutationFnDeleteMySubShelfById>>;
    }
  };

  const mutation = useMutation({
    mutationFn: perform,
    onSuccess: async (response, request) => {
      if (response.success === false) return;
      const subShelfId = request.body.subShelfId as UUID;
      const prevSubShelfId = request.affected.prevSubShelfId as UUID;
      const rootShelfId = request.affected.rootShelfId as UUID;
      const targetKeys: QueryKey[] = [
        queryKeys.rootShelf.oneById(rootShelfId),
        queryKeys.subShelf.oneById(subShelfId),
        queryKeys.subShelf.manyByPrevSubShelfId(prevSubShelfId),
        queryKeys.subShelf.manyByRootShelfId(rootShelfId),
        queryKeys.material.manyByParentSubShelfId(subShelfId),
      ];
      Promise.all(
        targetKeys.map(targetKey =>
          queryClient.invalidateQueries({ queryKey: targetKey })
        )
      );
      if (response.embedded?.publicId === "") return;
      await SubShelfLocalSynchronizer.syncDeleteMySubShelfById(
        request,
        response
      );
    },
  });

  return mutation;
};

export const useDeleteMySubShelvesByIds = () => {
  const queryClient = getQueryClient();

  const perform = async (
    request: DeleteMySubShelvesByIdsRequest
  ): Promise<DeleteMySubShelvesByIdsResponse> => {
    try {
      if (isRemoteUnavailable()) {
        throw new NotegicFetchError(FetchClientExceptions.MissingNetwork());
      }
      return await mutationFnDeleteMySubShelvesByIds(request);
    } catch (error) {
      if (!NetworkExceptions.isMissingNetworkError(error)) throw error;
      await SubShelfLocalSimulator.simulateDeleteMySubShelvesByIds(request);
      return {
        success: true as const,
        data: { deletedAt: new Date() },
        exception: null,
        embedded: { publicId: "" },
      } as Awaited<ReturnType<typeof mutationFnDeleteMySubShelvesByIds>>;
    }
  };

  const mutation = useMutation({
    mutationFn: perform,
    onSuccess: async (response, request) => {
      if (response.success === false) return;
      const subShelfIds = (request.body.subShelfIds || []).filter(
        Boolean
      ) as UUID[];
      const rootShelfIds = (request.affected.rootShelfIds || []).filter(
        Boolean
      ) as UUID[];
      const prevSubShelfIds = (request.affected.prevSubShelfIds || []).filter(
        Boolean
      ) as UUID[];
      const targetKeys: QueryKey[] = [
        ...rootShelfIds.flatMap(rootShelfId => [
          queryKeys.rootShelf.oneById(rootShelfId),
          queryKeys.subShelf.manyByRootShelfId(rootShelfId),
        ]),
        ...subShelfIds.flatMap(subShelfId => [
          queryKeys.subShelf.oneById(subShelfId),
          queryKeys.material.manyByParentSubShelfId(subShelfId),
        ]),
        ...prevSubShelfIds.map(prevSubShelfId =>
          queryKeys.subShelf.manyByPrevSubShelfId(prevSubShelfId)
        ),
      ];
      Promise.all(
        targetKeys.map(targetKey =>
          queryClient.invalidateQueries({ queryKey: targetKey })
        )
      );
      if (response.embedded?.publicId === "") return;
      await SubShelfLocalSynchronizer.syncDeleteMySubShelvesByIds(
        request,
        response
      );
    },
  });

  return mutation;
};

export const useHardDeleteMySubShelvesByIds = () => {
  const queryClient = getQueryClient();
  return useMutation({
    mutationFn: mutationFnHardDeleteMySubShelvesByIds,
    retry: false,
    onSuccess: async (response, request) => {
      if (!response.success) return;
      const updates = await Promise.allSettled([
        SubShelfLocalSynchronizer.syncHardDeleteMySubShelvesByIds(
          request,
          response
        ),
        queryClient.invalidateQueries({ queryKey: queryKeys.rootShelf.all() }),
        queryClient.invalidateQueries({ queryKey: queryKeys.subShelf.all() }),
        queryClient.invalidateQueries({ queryKey: queryKeys.blockPack.all() }),
        queryClient.invalidateQueries({ queryKey: queryKeys.material.all() }),
        queryClient.invalidateQueries({ queryKey: queryKeys.userQuota.all() }),
      ]);
      for (const update of updates)
        if (update.status === "rejected")
          console.error(
            "Failed to refresh permanently deleted objects",
            update.reason
          );
    },
  });
};
