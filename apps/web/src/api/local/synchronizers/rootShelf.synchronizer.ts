import { AccessControlPermission } from "@shared/api/interfaces/enums/accessControlPermission.enum";
import {
  CreateRootShelfRequest,
  CreateRootShelfResponse,
  CreateRootShelvesRequest,
  CreateRootShelvesResponse,
  DeleteMyRootShelfByIdRequest,
  DeleteMyRootShelfByIdResponse,
  DeleteMyRootShelvesByIdsRequest,
  DeleteMyRootShelvesByIdsResponse,
  GetMyRootShelfByIdResponse,
  RestoreMyRootShelfByIdRequest,
  RestoreMyRootShelfByIdResponse,
  RestoreMyRootShelvesByIdsRequest,
  RestoreMyRootShelvesByIdsResponse,
  UpdateMyRootShelfByIdRequest,
  UpdateMyRootShelfByIdResponse,
  UpdateMyRootShelvesByIdsRequest,
  UpdateMyRootShelvesByIdsResponse,
} from "@shared/api/interfaces/rootShelf.interface";
import { localDB } from "@/api/local/db";
import { RootShelf, User, UsersToShelves } from "@/api/local/schemas";
import { and, eq, exists, inArray, sql } from "drizzle-orm";

export class RootShelfLocalSynchronizer {
  private static getPassPermissionCheckSQL = (
    queryBuilder: Pick<typeof localDB, "select">,
    userPublicId: string,
    permissions: AccessControlPermission[]
  ) =>
    exists(
      queryBuilder
        .select({ one: sql`1` })
        .from(UsersToShelves)
        .where(
          and(
            eq(UsersToShelves.userPublicId, userPublicId),
            eq(UsersToShelves.rootShelfId, RootShelf.id),
            inArray(UsersToShelves.permission, permissions)
          )
        )
    );

  static syncGetMyRootShelfById = async (
    response: GetMyRootShelfByIdResponse
  ): Promise<void> => {
    if (!localDB.isReady) await localDB.ensureReady();
    await localDB.transaction(async tx => {
      await tx
        .insert(RootShelf)
        .values({
          id: response.data.id,
          name: response.data.name,
          subShelfCount: response.data.subShelfCount,
          itemCount: response.data.itemCount,
          lastAnalyzedAt: response.data.lastAnalyzedAt,
          deletedAt: response.data.deletedAt,
          updatedAt: response.data.updatedAt,
          createdAt: response.data.createdAt,
        })
        .onConflictDoUpdate({
          target: RootShelf.id,
          set: {
            name: response.data.name,
            subShelfCount: response.data.subShelfCount,
            itemCount: response.data.itemCount,
            lastAnalyzedAt: response.data.lastAnalyzedAt,
            deletedAt: response.data.deletedAt,
            updatedAt: response.data.updatedAt,
            createdAt: response.data.createdAt,
          },
        });
      await tx
        .insert(UsersToShelves)
        .values({
          userPublicId: response.embedded.publicId,
          rootShelfId: response.data.id,
          permission: response.data.permission,
        })
        .onConflictDoUpdate({
          target: [UsersToShelves.userPublicId, UsersToShelves.rootShelfId],
          set: {
            permission: sql`excluded.permission`,
          },
        });
    });
  };

