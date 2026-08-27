import { AccessControlPermission } from "@shared/api/interfaces/enums/accessControlPermission.enum";
import {
  MoveMySubShelvesByRootShelfIdsRequest,
  MoveMySubShelvesByRootShelfIdsResponse,
  CreateSubShelfByRootShelfIdRequest,
  CreateSubShelfByRootShelfIdResponse,
  CreateSubShelvesByRootShelfIdsRequest,
  CreateSubShelvesByRootShelfIdsResponse,
  DeleteMySubShelfByIdRequest,
  DeleteMySubShelfByIdResponse,
  DeleteMySubShelvesByIdsRequest,
  DeleteMySubShelvesByIdsResponse,
  GetAllMySubShelvesByRootShelfIdResponse,
  GetMySubShelfByIdResponse,
  GetMySubShelvesAndItemsByPrevSubShelfIdResponse,
  GetMySubShelvesByPrevSubShelfIdResponse,
  MoveMySubShelfRequest,
  MoveMySubShelfResponse,
  MoveMySubShelvesByRootShelfIdRequest,
  MoveMySubShelvesByRootShelfIdResponse,
  RestoreMySubShelfByIdRequest,
  RestoreMySubShelfByIdResponse,
  RestoreMySubShelvesByIdsRequest,
  RestoreMySubShelvesByIdsResponse,
  UpdateMySubShelfByIdRequest,
  UpdateMySubShelfByIdResponse,
  UpdateMySubShelvesByIdsRequest,
  UpdateMySubShelvesByIdsResponse,
} from "@shared/api/interfaces/subShelf.interface";
import { localDB } from "@/api/local/db";
import {
  BlockPack,
  RootShelf,
  SubShelf,
  UsersToShelves,
} from "@/api/local/schemas";
import type { UUID } from "crypto";
import { and, eq, exists, inArray, sql } from "drizzle-orm";

export class SubShelfLocalSynchronizer {
  private static getPassPermissionCheckSQL = (
    queryBuilder: Pick<typeof localDB, "select">,
    userPublicId: string,
    permissions: AccessControlPermission[],
    rootShelfId?: string
  ) =>
    exists(
      queryBuilder
        .select({ one: sql`1` })
        .from(UsersToShelves)
        .where(
          and(
            eq(UsersToShelves.userPublicId, userPublicId),
            rootShelfId
              ? eq(UsersToShelves.rootShelfId, rootShelfId)
              : eq(UsersToShelves.rootShelfId, SubShelf.rootShelfId),
            inArray(UsersToShelves.permission, permissions)
          )
        )
    );

  static syncGetMySubShelfById = async (
    response: GetMySubShelfByIdResponse
  ): Promise<void> => {
    if (!localDB.isReady) await localDB.ensureReady();
    await localDB
      .insert(SubShelf)
      .values({
        id: response.data.id,
        name: response.data.name,
        rootShelfId: response.data.rootShelfId,
        prevSubShelfId: response.data.prevSubShelfId,
        path: response.data.path as UUID[],
        deletedAt: response.data.deletedAt,
        updatedAt: response.data.updatedAt,
        createdAt: response.data.createdAt,
      })
      .onConflictDoUpdate({
        target: SubShelf.id,
        set: {
          name: response.data.name,
          rootShelfId: response.data.rootShelfId,
          prevSubShelfId: response.data.prevSubShelfId,
          path: response.data.path as UUID[],
          deletedAt: response.data.deletedAt,
          updatedAt: response.data.updatedAt,
          createdAt: response.data.createdAt,
        },
      });
  };

