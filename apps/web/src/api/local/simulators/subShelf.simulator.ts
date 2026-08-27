import { AccessControlPermission } from "@shared/api/interfaces/enums/accessControlPermission.enum";
import {
  MoveMySubShelvesByRootShelfIdsRequest,
  CreateSubShelfByRootShelfIdRequest,
  CreateSubShelvesByRootShelfIdsRequest,
  DeleteMySubShelfByIdRequest,
  DeleteMySubShelvesByIdsRequest,
  GetAllMySubShelvesByRootShelfIdRequest,
  GetMySubShelfByIdRequest,
  GetMySubShelvesAndItemsByPrevSubShelfIdRequest,
  GetMySubShelvesByPrevSubShelfIdRequest,
  MoveMySubShelfRequest,
  MoveMySubShelvesByRootShelfIdRequest,
  RestoreMySubShelfByIdRequest,
  RestoreMySubShelvesByIdsRequest,
  UpdateMySubShelfByIdRequest,
  UpdateMySubShelvesByIdsRequest,
} from "@shared/api/interfaces/subShelf.interface";
import { localDB } from "@/api/local/db";
import {
  BlockPack,
  RootShelf,
  SubShelf,
  Transaction,
  User,
  UsersToShelves,
} from "@/api/local/schemas";
import { TransactionActionType } from "@/api/local/schemas/enums/transaction_action_type.enum";
import { TransactionEntityType } from "@/api/local/schemas/enums/transaction_entity_type.enum";
import { generateUUID } from "@shared/types/uuidv4.type";
import type { UUID } from "crypto";
import { and, eq, exists, inArray, sql } from "drizzle-orm";

export class SubShelfLocalSimulator {
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

  static simulateGetMySubShelfById = async (
    request: GetMySubShelfByIdRequest
  ) => {
    if (!localDB.isReady) await localDB.ensureReady();

    const loggedInUser = await localDB.query.User.findFirst({
      where: eq(User.isLoggedIn, true),
    });
    if (!loggedInUser) return null;

    const rows = await localDB
      .select({
        id: SubShelf.id,
        name: SubShelf.name,
        rootShelfId: SubShelf.rootShelfId,
        prevSubShelfId: SubShelf.prevSubShelfId,
        path: SubShelf.path,
        deletedAt: SubShelf.deletedAt,
        updatedAt: SubShelf.updatedAt,
        createdAt: SubShelf.createdAt,
      })
      .from(SubShelf)
      .where(
        and(
          eq(SubShelf.id, request.param.subShelfId),
          SubShelfLocalSimulator.getPassPermissionCheckSQL(
            localDB,
            loggedInUser.publicId,
            [
              AccessControlPermission.Read,
              AccessControlPermission.Write,
              AccessControlPermission.Admin,
              AccessControlPermission.Owner,
            ]
          )
        )
      )
      .limit(1);

    const subShelf = rows[0];
    if (!subShelf) return null;

    const isDeleted = request.param.isDeleted ?? false;
    return (subShelf.deletedAt !== null) === isDeleted ? subShelf : null;
  };

  static simulateGetMySubShelvesByPrevSubShelfId = async (
    request: GetMySubShelvesByPrevSubShelfIdRequest
  ) => {
    if (!localDB.isReady) await localDB.ensureReady();

    const loggedInUser = await localDB.query.User.findFirst({
      where: eq(User.isLoggedIn, true),
    });
    if (!loggedInUser) return [];

    const subShelves = await localDB
      .select({
        id: SubShelf.id,
        name: SubShelf.name,
        rootShelfId: SubShelf.rootShelfId,
        prevSubShelfId: SubShelf.prevSubShelfId,
        path: SubShelf.path,
        deletedAt: SubShelf.deletedAt,
        updatedAt: SubShelf.updatedAt,
        createdAt: SubShelf.createdAt,
      })
      .from(SubShelf)
      .where(
        and(
          eq(SubShelf.prevSubShelfId, request.param.prevSubShelfId),
          SubShelfLocalSimulator.getPassPermissionCheckSQL(
            localDB,
            loggedInUser.publicId,
            [
              AccessControlPermission.Read,
              AccessControlPermission.Write,
              AccessControlPermission.Admin,
              AccessControlPermission.Owner,
            ]
          )
        )
      );

    const areDeleted = request.param.areDeleted ?? false;
    return subShelves.filter(
      subShelf => (subShelf.deletedAt !== null) === areDeleted
    );
  };