  static syncSearchRootShelves = async (
    searchedRootShelves: Array<{
      id: string;
      name: string;
      subShelfCount: number;
      itemCount: number;
      lastAnalyzedAt: Date;
      deletedAt: Date | null;
      updatedAt: Date;
      createdAt: Date;
      permission: AccessControlPermission;
    }>
  ): Promise<void> => {
    if (!localDB.isReady) await localDB.ensureReady();

    const rootShelves = searchedRootShelves.map(rootShelf => ({
      id: rootShelf.id,
      name: rootShelf.name,
      subShelfCount: rootShelf.subShelfCount,
      itemCount: rootShelf.itemCount,
      lastAnalyzedAt: rootShelf.lastAnalyzedAt,
      deletedAt: rootShelf.deletedAt,
      updatedAt: rootShelf.updatedAt,
      createdAt: rootShelf.createdAt,
    }));

    await localDB.transaction(async tx => {
      const loggedInUser = await tx.query.User.findFirst({
        where: eq(User.isLoggedIn, true),
      });
      if (loggedInUser === undefined) return;
      const usersToShelves = searchedRootShelves.map(rootShelf => ({
        userPublicId: loggedInUser.publicId,
        rootShelfId: rootShelf.id,
        permission: rootShelf.permission,
      }));

      if (rootShelves.length > 0) {
        await tx
          .insert(RootShelf)
          .values(rootShelves)
          .onConflictDoUpdate({
            target: RootShelf.id,
            set: {
              name: sql`excluded.name`,
              subShelfCount: sql`excluded.sub_shelf_count`,
              itemCount: sql`excluded.item_count`,
              lastAnalyzedAt: sql`excluded.last_analyzed_count`,
              deletedAt: sql`excluded.deleted_at`,
              updatedAt: sql`excluded.updated_at`,
              createdAt: sql`excluded.created_at`,
            },
          });
      }

      if (usersToShelves.length > 0) {
        await tx
          .insert(UsersToShelves)
          .values(usersToShelves)
          .onConflictDoUpdate({
            target: [UsersToShelves.userPublicId, UsersToShelves.rootShelfId],
            set: {
              permission: sql`excluded.permission`,
            },
          });
      }
    });
  };

  static syncCreateRootShelf = async (
    request: CreateRootShelfRequest,
    response: CreateRootShelfResponse
  ): Promise<void> => {
    if (!localDB.isReady) await localDB.ensureReady();
    await localDB.transaction(async tx => {
      await tx
        .insert(RootShelf)
        .values({
          id: response.data.id,
          name: request.body.name,
        })
        .onConflictDoUpdate({
          target: RootShelf.id,
          set: {
            name: sql`excluded.name`,
            updatedAt: sql`excluded.updated_at`,
          },
        });
      await tx
        .insert(UsersToShelves)
        .values({
          userPublicId: response.embedded.publicId,
          rootShelfId: response.data.id,
          permission: AccessControlPermission.Owner,
        })
        .onConflictDoUpdate({
          target: [UsersToShelves.userPublicId, UsersToShelves.rootShelfId],
          set: {
            permission: sql`excluded.permission`,
            updatedAt: sql`excluded.updated_at`,
          },
        });
    });
  };

  static syncCreateRootShelves = async (
    request: CreateRootShelvesRequest,
    response: CreateRootShelvesResponse
  ): Promise<void> => {
    if (!localDB.isReady) await localDB.ensureReady();
    const createdRootShelves = request.body.createdRootShelves.map(
      (createdRootShelf, index) => ({
        id: response.data.ids[index],
        name: createdRootShelf.name,
      })
    );
    const createdUsersToShelves = response.data.ids.map(id => ({
      userPublicId: response.embedded.publicId,
      rootShelfId: id,
      permission: AccessControlPermission.Owner,
    }));
    if (createdRootShelves.length === 0 || createdUsersToShelves.length === 0) {
      return;
    }
    await localDB.transaction(async tx => {
      await tx
        .insert(RootShelf)
        .values(createdRootShelves)
        .onConflictDoUpdate({
          target: RootShelf.id,
          set: {
            name: sql`excluded.name`,
            updatedAt: sql`excluded.updated_at`,
          },
        });
      await tx
        .insert(UsersToShelves)
        .values(createdUsersToShelves)
        .onConflictDoUpdate({
          target: [UsersToShelves.userPublicId, UsersToShelves.rootShelfId],
          set: {
            permission: sql`excluded.permission`,
            updatedAt: sql`excluded.updated_at`,
          },
        });
    });
  };

