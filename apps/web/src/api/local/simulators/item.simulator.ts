import {
  ItemType as GraphQLItemType,
  type SearchItemInput,
  type SearchItemsQuery,
} from "@shared/api/graphql/generated/graphql";
import { AllAccessControlPermissions } from "@shared/api/interfaces/enums/accessControlPermission.enum";
import { matchesSearch, searchPage } from "@shared/lib/search/searchPage";
import type { UUID } from "crypto";
import { and, eq, exists, inArray, sql } from "drizzle-orm";
import { localDB } from "@/api/local/db";
import {
  BlockPack,
  Material,
  SubShelf,
  User,
  UsersToShelves,
} from "@/api/local/schemas";

type SearchedItem = {
  id: string;
  name: string;
  parentSubShelfId: string;
  rootShelfId: string;
  type: GraphQLItemType;
  updatedAt: Date;
  createdAt: Date;
};

export class ItemLocalSimulator {
  static simulateSearchItems = async (
    input: SearchItemInput
  ): Promise<SearchItemsQuery["searchItems"]> => {
    const startedAt = performance.now();
    if (!localDB.isReady) await localDB.ensureReady();
    const loggedInUser = await localDB.query.User.findFirst({
      where: eq(User.isLoggedIn, true),
    });
    const empty = {
      __typename: "SearchItemConnection" as const,
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
    if (loggedInUser === undefined) return empty;

    const rows = await localDB
      .select({
        id: BlockPack.id,
        name: BlockPack.name,
        parentSubShelfId: BlockPack.parentSubShelfId,
        rootShelfId: SubShelf.rootShelfId,
        deletedAt: BlockPack.deletedAt,
        updatedAt: BlockPack.updatedAt,
        createdAt: BlockPack.createdAt,
      })
      .from(BlockPack)
      .innerJoin(SubShelf, eq(SubShelf.id, BlockPack.parentSubShelfId))
      .where(
        exists(
          localDB
            .select({ one: sql`1` })
            .from(UsersToShelves)
            .where(
              and(
                eq(UsersToShelves.userPublicId, loggedInUser.publicId),
                eq(UsersToShelves.rootShelfId, SubShelf.rootShelfId),
                inArray(UsersToShelves.permission, AllAccessControlPermissions)
              )
            )
        )
      );
    const materialRows = await localDB
      .select({
        id: Material.id,
        name: Material.name,
        parentSubShelfId: Material.parentSubShelfId,
        rootShelfId: Material.rootShelfId,
        deletedAt: Material.deletedAt,
        updatedAt: Material.updatedAt,
        createdAt: Material.createdAt,
      })
      .from(Material)
      .where(
        exists(
          localDB
            .select({ one: sql`1` })
            .from(UsersToShelves)
            .where(
              and(
                eq(UsersToShelves.userPublicId, loggedInUser.publicId),
                eq(UsersToShelves.rootShelfId, Material.rootShelfId),
                inArray(UsersToShelves.permission, AllAccessControlPermissions)
              )
            )
        )
      );

    const matched: SearchedItem[] = [
      ...rows.map(row => ({ ...row, type: GraphQLItemType.ItemTypeBlockPack })),
      ...materialRows.map(row => ({
        ...row,
        type: GraphQLItemType.ItemTypeMaterial,
      })),
    ].flatMap(row => {
      if ((row.deletedAt !== null) !== (input.isDeletedAt === true)) return [];
      if (
        input.parentSubShelfId &&
        row.parentSubShelfId !== input.parentSubShelfId
      ) {
        return [];
      }
      if (input.rootShelfId && row.rootShelfId !== input.rootShelfId) return [];
      if (!matchesSearch(row.name, input.query)) return [];
      return [
        {
          id: row.id,
          name: row.name,
          parentSubShelfId: row.parentSubShelfId,
          rootShelfId: row.rootShelfId,
          type: row.type,
          updatedAt: row.updatedAt,
          createdAt: row.createdAt,
        },
      ];
    });
    const page = searchPage("items", input, matched, {
      RELEVANCE: row => row.name,
      TYPE: row => row.type,
      LAST_UPDATE: row => row.updatedAt,
      CREATED_AT: row => row.createdAt,
    });

    return {
      __typename: "SearchItemConnection",
      searchEdges: page.rows.map(item => ({
        __typename: "SearchItemEdge" as const,
        encodedSearchCursor: page.cursors.get(item.id)!,
        node: {
          __typename: "PrivateItem" as const,
          id: item.id as UUID,
          name: item.name,
          parentSubShelfId: item.parentSubShelfId as UUID,
          rootShelfId: item.rootShelfId as UUID,
          type: item.type,
          deletedAt: null,
          updatedAt: item.updatedAt,
          createdAt: item.createdAt,
          routineIds: [],
        },
      })),
      searchPageInfo: page.pageInfo,
      totalCount: matched.length,
      searchTime: performance.now() - startedAt,
    } as SearchItemsQuery["searchItems"];
  };
}
