import type { UUID } from "node:crypto";
import { NotegicFetchError } from "@shared/api/exceptions/errors/fetch.error";
import { NotegicValidationError } from "@shared/api/exceptions/errors/validation.error";
import {
  ExceptionReasonDictionary,
  NotegicAPIError,
} from "@shared/api/exceptions";
import { FetchClientExceptions } from "@shared/api/exceptions/client/fetch.exception";
import { ValidationClientException } from "@shared/api/exceptions/client/validation.exception";
import { AccessControlPermission } from "@shared/api/interfaces/enums";
import type {
  MoveMyBlockPacksByParentSubShelfIdsRequest,
  MoveMyBlockPacksByParentSubShelfIdsResponse,
  CreateBlockPackRequest,
  CreateBlockPackResponse,
  CreateBlockPacksRequest,
  CreateBlockPacksResponse,
  DeleteMyBlockPackByIdRequest,
  DeleteMyBlockPackByIdResponse,
  DeleteMyBlockPacksByIdsRequest,
  DeleteMyBlockPacksByIdsResponse,
  GetAllMyBlockPacksByRootShelfIdRequest,
  GetAllMyBlockPacksByRootShelfIdResponse,
  GetMyBlockPackAndItsParentByIdRequest,
  GetMyBlockPackAndItsParentByIdResponse,
  GetMyBlockPackByIdRequest,
  GetMyBlockPackByIdResponse,
  GetMyBlockPacksByParentSubShelfIdRequest,
  GetMyBlockPacksByParentSubShelfIdResponse,
  MoveMyBlockPackByIdRequest,
  MoveMyBlockPackByIdResponse,
  MoveMyBlockPacksByParentSubShelfIdRequest,
  MoveMyBlockPacksByParentSubShelfIdResponse,
  RestoreMyBlockPackByIdRequest,
  RestoreMyBlockPackByIdResponse,
  RestoreMyBlockPacksByIdsRequest,
  RestoreMyBlockPacksByIdsResponse,
  UpdateMyBlockPackByIdRequest,
  UpdateMyBlockPackByIdResponse,
  UpdateMyBlockPacksByIdsRequest,
  UpdateMyBlockPacksByIdsResponse,
} from "@shared/api/interfaces/blockPack.interface";
import {
  mutationFnMoveMyBlockPacksByParentSubShelfIds,
  mutationFnCreateBlockPack,
  mutationFnCreateBlockPacks,
  mutationFnDeleteMyBlockPackById,
  mutationFnDeleteMyBlockPacksByIds,
  mutationFnMoveMyBlockPackById,
  mutationFnMoveMyBlockPacksByParentSubShelfId,
  mutationFnRestoreMyBlockPackById,
  mutationFnRestoreMyBlockPacksByIds,
  mutationFnUpdateMyBlockPackById,
  mutationFnUpdateMyBlockPacksByIds,
  queryFnGetAllMyBlockPacksByRootShelfId,
  queryFnGetMyBlockPackAndItsParentById,
  queryFnGetMyBlockPackById,
  queryFnGetMyBlockPacksByParentSubShelfId,
} from "@/api/invokers/blockPack.invoker";
import { BlockPackLocalSimulator } from "@/api/local/simulators/blockPack.simulator";
import { BlockPackLocalSynchronizer } from "@/api/local/synchronizers/blockPack.synchronizer";
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