  static syncUpdateMyRootShelfById = async (
    request: UpdateMyRootShelfByIdRequest,
    response: UpdateMyRootShelfByIdResponse
  ): Promise<void> => {
    if (!localDB.isReady) await localDB.ensureReady();
    await localDB
      .update(RootShelf)
      .set({
        name: request.body.values.name,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(RootShelf.id, request.body.rootShelfId),
          RootShelfLocalSynchronizer.getPassPermissionCheckSQL(
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

  static syncUpdateMyRootShelvesByIds = async (
    request: UpdateMyRootShelvesByIdsRequest,
    response: UpdateMyRootShelvesByIdsResponse
  ): Promise<void> => {
    if (!localDB.isReady) await localDB.ensureReady();
    const updatedRootShelvesWithName = request.body.updatedRootShelves.filter(
      updatedRootShelf => updatedRootShelf.values.name !== undefined
    );
    if (updatedRootShelvesWithName.length === 0) return;

    await localDB
      .update(RootShelf)
      .set({
        name: sql`CASE ${RootShelf.id}
              ${sql.join(
                updatedRootShelvesWithName.map(
                  updateRootShelf =>
                    sql`WHEN ${updateRootShelf.rootShelfId} 
                        THEN ${updateRootShelf.values.name}`
                ),
                sql` `
              )} ELSE ${RootShelf.name}
            END`,
        updatedAt: response.data.updatedAt,
      })
      .where(
        and(
          inArray(
            RootShelf.id,
            updatedRootShelvesWithName.map(
              updateRootShelf => updateRootShelf.rootShelfId
            )
          ),
          RootShelfLocalSynchronizer.getPassPermissionCheckSQL(
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

  static syncRestoreMyRootShelfById = async (
    request: RestoreMyRootShelfByIdRequest,
    response: RestoreMyRootShelfByIdResponse
  ): Promise<void> => {
    if (!localDB.isReady) await localDB.ensureReady();
    await localDB
      .update(RootShelf)
      .set({
        deletedAt: null,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(RootShelf.id, request.body.rootShelfId),
          RootShelfLocalSynchronizer.getPassPermissionCheckSQL(
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

  static syncRestoreMyRootShelvesByIds = async (
    request: RestoreMyRootShelvesByIdsRequest,
    response: RestoreMyRootShelvesByIdsResponse
  ): Promise<void> => {
    if (!localDB.isReady) await localDB.ensureReady();
    await localDB
      .update(RootShelf)
      .set({
        deletedAt: null,
      })
      .where(
        and(
          inArray(RootShelf.id, request.body.rootShelfIds),
          RootShelfLocalSynchronizer.getPassPermissionCheckSQL(
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

  static syncDeleteMyRootShelfById = async (
    request: DeleteMyRootShelfByIdRequest,
    response: DeleteMyRootShelfByIdResponse
  ): Promise<void> => {
    if (!localDB.isReady) await localDB.ensureReady();
    await localDB
      .update(RootShelf)
      .set({
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(RootShelf.id, request.body.rootShelfId),
          RootShelfLocalSynchronizer.getPassPermissionCheckSQL(
            localDB,
            response.embedded.publicId,
            [AccessControlPermission.Owner, AccessControlPermission.Admin]
          )
        )
      );
  };

  static syncDeleteMyRootShelvesByIds = async (
    request: DeleteMyRootShelvesByIdsRequest,
    response: DeleteMyRootShelvesByIdsResponse
  ): Promise<void> => {
    if (!localDB.isReady) await localDB.ensureReady();
    await localDB
      .update(RootShelf)
      .set({
        deletedAt: new Date(),
      })
      .where(
        and(
          inArray(RootShelf.id, request.body.rootShelfIds),
          RootShelfLocalSynchronizer.getPassPermissionCheckSQL(
            localDB,
            response.embedded.publicId,
            [AccessControlPermission.Owner, AccessControlPermission.Admin]
          )
        )
      );
  };
}
