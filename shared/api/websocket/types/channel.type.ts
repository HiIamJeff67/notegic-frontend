import { RealtimePermissionSchema } from "@shared/api/interfaces/enums";
import type { z } from "zod";

export type RealtimeRegisteredChannel = {
  blockPackId: string;
  permission: z.infer<typeof RealtimePermissionSchema>;
  connectorChannelId: number | null;
  pendingRequestId: string | null;
  ticketRetryCount: number;
  resyncRequired: boolean;
  documentQuotaPolicyVersion: number | null;
  maximumBlockCount: number | null;
};
