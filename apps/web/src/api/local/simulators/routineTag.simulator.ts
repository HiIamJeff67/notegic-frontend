import { toGraphQLSupportedIcon } from "@shared/api/graphql/conversions";
import {
  type SearchRoutineTagInput,
  SearchRoutineTagSortBy,
  type SearchRoutineTagsQuery,
  SearchSortOrder,
  UserPlan,
  UserRole,
  UserStatus,
} from "@shared/api/graphql/generated/graphql";
import type {
  CreateRoutineTagRequest,
  CreateRoutineTagsRequest,
  GetAllMyRoutineTagsRequest,
  GetMyRoutineTagByIdRequest,
  HardDeleteMyRoutineTagByIdRequest,
  HardDeleteMyRoutineTagsByIdsRequest,
  UpdateMyRoutineTagByIdRequest,
  UpdateMyRoutineTagsByIdsRequest,
} from "@shared/api/interfaces/routineTag.interface";
import { localDB } from "@/api/local/db";
import {
  Routine,
  RoutinesToTags,
  RoutineTag,
  Transaction,
  User,
} from "@/api/local/schemas";
import { TransactionActionType } from "@/api/local/schemas/enums/transaction_action_type.enum";
import { TransactionEntityType } from "@/api/local/schemas/enums/transaction_entity_type.enum";
import { generateUUID } from "@shared/types/uuidv4.type";
import { and, eq, inArray } from "drizzle-orm";

