import type { UUID } from "node:crypto";
import type {
  GetMyRootShelfByIdRequest,
  GetMyRootShelfByIdResponse,
} from "@shared/api/interfaces/rootShelf.interface";
import { getQueryClient } from "@shared/api/queryClient";
import { QueryAsyncDefaultOptions } from "@shared/api/queryHookOptions";
import { queryKeys } from "@shared/api/queryKeys";
import type { FetchQueryOptions, QueryClient } from "@tanstack/react-query";
import { queryFnGetMyRootShelfById } from "@/api/invokers/rootShelf.invoker";

export const fetchGetMyRootShelfById = async (
  fetchRequest: GetMyRootShelfByIdRequest,
  initialQueryClient?: QueryClient,
  options?: Partial<FetchQueryOptions>
): Promise<GetMyRootShelfByIdResponse> => {
  const queryClient = initialQueryClient ?? getQueryClient();

  const response = await queryClient.fetchQuery({
    queryKey: queryKeys.rootShelf.oneById(
      fetchRequest.param.rootShelfId as UUID
    ),
    queryFn: async () => await queryFnGetMyRootShelfById(fetchRequest),
    staleTime: QueryAsyncDefaultOptions.staleTime as number,
    ...options,
  });

  return response as GetMyRootShelfByIdResponse;
};
