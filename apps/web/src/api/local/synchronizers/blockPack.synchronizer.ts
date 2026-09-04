import {
  CreateBlockPackRequest,
  CreateBlockPackResponse,
  CreateBlockPacksRequest,
  CreateBlockPacksResponse,
  DeleteMyBlockPackByIdRequest,
  DeleteMyBlockPackByIdResponse,
  DeleteMyBlockPacksByIdsRequest,
  DeleteMyBlockPacksByIdsResponse,
  GetMyBlockPacksByRootShelfIdResponse,
  GetMyBlockPackAndItsParentByIdResponse,
  GetMyBlockPackByIdResponse,
  GetMyBlockPacksByParentSubShelfIdResponse,
  MoveMyBlockPackByIdRequest,
  MoveMyBlockPackByIdResponse,
  MoveMyBlockPacksByParentSubShelfIdRequest,
  MoveMyBlockPacksByParentSubShelfIdResponse,
  MoveMyBlockPacksByParentSubShelfIdsRequest,
  MoveMyBlockPacksByParentSubShelfIdsResponse,
  RestoreMyBlockPackByIdRequest,
  RestoreMyBlockPackByIdResponse,
  RestoreMyBlockPacksByIdsRequest,
  RestoreMyBlockPacksByIdsResponse,
  UpdateMyBlockPackByIdRequest,
  UpdateMyBlockPackByIdResponse,
  UpdateMyBlockPacksByIdsRequest,
  UpdateMyBlockPacksByIdsResponse,
} from "@shared/api/interfaces/blockPack.interface";
import { AccessControlPermission } from "@shared/api/interfaces/enums/accessControlPermission.enum";
import { localDB } from "@/api/local/db";
import {
  BlockPack,
  RootShelf,
  SubShelf,
  UsersToShelves,
} from "@/api/local/schemas";
import { and, eq, exists, inArray, sql } from "drizzle-orm";

export class BlockPackLocalSynchronizer {
  private static getPassPermissionCheckSQL = (
    queryBuilder: Pick<typeof localDB, "select">,
    userPublicId: string,
    permissions: AccessControlPermission[],
    parentSubShelfId?: string
  ) =>
    exists(
      queryBuilder
        .select({ one: sql`1` })
        .from(UsersToShelves)
        .innerJoin(
          SubShelf,
          eq(SubShelf.rootShelfId, UsersToShelves.rootShelfId)
        )
        .where(
          and(
            eq(UsersToShelves.userPublicId, userPublicId),
            inArray(UsersToShelves.permission, permissions),
            parentSubShelfId
              ? eq(SubShelf.id, parentSubShelfId)
              : eq(SubShelf.id, BlockPack.parentSubShelfId)
          )
        )
    );

  static syncGetMyBlockPackById = async (
    response: GetMyBlockPackByIdResponse
  ): Promise<void> => {
    if (!localDB.isReady) await localDB.ensureReady();
    await localDB
      .insert(BlockPack)
      .values({
        id: response.data.id,
        parentSubShelfId: response.data.parentSubShelfId,
        name: response.data.name,
        icon: response.data.icon,
        headerBackgroundURL: response.data.headerBackgroundURL,
        blockCount: response.data.blockCount,
        deletedAt: response.data.deletedAt,
        updatedAt: response.data.updatedAt,
        createdAt: response.data.createdAt,
      })
      .onConflictDoUpdate({
        target: BlockPack.id,
        set: {
          parentSubShelfId: response.data.parentSubShelfId,
          name: response.data.name,
          icon: response.data.icon,
          headerBackgroundURL: response.data.headerBackgroundURL,
          blockCount: response.data.blockCount,
          deletedAt: response.data.deletedAt,
          updatedAt: response.data.updatedAt,
          createdAt: response.data.createdAt,
        },
      });
  };

