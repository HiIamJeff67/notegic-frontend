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
  CreateRootShelfRequest,
  CreateRootShelfResponse,
  CreateRootShelvesRequest,
  CreateRootShelvesResponse,
  DeleteRootShelfPermissionsRequest,
  DeleteRootShelfPermissionsResponse,
  DeleteMyRootShelfByIdRequest,
  DeleteMyRootShelfByIdResponse,
  DeleteMyRootShelvesByIdsRequest,
  DeleteMyRootShelvesByIdsResponse,
  GetMyRootShelfByIdRequest,
  GetMyRootShelfByIdResponse,
  RestoreMyRootShelfByIdRequest,
  RestoreMyRootShelfByIdResponse,
  RestoreMyRootShelvesByIdsRequest,
  RestoreMyRootShelvesByIdsResponse,
  UpdateMyRootShelfByIdRequest,
  UpdateMyRootShelfByIdResponse,
  UpdateMyRootShelvesByIdsRequest,
  UpdateMyRootShelvesByIdsResponse,
  UpsertRootShelfPermissionRequest,
  UpsertRootShelfPermissionResponse,
  LeaveMyRootShelfRequest,
  LeaveMyRootShelfResponse,
  TransferMyRootShelfOwnershipRequest,
  TransferMyRootShelfOwnershipResponse,
} from "@shared/api/interfaces/rootShelf.interface";
import {
  mutationFnCreateRootShelf,
  mutationFnCreateRootShelves,
  mutationFnDeleteRootShelfPermissions,
  mutationFnDeleteMyRootShelfById,
  mutationFnDeleteMyRootShelvesByIds,
  mutationFnRestoreMyRootShelfById,
  mutationFnRestoreMyRootShelvesByIds,
  mutationFnUpdateMyRootShelfById,
  mutationFnUpdateMyRootShelvesByIds,
  mutationFnUpsertRootShelfPermission,
  mutationFnLeaveMyRootShelf,
  mutationFnTransferMyRootShelfOwnership,
  queryFnGetMyRootShelfById,
} from "@shared/api/invokers/rootShelf.invoker";
import { RootShelfLocalSimulator } from "@shared/api/local/simulators/rootShelf.simulator";
import { RootShelfLocalSynchronizer } from "@shared/api/local/synchronizers/rootShelf.synchronizer";
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

