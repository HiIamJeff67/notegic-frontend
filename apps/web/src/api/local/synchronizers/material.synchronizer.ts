import { ItemType, MaterialContentType } from "@shared/api/interfaces/enums";
import type {
  CreateMyMaterialRequest,
  CreateMyMaterialResponse,
  GetMyMaterialAndItsParentByIdResponse,
  GetMyMaterialByIdResponse,
  GetMyMaterialsByParentSubShelfIdResponse,
  GetMyMaterialsByRootShelfIdResponse,
  HardDeleteMyMaterialsByIdsRequest,
  HardDeleteMyMaterialsByIdsResponse,
} from "@shared/api/interfaces/material.interface";
import { eq, inArray, sql } from "drizzle-orm";
import { localDB } from "@/api/local/db";
import {
  Item,
  Material,
  RoutinesToItems,
  SubShelf,
  Transaction,
} from "@/api/local/schemas";

// Only rewrite entity references, never matching names, URLs or other user content.
export const replaceMaterialId = <T>(
  value: T,
  offlineId: string,
  remoteId: string
): T => {
  if (Array.isArray(value)) {
    return value.map(entry =>
      replaceMaterialId(entry, offlineId, remoteId)
    ) as T;
  }
  if (value === null || typeof value !== "object" || value instanceof Date)
    return value;
  return Object.fromEntries(
    Object.entries(value).map(([key, entry]) => [
      key,
      (key === "materialId" || key === "itemId") && entry === offlineId
        ? remoteId
        : (key === "materialIds" || key === "itemIds") && Array.isArray(entry)
          ? entry.map(id => (id === offlineId ? remoteId : id))
          : replaceMaterialId(entry, offlineId, remoteId),
    ])
  ) as T;
};

export class MaterialLocalSynchronizer {
  static syncGetMyMaterialById = async (
    response: GetMyMaterialByIdResponse
  ): Promise<void> => {
    if (!localDB.isReady) await localDB.ensureReady();
    if (response.success === false) return;
    const rootShelfId = await MaterialLocalSynchronizer.rootShelfIdOf(
      response.data.parentSubShelfId
    );
    if (!rootShelfId) return;
    await MaterialLocalSynchronizer.upsertMaterials([
      { ...response.data, rootShelfId },
    ]);
  };

  static syncGetMyMaterialAndItsParentById = async (
    response: GetMyMaterialAndItsParentByIdResponse
  ): Promise<void> => {
    if (!localDB.isReady) await localDB.ensureReady();
    if (response.success === false) return;
    await MaterialLocalSynchronizer.upsertMaterials([
      {
        id: response.data.id,
        parentSubShelfId: response.data.parentSubShelfId,
        rootShelfId: response.data.rootShelfId,
        name: response.data.name,
        size: response.data.size,
        contentType: response.data.contentType,
        parseMediaType: response.data.parseMediaType,
        objectKey: response.data.objectKey,
        deletedAt: response.data.deletedAt,
        updatedAt: response.data.updatedAt,
        createdAt: response.data.createdAt,
      },
    ]);
  };

  static syncGetMyMaterialsByParentSubShelfId = async (
    response: GetMyMaterialsByParentSubShelfIdResponse
  ): Promise<void> => {
    if (!localDB.isReady) await localDB.ensureReady();
    if (response.success === false || response.data.length === 0) return;
    const rootShelfId = await MaterialLocalSynchronizer.rootShelfIdOf(
      response.data[0].parentSubShelfId
    );
    if (!rootShelfId) return;
    await MaterialLocalSynchronizer.upsertMaterials(
      response.data.map(material => ({ ...material, rootShelfId }))
    );
  };

  static syncGetMyMaterialsByRootShelfId = async (
    response: GetMyMaterialsByRootShelfIdResponse,
    rootShelfId: string
  ): Promise<void> => {
    if (!localDB.isReady) await localDB.ensureReady();
    if (response.success === false) return;
    await MaterialLocalSynchronizer.upsertMaterials(
      response.data.map(material => ({ ...material, rootShelfId }))
    );
  };

  private static rootShelfIdOf = async (
    parentSubShelfId: string
  ): Promise<string | undefined> => {
    const shelf = (
      await localDB
        .select({ rootShelfId: SubShelf.rootShelfId })
        .from(SubShelf)
        .where(eq(SubShelf.id, parentSubShelfId))
        .limit(1)
    )[0];
    return shelf?.rootShelfId;
  };

