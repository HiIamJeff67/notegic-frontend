import {
  MaterialContentType as GraphQLMaterialContentType,
  type SearchMaterialInput,
  type SearchMaterialsQuery,
} from "@shared/api/graphql/generated/graphql";
import { ItemType, MaterialContentType } from "@shared/api/interfaces/enums";
import { AccessControlPermission } from "@shared/api/interfaces/enums/accessControlPermission.enum";
import type {
  CreateMyMaterialRequest,
  DeleteMyMaterialByIdRequest,
  DeleteMyMaterialsByIdsRequest,
  GetMyMaterialAndItsParentByIdRequest,
  GetMyMaterialByIdRequest,
  GetMyMaterialsByParentSubShelfIdRequest,
  GetMyMaterialsByRootShelfIdRequest,
  HardDeleteMyMaterialsByIdsRequest,
  MoveMyMaterialByIdRequest,
  RestoreMyMaterialByIdRequest,
  RestoreMyMaterialsByIdsRequest,
  UpdateMyMaterialByIdRequest,
} from "@shared/api/interfaces/material.interface";
import { matchesSearch, searchPage } from "@shared/lib/search/searchPage";
import { generateUUID } from "@shared/lib/uuid/uuidv4.type";
import type { UUID } from "crypto";
import { and, eq, exists, inArray, sql } from "drizzle-orm";
import { localDB } from "@/api/local/db";
import {
  Item,
  Material,
  RootShelf,
  RoutinesToItems,
  SubShelf,
  Transaction,
  User,
  UsersToShelves,
} from "@/api/local/schemas";
import { TransactionActionType } from "@/api/local/schemas/enums/transaction_action_type.enum";
import { TransactionEntityType } from "@/api/local/schemas/enums/transaction_entity_type.enum";

const graphQLMaterialContentType: Record<
  MaterialContentType,
  GraphQLMaterialContentType
> = {
  [MaterialContentType.None]: GraphQLMaterialContentType.None,
  [MaterialContentType.JSON]: GraphQLMaterialContentType.ApplicationJson,
  [MaterialContentType.PDF]: GraphQLMaterialContentType.ApplicationPdf,
  [MaterialContentType.Markdown]: GraphQLMaterialContentType.TextMarkdown,
  [MaterialContentType.PlainText]: GraphQLMaterialContentType.TextPlain,
  [MaterialContentType.HTML]: GraphQLMaterialContentType.TextHtml,
  [MaterialContentType.PNG]: GraphQLMaterialContentType.ImagePng,
  [MaterialContentType.JPG]: GraphQLMaterialContentType.ImageJpg,
  [MaterialContentType.JPEG]: GraphQLMaterialContentType.ImageJpeg,
  [MaterialContentType.GIF]: GraphQLMaterialContentType.ImageGif,
  [MaterialContentType.SVG]: GraphQLMaterialContentType.ImageSvg,
  [MaterialContentType.WebP]: GraphQLMaterialContentType.ImageWebP,
  [MaterialContentType.MP4]: GraphQLMaterialContentType.VideoMp4,
  [MaterialContentType.WebM]: GraphQLMaterialContentType.VideoWebM,
  [MaterialContentType.MP3]: GraphQLMaterialContentType.AudioMpeg,
};

const materialColumns = {
  id: Material.id,
  parentSubShelfId: Material.parentSubShelfId,
  name: Material.name,
  size: Material.size,
  contentType: Material.contentType,
  parseMediaType: Material.parseMediaType,
  objectKey: Material.objectKey,
  deletedAt: Material.deletedAt,
  updatedAt: Material.updatedAt,
  createdAt: Material.createdAt,
};

