import { toGraphQLUserStatus } from "@shared/api/graphql/conversions";
import {
  SearchRootShelfInput,
  SearchRootShelfSortBy,
  SearchRootShelvesQuery,
  SearchSortOrder,
  UserPlan,
  UserRole,
} from "@shared/api/graphql/generated/graphql";
import {
  AccessControlPermission,
  AllAccessControlPermissions,
} from "@shared/api/interfaces/enums/accessControlPermission.enum";
import {
  CreateRootShelfRequest,
  CreateRootShelvesRequest,
  DeleteMyRootShelfByIdRequest,
  DeleteMyRootShelvesByIdsRequest,
  GetMyRootShelfByIdRequest,
  RestoreMyRootShelfByIdRequest,
  RestoreMyRootShelvesByIdsRequest,
  UpdateMyRootShelfByIdRequest,
  UpdateMyRootShelvesByIdsRequest,
} from "@shared/api/interfaces/rootShelf.interface";
import { localDB } from "@shared/api/local/db";
import {
  RootShelf,
  Transaction,
  User,
  UsersToShelves,
} from "@shared/api/local/schemas";
import { TransactionActionType } from "@shared/api/local/schemas/enums/transaction_action_type.enum";
import { TransactionEntityType } from "@shared/api/local/schemas/enums/transaction_entity_type.enum";
import { generateUUID } from "@shared/types/uuidv4.type";
import type { UUID } from "crypto";
import { and, eq, exists, inArray, sql } from "drizzle-orm";

export class RootShelfLocalSimulator {
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

  private static encodeSearchCursor = (rootShelfId: string): string =>
    btoa(JSON.stringify({ id: rootShelfId }));

  private static decodeSearchCursor = (encodedCursor?: string | null) => {
    if (!encodedCursor) return null;

    try {
      const decodedCursor = JSON.parse(atob(encodedCursor)) as { id?: unknown };
      return typeof decodedCursor.id === "string" ? decodedCursor.id : null;
    } catch {
      return null;
    }
  };