export const useGetMyRootShelfById = (
  hookRequest?: GetMyRootShelfByIdRequest,
  options?: Partial<UseQueryOptions<GetMyRootShelfByIdResponse, Error>>,
) => {
  const queryClient = getQueryClient();

  const perform = async (
    request?: GetMyRootShelfByIdRequest,
  ): Promise<GetMyRootShelfByIdResponse> => {
    if (!request) {
      throw new NotegicValidationError(
        ValidationClientException.ReceivedUndefinedRequest(),
      );
    }

    try {
      if (typeof navigator !== "undefined" && navigator.onLine === false) {
        throw new NotegicFetchError(FetchClientExceptions.MissingNetwork());
      }

      const response = await queryFnGetMyRootShelfById(request);
      SessionStorageManipulator.ensureItem(
        SessionStorageKey.csrfToken,
        response.refreshableTokens?.newCSRFToken,
      );
      await RootShelfLocalSynchronizer.syncGetMyRootShelfById(response);
      return response;
    } catch (error) {
      if (
        error instanceof NotegicAPIError ||
        error instanceof NotegicFetchError
      ) {
        const existingRootShelf =
          await RootShelfLocalSimulator.simulateGetMyRootShelfById(request);
        return {
          success: false,
          data: existingRootShelf ? { ...existingRootShelf } : null,
          exception: error.unWrap,
          embedded: { publicId: "" },
        } as GetMyRootShelfByIdResponse;
      }

      throw error;
    }
  };

  const query = useQuery<GetMyRootShelfByIdResponse, Error>({
    queryKey: queryKeys.rootShelf.oneById(
      hookRequest?.param.rootShelfId as UUID | undefined,
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
    callbackRequest: GetMyRootShelfByIdRequest,
  ): Promise<GetMyRootShelfByIdResponse> => {
    return queryClient.fetchQuery({
      queryKey: queryKeys.rootShelf.oneById(
        callbackRequest.param.rootShelfId as UUID | undefined,
        callbackRequest.param.isDeleted ?? false,
      ),
      queryFn: async () => perform(callbackRequest),
      staleTime: UseQueryDefaultOptions.staleTime,
      ...options,
    });
  };

  return { ...query, fetch };
};

export const useCreateRootShelf = () => {
  const apolloClient = useApolloClient();

  const perform = async (
    request: CreateRootShelfRequest,
  ): Promise<CreateRootShelfResponse> => {
    if (typeof navigator !== "undefined" && navigator.onLine === false) {
      throw new NotegicFetchError(FetchClientExceptions.MissingNetwork());
    }

    return await mutationFnCreateRootShelf(request);
  };

  const mutation = useMutation({
    mutationFn: perform,
    onSuccess: async (response, request) => {
      if (response.success === false) return;
      SessionStorageManipulator.ensureItem(
        SessionStorageKey.csrfToken,
        response.refreshableTokens?.newCSRFToken,
      );
      apolloClient.cache.modify({
        fields: {
          searchRootShelves(existingSearchRootShelves, { readField }) {
            if (!existingSearchRootShelves) return existingSearchRootShelves;

            const newEdge = {
              __typename: "SearchRootShelfEdge",
              node: {
                __typename: "PrivateRootShelf",
                id: response.data.id,
                name: request.body.name,
                subShelfCount: 0,
                itemCount: 0,
                lastAnalyzedAt: response.data.lastAnalyzedAt,
                updatedAt: response.data.createdAt,
                createdAt: response.data.createdAt,
              },
            };

            const updatedEdges = [
              newEdge,
              ...existingSearchRootShelves.searchEdges,
            ];

            return {
              ...existingSearchRootShelves,
              searchEdges: updatedEdges,
            };
          },
        },
      });
      await RootShelfLocalSynchronizer.syncCreateRootShelf(request, response);
    },
    onError: async (error, request) => {
      if (error instanceof NotegicFetchError) {
        switch (error.unWrap.reason) {
          case ExceptionReasonDictionary.client.fetch.missingNetwork:
            await RootShelfLocalSimulator.simulateCreateRootShelf(request);
            break;
        }
      }
    },
  });

  return mutation;
};

export const useCreateRootShelves = () => {
  const apolloClient = useApolloClient();

  const perform = async (
    request: CreateRootShelvesRequest,
  ): Promise<CreateRootShelvesResponse> => {
    if (typeof navigator !== "undefined" && navigator.onLine === false) {
      throw new NotegicFetchError(FetchClientExceptions.MissingNetwork());
    }

    return await mutationFnCreateRootShelves(request);
  };

  const mutation = useMutation({
    mutationFn: perform,
    onSuccess: async (response, request) => {
      if (response.success === false) return;
      SessionStorageManipulator.ensureItem(
        SessionStorageKey.csrfToken,
        response.refreshableTokens?.newCSRFToken,
      );
      apolloClient.cache.modify({
        fields: {
          searchRootShelves(existingSearchRootShelves, { readField }) {
            if (!existingSearchRootShelves) return existingSearchRootShelves;

            const newEdges = [];
            // since the response and the request(request body) are aligned in the backend,
            // we can just try to iterate through them
            for (
              let i = 0;
              i < response.data.ids.length &&
              i < request.body.createdRootShelves.length;
              i++
            ) {
              const newEdge = {
                __typename: "SearchRootShelfEdge",
                node: {
                  __typename: "PrivateRootShelf",
                  id: response.data.ids[i],
                  name: request.body.createdRootShelves[i].name,
                  subShelfCount: 0,
                  itemCount: 0,
                  lastAnalyzedAt: response.data.lastAnalyzedAt,
                  updatedAt: response.data.createdAt,
                  createdAt: response.data.createdAt,
                },
              };
              newEdges.push(newEdge);
            }

            const updatedEdges = [
              ...newEdges,
              ...existingSearchRootShelves.searchEdges,
            ];

            return {
              ...existingSearchRootShelves,
              searchEdges: updatedEdges,
            };
          },
        },
      });
      await RootShelfLocalSynchronizer.syncCreateRootShelves(request, response);
    },
    onError: async (error, request) => {
      if (error instanceof NotegicFetchError) {
        switch (error.unWrap.reason) {
          case ExceptionReasonDictionary.client.fetch.missingNetwork:
            await RootShelfLocalSimulator.simulateCreateRootShelves(request);
            break;
        }
      }
    },
  });

  return mutation;
};

export const useUpdateMyRootShelfById = () => {
  const queryClient = getQueryClient();
  const apolloClient = useApolloClient();

  const perform = async (
    request: UpdateMyRootShelfByIdRequest,
  ): Promise<UpdateMyRootShelfByIdResponse> => {
    if (typeof navigator !== "undefined" && navigator.onLine === false) {
      throw new NotegicFetchError(FetchClientExceptions.MissingNetwork());
    }

    return await mutationFnUpdateMyRootShelfById(request);
  };

  const mutation = useMutation({
    mutationFn: perform,
    onSuccess: async (response, request) => {
      if (response.success === false) return;
      SessionStorageManipulator.ensureItem(
        SessionStorageKey.csrfToken,
        response.refreshableTokens?.newCSRFToken,
      );
      const rootShelfId = request.body.rootShelfId as UUID;
      queryClient.invalidateQueries({
        queryKey: queryKeys.rootShelf.oneById(rootShelfId),
      });
      apolloClient.cache.modify({
        id: apolloClient.cache.identify({
          __typename: "PrivateRootShelf",
          id: rootShelfId,
        }),
        fields: {
          ...(request.body.values.name && {
            name: () => request.body.values.name,
          }),
        },
      });
      await RootShelfLocalSynchronizer.syncUpdateMyRootShelfById(
        request,
        response,
      );
    },
    onError: async (error, request) => {
      if (error instanceof NotegicFetchError) {
        switch (error.unWrap.reason) {
          case ExceptionReasonDictionary.client.fetch.missingNetwork:
            await RootShelfLocalSimulator.simulateUpdateMyRootShelfById(
              request,
            );
            break;
        }
      }
    },
  });

  return mutation;
};

export const useUpsertRootShelfPermission = () => {
  const queryClient = getQueryClient();
  const apolloClient = useApolloClient();

  const perform = async (
    request: UpsertRootShelfPermissionRequest,
  ): Promise<UpsertRootShelfPermissionResponse> => {
    if (typeof navigator !== "undefined" && navigator.onLine === false) {
      throw new NotegicFetchError(FetchClientExceptions.MissingNetwork());
    }

    return await mutationFnUpsertRootShelfPermission(request);
  };

  const mutation = useMutation({
    mutationFn: perform,
    onSuccess: async (response, request) => {
      if (response.success === false) return;

      queryClient.invalidateQueries({
        queryKey: queryKeys.rootShelf.oneById(
          request.param.rootShelfId as UUID,
        ),
      });
      apolloClient.cache.modify({
        id: apolloClient.cache.identify({
          __typename: "PrivateRootShelf",
          id: request.param.rootShelfId,
        }),
        fields: {
          sharerPublicIds(existingSharerPublicIds) {
            if (!Array.isArray(existingSharerPublicIds)) {
              return existingSharerPublicIds;
            }

            if (existingSharerPublicIds.includes(response.data.userPublicId)) {
              return existingSharerPublicIds;
            }

            return [...existingSharerPublicIds, response.data.userPublicId];
          },
        },
      });
    },
  });

  return mutation;
};

export const useDeleteRootShelfPermissions = () => {
  const queryClient = getQueryClient();
  const apolloClient = useApolloClient();

  const perform = async (
    request: DeleteRootShelfPermissionsRequest,
  ): Promise<DeleteRootShelfPermissionsResponse> => {
    if (typeof navigator !== "undefined" && navigator.onLine === false) {
      throw new NotegicFetchError(FetchClientExceptions.MissingNetwork());
    }

    return await mutationFnDeleteRootShelfPermissions(request);
  };

  const mutation = useMutation({
    mutationFn: perform,
    onSuccess: async (response, request) => {
      if (response.success === false) return;

      queryClient.invalidateQueries({
        queryKey: queryKeys.rootShelf.oneById(
          request.param.rootShelfId as UUID,
        ),
      });
      apolloClient.cache.modify({
        id: apolloClient.cache.identify({
          __typename: "PrivateRootShelf",
          id: request.param.rootShelfId,
        }),
        fields: {
          sharerPublicIds(existingSharerPublicIds) {
            if (!Array.isArray(existingSharerPublicIds)) {
              return existingSharerPublicIds;
            }

            return existingSharerPublicIds.filter(
              (userPublicId) =>
                !request.body.userPublicIds.includes(userPublicId),
            );
          },
        },
      });
    },
  });

  return mutation;
};

export const useUpdateMyRootShelvesByIds = () => {
  const queryClient = getQueryClient();
  const apolloClient = useApolloClient();

  const perform = async (
    request: UpdateMyRootShelvesByIdsRequest,
  ): Promise<UpdateMyRootShelvesByIdsResponse> => {
    if (typeof navigator !== "undefined" && navigator.onLine === false) {
      throw new NotegicFetchError(FetchClientExceptions.MissingNetwork());
    }

    return await mutationFnUpdateMyRootShelvesByIds(request);
  };

  const mutation = useMutation({
    mutationFn: perform,
    onSuccess: async (response, request) => {
      if (response.success === false) return;
      SessionStorageManipulator.ensureItem(
        SessionStorageKey.csrfToken,
        response.refreshableTokens?.newCSRFToken,
      );
      for (const updatedRootShelf of request.body.updatedRootShelves) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.rootShelf.oneById(
            updatedRootShelf.rootShelfId as UUID,
          ),
        });
        apolloClient.cache.modify({
          id: apolloClient.cache.identify({
            __typename: "PrivateRootShelf",
            id: updatedRootShelf.rootShelfId,
          }),
          fields: {
            ...(updatedRootShelf.values.name && {
              name: () => updatedRootShelf.values.name,
            }),
          },
        });
      }
      await RootShelfLocalSynchronizer.syncUpdateMyRootShelvesByIds(
        request,
        response,
      );
    },
    onError: async (error, request) => {
      if (error instanceof NotegicFetchError) {
        switch (error.unWrap.reason) {
          case ExceptionReasonDictionary.client.fetch.missingNetwork:
            await RootShelfLocalSimulator.simulateUpdateMyRootShelvesByIds(
              request,
            );
            break;
        }
      }
    },
  });

  return mutation;
};

