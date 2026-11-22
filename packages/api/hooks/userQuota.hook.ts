import type { GetMyQuotaRequest } from "@shared/api/interfaces/userQuota.interface";
import { queryFnGetMyQuota } from "@shared/api/invokers/userQuota.invoker";
import { UseQueryDefaultOptions } from "@shared/api/queryHookOptions";
import { queryKeys } from "@shared/api/queryKeys";
import { useQuery } from "@tanstack/react-query";

export const useGetMyQuota = (
  func: Parameters<typeof queryFnGetMyQuota>[1],
  request?: Parameters<typeof queryFnGetMyQuota>[0]
) =>
  useQuery({
    queryKey: queryKeys.userQuota.my(),
    enabled: request !== undefined,
    queryFn: () => queryFnGetMyQuota(request as GetMyQuotaRequest, func),
    staleTime: UseQueryDefaultOptions.staleTime,
    refetchOnWindowFocus: UseQueryDefaultOptions.refetchOnWindowFocus,
    refetchOnMount: UseQueryDefaultOptions.refetchOnMount,
  });
