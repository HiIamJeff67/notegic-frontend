import { RealtimePermissionSchema } from "@shared/api/interfaces/enums";
import { RealtimeProtocolVersion } from "@shared/constants/version.constants";
import type { z } from "zod";

export type RealtimeConnectionTicket = {
  realtimeEndpoint: string;
  realtimeProtocolVersion: typeof RealtimeProtocolVersion;
  connectionTicket: string;
  expiresAt: Date;
};

export type RealtimeBlockPackChannelTicket = {
  channelType: "BlockPack";
  channelId: string;
  roomName: string;
  fragmentName: string;
  schemaId: "notezy.blocknote";
  schemaVersion: 1;
  realtimeProtocolVersion: typeof RealtimeProtocolVersion;
  permission: z.infer<typeof RealtimePermissionSchema>;
  channelTicket: string;
  expiresAt: Date;
  lastUpdateSequence: number;
  compactedUntilSequence: number;
};