  static simulateSearchRootShelves = async (
    input: SearchRootShelfInput
  ): Promise<SearchRootShelvesQuery["searchRootShelves"]> => {
    const startedAt = performance.now();
    if (!localDB.isReady) await localDB.ensureReady();
    const loggedInUser = await localDB.query.User.findFirst({
      where: eq(User.isLoggedIn, true),
    });

    if (loggedInUser === undefined) {
      return {
        __typename: "SearchRootShelfConnection",
        searchEdges: [],
        searchPageInfo: {
          __typename: "SearchPageInfo",
          hasNextPage: false,
          hasPreviousPage: false,
          startEncodedSearchCursor: null,
          endEncodedSearchCursor: null,
        },
        totalCount: 0,
        searchTime: performance.now() - startedAt,
      };
    }

    const allAccessibleRootShelves = await localDB
      .select({
        id: RootShelf.id,
        name: RootShelf.name,
        permission: UsersToShelves.permission,
        subShelfCount: RootShelf.subShelfCount,
        itemCount: RootShelf.itemCount,
        lastAnalyzedAt: RootShelf.lastAnalyzedAt,
        deletedAt: RootShelf.deletedAt,
        updatedAt: RootShelf.updatedAt,
        createdAt: RootShelf.createdAt,
      })
      .from(RootShelf)
      .innerJoin(
        UsersToShelves,
        and(
          eq(UsersToShelves.rootShelfId, RootShelf.id),
          eq(UsersToShelves.userPublicId, loggedInUser.publicId),
          inArray(UsersToShelves.permission, AllAccessControlPermissions)
        )
      );

    const normalizedQuery = input.query.trim().toLowerCase();
    const matchedRootShelves = allAccessibleRootShelves.filter(rootShelf => {
      if (rootShelf.deletedAt !== null) return false;
      if (normalizedQuery.length === 0) return true;
      return rootShelf.name.toLowerCase().includes(normalizedQuery);
    });

    matchedRootShelves.sort((left, right) => {
      const sortOrder = input.sortOrder ?? SearchSortOrder.Asc;
      const sortBy = input.sortBy ?? SearchRootShelfSortBy.Relevance;

      const compareResult = (() => {
        if (sortBy === SearchRootShelfSortBy.CreatedAt) {
          return left.createdAt.getTime() - right.createdAt.getTime();
        }
        if (sortBy === SearchRootShelfSortBy.LastUpdate) {
          return left.updatedAt.getTime() - right.updatedAt.getTime();
        }
        if (sortBy === SearchRootShelfSortBy.Name) {
          return left.name.localeCompare(right.name);
        }

        if (normalizedQuery.length === 0) {
          return left.name.localeCompare(right.name);
        }

        const leftIndex = left.name.toLowerCase().indexOf(normalizedQuery);
        const rightIndex = right.name.toLowerCase().indexOf(normalizedQuery);
        if (leftIndex !== rightIndex) return leftIndex - rightIndex;
        return left.name.localeCompare(right.name);
      })();

      return sortOrder === SearchSortOrder.Desc
        ? -compareResult
        : compareResult;
    });

    const first = Math.max(0, input.first ?? matchedRootShelves.length);
    const afterId = RootShelfLocalSimulator.decodeSearchCursor(input.after);
    const afterIndex =
      afterId === null
        ? -1
        : matchedRootShelves.findIndex(rootShelf => rootShelf.id === afterId);
    const startIndex = afterIndex >= 0 ? afterIndex + 1 : 0;
    const pagedRootShelves = matchedRootShelves.slice(
      startIndex,
      startIndex + first
    );
    const pagedRootShelfIds = pagedRootShelves.map(rootShelf => rootShelf.id);
    const usersToShelves =
      pagedRootShelfIds.length === 0
        ? []
        : await localDB
            .select({
              rootShelfId: UsersToShelves.rootShelfId,
              permission: UsersToShelves.permission,
              publicId: User.publicId,
              name: User.name,
              displayName: User.displayName,
              status: User.status,
              createdAt: User.createdAt,
            })
            .from(UsersToShelves)
            .innerJoin(User, eq(User.publicId, UsersToShelves.userPublicId))
            .where(inArray(UsersToShelves.rootShelfId, pagedRootShelfIds));
    const usersByRootShelfId = new Map<string, typeof usersToShelves>();
    for (const userToShelf of usersToShelves) {
      const users = usersByRootShelfId.get(userToShelf.rootShelfId) ?? [];
      users.push(userToShelf);
      usersByRootShelfId.set(userToShelf.rootShelfId, users);
    }

    return {
      __typename: "SearchRootShelfConnection",
      searchEdges: pagedRootShelves.map(rootShelf => ({
        __typename: "SearchRootShelfEdge",
        encodedSearchCursor: RootShelfLocalSimulator.encodeSearchCursor(
          rootShelf.id
        ),
        node: (() => {
          const shelfUsers = usersByRootShelfId.get(rootShelf.id) ?? [];
          const owner =
            shelfUsers.find(
              shelfUser =>
                shelfUser.permission === AccessControlPermission.Owner
            ) ?? loggedInUser;
          const toPublicUser = (user: {
            publicId: string;
            name: string;
            displayName: string;
            status: string;
            createdAt: Date;
          }) => ({
            __typename: "PublicUser" as const,
            publicId: user.publicId as UUID,
            name: user.name,
            displayName: user.displayName,
            role: UserRole.Normal,
            plan: UserPlan.Free,
            status: toGraphQLUserStatus(user.status),
            createdAt: user.createdAt,
            info: null,
          });

          return {
            __typename: "PrivateRootShelf",
            id: rootShelf.id as UUID,
            name: rootShelf.name,
            permission: rootShelf.permission,
            subShelfCount: rootShelf.subShelfCount,
            itemCount: rootShelf.itemCount,
            lastAnalyzedAt: rootShelf.lastAnalyzedAt,
            deletedAt: rootShelf.deletedAt,
            updatedAt: rootShelf.updatedAt,
            createdAt: rootShelf.createdAt,
            owner: toPublicUser(owner),
            sharers: shelfUsers
              .filter(
                shelfUser =>
                  shelfUser.permission !== AccessControlPermission.Owner
              )
              .map(toPublicUser),
            itemIds: [],
          };
        })(),
      })),
      searchPageInfo: {
        __typename: "SearchPageInfo",
        hasNextPage: startIndex + first < matchedRootShelves.length,
        hasPreviousPage: startIndex > 0,
        startEncodedSearchCursor:
          pagedRootShelves.length > 0
            ? RootShelfLocalSimulator.encodeSearchCursor(pagedRootShelves[0].id)
            : null,
        endEncodedSearchCursor:
          pagedRootShelves.length > 0
            ? RootShelfLocalSimulator.encodeSearchCursor(
                pagedRootShelves[pagedRootShelves.length - 1].id
              )
            : null,
      },
      totalCount: matchedRootShelves.length,
      searchTime: performance.now() - startedAt,
    };
  };

