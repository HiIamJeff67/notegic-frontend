import type { UUID } from "crypto";
import type {
  GetBlockPackParticipantsRequest,
  GetBlockPackParticipantsResponse,
} from "@shared/api/interfaces/realtime.interface";
import { queryFnGetBlockPackParticipants } from "@/api/invokers/realtime.invoker";
import { UseQueryDefaultOptions } from "@shared/api/queryHookOptions";
import { queryKeys } from "@shared/api/queryKeys";
import { useQuery, type UseQueryOptions } from "@tanstack/react-query";

export const useGetBlockPackParticipants = (
  hookRequest?: GetBlockPackParticipantsRequest,
  options?: Partial<UseQueryOptions<GetBlockPackParticipantsResponse, Error>>
) =>
  useQuery<GetBlockPackParticipantsResponse, Error>({
    queryKey: queryKeys.realtime.blockPackParticipants(
      hookRequest?.param.blockPackId as UUID | undefined
    ),
    queryFn: async () => {
      if (!hookRequest) {
        throw new Error("GetBlockPackParticipants request is required");
      }

      return queryFnGetBlockPackParticipants(hookRequest);
    },
    staleTime: UseQueryDefaultOptions.staleTime,
    refetchOnWindowFocus: UseQueryDefaultOptions.refetchOnWindowFocus,
    refetchOnMount: UseQueryDefaultOptions.refetchOnMount,
    ...options,
    enabled: hookRequest ? (options?.enabled ?? true) : false,
  });