  static syncGetMyBlockPackAndItsParentById = async (
    response: GetMyBlockPackAndItsParentByIdResponse
  ): Promise<void> => {
    if (!localDB.isReady) await localDB.ensureReady();
    await localDB.transaction(async tx => {
      await tx
        .insert(SubShelf)
        .values({
          id: response.data.parentSubShelfId,
          name: response.data.parentSubShelfName,
          rootShelfId: response.data.rootShelfId,
          prevSubShelfId: response.data.parentSubShelfPrevSubShelfId,
          path: response.data.parentSubShelfPath as any,
          deletedAt: response.data.parentSubShelfDeletedAt,
          updatedAt: response.data.parentSubShelfUpdatedAt,
          createdAt: response.data.parentSubShelfCreatedAt,
        })
        .onConflictDoUpdate({
          target: SubShelf.id,
          set: {
            name: response.data.parentSubShelfName,
            rootShelfId: response.data.rootShelfId,
            prevSubShelfId: response.data.parentSubShelfPrevSubShelfId,
            path: response.data.parentSubShelfPath as any,
            deletedAt: response.data.parentSubShelfDeletedAt,
            updatedAt: response.data.parentSubShelfUpdatedAt,
            createdAt: response.data.parentSubShelfCreatedAt,
          },
        });

      await tx
        .insert(BlockPack)
        .values({
          id: response.data.id,
          parentSubShelfId: response.data.parentSubShelfId,
          name: response.data.name,
          icon: response.data.icon,
          headerBackgroundURL: response.data.headerBackgroundURL,
          blockCount: response.data.blockCount,
          deletedAt: response.data.deletedAt,
          updatedAt: response.data.updatedAt,
          createdAt: response.data.createdAt,
        })
        .onConflictDoUpdate({
          target: BlockPack.id,
          set: {
            parentSubShelfId: response.data.parentSubShelfId,
            name: response.data.name,
            icon: response.data.icon,
            headerBackgroundURL: response.data.headerBackgroundURL,
            blockCount: response.data.blockCount,
            deletedAt: response.data.deletedAt,
            updatedAt: response.data.updatedAt,
            createdAt: response.data.createdAt,
          },
        });
    });
  };

  static syncGetMyBlockPacksByParentSubShelfId = async (
    response: GetMyBlockPacksByParentSubShelfIdResponse
  ): Promise<void> => {
    if (!localDB.isReady) await localDB.ensureReady();
    const blockPacks = response.data.map(blockPack => ({
      id: blockPack.id,
      parentSubShelfId: blockPack.parentSubShelfId,
      name: blockPack.name,
      icon: blockPack.icon,
      headerBackgroundURL: blockPack.headerBackgroundURL,
      blockCount: blockPack.blockCount,
      deletedAt: blockPack.deletedAt,
      updatedAt: blockPack.updatedAt,
      createdAt: blockPack.createdAt,
    }));
    if (blockPacks.length === 0) return;

    await localDB
      .insert(BlockPack)
      .values(blockPacks)
      .onConflictDoUpdate({
        target: BlockPack.id,
        set: {
          parentSubShelfId: sql`excluded.parent_sub_shelf_id`,
          name: sql`excluded.name`,
          icon: sql`excluded.icon`,
          headerBackgroundURL: sql`excluded.header_background_url`,
          blockCount: sql`excluded.block_count`,
          deletedAt: sql`excluded.deleted_at`,
          updatedAt: sql`excluded.updated_at`,
          createdAt: sql`excluded.created_at`,
        },
      });
  };

  static syncGetMyBlockPacksByRootShelfId = async (
    response: GetMyBlockPacksByRootShelfIdResponse
  ): Promise<void> => {
    if (!localDB.isReady) await localDB.ensureReady();
    const blockPacks = response.data.map(blockPack => ({
      id: blockPack.id,
      parentSubShelfId: blockPack.parentSubShelfId,
      name: blockPack.name,
      icon: blockPack.icon,
      headerBackgroundURL: blockPack.headerBackgroundURL,
      blockCount: blockPack.blockCount,
      deletedAt: blockPack.deletedAt,
      updatedAt: blockPack.updatedAt,
      createdAt: blockPack.createdAt,
    }));
    if (blockPacks.length === 0) return;

    await localDB
      .insert(BlockPack)
      .values(blockPacks)
      .onConflictDoUpdate({
        target: BlockPack.id,
        set: {
          parentSubShelfId: sql`excluded.parent_sub_shelf_id`,
          name: sql`excluded.name`,
          icon: sql`excluded.icon`,
          headerBackgroundURL: sql`excluded.header_background_url`,
          blockCount: sql`excluded.block_count`,
          deletedAt: sql`excluded.deleted_at`,
          updatedAt: sql`excluded.updated_at`,
          createdAt: sql`excluded.created_at`,
        },
      });
  };