export const useRestoreMyRootShelfById = () => {
  const queryClient = getQueryClient();
  const apolloClient = useApolloClient();

  const perform = async (
    request: RestoreMyRootShelfByIdRequest,
  ): Promise<RestoreMyRootShelfByIdResponse> => {
    if (typeof navigator !== "undefined" && navigator.onLine === false) {
      throw new NotegicFetchError(FetchClientExceptions.MissingNetwork());
    }

    return await mutationFnRestoreMyRootShelfById(request);
  };

  const mutation = useMutation({
    mutationFn: perform,
    onSuccess: async (response, request) => {
      if (response.success === false) return;
      SessionStorageManipulator.ensureItem(
        SessionStorageKey.csrfToken,
        response.refreshableTokens?.newCSRFToken,
      );
      const rootShelfId = request.body.rootShelfId as UUID;
      const targetKeys: QueryKey[] = [
        queryKeys.rootShelf.oneById(rootShelfId),
        queryKeys.subShelf.manyByRootShelfId(rootShelfId),
        queryKeys.material.manyByRootShelfId(rootShelfId),
        queryKeys.blockPack.manyByRootShelfId(rootShelfId),
      ];
      Promise.all(
        targetKeys.map((targetKey) =>
          queryClient.invalidateQueries({ queryKey: targetKey }),
        ),
      );
      apolloClient.cache.modify({
        fields: {
          searchRootShelves(existingSearchRootShelves, { readField }) {
            if (!existingSearchRootShelves) return existingSearchRootShelves;

            const restoredEdge = {
              __typename: "SearchRootShelfEdge",
              node: {
                __typename: "PrivateRootShelf",
                id: response.data.id,
                name: response.data.name,
                subShelfCount: response.data.subShelfCount,
                itemCount: response.data.itemCount,
                lastAnalyzedAt: response.data.lastAnalyzedAt,
                updatedAt: response.data.updatedAt,
                createdAt: response.data.createdAt,
              },
            };

            if (
              existingSearchRootShelves.searchEdges.some(
                (edge: any) => readField("id", edge.node) === response.data.id,
              )
            )
              return existingSearchRootShelves;

            const updatedEdges = [
              restoredEdge,
              ...existingSearchRootShelves.searchEdges,
            ];

            return {
              ...existingSearchRootShelves,
              searchEdges: updatedEdges,
            };
          },
        },
      });
      await RootShelfLocalSynchronizer.syncRestoreMyRootShelfById(
        request,
        response,
      );
    },
    onError: async (error, request) => {
      if (error instanceof NotegicFetchError) {
        switch (error.unWrap.reason) {
          case ExceptionReasonDictionary.client.fetch.missingNetwork:
            await RootShelfLocalSimulator.simulateRestoreMyRootShelfById(
              request,
            );
            break;
        }
      }
    },
  });

  return mutation;
};

