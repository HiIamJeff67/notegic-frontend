import type { UUID } from "node:crypto";
import { useApolloClient } from "@apollo/client/react";
import { NotegicAPIError } from "@shared/api/exceptions";
import { FetchClientExceptions } from "@shared/api/exceptions/client/fetch.exception";
import { ValidationClientException } from "@shared/api/exceptions/client/validation.exception";
import { NotegicFetchError } from "@shared/api/exceptions/errors/fetch.error";
import { NotegicValidationError } from "@shared/api/exceptions/errors/validation.error";
import { NetworkExceptions } from "@shared/api/exceptions/network.exception";
import type {
  CreateRootShelfRequest,
  CreateRootShelfResponse,
  CreateRootShelvesRequest,
  CreateRootShelvesResponse,
  DeleteMyRootShelfByIdRequest,
  DeleteMyRootShelfByIdResponse,
  DeleteMyRootShelvesByIdsRequest,
  DeleteMyRootShelvesByIdsResponse,
  DeleteRootShelfPermissionsRequest,
  DeleteRootShelfPermissionsResponse,
  GetMyRootShelfByIdRequest,
  GetMyRootShelfByIdResponse,
  LeaveMyRootShelfRequest,
  LeaveMyRootShelfResponse,
  RestoreMyRootShelfByIdRequest,
  RestoreMyRootShelfByIdResponse,
  RestoreMyRootShelvesByIdsRequest,
  RestoreMyRootShelvesByIdsResponse,
  TransferMyRootShelfOwnershipRequest,
  TransferMyRootShelfOwnershipResponse,
  UpdateMyRootShelfByIdRequest,
  UpdateMyRootShelfByIdResponse,
  UpdateMyRootShelvesByIdsRequest,
  UpdateMyRootShelvesByIdsResponse,
  UpsertRootShelfPermissionRequest,
  UpsertRootShelfPermissionResponse,
} from "@shared/api/interfaces/rootShelf.interface";
import {
  CreateRootShelfRequestSchema,
  CreateRootShelvesRequestSchema,
  UpdateMyRootShelfByIdRequestSchema,
  UpdateMyRootShelvesByIdsRequestSchema,
} from "@shared/api/interfaces/rootShelf.interface";
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
  mutationFnCreateRootShelf,
  mutationFnCreateRootShelves,
  mutationFnDeleteMyRootShelfById,
  mutationFnDeleteMyRootShelvesByIds,
  mutationFnDeleteRootShelfPermissions,
  mutationFnHardDeleteMyRootShelvesByIds,
  mutationFnLeaveMyRootShelf,
  mutationFnRestoreMyRootShelfById,
  mutationFnRestoreMyRootShelvesByIds,
  mutationFnTransferMyRootShelfOwnership,
  mutationFnUpdateMyRootShelfById,
  mutationFnUpdateMyRootShelvesByIds,
  mutationFnUpsertRootShelfPermission,
  queryFnGetMyRootShelfById,
} from "@/api/invokers/rootShelf.invoker";
import { RootShelfLocalSimulator } from "@/api/local/simulators/rootShelf.simulator";
import { RootShelfLocalSynchronizer } from "@/api/local/synchronizers/rootShelf.synchronizer";
import {
  clearSearchRootShelves,
  prependMissingSearchRootShelves,
  prependSearchRootShelves,
  removeSearchRootShelves,
} from "@/api/policies/searchRootShelves.policy";

