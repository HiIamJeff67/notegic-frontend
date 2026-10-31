import { generateUUID } from "@shared/lib/uuid/uuidv4.type";

export enum DNDType {
  DraggableSubShelf = "DRAGGABLE_SUB_SHELF",
  DraggableMaterial = "DRAGGABLE_MATERIAL",
  DraggableWidget = "DRAGGABLE_WIDGET",
  DraggableTimeRailsStation = "DRAGGABLE_TIME_RAILS_STATION",
}

export const AllDNDTypes: DNDType[] = Object.values(DNDType);

export const generateDynamicDNDType = (purpose: string): string => {
  return `DRAGGABLE_${generateUUID().toString()}_${purpose.toUpperCase()}`;
};
