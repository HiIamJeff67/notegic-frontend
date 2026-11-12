import type { UUID } from "node:crypto";
import { NotegicAPIError } from "@shared/api/exceptions";
import { FetchClientExceptions } from "@shared/api/exceptions/client/fetch.exception";
import { NotegicFetchError } from "@shared/api/exceptions/errors/fetch.error";
import { NetworkExceptions } from "@shared/api/exceptions/network.exception";
import type {
  CreateRoutineTaskDependencyByRoutineIdRequest,
  CreateRoutineTaskDependencyByRoutineIdResponse,
  DeleteRoutineTaskDependencyByRoutineIdRequest,
  DeleteRoutineTaskDependencyByRoutineIdResponse,
  GetRoutineTaskDependenciesByRoutineIdRequest,
  GetRoutineTaskDependenciesByRoutineIdResponse,
  UpdateRoutineTaskDependencyByRoutineIdRequest,
  UpdateRoutineTaskDependencyByRoutineIdResponse,
  UpdateRoutineTaskGraphByRoutineIdRequest,
} from "@shared/api/interfaces/routineTaskDependency.interface";
import { getQueryClient } from "@shared/api/queryClient";
import { UseQueryDefaultOptions } from "@shared/api/queryHookOptions";
import { queryKeys } from "@shared/api/queryKeys";
import { type UseQueryOptions, useMutation } from "@tanstack/react-query";
import { useCallback } from "react";
import { isRemoteUnavailable } from "@/api/availability";
import {
  mutationFnCreateRoutineTaskDependencyByRoutineId,
  mutationFnDeleteRoutineTaskDependencyByRoutineId,
  mutationFnUpdateRoutineTaskDependencyByRoutineId,
  mutationFnUpdateRoutineTaskGraphByRoutineId,
  queryFnGetRoutineTaskDependenciesByRoutineId,
} from "@/api/invokers/routineTaskDependency.invoker";
import { RoutineTaskDependencyLocalSimulator } from "@/api/local/simulators/routineTaskDependency.simulator";
import { RoutineTaskDependencyLocalSynchronizer } from "@/api/local/synchronizers/routineTaskDependency.synchronizer";

export const useGetRoutineTaskDependenciesByRoutineId = (
  options?: Partial<
    UseQueryOptions<GetRoutineTaskDependenciesByRoutineIdResponse, Error>
  >
) => {
  const queryClient = getQueryClient();

  const perform = useCallback(
    async (
      request: GetRoutineTaskDependenciesByRoutineIdRequest
    ): Promise<GetRoutineTaskDependenciesByRoutineIdResponse> => {
      try {
        if (isRemoteUnavailable()) {
          throw new NotegicFetchError(FetchClientExceptions.MissingNetwork());
        }

        const response =
          await queryFnGetRoutineTaskDependenciesByRoutineId(request);
        await RoutineTaskDependencyLocalSynchronizer.syncGetRoutineTaskDependenciesByRoutineId(
          request,
          response
        );
        return response;
      } catch (error) {
        if (
          error instanceof NotegicAPIError ||
          error instanceof NotegicFetchError
        ) {
          const dependencies =
            await RoutineTaskDependencyLocalSimulator.simulateGetRoutineTaskDependenciesByRoutineId(
              request
            );
          return NetworkExceptions.isMissingNetworkError(error)
            ? {
                success: true,
                data: dependencies,
                exception: null,
                embedded: { publicId: "" },
              }
            : {
                success: false,
                data: dependencies,
                exception: error.unWrap,
                embedded: { publicId: "" },
              };
        }

        throw error;
      }
    },
    []
  );

  const fetch = useCallback(
    async (request: GetRoutineTaskDependenciesByRoutineIdRequest) =>
      await queryClient.fetchQuery({
        queryKey: queryKeys.routineTaskDependency.byRoutineId(
          request.param.routineId as UUID
        ),
        queryFn: async () => await perform(request),
        staleTime: UseQueryDefaultOptions.staleTime,
        ...options,
      }),
    [options, perform, queryClient]
  );

  return { fetch };
};

