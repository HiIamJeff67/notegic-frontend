import type { UUID } from "node:crypto";
import { NotegicAPIError } from "@shared/api/exceptions";
import { FetchClientExceptions } from "@shared/api/exceptions/client/fetch.exception";
import { ValidationClientException } from "@shared/api/exceptions/client/validation.exception";
import { NotegicFetchError } from "@shared/api/exceptions/errors/fetch.error";
import { NotegicValidationError } from "@shared/api/exceptions/errors/validation.error";
import { NetworkExceptions } from "@shared/api/exceptions/network.exception";
import {
  CreateMyMaterialRequestSchema,
  UpdateMyMaterialByIdRequestSchema,
  MoveMyMaterialByIdRequestSchema,
  RestoreMyMaterialByIdRequestSchema,
  RestoreMyMaterialsByIdsRequestSchema,
  DeleteMyMaterialByIdRequestSchema,
  DeleteMyMaterialsByIdsRequestSchema,
  HardDeleteMyMaterialsByIdsRequestSchema,
  type CreateMaterialObjectTicketRequest,
  type CreateMaterialObjectTicketResponse,
  type GetMyMaterialAndItsParentByIdRequest,
  type GetMyMaterialAndItsParentByIdResponse,
  type GetMyMaterialByIdRequest,
  type GetMyMaterialByIdResponse,
  type GetMyMaterialsByParentSubShelfIdRequest,
  type GetMyMaterialsByParentSubShelfIdResponse,
  type GetMyMaterialsByRootShelfIdRequest,
  type GetMyMaterialsByRootShelfIdResponse,
  type ResolveMaterialObjectTicketRequest,
  type ResolveMaterialObjectTicketResponse,
  type SaveMyMaterialByIdRequest,
  SaveMyMaterialByIdRequestSchema,
  SaveMyMaterialByIdResponseSchema,
} from "@shared/api/interfaces/material.interface";
import { parseRequest } from "@shared/api/validation";
import { getQueryClient } from "@shared/api/queryClient";
import { UseQueryDefaultOptions } from "@shared/api/queryHookOptions";
import { queryKeys } from "@shared/api/queryKeys";
import {
  type QueryKey,
  type UseQueryOptions,
  useMutation,
  useQuery,
} from "@tanstack/react-query";
import { ZodError } from "zod";
import { isRemoteUnavailable } from "@/api/availability";
import { getClientRequestHeaders } from "@/api/clientHeaders";
import { SaveMyMaterialById } from "@/api/functions/material.clientFn";
import {
  mutationFnCreateMaterialObjectTicket,
  mutationFnCreateMyMaterial,
  mutationFnDeleteMyMaterialById,
  mutationFnDeleteMyMaterialsByIds,
  mutationFnHardDeleteMyMaterialsByIds,
  mutationFnMoveMyMaterialById,
  mutationFnRestoreMyMaterialById,
  mutationFnRestoreMyMaterialsByIds,
  mutationFnUpdateMyMaterialById,
  queryFnGetMyMaterialAndItsParentById,
  queryFnGetMyMaterialById,
  queryFnGetMyMaterialsByParentSubShelfId,
  queryFnGetMyMaterialsByRootShelfId,
  queryFnResolveMaterialObjectTicket,
} from "@/api/invokers/material.invoker";
import { MaterialLocalSimulator } from "@/api/local/simulators/material.simulator";
import { MaterialLocalSynchronizer } from "@/api/local/synchronizers/material.synchronizer";

const materialObjectTicketStaleTime = 60 * 1000;

export const useCreateMaterialObjectTicket = () =>
  useMutation<
    CreateMaterialObjectTicketResponse,
    Error,
    CreateMaterialObjectTicketRequest
  >({
    mutationFn: mutationFnCreateMaterialObjectTicket,
    retry: false,
  });