export const useRestoreMyRootShelvesByIds = () => {
  const queryClient = getQueryClient();
  const apolloClient = useApolloClient();

  const perform = async (
    request: RestoreMyRootShelvesByIdsRequest,
  ): Promise<RestoreMyRootShelvesByIdsResponse> => {
    if (typeof navigator !== "undefined" && navigator.onLine === false) {
      throw new NotegicFetchError(FetchClientExceptions.MissingNetwork());
    }

    return await mutationFnRestoreMyRootShelvesByIds(request);
  };

  const mutation = useMutation({
    mutationFn: perform,
    onSuccess: async (response, request) => {
      if (response.success === false) return;
      SessionStorageManipulator.ensureItem(
        SessionStorageKey.csrfToken,
        response.refreshableTokens?.newCSRFToken,
      );
      const rootShelfIds = (request.body.rootShelfIds || []).filter(
        Boolean,
      ) as UUID[];
      const targetKeys: QueryKey[] = [
        ...rootShelfIds.flatMap((rootShelfId) => [
          queryKeys.rootShelf.oneById(rootShelfId),
          queryKeys.subShelf.manyByRootShelfId(rootShelfId),
          queryKeys.material.manyByRootShelfId(rootShelfId),
          queryKeys.blockPack.manyByRootShelfId(rootShelfId),
        ]),
      ];
      Promise.all(
        targetKeys.map((targetKey) =>
          queryClient.invalidateQueries({ queryKey: targetKey }),
        ),
      );
      apolloClient.cache.modify({
        fields: {
          searchRootShelves(existingSearchRootShelves, { readField }) {
            if (!existingSearchRootShelves) return existingSearchRootShelves;

            const newEdges = response.data
              .map((shelf) => ({
                __typename: "SearchRootShelfEdge",
                node: {
                  __typename: "PrivateRootShelf",
                  id: shelf.id,
                  name: shelf.name,
                  subShelfCount: shelf.subShelfCount,
                  itemCount: shelf.itemCount,
                  lastAnalyzedAt: shelf.lastAnalyzedAt,
                  updatedAt: shelf.updatedAt,
                  createdAt: shelf.createdAt,
                },
              }))
              .filter((edge) => {
                const exists = existingSearchRootShelves.searchEdges.some(
                  (existingEdge: any) =>
                    readField("id", existingEdge.node) === edge.node.id,
                );
                return !exists;
              });

            if (newEdges.length === 0) return existingSearchRootShelves;

            return {
              ...existingSearchRootShelves,
              searchEdges: [
                ...newEdges,
                ...existingSearchRootShelves.searchEdges,
              ],
            };
          },
        },
      });
      await RootShelfLocalSynchronizer.syncRestoreMyRootShelvesByIds(
        request,
        response,
      );
    },
    onError: async (error, request) => {
      if (error instanceof NotegicFetchError) {
        switch (error.unWrap.reason) {
          case ExceptionReasonDictionary.client.fetch.missingNetwork:
            await RootShelfLocalSimulator.simulateRestoreMyRootShelvesByIds(
              request,
            );
            break;
        }
      }
    },
  });

  return mutation;
};