export const useGetMyRootShelfById = (
  hookRequest?: GetMyRootShelfByIdRequest,
  options?: Partial<UseQueryOptions<GetMyRootShelfByIdResponse, Error>>
) => {
  const queryClient = getQueryClient();

  const perform = async (
    request?: GetMyRootShelfByIdRequest
  ): Promise<GetMyRootShelfByIdResponse> => {
    if (!request) {
      throw new NotegicValidationError(
        ValidationClientException.ReceivedUndefinedRequest()
      );
    }

    try {
      if (isRemoteUnavailable()) {
        throw new NotegicFetchError(FetchClientExceptions.MissingNetwork());
      }

      const response = await queryFnGetMyRootShelfById(request);
      await RootShelfLocalSynchronizer.syncGetMyRootShelfById(response);
      return response;
    } catch (error) {
      if (
        error instanceof NotegicAPIError ||
        error instanceof NotegicFetchError
      ) {
        const existingRootShelf =
          await RootShelfLocalSimulator.simulateGetMyRootShelfById(request);
        return (
          NetworkExceptions.isMissingNetworkError(error)
            ? {
                success: true,
                data: existingRootShelf ? { ...existingRootShelf } : null,
                exception: null,
                embedded: { publicId: "" },
              }
            : {
                success: false,
                data: existingRootShelf ? { ...existingRootShelf } : null,
                exception: error.unWrap,
                embedded: { publicId: "" },
              }
        ) as GetMyRootShelfByIdResponse;
      }

      throw error;
    }
  };

  const query = useQuery<GetMyRootShelfByIdResponse, Error>({
    queryKey: queryKeys.rootShelf.oneById(
      hookRequest?.param.rootShelfId as UUID | undefined,
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
    callbackRequest: GetMyRootShelfByIdRequest
  ): Promise<GetMyRootShelfByIdResponse> => {
    return queryClient.fetchQuery({
      queryKey: queryKeys.rootShelf.oneById(
        callbackRequest.param.rootShelfId as UUID | undefined,
        callbackRequest.param.isDeleted ?? false
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
    request: CreateRootShelfRequest
  ): Promise<CreateRootShelfResponse> => {
    try {
      parseRequest(CreateRootShelfRequestSchema, request);
      if (isRemoteUnavailable()) {
        throw new NotegicFetchError(FetchClientExceptions.MissingNetwork());
      }
      return await mutationFnCreateRootShelf(request);
    } catch (error) {
      if (!NetworkExceptions.isMissingNetworkError(error)) throw error;
      await RootShelfLocalSimulator.simulateCreateRootShelf(request);
      if (!request.body.id) throw error;
      const createdAt = new Date();
      return {
        success: true,
        data: {
          id: request.body.id as UUID,
          lastAnalyzedAt: createdAt,
          createdAt,
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
      apolloClient.cache.modify({
        fields: {
          searchRootShelves(existingSearchRootShelves) {
            return prependSearchRootShelves(existingSearchRootShelves, [
              {
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
              },
            ]);
          },
        },
      });
      if (response.embedded.publicId === "") return;
      await RootShelfLocalSynchronizer.syncCreateRootShelf(request, response);
    },
  });

  return mutation;
};

export const useCreateRootShelves = () => {
  const apolloClient = useApolloClient();

  const perform = async (
    request: CreateRootShelvesRequest
  ): Promise<CreateRootShelvesResponse> => {
    try {
      parseRequest(CreateRootShelvesRequestSchema, request);
      if (isRemoteUnavailable()) {
        throw new NotegicFetchError(FetchClientExceptions.MissingNetwork());
      }
      return await mutationFnCreateRootShelves(request);
    } catch (error) {
      if (!NetworkExceptions.isMissingNetworkError(error)) throw error;
      await RootShelfLocalSimulator.simulateCreateRootShelves(request);
      return {
        success: true as const,
        data: {
          ids: request.body.createdRootShelves.map(item => item.id as UUID),
          lastAnalyzedAt: new Date(),
          createdAt: new Date(),
        },
        exception: null,
        embedded: { publicId: "" },
      } as Awaited<ReturnType<typeof mutationFnCreateRootShelves>>;
    }
  };

  const mutation = useMutation({
    mutationFn: perform,
    onSuccess: async (response, request) => {
      if (response.success === false) return;
      apolloClient.cache.modify({
        fields: {
          searchRootShelves(existingSearchRootShelves) {
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

            return prependSearchRootShelves(
              existingSearchRootShelves,
              newEdges
            );
          },
        },
      });
      if (response.embedded?.publicId === "") return;
      await RootShelfLocalSynchronizer.syncCreateRootShelves(request, response);
    },
  });

  return mutation;
};

export const useUpdateMyRootShelfById = () => {
  const queryClient = getQueryClient();
  const apolloClient = useApolloClient();

  const perform = async (
    request: UpdateMyRootShelfByIdRequest
  ): Promise<UpdateMyRootShelfByIdResponse> => {
    try {
      parseRequest(UpdateMyRootShelfByIdRequestSchema, request);
      if (isRemoteUnavailable()) {
        throw new NotegicFetchError(FetchClientExceptions.MissingNetwork());
      }
      return await mutationFnUpdateMyRootShelfById(request);
    } catch (error) {
      if (!NetworkExceptions.isMissingNetworkError(error)) throw error;
      await RootShelfLocalSimulator.simulateUpdateMyRootShelfById(request);
      return {
        success: true as const,
        data: { updatedAt: new Date() },
        exception: null,
        embedded: { publicId: "" },
      } as Awaited<ReturnType<typeof mutationFnUpdateMyRootShelfById>>;
    }
  };

  const mutation = useMutation({
    mutationFn: perform,
    onSuccess: async (response, request) => {
      if (response.success === false) return;
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
      if (response.embedded?.publicId === "") return;
      await RootShelfLocalSynchronizer.syncUpdateMyRootShelfById(
        request,
        response
      );
    },
  });

  return mutation;
};

export const useUpsertRootShelfPermission = () => {
  const queryClient = getQueryClient();
  const apolloClient = useApolloClient();

  const perform = async (
    request: UpsertRootShelfPermissionRequest
  ): Promise<UpsertRootShelfPermissionResponse> => {
    if (isRemoteUnavailable()) {
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
          request.param.rootShelfId as UUID
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
    request: DeleteRootShelfPermissionsRequest
  ): Promise<DeleteRootShelfPermissionsResponse> => {
    if (isRemoteUnavailable()) {
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
          request.param.rootShelfId as UUID
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
              userPublicId => !request.body.userPublicIds.includes(userPublicId)
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
    request: UpdateMyRootShelvesByIdsRequest
  ): Promise<UpdateMyRootShelvesByIdsResponse> => {
    try {
      parseRequest(UpdateMyRootShelvesByIdsRequestSchema, request);
      if (isRemoteUnavailable()) {
        throw new NotegicFetchError(FetchClientExceptions.MissingNetwork());
      }
      return await mutationFnUpdateMyRootShelvesByIds(request);
    } catch (error) {
      if (!NetworkExceptions.isMissingNetworkError(error)) throw error;
      await RootShelfLocalSimulator.simulateUpdateMyRootShelvesByIds(request);
      return {
        success: true as const,
        data: { updatedAt: new Date() },
        exception: null,
        embedded: { publicId: "" },
      } as Awaited<ReturnType<typeof mutationFnUpdateMyRootShelvesByIds>>;
    }
  };

  const mutation = useMutation({
    mutationFn: perform,
    onSuccess: async (response, request) => {
      if (response.success === false) return;
      for (const updatedRootShelf of request.body.updatedRootShelves) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.rootShelf.oneById(
            updatedRootShelf.rootShelfId as UUID
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
      if (response.embedded?.publicId === "") return;
      await RootShelfLocalSynchronizer.syncUpdateMyRootShelvesByIds(
        request,
        response
      );
    },
  });

  return mutation;
};

export const useRestoreMyRootShelfById = () => {
  const queryClient = getQueryClient();
  const apolloClient = useApolloClient();

  const perform = async (
    request: RestoreMyRootShelfByIdRequest
  ): Promise<RestoreMyRootShelfByIdResponse> => {
    try {
      if (isRemoteUnavailable()) {
        throw new NotegicFetchError(FetchClientExceptions.MissingNetwork());
      }
      return await mutationFnRestoreMyRootShelfById(request);
    } catch (error) {
      if (!NetworkExceptions.isMissingNetworkError(error)) throw error;
      await RootShelfLocalSimulator.simulateRestoreMyRootShelfById(request);
      return {
        success: true as const,
        data: { updatedAt: new Date() },
        exception: null,
        embedded: { publicId: "" },
      } as Awaited<ReturnType<typeof mutationFnRestoreMyRootShelfById>>;
    }
  };

  const mutation = useMutation({
    retry: false,
    mutationFn: perform,
    onSuccess: async (response, request) => {
      if (response.success === false) return;
      const rootShelfId = request.body.rootShelfId as UUID;
      const targetKeys: QueryKey[] = [
        queryKeys.rootShelf.oneById(rootShelfId),
        queryKeys.subShelf.manyByRootShelfId(rootShelfId),
        queryKeys.material.manyByRootShelfId(rootShelfId),
        queryKeys.blockPack.manyByRootShelfId(rootShelfId),
      ];
      Promise.all(
        targetKeys.map(targetKey =>
          queryClient.invalidateQueries({ queryKey: targetKey })
        )
      );
      clearSearchRootShelves(apolloClient.cache);
      if (response.embedded?.publicId === "") return;
      await RootShelfLocalSynchronizer.syncRestoreMyRootShelfById(
        request,
        response
      );
    },
  });

  return mutation;
};

export const useRestoreMyRootShelvesByIds = (
  options: { offlineFallback?: boolean } = {}
) => {
  const queryClient = getQueryClient();
  const apolloClient = useApolloClient();

  const perform = async (
    request: RestoreMyRootShelvesByIdsRequest
  ): Promise<RestoreMyRootShelvesByIdsResponse> => {
    try {
      if (isRemoteUnavailable()) {
        throw new NotegicFetchError(FetchClientExceptions.MissingNetwork());
      }
      return await mutationFnRestoreMyRootShelvesByIds(request);
    } catch (error) {
      if (!NetworkExceptions.isMissingNetworkError(error)) throw error;
      await RootShelfLocalSimulator.simulateRestoreMyRootShelvesByIds(request);
      return {
        success: true as const,
        data: [],
        exception: null,
        embedded: { publicId: "" },
      } as Awaited<ReturnType<typeof mutationFnRestoreMyRootShelvesByIds>>;
    }
  };

  const mutation = useMutation({
    retry: false,
    mutationFn: perform,
    onSuccess: async (response, request) => {
      if (response.success === false) return;
      const rootShelfIds = (request.body.rootShelfIds || []).filter(
        Boolean
      ) as UUID[];
      const targetKeys: QueryKey[] = [
        ...rootShelfIds.flatMap(rootShelfId => [
          queryKeys.rootShelf.oneById(rootShelfId),
          queryKeys.subShelf.manyByRootShelfId(rootShelfId),
          queryKeys.material.manyByRootShelfId(rootShelfId),
          queryKeys.blockPack.manyByRootShelfId(rootShelfId),
        ]),
      ];
      Promise.all(
        targetKeys.map(targetKey =>
          queryClient.invalidateQueries({ queryKey: targetKey })
        )
      );
      apolloClient.cache.modify({
        fields: {
          searchRootShelves(existingSearchRootShelves, { readField }) {
            return prependMissingSearchRootShelves(
              existingSearchRootShelves,
              readField,
              response.data.map(shelf => ({
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
            );
          },
        },
      });
      if (response.embedded?.publicId === "") return;
      await RootShelfLocalSynchronizer.syncRestoreMyRootShelvesByIds(
        request,
        response
      ).catch(error =>
        console.error("Failed to refresh confirmed Trash action", error)
      );
    },
  });

  return mutation;
};

export const useDeleteMyRootShelfById = () => {
  const queryClient = getQueryClient();
  const apolloClient = useApolloClient();

  const perform = async (
    request: DeleteMyRootShelfByIdRequest
  ): Promise<DeleteMyRootShelfByIdResponse> => {
    try {
      if (isRemoteUnavailable()) {
        throw new NotegicFetchError(FetchClientExceptions.MissingNetwork());
      }
      return await mutationFnDeleteMyRootShelfById(request);
    } catch (error) {
      if (!NetworkExceptions.isMissingNetworkError(error)) throw error;
      await RootShelfLocalSimulator.simulateDeleteMyRootShelfById(request);
      return {
        success: true as const,
        data: { deletedAt: new Date() },
        exception: null,
        embedded: { publicId: "" },
      } as Awaited<ReturnType<typeof mutationFnDeleteMyRootShelfById>>;
    }
  };

  const mutation = useMutation({
    mutationFn: perform,
    onSuccess: async (response, request) => {
      if (response.success === false) return;
      const rootShelfId = request.body.rootShelfId as UUID;
      const targetKeys: QueryKey[] = [
        queryKeys.rootShelf.oneById(rootShelfId),
        queryKeys.subShelf.manyByRootShelfId(rootShelfId),
        queryKeys.material.manyByRootShelfId(rootShelfId),
        queryKeys.blockPack.manyByRootShelfId(rootShelfId),
      ];
      Promise.all(
        targetKeys.map(targetKey =>
          queryClient.invalidateQueries({ queryKey: targetKey })
        )
      );
      apolloClient.cache.modify({
        fields: {
          searchRootShelves(existingSearchRootShelves, { readField }) {
            return removeSearchRootShelves(
              existingSearchRootShelves,
              readField,
              [rootShelfId]
            );
          },
        },
      });
      if (response.embedded?.publicId === "") return;
      await RootShelfLocalSynchronizer.syncDeleteMyRootShelfById(
        request,
        response
      );
    },
  });

  return mutation;
};

export const useDeleteMyRootShelvesByIds = () => {
  const queryClient = getQueryClient();

  const perform = async (
    request: DeleteMyRootShelvesByIdsRequest
  ): Promise<DeleteMyRootShelvesByIdsResponse> => {
    try {
      if (isRemoteUnavailable()) {
        throw new NotegicFetchError(FetchClientExceptions.MissingNetwork());
      }
      return await mutationFnDeleteMyRootShelvesByIds(request);
    } catch (error) {
      if (!NetworkExceptions.isMissingNetworkError(error)) throw error;
      await RootShelfLocalSimulator.simulateDeleteMyRootShelvesByIds(request);
      return {
        success: true as const,
        data: { deletedAt: new Date() },
        exception: null,
        embedded: { publicId: "" },
      } as Awaited<ReturnType<typeof mutationFnDeleteMyRootShelvesByIds>>;
    }
  };

  const mutation = useMutation({
    mutationFn: perform,
    onSuccess: async (response, request) => {
      if (response.success === false) return;
      const rootShelfIds = (request.body.rootShelfIds || []).filter(
        Boolean
      ) as UUID[];
      const targetKeys: QueryKey[] = [
        ...rootShelfIds.flatMap(rootShelfId => [
          queryKeys.rootShelf.oneById(rootShelfId),
          queryKeys.subShelf.manyByRootShelfId(rootShelfId),
          queryKeys.material.manyByRootShelfId(rootShelfId),
          queryKeys.blockPack.manyByRootShelfId(rootShelfId),
        ]),
      ];
      Promise.all(
        targetKeys.map(targetKey =>
          queryClient.invalidateQueries({ queryKey: targetKey })
        )
      );
      if (response.embedded?.publicId === "") return;
      await RootShelfLocalSynchronizer.syncDeleteMyRootShelvesByIds(
        request,
        response
      );
    },
  });

  return mutation;
};

export const useTransferMyRootShelfOwnership = () => {
  const queryClient = getQueryClient();
  return useMutation({
    mutationFn: (
      request: TransferMyRootShelfOwnershipRequest
    ): Promise<TransferMyRootShelfOwnershipResponse> =>
      mutationFnTransferMyRootShelfOwnership(request),
    onSuccess: async (_response, request) => {
      await queryClient.invalidateQueries({
        queryKey: queryKeys.rootShelf.permission(
          request.param.rootShelfId as UUID
        ),
      });
      await queryClient.invalidateQueries({
        queryKey: queryKeys.rootShelf.oneById(
          request.param.rootShelfId as UUID
        ),
      });
    },
  });
};

export const useLeaveMyRootShelf = () => {
  const queryClient = getQueryClient();
  return useMutation({
    mutationFn: (
      request: LeaveMyRootShelfRequest
    ): Promise<LeaveMyRootShelfResponse> => mutationFnLeaveMyRootShelf(request),
    onSuccess: async (_response, request) => {
      await queryClient.invalidateQueries({
        queryKey: queryKeys.rootShelf.permission(
          request.param.rootShelfId as UUID
        ),
      });
      await queryClient.invalidateQueries({
        queryKey: queryKeys.rootShelf.oneById(
          request.param.rootShelfId as UUID
        ),
      });
    },
  });
};

export const useHardDeleteMyRootShelvesByIds = () => {
  const queryClient = getQueryClient();
  return useMutation({
    mutationFn: mutationFnHardDeleteMyRootShelvesByIds,
    retry: false,
    onSuccess: async (response, request) => {
      if (!response.success) return;
      const updates = await Promise.allSettled([
        RootShelfLocalSynchronizer.syncHardDeleteMyRootShelvesByIds(
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