export const useResolveMaterialObjectTicket = (
  objectTicket?: string | null,
  options?: Partial<UseQueryOptions<ResolveMaterialObjectTicketResponse, Error>>
) => {
  const queryClient = getQueryClient();
  const perform = async (): Promise<ResolveMaterialObjectTicketResponse> => {
    if (!objectTicket)
      throw new Error("Material object ticket is unavailable.");
    const response = await queryFnResolveMaterialObjectTicket({
      header: getClientRequestHeaders(),
      body: { objectTicket },
    });
    return response;
  };
  const query = useQuery({
    queryKey: queryKeys.material.objectTicket(objectTicket),
    queryFn: perform,
    staleTime: materialObjectTicketStaleTime,
    retry: false,
    ...options,
    enabled: Boolean(objectTicket) && (options?.enabled ?? true),
  });
  const fetch = async (
    callbackRequest: ResolveMaterialObjectTicketRequest
  ): Promise<ResolveMaterialObjectTicketResponse> => {
    const response = await queryClient.fetchQuery({
      queryKey: queryKeys.material.objectTicket(
        callbackRequest.body.objectTicket
      ),
      queryFn: () => queryFnResolveMaterialObjectTicket(callbackRequest),
      staleTime: materialObjectTicketStaleTime,
      retry: false,
      ...options,
    });
    return response;
  };
  return { ...query, fetch };
};