export const useDeleteMyRootShelfById = () => {
  const queryClient = getQueryClient();
  const apolloClient = useApolloClient();

  const perform = async (
    request: DeleteMyRootShelfByIdRequest,
  ): Promise<DeleteMyRootShelfByIdResponse> => {
    if (typeof navigator !== "undefined" && navigator.onLine === false) {
      throw new NotegicFetchError(FetchClientExceptions.MissingNetwork());
    }

    return await mutationFnDeleteMyRootShelfById(request);
  };

  const mutation = useMutation({
    mutationFn: perform,
    onSuccess: async (response, request) => {
      if (response.success === false) return;
      SessionStorageManipulator.ensureItem(
        SessionStorageKey.csrfToken,
        response.refreshableTokens?.newCSRFToken,
      );
      const rootShelfId = request.body.rootShelfId as UUID;
      const targetKeys: QueryKey[] = [
        queryKeys.rootShelf.oneById(rootShelfId),
        queryKeys.subShelf.manyByRootShelfId(rootShelfId),
        queryKeys.material.manyByRootShelfId(rootShelfId),
        queryKeys.blockPack.manyByRootShelfId(rootShelfId),
      ];
      Promise.all(
        targetKeys.map((targetKey) =>
          queryClient.invalidateQueries({ queryKey: targetKey }),
        ),
      );
      apolloClient.cache.modify({
        fields: {
          searchRootShelves(existingSearchRootShelves, { readField }) {
            if (!existingSearchRootShelves) return existingSearchRootShelves;

            const updatedEdges = existingSearchRootShelves.searchEdges.filter(
              (edge: any) => readField("id", edge.node) !== rootShelfId,
            );

            return {
              ...existingSearchRootShelves,
              searchEdges: updatedEdges,
            };
          },
        },
      });
      await RootShelfLocalSynchronizer.syncDeleteMyRootShelfById(
        request,
        response,
      );
    },
    onError: async (error, request) => {
      if (error instanceof NotegicFetchError) {
        switch (error.unWrap.reason) {
          case ExceptionReasonDictionary.client.fetch.missingNetwork:
            await RootShelfLocalSimulator.simulateDeleteMyRootShelfById(
              request,
            );
            break;
        }
      }
    },
  });

  return mutation;
};