  static syncCreateMyMaterial = async (
    request: CreateMyMaterialRequest,
    response: CreateMyMaterialResponse
  ): Promise<void> => {
    if (!localDB.isReady) await localDB.ensureReady();
    if (response.success === false) return;
    await MaterialLocalSynchronizer.upsertMaterials([
      {
        id: response.data.id,
        parentSubShelfId: request.body.parentSubShelfId,
        rootShelfId: request.affected.rootShelfId,
        name: request.body.name,
        size: 0,
        contentType: MaterialContentType.PlainText,
        parseMediaType: "",
        objectKey: "",
        deletedAt: null,
        updatedAt: response.data.createdAt,
        createdAt: response.data.createdAt,
      },
    ]);
  };

  static acknowledgeCreate = async (
    offlineId: string,
    remoteId: string,
    sequences: Set<number>
  ): Promise<void> => {
    if (!localDB.isReady) await localDB.ensureReady();
    await localDB.transaction(async tx => {
      if (offlineId !== remoteId) {
        const [material] = await tx
          .select()
          .from(Material)
          .where(eq(Material.id, offlineId));
        if (material) {
          const moved = { ...material, id: remoteId };
          await tx
            .insert(Material)
            .values(moved)
            .onConflictDoUpdate({ target: Material.id, set: moved });
        }
        const [item] = await tx
          .select()
          .from(Item)
          .where(eq(Item.id, offlineId));
        if (item) {
          const moved = { ...item, id: remoteId };
          await tx
            .insert(Item)
            .values(moved)
            .onConflictDoUpdate({ target: Item.id, set: moved });
        }
        await tx
          .update(RoutinesToItems)
          .set({ itemId: remoteId })
          .where(eq(RoutinesToItems.itemId, offlineId));
        for (const pending of await tx.select().from(Transaction)) {
          const body = replaceMaterialId(pending.body, offlineId, remoteId);
          const affected = replaceMaterialId(
            pending.affected,
            offlineId,
            remoteId
          );
          if (
            JSON.stringify(body) !== JSON.stringify(pending.body) ||
            JSON.stringify(affected) !== JSON.stringify(pending.affected)
          ) {
            await tx
              .update(Transaction)
              .set({ body, affected })
              .where(eq(Transaction.sequence, pending.sequence));
          }
        }
        await tx.delete(Item).where(eq(Item.id, offlineId));
        await tx.delete(Material).where(eq(Material.id, offlineId));
      }
      // Persist the acknowledgement with the remap so a reload cannot repeat CREATE.
      if (sequences.size) {
        await tx
          .delete(Transaction)
          .where(inArray(Transaction.sequence, [...sequences]));
      }
    });
  };

  private static upsertMaterials = async (
    materials: {
      id: string;
      parentSubShelfId: string;
      rootShelfId: string;
      name: string;
      size: number;
      contentType: (typeof Material.$inferInsert)["contentType"];
      parseMediaType: string;
      objectKey: string;
      deletedAt: Date | null;
      updatedAt: Date;
      createdAt: Date;
    }[]
  ): Promise<void> => {
    if (materials.length === 0) return;
    await localDB.transaction(async tx => {
      await tx
        .insert(Material)
        .values(materials)
        .onConflictDoUpdate({
          target: Material.id,
          set: {
            parentSubShelfId: sql`excluded.parent_sub_shelf_id`,
            rootShelfId: sql`excluded.root_shelf_id`,
            name: sql`excluded.name`,
            size: sql`excluded.size`,
            contentType: sql`excluded.content_type`,
            parseMediaType: sql`excluded.parse_media_type`,
            objectKey: sql`excluded.object_key`,
            deletedAt: sql`excluded.deleted_at`,
            updatedAt: sql`excluded.updated_at`,
            createdAt: sql`excluded.created_at`,
          },
        });
      await tx
        .insert(Item)
        .values(
          materials.map(material => ({
            id: material.id,
            parentSubShelfId: material.parentSubShelfId,
            rootShelfId: material.rootShelfId,
            type: ItemType.Material,
            deletedAt: material.deletedAt,
            updatedAt: material.updatedAt,
            createdAt: material.createdAt,
          }))
        )
        .onConflictDoUpdate({
          target: Item.id,
          set: {
            parentSubShelfId: sql`excluded.parent_sub_shelf_id`,
            rootShelfId: sql`excluded.root_shelf_id`,
            type: sql`excluded.type`,
            deletedAt: sql`excluded.deleted_at`,
            updatedAt: sql`excluded.updated_at`,
          },
        });
    });
  };

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
