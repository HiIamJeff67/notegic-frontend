import type {
  GetBlockPackParticipantsRequest,
  GetBlockPackParticipantsResponse,
} from "@shared/api/interfaces/realtime.interface";
import { UseQueryDefaultOptions } from "@shared/api/queryHookOptions";
import { queryKeys } from "@shared/api/queryKeys";
import { type UseQueryOptions, useQuery } from "@tanstack/react-query";
import type { UUID } from "crypto";
import { queryFnGetBlockPackParticipants } from "@/api/invokers/realtime.invoker";

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
