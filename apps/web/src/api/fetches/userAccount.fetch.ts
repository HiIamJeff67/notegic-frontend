import type {
  GetMyAccountRequest,
  GetMyAccountResponse,
} from "@shared/api/interfaces/userAccount.interface";
import { queryFnGetMyAccount } from "@/api/invokers/userAccount.invoker";
import { getQueryClient } from "@shared/api/queryClient";
import { QueryAsyncDefaultOptions } from "@shared/api/queryHookOptions";
import { queryKeys } from "@shared/api/queryKeys";
import type { FetchQueryOptions, QueryClient } from "@tanstack/react-query";

export const fetchGetMyAccount = async (
  fetchRequest: GetMyAccountRequest,
  initialQueryClient?: QueryClient,
  options?: Partial<FetchQueryOptions>
): Promise<GetMyAccountResponse> => {
  const queryClient = initialQueryClient ?? getQueryClient();

  const response = await queryClient.fetchQuery({
    queryKey: queryKeys.userAccount.my(),
    queryFn: async () => await queryFnGetMyAccount(fetchRequest),
    staleTime: QueryAsyncDefaultOptions.staleTime,
    ...options,
  });

  return response as GetMyAccountResponse;
};
