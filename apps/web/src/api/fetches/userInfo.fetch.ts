import type {
  GetMyInfoRequest,
  GetMyInfoResponse,
} from "@shared/api/interfaces/userInfo.interface";
import { getQueryClient } from "@shared/api/queryClient";
import { PresignedObjectURLStaleTime } from "@shared/api/queryHookOptions";
import { queryKeys } from "@shared/api/queryKeys";
import type { FetchQueryOptions, QueryClient } from "@tanstack/react-query";
import { queryFnGetMyInfo } from "@/api/invokers/userInfo.invoker";

export const fetchGetMyInfo = async (
  fetchRequest: GetMyInfoRequest,
  initialQueryClient?: QueryClient,
  options?: Partial<FetchQueryOptions>
): Promise<GetMyInfoResponse> => {
  const queryClient = initialQueryClient ?? getQueryClient();

  const response = await queryClient.fetchQuery({
    queryKey: queryKeys.userInfo.my(),
    queryFn: async () => await queryFnGetMyInfo(fetchRequest),
    staleTime: PresignedObjectURLStaleTime,
    ...options,
  });

  return response as GetMyInfoResponse;
};