export const useDeleteMyRootShelvesByIds = () => {
  const queryClient = getQueryClient();

  const perform = async (
    request: DeleteMyRootShelvesByIdsRequest,
  ): Promise<DeleteMyRootShelvesByIdsResponse> => {
    if (typeof navigator !== "undefined" && navigator.onLine === false) {
      throw new NotegicFetchError(FetchClientExceptions.MissingNetwork());
    }

    return await mutationFnDeleteMyRootShelvesByIds(request);
  };

  const mutation = useMutation({
    mutationFn: perform,
    onSuccess: async (response, request) => {
      if (response.success === false) return;
      SessionStorageManipulator.ensureItem(
        SessionStorageKey.csrfToken,
        response.refreshableTokens?.newCSRFToken,
      );
      const rootShelfIds = (request.body.rootShelfIds || []).filter(
        Boolean,
      ) as UUID[];
      const targetKeys: QueryKey[] = [
        ...rootShelfIds.flatMap((rootShelfId) => [
          queryKeys.rootShelf.oneById(rootShelfId),
          queryKeys.subShelf.manyByRootShelfId(rootShelfId),
          queryKeys.material.manyByRootShelfId(rootShelfId),
          queryKeys.blockPack.manyByRootShelfId(rootShelfId),
        ]),
      ];
      Promise.all(
        targetKeys.map((targetKey) =>
          queryClient.invalidateQueries({ queryKey: targetKey }),
        ),
      );
      await RootShelfLocalSynchronizer.syncDeleteMyRootShelvesByIds(
        request,
        response,
      );
    },
    onError: async (error, request) => {
      if (error instanceof NotegicFetchError) {
        switch (error.unWrap.reason) {
          case ExceptionReasonDictionary.client.fetch.missingNetwork:
            await RootShelfLocalSimulator.simulateDeleteMyRootShelvesByIds(
              request,
            );
            break;
        }
      }
    },
  });

  return mutation;
};

export const useTransferMyRootShelfOwnership = () => {
  const queryClient = getQueryClient();
  return useMutation({
    mutationFn: (
      request: TransferMyRootShelfOwnershipRequest,
    ): Promise<TransferMyRootShelfOwnershipResponse> =>
      mutationFnTransferMyRootShelfOwnership(request),
    onSuccess: async (_response, request) => {
      await queryClient.invalidateQueries({
        queryKey: queryKeys.rootShelf.permission(
          request.param.rootShelfId as UUID,
        ),
      });
      await queryClient.invalidateQueries({
        queryKey: queryKeys.rootShelf.oneById(
          request.param.rootShelfId as UUID,
        ),
      });
    },
  });
};

export const useLeaveMyRootShelf = () => {
  const queryClient = getQueryClient();
  return useMutation({
    mutationFn: (
      request: LeaveMyRootShelfRequest,
    ): Promise<LeaveMyRootShelfResponse> => mutationFnLeaveMyRootShelf(request),
    onSuccess: async (_response, request) => {
      await queryClient.invalidateQueries({
        queryKey: queryKeys.rootShelf.permission(
          request.param.rootShelfId as UUID,
        ),
      });
      await queryClient.invalidateQueries({
        queryKey: queryKeys.rootShelf.oneById(
          request.param.rootShelfId as UUID,
        ),
      });
    },
  });
};
