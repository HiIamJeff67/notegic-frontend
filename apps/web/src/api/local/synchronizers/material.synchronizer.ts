import type {
  HardDeleteMyMaterialsByIdsRequest,
  HardDeleteMyMaterialsByIdsResponse,
} from "@shared/api/interfaces/material.interface";
import { inArray } from "drizzle-orm";
import { localDB } from "@/api/local/db";
import { Item, RoutinesToItems } from "@/api/local/schemas";

export class MaterialLocalSynchronizer {
  static syncHardDeleteMyMaterialsByIds = async (
    request: HardDeleteMyMaterialsByIdsRequest,
    _response: HardDeleteMyMaterialsByIdsResponse
  ): Promise<void> => {
    if (!localDB.isReady) await localDB.ensureReady();
    if (request.body.materialIds.length === 0) return;
    await localDB.transaction(async tx => {
      await tx
        .delete(RoutinesToItems)
        .where(inArray(RoutinesToItems.itemId, request.body.materialIds));
      await tx.delete(Item).where(inArray(Item.id, request.body.materialIds));
    });
  };
}
