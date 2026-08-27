import { GetMyRootShelfByIdRequest } from "@shared/api/interfaces/rootShelf.interface";
import { queryFnGetMyRootShelfById } from "@/api/invokers/rootShelf.invoker";
import { getQueryClient } from "@shared/api/queryClient";
import { PrefetchQueryDefaultOptions } from "@shared/api/queryHookOptions";
import { queryKeys } from "@shared/api/queryKeys";
import { QueryClient } from "@tanstack/react-query";
import type { UUID } from "crypto";

export const prefetchGetMyRootShelfById = (
  initialQueryClient?: QueryClient
) => {
  const queryClient = initialQueryClient ?? getQueryClient();

  const prefetchQuery = async (
    prefetchRequest: GetMyRootShelfByIdRequest
  ): Promise<void> => {
    await queryClient.prefetchQuery({
      queryKey: queryKeys.rootShelf.oneById(
        prefetchRequest?.param.rootShelfId as UUID | undefined,
        prefetchRequest.param.isDeleted ?? false
      ),
      queryFn: async () => await queryFnGetMyRootShelfById(prefetchRequest),
      staleTime: PrefetchQueryDefaultOptions.staleTime as number,
    });
  };

  return {
    prefetchQuery: prefetchQuery,
    nextQueryClient: queryClient,
    name: "GET_MY_ROOT_SHELF_PREFETCH" as const,
  };
};