  static syncCreateBlockPack = async (
    request: CreateBlockPackRequest,
    response: CreateBlockPackResponse
  ): Promise<void> => {
    if (!localDB.isReady) await localDB.ensureReady();
    await localDB.transaction(async tx => {
      await tx
        .insert(BlockPack)
        .values({
          id: response.data.id,
          parentSubShelfId: request.body.parentSubShelfId,
          name: request.body.name,
          icon: request.body.icon,
          headerBackgroundURL: request.body.headerBackgroundURL,
          blockCount: 0,
          updatedAt: response.data.createdAt,
          createdAt: response.data.createdAt,
        })
        .onConflictDoNothing();

      await tx
        .update(RootShelf)
        .set({
          itemCount: sql`${RootShelf.itemCount} + 1`,
          updatedAt: response.data.createdAt,
        })
        .where(eq(RootShelf.id, request.affected.rootShelfId));
    });
  };

  static syncCreateBlockPacks = async (
    request: CreateBlockPacksRequest,
    response: CreateBlockPacksResponse
  ): Promise<void> => {
    if (!localDB.isReady) await localDB.ensureReady();
    await localDB.transaction(async tx => {
      const createdBlockPacks = request.body.createdBlockPacks.map(
        (createdBlockPack, index) => ({
          id: response.data.ids[index],
          parentSubShelfId: createdBlockPack.parentSubShelfId,
          name: createdBlockPack.name,
          icon: createdBlockPack.icon,
          headerBackgroundURL: createdBlockPack.headerBackgroundURL,
          blockCount: 0,
          updatedAt: response.data.createdAt,
          createdAt: response.data.createdAt,
        })
      );
      if (createdBlockPacks.length > 0) {
        await tx.insert(BlockPack).values(createdBlockPacks);
      }

      const rootShelfIdToCountMap = new Map<string, number>();
      for (const rootShelfId of request.affected.rootShelfIds) {
        if (!rootShelfId) continue;
        rootShelfIdToCountMap.set(
          rootShelfId,
          (rootShelfIdToCountMap.get(rootShelfId) ?? 0) + 1
        );
      }

      for (const [rootShelfId, count] of rootShelfIdToCountMap.entries()) {
        await tx
          .update(RootShelf)
          .set({
            itemCount: sql`${RootShelf.itemCount} + ${count}`,
            updatedAt: response.data.createdAt,
          })
          .where(eq(RootShelf.id, rootShelfId));
      }
    });
  };

  static syncUpdateMyBlockPackById = async (
    request: UpdateMyBlockPackByIdRequest,
    response: UpdateMyBlockPackByIdResponse
  ): Promise<void> => {
    if (!localDB.isReady) await localDB.ensureReady();

    const setValues: Partial<{
      name: string;
      icon: string | null;
      headerBackgroundURL: string | null;
      updatedAt: Date;
    }> = {
      updatedAt: response.data.updatedAt,
    };

    if (request.body.values.name !== undefined) {
      setValues.name = request.body.values.name;
    }
    if (request.body.values.icon !== undefined) {
      setValues.icon = request.body.values.icon;
    }
    if (request.body.values.headerBackgroundURL !== undefined) {
      setValues.headerBackgroundURL = request.body.values.headerBackgroundURL;
    }
    if (request.body.setNull?.icon) {
      setValues.icon = null;
    }
    if (request.body.setNull?.headerBackgroundURL) {
      setValues.headerBackgroundURL = null;
    }

    await localDB
      .update(BlockPack)
      .set(setValues as any)
      .where(
        and(
          eq(BlockPack.id, request.body.blockPackId),
          BlockPackLocalSynchronizer.getPassPermissionCheckSQL(
            localDB,
            response.embedded.publicId,
            [
              AccessControlPermission.Owner,
              AccessControlPermission.Admin,
              AccessControlPermission.Write,
            ]
          )
        )
      );
  };

  static syncUpdateMyBlockPacksByIds = async (
    request: UpdateMyBlockPacksByIdsRequest,
    response: UpdateMyBlockPacksByIdsResponse
  ): Promise<void> => {
    if (!localDB.isReady) await localDB.ensureReady();
    await localDB.transaction(async tx => {
      for (const updatedBlockPack of request.body.updatedBlockPacks) {
        const setValues: Partial<{
          name: string;
          icon: string | null;
          headerBackgroundURL: string | null;
          updatedAt: Date;
        }> = {
          updatedAt: response.data.updatedAt,
        };

        if (updatedBlockPack.values.name !== undefined) {
          setValues.name = updatedBlockPack.values.name;
        }
        if (updatedBlockPack.values.icon !== undefined) {
          setValues.icon = updatedBlockPack.values.icon;
        }
        if (updatedBlockPack.values.headerBackgroundURL !== undefined) {
          setValues.headerBackgroundURL =
            updatedBlockPack.values.headerBackgroundURL;
        }
        if (updatedBlockPack.setNull?.icon) {
          setValues.icon = null;
        }
        if (updatedBlockPack.setNull?.headerBackgroundURL) {
          setValues.headerBackgroundURL = null;
        }

        await tx
          .update(BlockPack)
          .set(setValues as any)
          .where(
            and(
              eq(BlockPack.id, updatedBlockPack.blockPackId),
              BlockPackLocalSynchronizer.getPassPermissionCheckSQL(
                tx,
                response.embedded.publicId,
                [
                  AccessControlPermission.Owner,
                  AccessControlPermission.Admin,
                  AccessControlPermission.Write,
                ]
              )
            )
          );
      }
    });
  };