export class RoutineTagLocalSimulator {
  static simulateSearchRoutineTags = async (
    input: SearchRoutineTagInput
  ): Promise<SearchRoutineTagsQuery["searchRoutineTags"]> => {
    const startedAt = performance.now();
    if (!localDB.isReady) await localDB.ensureReady();
    const loggedInUser = await localDB.query.User.findFirst({
      where: eq(User.isLoggedIn, true),
    });

    if (loggedInUser === undefined) {
      return {
        __typename: "SearchRoutineTagConnection",
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

    const accessibleTags = await localDB
      .select({
        id: RoutineTag.id,
        name: RoutineTag.name,
        color: RoutineTag.color,
        icon: RoutineTag.icon,
        updatedAt: RoutineTag.updatedAt,
        createdAt: RoutineTag.createdAt,
      })
      .from(RoutineTag)
      .where(eq(RoutineTag.ownerPublicId, loggedInUser.publicId));

    const normalizedQuery = input.query.trim().toLowerCase();
    const tags = accessibleTags.filter(tag => {
      if (normalizedQuery.length === 0) return true;
      return tag.name.toLowerCase().includes(normalizedQuery);
    });

    tags.sort((left, right) => {
      const sortBy = input.sortBy ?? SearchRoutineTagSortBy.Relevance;
      const sortOrder = input.sortOrder ?? SearchSortOrder.Asc;
      let comparison = 0;

      if (sortBy === SearchRoutineTagSortBy.LastUpdate) {
        comparison = left.updatedAt.getTime() - right.updatedAt.getTime();
      } else if (sortBy === SearchRoutineTagSortBy.CreatedAt) {
        comparison = left.createdAt.getTime() - right.createdAt.getTime();
      } else {
        comparison = left.name.localeCompare(right.name);
      }
      if (comparison === 0) {
        comparison = left.name.localeCompare(right.name);
      }
      return sortOrder === SearchSortOrder.Desc ? -comparison : comparison;
    });

    let afterId: string | null = null;
    if (input.after) {
      try {
        const decoded = JSON.parse(atob(input.after)) as {
          id?: unknown;
          fields?: { id?: unknown };
        };
        const decodedId = decoded.id ?? decoded.fields?.id;
        afterId = typeof decodedId === "string" ? decodedId : null;
      } catch {
        afterId = null;
      }
    }
    const afterIndex =
      afterId === null ? -1 : tags.findIndex(tag => tag.id === afterId);
    const startIndex = afterIndex >= 0 ? afterIndex + 1 : 0;
    const first = Math.max(0, input.first ?? 10);
    const pagedTags = tags.slice(startIndex, startIndex + first);

    return {
      __typename: "SearchRoutineTagConnection",
      searchEdges: pagedTags.map(tag => {
        const icon = toGraphQLSupportedIcon(tag.icon);

        return {
          __typename: "SearchRoutineTagEdge",
          encodedSearchCursor: btoa(JSON.stringify({ id: tag.id })),
          node: {
            __typename: "PrivateRoutineTag",
            id: tag.id,
            name: tag.name,
            color: tag.color,
            icon,
            updatedAt: tag.updatedAt,
            createdAt: tag.createdAt,
          },
        };
      }),
      searchPageInfo: {
        __typename: "SearchPageInfo",
        hasNextPage: startIndex + first < tags.length,
        hasPreviousPage: startIndex > 0,
        startEncodedSearchCursor:
          pagedTags.length > 0
            ? btoa(JSON.stringify({ id: pagedTags[0].id }))
            : null,
        endEncodedSearchCursor:
          pagedTags.length > 0
            ? btoa(
                JSON.stringify({
                  id: pagedTags[pagedTags.length - 1].id,
                })
              )
            : null,
      },
      totalCount: pagedTags.length,
      searchTime: performance.now() - startedAt,
    } as unknown as SearchRoutineTagsQuery["searchRoutineTags"];
  };

  static simulateGetMyRoutineTagById = async (
    request: GetMyRoutineTagByIdRequest
  ) => {
    if (!localDB.isReady) await localDB.ensureReady();
    const loggedInUser = await localDB.query.User.findFirst({
      where: eq(User.isLoggedIn, true),
    });
    if (loggedInUser === undefined) return null;

    const tags = await localDB
      .select({
        id: RoutineTag.id,
        name: RoutineTag.name,
        color: RoutineTag.color,
        icon: RoutineTag.icon,
        updatedAt: RoutineTag.updatedAt,
        createdAt: RoutineTag.createdAt,
      })
      .from(RoutineTag)
      .where(
        and(
          eq(RoutineTag.id, request.param.routineTagId),
          eq(RoutineTag.ownerPublicId, loggedInUser.publicId)
        )
      )
      .limit(1);

    if (request.param.isDeleted === true) return null;

    return tags[0] ?? null;
  };

  static simulateGetAllMyRoutineTags = async (
    request?: GetAllMyRoutineTagsRequest
  ) => {
    if (request?.param?.areDeleted === true) return [];

    if (!localDB.isReady) await localDB.ensureReady();
    const loggedInUser = await localDB.query.User.findFirst({
      where: eq(User.isLoggedIn, true),
    });
    if (loggedInUser === undefined) return [];

    return await localDB
      .select({
        id: RoutineTag.id,
        name: RoutineTag.name,
        color: RoutineTag.color,
        icon: RoutineTag.icon,
        updatedAt: RoutineTag.updatedAt,
        createdAt: RoutineTag.createdAt,
      })
      .from(RoutineTag)
      .where(eq(RoutineTag.ownerPublicId, loggedInUser.publicId));
  };

  static simulateCreateRoutineTag = async (
    request: CreateRoutineTagRequest
  ): Promise<void> => {
    if (!localDB.isReady) await localDB.ensureReady();

    await localDB.transaction(async tx => {
      const loggedInUser = await tx.query.User.findFirst({
        where: eq(User.isLoggedIn, true),
      });
      if (loggedInUser === undefined) return;

      const id = request.body.id ?? generateUUID();
      const createdAt = new Date();
      request.body.id = id;
      await tx.insert(RoutineTag).values({
        id,
        ownerPublicId: loggedInUser.publicId,
        name: request.body.name,
        color: request.body.color,
        icon: request.body.icon,
        createdAt,
        updatedAt: createdAt,
      });
      await tx.insert(Transaction).values({
        ownerPublicId: loggedInUser.publicId,
        entityType: TransactionEntityType.RoutineTag,
        actionType: TransactionActionType.CREATE,
        body: request.body,
        affected: request.affected,
      });
    });
  };

  static simulateCreateRoutineTags = async (
    request: CreateRoutineTagsRequest
  ): Promise<void> => {
    if (!localDB.isReady) await localDB.ensureReady();

    await localDB.transaction(async tx => {
      const loggedInUser = await tx.query.User.findFirst({
        where: eq(User.isLoggedIn, true),
      });
      if (loggedInUser === undefined) return;

      const createdAt = new Date();
      const tags = request.body.createdRoutineTags.map(tag => {
        const id = tag.id ?? generateUUID();
        tag.id = id;
        return {
          id,
          ownerPublicId: loggedInUser.publicId,
          name: tag.name,
          color: tag.color,
          icon: tag.icon,
          createdAt,
          updatedAt: createdAt,
        };
      });
      if (tags.length > 0) {
        await tx.insert(RoutineTag).values(tags);
      }
      await tx.insert(Transaction).values({
        ownerPublicId: loggedInUser.publicId,
        entityType: TransactionEntityType.RoutineTag,
        actionType: TransactionActionType.CREATE,
        body: request.body,
        affected: request.affected,
      });
    });
  };

  static simulateUpdateMyRoutineTagById = async (
    request: UpdateMyRoutineTagByIdRequest
  ): Promise<void> => {
    if (!localDB.isReady) await localDB.ensureReady();

    await localDB.transaction(async tx => {
      const loggedInUser = await tx.query.User.findFirst({
        where: eq(User.isLoggedIn, true),
      });
      if (loggedInUser === undefined) return;

      await tx
        .update(RoutineTag)
        .set({
          ...(request.body.values.name !== undefined && {
            name: request.body.values.name,
          }),
          ...(request.body.values.color !== undefined && {
            color: request.body.values.color,
          }),
          ...(request.body.values.icon !== undefined && {
            icon: request.body.values.icon,
          }),
          ...(request.body.setNull?.icon && { icon: null }),
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(RoutineTag.id, request.body.routineTagId),
            eq(RoutineTag.ownerPublicId, loggedInUser.publicId)
          )
        );
      await tx.insert(Transaction).values({
        ownerPublicId: loggedInUser.publicId,
        entityType: TransactionEntityType.RoutineTag,
        actionType: TransactionActionType.UPDATE,
        body: request.body,
        affected: request.affected,
      });
    });
  };

  static simulateUpdateMyRoutineTagsByIds = async (
    request: UpdateMyRoutineTagsByIdsRequest
  ): Promise<void> => {
    if (!localDB.isReady) await localDB.ensureReady();

    await localDB.transaction(async tx => {
      const loggedInUser = await tx.query.User.findFirst({
        where: eq(User.isLoggedIn, true),
      });
      if (loggedInUser === undefined) return;

      const updatedAt = new Date();
      for (const tag of request.body.updatedRoutineTags) {
        await tx
          .update(RoutineTag)
          .set({
            ...(tag.values.name !== undefined && {
              name: tag.values.name,
            }),
            ...(tag.values.color !== undefined && {
              color: tag.values.color,
            }),
            ...(tag.values.icon !== undefined && {
              icon: tag.values.icon,
            }),
            ...(tag.setNull?.icon && { icon: null }),
            updatedAt,
          })
          .where(
            and(
              eq(RoutineTag.id, tag.routineTagId),
              eq(RoutineTag.ownerPublicId, loggedInUser.publicId)
            )
          );
      }
      await tx.insert(Transaction).values({
        ownerPublicId: loggedInUser.publicId,
        entityType: TransactionEntityType.RoutineTag,
        actionType: TransactionActionType.UPDATE,
        body: request.body,
        affected: request.affected,
      });
    });
  };

  static simulateHardDeleteMyRoutineTagById = async (
    request: HardDeleteMyRoutineTagByIdRequest
  ): Promise<void> => {
    if (!localDB.isReady) await localDB.ensureReady();

    await localDB.transaction(async tx => {
      const loggedInUser = await tx.query.User.findFirst({
        where: eq(User.isLoggedIn, true),
      });
      if (loggedInUser === undefined) return;

      const tags = await tx
        .select({ id: RoutineTag.id })
        .from(RoutineTag)
        .where(
          and(
            eq(RoutineTag.id, request.body.routineTagId),
            eq(RoutineTag.ownerPublicId, loggedInUser.publicId)
          )
        );
      if (tags.length === 0) return;

      await tx
        .delete(RoutinesToTags)
        .where(eq(RoutinesToTags.tagId, request.body.routineTagId));
      await tx
        .delete(RoutineTag)
        .where(eq(RoutineTag.id, request.body.routineTagId));
      await tx.insert(Transaction).values({
        ownerPublicId: loggedInUser.publicId,
        entityType: TransactionEntityType.RoutineTag,
        actionType: TransactionActionType.HARD_DELETE,
        body: request.body,
        affected: request.affected,
      });
    });
  };

  static simulateHardDeleteMyRoutineTagsByIds = async (
    request: HardDeleteMyRoutineTagsByIdsRequest
  ): Promise<void> => {
    if (!localDB.isReady) await localDB.ensureReady();

    await localDB.transaction(async tx => {
      const loggedInUser = await tx.query.User.findFirst({
        where: eq(User.isLoggedIn, true),
      });
      if (loggedInUser === undefined) return;

      const tags = await tx
        .select({ id: RoutineTag.id })
        .from(RoutineTag)
        .where(
          and(
            inArray(RoutineTag.id, request.body.routineTagIds),
            eq(RoutineTag.ownerPublicId, loggedInUser.publicId)
          )
        );
      const routineTagIds = tags.map(tag => tag.id);
      if (routineTagIds.length === 0) return;

      await tx
        .delete(RoutinesToTags)
        .where(inArray(RoutinesToTags.tagId, routineTagIds));
      await tx.delete(RoutineTag).where(inArray(RoutineTag.id, routineTagIds));
      await tx.insert(Transaction).values({
        ownerPublicId: loggedInUser.publicId,
        entityType: TransactionEntityType.RoutineTag,
        actionType: TransactionActionType.HARD_DELETE,
        body: {
          ...request.body,
          routineTagIds,
        },
        affected: request.affected,
      });
    });
  };
}