  static syncGetMySubShelvesByPrevSubShelfId = async (
    response: GetMySubShelvesByPrevSubShelfIdResponse
  ): Promise<void> => {
    if (!localDB.isReady) await localDB.ensureReady();

    const subShelves = response.data.map(subShelf => ({
      id: subShelf.id,
      name: subShelf.name,
      rootShelfId: subShelf.rootShelfId,
      prevSubShelfId: subShelf.prevSubShelfId,
      path: subShelf.path as UUID[],
      deletedAt: subShelf.deletedAt,
      updatedAt: subShelf.updatedAt,
      createdAt: subShelf.createdAt,
    }));
    if (subShelves.length === 0) return;

    await localDB
      .insert(SubShelf)
      .values(subShelves)
      .onConflictDoUpdate({
        target: SubShelf.id,
        set: {
          name: sql`excluded.name`,
          rootShelfId: sql`excluded.root_shelf_id`,
          prevSubShelfId: sql`excluded.prev_sub_shelf_id`,
          path: sql`excluded.path`,
          deletedAt: sql`excluded.deleted_at`,
          updatedAt: sql`excluded.updated_at`,
          createdAt: sql`excluded.created_at`,
        },
      });
  };

  static syncGetAllMySubShelvesByRootShelfId = async (
    response: GetAllMySubShelvesByRootShelfIdResponse
  ): Promise<void> => {
    if (!localDB.isReady) await localDB.ensureReady();

    const subShelves = response.data.map(subShelf => ({
      id: subShelf.id,
      name: subShelf.name,
      rootShelfId: subShelf.rootShelfId,
      prevSubShelfId: subShelf.prevSubShelfId,
      path: subShelf.path as UUID[],
      deletedAt: subShelf.deletedAt,
      updatedAt: subShelf.updatedAt,
      createdAt: subShelf.createdAt,
    }));
    if (subShelves.length === 0) return;

    await localDB
      .insert(SubShelf)
      .values(subShelves)
      .onConflictDoUpdate({
        target: SubShelf.id,
        set: {
          name: sql`excluded.name`,
          rootShelfId: sql`excluded.root_shelf_id`,
          prevSubShelfId: sql`excluded.prev_sub_shelf_id`,
          path: sql`excluded.path`,
          deletedAt: sql`excluded.deleted_at`,
          updatedAt: sql`excluded.updated_at`,
          createdAt: sql`excluded.created_at`,
        },
      });
  };

