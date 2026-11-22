import type {
  GetMyBlockByIdRequest,
  GetMyBlocksByBlockPackIdRequest,
  GetMyBlocksByIdsRequest,
} from "@shared/api/interfaces/block.interface";
import {
  queryFnGetMyBlockById,
  queryFnGetMyBlocksByBlockPackId,
  queryFnGetMyBlocksByIds,
} from "@shared/api/invokers/block.invoker";
import { UseQueryDefaultOptions } from "@shared/api/queryHookOptions";
import { queryKeys } from "@shared/api/queryKeys";
import { useQuery } from "@tanstack/react-query";
import type { UUID } from "crypto";

const queryOptions = {
  staleTime: UseQueryDefaultOptions.staleTime,
  refetchOnWindowFocus: UseQueryDefaultOptions.refetchOnWindowFocus,
  refetchOnMount: UseQueryDefaultOptions.refetchOnMount,
};

export const useGetMyBlockById = (
  func: Parameters<typeof queryFnGetMyBlockById>[1],
  request?: Parameters<typeof queryFnGetMyBlockById>[0]
) =>
  useQuery({
    queryKey: queryKeys.block.oneById(
      request?.param.blockId as UUID | undefined
    ),
    enabled: Boolean(request),
    queryFn: () =>
      queryFnGetMyBlockById(request as GetMyBlockByIdRequest, func),
    ...queryOptions,
  });

export const useGetMyBlocksByIds = (
  func: Parameters<typeof queryFnGetMyBlocksByIds>[1],
  request?: Parameters<typeof queryFnGetMyBlocksByIds>[0]
) =>
  useQuery({
    queryKey: queryKeys.block.manyByIds(
      request?.param.blockIds as UUID[] | undefined
    ),
    enabled: Boolean(request),
    queryFn: () =>
      queryFnGetMyBlocksByIds(request as GetMyBlocksByIdsRequest, func),
    ...queryOptions,
  });

export const useGetMyBlocksByBlockPackId = (
  func: Parameters<typeof queryFnGetMyBlocksByBlockPackId>[1],
  request?: Parameters<typeof queryFnGetMyBlocksByBlockPackId>[0]
) =>
  useQuery({
    queryKey: queryKeys.block.manyByBlockPackId(
      request?.param.blockPackId as UUID | undefined
    ),
    enabled: Boolean(request),
    queryFn: () =>
      queryFnGetMyBlocksByBlockPackId(
        request as GetMyBlocksByBlockPackIdRequest,
        func
      ),
    ...queryOptions,
  });