export const useGetMyBlockPackById = (
  hookRequest?: GetMyBlockPackByIdRequest,
  options?: Partial<UseQueryOptions<GetMyBlockPackByIdResponse, Error>>
) => {
  const queryClient = getQueryClient();

  const perform = async (
    request?: GetMyBlockPackByIdRequest
  ): Promise<GetMyBlockPackByIdResponse> => {
    if (!request) {
      throw new NotegicValidationError(
        ValidationClientException.ReceivedUndefinedRequest()
      );
    }

    try {
      if (typeof navigator !== "undefined" && navigator.onLine === false) {
        throw new NotegicFetchError(FetchClientExceptions.MissingNetwork());
      }

      const response = await queryFnGetMyBlockPackById(request);
      SessionStorageManipulator.ensureItem(
        SessionStorageKey.csrfToken,
        response.refreshableTokens?.newCSRFToken
      );
      await BlockPackLocalSynchronizer.syncGetMyBlockPackById(response);
      return response;
    } catch (error) {
      if (
        error instanceof NotegicAPIError ||
        error instanceof NotegicFetchError
      ) {
        const existingBlockPack =
          await BlockPackLocalSimulator.simulateGetMyBlockPackById(request);
        return {
          success: false,
          data: existingBlockPack,
          exception: error.unWrap,
          embedded: { publicId: "" },
        } as GetMyBlockPackByIdResponse;
      }

      throw error;
    }
  };

  const query = useQuery<GetMyBlockPackByIdResponse, Error>({
    queryKey: queryKeys.blockPack.oneById(
      hookRequest?.param.blockPackId as UUID | undefined,
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
    callbackRequest: GetMyBlockPackByIdRequest
  ): Promise<GetMyBlockPackByIdResponse> => {
    return queryClient.fetchQuery({
      queryKey: queryKeys.blockPack.oneById(
        callbackRequest.param.blockPackId as UUID | undefined,
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

export const useGetMyBlockPackAndItsParentById = (
  hookRequest?: GetMyBlockPackAndItsParentByIdRequest,
  options?: Partial<
    UseQueryOptions<GetMyBlockPackAndItsParentByIdResponse, Error>
  >
) => {
  const queryClient = getQueryClient();

  const perform = async (
    request?: GetMyBlockPackAndItsParentByIdRequest
  ): Promise<GetMyBlockPackAndItsParentByIdResponse> => {
    if (!request) {
      throw new NotegicValidationError(
        ValidationClientException.ReceivedUndefinedRequest()
      );
    }

    try {
      if (typeof navigator !== "undefined" && navigator.onLine === false) {
        throw new NotegicFetchError(FetchClientExceptions.MissingNetwork());
      }

      const response = await queryFnGetMyBlockPackAndItsParentById(request);
      SessionStorageManipulator.ensureItem(
        SessionStorageKey.csrfToken,
        response.refreshableTokens?.newCSRFToken
      );
      await BlockPackLocalSynchronizer.syncGetMyBlockPackAndItsParentById(
        response
      );
      return response;
    } catch (error) {
      if (
        error instanceof NotegicAPIError ||
        error instanceof NotegicFetchError
      ) {
        const existingBlockPackAndItsParent =
          await BlockPackLocalSimulator.simulateGetMyBlockPackAndItsParentById(
            request
          );
        return {
          success: false,
          data: existingBlockPackAndItsParent
            ? {
                ...existingBlockPackAndItsParent,
                permission:
                  "permission" in existingBlockPackAndItsParent
                    ? existingBlockPackAndItsParent.permission
                    : AccessControlPermission.Read,
              }
            : existingBlockPackAndItsParent,
          exception: error.unWrap,
          embedded: { publicId: "" },
        } as unknown as GetMyBlockPackAndItsParentByIdResponse;
      }

      throw error;
    }
  };

  const query = useQuery<GetMyBlockPackAndItsParentByIdResponse, Error>({
    queryKey: queryKeys.blockPack.oneById(
      hookRequest?.param.blockPackId as UUID | undefined,
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
    callbackRequest: GetMyBlockPackAndItsParentByIdRequest
  ): Promise<GetMyBlockPackAndItsParentByIdResponse> => {
    return queryClient.fetchQuery({
      queryKey: queryKeys.blockPack.oneById(
        callbackRequest.param.blockPackId as UUID | undefined,
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

export const useGetMyBlockPacksByParentSubShelfId = (
  hookRequest?: GetMyBlockPacksByParentSubShelfIdRequest,
  options?: Partial<
    UseQueryOptions<GetMyBlockPacksByParentSubShelfIdResponse, Error>
  >
) => {
  const queryClient = getQueryClient();

  const perform = async (
    request?: GetMyBlockPacksByParentSubShelfIdRequest
  ): Promise<GetMyBlockPacksByParentSubShelfIdResponse> => {
    if (!request) {
      throw new NotegicValidationError(
        ValidationClientException.ReceivedUndefinedRequest()
      );
    }

    try {
      if (typeof navigator !== "undefined" && navigator.onLine === false) {
        throw new NotegicFetchError(FetchClientExceptions.MissingNetwork());
      }

      const response = await queryFnGetMyBlockPacksByParentSubShelfId(request);
      SessionStorageManipulator.ensureItem(
        SessionStorageKey.csrfToken,
        response.refreshableTokens?.newCSRFToken
      );
      await BlockPackLocalSynchronizer.syncGetMyBlockPacksByParentSubShelfId(
        response
      );
      return response;
    } catch (error) {
      if (
        error instanceof NotegicAPIError ||
        error instanceof NotegicFetchError
      ) {
        const existingBlockPacks =
          await BlockPackLocalSimulator.simulateGetMyBlockPacksByParentSubShelfId(
            request
          );
        return {
          success: false,
          data: existingBlockPacks,
          exception: error.unWrap,
          embedded: { publicId: "" },
        } as GetMyBlockPacksByParentSubShelfIdResponse;
      }

      throw error;
    }
  };

  const query = useQuery<GetMyBlockPacksByParentSubShelfIdResponse, Error>({
    queryKey: queryKeys.blockPack.manyByParentSubShelfId(
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
    callbackRequest: GetMyBlockPacksByParentSubShelfIdRequest
  ): Promise<GetMyBlockPacksByParentSubShelfIdResponse> => {
    return queryClient.fetchQuery({
      queryKey: queryKeys.blockPack.manyByParentSubShelfId(
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

export const useGetAllMyBlockPacksByRootShelfId = (
  hookRequest?: GetAllMyBlockPacksByRootShelfIdRequest,
  options?: Partial<
    UseQueryOptions<GetAllMyBlockPacksByRootShelfIdResponse, Error>
  >
) => {
  const queryClient = getQueryClient();

  const perform = async (
    request?: GetAllMyBlockPacksByRootShelfIdRequest
  ): Promise<GetAllMyBlockPacksByRootShelfIdResponse> => {
    if (!request) {
      throw new NotegicValidationError(
        ValidationClientException.ReceivedUndefinedRequest()
      );
    }

    try {
      if (typeof navigator !== "undefined" && navigator.onLine === false) {
        throw new NotegicFetchError(FetchClientExceptions.MissingNetwork());
      }

      const response = await queryFnGetAllMyBlockPacksByRootShelfId(request);
      SessionStorageManipulator.ensureItem(
        SessionStorageKey.csrfToken,
        response.refreshableTokens?.newCSRFToken
      );
      await BlockPackLocalSynchronizer.syncGetAllMyBlockPacksByRootShelfId(
        response
      );
      return response;
    } catch (error) {
      if (
        error instanceof NotegicAPIError ||
        error instanceof NotegicFetchError
      ) {
        const existingBlockPacks =
          await BlockPackLocalSimulator.simulateGetAllMyBlockPacksByRootShelfId(
            request
          );
        return {
          success: false,
          data: existingBlockPacks,
          exception: error.unWrap,
          embedded: { publicId: "" },
        } as GetAllMyBlockPacksByRootShelfIdResponse;
      }

      throw error;
    }
  };

  const query = useQuery<GetAllMyBlockPacksByRootShelfIdResponse, Error>({
    queryKey: queryKeys.blockPack.manyByRootShelfId(
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
    callbackRequest: GetAllMyBlockPacksByRootShelfIdRequest
  ): Promise<GetAllMyBlockPacksByRootShelfIdResponse> => {
    return queryClient.fetchQuery({
      queryKey: queryKeys.blockPack.manyByRootShelfId(
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

export const useCreateBlockPack = () => {
  const queryClient = getQueryClient();

  const perform = async (
    request: CreateBlockPackRequest
  ): Promise<CreateBlockPackResponse> => {
    if (typeof navigator !== "undefined" && navigator.onLine === false) {
      throw new NotegicFetchError(FetchClientExceptions.MissingNetwork());
    }

    return await mutationFnCreateBlockPack(request);
  };

  const mutation = useMutation({
    mutationFn: perform,
    onSuccess: async (response, variables) => {
      SessionStorageManipulator.ensureItem(
        SessionStorageKey.csrfToken,
        response.refreshableTokens?.newCSRFToken
      );
      const parentSubShelfId = variables.affected.parentSubShelfId as UUID;
      const rootShelfId = variables.affected.rootShelfId as UUID;
      const targetKeys: QueryKey[] = [
        queryKeys.rootShelf.oneById(rootShelfId),
        queryKeys.subShelf.oneById(parentSubShelfId),
        queryKeys.blockPack.manyByParentSubShelfId(parentSubShelfId),
        queryKeys.blockPack.manyByRootShelfId(rootShelfId),
      ];
      Promise.all(
        targetKeys.map(targetKey =>
          queryClient.invalidateQueries({ queryKey: targetKey })
        )
      );
      await BlockPackLocalSynchronizer.syncCreateBlockPack(variables, response);
    },
    onError: async (error, variables) => {
      if (error instanceof NotegicFetchError) {
        switch (error.unWrap.reason) {
          case ExceptionReasonDictionary.client.fetch.missingNetwork:
            await BlockPackLocalSimulator.simulateCreateBlockPack(variables);
            break;
        }
      }
    },
  });

  return mutation;
};

export const useCreateBlockPacks = () => {
  const queryClient = getQueryClient();

  const perform = async (
    request: CreateBlockPacksRequest
  ): Promise<CreateBlockPacksResponse> => {
    if (typeof navigator !== "undefined" && navigator.onLine === false) {
      throw new NotegicFetchError(FetchClientExceptions.MissingNetwork());
    }

    return await mutationFnCreateBlockPacks(request);
  };

  const mutation = useMutation({
    mutationFn: perform,
    onSuccess: async (response, variables) => {
      SessionStorageManipulator.ensureItem(
        SessionStorageKey.csrfToken,
        response.refreshableTokens?.newCSRFToken
      );
      const parentSubShelfIds = (
        variables.affected.parentSubShelfIds || []
      ).filter(Boolean) as UUID[];
      const rootShelfIds = (variables.affected.rootShelfIds || []).filter(
        Boolean
      ) as UUID[];
      const targetKeys: QueryKey[] = [
        ...parentSubShelfIds.flatMap(parentSubShelfId => [
          queryKeys.subShelf.oneById(parentSubShelfId),
          queryKeys.blockPack.manyByParentSubShelfId(parentSubShelfId),
        ]),
        ...rootShelfIds.flatMap(rootShelfId => [
          queryKeys.rootShelf.oneById(rootShelfId),
          queryKeys.blockPack.manyByRootShelfId(rootShelfId),
        ]),
      ];
      Promise.all(
        targetKeys.map(targetKey =>
          queryClient.invalidateQueries({ queryKey: targetKey })
        )
      );
      await BlockPackLocalSynchronizer.syncCreateBlockPacks(
        variables,
        response
      );
    },
    onError: async (error, variables) => {
      if (error instanceof NotegicFetchError) {
        switch (error.unWrap.reason) {
          case ExceptionReasonDictionary.client.fetch.missingNetwork:
            await BlockPackLocalSimulator.simulateCreateBlockPacks(variables);
            break;
        }
      }
    },
  });

  return mutation;
};

export const useUpdateMyBlockPackById = () => {
  const queryClient = getQueryClient();

  const perform = async (
    request: UpdateMyBlockPackByIdRequest
  ): Promise<UpdateMyBlockPackByIdResponse> => {
    if (typeof navigator !== "undefined" && navigator.onLine === false) {
      throw new NotegicFetchError(FetchClientExceptions.MissingNetwork());
    }

    return await mutationFnUpdateMyBlockPackById(request);
  };

  const mutation = useMutation({
    mutationFn: perform,
    onSuccess: async (response, variables) => {
      SessionStorageManipulator.ensureItem(
        SessionStorageKey.csrfToken,
        response.refreshableTokens?.newCSRFToken
      );
      const blockPackId = variables.body.blockPackId as UUID;
      const parentSubShelfId = variables.affected.parentSubShelfId as UUID;
      const rootShelfId = variables.affected.rootShelfId as UUID;
      const targetKeys: QueryKey[] = [
        queryKeys.blockPack.oneById(blockPackId),
        queryKeys.blockPack.manyByParentSubShelfId(parentSubShelfId),
        queryKeys.blockPack.manyByRootShelfId(rootShelfId),
      ];
      Promise.all(
        targetKeys.map(targetKey =>
          queryClient.invalidateQueries({ queryKey: targetKey })
        )
      );
      await BlockPackLocalSynchronizer.syncUpdateMyBlockPackById(
        variables,
        response
      );
    },
    onError: async (error, variables) => {
      if (error instanceof NotegicFetchError) {
        switch (error.unWrap.reason) {
          case ExceptionReasonDictionary.client.fetch.missingNetwork:
            await BlockPackLocalSimulator.simulateUpdateMyBlockPackById(
              variables
            );
            break;
        }
      }
    },
  });

  return mutation;
};

export const useUpdateMyBlockPacksByIds = () => {
  const queryClient = getQueryClient();

  const perform = async (
    request: UpdateMyBlockPacksByIdsRequest
  ): Promise<UpdateMyBlockPacksByIdsResponse> => {
    if (typeof navigator !== "undefined" && navigator.onLine === false) {
      throw new NotegicFetchError(FetchClientExceptions.MissingNetwork());
    }

    return await mutationFnUpdateMyBlockPacksByIds(request);
  };

  const mutation = useMutation({
    mutationFn: perform,
    onSuccess: async (response, variables) => {
      SessionStorageManipulator.ensureItem(
        SessionStorageKey.csrfToken,
        response.refreshableTokens?.newCSRFToken
      );
      const blockPackIds = variables.body.updatedBlockPacks
        .map(updatedBlockPack => updatedBlockPack.blockPackId)
        .filter(Boolean) as UUID[];
      const parentSubShelfIds = (
        variables.affected.parentSubShelfIds || []
      ).filter(Boolean) as UUID[];
      const rootShelfIds = (variables.affected.rootShelfIds || []).filter(
        Boolean
      ) as UUID[];
      const targetKeys: QueryKey[] = [
        ...blockPackIds.flatMap(blockPackId => [
          queryKeys.blockPack.oneById(blockPackId),
        ]),
        ...parentSubShelfIds.map(parentSubShelfId =>
          queryKeys.blockPack.manyByParentSubShelfId(parentSubShelfId)
        ),
        ...rootShelfIds.map(rootShelfId =>
          queryKeys.blockPack.manyByRootShelfId(rootShelfId)
        ),
      ];
      Promise.all(
        targetKeys.map(targetKey =>
          queryClient.invalidateQueries({ queryKey: targetKey })
        )
      );
      await BlockPackLocalSynchronizer.syncUpdateMyBlockPacksByIds(
        variables,
        response
      );
    },
    onError: async (error, variables) => {
      if (error instanceof NotegicFetchError) {
        switch (error.unWrap.reason) {
          case ExceptionReasonDictionary.client.fetch.missingNetwork:
            await BlockPackLocalSimulator.simulateUpdateMyBlockPacksByIds(
              variables
            );
            break;
        }
      }
    },
  });

  return mutation;
};

export const useMoveMyBlockPackById = () => {
  const queryClient = getQueryClient();

  const perform = async (
    request: MoveMyBlockPackByIdRequest
  ): Promise<MoveMyBlockPackByIdResponse> => {
    if (typeof navigator !== "undefined" && navigator.onLine === false) {
      throw new NotegicFetchError(FetchClientExceptions.MissingNetwork());
    }

    return await mutationFnMoveMyBlockPackById(request);
  };

  const mutation = useMutation({
    mutationFn: perform,
    onSuccess: async (response, variables) => {
      SessionStorageManipulator.ensureItem(
        SessionStorageKey.csrfToken,
        response.refreshableTokens?.newCSRFToken
      );
      const blockPackId = variables.body.blockPackId as UUID;
      const destinationParentSubShelfId = variables.body
        .destinationParentSubShelfId as UUID;
      const sourceParentSubShelfId = variables.affected
        .sourceParentSubShelfId as UUID;
      const rootShelfId = variables.affected.rootShelfId as UUID;
      const targetKeys: QueryKey[] = [
        queryKeys.rootShelf.oneById(rootShelfId),
        queryKeys.subShelf.oneById(sourceParentSubShelfId),
        queryKeys.subShelf.oneById(destinationParentSubShelfId),
        queryKeys.blockPack.oneById(blockPackId),
        queryKeys.blockPack.manyByParentSubShelfId(sourceParentSubShelfId),
        queryKeys.blockPack.manyByParentSubShelfId(destinationParentSubShelfId),
        queryKeys.blockPack.manyByRootShelfId(rootShelfId),
      ];
      Promise.all(
        targetKeys.map(targetKey =>
          queryClient.invalidateQueries({ queryKey: targetKey })
        )
      );
      await BlockPackLocalSynchronizer.syncMoveMyBlockPackById(
        variables,
        response
      );
    },
    onError: async (error, variables) => {
      if (error instanceof NotegicFetchError) {
        switch (error.unWrap.reason) {
          case ExceptionReasonDictionary.client.fetch.missingNetwork:
            await BlockPackLocalSimulator.simulateMoveMyBlockPackById(
              variables
            );
            break;
        }
      }
    },
  });

  return mutation;
};

export const useMoveMyBlockPacksByParentSubShelfId = () => {
  const queryClient = getQueryClient();

  const perform = async (
    request: MoveMyBlockPacksByParentSubShelfIdRequest
  ): Promise<MoveMyBlockPacksByParentSubShelfIdResponse> => {
    if (typeof navigator !== "undefined" && navigator.onLine === false) {
      throw new NotegicFetchError(FetchClientExceptions.MissingNetwork());
    }

    return await mutationFnMoveMyBlockPacksByParentSubShelfId(request);
  };

  const mutation = useMutation({
    mutationFn: perform,
    onSuccess: async (response, variables) => {
      SessionStorageManipulator.ensureItem(
        SessionStorageKey.csrfToken,
        response.refreshableTokens?.newCSRFToken
      );
      const blockPackIds = (variables.body.blockPackIds || []).filter(
        Boolean
      ) as UUID[];
      const destinationParentSubShelfId = variables.body
        .destinationParentSubShelfId as UUID;
      const sourceParentSubShelfIds = (
        variables.affected.sourceParentSubShelfIds || []
      ).filter(Boolean) as UUID[];
      const rootShelfId = variables.affected.rootShelfId as UUID;
      const targetKeys: QueryKey[] = [
        queryKeys.rootShelf.oneById(rootShelfId),
        ...sourceParentSubShelfIds.flatMap(sourceParentSubShelfId => [
          queryKeys.subShelf.oneById(sourceParentSubShelfId),
          queryKeys.blockPack.manyByParentSubShelfId(sourceParentSubShelfId),
        ]),
        queryKeys.subShelf.oneById(destinationParentSubShelfId),
        ...blockPackIds.map(blockPackId =>
          queryKeys.blockPack.oneById(blockPackId)
        ),
        queryKeys.blockPack.manyByParentSubShelfId(destinationParentSubShelfId),
        queryKeys.blockPack.manyByRootShelfId(rootShelfId),
      ];
      Promise.all(
        targetKeys.map(targetKey =>
          queryClient.invalidateQueries({ queryKey: targetKey })
        )
      );
      await BlockPackLocalSynchronizer.syncMoveMyBlockPacksByParentSubShelfId(
        variables,
        response
      );
    },
    onError: async (error, variables) => {
      if (error instanceof NotegicFetchError) {
        switch (error.unWrap.reason) {
          case ExceptionReasonDictionary.client.fetch.missingNetwork:
            await BlockPackLocalSimulator.simulateMoveMyBlockPacksByParentSubShelfId(
              variables
            );
            break;
        }
      }
    },
  });

  return mutation;
};

export const useMoveMyBlockPacksByParentSubShelfIds = () => {
  const queryClient = getQueryClient();

  const perform = async (
    request: MoveMyBlockPacksByParentSubShelfIdsRequest
  ): Promise<MoveMyBlockPacksByParentSubShelfIdsResponse> => {
    if (typeof navigator !== "undefined" && navigator.onLine === false) {
      throw new NotegicFetchError(FetchClientExceptions.MissingNetwork());
    }

    return await mutationFnMoveMyBlockPacksByParentSubShelfIds(request);
  };

  const mutation = useMutation({
    mutationFn: perform,
    onSuccess: async (response, variables) => {
      SessionStorageManipulator.ensureItem(
        SessionStorageKey.csrfToken,
        response.refreshableTokens?.newCSRFToken
      );
      const blockPackIds = [] as UUID[];
      const destinationParentSubShelfIds = [] as UUID[];
      for (const movedBlockPack of variables.body.movedBlockPacks) {
        blockPackIds.push(...(movedBlockPack.blockPackIds as UUID[]));
        destinationParentSubShelfIds.push(
          movedBlockPack.destinationParentSubShelfId as UUID
        );
      }
      const sourceParentSubShelfIds = (
        variables.affected.sourceParentSubShelfIds || []
      ).filter(Boolean) as UUID[];
      const rootShelfIds = (variables.affected.rootShelfIds || []).filter(
        Boolean
      ) as UUID[];
      const targetKeys: QueryKey[] = [
        ...sourceParentSubShelfIds.flatMap(sourceParentSubShelfId => [
          queryKeys.subShelf.oneById(sourceParentSubShelfId),
          queryKeys.blockPack.manyByParentSubShelfId(sourceParentSubShelfId),
        ]),
        ...destinationParentSubShelfIds.flatMap(destinationParentSubShelfId => [
          queryKeys.subShelf.oneById(destinationParentSubShelfId),
          ...blockPackIds.map(blockPackId =>
            queryKeys.blockPack.oneById(blockPackId)
          ),
          queryKeys.blockPack.manyByParentSubShelfId(
            destinationParentSubShelfId
          ),
        ]),
        ...rootShelfIds.flatMap(rootShelfId => [
          queryKeys.rootShelf.oneById(rootShelfId),
          queryKeys.blockPack.manyByRootShelfId(rootShelfId),
        ]),
      ];
      Promise.all(
        targetKeys.map(targetKey =>
          queryClient.invalidateQueries({ queryKey: targetKey })
        )
      );
      await BlockPackLocalSynchronizer.syncMoveMyBlockPacksByParentSubShelfIds(
        variables,
        response
      );
    },
    onError: async (error, variables) => {
      if (error instanceof NotegicFetchError) {
        switch (error.unWrap.reason) {
          case ExceptionReasonDictionary.client.fetch.missingNetwork:
            await BlockPackLocalSimulator.simulateMoveMyBlockPacksByParentSubShelfIds(
              variables
            );
            break;
        }
      }
    },
  });

  return mutation;
};

export const useRestoreMyBlockPackById = () => {
  const queryClient = getQueryClient();

  const perform = async (
    request: RestoreMyBlockPackByIdRequest
  ): Promise<RestoreMyBlockPackByIdResponse> => {
    if (typeof navigator !== "undefined" && navigator.onLine === false) {
      throw new NotegicFetchError(FetchClientExceptions.MissingNetwork());
    }

    return await mutationFnRestoreMyBlockPackById(request);
  };

  const mutation = useMutation({
    mutationFn: perform,
    onSuccess: async (response, variables) => {
      SessionStorageManipulator.ensureItem(
        SessionStorageKey.csrfToken,
        response.refreshableTokens?.newCSRFToken
      );
      const blockPackId = variables.body.blockPackId as UUID;
      const parentSubShelfId = variables.affected.parentSubShelfId as UUID;
      const rootShelfId = variables.affected.rootShelfId as UUID;
      const targetKeys: QueryKey[] = [
        queryKeys.rootShelf.oneById(rootShelfId),
        queryKeys.subShelf.oneById(parentSubShelfId),
        queryKeys.blockPack.oneById(blockPackId),
        queryKeys.blockPack.manyByParentSubShelfId(parentSubShelfId),
        queryKeys.blockPack.manyByRootShelfId(rootShelfId),
      ];
      Promise.all(
        targetKeys.map(targetKey =>
          queryClient.invalidateQueries({ queryKey: targetKey })
        )
      );
      await BlockPackLocalSynchronizer.syncRestoreMyBlockPackById(
        variables,
        response
      );
    },
    onError: async (error, variables) => {
      if (error instanceof NotegicFetchError) {
        switch (error.unWrap.reason) {
          case ExceptionReasonDictionary.client.fetch.missingNetwork:
            await BlockPackLocalSimulator.simulateRestoreMyBlockPackById(
              variables
            );
            break;
        }
      }
    },
  });

  return mutation;
};

export const useRestoreMyBlockPacksByIds = () => {
  const queryClient = getQueryClient();

  const perform = async (
    request: RestoreMyBlockPacksByIdsRequest
  ): Promise<RestoreMyBlockPacksByIdsResponse> => {
    if (typeof navigator !== "undefined" && navigator.onLine === false) {
      throw new NotegicFetchError(FetchClientExceptions.MissingNetwork());
    }

    return await mutationFnRestoreMyBlockPacksByIds(request);
  };

  const mutation = useMutation({
    mutationFn: perform,
    onSuccess: async (response, variables) => {
      SessionStorageManipulator.ensureItem(
        SessionStorageKey.csrfToken,
        response.refreshableTokens?.newCSRFToken
      );
      const blockPackIds = (variables.body.blockPackIds || []).filter(
        Boolean
      ) as UUID[];
      const parentSubShelfIds = (
        variables.affected.parentSubShelfIds || []
      ).filter(Boolean) as UUID[];
      const rootShelfIds = (variables.affected.rootShelfIds || []).filter(
        Boolean
      ) as UUID[];
      const targetKeys: QueryKey[] = [
        ...rootShelfIds.flatMap(rootShelfId => [
          queryKeys.rootShelf.oneById(rootShelfId),
          queryKeys.blockPack.manyByRootShelfId(rootShelfId),
        ]),
        ...parentSubShelfIds.flatMap(parentSubShelfId => [
          queryKeys.subShelf.oneById(parentSubShelfId),
          queryKeys.blockPack.manyByParentSubShelfId(parentSubShelfId),
        ]),
        ...blockPackIds.flatMap(blockPackId => [
          queryKeys.blockPack.oneById(blockPackId),
        ]),
      ];
      Promise.all(
        targetKeys.map(targetKey =>
          queryClient.invalidateQueries({ queryKey: targetKey })
        )
      );
      await BlockPackLocalSynchronizer.syncRestoreMyBlockPacksByIds(
        variables,
        response
      );
    },
    onError: async (error, variables) => {
      if (error instanceof NotegicFetchError) {
        switch (error.unWrap.reason) {
          case ExceptionReasonDictionary.client.fetch.missingNetwork:
            await BlockPackLocalSimulator.simulateRestoreMyBlockPacksByIds(
              variables
            );
            break;
        }
      }
    },
  });

  return mutation;
};

export const useDeleteMyBlockPackById = () => {
  const queryClient = getQueryClient();

  const perform = async (
    request: DeleteMyBlockPackByIdRequest
  ): Promise<DeleteMyBlockPackByIdResponse> => {
    if (typeof navigator !== "undefined" && navigator.onLine === false) {
      throw new NotegicFetchError(FetchClientExceptions.MissingNetwork());
    }

    return await mutationFnDeleteMyBlockPackById(request);
  };

  const mutation = useMutation({
    mutationFn: perform,
    onSuccess: async (response, variables) => {
      SessionStorageManipulator.ensureItem(
        SessionStorageKey.csrfToken,
        response.refreshableTokens?.newCSRFToken
      );
      const blockPackId = variables.body.blockPackId as UUID;
      const parentSubShelfId = variables.affected.parentSubShelfId as UUID;
      const rootShelfId = variables.affected.rootShelfId as UUID;
      const targetKeys: QueryKey[] = [
        queryKeys.rootShelf.oneById(rootShelfId),
        queryKeys.subShelf.oneById(parentSubShelfId),
        queryKeys.blockPack.oneById(blockPackId),
        queryKeys.blockPack.manyByParentSubShelfId(parentSubShelfId),
        queryKeys.blockPack.manyByRootShelfId(rootShelfId),
      ];
      Promise.all(
        targetKeys.map(targetKey =>
          queryClient.invalidateQueries({ queryKey: targetKey })
        )
      );
      await BlockPackLocalSynchronizer.syncDeleteMyBlockPackById(
        variables,
        response
      );
    },
    onError: async (error, variables) => {
      if (error instanceof NotegicFetchError) {
        switch (error.unWrap.reason) {
          case ExceptionReasonDictionary.client.fetch.missingNetwork:
            await BlockPackLocalSimulator.simulateDeleteMyBlockPackById(
              variables
            );
            break;
        }
      }
    },
  });

  return mutation;
};

export const useDeleteMyBlockPacksByIds = () => {
  const queryClient = getQueryClient();

  const perform = async (
    request: DeleteMyBlockPacksByIdsRequest
  ): Promise<DeleteMyBlockPacksByIdsResponse> => {
    if (typeof navigator !== "undefined" && navigator.onLine === false) {
      throw new NotegicFetchError(FetchClientExceptions.MissingNetwork());
    }

    return await mutationFnDeleteMyBlockPacksByIds(request);
  };

  const mutation = useMutation({
    mutationFn: perform,
    onSuccess: async (response, variables) => {
      SessionStorageManipulator.ensureItem(
        SessionStorageKey.csrfToken,
        response.refreshableTokens?.newCSRFToken
      );
      const blockPackIds = (variables.body.blockPackIds || []).filter(
        Boolean
      ) as UUID[];
      const parentSubShelfIds = (
        variables.affected.parentSubShelfIds || []
      ).filter(Boolean) as UUID[];
      const rootShelfIds = (variables.affected.rootShelfIds || []).filter(
        Boolean
      ) as UUID[];
      const targetKeys: QueryKey[] = [
        ...rootShelfIds.flatMap(rootShelfId => [
          queryKeys.rootShelf.oneById(rootShelfId),
          queryKeys.blockPack.manyByRootShelfId(rootShelfId),
        ]),
        ...parentSubShelfIds.flatMap(parentSubShelfId => [
          queryKeys.subShelf.oneById(parentSubShelfId),
          queryKeys.blockPack.manyByParentSubShelfId(parentSubShelfId),
        ]),
        ...blockPackIds.flatMap(blockPackId => [
          queryKeys.blockPack.oneById(blockPackId),
        ]),
      ];
      Promise.all(
        targetKeys.map(targetKey =>
          queryClient.invalidateQueries({ queryKey: targetKey })
        )
      );
      await BlockPackLocalSynchronizer.syncDeleteMyBlockPacksByIds(
        variables,
        response
      );
    },
    onError: async (error, variables) => {
      if (error instanceof NotegicFetchError) {
        switch (error.unWrap.reason) {
          case ExceptionReasonDictionary.client.fetch.missingNetwork:
            await BlockPackLocalSimulator.simulateDeleteMyBlockPacksByIds(
              variables
            );
            break;
        }
      }
    },
  });

  return mutation;
};