  static simulateGetMyRootShelfById = async (
    request: GetMyRootShelfByIdRequest
  ): Promise<{
    id: string;
    name: string;
    permission: AccessControlPermission;
    subShelfCount: number;
    itemCount: number;
    lastAnalyzedAt: Date;
    deletedAt: Date | null;
    updatedAt: Date;
    createdAt: Date;
  } | null> => {
    if (!localDB.isReady) await localDB.ensureReady();
    const loggedInUser = await localDB.query.User.findFirst({
      where: eq(User.isLoggedIn, true),
    });
    if (loggedInUser === undefined) return null;

    const existingRootShelf = await localDB
      .select({
        id: RootShelf.id,
        name: RootShelf.name,
        permission: UsersToShelves.permission,
        subShelfCount: RootShelf.subShelfCount,
        itemCount: RootShelf.itemCount,
        lastAnalyzedAt: RootShelf.lastAnalyzedAt,
        deletedAt: RootShelf.deletedAt,
        updatedAt: RootShelf.updatedAt,
        createdAt: RootShelf.createdAt,
      })
      .from(RootShelf)
      .innerJoin(
        UsersToShelves,
        and(
          eq(UsersToShelves.rootShelfId, RootShelf.id),
          eq(UsersToShelves.userPublicId, loggedInUser.publicId),
          inArray(UsersToShelves.permission, AllAccessControlPermissions)
        )
      )
      .where(eq(RootShelf.id, request.param.rootShelfId))
      .limit(1);

    const rootShelf = existingRootShelf[0];
    if (!rootShelf) return null;

    const isDeleted = request.param.isDeleted ?? false;
    return (rootShelf.deletedAt !== null) === isDeleted ? rootShelf : null;
  };

  // sync mutation data should available while user is offline
  // please to make sure avoiding syncing mutation data for invalid user operation,
  //  ex. unauthorized operations, malicious operations
  static simulateCreateRootShelf = async (
    request: CreateRootShelfRequest
  ): Promise<void> => {
    if (!localDB.isReady) await localDB.ensureReady();
    await localDB.transaction(async tx => {
      const loggedInUser = await tx.query.User.findFirst({
        where: eq(User.isLoggedIn, true),
      });
      if (loggedInUser === undefined) return; // return it directly since throw error in onError hooks will not effect anything
      const id = (request.body.id as UUID | undefined) ?? generateUUID();
      request.body.id = id; // make sure they are the same and the generated id is attached to the request body
      await tx.insert(RootShelf).values({
        id: id,
        name: request.body.name,
      });
      await tx.insert(UsersToShelves).values({
        userPublicId: loggedInUser.publicId,
        rootShelfId: id,
        permission: AccessControlPermission.Owner,
      });
      await tx.insert(Transaction).values({
        ownerPublicId: loggedInUser.publicId,
        entityType: TransactionEntityType.RootShelf,
        actionType: TransactionActionType.CREATE,
        body: request.body,
        affected: request.affected,
      });
    });
  };