  static syncMoveMyBlockPackById = async (
    request: MoveMyBlockPackByIdRequest,
    response: MoveMyBlockPackByIdResponse
  ): Promise<void> => {
    if (!localDB.isReady) await localDB.ensureReady();
    await localDB
      .update(BlockPack)
      .set({
        parentSubShelfId: request.body.destinationParentSubShelfId,
        updatedAt: response.data.updatedAt,
      })
      .where(
        and(
          eq(BlockPack.id, request.body.blockPackId),
          BlockPackLocalSynchronizer.getPassPermissionCheckSQL(
            localDB,
            response.embedded.publicId,
            [
              AccessControlPermission.Owner,
              AccessControlPermission.Admin,
              AccessControlPermission.Write,
            ]
          )
        )
      );
  };

  static syncMoveMyBlockPacksByParentSubShelfId = async (
    request: MoveMyBlockPacksByParentSubShelfIdRequest,
    response: MoveMyBlockPacksByParentSubShelfIdResponse
  ): Promise<void> => {
    if (!localDB.isReady) await localDB.ensureReady();
    await localDB
      .update(BlockPack)
      .set({
        parentSubShelfId: request.body.destinationParentSubShelfId,
        updatedAt: response.data.updatedAt,
      })
      .where(
        and(
          inArray(BlockPack.id, request.body.blockPackIds),
          BlockPackLocalSynchronizer.getPassPermissionCheckSQL(
            localDB,
            response.embedded.publicId,
            [
              AccessControlPermission.Owner,
              AccessControlPermission.Admin,
              AccessControlPermission.Write,
            ]
          )
        )
      );
  };

  static syncMoveMyBlockPacksByParentSubShelfIds = async (
    request: MoveMyBlockPacksByParentSubShelfIdsRequest,
    response: MoveMyBlockPacksByParentSubShelfIdsResponse
  ): Promise<void> => {
    if (!localDB.isReady) await localDB.ensureReady();
    await localDB.transaction(async tx => {
      for (const movedBlockPacks of request.body.movedBlockPacks) {
        await tx
          .update(BlockPack)
          .set({
            parentSubShelfId: movedBlockPacks.destinationParentSubShelfId,
            updatedAt: response.data.updatedAt,
          })
          .where(
            and(
              inArray(BlockPack.id, movedBlockPacks.blockPackIds),
              BlockPackLocalSynchronizer.getPassPermissionCheckSQL(
                tx,
                response.embedded.publicId,
                [
                  AccessControlPermission.Owner,
                  AccessControlPermission.Admin,
                  AccessControlPermission.Write,
                ]
              )
            )
          );
      }
    });
  };

  static syncRestoreMyBlockPackById = async (
    request: RestoreMyBlockPackByIdRequest,
    response: RestoreMyBlockPackByIdResponse
  ): Promise<void> => {
    if (!localDB.isReady) await localDB.ensureReady();
    await localDB.transaction(async tx => {
      await tx
        .insert(BlockPack)
        .values({
          id: response.data.id,
          parentSubShelfId: response.data.parentSubShelfId,
          name: response.data.name,
          icon: response.data.icon,
          headerBackgroundURL: response.data.headerBackgroundURL,
          blockCount: response.data.blockCount,
          deletedAt: null,
          updatedAt: response.data.updatedAt,
          createdAt: response.data.createdAt,
        })
        .onConflictDoUpdate({
          target: BlockPack.id,
          set: {
            parentSubShelfId: response.data.parentSubShelfId,
            name: response.data.name,
            icon: response.data.icon,
            headerBackgroundURL: response.data.headerBackgroundURL,
            blockCount: response.data.blockCount,
            deletedAt: null,
            updatedAt: response.data.updatedAt,
            createdAt: response.data.createdAt,
          },
        });

      await tx
        .update(RootShelf)
        .set({
          itemCount: sql`${RootShelf.itemCount} + 1`,
          updatedAt: response.data.updatedAt,
        })
        .where(eq(RootShelf.id, request.affected.rootShelfId));
    });
  };