export const useGetMyMaterialById = (
  hookRequest?: GetMyMaterialByIdRequest,
  options?: Partial<UseQueryOptions<GetMyMaterialByIdResponse, Error>>
) => {
  const queryClient = getQueryClient();

  const perform = async (
    request?: GetMyMaterialByIdRequest
  ): Promise<GetMyMaterialByIdResponse> => {
    if (!request) {
      throw new NotegicValidationError(
        ValidationClientException.ReceivedUndefinedRequest()
      );
    }

    try {
      if (isRemoteUnavailable()) {
        throw new NotegicFetchError(FetchClientExceptions.MissingNetwork());
      }
      const response = await queryFnGetMyMaterialById(request);
      await MaterialLocalSynchronizer.syncGetMyMaterialById(response);
      return response;
    } catch (error) {
      if (
        error instanceof NotegicAPIError ||
        error instanceof NotegicFetchError
      ) {
        const material =
          await MaterialLocalSimulator.simulateGetMyMaterialById(request);
        return (
          NetworkExceptions.isMissingNetworkError(error)
            ? {
                success: true,
                data: material,
                exception: null,
                embedded: { publicId: "" },
              }
            : {
                success: false,
                data: material,
                exception: error.unWrap,
                embedded: { publicId: "" },
              }
        ) as GetMyMaterialByIdResponse;
      }
      throw error;
    }
  };

  const query = useQuery<GetMyMaterialByIdResponse, Error>({
    queryKey: queryKeys.material.oneById(
      hookRequest?.param.materialId as UUID | undefined,
      false,
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
    callbackRequest: GetMyMaterialByIdRequest
  ): Promise<GetMyMaterialByIdResponse> => {
    return queryClient.fetchQuery({
      queryKey: queryKeys.material.oneById(
        callbackRequest.param.materialId as UUID | undefined,
        false,
        callbackRequest.param.isDeleted ?? false
      ),
      queryFn: async () => perform(callbackRequest),
      staleTime: UseQueryDefaultOptions.staleTime,
      ...options,
    });
  };

  return { ...query, fetch };
};

export const useGetMyMaterialAndItsParentById = (
  hookRequest?: GetMyMaterialAndItsParentByIdRequest,
  options?: Partial<
    UseQueryOptions<GetMyMaterialAndItsParentByIdResponse, Error>
  >
) => {
  const queryClient = getQueryClient();

  const perform = async (
    request?: GetMyMaterialAndItsParentByIdRequest
  ): Promise<GetMyMaterialAndItsParentByIdResponse> => {
    if (!request) {
      throw new NotegicValidationError(
        ValidationClientException.ReceivedUndefinedRequest()
      );
    }

    try {
      if (isRemoteUnavailable()) {
        throw new NotegicFetchError(FetchClientExceptions.MissingNetwork());
      }
      const response = await queryFnGetMyMaterialAndItsParentById(request);
      await MaterialLocalSynchronizer.syncGetMyMaterialAndItsParentById(
        response
      );
      return response;
    } catch (error) {
      if (
        error instanceof NotegicAPIError ||
        error instanceof NotegicFetchError
      ) {
        const material =
          await MaterialLocalSimulator.simulateGetMyMaterialAndItsParentById(
            request
          );
        return (
          NetworkExceptions.isMissingNetworkError(error)
            ? {
                success: true,
                data: material,
                exception: null,
                embedded: { publicId: "" },
              }
            : {
                success: false,
                data: material,
                exception: error.unWrap,
                embedded: { publicId: "" },
              }
        ) as GetMyMaterialAndItsParentByIdResponse;
      }
      throw error;
    }
  };

  const query = useQuery<GetMyMaterialAndItsParentByIdResponse, Error>({
    queryKey: queryKeys.material.oneById(
      hookRequest?.param.materialId as UUID | undefined,
      true,
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
    callbackRequest: GetMyMaterialAndItsParentByIdRequest
  ): Promise<GetMyMaterialAndItsParentByIdResponse> => {
    return queryClient.fetchQuery({
      queryKey: queryKeys.material.oneById(
        callbackRequest.param.materialId as UUID | undefined,
        true,
        callbackRequest.param.isDeleted ?? false
      ),
      queryFn: async () => perform(callbackRequest),
      staleTime: UseQueryDefaultOptions.staleTime,
      ...options,
    });
  };

  return { ...query, fetch };
};

export const useGetMyMaterialsByParentSubShelfId = (
  hookRequest?: GetMyMaterialsByParentSubShelfIdRequest,
  options?: Partial<
    UseQueryOptions<GetMyMaterialsByParentSubShelfIdResponse, Error>
  >
) => {
  const queryClient = getQueryClient();

  const perform = async (
    request?: GetMyMaterialsByParentSubShelfIdRequest
  ): Promise<GetMyMaterialsByParentSubShelfIdResponse> => {
    if (!request) {
      throw new NotegicValidationError(
        ValidationClientException.ReceivedUndefinedRequest()
      );
    }

    try {
      if (isRemoteUnavailable()) {
        throw new NotegicFetchError(FetchClientExceptions.MissingNetwork());
      }
      const response = await queryFnGetMyMaterialsByParentSubShelfId(request);
      await MaterialLocalSynchronizer.syncGetMyMaterialsByParentSubShelfId(
        response
      );
      return response;
    } catch (error) {
      if (
        error instanceof NotegicAPIError ||
        error instanceof NotegicFetchError
      ) {
        const materials =
          await MaterialLocalSimulator.simulateGetMyMaterialsByParentSubShelfId(
            request
          );
        return (
          NetworkExceptions.isMissingNetworkError(error)
            ? {
                success: true,
                data: materials,
                exception: null,
                embedded: { publicId: "" },
              }
            : {
                success: false,
                data: materials,
                exception: error.unWrap,
                embedded: { publicId: "" },
              }
        ) as GetMyMaterialsByParentSubShelfIdResponse;
      }
      throw error;
    }
  };

  const query = useQuery<GetMyMaterialsByParentSubShelfIdResponse, Error>({
    queryKey: queryKeys.material.manyByParentSubShelfId(
      hookRequest?.param.parentSubShelfId as UUID | undefined,
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
    callbackRequest: GetMyMaterialsByParentSubShelfIdRequest
  ): Promise<GetMyMaterialsByParentSubShelfIdResponse> => {
    return queryClient.fetchQuery({
      queryKey: queryKeys.material.manyByParentSubShelfId(
        callbackRequest.param.parentSubShelfId as UUID | undefined,
        callbackRequest.param.areDeleted ?? false
      ),
      queryFn: async () => perform(callbackRequest),
      staleTime: UseQueryDefaultOptions.staleTime,
      ...options,
    });
  };

  return { ...query, fetch };
};

export const useGetMyMaterialsByRootShelfId = (
  hookRequest?: GetMyMaterialsByRootShelfIdRequest,
  options?: Partial<UseQueryOptions<GetMyMaterialsByRootShelfIdResponse, Error>>
) => {
  const queryClient = getQueryClient();

  const perform = async (
    request?: GetMyMaterialsByRootShelfIdRequest
  ): Promise<GetMyMaterialsByRootShelfIdResponse> => {
    if (!request) {
      throw new NotegicValidationError(
        ValidationClientException.ReceivedUndefinedRequest()
      );
    }

    try {
      if (isRemoteUnavailable()) {
        throw new NotegicFetchError(FetchClientExceptions.MissingNetwork());
      }
      const response = await queryFnGetMyMaterialsByRootShelfId(request);
      await MaterialLocalSynchronizer.syncGetMyMaterialsByRootShelfId(
        response,
        request.param.rootShelfId
      );
      return response;
    } catch (error) {
      if (
        error instanceof NotegicAPIError ||
        error instanceof NotegicFetchError
      ) {
        const materials =
          await MaterialLocalSimulator.simulateGetMyMaterialsByRootShelfId(
            request
          );
        return (
          NetworkExceptions.isMissingNetworkError(error)
            ? {
                success: true,
                data: materials,
                exception: null,
                embedded: { publicId: "" },
              }
            : {
                success: false,
                data: materials,
                exception: error.unWrap,
                embedded: { publicId: "" },
              }
        ) as GetMyMaterialsByRootShelfIdResponse;
      }
      throw error;
    }
  };

  const query = useQuery<GetMyMaterialsByRootShelfIdResponse, Error>({
    queryKey: queryKeys.material.manyByRootShelfId(
      hookRequest?.param.rootShelfId as UUID | undefined,
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
    callbackRequest: GetMyMaterialsByRootShelfIdRequest
  ): Promise<GetMyMaterialsByRootShelfIdResponse> => {
    return queryClient.fetchQuery({
      queryKey: queryKeys.material.manyByRootShelfId(
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

export const useCreateMyMaterial = (
  options: { offlineFallback?: boolean } = {}
) => {
  const queryClient = getQueryClient();

  const perform = async (
    request: Parameters<typeof mutationFnCreateMyMaterial>[0]
  ) => {
    parseRequest(CreateMyMaterialRequestSchema, request);
    try {
      if (isRemoteUnavailable()) {
        throw new NotegicFetchError(FetchClientExceptions.MissingNetwork());
      }
      return await mutationFnCreateMyMaterial(request);
    } catch (error) {
      if (
        options.offlineFallback === false ||
        !NetworkExceptions.isMissingNetworkError(error)
      )
        throw error;
      const created =
        await MaterialLocalSimulator.simulateCreateMyMaterial(request);
      if (!created) throw error;
      return {
        success: true as const,
        data: created,
        exception: null,
        embedded: { publicId: "" },
      };
    }
  };

  const mutation = useMutation({
    mutationFn: perform,
    onSuccess: async (response, request) => {
      if (response.embedded?.publicId !== "") {
        await MaterialLocalSynchronizer.syncCreateMyMaterial(request, response);
      }
      const parentSubShelfId = request.affected.parentSubShelfId as UUID;
      const rootShelfId = request.affected.rootShelfId as UUID;
      const targetKeys: QueryKey[] = [
        queryKeys.rootShelf.oneById(rootShelfId),
        queryKeys.material.manyByParentSubShelfId(parentSubShelfId),
        queryKeys.material.manyByRootShelfId(rootShelfId),
      ];
      Promise.all(
        targetKeys.map(targetKey =>
          queryClient.invalidateQueries({ queryKey: targetKey })
        )
      );
    },
    onError: error => {},
  });

  return mutation;
};

export const useUpdateMyMaterialById = (
  options: { offlineFallback?: boolean } = {}
) => {
  const queryClient = getQueryClient();

  const perform = async (
    request: Parameters<typeof mutationFnUpdateMyMaterialById>[0]
  ) => {
    parseRequest(UpdateMyMaterialByIdRequestSchema, request);
    try {
      if (isRemoteUnavailable()) {
        throw new NotegicFetchError(FetchClientExceptions.MissingNetwork());
      }
      return await mutationFnUpdateMyMaterialById(request);
    } catch (error) {
      if (
        options.offlineFallback === false ||
        !NetworkExceptions.isMissingNetworkError(error)
      )
        throw error;
      await MaterialLocalSimulator.simulateUpdateMyMaterialById(request);
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
    onSuccess: (response, request) => {
      const materialId = request.body.materialId as UUID;
      const parentSubShelfId = request.affected.parentSubShelfId as UUID;
      const rootShelfId = request.affected.rootShelfId as UUID;
      const targetKeys: QueryKey[] = [
        queryKeys.material.oneById(materialId),
        queryKeys.material.manyByParentSubShelfId(parentSubShelfId),
        queryKeys.material.manyByRootShelfId(rootShelfId),
      ];
      Promise.all(
        targetKeys.map(targetKey =>
          queryClient.invalidateQueries({ queryKey: targetKey })
        )
      );
    },
    onError: error => {},
  });

  return mutation;
};

export const useSaveMyMaterialById = () => {
  const queryClient = getQueryClient();

  const mutation = useMutation({
    // since the SaveMyMaterialById is a client only function, we define it here directly
    mutationFn: async (request: SaveMyMaterialByIdRequest) => {
      try {
        const validatedRequest = SaveMyMaterialByIdRequestSchema.parse(request);
        const response = await SaveMyMaterialById(validatedRequest);
        return SaveMyMaterialByIdResponseSchema.parse(response);
      } catch (error) {
        if (error instanceof ZodError) {
          const errorMessage = error.issues
            .map(issue => issue.message)
            .join(", ");
          throw new Error(`validation failed : ${errorMessage}`);
        } else if (error instanceof NotegicAPIError) {
          switch (error.unWrap.reason) {
            default:
              throw new Error(error.unWrap.message);
          }
        }
        throw error;
      }
    },
    onSuccess: (response, request) => {
      const materialId = request.body.materialId as UUID;
      const parentSubShelfId = request.affected.parentSubShelfId as UUID;
      const targetKeys: QueryKey[] = [
        queryKeys.material.oneById(materialId),
        queryKeys.material.oneById(materialId, true),
        queryKeys.material.manyByParentSubShelfId(parentSubShelfId),
      ];
      return Promise.all(
        targetKeys.map(targetKey =>
          queryClient.invalidateQueries({ queryKey: targetKey })
        )
      );
    },
    onError: error => {},
  });

  return mutation;
};

export const useMoveMyMaterialById = (
  options: { offlineFallback?: boolean } = {}
) => {
  const queryClient = getQueryClient();

  const perform = async (
    request: Parameters<typeof mutationFnMoveMyMaterialById>[0]
  ) => {
    parseRequest(MoveMyMaterialByIdRequestSchema, request);
    try {
      if (isRemoteUnavailable()) {
        throw new NotegicFetchError(FetchClientExceptions.MissingNetwork());
      }
      return await mutationFnMoveMyMaterialById(request);
    } catch (error) {
      if (
        options.offlineFallback === false ||
        !NetworkExceptions.isMissingNetworkError(error)
      )
        throw error;
      await MaterialLocalSimulator.simulateMoveMyMaterialById(request);
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
    onSuccess: (response, request) => {
      const materialId = request.body.materialId as UUID;
      const destinationParentSubShelfId = request.body
        .destinationParentSubShelfId as UUID;
      const sourceParentSubShelfId = request.affected
        .sourceParentSubShelfId as UUID;
      const rootShelfId = request.affected.rootShelfId as UUID;
      const targetKeys: QueryKey[] = [
        queryKeys.rootShelf.oneById(rootShelfId),
        queryKeys.subShelf.oneById(sourceParentSubShelfId),
        queryKeys.material.oneById(materialId),
        queryKeys.material.manyByParentSubShelfId(sourceParentSubShelfId),
        queryKeys.material.manyByParentSubShelfId(destinationParentSubShelfId),
        queryKeys.material.manyByRootShelfId(rootShelfId),
      ];
      Promise.all(
        targetKeys.map(targetKey =>
          queryClient.invalidateQueries({ queryKey: targetKey })
        )
      );
    },
    onError: error => {},
  });

  return mutation;
};
export const useRestoreMyMaterialById = (
  options: { offlineFallback?: boolean } = {}
) => {
  const queryClient = getQueryClient();

  const perform = async (
    request: Parameters<typeof mutationFnRestoreMyMaterialById>[0]
  ) => {
    parseRequest(RestoreMyMaterialByIdRequestSchema, request);
    try {
      if (isRemoteUnavailable()) {
        throw new NotegicFetchError(FetchClientExceptions.MissingNetwork());
      }
      return await mutationFnRestoreMyMaterialById(request);
    } catch (error) {
      if (
        options.offlineFallback === false ||
        !NetworkExceptions.isMissingNetworkError(error)
      )
        throw error;
      const restored =
        await MaterialLocalSimulator.simulateRestoreMyMaterialById(request);
      if (!restored) throw error;
      return {
        success: true as const,
        data: restored,
        exception: null,
        embedded: { publicId: "" },
      };
    }
  };

  const mutation = useMutation({
    retry: false,
    mutationFn: perform,
    onSuccess: (response, request) => {
      if (response.success === false) return;
      const materialId = request.body.materialId as UUID;
      const parentSubShelfId = request.affected.parentSubShelfId as UUID;
      const rootShelfId = request.affected.rootShelfId as UUID;
      const targetKeys: QueryKey[] = [
        queryKeys.rootShelf.oneById(rootShelfId),
        queryKeys.material.oneById(materialId),
        queryKeys.material.manyByParentSubShelfId(parentSubShelfId),
        queryKeys.material.manyByRootShelfId(rootShelfId),
      ];
      Promise.all(
        targetKeys.map(targetKey =>
          queryClient.invalidateQueries({ queryKey: targetKey })
        )
      );
    },
    onError: error => {},
  });

  return mutation;
};

export const useRestoreMyMaterialsByIds = (
  options: { offlineFallback?: boolean } = {}
) => {
  const queryClient = getQueryClient();

  const perform = async (
    request: Parameters<typeof mutationFnRestoreMyMaterialsByIds>[0]
  ) => {
    parseRequest(RestoreMyMaterialsByIdsRequestSchema, request);
    try {
      if (isRemoteUnavailable()) {
        throw new NotegicFetchError(FetchClientExceptions.MissingNetwork());
      }
      return await mutationFnRestoreMyMaterialsByIds(request);
    } catch (error) {
      if (
        options.offlineFallback === false ||
        !NetworkExceptions.isMissingNetworkError(error)
      )
        throw error;
      const restored =
        await MaterialLocalSimulator.simulateRestoreMyMaterialsByIds(request);
      return {
        success: true as const,
        data: restored,
        exception: null,
        embedded: { publicId: "" },
      };
    }
  };

  const mutation = useMutation({
    retry: false,
    mutationFn: perform,
    onSuccess: (response, request) => {
      if (!response.success) return;
      const materialIds = (request.body.materialIds || []).filter(
        Boolean
      ) as UUID[];
      const parentSubShelfIds = (
        request.affected.parentSubShelfIds || []
      ).filter(Boolean) as UUID[];
      const rootShelfIds = (request.affected.rootShelfIds || []).filter(
        Boolean
      ) as UUID[];
      const targetKeys: QueryKey[] = [
        ...rootShelfIds.flatMap(rootShelfId => [
          queryKeys.rootShelf.oneById(rootShelfId),
          queryKeys.material.manyByRootShelfId(rootShelfId),
        ]),
        ...parentSubShelfIds.map(parentSubShelfId =>
          queryKeys.material.manyByParentSubShelfId(parentSubShelfId)
        ),
        ...materialIds.map(materialId =>
          queryKeys.material.oneById(materialId)
        ),
      ];
      Promise.all(
        targetKeys.map(targetKey =>
          queryClient.invalidateQueries({ queryKey: targetKey })
        )
      );
    },
    onError: error => {},
  });

  return mutation;
};

export const useDeleteMyMaterialById = (
  options: { offlineFallback?: boolean } = {}
) => {
  const queryClient = getQueryClient();

  const perform = async (
    request: Parameters<typeof mutationFnDeleteMyMaterialById>[0]
  ) => {
    parseRequest(DeleteMyMaterialByIdRequestSchema, request);
    try {
      if (isRemoteUnavailable()) {
        throw new NotegicFetchError(FetchClientExceptions.MissingNetwork());
      }
      return await mutationFnDeleteMyMaterialById(request);
    } catch (error) {
      if (
        options.offlineFallback === false ||
        !NetworkExceptions.isMissingNetworkError(error)
      )
        throw error;
      await MaterialLocalSimulator.simulateDeleteMyMaterialById(request);
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
    onSuccess: (response, request) => {
      const materialId = request.body.materialId as UUID;
      const parentSubShelfId = request.affected.parentSubShelfId as UUID;
      const rootShelfId = request.affected.rootShelfId as UUID;
      const targetKeys: QueryKey[] = [
        queryKeys.rootShelf.oneById(rootShelfId),
        queryKeys.material.oneById(materialId),
        queryKeys.material.manyByParentSubShelfId(parentSubShelfId),
        queryKeys.material.manyByRootShelfId(rootShelfId),
      ];
      Promise.all(
        targetKeys.map(targetKey =>
          queryClient.invalidateQueries({ queryKey: targetKey })
        )
      );
    },
    onError: error => {},
  });

  return mutation;
};

export const useDeleteMyMaterialsByIds = (
  options: { offlineFallback?: boolean } = {}
) => {
  const queryClient = getQueryClient();

  const perform = async (
    request: Parameters<typeof mutationFnDeleteMyMaterialsByIds>[0]
  ) => {
    parseRequest(DeleteMyMaterialsByIdsRequestSchema, request);
    try {
      if (isRemoteUnavailable()) {
        throw new NotegicFetchError(FetchClientExceptions.MissingNetwork());
      }
      return await mutationFnDeleteMyMaterialsByIds(request);
    } catch (error) {
      if (
        options.offlineFallback === false ||
        !NetworkExceptions.isMissingNetworkError(error)
      )
        throw error;
      await MaterialLocalSimulator.simulateDeleteMyMaterialsByIds(request);
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
    onSuccess: (response, request) => {
      const materialIds = (request.body.materialIds || []).filter(
        Boolean
      ) as UUID[];
      const parentSubShelfIds = (
        request.affected.parentSubShelfIds || []
      ).filter(Boolean) as UUID[];
      const rootShelfIds = (request.affected.rootShelfIds || []).filter(
        Boolean
      ) as UUID[];
      const targetKeys: QueryKey[] = [
        ...rootShelfIds.flatMap(rootShelfId => [
          queryKeys.rootShelf.oneById(rootShelfId),
          queryKeys.material.manyByRootShelfId(rootShelfId),
        ]),
        ...parentSubShelfIds.map(parentSubShelfId =>
          queryKeys.material.manyByParentSubShelfId(parentSubShelfId)
        ),
        ...materialIds.map(materialId =>
          queryKeys.material.oneById(materialId)
        ),
      ];
      Promise.all(
        targetKeys.map(targetKey =>
          queryClient.invalidateQueries({ queryKey: targetKey })
        )
      );
    },
    onError: error => {},
  });

  return mutation;
};

export const useHardDeleteMyMaterialsByIds = (
  options: { offlineFallback?: boolean } = {}
) => {
  const queryClient = getQueryClient();

  const perform = async (
    request: Parameters<typeof mutationFnHardDeleteMyMaterialsByIds>[0]
  ) => {
    parseRequest(HardDeleteMyMaterialsByIdsRequestSchema, request);
    try {
      if (isRemoteUnavailable()) {
        throw new NotegicFetchError(FetchClientExceptions.MissingNetwork());
      }
      return await mutationFnHardDeleteMyMaterialsByIds(request);
    } catch (error) {
      if (
        options.offlineFallback === false ||
        !NetworkExceptions.isMissingNetworkError(error)
      )
        throw error;
      await MaterialLocalSimulator.simulateHardDeleteMyMaterialsByIds(request);
      return {
        success: true as const,
        data: { deletedAt: new Date() },
        exception: null,
        embedded: { publicId: "" },
      };
    }
  };

  return useMutation({
    mutationFn: perform,
    retry: false,
    onSuccess: async (response, request) => {
      if (!response.success) return;
      const updates = await Promise.allSettled([
        MaterialLocalSynchronizer.syncHardDeleteMyMaterialsByIds(
          request,
          response
        ),
        queryClient.invalidateQueries({ queryKey: queryKeys.material.all() }),
        queryClient.invalidateQueries({ queryKey: queryKeys.rootShelf.all() }),
        queryClient.invalidateQueries({ queryKey: queryKeys.userQuota.all() }),
      ]);
      for (const update of updates)
        if (update.status === "rejected")
          console.error(
            "Failed to refresh permanently deleted materials",
            update.reason
          );
    },
  });
};