  static simulateCreateRootShelves = async (
    request: CreateRootShelvesRequest
  ): Promise<void> => {
    if (!localDB.isReady) await localDB.ensureReady();
    await localDB.transaction(async tx => {
      const loggedInUser = await tx.query.User.findFirst({
        where: eq(User.isLoggedIn, true),
      });
      if (loggedInUser === undefined) return;
      const createdRootShelves = request.body.createdRootShelves.map(
        createdRootShelf => {
          const id = createdRootShelf.id ?? generateUUID();
          createdRootShelf.id = id;
          return {
            id,
            name: createdRootShelf.name,
          };
        }
      );
      const createdUsersToShelves = createdRootShelves.map(
        createdRootShelf => ({
          userPublicId: loggedInUser.publicId,
          rootShelfId: createdRootShelf.id,
          permission: AccessControlPermission.Owner,
        })
      );
      if (createdRootShelves.length > 0) {
        await tx.insert(RootShelf).values(createdRootShelves);
      }
      if (createdUsersToShelves.length > 0) {
        await tx.insert(UsersToShelves).values(createdUsersToShelves);
      }
      await tx.insert(Transaction).values({
        ownerPublicId: loggedInUser.publicId,
        entityType: TransactionEntityType.RootShelf,
        actionType: TransactionActionType.CREATE,
        body: request.body,
        affected: request.affected,
      });
    });
  };