  static simulateGetAllMySubShelvesByRootShelfId = async (
    request: GetAllMySubShelvesByRootShelfIdRequest
  ) => {
    if (!localDB.isReady) await localDB.ensureReady();

    const loggedInUser = await localDB.query.User.findFirst({
      where: eq(User.isLoggedIn, true),
    });
    if (!loggedInUser) return [];

    const subShelves = await localDB
      .select({
        id: SubShelf.id,
        name: SubShelf.name,
        rootShelfId: SubShelf.rootShelfId,
        prevSubShelfId: SubShelf.prevSubShelfId,
        path: SubShelf.path,
        deletedAt: SubShelf.deletedAt,
        updatedAt: SubShelf.updatedAt,
        createdAt: SubShelf.createdAt,
      })
      .from(SubShelf)
      .where(
        and(
          eq(SubShelf.rootShelfId, request.param.rootShelfId),
          SubShelfLocalSimulator.getPassPermissionCheckSQL(
            localDB,
            loggedInUser.publicId,
            [
              AccessControlPermission.Read,
              AccessControlPermission.Write,
              AccessControlPermission.Admin,
              AccessControlPermission.Owner,
            ],
            request.param.rootShelfId
          )
        )
      );

    const areDeleted = request.param.areDeleted ?? false;
    return subShelves.filter(
      subShelf => (subShelf.deletedAt !== null) === areDeleted
    );
  };

  static simulateGetMySubShelvesAndItemsByPrevSubShelfId = async (
    request: GetMySubShelvesAndItemsByPrevSubShelfIdRequest
  ) => {
    if (!localDB.isReady) await localDB.ensureReady();

    const loggedInUser = await localDB.query.User.findFirst({
      where: eq(User.isLoggedIn, true),
    });
    if (!loggedInUser) {
      return {
        subShelves: [],
        materials: [],
        blockPacks: [],
      };
    }

    const subShelves = await localDB
      .select({
        id: SubShelf.id,
        name: SubShelf.name,
        rootShelfId: SubShelf.rootShelfId,
        prevSubShelfId: SubShelf.prevSubShelfId,
        path: SubShelf.path,
        deletedAt: SubShelf.deletedAt,
        updatedAt: SubShelf.updatedAt,
        createdAt: SubShelf.createdAt,
      })
      .from(SubShelf)
      .where(
        and(
          eq(SubShelf.prevSubShelfId, request.param.prevSubShelfId),
          SubShelfLocalSimulator.getPassPermissionCheckSQL(
            localDB,
            loggedInUser.publicId,
            [
              AccessControlPermission.Read,
              AccessControlPermission.Write,
              AccessControlPermission.Admin,
              AccessControlPermission.Owner,
            ]
          )
        )
      );

    const blockPacks =
      subShelves.length === 0
        ? []
        : await localDB
            .select({
              id: BlockPack.id,
              parentSubShelfId: BlockPack.parentSubShelfId,
              name: BlockPack.name,
              icon: BlockPack.icon,
              headerBackgroundURL: BlockPack.headerBackgroundURL,
              blockCount: BlockPack.blockCount,
              deletedAt: BlockPack.deletedAt,
              updatedAt: BlockPack.updatedAt,
              createdAt: BlockPack.createdAt,
            })
            .from(BlockPack)
            .where(
              inArray(
                BlockPack.parentSubShelfId,
                subShelves.map(subShelf => subShelf.id)
              )
            );

    const areDeleted = request.param.areDeleted ?? false;

    return {
      subShelves: subShelves.filter(
        subShelf => (subShelf.deletedAt !== null) === areDeleted
      ),
      materials: [],
      blockPacks: blockPacks.filter(
        blockPack => (blockPack.deletedAt !== null) === areDeleted
      ),
    };
  };

