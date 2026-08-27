import { RealtimePermissionSchema } from "@shared/api/interfaces/enums";
import type { UUID } from "crypto";
import { useContext, useEffect } from "react";
import type { z } from "zod";
import { RealtimeContext } from "@/providers/RealtimeProvider";

export const useRealtime = () => {
  const context = useContext(RealtimeContext);
  if (!context) {
    throw new Error("useRealtime must be used within RealtimeProvider");
  }
  return context;
};

export const useBlockPackRealtimeChannel = (
  blockPackId: UUID,
  permission: z.infer<typeof RealtimePermissionSchema>
) => {
  const {
    getOrCreateBlockPackChannel,
    retainBlockPackChannel,
    releaseBlockPackChannel,
    getBlockPackChannel,
  } = useRealtime();
  const channel = getOrCreateBlockPackChannel(blockPackId, permission);

  useEffect(() => {
    const retainedBlockPackId = blockPackId;
    retainBlockPackChannel(blockPackId, permission);
    return () => {
      releaseBlockPackChannel(retainedBlockPackId);
    };
  }, [
    blockPackId,
    permission,
    releaseBlockPackChannel,
    retainBlockPackChannel,
  ]);

  return getBlockPackChannel(blockPackId) ?? channel;
};
