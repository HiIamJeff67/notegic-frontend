import {
  AccessControlPermission,
  SupportedIcon,
} from "@shared/api/interfaces/enums";
import type { UUID } from "crypto";
import type { RoutineNode } from "./routineNode.type";
import type { RoutineTaskNode } from "./routineTaskNode.type";

export interface StationNode {
  id: UUID;
  name: string;
  description: string;
  icon: SupportedIcon | null;
  headerBackgroundURL: string | null;
  permission: AccessControlPermission;
  routineCount: number;
  deletedAt: Date | null;
  updatedAt: Date;
  createdAt: Date;

  isOpen: boolean;
  isExpanded: boolean;

  routines: RoutineNode[];
  routineTasks: RoutineTaskNode[];
}

export const getDefaultStationNode = (stationId: UUID): StationNode => ({
  id: stationId,
  name: "Untitled",
  description: "",
  icon: null,
  headerBackgroundURL: null,
  permission: AccessControlPermission.Read,
  routineCount: 0,
  deletedAt: null,
  updatedAt: new Date(),
  createdAt: new Date(),

  isOpen: false,
  isExpanded: false,

  routines: [],
  routineTasks: [],
});
