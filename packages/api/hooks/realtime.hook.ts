import type { GetBlockPackParticipantsRequest } from "@shared/api/interfaces/realtime.interface";
import { queryFnGetBlockPackParticipants } from "@shared/api/invokers/realtime.invoker";
import { UseQueryDefaultOptions } from "@shared/api/queryHookOptions";
import { queryKeys } from "@shared/api/queryKeys";
import { useQuery } from "@tanstack/react-query";
import type { UUID } from "crypto";

export const useGetBlockPackParticipants = (
  func: Parameters<typeof queryFnGetBlockPackParticipants>[1],
  request?: Parameters<typeof queryFnGetBlockPackParticipants>[0]
) =>
  useQuery({
    queryKey: queryKeys.realtime.blockPackParticipants(
      request?.param.blockPackId as UUID | undefined
    ),
    enabled: request !== undefined,
    queryFn: () =>
      queryFnGetBlockPackParticipants(
        request as GetBlockPackParticipantsRequest,
        func
      ),
    staleTime: UseQueryDefaultOptions.staleTime,
    refetchOnWindowFocus: UseQueryDefaultOptions.refetchOnWindowFocus,
    refetchOnMount: UseQueryDefaultOptions.refetchOnMount,
  });