  static simulateUpdateMyRootShelfById = async (
    request: UpdateMyRootShelfByIdRequest
  ): Promise<void> => {
    if (request.body.values.name) {
      if (!localDB.isReady) await localDB.ensureReady();
      await localDB.transaction(async tx => {
        const loggedInUser = await tx.query.User.findFirst({
          where: eq(User.isLoggedIn, true),
        });
        if (loggedInUser === undefined) return;
        await tx
          .update(RootShelf)
          .set({
            name: request.body.values.name,
            updatedAt: new Date(),
          })
          .where(
            and(
              eq(RootShelf.id, request.body.rootShelfId),
              RootShelfLocalSimulator.getPassPermissionCheckSQL(
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
          entityType: TransactionEntityType.RootShelf,
          actionType: TransactionActionType.UPDATE,
          body: request.body,
          affected: request.affected,
        });
      });
    }
  };

  static simulateUpdateMyRootShelvesByIds = async (
    request: UpdateMyRootShelvesByIdsRequest
  ): Promise<void> => {
    if (!localDB.isReady) await localDB.ensureReady();
    if (request.body.updatedRootShelves.length === 0) return;
    await localDB.transaction(async tx => {
      const loggedInUser = await tx.query.User.findFirst({
        where: eq(User.isLoggedIn, true),
      });
      if (loggedInUser === undefined) return;
      await tx
        .update(RootShelf)
        .set({
          name: sql`CASE ${RootShelf.id}
              ${sql.join(
                request.body.updatedRootShelves.map(
                  updateRootShelf =>
                    sql`WHEN ${updateRootShelf.rootShelfId} THEN ${updateRootShelf.values.name}`
                ),
                sql` `
              )} ELSE ${RootShelf.name}
            END`,
          updatedAt: new Date(),
        })
        .where(
          and(
            inArray(
              RootShelf.id,
              request.body.updatedRootShelves.map(
                updateRootShelf => updateRootShelf.rootShelfId
              )
            ),
            RootShelfLocalSimulator.getPassPermissionCheckSQL(
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
        entityType: TransactionEntityType.RootShelf,
        actionType: TransactionActionType.UPDATE,
        body: request.body,
        affected: request.affected,
      });
    });
  };

  static simulateRestoreMyRootShelfById = async (
    request: RestoreMyRootShelfByIdRequest
  ): Promise<void> => {
    if (!localDB.isReady) await localDB.ensureReady();
    await localDB.transaction(async tx => {
      const loggedInUser = await tx.query.User.findFirst({
        where: eq(User.isLoggedIn, true),
      });
      if (loggedInUser === undefined) return;
      await tx
        .update(RootShelf)
        .set({
          deletedAt: null,
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(RootShelf.id, request.body.rootShelfId),
            RootShelfLocalSimulator.getPassPermissionCheckSQL(
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
        entityType: TransactionEntityType.RootShelf,
        actionType: TransactionActionType.RESTORE,
        body: request.body,
        affected: request.affected,
      });
    });
  };

  static simulateRestoreMyRootShelvesByIds = async (
    request: RestoreMyRootShelvesByIdsRequest
  ): Promise<void> => {
    if (!localDB.isReady) await localDB.ensureReady();
    await localDB.transaction(async tx => {
      const loggedInUser = await tx.query.User.findFirst({
        where: eq(User.isLoggedIn, true),
      });
      if (loggedInUser === undefined) return;
      await tx
        .update(RootShelf)
        .set({
          deletedAt: null,
        })
        .where(
          and(
            inArray(RootShelf.id, request.body.rootShelfIds),
            RootShelfLocalSimulator.getPassPermissionCheckSQL(
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
        entityType: TransactionEntityType.RootShelf,
        actionType: TransactionActionType.RESTORE,
        body: request.body,
        affected: request.affected,
      });
    });
  };

  static simulateDeleteMyRootShelfById = async (
    request: DeleteMyRootShelfByIdRequest
  ): Promise<void> => {
    if (!localDB.isReady) await localDB.ensureReady();
    await localDB.transaction(async tx => {
      const loggedInUser = await tx.query.User.findFirst({
        where: eq(User.isLoggedIn, true),
      });
      if (loggedInUser === undefined) return;
      await tx
        .update(RootShelf)
        .set({ deletedAt: new Date() })
        .where(
          and(
            eq(RootShelf.id, request.body.rootShelfId),
            RootShelfLocalSimulator.getPassPermissionCheckSQL(
              tx,
              loggedInUser.publicId,
              [AccessControlPermission.Owner, AccessControlPermission.Admin]
            )
          )
        );
      await tx.insert(Transaction).values({
        ownerPublicId: loggedInUser.publicId,
        entityType: TransactionEntityType.RootShelf,
        actionType: TransactionActionType.DELETE,
        body: request.body,
        affected: request.affected,
      });
    });
  };

  static simulateDeleteMyRootShelvesByIds = async (
    request: DeleteMyRootShelvesByIdsRequest
  ): Promise<void> => {
    if (!localDB.isReady) await localDB.ensureReady();
    await localDB.transaction(async tx => {
      const loggedInUser = await tx.query.User.findFirst({
        where: eq(User.isLoggedIn, true),
      });
      if (loggedInUser === undefined) return;
      await tx
        .update(RootShelf)
        .set({
          deletedAt: new Date(),
        })
        .where(
          and(
            inArray(RootShelf.id, request.body.rootShelfIds),
            RootShelfLocalSimulator.getPassPermissionCheckSQL(
              tx,
              loggedInUser.publicId,
              [AccessControlPermission.Owner, AccessControlPermission.Admin]
            )
          )
        );
      await tx.insert(Transaction).values({
        ownerPublicId: loggedInUser.publicId,
        entityType: TransactionEntityType.RootShelf,
        actionType: TransactionActionType.DELETE,
        body: request.body,
        affected: request.affected,
      });
    });
  };
}