export class MaterialLocalSimulator {
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
              : eq(UsersToShelves.rootShelfId, Material.rootShelfId),
            inArray(UsersToShelves.permission, permissions)
          )
        )
    );

  static simulateGetMyMaterialById = async (
    request: GetMyMaterialByIdRequest
  ) => {
    if (!localDB.isReady) await localDB.ensureReady();
    const loggedInUser = await localDB.query.User.findFirst({
      where: eq(User.isLoggedIn, true),
    });
    if (!loggedInUser) return null;

    const rows = await localDB
      .select(materialColumns)
      .from(Material)
      .where(
        and(
          eq(Material.id, request.param.materialId),
          MaterialLocalSimulator.getPassPermissionCheckSQL(
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
    const material = rows[0];
    if (!material) return null;
    if ((material.deletedAt !== null) !== (request.param.isDeleted ?? false)) {
      return null;
    }
    return material;
  };

  static simulateGetMyMaterialAndItsParentById = async (
    request: GetMyMaterialAndItsParentByIdRequest
  ) => {
    if (!localDB.isReady) await localDB.ensureReady();
    const loggedInUser = await localDB.query.User.findFirst({
      where: eq(User.isLoggedIn, true),
    });
    if (!loggedInUser) return null;

    const rows = await localDB
      .select({
        ...materialColumns,
        rootShelfId: Material.rootShelfId,
        parentSubShelfName: SubShelf.name,
        parentSubShelfPrevSubShelfId: SubShelf.prevSubShelfId,
        parentSubShelfPath: SubShelf.path,
        parentSubShelfDeletedAt: SubShelf.deletedAt,
        parentSubShelfUpdatedAt: SubShelf.updatedAt,
        parentSubShelfCreatedAt: SubShelf.createdAt,
      })
      .from(Material)
      .innerJoin(SubShelf, eq(SubShelf.id, Material.parentSubShelfId))
      .where(
        and(
          eq(Material.id, request.param.materialId),
          MaterialLocalSimulator.getPassPermissionCheckSQL(
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
    const material = rows[0];
    if (!material) return null;
    if ((material.deletedAt !== null) !== (request.param.isDeleted ?? false)) {
      return null;
    }
    return material;
  };

  static simulateGetMyMaterialsByParentSubShelfId = async (
    request: GetMyMaterialsByParentSubShelfIdRequest
  ) => {
    if (!localDB.isReady) await localDB.ensureReady();
    const loggedInUser = await localDB.query.User.findFirst({
      where: eq(User.isLoggedIn, true),
    });
    if (!loggedInUser) return [];

    const materials = await localDB
      .select(materialColumns)
      .from(Material)
      .where(
        and(
          eq(Material.parentSubShelfId, request.param.parentSubShelfId),
          MaterialLocalSimulator.getPassPermissionCheckSQL(
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
    return materials.filter(
      material => (material.deletedAt !== null) === areDeleted
    );
  };

  static simulateGetMyMaterialsByRootShelfId = async (
    request: GetMyMaterialsByRootShelfIdRequest
  ) => {
    if (!localDB.isReady) await localDB.ensureReady();
    const loggedInUser = await localDB.query.User.findFirst({
      where: eq(User.isLoggedIn, true),
    });
    if (!loggedInUser) return [];

    const materials = await localDB
      .select(materialColumns)
      .from(Material)
      .where(
        and(
          eq(Material.rootShelfId, request.param.rootShelfId),
          MaterialLocalSimulator.getPassPermissionCheckSQL(
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
    return materials.filter(
      material => (material.deletedAt !== null) === areDeleted
    );
  };

  static simulateCreateMyMaterial = async (
    request: CreateMyMaterialRequest
  ): Promise<{ id: string; createdAt: Date } | null> => {
    if (!localDB.isReady) await localDB.ensureReady();

    return await localDB.transaction(async tx => {
      const loggedInUser = await tx.query.User.findFirst({
        where: eq(User.isLoggedIn, true),
      });
      if (!loggedInUser) return null;

      const id = generateUUID();
      const createdAt = new Date();
      await tx.insert(Material).values({
        id,
        parentSubShelfId: request.body.parentSubShelfId,
        rootShelfId: request.affected.rootShelfId,
        name: request.body.name,
        size: 0,
        contentType: MaterialContentType.PlainText,
        parseMediaType: "",
        objectKey: "",
        createdAt,
        updatedAt: createdAt,
      });
      await tx.insert(Item).values({
        id,
        parentSubShelfId: request.body.parentSubShelfId,
        rootShelfId: request.affected.rootShelfId,
        name: request.body.name,
        type: ItemType.Material,
        createdAt,
        updatedAt: createdAt,
      });
      await tx
        .update(RootShelf)
        .set({
          itemCount: sql`${RootShelf.itemCount} + 1`,
          updatedAt: createdAt,
        })
        .where(eq(RootShelf.id, request.affected.rootShelfId));
      await tx.insert(Transaction).values({
        ownerPublicId: loggedInUser.publicId,
        entityType: TransactionEntityType.Material,
        actionType: TransactionActionType.CREATE,
        body: request.body,
        affected: {
          ...request.affected,
          offlineMaterialId: id,
        },
      });
      return { id, createdAt };
    });
  };

  static simulateUpdateMyMaterialById = async (
    request: UpdateMyMaterialByIdRequest
  ): Promise<void> => {
    if (!localDB.isReady) await localDB.ensureReady();
    await localDB.transaction(async tx => {
      const loggedInUser = await tx.query.User.findFirst({
        where: eq(User.isLoggedIn, true),
      });
      if (!loggedInUser) return;

      const updatedAt = new Date();
      await tx
        .update(Material)
        .set({
          ...(request.body.values.name !== undefined && {
            name: request.body.values.name,
          }),
          updatedAt,
        })
        .where(
          and(
            eq(Material.id, request.body.materialId),
            MaterialLocalSimulator.getPassPermissionCheckSQL(
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
      if (request.body.values.name !== undefined) {
        await tx
          .update(Item)
          .set({ name: request.body.values.name, updatedAt })
          .where(eq(Item.id, request.body.materialId));
      }
      await tx.insert(Transaction).values({
        ownerPublicId: loggedInUser.publicId,
        entityType: TransactionEntityType.Material,
        actionType: TransactionActionType.UPDATE,
        body: request.body,
        affected: request.affected,
      });
    });
  };

  static simulateMoveMyMaterialById = async (
    request: MoveMyMaterialByIdRequest
  ): Promise<void> => {
    if (!localDB.isReady) await localDB.ensureReady();
    await localDB.transaction(async tx => {
      const loggedInUser = await tx.query.User.findFirst({
        where: eq(User.isLoggedIn, true),
      });
      if (!loggedInUser) return;

      const destination = (
        await tx
          .select({ rootShelfId: SubShelf.rootShelfId })
          .from(SubShelf)
          .where(eq(SubShelf.id, request.body.destinationParentSubShelfId))
          .limit(1)
      )[0];
      if (!destination) return;

      const updatedAt = new Date();
      await tx
        .update(Material)
        .set({
          parentSubShelfId: request.body.destinationParentSubShelfId,
          rootShelfId: destination.rootShelfId,
          updatedAt,
        })
        .where(
          and(
            eq(Material.id, request.body.materialId),
            MaterialLocalSimulator.getPassPermissionCheckSQL(
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
        .update(Item)
        .set({
          parentSubShelfId: request.body.destinationParentSubShelfId,
          rootShelfId: destination.rootShelfId,
          updatedAt,
        })
        .where(eq(Item.id, request.body.materialId));
      if (destination.rootShelfId !== request.affected.rootShelfId) {
        await tx
          .update(RootShelf)
          .set({
            itemCount: sql`max(0, ${RootShelf.itemCount} - 1)`,
            updatedAt,
          })
          .where(eq(RootShelf.id, request.affected.rootShelfId));
        await tx
          .update(RootShelf)
          .set({
            itemCount: sql`${RootShelf.itemCount} + 1`,
            updatedAt,
          })
          .where(eq(RootShelf.id, destination.rootShelfId));
      }
      await tx.insert(Transaction).values({
        ownerPublicId: loggedInUser.publicId,
        entityType: TransactionEntityType.Material,
        actionType: TransactionActionType.MOVE,
        body: request.body,
        affected: request.affected,
      });
    });
  };

  static simulateRestoreMyMaterialById = async (
    request: RestoreMyMaterialByIdRequest
  ) => {
    if (!localDB.isReady) await localDB.ensureReady();
    return await localDB.transaction(async tx => {
      const loggedInUser = await tx.query.User.findFirst({
        where: eq(User.isLoggedIn, true),
      });
      if (!loggedInUser) return null;

      const updatedAt = new Date();
      const restored = await tx
        .update(Material)
        .set({ deletedAt: null, updatedAt })
        .where(
          and(
            eq(Material.id, request.body.materialId),
            MaterialLocalSimulator.getPassPermissionCheckSQL(
              tx,
              loggedInUser.publicId,
              [
                AccessControlPermission.Owner,
                AccessControlPermission.Admin,
                AccessControlPermission.Write,
              ]
            )
          )
        )
        .returning(materialColumns);
      await tx
        .update(Item)
        .set({ deletedAt: null, updatedAt })
        .where(eq(Item.id, request.body.materialId));
      await tx
        .update(RootShelf)
        .set({
          itemCount: sql`${RootShelf.itemCount} + 1`,
          updatedAt,
        })
        .where(eq(RootShelf.id, request.affected.rootShelfId));
      await tx.insert(Transaction).values({
        ownerPublicId: loggedInUser.publicId,
        entityType: TransactionEntityType.Material,
        actionType: TransactionActionType.RESTORE,
        body: request.body,
        affected: request.affected,
      });
      return restored[0] ?? null;
    });
  };

  static simulateRestoreMyMaterialsByIds = async (
    request: RestoreMyMaterialsByIdsRequest
  ) => {
    if (!localDB.isReady) await localDB.ensureReady();
    return await localDB.transaction(async tx => {
      const loggedInUser = await tx.query.User.findFirst({
        where: eq(User.isLoggedIn, true),
      });
      if (!loggedInUser) return [];

      const updatedAt = new Date();
      const restored = await tx
        .update(Material)
        .set({ deletedAt: null, updatedAt })
        .where(
          and(
            inArray(Material.id, request.body.materialIds),
            MaterialLocalSimulator.getPassPermissionCheckSQL(
              tx,
              loggedInUser.publicId,
              [
                AccessControlPermission.Owner,
                AccessControlPermission.Admin,
                AccessControlPermission.Write,
              ]
            )
          )
        )
        .returning({
          ...materialColumns,
          rootShelfId: Material.rootShelfId,
        });
      if (restored.length > 0) {
        await tx
          .update(Item)
          .set({ deletedAt: null, updatedAt })
          .where(
            inArray(
              Item.id,
              restored.map(material => material.id)
            )
          );
      }
      const restoredCountByRootShelf = new Map<string, number>();
      for (const material of restored) {
        restoredCountByRootShelf.set(
          material.rootShelfId,
          (restoredCountByRootShelf.get(material.rootShelfId) ?? 0) + 1
        );
      }
      for (const [rootShelfId, count] of restoredCountByRootShelf) {
        await tx
          .update(RootShelf)
          .set({
            itemCount: sql`${RootShelf.itemCount} + ${count}`,
            updatedAt,
          })
          .where(eq(RootShelf.id, rootShelfId));
      }
      await tx.insert(Transaction).values({
        ownerPublicId: loggedInUser.publicId,
        entityType: TransactionEntityType.Material,
        actionType: TransactionActionType.RESTORE,
        body: request.body,
        affected: request.affected,
      });
      return restored;
    });
  };

  static simulateDeleteMyMaterialById = async (
    request: DeleteMyMaterialByIdRequest
  ): Promise<void> => {
    if (!localDB.isReady) await localDB.ensureReady();
    await localDB.transaction(async tx => {
      const loggedInUser = await tx.query.User.findFirst({
        where: eq(User.isLoggedIn, true),
      });
      if (!loggedInUser) return;

      const deletedAt = new Date();
      await tx
        .update(Material)
        .set({ deletedAt, updatedAt: deletedAt })
        .where(
          and(
            eq(Material.id, request.body.materialId),
            MaterialLocalSimulator.getPassPermissionCheckSQL(
              tx,
              loggedInUser.publicId,
              [AccessControlPermission.Owner, AccessControlPermission.Admin]
            )
          )
        );
      await tx
        .update(Item)
        .set({ deletedAt, updatedAt: deletedAt })
        .where(eq(Item.id, request.body.materialId));
      await tx
        .update(RootShelf)
        .set({
          itemCount: sql`max(0, ${RootShelf.itemCount} - 1)`,
          updatedAt: deletedAt,
        })
        .where(eq(RootShelf.id, request.affected.rootShelfId));
      await tx.insert(Transaction).values({
        ownerPublicId: loggedInUser.publicId,
        entityType: TransactionEntityType.Material,
        actionType: TransactionActionType.DELETE,
        body: request.body,
        affected: request.affected,
      });
    });
  };

  static simulateDeleteMyMaterialsByIds = async (
    request: DeleteMyMaterialsByIdsRequest
  ): Promise<void> => {
    if (!localDB.isReady) await localDB.ensureReady();
    await localDB.transaction(async tx => {
      const loggedInUser = await tx.query.User.findFirst({
        where: eq(User.isLoggedIn, true),
      });
      if (!loggedInUser) return;

      const deletedAt = new Date();
      await tx
        .update(Material)
        .set({ deletedAt, updatedAt: deletedAt })
        .where(
          and(
            inArray(Material.id, request.body.materialIds),
            MaterialLocalSimulator.getPassPermissionCheckSQL(
              tx,
              loggedInUser.publicId,
              [AccessControlPermission.Owner, AccessControlPermission.Admin]
            )
          )
        );
      await tx
        .update(Item)
        .set({ deletedAt, updatedAt: deletedAt })
        .where(inArray(Item.id, request.body.materialIds));
      for (const rootShelfId of request.affected.rootShelfIds) {
        await tx
          .update(RootShelf)
          .set({
            itemCount: sql`max(0, ${RootShelf.itemCount} - 1)`,
            updatedAt: deletedAt,
          })
          .where(eq(RootShelf.id, rootShelfId));
      }
      await tx.insert(Transaction).values({
        ownerPublicId: loggedInUser.publicId,
        entityType: TransactionEntityType.Material,
        actionType: TransactionActionType.DELETE,
        body: request.body,
        affected: request.affected,
      });
    });
  };

  static simulateHardDeleteMyMaterialsByIds = async (
    request: HardDeleteMyMaterialsByIdsRequest
  ): Promise<void> => {
    if (!localDB.isReady) await localDB.ensureReady();
    await localDB.transaction(async tx => {
      const loggedInUser = await tx.query.User.findFirst({
        where: eq(User.isLoggedIn, true),
      });
      if (!loggedInUser) return;
      if (request.body.materialIds.length === 0) return;

      await tx
        .delete(RoutinesToItems)
        .where(inArray(RoutinesToItems.itemId, request.body.materialIds));
      await tx.delete(Item).where(inArray(Item.id, request.body.materialIds));
      await tx
        .delete(Material)
        .where(
          and(
            inArray(Material.id, request.body.materialIds),
            MaterialLocalSimulator.getPassPermissionCheckSQL(
              tx,
              loggedInUser.publicId,
              [AccessControlPermission.Owner, AccessControlPermission.Admin]
            )
          )
        );
      await tx.insert(Transaction).values({
        ownerPublicId: loggedInUser.publicId,
        entityType: TransactionEntityType.Material,
        actionType: TransactionActionType.HARD_DELETE,
        body: request.body,
        affected: null,
      });
    });
  };

  static simulateSearchMaterials = async (
    input: SearchMaterialInput
  ): Promise<SearchMaterialsQuery["searchMaterials"]> => {
    const startedAt = performance.now();
    if (!localDB.isReady) await localDB.ensureReady();
    const loggedInUser = await localDB.query.User.findFirst({
      where: eq(User.isLoggedIn, true),
    });
    const empty = {
      __typename: "SearchMaterialConnection" as const,
      searchEdges: [],
      searchPageInfo: {
        __typename: "SearchPageInfo" as const,
        hasNextPage: false,
        hasPreviousPage: false,
        startEncodedSearchCursor: null,
        endEncodedSearchCursor: null,
      },
      totalCount: 0,
      searchTime: performance.now() - startedAt,
    };
    if (!loggedInUser) return empty;

    const rows = await localDB
      .select({
        ...materialColumns,
        rootShelfId: Material.rootShelfId,
      })
      .from(Material)
      .where(
        MaterialLocalSimulator.getPassPermissionCheckSQL(
          localDB,
          loggedInUser.publicId,
          [
            AccessControlPermission.Read,
            AccessControlPermission.Write,
            AccessControlPermission.Admin,
            AccessControlPermission.Owner,
          ]
        )
      );
    const matched = rows.filter(row => {
      if ((row.deletedAt !== null) !== (input.isDeletedAt === true)) {
        return false;
      }
      if (
        input.parentSubShelfId &&
        row.parentSubShelfId !== input.parentSubShelfId
      ) {
        return false;
      }
      if (input.rootShelfId && row.rootShelfId !== input.rootShelfId) {
        return false;
      }
      return matchesSearch(row.name, input.query);
    });
    const page = searchPage("materials", input, matched, {
      RELEVANCE: row => row.name,
      NAME: row => row.name,
      CONTENT_TYPE: row => row.contentType,
      SIZE: row => row.size,
      LAST_UPDATE: row => row.updatedAt,
      CREATED_AT: row => row.createdAt,
    });

    return {
      __typename: "SearchMaterialConnection",
      searchEdges: page.rows.map(material => ({
        __typename: "SearchMaterialEdge" as const,
        encodedSearchCursor: page.cursors.get(material.id)!,
        node: {
          __typename: "PrivateMaterial" as const,
          id: material.id as UUID,
          parentSubShelfId: material.parentSubShelfId as UUID,
          name: material.name,
          size: material.size,
          contentType:
            graphQLMaterialContentType[material.contentType] ??
            GraphQLMaterialContentType.TextPlain,
          parseMediaType: material.parseMediaType,
          deletedAt: material.deletedAt,
          updatedAt: material.updatedAt,
          createdAt: material.createdAt,
        },
      })),
      searchPageInfo: page.pageInfo,
      totalCount: matched.length,
      searchTime: performance.now() - startedAt,
    };
  };
}