  static syncRestoreMyBlockPacksByIds = async (
    request: RestoreMyBlockPacksByIdsRequest,
    response: RestoreMyBlockPacksByIdsResponse
  ): Promise<void> => {
    if (!localDB.isReady) await localDB.ensureReady();
    await localDB.transaction(async tx => {
      const restoredBlockPacks = response.data.map(blockPack => ({
        id: blockPack.id,
        parentSubShelfId: blockPack.parentSubShelfId,
        name: blockPack.name,
        icon: blockPack.icon,
        headerBackgroundURL: blockPack.headerBackgroundURL,
        blockCount: blockPack.blockCount,
        deletedAt: null,
        updatedAt: blockPack.updatedAt,
        createdAt: blockPack.createdAt,
      }));
      if (restoredBlockPacks.length > 0) {
        await tx
          .insert(BlockPack)
          .values(restoredBlockPacks)
          .onConflictDoUpdate({
            target: BlockPack.id,
            set: {
              parentSubShelfId: sql`excluded.parent_sub_shelf_id`,
              name: sql`excluded.name`,
              icon: sql`excluded.icon`,
              headerBackgroundURL: sql`excluded.header_background_url`,
              blockCount: sql`excluded.block_count`,
              deletedAt: null,
              updatedAt: sql`excluded.updated_at`,
              createdAt: sql`excluded.created_at`,
            },
          });
      }

      const rootShelfIdToCountMap = new Map<string, number>();
      for (const rootShelfId of request.affected.rootShelfIds) {
        rootShelfIdToCountMap.set(
          rootShelfId,
          (rootShelfIdToCountMap.get(rootShelfId) ?? 0) + 1
        );
      }

      for (const [rootShelfId, count] of rootShelfIdToCountMap.entries()) {
        await tx
          .update(RootShelf)
          .set({
            itemCount: sql`${RootShelf.itemCount} + ${count}`,
            updatedAt: response.data[0]?.updatedAt ?? new Date(),
          })
          .where(eq(RootShelf.id, rootShelfId));
      }
    });
  };

  static syncDeleteMyBlockPackById = async (
    request: DeleteMyBlockPackByIdRequest,
    response: DeleteMyBlockPackByIdResponse
  ): Promise<void> => {
    if (!localDB.isReady) await localDB.ensureReady();
    await localDB.transaction(async tx => {
      await tx
        .update(BlockPack)
        .set({
          deletedAt: response.data.deletedAt,
          updatedAt: response.data.deletedAt,
        })
        .where(
          and(
            eq(BlockPack.id, request.body.blockPackId),
            BlockPackLocalSynchronizer.getPassPermissionCheckSQL(
              tx,
              response.embedded.publicId,
              [AccessControlPermission.Owner, AccessControlPermission.Admin]
            )
          )
        );

      await tx
        .update(RootShelf)
        .set({
          itemCount: sql`max(0, ${RootShelf.itemCount} - 1)`,
          updatedAt: response.data.deletedAt,
        })
        .where(eq(RootShelf.id, request.affected.rootShelfId));
    });
  };

  static syncDeleteMyBlockPacksByIds = async (
    request: DeleteMyBlockPacksByIdsRequest,
    response: DeleteMyBlockPacksByIdsResponse
  ): Promise<void> => {
    if (!localDB.isReady) await localDB.ensureReady();
    await localDB.transaction(async tx => {
      await tx
        .update(BlockPack)
        .set({
          deletedAt: response.data.deletedAt,
          updatedAt: response.data.deletedAt,
        })
        .where(
          and(
            inArray(BlockPack.id, request.body.blockPackIds),
            BlockPackLocalSynchronizer.getPassPermissionCheckSQL(
              tx,
              response.embedded.publicId,
              [AccessControlPermission.Owner, AccessControlPermission.Admin]
            )
          )
        );

      const rootShelfIdToCountMap = new Map<string, number>();
      for (const rootShelfId of request.affected.rootShelfIds) {
        rootShelfIdToCountMap.set(
          rootShelfId,
          (rootShelfIdToCountMap.get(rootShelfId) ?? 0) + 1
        );
      }

      for (const [rootShelfId, count] of rootShelfIdToCountMap.entries()) {
        await tx
          .update(RootShelf)
          .set({
            itemCount: sql`max(0, ${RootShelf.itemCount} - ${count})`,
            updatedAt: response.data.deletedAt,
          })
          .where(eq(RootShelf.id, rootShelfId));
      }
    });
  };
}
