import type {
  GetMyQuotaRequest,
  GetMyQuotaResponse,
} from "@shared/api/interfaces/userQuota.interface";
import { getQueryClient } from "@shared/api/queryClient";
import { queryKeys } from "@shared/api/queryKeys";
import type { QueryClient } from "@tanstack/react-query";
import { queryFnGetMyQuota } from "@/api/invokers/userQuota.invoker";

export const fetchGetMyQuota = async (
  fetchRequest: GetMyQuotaRequest,
  initialQueryClient?: QueryClient
): Promise<GetMyQuotaResponse> => {
  const queryClient = initialQueryClient ?? getQueryClient();

  return queryClient.fetchQuery({
    queryKey: queryKeys.userQuota.my(),
    queryFn: async () => await queryFnGetMyQuota(fetchRequest),
    staleTime: 0,
  });
};