  static simulateCreateSubShelfByRootShelfId = async (
    request: CreateSubShelfByRootShelfIdRequest
  ): Promise<void> => {
    if (!localDB.isReady) await localDB.ensureReady();

    await localDB.transaction(async tx => {
      const loggedInUser = await tx.query.User.findFirst({
        where: eq(User.isLoggedIn, true),
      });
      if (!loggedInUser) return;

      const id = request.body.id ?? generateUUID();
      request.body.id = id;

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
          id,
          name: request.body.name,
          rootShelfId: request.body.rootShelfId,
          prevSubShelfId: request.body.prevSubShelfId,
          path,
        })
        .onConflictDoNothing();

      await tx
        .update(RootShelf)
        .set({
          subShelfCount: sql`${RootShelf.subShelfCount} + 1`,
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(RootShelf.id, request.body.rootShelfId),
            SubShelfLocalSimulator.getPassPermissionCheckSQL(
              tx,
              loggedInUser.publicId,
              [
                AccessControlPermission.Owner,
                AccessControlPermission.Admin,
                AccessControlPermission.Write,
              ],
              request.body.rootShelfId
            )
          )
        );

      await tx.insert(Transaction).values({
        ownerPublicId: loggedInUser.publicId,
        entityType: TransactionEntityType.SubShelf,
        actionType: TransactionActionType.CREATE,
        body: request.body,
        affected: request.affected,
      });
    });
  };

  static simulateCreateSubShelvesByRootShelfIds = async (
    request: CreateSubShelvesByRootShelfIdsRequest
  ): Promise<void> => {
    if (!localDB.isReady) await localDB.ensureReady();

    await localDB.transaction(async tx => {
      const loggedInUser = await tx.query.User.findFirst({
        where: eq(User.isLoggedIn, true),
      });
      if (!loggedInUser) return;

      const prevIds = request.body.createdSubShelves
        .map(subShelf => subShelf.prevSubShelfId)
        .filter((id): id is UUID => id !== null);

      const prevSubShelves =
        prevIds.length === 0
          ? []
          : await tx.query.SubShelf.findMany({
              where: inArray(SubShelf.id, prevIds),
              columns: {
                id: true,
                path: true,
              },
            });

      const prevPathMap = new Map<UUID, UUID[]>(
        prevSubShelves.map(prevSubShelf => [
          prevSubShelf.id as UUID,
          prevSubShelf.path ?? [],
        ])
      );

      const createdSubShelves = request.body.createdSubShelves.map(created => {
        const id = created.id ?? generateUUID();
        created.id = id;
        return {
          id,
          name: created.name,
          rootShelfId: created.rootShelfId,
          prevSubShelfId: created.prevSubShelfId,
          path:
            created.prevSubShelfId === null
              ? []
              : (prevPathMap.get(created.prevSubShelfId as UUID) ?? []),
        };
      });

      if (createdSubShelves.length > 0) {
        await tx.insert(SubShelf).values(createdSubShelves);
      }

      const rootShelfIdToCountMap = new Map<string, number>();
      for (const createdSubShelf of createdSubShelves) {
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
            updatedAt: new Date(),
          })
          .where(
            and(
              eq(RootShelf.id, rootShelfId),
              SubShelfLocalSimulator.getPassPermissionCheckSQL(
                tx,
                loggedInUser.publicId,
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

      await tx.insert(Transaction).values({
        ownerPublicId: loggedInUser.publicId,
        entityType: TransactionEntityType.SubShelf,
        actionType: TransactionActionType.CREATE,
        body: request.body,
        affected: request.affected,
      });
    });
  };

  static simulateUpdateMySubShelfById = async (
    request: UpdateMySubShelfByIdRequest
  ): Promise<void> => {
    if (!localDB.isReady) await localDB.ensureReady();

    await localDB.transaction(async tx => {
      const loggedInUser = await tx.query.User.findFirst({
        where: eq(User.isLoggedIn, true),
      });
      if (!loggedInUser) return;

      await tx
        .update(SubShelf)
        .set({
          name: request.body.values.name,
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(SubShelf.id, request.body.subShelfId),
            SubShelfLocalSimulator.getPassPermissionCheckSQL(
              tx,
              loggedInUser.publicId,
              [
                AccessControlPermission.Owner,
                AccessControlPermission.Admin,
                AccessControlPermission.Write,
              ]
            )
          )
        );

      await tx.insert(Transaction).values({
        ownerPublicId: loggedInUser.publicId,
        entityType: TransactionEntityType.SubShelf,
        actionType: TransactionActionType.UPDATE,
        body: request.body,
        affected: request.affected,
      });
    });
  };

  static simulateUpdateMySubShelvesByIds = async (
    request: UpdateMySubShelvesByIdsRequest
  ): Promise<void> => {
    if (!localDB.isReady) await localDB.ensureReady();
    if (request.body.updatedSubShelves.length === 0) return;

    await localDB.transaction(async tx => {
      const loggedInUser = await tx.query.User.findFirst({
        where: eq(User.isLoggedIn, true),
      });
      if (!loggedInUser) return;

      const updatedSubShelvesWithName = request.body.updatedSubShelves.filter(
        updatedSubShelf => updatedSubShelf.values.name !== undefined
      );

      if (updatedSubShelvesWithName.length > 0) {
        await tx
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
            updatedAt: new Date(),
          })
          .where(
            and(
              inArray(
                SubShelf.id,
                updatedSubShelvesWithName.map(
                  updatedSubShelf => updatedSubShelf.subShelfId
                )
              ),
              SubShelfLocalSimulator.getPassPermissionCheckSQL(
                tx,
                loggedInUser.publicId,
                [
                  AccessControlPermission.Owner,
                  AccessControlPermission.Admin,
                  AccessControlPermission.Write,
                ]
              )
            )
          );
      }

      await tx.insert(Transaction).values({
        ownerPublicId: loggedInUser.publicId,
        entityType: TransactionEntityType.SubShelf,
        actionType: TransactionActionType.UPDATE,
        body: request.body,
        affected: request.affected,
      });
    });
  };

  static simulateMoveMySubShelf = async (
    request: MoveMySubShelfRequest
  ): Promise<void> => {
    if (!localDB.isReady) await localDB.ensureReady();

    await localDB.transaction(async tx => {
      const loggedInUser = await tx.query.User.findFirst({
        where: eq(User.isLoggedIn, true),
      });
      if (!loggedInUser) return;

      if (
        request.body.sourceRootShelfId !== request.body.destinationRootShelfId
      ) {
        await tx
          .update(RootShelf)
          .set({
            subShelfCount: sql`max(0, ${RootShelf.subShelfCount} - 1)`,
            updatedAt: new Date(),
          })
          .where(eq(RootShelf.id, request.body.sourceRootShelfId));

        await tx
          .update(RootShelf)
          .set({
            subShelfCount: sql`${RootShelf.subShelfCount} + 1`,
            updatedAt: new Date(),
          })
          .where(eq(RootShelf.id, request.body.destinationRootShelfId));
      }

      await tx
        .update(SubShelf)
        .set({
          rootShelfId: request.body.destinationRootShelfId,
          prevSubShelfId: request.body.destinationSubShelfId,
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(SubShelf.id, request.body.sourceSubShelfId),
            SubShelfLocalSimulator.getPassPermissionCheckSQL(
              tx,
              loggedInUser.publicId,
              [
                AccessControlPermission.Owner,
                AccessControlPermission.Admin,
                AccessControlPermission.Write,
              ]
            )
          )
        );

      if (request.affected.childSubShelfIds.length > 0) {
        await tx
          .update(SubShelf)
          .set({
            rootShelfId: request.body.destinationRootShelfId,
            updatedAt: new Date(),
          })
          .where(inArray(SubShelf.id, request.affected.childSubShelfIds));
      }

      await tx.insert(Transaction).values({
        ownerPublicId: loggedInUser.publicId,
        entityType: TransactionEntityType.SubShelf,
        actionType: TransactionActionType.MOVE,
        body: request.body,
        affected: request.affected,
      });
    });
  };

  static simulateMoveMySubShelvesByRootShelfId = async (
    request: MoveMySubShelvesByRootShelfIdRequest
  ): Promise<void> => {
    if (!localDB.isReady) await localDB.ensureReady();

    await localDB.transaction(async tx => {
      const loggedInUser = await tx.query.User.findFirst({
        where: eq(User.isLoggedIn, true),
      });
      if (!loggedInUser) return;

      if (
        request.body.sourceRootShelfId !== request.body.destinationRootShelfId
      ) {
        await tx
          .update(RootShelf)
          .set({
            subShelfCount: sql`max(0, ${RootShelf.subShelfCount} - ${request.body.sourceSubShelfIds.length})`,
            updatedAt: new Date(),
          })
          .where(eq(RootShelf.id, request.body.sourceRootShelfId));

        await tx
          .update(RootShelf)
          .set({
            subShelfCount: sql`${RootShelf.subShelfCount} + ${request.body.sourceSubShelfIds.length}`,
            updatedAt: new Date(),
          })
          .where(eq(RootShelf.id, request.body.destinationRootShelfId));
      }

      await tx
        .update(SubShelf)
        .set({
          rootShelfId: request.body.destinationRootShelfId,
          prevSubShelfId: request.body.destinationSubShelfId,
          updatedAt: new Date(),
        })
        .where(
          and(
            inArray(SubShelf.id, request.body.sourceSubShelfIds),
            SubShelfLocalSimulator.getPassPermissionCheckSQL(
              tx,
              loggedInUser.publicId,
              [
                AccessControlPermission.Owner,
                AccessControlPermission.Admin,
                AccessControlPermission.Write,
              ]
            )
          )
        );

      if (request.affected.childSubShelfIds.length > 0) {
        await tx
          .update(SubShelf)
          .set({
            rootShelfId: request.body.destinationRootShelfId,
            updatedAt: new Date(),
          })
          .where(inArray(SubShelf.id, request.affected.childSubShelfIds));
      }

      await tx.insert(Transaction).values({
        ownerPublicId: loggedInUser.publicId,
        entityType: TransactionEntityType.SubShelf,
        actionType: TransactionActionType.MOVE,
        body: request.body,
        affected: request.affected,
      });
    });
  };

  static simulateMoveMySubShelvesByRootShelfIds = async (
    request: MoveMySubShelvesByRootShelfIdsRequest
  ): Promise<void> => {
    if (!localDB.isReady) await localDB.ensureReady();

    await localDB.transaction(async tx => {
      const loggedInUser = await tx.query.User.findFirst({
        where: eq(User.isLoggedIn, true),
      });
      if (!loggedInUser) return;

      for (const movedSubShelf of request.body.moveSubShelves) {
        if (
          movedSubShelf.sourceRootShelfId !==
          movedSubShelf.destinationRootShelfId
        ) {
          await tx
            .update(RootShelf)
            .set({
              subShelfCount: sql`max(0, ${RootShelf.subShelfCount} - ${movedSubShelf.sourceSubShelfIds.length})`,
              updatedAt: new Date(),
            })
            .where(eq(RootShelf.id, movedSubShelf.sourceRootShelfId));

          await tx
            .update(RootShelf)
            .set({
              subShelfCount: sql`${RootShelf.subShelfCount} + ${movedSubShelf.sourceSubShelfIds.length}`,
              updatedAt: new Date(),
            })
            .where(eq(RootShelf.id, movedSubShelf.destinationRootShelfId));
        }

        await tx
          .update(SubShelf)
          .set({
            rootShelfId: movedSubShelf.destinationRootShelfId,
            prevSubShelfId: movedSubShelf.destinationSubShelfId,
            updatedAt: new Date(),
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
              updatedAt: new Date(),
            })
            .where(inArray(SubShelf.id, request.affected.childSubShelfIds));
        }
      }

      await tx.insert(Transaction).values({
        ownerPublicId: loggedInUser.publicId,
        entityType: TransactionEntityType.SubShelf,
        actionType: TransactionActionType.MOVE,
        body: request.body,
        affected: request.affected,
      });
    });
  };

  static simulateRestoreMySubShelfById = async (
    request: RestoreMySubShelfByIdRequest
  ): Promise<void> => {
    if (!localDB.isReady) await localDB.ensureReady();

    await localDB.transaction(async tx => {
      const loggedInUser = await tx.query.User.findFirst({
        where: eq(User.isLoggedIn, true),
      });
      if (!loggedInUser) return;

      await tx
        .update(SubShelf)
        .set({
          deletedAt: null,
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(SubShelf.id, request.body.subShelfId),
            SubShelfLocalSimulator.getPassPermissionCheckSQL(
              tx,
              loggedInUser.publicId,
              [
                AccessControlPermission.Owner,
                AccessControlPermission.Admin,
                AccessControlPermission.Write,
              ]
            )
          )
        );

      await tx
        .update(RootShelf)
        .set({
          subShelfCount: sql`${RootShelf.subShelfCount} + 1`,
          updatedAt: new Date(),
        })
        .where(eq(RootShelf.id, request.affected.rootShelfId));

      await tx.insert(Transaction).values({
        ownerPublicId: loggedInUser.publicId,
        entityType: TransactionEntityType.SubShelf,
        actionType: TransactionActionType.RESTORE,
        body: request.body,
        affected: request.affected,
      });
    });
  };

  static simulateRestoreMySubShelvesByIds = async (
    request: RestoreMySubShelvesByIdsRequest
  ): Promise<void> => {
    if (!localDB.isReady) await localDB.ensureReady();

    await localDB.transaction(async tx => {
      const loggedInUser = await tx.query.User.findFirst({
        where: eq(User.isLoggedIn, true),
      });
      if (!loggedInUser) return;

      await tx
        .update(SubShelf)
        .set({
          deletedAt: null,
          updatedAt: new Date(),
        })
        .where(
          and(
            inArray(SubShelf.id, request.body.subShelfIds),
            SubShelfLocalSimulator.getPassPermissionCheckSQL(
              tx,
              loggedInUser.publicId,
              [
                AccessControlPermission.Owner,
                AccessControlPermission.Admin,
                AccessControlPermission.Write,
              ]
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
            subShelfCount: sql`${RootShelf.subShelfCount} + ${count}`,
            updatedAt: new Date(),
          })
          .where(eq(RootShelf.id, rootShelfId));
      }

      await tx.insert(Transaction).values({
        ownerPublicId: loggedInUser.publicId,
        entityType: TransactionEntityType.SubShelf,
        actionType: TransactionActionType.RESTORE,
        body: request.body,
        affected: request.affected,
      });
    });
  };

  static simulateDeleteMySubShelfById = async (
    request: DeleteMySubShelfByIdRequest
  ): Promise<void> => {
    if (!localDB.isReady) await localDB.ensureReady();

    await localDB.transaction(async tx => {
      const loggedInUser = await tx.query.User.findFirst({
        where: eq(User.isLoggedIn, true),
      });
      if (!loggedInUser) return;

      await tx
        .update(SubShelf)
        .set({
          deletedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(SubShelf.id, request.body.subShelfId),
            SubShelfLocalSimulator.getPassPermissionCheckSQL(
              tx,
              loggedInUser.publicId,
              [AccessControlPermission.Owner, AccessControlPermission.Admin]
            )
          )
        );

      await tx
        .update(RootShelf)
        .set({
          subShelfCount: sql`max(0, ${RootShelf.subShelfCount} - 1)`,
          updatedAt: new Date(),
        })
        .where(eq(RootShelf.id, request.affected.rootShelfId));

      await tx.insert(Transaction).values({
        ownerPublicId: loggedInUser.publicId,
        entityType: TransactionEntityType.SubShelf,
        actionType: TransactionActionType.DELETE,
        body: request.body,
        affected: request.affected,
      });
    });
  };

  static simulateDeleteMySubShelvesByIds = async (
    request: DeleteMySubShelvesByIdsRequest
  ): Promise<void> => {
    if (!localDB.isReady) await localDB.ensureReady();

    await localDB.transaction(async tx => {
      const loggedInUser = await tx.query.User.findFirst({
        where: eq(User.isLoggedIn, true),
      });
      if (!loggedInUser) return;

      await tx
        .update(SubShelf)
        .set({
          deletedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(
          and(
            inArray(SubShelf.id, request.body.subShelfIds),
            SubShelfLocalSimulator.getPassPermissionCheckSQL(
              tx,
              loggedInUser.publicId,
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
            updatedAt: new Date(),
          })
          .where(eq(RootShelf.id, rootShelfId));
      }

      await tx.insert(Transaction).values({
        ownerPublicId: loggedInUser.publicId,
        entityType: TransactionEntityType.SubShelf,
        actionType: TransactionActionType.DELETE,
        body: request.body,
        affected: request.affected,
      });
    });
  };
}
