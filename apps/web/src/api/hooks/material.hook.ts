import type { UUID } from "node:crypto";
import { NotegicValidationError } from "@shared/api/exceptions/errors/validation.error";
import { NotegicAPIError } from "@shared/api/exceptions";
import { ValidationClientException } from "@shared/api/exceptions/client/validation.exception";
import { SaveMyMaterialById } from "@/api/functions/material.clientFn";
import {
  type GetAllMyMaterialsByRootShelfIdRequest,
  type GetAllMyMaterialsByRootShelfIdResponse,
  type GetMyMaterialAndItsParentByIdRequest,
  type GetMyMaterialAndItsParentByIdResponse,
  type GetMyMaterialByIdRequest,
  type GetMyMaterialByIdResponse,
  type GetMyMaterialsByParentSubShelfIdRequest,
  type GetMyMaterialsByParentSubShelfIdResponse,
  type SaveMyMaterialByIdRequest,
  SaveMyMaterialByIdRequestSchema,
  SaveMyMaterialByIdResponseSchema,
} from "@shared/api/interfaces/material.interface";
import {
  mutationFnCreateMyMaterial,
  mutationFnDeleteMyMaterialById,
  mutationFnDeleteMyMaterialsByIds,
  mutationFnMoveMyMaterialById,
  mutationFnRestoreMyMaterialById,
  mutationFnRestoreMyMaterialsByIds,
  mutationFnUpdateMyMaterialById,
  queryFnGetAllMyMaterialsByRootShelfId,
  queryFnGetMyMaterialAndItsParentById,
  queryFnGetMyMaterialById,
  queryFnGetMyMaterialsByParentSubShelfId,
} from "@/api/invokers/material.invoker";
import { getQueryClient } from "@shared/api/queryClient";
import { UseQueryDefaultOptions } from "@shared/api/queryHookOptions";
import { queryKeys } from "@shared/api/queryKeys";

import { SessionStorageManipulator } from "@shared/lib/sessionStorageManipulator";

import { SessionStorageKey } from "@shared/types/sessionStorage.type";
import {
  type QueryKey,
  type UseQueryOptions,
  useMutation,
  useQuery,
} from "@tanstack/react-query";
import { ZodError } from "zod";

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

    const response = await queryFnGetMyMaterialById(request);
    SessionStorageManipulator.ensureItem(
      SessionStorageKey.csrfToken,
      response.refreshableTokens?.newCSRFToken
    );
    return response;
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

    const response = await queryFnGetMyMaterialAndItsParentById(request);
    SessionStorageManipulator.ensureItem(
      SessionStorageKey.csrfToken,
      response.refreshableTokens?.newCSRFToken
    );
    return response;
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

    const response = await queryFnGetMyMaterialsByParentSubShelfId(request);
    SessionStorageManipulator.ensureItem(
      SessionStorageKey.csrfToken,
      response.refreshableTokens?.newCSRFToken
    );
    return response;
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

export const useGetAllMyMaterialsByRootShelfId = (
  hookRequest?: GetAllMyMaterialsByRootShelfIdRequest,
  options?: Partial<
    UseQueryOptions<GetAllMyMaterialsByRootShelfIdResponse, Error>
  >
) => {
  const queryClient = getQueryClient();

  const perform = async (
    request?: GetAllMyMaterialsByRootShelfIdRequest
  ): Promise<GetAllMyMaterialsByRootShelfIdResponse> => {
    if (!request) {
      throw new NotegicValidationError(
        ValidationClientException.ReceivedUndefinedRequest()
      );
    }

    const response = await queryFnGetAllMyMaterialsByRootShelfId(request);
    SessionStorageManipulator.ensureItem(
      SessionStorageKey.csrfToken,
      response.refreshableTokens?.newCSRFToken
    );
    return response;
  };

  const query = useQuery<GetAllMyMaterialsByRootShelfIdResponse, Error>({
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
    callbackRequest: GetAllMyMaterialsByRootShelfIdRequest
  ): Promise<GetAllMyMaterialsByRootShelfIdResponse> => {
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

export const useCreateMyMaterial = () => {
  const queryClient = getQueryClient();

  const mutation = useMutation({
    mutationFn: mutationFnCreateMyMaterial,
    onSuccess: (response, request) => {
      SessionStorageManipulator.ensureItem(
        SessionStorageKey.csrfToken,
        response.refreshableTokens?.newCSRFToken
      );
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

export const useUpdateMyMaterialById = () => {
  const queryClient = getQueryClient();

  const mutation = useMutation({
    mutationFn: mutationFnUpdateMyMaterialById,
    onSuccess: (response, request) => {
      SessionStorageManipulator.ensureItem(
        SessionStorageKey.csrfToken,
        response.refreshableTokens?.newCSRFToken
      );
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
      SessionStorageManipulator.ensureItem(
        SessionStorageKey.csrfToken,
        response.refreshableTokens?.newCSRFToken
      );
      const materialId = request.body.materialId as UUID;
      const parentSubShelfId = request.affected.parentSubShelfId as UUID;
      const targetKeys: QueryKey[] = [
        queryKeys.material.oneById(materialId),
        queryKeys.material.manyByParentSubShelfId(parentSubShelfId),
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

export const useMoveMyMaterialById = () => {
  const queryClient = getQueryClient();

  const mutation = useMutation({
    mutationFn: mutationFnMoveMyMaterialById,
    onSuccess: (response, request) => {
      SessionStorageManipulator.ensureItem(
        SessionStorageKey.csrfToken,
        response.refreshableTokens?.newCSRFToken
      );
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
export const useRestoreMyMaterialById = () => {
  const queryClient = getQueryClient();

  const mutation = useMutation({
    mutationFn: mutationFnRestoreMyMaterialById,
    onSuccess: (response, request) => {
      SessionStorageManipulator.ensureItem(
        SessionStorageKey.csrfToken,
        response.refreshableTokens?.newCSRFToken
      );
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

export const useRestoreMyMaterialsByIds = () => {
  const queryClient = getQueryClient();

  const mutation = useMutation({
    mutationFn: mutationFnRestoreMyMaterialsByIds,
    onSuccess: (response, request) => {
      SessionStorageManipulator.ensureItem(
        SessionStorageKey.csrfToken,
        response.refreshableTokens?.newCSRFToken
      );
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

export const useDeleteMyMaterialById = () => {
  const queryClient = getQueryClient();

  const mutation = useMutation({
    mutationFn: mutationFnDeleteMyMaterialById,
    onSuccess: (response, request) => {
      SessionStorageManipulator.ensureItem(
        SessionStorageKey.csrfToken,
        response.refreshableTokens?.newCSRFToken
      );
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

export const useDeleteMyMaterialsByIds = () => {
  const queryClient = getQueryClient();

  const mutation = useMutation({
    mutationFn: mutationFnDeleteMyMaterialsByIds,
    onSuccess: (response, request) => {
      SessionStorageManipulator.ensureItem(
        SessionStorageKey.csrfToken,
        response.refreshableTokens?.newCSRFToken
      );
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
