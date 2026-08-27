import {
  MoveMyBlockPacksByParentSubShelfIdsRequest,
  CreateBlockPackRequest,
  CreateBlockPacksRequest,
  DeleteMyBlockPackByIdRequest,
  DeleteMyBlockPacksByIdsRequest,
  GetAllMyBlockPacksByRootShelfIdRequest,
  GetMyBlockPackAndItsParentByIdRequest,
  GetMyBlockPackByIdRequest,
  GetMyBlockPacksByParentSubShelfIdRequest,
  MoveMyBlockPackByIdRequest,
  MoveMyBlockPacksByParentSubShelfIdRequest,
  RestoreMyBlockPackByIdRequest,
  RestoreMyBlockPacksByIdsRequest,
  UpdateMyBlockPackByIdRequest,
  UpdateMyBlockPacksByIdsRequest,
} from "@shared/api/interfaces/blockPack.interface";
import { AccessControlPermission } from "@shared/api/interfaces/enums/accessControlPermission.enum";
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
import { and, eq, exists, inArray, sql } from "drizzle-orm";

export class BlockPackLocalSimulator {
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

  static simulateGetMyBlockPackById = async (
    request: GetMyBlockPackByIdRequest
  ) => {
    if (!localDB.isReady) await localDB.ensureReady();

    const loggedInUser = await localDB.query.User.findFirst({
      where: eq(User.isLoggedIn, true),
    });
    if (!loggedInUser) return null;

    const rows = await localDB
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
      .innerJoin(SubShelf, eq(SubShelf.id, BlockPack.parentSubShelfId))
      .where(
        and(
          eq(BlockPack.id, request.param.blockPackId),
          BlockPackLocalSimulator.getPassPermissionCheckSQL(
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

    const blockPack = rows[0];
    if (!blockPack) return null;

    const isDeleted = request.param.isDeleted ?? false;
    return (blockPack.deletedAt !== null) === isDeleted ? blockPack : null;
  };

  static simulateGetMyBlockPackAndItsParentById = async (
    request: GetMyBlockPackAndItsParentByIdRequest
  ) => {
    if (!localDB.isReady) await localDB.ensureReady();

    const loggedInUser = await localDB.query.User.findFirst({
      where: eq(User.isLoggedIn, true),
    });
    if (!loggedInUser) return null;

    const rows = await localDB
      .select({
        id: BlockPack.id,
        name: BlockPack.name,
        icon: BlockPack.icon,
        headerBackgroundURL: BlockPack.headerBackgroundURL,
        blockCount: BlockPack.blockCount,
        deletedAt: BlockPack.deletedAt,
        updatedAt: BlockPack.updatedAt,
        createdAt: BlockPack.createdAt,
        rootShelfId: SubShelf.rootShelfId,
        parentSubShelfId: SubShelf.id,
        parentSubShelfPrevSubShelfId: SubShelf.prevSubShelfId,
        parentSubShelfName: SubShelf.name,
        parentSubShelfPath: SubShelf.path,
        parentSubShelfDeletedAt: SubShelf.deletedAt,
        parentSubShelfUpdatedAt: SubShelf.updatedAt,
        parentSubShelfCreatedAt: SubShelf.createdAt,
      })
      .from(BlockPack)
      .innerJoin(SubShelf, eq(SubShelf.id, BlockPack.parentSubShelfId))
      .where(
        and(
          eq(BlockPack.id, request.param.blockPackId),
          BlockPackLocalSimulator.getPassPermissionCheckSQL(
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

    const blockPack = rows[0];
    if (!blockPack) return null;

    const isDeleted = request.param.isDeleted ?? false;
    return (blockPack.deletedAt !== null) === isDeleted ? blockPack : null;
  };

  static simulateGetMyBlockPacksByParentSubShelfId = async (
    request: GetMyBlockPacksByParentSubShelfIdRequest
  ) => {
    if (!localDB.isReady) await localDB.ensureReady();

    const loggedInUser = await localDB.query.User.findFirst({
      where: eq(User.isLoggedIn, true),
    });
    if (!loggedInUser) return [];

    const blockPacks = await localDB
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
      .innerJoin(SubShelf, eq(SubShelf.id, BlockPack.parentSubShelfId))
      .where(
        and(
          eq(BlockPack.parentSubShelfId, request.param.parentSubShelfId),
          BlockPackLocalSimulator.getPassPermissionCheckSQL(
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
    return blockPacks.filter(
      blockPack => (blockPack.deletedAt !== null) === areDeleted
    );
  };

  static simulateGetAllMyBlockPacksByRootShelfId = async (
    request: GetAllMyBlockPacksByRootShelfIdRequest
  ) => {
    if (!localDB.isReady) await localDB.ensureReady();

    const loggedInUser = await localDB.query.User.findFirst({
      where: eq(User.isLoggedIn, true),
    });
    if (!loggedInUser) return [];

    const blockPacks = await localDB
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
      .innerJoin(SubShelf, eq(SubShelf.id, BlockPack.parentSubShelfId))
      .where(
        and(
          eq(SubShelf.rootShelfId, request.param.rootShelfId),
          BlockPackLocalSimulator.getPassPermissionCheckSQL(
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
    return blockPacks.filter(
      blockPack => (blockPack.deletedAt !== null) === areDeleted
    );
  };

  static simulateCreateBlockPack = async (
    request: CreateBlockPackRequest
  ): Promise<void> => {
    if (!localDB.isReady) await localDB.ensureReady();

    await localDB.transaction(async tx => {
      const loggedInUser = await tx.query.User.findFirst({
        where: eq(User.isLoggedIn, true),
      });
      if (!loggedInUser) return;

      const id = request.body.id ?? generateUUID();
      request.body.id = id;

      await tx.insert(BlockPack).values({
        id,
        parentSubShelfId: request.body.parentSubShelfId,
        name: request.body.name,
        icon: request.body.icon,
        headerBackgroundURL: request.body.headerBackgroundURL,
      });

      await tx
        .update(RootShelf)
        .set({
          itemCount: sql`${RootShelf.itemCount} + 1`,
          updatedAt: new Date(),
        })
        .where(eq(RootShelf.id, request.affected.rootShelfId));

      await tx.insert(Transaction).values({
        ownerPublicId: loggedInUser.publicId,
        entityType: TransactionEntityType.BlockPack,
        actionType: TransactionActionType.CREATE,
        body: request.body,
        affected: request.affected,
      });
    });
  };

  static simulateCreateBlockPacks = async (
    request: CreateBlockPacksRequest
  ): Promise<void> => {
    if (!localDB.isReady) await localDB.ensureReady();

    await localDB.transaction(async tx => {
      const loggedInUser = await tx.query.User.findFirst({
        where: eq(User.isLoggedIn, true),
      });
      if (!loggedInUser) return;

      const created = request.body.createdBlockPacks.map(blockPack => {
        const id = blockPack.id ?? generateUUID();
        blockPack.id = id;
        return {
          id,
          parentSubShelfId: blockPack.parentSubShelfId,
          name: blockPack.name,
          icon: blockPack.icon,
          headerBackgroundURL: blockPack.headerBackgroundURL,
        };
      });

      if (created.length > 0) {
        await tx.insert(BlockPack).values(created);
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
            updatedAt: new Date(),
          })
          .where(eq(RootShelf.id, rootShelfId));
      }

      await tx.insert(Transaction).values({
        ownerPublicId: loggedInUser.publicId,
        entityType: TransactionEntityType.BlockPack,
        actionType: TransactionActionType.CREATE,
        body: request.body,
        affected: request.affected,
      });
    });
  };

  static simulateUpdateMyBlockPackById = async (
    request: UpdateMyBlockPackByIdRequest
  ): Promise<void> => {
    if (!localDB.isReady) await localDB.ensureReady();

    await localDB.transaction(async tx => {
      const loggedInUser = await tx.query.User.findFirst({
        where: eq(User.isLoggedIn, true),
      });
      if (!loggedInUser) return;

      const setValues: Partial<{
        name: string;
        icon: string | null;
        headerBackgroundURL: string | null;
        updatedAt: Date;
      }> = {
        updatedAt: new Date(),
      };

      if (request.body.values.name !== undefined)
        setValues.name = request.body.values.name;
      if (request.body.values.icon !== undefined)
        setValues.icon = request.body.values.icon;
      if (request.body.values.headerBackgroundURL !== undefined) {
        setValues.headerBackgroundURL = request.body.values.headerBackgroundURL;
      }
      if (request.body.setNull?.icon) setValues.icon = null;
      if (request.body.setNull?.headerBackgroundURL)
        setValues.headerBackgroundURL = null;

      await tx
        .update(BlockPack)
        .set(setValues as any)
        .where(
          and(
            eq(BlockPack.id, request.body.blockPackId),
            BlockPackLocalSimulator.getPassPermissionCheckSQL(
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
        entityType: TransactionEntityType.BlockPack,
        actionType: TransactionActionType.UPDATE,
        body: request.body,
        affected: request.affected,
      });
    });
  };

  static simulateUpdateMyBlockPacksByIds = async (
    request: UpdateMyBlockPacksByIdsRequest
  ): Promise<void> => {
    if (!localDB.isReady) await localDB.ensureReady();

    await localDB.transaction(async tx => {
      const loggedInUser = await tx.query.User.findFirst({
        where: eq(User.isLoggedIn, true),
      });
      if (!loggedInUser) return;

      for (const updatedBlockPack of request.body.updatedBlockPacks) {
        const setValues: Partial<{
          name: string;
          icon: string | null;
          headerBackgroundURL: string | null;
          updatedAt: Date;
        }> = {
          updatedAt: new Date(),
        };

        if (updatedBlockPack.values.name !== undefined)
          setValues.name = updatedBlockPack.values.name;
        if (updatedBlockPack.values.icon !== undefined)
          setValues.icon = updatedBlockPack.values.icon;
        if (updatedBlockPack.values.headerBackgroundURL !== undefined) {
          setValues.headerBackgroundURL =
            updatedBlockPack.values.headerBackgroundURL;
        }
        if (updatedBlockPack.setNull?.icon) setValues.icon = null;
        if (updatedBlockPack.setNull?.headerBackgroundURL)
          setValues.headerBackgroundURL = null;

        await tx
          .update(BlockPack)
          .set(setValues as any)
          .where(
            and(
              eq(BlockPack.id, updatedBlockPack.blockPackId),
              BlockPackLocalSimulator.getPassPermissionCheckSQL(
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
        entityType: TransactionEntityType.BlockPack,
        actionType: TransactionActionType.UPDATE,
        body: request.body,
        affected: request.affected,
      });
    });
  };

  static simulateMoveMyBlockPackById = async (
    request: MoveMyBlockPackByIdRequest
  ): Promise<void> => {
    if (!localDB.isReady) await localDB.ensureReady();

    await localDB.transaction(async tx => {
      const loggedInUser = await tx.query.User.findFirst({
        where: eq(User.isLoggedIn, true),
      });
      if (!loggedInUser) return;

      await tx
        .update(BlockPack)
        .set({
          parentSubShelfId: request.body.destinationParentSubShelfId,
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(BlockPack.id, request.body.blockPackId),
            BlockPackLocalSimulator.getPassPermissionCheckSQL(
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
        entityType: TransactionEntityType.BlockPack,
        actionType: TransactionActionType.MOVE,
        body: request.body,
        affected: request.affected,
      });
    });
  };

  static simulateMoveMyBlockPacksByParentSubShelfId = async (
    request: MoveMyBlockPacksByParentSubShelfIdRequest
  ): Promise<void> => {
    if (!localDB.isReady) await localDB.ensureReady();

    await localDB.transaction(async tx => {
      const loggedInUser = await tx.query.User.findFirst({
        where: eq(User.isLoggedIn, true),
      });
      if (!loggedInUser) return;

      await tx
        .update(BlockPack)
        .set({
          parentSubShelfId: request.body.destinationParentSubShelfId,
          updatedAt: new Date(),
        })
        .where(
          and(
            inArray(BlockPack.id, request.body.blockPackIds),
            BlockPackLocalSimulator.getPassPermissionCheckSQL(
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
        entityType: TransactionEntityType.BlockPack,
        actionType: TransactionActionType.MOVE,
        body: request.body,
        affected: request.affected,
      });
    });
  };

  static simulateMoveMyBlockPacksByParentSubShelfIds = async (
    request: MoveMyBlockPacksByParentSubShelfIdsRequest
  ): Promise<void> => {
    if (!localDB.isReady) await localDB.ensureReady();

    await localDB.transaction(async tx => {
      const loggedInUser = await tx.query.User.findFirst({
        where: eq(User.isLoggedIn, true),
      });
      if (!loggedInUser) return;

      for (const movedBlockPack of request.body.movedBlockPacks) {
        await tx
          .update(BlockPack)
          .set({
            parentSubShelfId: movedBlockPack.destinationParentSubShelfId,
            updatedAt: new Date(),
          })
          .where(inArray(BlockPack.id, movedBlockPack.blockPackIds));
      }

      await tx.insert(Transaction).values({
        ownerPublicId: loggedInUser.publicId,
        entityType: TransactionEntityType.BlockPack,
        actionType: TransactionActionType.MOVE,
        body: request.body,
        affected: request.affected,
      });
    });
  };

  static simulateRestoreMyBlockPackById = async (
    request: RestoreMyBlockPackByIdRequest
  ): Promise<void> => {
    if (!localDB.isReady) await localDB.ensureReady();

    await localDB.transaction(async tx => {
      const loggedInUser = await tx.query.User.findFirst({
        where: eq(User.isLoggedIn, true),
      });
      if (!loggedInUser) return;

      await tx
        .update(BlockPack)
        .set({
          deletedAt: null,
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(BlockPack.id, request.body.blockPackId),
            BlockPackLocalSimulator.getPassPermissionCheckSQL(
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
          itemCount: sql`${RootShelf.itemCount} + 1`,
          updatedAt: new Date(),
        })
        .where(eq(RootShelf.id, request.affected.rootShelfId));

      await tx.insert(Transaction).values({
        ownerPublicId: loggedInUser.publicId,
        entityType: TransactionEntityType.BlockPack,
        actionType: TransactionActionType.RESTORE,
        body: request.body,
        affected: request.affected,
      });
    });
  };

  static simulateRestoreMyBlockPacksByIds = async (
    request: RestoreMyBlockPacksByIdsRequest
  ): Promise<void> => {
    if (!localDB.isReady) await localDB.ensureReady();

    await localDB.transaction(async tx => {
      const loggedInUser = await tx.query.User.findFirst({
        where: eq(User.isLoggedIn, true),
      });
      if (!loggedInUser) return;

      await tx
        .update(BlockPack)
        .set({
          deletedAt: null,
          updatedAt: new Date(),
        })
        .where(
          and(
            inArray(BlockPack.id, request.body.blockPackIds),
            BlockPackLocalSimulator.getPassPermissionCheckSQL(
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
            itemCount: sql`${RootShelf.itemCount} + ${count}`,
            updatedAt: new Date(),
          })
          .where(eq(RootShelf.id, rootShelfId));
      }

      await tx.insert(Transaction).values({
        ownerPublicId: loggedInUser.publicId,
        entityType: TransactionEntityType.BlockPack,
        actionType: TransactionActionType.RESTORE,
        body: request.body,
        affected: request.affected,
      });
    });
  };

  static simulateDeleteMyBlockPackById = async (
    request: DeleteMyBlockPackByIdRequest
  ): Promise<void> => {
    if (!localDB.isReady) await localDB.ensureReady();

    await localDB.transaction(async tx => {
      const loggedInUser = await tx.query.User.findFirst({
        where: eq(User.isLoggedIn, true),
      });
      if (!loggedInUser) return;

      await tx
        .update(BlockPack)
        .set({
          deletedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(BlockPack.id, request.body.blockPackId),
            BlockPackLocalSimulator.getPassPermissionCheckSQL(
              tx,
              loggedInUser.publicId,
              [AccessControlPermission.Owner, AccessControlPermission.Admin]
            )
          )
        );

      await tx
        .update(RootShelf)
        .set({
          itemCount: sql`max(0, ${RootShelf.itemCount} - 1)`,
          updatedAt: new Date(),
        })
        .where(eq(RootShelf.id, request.affected.rootShelfId));

      await tx.insert(Transaction).values({
        ownerPublicId: loggedInUser.publicId,
        entityType: TransactionEntityType.BlockPack,
        actionType: TransactionActionType.DELETE,
        body: request.body,
        affected: request.affected,
      });
    });
  };

  static simulateDeleteMyBlockPacksByIds = async (
    request: DeleteMyBlockPacksByIdsRequest
  ): Promise<void> => {
    if (!localDB.isReady) await localDB.ensureReady();

    await localDB.transaction(async tx => {
      const loggedInUser = await tx.query.User.findFirst({
        where: eq(User.isLoggedIn, true),
      });
      if (!loggedInUser) return;

      await tx
        .update(BlockPack)
        .set({
          deletedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(
          and(
            inArray(BlockPack.id, request.body.blockPackIds),
            BlockPackLocalSimulator.getPassPermissionCheckSQL(
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
            itemCount: sql`max(0, ${RootShelf.itemCount} - ${count})`,
            updatedAt: new Date(),
          })
          .where(eq(RootShelf.id, rootShelfId));
      }

      await tx.insert(Transaction).values({
        ownerPublicId: loggedInUser.publicId,
        entityType: TransactionEntityType.BlockPack,
        actionType: TransactionActionType.DELETE,
        body: request.body,
        affected: request.affected,
      });
    });
  };
}