export const useCreateRoutineTaskDependencyByRoutineId = () => {
  const queryClient = getQueryClient();

  return useMutation({
    mutationFn: async (
      request: CreateRoutineTaskDependencyByRoutineIdRequest
    ): Promise<CreateRoutineTaskDependencyByRoutineIdResponse> => {
      try {
        if (isRemoteUnavailable()) {
          throw new NotegicFetchError(FetchClientExceptions.MissingNetwork());
        }

        return await mutationFnCreateRoutineTaskDependencyByRoutineId(request);
      } catch (error) {
        if (!NetworkExceptions.isMissingNetworkError(error)) throw error;

        const dependency =
          await RoutineTaskDependencyLocalSimulator.simulateCreateRoutineTaskDependencyByRoutineId(
            request
          );
        return {
          success: true,
          data: dependency,
          exception: null,
          embedded: { publicId: "" },
        } as CreateRoutineTaskDependencyByRoutineIdResponse;
      }
    },
    onSuccess: async (response, request) => {
      if (!response.success) return;
      if (response.embedded?.publicId !== "") {
        await RoutineTaskDependencyLocalSynchronizer.syncCreateRoutineTaskDependencyByRoutineId(
          request,
          response
        );
      }
      await queryClient.invalidateQueries({
        queryKey: queryKeys.routine.oneById(request.param.routineId as UUID),
      });
      await queryClient.invalidateQueries({
        queryKey: queryKeys.routineTaskDependency.byRoutineId(
          request.param.routineId as UUID
        ),
      });
    },
  });
};

export const useUpdateRoutineTaskGraphByRoutineId = () =>
  useMutation({
    retry: false,
    networkMode: "always",
    mutationFn: async (request: UpdateRoutineTaskGraphByRoutineIdRequest) => {
      if (typeof navigator !== "undefined" && !navigator.onLine) {
        throw new NotegicFetchError(FetchClientExceptions.MissingNetwork());
      }
      const response =
        await mutationFnUpdateRoutineTaskGraphByRoutineId(request);
      return response;
    },
  });

export const useUpdateRoutineTaskDependencyByRoutineId = () => {
  const queryClient = getQueryClient();

  return useMutation({
    mutationFn: async (
      request: UpdateRoutineTaskDependencyByRoutineIdRequest
    ): Promise<UpdateRoutineTaskDependencyByRoutineIdResponse> => {
      try {
        if (isRemoteUnavailable()) {
          throw new NotegicFetchError(FetchClientExceptions.MissingNetwork());
        }

        return await mutationFnUpdateRoutineTaskDependencyByRoutineId(request);
      } catch (error) {
        if (!NetworkExceptions.isMissingNetworkError(error)) throw error;

        const dependency =
          await RoutineTaskDependencyLocalSimulator.simulateUpdateRoutineTaskDependencyByRoutineId(
            request
          );
        if (!dependency) throw error;

        return {
          success: true,
          data: dependency,
          exception: null,
          embedded: { publicId: "" },
        } as UpdateRoutineTaskDependencyByRoutineIdResponse;
      }
    },
    onSuccess: async (response, request) => {
      if (!response.success) return;
      if (response.embedded?.publicId !== "") {
        await RoutineTaskDependencyLocalSynchronizer.syncUpdateRoutineTaskDependencyByRoutineId(
          request,
          response
        );
      }
      await queryClient.invalidateQueries({
        queryKey: queryKeys.routine.oneById(request.param.routineId as UUID),
      });
      await queryClient.invalidateQueries({
        queryKey: queryKeys.routineTaskDependency.byRoutineId(
          request.param.routineId as UUID
        ),
      });
    },
  });
};

export const useDeleteRoutineTaskDependencyByRoutineId = () => {
  const queryClient = getQueryClient();

  return useMutation({
    mutationFn: async (
      request: DeleteRoutineTaskDependencyByRoutineIdRequest
    ): Promise<DeleteRoutineTaskDependencyByRoutineIdResponse> => {
      try {
        if (isRemoteUnavailable()) {
          throw new NotegicFetchError(FetchClientExceptions.MissingNetwork());
        }

        return await mutationFnDeleteRoutineTaskDependencyByRoutineId(request);
      } catch (error) {
        if (!NetworkExceptions.isMissingNetworkError(error)) throw error;

        const result =
          await RoutineTaskDependencyLocalSimulator.simulateDeleteRoutineTaskDependencyByRoutineId(
            request
          );
        return {
          success: true,
          data: result,
          exception: null,
          embedded: { publicId: "" },
        } as DeleteRoutineTaskDependencyByRoutineIdResponse;
      }
    },
    onSuccess: async (response, request) => {
      if (!response.success) return;
      if (response.embedded?.publicId !== "") {
        await RoutineTaskDependencyLocalSynchronizer.syncDeleteRoutineTaskDependencyByRoutineId(
          request,
          response
        );
      }
      await queryClient.invalidateQueries({
        queryKey: queryKeys.routine.oneById(request.param.routineId as UUID),
      });
      await queryClient.invalidateQueries({
        queryKey: queryKeys.routineTaskDependency.byRoutineId(
          request.param.routineId as UUID
        ),
      });
    },
  });
};
