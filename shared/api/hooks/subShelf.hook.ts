import type { UUID } from "node:crypto";
import { NotegicFetchError } from "@shared/api/exceptions/errors/fetch.error";
import { NotegicValidationError } from "@shared/api/exceptions/errors/validation.error";
import {
  ExceptionReasonDictionary,
  NotegicAPIError,
} from "@shared/api/exceptions";
import { FetchClientExceptions } from "@shared/api/exceptions/client/fetch.exception";
import { ValidationClientException } from "@shared/api/exceptions/client/validation.exception";
import type {
  MoveMySubShelvesByRootShelfIdsRequest,
  MoveMySubShelvesByRootShelfIdsResponse,
  CreateSubShelfByRootShelfIdRequest,
  CreateSubShelfByRootShelfIdResponse,
  CreateSubShelvesByRootShelfIdsRequest,
  CreateSubShelvesByRootShelfIdsResponse,
  DeleteMySubShelfByIdRequest,
  DeleteMySubShelfByIdResponse,
  DeleteMySubShelvesByIdsRequest,
  DeleteMySubShelvesByIdsResponse,
  GetAllMySubShelvesByRootShelfIdRequest,
  GetAllMySubShelvesByRootShelfIdResponse,
  GetMySubShelfByIdRequest,
  GetMySubShelfByIdResponse,
  GetMySubShelvesAndItemsByPrevSubShelfIdRequest,
  GetMySubShelvesAndItemsByPrevSubShelfIdResponse,
  GetMySubShelvesByPrevSubShelfIdRequest,
  GetMySubShelvesByPrevSubShelfIdResponse,
  MoveMySubShelfRequest,
  MoveMySubShelfResponse,
  MoveMySubShelvesByRootShelfIdRequest,
  MoveMySubShelvesByRootShelfIdResponse,
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
  mutationFnMoveMySubShelvesByRootShelfIds,
  mutationFnCreateSubShelfByRootShelfId,
  mutationFnCreateSubShelvesByRootShelfIds,
  mutationFnDeleteMySubShelfById,
  mutationFnDeleteMySubShelvesByIds,
  mutationFnMoveMySubShelf,
  mutationFnMoveMySubShelvesByRootShelfId,
  mutationFnRestoreMySubShelfById,
  mutationFnRestoreMySubShelvesByIds,
  mutationFnUpdateMySubShelfById,
  mutationFnUpdateMySubShelvesByIds,
  queryFnGetAllMySubShelvesByRootShelfId,
  queryFnGetMySubShelfById,
  queryFnGetMySubShelvesAndItemsByPrevSubShelfId,
  queryFnGetMySubShelvesByPrevSubShelfId,
} from "@shared/api/invokers/subShelf.invoker";
import { SubShelfLocalSimulator } from "@shared/api/local/simulators/subShelf.simulator";
import { SubShelfLocalSynchronizer } from "@shared/api/local/synchronizers/subShelf.synchronizer";
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

