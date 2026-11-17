import { z } from "zod";

export enum RealtimePermission {
  Read = "read",
  Write = "write",
}

export const AllRealtimePermissions: RealtimePermission[] =
  Object.values(RealtimePermission);

export const RealtimePermissionSchema = z.enum(AllRealtimePermissions);
