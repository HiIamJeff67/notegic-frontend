import { GetMyInfoRequest } from "@shared/api/interfaces/userInfo.interface";
import { queryFnGetMyInfo } from "@/api/invokers/userInfo.invoker";
import { getQueryClient } from "@shared/api/queryClient";
import { PrefetchQueryDefaultOptions } from "@shared/api/queryHookOptions";
import { queryKeys } from "@shared/api/queryKeys";
import { QueryClient } from "@tanstack/react-query";

export const prefetchGetMyInfo = (initialQueryClient?: QueryClient) => {
  const queryClient = initialQueryClient ?? getQueryClient();

  const prefetchQuery = async (
    prefetchRequest: GetMyInfoRequest
  ): Promise<void> => {
    await queryClient.prefetchQuery({
      queryKey: queryKeys.userInfo.my(),
      queryFn: async () => await queryFnGetMyInfo(prefetchRequest),
      staleTime: PrefetchQueryDefaultOptions.staleTime as number,
    });
  };

  return {
    prefetchQuery: prefetchQuery,
    nextQueryClient: queryClient,
    name: "GET_MY_INFO_PREFETCH" as const,
  };
};