export const useGetMySubShelfById = (
  hookRequest?: GetMySubShelfByIdRequest,
  options?: Partial<UseQueryOptions<GetMySubShelfByIdResponse, Error>>,
) => {
  const queryClient = getQueryClient();

  const perform = async (
    request?: GetMySubShelfByIdRequest,
  ): Promise<GetMySubShelfByIdResponse> => {
    if (!request) {
      throw new NotegicValidationError(
        ValidationClientException.ReceivedUndefinedRequest(),
      );
    }

    try {
      if (typeof navigator !== "undefined" && navigator.onLine === false) {
        throw new NotegicFetchError(FetchClientExceptions.MissingNetwork());
      }

      const response = await queryFnGetMySubShelfById(request);
      SessionStorageManipulator.ensureItem(
        SessionStorageKey.csrfToken,
        response.refreshableTokens?.newCSRFToken,
      );
      await SubShelfLocalSynchronizer.syncGetMySubShelfById(response);
      return response;
    } catch (error) {
      if (
        error instanceof NotegicAPIError ||
        error instanceof NotegicFetchError
      ) {
        const existingSubShelf =
          await SubShelfLocalSimulator.simulateGetMySubShelfById(request);
        return {
          success: false,
          data: existingSubShelf,
          exception: error.unWrap,
          embedded: { publicId: "" },
        } as GetMySubShelfByIdResponse;
      }

      throw error;
    }
  };

  const query = useQuery<GetMySubShelfByIdResponse, Error>({
    queryKey: queryKeys.subShelf.oneById(
      hookRequest?.param.subShelfId as UUID | undefined,
      hookRequest?.param.isDeleted ?? false,
    ),
    queryFn: async () => perform(hookRequest),
    staleTime: UseQueryDefaultOptions.staleTime,
    refetchOnWindowFocus: UseQueryDefaultOptions.refetchOnWindowFocus,
    refetchOnMount: UseQueryDefaultOptions.refetchOnMount,
    ...options,
    enabled: hookRequest ? (options?.enabled ?? true) : false,
  });

  const fetch = async (
    callbackRequest: GetMySubShelfByIdRequest,
  ): Promise<GetMySubShelfByIdResponse> => {
    return queryClient.fetchQuery({
      queryKey: queryKeys.subShelf.oneById(
        callbackRequest.param.subShelfId as UUID | undefined,
        callbackRequest.param.isDeleted ?? false,
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
  >,
) => {
  const queryClient = getQueryClient();

  const perform = async (
    request?: GetMySubShelvesByPrevSubShelfIdRequest,
  ): Promise<GetMySubShelvesByPrevSubShelfIdResponse> => {
    if (!request) {
      throw new NotegicValidationError(
        ValidationClientException.ReceivedUndefinedRequest(),
      );
    }

    try {
      if (typeof navigator !== "undefined" && navigator.onLine === false) {
        throw new NotegicFetchError(FetchClientExceptions.MissingNetwork());
      }

      const response = await queryFnGetMySubShelvesByPrevSubShelfId(request);
      SessionStorageManipulator.ensureItem(
        SessionStorageKey.csrfToken,
        response.refreshableTokens?.newCSRFToken,
      );
      await SubShelfLocalSynchronizer.syncGetMySubShelvesByPrevSubShelfId(
        response,
      );
      return response;
    } catch (error) {
      if (
        error instanceof NotegicAPIError ||
        error instanceof NotegicFetchError
      ) {
        const existingSubShelves =
          await SubShelfLocalSimulator.simulateGetMySubShelvesByPrevSubShelfId(
            request,
          );
        return {
          success: false,
          data: existingSubShelves,
          exception: error.unWrap,
          embedded: { publicId: "" },
        } as GetMySubShelvesByPrevSubShelfIdResponse;
      }

      throw error;
    }
  };

  const query = useQuery<GetMySubShelvesByPrevSubShelfIdResponse, Error>({
    queryKey: queryKeys.subShelf.manyByPrevSubShelfId(
      hookRequest?.param.prevSubShelfId as UUID | undefined,
      hookRequest?.param.areDeleted ?? false,
    ),
    queryFn: async () => perform(hookRequest),
    staleTime: UseQueryDefaultOptions.staleTime,
    refetchOnWindowFocus: UseQueryDefaultOptions.refetchOnWindowFocus,
    refetchOnMount: UseQueryDefaultOptions.refetchOnMount,
    ...options,
    enabled: hookRequest ? (options?.enabled ?? true) : false,
  });

  const fetch = async (
    callbackRequest: GetMySubShelvesByPrevSubShelfIdRequest,
  ): Promise<GetMySubShelvesByPrevSubShelfIdResponse> => {
    return queryClient.fetchQuery({
      queryKey: queryKeys.subShelf.manyByPrevSubShelfId(
        callbackRequest.param.prevSubShelfId as UUID | undefined,
        callbackRequest.param.areDeleted ?? false,
      ),
      queryFn: async () => perform(callbackRequest),
      staleTime: UseQueryDefaultOptions.staleTime,
      ...options,
    });
  };

  return { ...query, fetch };
};

export const useGetAllMySubShelvesByRootShelfId = (
  hookRequest?: GetAllMySubShelvesByRootShelfIdRequest,
  options?: Partial<
    UseQueryOptions<GetAllMySubShelvesByRootShelfIdResponse, Error>
  >,
) => {
  const queryClient = getQueryClient();

  const perform = async (
    request?: GetAllMySubShelvesByRootShelfIdRequest,
  ): Promise<GetAllMySubShelvesByRootShelfIdResponse> => {
    if (!request) {
      throw new NotegicValidationError(
        ValidationClientException.ReceivedUndefinedRequest(),
      );
    }

    try {
      if (typeof navigator !== "undefined" && navigator.onLine === false) {
        throw new NotegicFetchError(FetchClientExceptions.MissingNetwork());
      }

      const response = await queryFnGetAllMySubShelvesByRootShelfId(request);
      SessionStorageManipulator.ensureItem(
        SessionStorageKey.csrfToken,
        response.refreshableTokens?.newCSRFToken,
      );
      await SubShelfLocalSynchronizer.syncGetAllMySubShelvesByRootShelfId(
        response,
      );
      return response;
    } catch (error) {
      if (
        error instanceof NotegicAPIError ||
        error instanceof NotegicFetchError
      ) {
        const existingSubShelves =
          await SubShelfLocalSimulator.simulateGetAllMySubShelvesByRootShelfId(
            request,
          );
        return {
          success: false,
          data: existingSubShelves,
          exception: error.unWrap,
          embedded: { publicId: "" },
        } as GetAllMySubShelvesByRootShelfIdResponse;
      }

      throw error;
    }
  };

  const query = useQuery<GetAllMySubShelvesByRootShelfIdResponse, Error>({
    queryKey: queryKeys.subShelf.manyByRootShelfId(
      hookRequest?.param.rootShelfId as UUID | undefined,
      hookRequest?.param.areDeleted ?? false,
    ),
    queryFn: async () => perform(hookRequest),
    staleTime: options?.staleTime ?? UseQueryDefaultOptions.staleTime,
    refetchOnWindowFocus: UseQueryDefaultOptions.refetchOnWindowFocus,
    refetchOnMount: UseQueryDefaultOptions.refetchOnMount,
    ...options,
    enabled: hookRequest ? (options?.enabled ?? true) : false,
  });

  const fetch = async (
    callbackRequest: GetAllMySubShelvesByRootShelfIdRequest,
  ): Promise<GetAllMySubShelvesByRootShelfIdResponse> => {
    return queryClient.fetchQuery({
      queryKey: queryKeys.subShelf.manyByRootShelfId(
        callbackRequest.param.rootShelfId as UUID | undefined,
        callbackRequest.param.areDeleted ?? false,
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
  >,
) => {
  const queryClient = getQueryClient();

  const perform = async (
    request?: GetMySubShelvesAndItemsByPrevSubShelfIdRequest,
  ): Promise<GetMySubShelvesAndItemsByPrevSubShelfIdResponse> => {
    if (!request) {
      throw new NotegicValidationError(
        ValidationClientException.ReceivedUndefinedRequest(),
      );
    }

    try {
      if (typeof navigator !== "undefined" && navigator.onLine === false) {
        throw new NotegicFetchError(FetchClientExceptions.MissingNetwork());
      }

      const response =
        await queryFnGetMySubShelvesAndItemsByPrevSubShelfId(request);
      SessionStorageManipulator.ensureItem(
        SessionStorageKey.csrfToken,
        response.refreshableTokens?.newCSRFToken,
      );
      await SubShelfLocalSynchronizer.syncGetMySubShelvesAndItemsByPrevSubShelfId(
        response,
      );
      return response;
    } catch (error) {
      if (
        error instanceof NotegicAPIError ||
        error instanceof NotegicFetchError
      ) {
        const existing =
          await SubShelfLocalSimulator.simulateGetMySubShelvesAndItemsByPrevSubShelfId(
            request,
          );
        return {
          success: false,
          data: existing,
          exception: error.unWrap,
          embedded: { publicId: "" },
        } as GetMySubShelvesAndItemsByPrevSubShelfIdResponse;
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
      hookRequest?.param.areDeleted ?? false,
    ),
    queryFn: async () => perform(hookRequest),
    staleTime: UseQueryDefaultOptions.staleTime,
    refetchOnWindowFocus: UseQueryDefaultOptions.refetchOnWindowFocus,
    refetchOnMount: UseQueryDefaultOptions.refetchOnMount,
    ...options,
    enabled: hookRequest ? (options?.enabled ?? true) : false,
  });

  const fetch = async (
    callbackRequest: GetMySubShelvesAndItemsByPrevSubShelfIdRequest,
  ): Promise<GetMySubShelvesAndItemsByPrevSubShelfIdResponse> => {
    return queryClient.fetchQuery({
      queryKey: queryKeys.subShelf.manyByPrevSubShelfId(
        callbackRequest.param.prevSubShelfId as UUID | undefined,
        callbackRequest.param.areDeleted ?? false,
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
    request: CreateSubShelfByRootShelfIdRequest,
  ): Promise<CreateSubShelfByRootShelfIdResponse> => {
    if (typeof navigator !== "undefined" && navigator.onLine === false) {
      throw new NotegicFetchError(FetchClientExceptions.MissingNetwork());
    }

    return await mutationFnCreateSubShelfByRootShelfId(request);
  };

  const mutation = useMutation({
    mutationFn: perform,
    onSuccess: async (response, request) => {
      if (response.success === false) return;
      SessionStorageManipulator.ensureItem(
        SessionStorageKey.csrfToken,
        response.refreshableTokens?.newCSRFToken,
      );
      const prevSubShelfId = request.affected.prevSubShelfId as UUID;
      const rootShelfId = request.affected.rootShelfId as UUID;
      const targetKeys: QueryKey[] = [
        queryKeys.rootShelf.oneById(rootShelfId),
        queryKeys.subShelf.manyByPrevSubShelfId(prevSubShelfId),
        queryKeys.subShelf.manyByRootShelfId(rootShelfId),
      ];
      Promise.all(
        targetKeys.map((targetKey) =>
          queryClient.invalidateQueries({ queryKey: targetKey }),
        ),
      );
      await SubShelfLocalSynchronizer.syncCreateSubShelfByRootShelfId(
        request,
        response,
      );
    },
    onError: async (error, request) => {
      if (error instanceof NotegicFetchError) {
        switch (error.unWrap.reason) {
          case ExceptionReasonDictionary.client.fetch.missingNetwork:
            await SubShelfLocalSimulator.simulateCreateSubShelfByRootShelfId(
              request,
            );
            break;
        }
      }
    },
  });

  return mutation;
};

export const useCreateSubShelvesByRootShelfIds = () => {
  const queryClient = getQueryClient();

  const perform = async (
    request: CreateSubShelvesByRootShelfIdsRequest,
  ): Promise<CreateSubShelvesByRootShelfIdsResponse> => {
    if (typeof navigator !== "undefined" && navigator.onLine === false) {
      throw new NotegicFetchError(FetchClientExceptions.MissingNetwork());
    }

    return await mutationFnCreateSubShelvesByRootShelfIds(request);
  };

  const mutation = useMutation({
    mutationFn: perform,
    onSuccess: async (response, request) => {
      if (response.success === false) return;
      SessionStorageManipulator.ensureItem(
        SessionStorageKey.csrfToken,
        response.refreshableTokens?.newCSRFToken,
      );
      const prevSubShelfIds = request.affected
        .prevSubShelfIds as (UUID | null)[];
      const rootShelfIds = request.affected.rootShelfIds as UUID[];
      const targetKeys: QueryKey[] = [
        ...rootShelfIds.flatMap((rootShelfId) => [
          queryKeys.rootShelf.oneById(rootShelfId),
          queryKeys.subShelf.manyByRootShelfId(rootShelfId),
        ]),
        ...prevSubShelfIds.map((prevSubShelfId) =>
          queryKeys.subShelf.manyByPrevSubShelfId(prevSubShelfId),
        ),
      ];
      Promise.all(
        targetKeys.map((targetKey) =>
          queryClient.invalidateQueries({ queryKey: targetKey }),
        ),
      );
      await SubShelfLocalSynchronizer.syncCreateSubShelvesByRootShelfIds(
        request,
        response,
      );
    },
    onError: async (error, request) => {
      if (error instanceof NotegicFetchError) {
        switch (error.unWrap.reason) {
          case ExceptionReasonDictionary.client.fetch.missingNetwork:
            await SubShelfLocalSimulator.simulateCreateSubShelvesByRootShelfIds(
              request,
            );
            break;
        }
      }
    },
  });

  return mutation;
};

export const useUpdateMySubShelfById = () => {
  const queryClient = getQueryClient();

  const perform = async (
    request: UpdateMySubShelfByIdRequest,
  ): Promise<UpdateMySubShelfByIdResponse> => {
    if (typeof navigator !== "undefined" && navigator.onLine === false) {
      throw new NotegicFetchError(FetchClientExceptions.MissingNetwork());
    }

    return await mutationFnUpdateMySubShelfById(request);
  };

  const mutation = useMutation({
    mutationFn: perform,
    onSuccess: async (response, request) => {
      if (response.success === false) return;
      SessionStorageManipulator.ensureItem(
        SessionStorageKey.csrfToken,
        response.refreshableTokens?.newCSRFToken,
      );
      const prevSubShelfId = request.affected.prevSubShelfId as UUID;
      const rootShelfId = request.affected.rootShelfId as UUID;
      const targetKeys: QueryKey[] = [
        queryKeys.rootShelf.oneById(rootShelfId),
        queryKeys.subShelf.manyByPrevSubShelfId(prevSubShelfId),
        queryKeys.subShelf.manyByRootShelfId(rootShelfId),
      ];
      Promise.all(
        targetKeys.map((targetKey) =>
          queryClient.invalidateQueries({ queryKey: targetKey }),
        ),
      );
      await SubShelfLocalSynchronizer.syncUpdateMySubShelfById(
        request,
        response,
      );
    },
    onError: async (error, request) => {
      if (error instanceof NotegicFetchError) {
        switch (error.unWrap.reason) {
          case ExceptionReasonDictionary.client.fetch.missingNetwork:
            await SubShelfLocalSimulator.simulateUpdateMySubShelfById(request);
            break;
        }
      }
    },
  });

  return mutation;
};
export const useUpdateMySubShelvesByIds = () => {
  const queryClient = getQueryClient();

  const perform = async (
    request: UpdateMySubShelvesByIdsRequest,
  ): Promise<UpdateMySubShelvesByIdsResponse> => {
    if (typeof navigator !== "undefined" && navigator.onLine === false) {
      throw new NotegicFetchError(FetchClientExceptions.MissingNetwork());
    }

    return await mutationFnUpdateMySubShelvesByIds(request);
  };

  const mutation = useMutation({
    mutationFn: perform,
    onSuccess: async (response, request) => {
      if (response.success === false) return;
      SessionStorageManipulator.ensureItem(
        SessionStorageKey.csrfToken,
        response.refreshableTokens?.newCSRFToken,
      );
      const prevSubShelfIds = request.affected
        .prevSubShelfIds as (UUID | null)[];
      const rootShelfIds = request.affected.rootShelfIds as UUID[];
      const targetKeys: QueryKey[] = [
        ...rootShelfIds.flatMap((rootShelfId) => [
          queryKeys.rootShelf.oneById(rootShelfId),
          queryKeys.subShelf.manyByRootShelfId(rootShelfId),
        ]),
        ...prevSubShelfIds.map((prevSubShelfId) =>
          queryKeys.subShelf.manyByPrevSubShelfId(prevSubShelfId),
        ),
      ];
      Promise.all(
        targetKeys.map((targetKey) =>
          queryClient.invalidateQueries({ queryKey: targetKey }),
        ),
      );
      await SubShelfLocalSynchronizer.syncUpdateMySubShelvesByIds(
        request,
        response,
      );
    },
    onError: async (error, request) => {
      if (error instanceof NotegicFetchError) {
        switch (error.unWrap.reason) {
          case ExceptionReasonDictionary.client.fetch.missingNetwork:
            await SubShelfLocalSimulator.simulateUpdateMySubShelvesByIds(
              request,
            );
            break;
        }
      }
    },
  });

  return mutation;
};

export const useMoveMySubShelf = () => {
  const queryClient = getQueryClient();
  const perform = async (
    request: MoveMySubShelfRequest,
  ): Promise<MoveMySubShelfResponse> => {
    if (typeof navigator !== "undefined" && navigator.onLine === false) {
      throw new NotegicFetchError(FetchClientExceptions.MissingNetwork());
    }

    return await mutationFnMoveMySubShelf(request);
  };

  const mutation = useMutation({
    mutationFn: perform,
    onSuccess: async (response, request) => {
      if (response.success === false) return;
      SessionStorageManipulator.ensureItem(
        SessionStorageKey.csrfToken,
        response.refreshableTokens?.newCSRFToken,
      );
      const sourceSubShelfId = request.body.sourceSubShelfId as UUID;
      const destinationSubShelfId = request.body
        .destinationSubShelfId as UUID | null;
      const rootShelfId = request.affected.rootShelfId as UUID;
      const childSubShelfIds = (request.affected.childSubShelfIds || []).filter(
        Boolean,
      ) as UUID[];
      const targetKeys: QueryKey[] = [
        queryKeys.rootShelf.oneById(rootShelfId),
        ...childSubShelfIds.map((childSubShelfId) =>
          queryKeys.subShelf.oneById(childSubShelfId),
        ),
        queryKeys.subShelf.oneById(sourceSubShelfId),
        queryKeys.subShelf.manyByPrevSubShelfId(destinationSubShelfId),
        queryKeys.subShelf.manyByRootShelfId(rootShelfId),
      ];
      Promise.all(
        targetKeys.map((targetKey) =>
          queryClient.invalidateQueries({ queryKey: targetKey }),
        ),
      );
      await SubShelfLocalSynchronizer.syncMoveMySubShelf(request, response);
    },
    onError: async (error, request) => {
      if (error instanceof NotegicFetchError) {
        switch (error.unWrap.reason) {
          case ExceptionReasonDictionary.client.fetch.missingNetwork:
            await SubShelfLocalSimulator.simulateMoveMySubShelf(request);
            break;
        }
      }
    },
  });

  return mutation;
};

export const useMoveMySubShelvesByRootShelfId = () => {
  const queryClient = getQueryClient();

  const perform = async (
    request: MoveMySubShelvesByRootShelfIdRequest,
  ): Promise<MoveMySubShelvesByRootShelfIdResponse> => {
    if (typeof navigator !== "undefined" && navigator.onLine === false) {
      throw new NotegicFetchError(FetchClientExceptions.MissingNetwork());
    }

    return await mutationFnMoveMySubShelvesByRootShelfId(request);
  };

  const mutation = useMutation({
    mutationFn: perform,
    onSuccess: async (response, request) => {
      if (response.success === false) return;
      SessionStorageManipulator.ensureItem(
        SessionStorageKey.csrfToken,
        response.refreshableTokens?.newCSRFToken,
      );
      const sourceSubShelfIds = (request.body.sourceSubShelfIds || []).filter(
        Boolean,
      ) as UUID[];
      const destinationSubShelfId = request.body.destinationSubShelfId as UUID;
      const rootShelfIds = (request.affected.rootShelfIds || []).filter(
        Boolean,
      ) as UUID[];
      const childSubShelfIds = (request.affected.childSubShelfIds || []).filter(
        Boolean,
      ) as UUID[];
      const targetKeys: QueryKey[] = [
        ...rootShelfIds.flatMap((rootShelfId) => [
          queryKeys.rootShelf.oneById(rootShelfId),
          queryKeys.subShelf.manyByRootShelfId(rootShelfId),
        ]),
        ...sourceSubShelfIds.map((sourceSubShelfId) =>
          queryKeys.subShelf.oneById(sourceSubShelfId),
        ),
        queryKeys.subShelf.manyByPrevSubShelfId(destinationSubShelfId),
        ...childSubShelfIds.map((childSubShelfId) =>
          queryKeys.subShelf.oneById(childSubShelfId),
        ),
      ];
      Promise.all(
        targetKeys.map((targetKey) =>
          queryClient.invalidateQueries({ queryKey: targetKey }),
        ),
      );
      await SubShelfLocalSynchronizer.syncMoveMySubShelvesByRootShelfId(
        request,
        response,
      );
    },
    onError: async (error, request) => {
      if (error instanceof NotegicFetchError) {
        switch (error.unWrap.reason) {
          case ExceptionReasonDictionary.client.fetch.missingNetwork:
            await SubShelfLocalSimulator.simulateMoveMySubShelvesByRootShelfId(
              request,
            );
            break;
        }
      }
    },
  });

  return mutation;
};

export const useMoveMySubShelvesByRootShelfIds = () => {
  const queryClient = getQueryClient();

  const perform = async (
    request: MoveMySubShelvesByRootShelfIdsRequest,
  ): Promise<MoveMySubShelvesByRootShelfIdsResponse> => {
    if (typeof navigator !== "undefined" && navigator.onLine === false) {
      throw new NotegicFetchError(FetchClientExceptions.MissingNetwork());
    }

    return await mutationFnMoveMySubShelvesByRootShelfIds(request);
  };

  const mutation = useMutation({
    mutationFn: perform,
    onSuccess: async (response, request) => {
      if (response.success === false) return;
      SessionStorageManipulator.ensureItem(
        SessionStorageKey.csrfToken,
        response.refreshableTokens?.newCSRFToken,
      );
      const sourceSubShelfIds = [] as UUID[];
      const destinationSubShelfIds = [] as UUID[];
      for (const movedSubShelf of request.body.moveSubShelves) {
        sourceSubShelfIds.push(...(movedSubShelf.sourceSubShelfIds as UUID[]));
        destinationSubShelfIds.push(
          movedSubShelf.destinationSubShelfId as UUID,
        );
      }
      const rootShelfIds = (request.affected.rootShelfIds || []).filter(
        Boolean,
      ) as UUID[];
      const childSubShelfIds = (request.affected.childSubShelfIds || []).filter(
        Boolean,
      ) as UUID[];
      const targetKeys: QueryKey[] = [
        ...rootShelfIds.flatMap((rootShelfId) => [
          queryKeys.rootShelf.oneById(rootShelfId),
          queryKeys.subShelf.manyByRootShelfId(rootShelfId),
        ]),
        ...sourceSubShelfIds.map((sourceSubShelfId) =>
          queryKeys.subShelf.oneById(sourceSubShelfId),
        ),
        ...destinationSubShelfIds.map((destinationSubShelfId) =>
          queryKeys.subShelf.manyByPrevSubShelfId(destinationSubShelfId),
        ),
        ...childSubShelfIds.map((childSubShelfId) =>
          queryKeys.subShelf.oneById(childSubShelfId),
        ),
      ];
      Promise.all(
        targetKeys.map((targetKey) =>
          queryClient.invalidateQueries({ queryKey: targetKey }),
        ),
      );
      await SubShelfLocalSynchronizer.syncMoveMySubShelvesByRootShelfIds(
        request,
        response,
      );
    },
    onError: async (error, request) => {
      if (error instanceof NotegicFetchError) {
        switch (error.unWrap.reason) {
          case ExceptionReasonDictionary.client.fetch.missingNetwork:
            await SubShelfLocalSimulator.simulateMoveMySubShelvesByRootShelfIds(
              request,
            );
            break;
        }
      }
    },
  });

  return mutation;
};

export const useRestoreMySubShelfById = () => {
  const queryClient = getQueryClient();

  const perform = async (
    request: RestoreMySubShelfByIdRequest,
  ): Promise<RestoreMySubShelfByIdResponse> => {
    if (typeof navigator !== "undefined" && navigator.onLine === false) {
      throw new NotegicFetchError(FetchClientExceptions.MissingNetwork());
    }

    return await mutationFnRestoreMySubShelfById(request);
  };

  const mutation = useMutation({
    mutationFn: perform,
    onSuccess: async (response, request) => {
      if (response.success === false) return;
      SessionStorageManipulator.ensureItem(
        SessionStorageKey.csrfToken,
        response.refreshableTokens?.newCSRFToken,
      );
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
        targetKeys.map((targetKey) =>
          queryClient.invalidateQueries({ queryKey: targetKey }),
        ),
      );
      await SubShelfLocalSynchronizer.syncRestoreMySubShelfById(
        request,
        response,
      );
    },
    onError: async (error, request) => {
      if (error instanceof NotegicFetchError) {
        switch (error.unWrap.reason) {
          case ExceptionReasonDictionary.client.fetch.missingNetwork:
            await SubShelfLocalSimulator.simulateRestoreMySubShelfById(request);
            break;
        }
      }
    },
  });

  return mutation;
};
export const useRestoreMySubShelvesByIds = () => {
  const queryClient = getQueryClient();

  const perform = async (
    request: RestoreMySubShelvesByIdsRequest,
  ): Promise<RestoreMySubShelvesByIdsResponse> => {
    if (typeof navigator !== "undefined" && navigator.onLine === false) {
      throw new NotegicFetchError(FetchClientExceptions.MissingNetwork());
    }

    return await mutationFnRestoreMySubShelvesByIds(request);
  };

  const mutation = useMutation({
    mutationFn: perform,
    onSuccess: async (response, request) => {
      if (response.success === false) return;
      SessionStorageManipulator.ensureItem(
        SessionStorageKey.csrfToken,
        response.refreshableTokens?.newCSRFToken,
      );
      const subShelfIds = (request.body.subShelfIds || []).filter(
        Boolean,
      ) as UUID[];
      const rootShelfIds = (request.affected.rootShelfIds || []).filter(
        Boolean,
      ) as UUID[];
      const prevSubShelfIds = (request.affected.prevSubShelfIds || []).filter(
        Boolean,
      ) as UUID[];
      const targetKeys: QueryKey[] = [
        ...rootShelfIds.flatMap((rootShelfId) => [
          queryKeys.rootShelf.oneById(rootShelfId),
          queryKeys.subShelf.manyByRootShelfId(rootShelfId),
        ]),
        ...subShelfIds.flatMap((subShelfId) => [
          queryKeys.subShelf.oneById(subShelfId),
          queryKeys.material.manyByParentSubShelfId(subShelfId),
        ]),
        ...prevSubShelfIds.map((prevSubShelfId) =>
          queryKeys.subShelf.manyByPrevSubShelfId(prevSubShelfId),
        ),
      ];
      Promise.all(
        targetKeys.map((targetKey) =>
          queryClient.invalidateQueries({ queryKey: targetKey }),
        ),
      );
      await SubShelfLocalSynchronizer.syncRestoreMySubShelvesByIds(
        request,
        response,
      );
    },
    onError: async (error, request) => {
      if (error instanceof NotegicFetchError) {
        switch (error.unWrap.reason) {
          case ExceptionReasonDictionary.client.fetch.missingNetwork:
            await SubShelfLocalSimulator.simulateRestoreMySubShelvesByIds(
              request,
            );
            break;
        }
      }
    },
  });

  return mutation;
};

export const useDeleteMySubShelfById = () => {
  const queryClient = getQueryClient();

  const perform = async (
    request: DeleteMySubShelfByIdRequest,
  ): Promise<DeleteMySubShelfByIdResponse> => {
    if (typeof navigator !== "undefined" && navigator.onLine === false) {
      throw new NotegicFetchError(FetchClientExceptions.MissingNetwork());
    }

    return await mutationFnDeleteMySubShelfById(request);
  };

  const mutation = useMutation({
    mutationFn: perform,
    onSuccess: async (response, request) => {
      if (response.success === false) return;
      SessionStorageManipulator.ensureItem(
        SessionStorageKey.csrfToken,
        response.refreshableTokens?.newCSRFToken,
      );
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
        targetKeys.map((targetKey) =>
          queryClient.invalidateQueries({ queryKey: targetKey }),
        ),
      );
      await SubShelfLocalSynchronizer.syncDeleteMySubShelfById(
        request,
        response,
      );
    },
    onError: async (error, request) => {
      if (error instanceof NotegicFetchError) {
        switch (error.unWrap.reason) {
          case ExceptionReasonDictionary.client.fetch.missingNetwork:
            await SubShelfLocalSimulator.simulateDeleteMySubShelfById(request);
            break;
        }
      }
    },
  });

  return mutation;
};

export const useDeleteMySubShelvesByIds = () => {
  const queryClient = getQueryClient();

  const perform = async (
    request: DeleteMySubShelvesByIdsRequest,
  ): Promise<DeleteMySubShelvesByIdsResponse> => {
    if (typeof navigator !== "undefined" && navigator.onLine === false) {
      throw new NotegicFetchError(FetchClientExceptions.MissingNetwork());
    }

    return await mutationFnDeleteMySubShelvesByIds(request);
  };

  const mutation = useMutation({
    mutationFn: perform,
    onSuccess: async (response, request) => {
      if (response.success === false) return;
      SessionStorageManipulator.ensureItem(
        SessionStorageKey.csrfToken,
        response.refreshableTokens?.newCSRFToken,
      );
      const subShelfIds = (request.body.subShelfIds || []).filter(
        Boolean,
      ) as UUID[];
      const rootShelfIds = (request.affected.rootShelfIds || []).filter(
        Boolean,
      ) as UUID[];
      const prevSubShelfIds = (request.affected.prevSubShelfIds || []).filter(
        Boolean,
      ) as UUID[];
      const targetKeys: QueryKey[] = [
        ...rootShelfIds.flatMap((rootShelfId) => [
          queryKeys.rootShelf.oneById(rootShelfId),
          queryKeys.subShelf.manyByRootShelfId(rootShelfId),
        ]),
        ...subShelfIds.flatMap((subShelfId) => [
          queryKeys.subShelf.oneById(subShelfId),
          queryKeys.material.manyByParentSubShelfId(subShelfId),
        ]),
        ...prevSubShelfIds.map((prevSubShelfId) =>
          queryKeys.subShelf.manyByPrevSubShelfId(prevSubShelfId),
        ),
      ];
      Promise.all(
        targetKeys.map((targetKey) =>
          queryClient.invalidateQueries({ queryKey: targetKey }),
        ),
      );
      await SubShelfLocalSynchronizer.syncDeleteMySubShelvesByIds(
        request,
        response,
      );
    },
    onError: async (error, request) => {
      if (error instanceof NotegicFetchError) {
        switch (error.unWrap.reason) {
          case ExceptionReasonDictionary.client.fetch.missingNetwork:
            await SubShelfLocalSimulator.simulateDeleteMySubShelvesByIds(
              request,
            );
            break;
        }
      }
    },
  });

  return mutation;
};