  static syncGetMySubShelvesAndItemsByPrevSubShelfId = async (
    response: GetMySubShelvesAndItemsByPrevSubShelfIdResponse
  ): Promise<void> => {
    if (!localDB.isReady) await localDB.ensureReady();

    const subShelves = response.data.subShelves.map(subShelf => ({
      id: subShelf.id,
      name: subShelf.name,
      rootShelfId: subShelf.rootShelfId,
      prevSubShelfId: subShelf.prevSubShelfId,
      path: subShelf.path as UUID[],
      deletedAt: subShelf.deletedAt,
      updatedAt: subShelf.updatedAt,
      createdAt: subShelf.createdAt,
    }));
    const blockPacks = response.data.blockPacks.map(blockPack => ({
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

    await localDB.transaction(async tx => {
      if (subShelves.length > 0) {
        await tx
          .insert(SubShelf)
          .values(subShelves)
          .onConflictDoUpdate({
            target: SubShelf.id,
            set: {
              name: sql`excluded.name`,
              rootShelfId: sql`excluded.root_shelf_id`,
              prevSubShelfId: sql`excluded.prev_sub_shelf_id`,
              path: sql`excluded.path`,
              deletedAt: sql`excluded.deleted_at`,
              updatedAt: sql`excluded.updated_at`,
              createdAt: sql`excluded.created_at`,
            },
          });
      }

      if (blockPacks.length > 0) {
        await tx
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
      }
    });
  };

  static syncCreateSubShelfByRootShelfId = async (
    request: CreateSubShelfByRootShelfIdRequest,
    response: CreateSubShelfByRootShelfIdResponse
  ): Promise<void> => {
    if (!localDB.isReady) await localDB.ensureReady();
    await localDB.transaction(async tx => {
      let path: UUID[] = [];
      if (request.body.prevSubShelfId !== null) {
        const prevSubShelf = await tx.query.SubShelf.findFirst({
          where: eq(SubShelf.id, request.body.prevSubShelfId),
        });
        if (prevSubShelf !== undefined) {
          path = prevSubShelf.path;
        }
      }

      await tx
        .insert(SubShelf)
        .values({
          id: response.data.id,
          name: request.body.name,
          rootShelfId: request.body.rootShelfId,
          prevSubShelfId: request.body.prevSubShelfId,
          path,
          deletedAt: null,
          updatedAt: response.data.createdAt,
          createdAt: response.data.createdAt,
        })
        .onConflictDoNothing();

      await tx
        .update(RootShelf)
        .set({
          subShelfCount: sql`${RootShelf.subShelfCount} + 1`,
          updatedAt: response.data.createdAt,
        })
        .where(
          and(
            eq(RootShelf.id, request.body.rootShelfId),
            SubShelfLocalSynchronizer.getPassPermissionCheckSQL(
              tx,
              response.embedded.publicId,
              [
                AccessControlPermission.Owner,
                AccessControlPermission.Admin,
                AccessControlPermission.Write,
              ],
              request.body.rootShelfId
            )
          )
        );
    });
  };

  static syncCreateSubShelvesByRootShelfIds = async (
    request: CreateSubShelvesByRootShelfIdsRequest,
    response: CreateSubShelvesByRootShelfIdsResponse
  ): Promise<void> => {
    if (!localDB.isReady) await localDB.ensureReady();
    await localDB.transaction(async tx => {
      const prevSubShelfIds = request.body.createdSubShelves
        .map(subShelf => subShelf.prevSubShelfId)
        .filter((id): id is UUID => id !== null);

      const prevSubShelves =
        prevSubShelfIds.length === 0
          ? []
          : await tx.query.SubShelf.findMany({
              where: inArray(SubShelf.id, prevSubShelfIds),
              columns: {
                id: true,
                path: true,
              },
            });

      const idToPrevPathMap = new Map<UUID, UUID[]>(
        prevSubShelves.map(prevSubShelf => [
          prevSubShelf.id as UUID,
          prevSubShelf.path ?? [],
        ])
      );

      const createdSubShelves = request.body.createdSubShelves.map(
        (createdSubShelf, index) => ({
          id: response.data.ids[index],
          name: createdSubShelf.name,
          rootShelfId: createdSubShelf.rootShelfId,
          prevSubShelfId: createdSubShelf.prevSubShelfId,
          path:
            createdSubShelf.prevSubShelfId === null
              ? []
              : (idToPrevPathMap.get(createdSubShelf.prevSubShelfId as UUID) ??
                []),
          deletedAt: null,
          updatedAt: response.data.createdAt,
          createdAt: response.data.createdAt,
        })
      );
      if (createdSubShelves.length > 0) {
        await tx.insert(SubShelf).values(createdSubShelves);
      }

      const rootShelfIdToCountMap = new Map<string, number>();
      for (const createdSubShelf of request.body.createdSubShelves) {
        rootShelfIdToCountMap.set(
          createdSubShelf.rootShelfId,
          (rootShelfIdToCountMap.get(createdSubShelf.rootShelfId) ?? 0) + 1
        );
      }

      for (const [rootShelfId, count] of rootShelfIdToCountMap.entries()) {
        await tx
          .update(RootShelf)
          .set({
            subShelfCount: sql`${RootShelf.subShelfCount} + ${count}`,
            updatedAt: response.data.createdAt,
          })
          .where(
            and(
              eq(RootShelf.id, rootShelfId),
              SubShelfLocalSynchronizer.getPassPermissionCheckSQL(
                tx,
                response.embedded.publicId,
                [
                  AccessControlPermission.Owner,
                  AccessControlPermission.Admin,
                  AccessControlPermission.Write,
                ],
                rootShelfId
              )
            )
          );
      }
    });
  };

  static syncUpdateMySubShelfById = async (
    request: UpdateMySubShelfByIdRequest,
    response: UpdateMySubShelfByIdResponse
  ): Promise<void> => {
    if (!localDB.isReady) await localDB.ensureReady();
    await localDB
      .update(SubShelf)
      .set({
        name: request.body.values.name,
        updatedAt: response.data.updatedAt,
      })
      .where(
        and(
          eq(SubShelf.id, request.body.subShelfId),
          SubShelfLocalSynchronizer.getPassPermissionCheckSQL(
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

  static syncUpdateMySubShelvesByIds = async (
    request: UpdateMySubShelvesByIdsRequest,
    response: UpdateMySubShelvesByIdsResponse
  ): Promise<void> => {
    if (!localDB.isReady) await localDB.ensureReady();

    const updatedSubShelvesWithName = request.body.updatedSubShelves.filter(
      updatedSubShelf => updatedSubShelf.values.name !== undefined
    );
    if (updatedSubShelvesWithName.length === 0) return;

    await localDB
      .update(SubShelf)
      .set({
        name: sql`CASE ${SubShelf.id}
          ${sql.join(
            updatedSubShelvesWithName.map(
              updatedSubShelf =>
                sql`WHEN ${updatedSubShelf.subShelfId} THEN ${updatedSubShelf.values.name}`
            ),
            sql` `
          )}
          ELSE ${SubShelf.name}
        END`,
        updatedAt: response.data.updatedAt,
      })
      .where(
        and(
          inArray(
            SubShelf.id,
            updatedSubShelvesWithName.map(
              updatedSubShelf => updatedSubShelf.subShelfId
            )
          ),
          SubShelfLocalSynchronizer.getPassPermissionCheckSQL(
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

  static syncMoveMySubShelf = async (
    request: MoveMySubShelfRequest,
    response: MoveMySubShelfResponse
  ): Promise<void> => {
    if (!localDB.isReady) await localDB.ensureReady();
    await localDB.transaction(async tx => {
      if (
        request.body.sourceRootShelfId !== request.body.destinationRootShelfId
      ) {
        await tx
          .update(RootShelf)
          .set({
            subShelfCount: sql`max(0, ${RootShelf.subShelfCount} - 1)`,
            updatedAt: response.data.updatedAt,
          })
          .where(
            and(
              eq(RootShelf.id, request.body.sourceRootShelfId),
              SubShelfLocalSynchronizer.getPassPermissionCheckSQL(
                tx,
                response.embedded.publicId,
                [
                  AccessControlPermission.Owner,
                  AccessControlPermission.Admin,
                  AccessControlPermission.Write,
                ],
                request.body.sourceRootShelfId
              )
            )
          );

        await tx
          .update(RootShelf)
          .set({
            subShelfCount: sql`${RootShelf.subShelfCount} + 1`,
            updatedAt: response.data.updatedAt,
          })
          .where(
            and(
              eq(RootShelf.id, request.body.destinationRootShelfId),
              SubShelfLocalSynchronizer.getPassPermissionCheckSQL(
                tx,
                response.embedded.publicId,
                [
                  AccessControlPermission.Owner,
                  AccessControlPermission.Admin,
                  AccessControlPermission.Write,
                ],
                request.body.destinationRootShelfId
              )
            )
          );

        if (request.affected.childSubShelfIds.length > 0) {
          await tx
            .update(SubShelf)
            .set({
              rootShelfId: request.body.destinationRootShelfId,
              updatedAt: response.data.updatedAt,
            })
            .where(inArray(SubShelf.id, request.affected.childSubShelfIds));
        }
      }

      await tx
        .update(SubShelf)
        .set({
          rootShelfId: request.body.destinationRootShelfId,
          prevSubShelfId: request.body.destinationSubShelfId,
          updatedAt: response.data.updatedAt,
        })
        .where(
          and(
            eq(SubShelf.id, request.body.sourceSubShelfId),
            SubShelfLocalSynchronizer.getPassPermissionCheckSQL(
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
    });
  };

  static syncMoveMySubShelvesByRootShelfId = async (
    request: MoveMySubShelvesByRootShelfIdRequest,
    response: MoveMySubShelvesByRootShelfIdResponse
  ): Promise<void> => {
    if (!localDB.isReady) await localDB.ensureReady();
    await localDB.transaction(async tx => {
      if (
        request.body.sourceRootShelfId !== request.body.destinationRootShelfId
      ) {
        await tx
          .update(RootShelf)
          .set({
            subShelfCount: sql`max(0, ${RootShelf.subShelfCount} - ${request.body.sourceSubShelfIds.length})`,
            updatedAt: response.data.updatedAt,
          })
          .where(eq(RootShelf.id, request.body.sourceRootShelfId));

        await tx
          .update(RootShelf)
          .set({
            subShelfCount: sql`${RootShelf.subShelfCount} + ${request.body.sourceSubShelfIds.length}`,
            updatedAt: response.data.updatedAt,
          })
          .where(eq(RootShelf.id, request.body.destinationRootShelfId));

        if (request.affected.childSubShelfIds.length > 0) {
          await tx
            .update(SubShelf)
            .set({
              rootShelfId: request.body.destinationRootShelfId,
              updatedAt: response.data.updatedAt,
            })
            .where(inArray(SubShelf.id, request.affected.childSubShelfIds));
        }
      }

      await tx
        .update(SubShelf)
        .set({
          rootShelfId: request.body.destinationRootShelfId,
          prevSubShelfId: request.body.destinationSubShelfId,
          updatedAt: response.data.updatedAt,
        })
        .where(
          and(
            inArray(SubShelf.id, request.body.sourceSubShelfIds),
            SubShelfLocalSynchronizer.getPassPermissionCheckSQL(
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
    });
  };

  static syncMoveMySubShelvesByRootShelfIds = async (
    request: MoveMySubShelvesByRootShelfIdsRequest,
    response: MoveMySubShelvesByRootShelfIdsResponse
  ): Promise<void> => {
    if (!localDB.isReady) await localDB.ensureReady();
    await localDB.transaction(async tx => {
      for (const movedSubShelf of request.body.moveSubShelves) {
        if (
          movedSubShelf.sourceRootShelfId !==
          movedSubShelf.destinationRootShelfId
        ) {
          await tx
            .update(RootShelf)
            .set({
              subShelfCount: sql`max(0, ${RootShelf.subShelfCount} - ${movedSubShelf.sourceSubShelfIds.length})`,
              updatedAt: response.data.updatedAt,
            })
            .where(eq(RootShelf.id, movedSubShelf.sourceRootShelfId));

          await tx
            .update(RootShelf)
            .set({
              subShelfCount: sql`${RootShelf.subShelfCount} + ${movedSubShelf.sourceSubShelfIds.length}`,
              updatedAt: response.data.updatedAt,
            })
            .where(eq(RootShelf.id, movedSubShelf.destinationRootShelfId));
        }

        await tx
          .update(SubShelf)
          .set({
            rootShelfId: movedSubShelf.destinationRootShelfId,
            prevSubShelfId: movedSubShelf.destinationSubShelfId,
            updatedAt: response.data.updatedAt,
          })
          .where(inArray(SubShelf.id, movedSubShelf.sourceSubShelfIds));
      }

      if (request.affected.childSubShelfIds.length > 0) {
        const destinationRootShelfId =
          request.body.moveSubShelves[0]?.destinationRootShelfId;
        if (destinationRootShelfId) {
          await tx
            .update(SubShelf)
            .set({
              rootShelfId: destinationRootShelfId,
              updatedAt: response.data.updatedAt,
            })
            .where(inArray(SubShelf.id, request.affected.childSubShelfIds));
        }
      }
    });
  };

  static syncRestoreMySubShelfById = async (
    request: RestoreMySubShelfByIdRequest,
    response: RestoreMySubShelfByIdResponse
  ): Promise<void> => {
    if (!localDB.isReady) await localDB.ensureReady();
    await localDB.transaction(async tx => {
      await tx
        .insert(SubShelf)
        .values({
          id: response.data.id,
          name: response.data.name,
          rootShelfId: response.data.rootShelfId,
          prevSubShelfId: response.data.prevSubShelfId,
          path: response.data.path as UUID[],
          deletedAt: null,
          updatedAt: response.data.updatedAt,
          createdAt: response.data.createdAt,
        })
        .onConflictDoUpdate({
          target: SubShelf.id,
          set: {
            name: response.data.name,
            rootShelfId: response.data.rootShelfId,
            prevSubShelfId: response.data.prevSubShelfId,
            path: response.data.path as UUID[],
            deletedAt: null,
            updatedAt: response.data.updatedAt,
            createdAt: response.data.createdAt,
          },
        });

      await tx
        .update(RootShelf)
        .set({
          subShelfCount: sql`${RootShelf.subShelfCount} + 1`,
          updatedAt: response.data.updatedAt,
        })
        .where(
          and(
            eq(RootShelf.id, response.data.rootShelfId),
            SubShelfLocalSynchronizer.getPassPermissionCheckSQL(
              tx,
              response.embedded.publicId,
              [
                AccessControlPermission.Owner,
                AccessControlPermission.Admin,
                AccessControlPermission.Write,
              ],
              response.data.rootShelfId
            )
          )
        );
    });
  };

  static syncRestoreMySubShelvesByIds = async (
    request: RestoreMySubShelvesByIdsRequest,
    response: RestoreMySubShelvesByIdsResponse
  ): Promise<void> => {
    if (!localDB.isReady) await localDB.ensureReady();
    await localDB.transaction(async tx => {
      const restoredSubShelves = response.data.map(subShelf => ({
        id: subShelf.id,
        name: subShelf.name,
        rootShelfId: subShelf.rootShelfId,
        prevSubShelfId: subShelf.prevSubShelfId,
        path: subShelf.path as UUID[],
        deletedAt: null,
        updatedAt: subShelf.updatedAt,
        createdAt: subShelf.createdAt,
      }));
      if (restoredSubShelves.length > 0) {
        await tx
          .insert(SubShelf)
          .values(restoredSubShelves)
          .onConflictDoUpdate({
            target: SubShelf.id,
            set: {
              name: sql`excluded.name`,
              rootShelfId: sql`excluded.root_shelf_id`,
              prevSubShelfId: sql`excluded.prev_sub_shelf_id`,
              path: sql`excluded.path`,
              deletedAt: null,
              updatedAt: sql`excluded.updated_at`,
              createdAt: sql`excluded.created_at`,
            },
          });
      }

      const rootShelfIdToCountMap = new Map<string, number>();
      for (const subShelf of response.data) {
        rootShelfIdToCountMap.set(
          subShelf.rootShelfId,
          (rootShelfIdToCountMap.get(subShelf.rootShelfId) ?? 0) + 1
        );
      }

      for (const [rootShelfId, count] of rootShelfIdToCountMap.entries()) {
        await tx
          .update(RootShelf)
          .set({
            subShelfCount: sql`${RootShelf.subShelfCount} + ${count}`,
            updatedAt: response.data[0]?.updatedAt ?? new Date(),
          })
          .where(eq(RootShelf.id, rootShelfId));
      }
    });
  };

  static syncDeleteMySubShelfById = async (
    request: DeleteMySubShelfByIdRequest,
    response: DeleteMySubShelfByIdResponse
  ): Promise<void> => {
    if (!localDB.isReady) await localDB.ensureReady();
    await localDB.transaction(async tx => {
      await tx
        .update(SubShelf)
        .set({
          deletedAt: response.data.deletedAt,
          updatedAt: response.data.deletedAt,
        })
        .where(
          and(
            eq(SubShelf.id, request.body.subShelfId),
            SubShelfLocalSynchronizer.getPassPermissionCheckSQL(
              tx,
              response.embedded.publicId,
              [AccessControlPermission.Owner, AccessControlPermission.Admin]
            )
          )
        );

      await tx
        .update(RootShelf)
        .set({
          subShelfCount: sql`max(0, ${RootShelf.subShelfCount} - 1)`,
          updatedAt: response.data.deletedAt,
        })
        .where(eq(RootShelf.id, request.affected.rootShelfId));
    });
  };

  static syncDeleteMySubShelvesByIds = async (
    request: DeleteMySubShelvesByIdsRequest,
    response: DeleteMySubShelvesByIdsResponse
  ): Promise<void> => {
    if (!localDB.isReady) await localDB.ensureReady();
    await localDB.transaction(async tx => {
      await tx
        .update(SubShelf)
        .set({
          deletedAt: response.data.deletedAt,
          updatedAt: response.data.deletedAt,
        })
        .where(
          and(
            inArray(SubShelf.id, request.body.subShelfIds),
            SubShelfLocalSynchronizer.getPassPermissionCheckSQL(
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
            subShelfCount: sql`max(0, ${RootShelf.subShelfCount} - ${count})`,
            updatedAt: response.data.deletedAt,
          })
          .where(eq(RootShelf.id, rootShelfId));
      }
    });
  };
}
