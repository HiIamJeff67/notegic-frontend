import { SupportedIcon } from "@shared/api/interfaces/enums";
import type {
  CreateRoutineTagRequest,
  CreateRoutineTagResponse,
  CreateRoutineTagsRequest,
  CreateRoutineTagsResponse,
  GetAllMyRoutineTagsResponse,
  GetMyRoutineTagByIdResponse,
  HardDeleteMyRoutineTagByIdRequest,
  HardDeleteMyRoutineTagByIdResponse,
  HardDeleteMyRoutineTagsByIdsRequest,
  HardDeleteMyRoutineTagsByIdsResponse,
  UpdateMyRoutineTagByIdRequest,
  UpdateMyRoutineTagByIdResponse,
  UpdateMyRoutineTagsByIdsRequest,
  UpdateMyRoutineTagsByIdsResponse,
} from "@shared/api/interfaces/routineTag.interface";
import { localDB } from "@/api/local/db";
import { RoutinesToTags, RoutineTag, User } from "@/api/local/schemas";
import { and, eq, inArray, sql } from "drizzle-orm";

export class RoutineTagLocalSynchronizer {
  static syncGetMyRoutineTagById = async (
    response: GetMyRoutineTagByIdResponse
  ): Promise<void> => {
    if (!localDB.isReady) await localDB.ensureReady();

    await localDB.transaction(async tx => {
      const publicId =
        response.embedded?.publicId ??
        (
          await tx.query.User.findFirst({
            where: eq(User.isLoggedIn, true),
          })
        )?.publicId;
      if (!publicId) return;

      await tx
        .insert(RoutineTag)
        .values({ ...response.data, ownerPublicId: publicId })
        .onConflictDoUpdate({
          target: RoutineTag.id,
          set: {
            ownerPublicId: publicId,
            name: response.data.name,
            color: response.data.color,
            icon: response.data.icon,
            updatedAt: response.data.updatedAt,
            createdAt: response.data.createdAt,
          },
        });
    });
  };

  static syncGetAllMyRoutineTags = async (
    response: GetAllMyRoutineTagsResponse
  ): Promise<void> => {
    if (!localDB.isReady) await localDB.ensureReady();
    if (response.data.length === 0) return;

    await localDB.transaction(async tx => {
      const publicId =
        response.embedded?.publicId ??
        (
          await tx.query.User.findFirst({
            where: eq(User.isLoggedIn, true),
          })
        )?.publicId;
      if (!publicId) return;

      await tx
        .insert(RoutineTag)
        .values(response.data.map(tag => ({ ...tag, ownerPublicId: publicId })))
        .onConflictDoUpdate({
          target: RoutineTag.id,
          set: {
            ownerPublicId: publicId,
            name: sql`excluded.name`,
            color: sql`excluded.color`,
            icon: sql`excluded.icon`,
            updatedAt: sql`excluded.updated_at`,
            createdAt: sql`excluded.created_at`,
          },
        });
    });
  };

  static syncSearchRoutineTags = async (
    searchedRoutineTags: Array<{
      id: string;
      name: string;
      color: string;
      icon: SupportedIcon | null;
      updatedAt: Date;
      createdAt: Date;
    }>
  ): Promise<void> => {
    if (!localDB.isReady) await localDB.ensureReady();
    if (searchedRoutineTags.length === 0) return;

    await localDB.transaction(async tx => {
      const loggedInUser = await tx.query.User.findFirst({
        where: eq(User.isLoggedIn, true),
      });
      if (loggedInUser === undefined) return;

      await tx
        .insert(RoutineTag)
        .values(
          searchedRoutineTags.map(tag => ({
            ...tag,
            ownerPublicId: loggedInUser.publicId,
          }))
        )
        .onConflictDoUpdate({
          target: RoutineTag.id,
          set: {
            ownerPublicId: loggedInUser.publicId,
            name: sql`excluded.name`,
            color: sql`excluded.color`,
            icon: sql`excluded.icon`,
            updatedAt: sql`excluded.updated_at`,
            createdAt: sql`excluded.created_at`,
          },
        });
    });
  };

  static syncCreateRoutineTag = async (
    request: CreateRoutineTagRequest,
    response: CreateRoutineTagResponse
  ): Promise<void> => {
    if (!localDB.isReady) await localDB.ensureReady();

    await localDB.transaction(async tx => {
      const publicId =
        response.embedded?.publicId ??
        (
          await tx.query.User.findFirst({
            where: eq(User.isLoggedIn, true),
          })
        )?.publicId;
      if (!publicId) return;

      await tx.insert(RoutineTag).values({
        id: response.data.id,
        ownerPublicId: publicId,
        name: request.body.name,
        color: request.body.color,
        icon: request.body.icon,
        createdAt: response.data.createdAt,
        updatedAt: response.data.createdAt,
      });
    });
  };

  static syncCreateRoutineTags = async (
    request: CreateRoutineTagsRequest,
    response: CreateRoutineTagsResponse
  ): Promise<void> => {
    if (!localDB.isReady) await localDB.ensureReady();
    if (request.body.createdRoutineTags.length === 0) return;

    await localDB.transaction(async tx => {
      const publicId =
        response.embedded?.publicId ??
        (
          await tx.query.User.findFirst({
            where: eq(User.isLoggedIn, true),
          })
        )?.publicId;
      if (!publicId) return;

      await tx.insert(RoutineTag).values(
        request.body.createdRoutineTags.map((tag, index) => ({
          id: response.data.ids[index],
          ownerPublicId: publicId,
          name: tag.name,
          color: tag.color,
          icon: tag.icon,
          createdAt: response.data.createdAt,
          updatedAt: response.data.createdAt,
        }))
      );
    });
  };

  static syncUpdateMyRoutineTagById = async (
    request: UpdateMyRoutineTagByIdRequest,
    response: UpdateMyRoutineTagByIdResponse
  ): Promise<void> => {
    if (!localDB.isReady) await localDB.ensureReady();
    const publicId =
      response.embedded?.publicId ??
      (
        await localDB.query.User.findFirst({
          where: eq(User.isLoggedIn, true),
        })
      )?.publicId;
    if (!publicId) return;

    await localDB
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
        updatedAt: response.data.updatedAt,
      })
      .where(
        and(
          eq(RoutineTag.id, request.body.routineTagId),
          eq(RoutineTag.ownerPublicId, publicId)
        )
      );
  };

  static syncUpdateMyRoutineTagsByIds = async (
    request: UpdateMyRoutineTagsByIdsRequest,
    response: UpdateMyRoutineTagsByIdsResponse
  ): Promise<void> => {
    if (!localDB.isReady) await localDB.ensureReady();

    await localDB.transaction(async tx => {
      const publicId =
        response.embedded?.publicId ??
        (
          await tx.query.User.findFirst({
            where: eq(User.isLoggedIn, true),
          })
        )?.publicId;
      if (!publicId) return;

      for (const tag of request.body.updatedRoutineTags) {
        await tx
          .update(RoutineTag)
          .set({
            ...(tag.values.name !== undefined && { name: tag.values.name }),
            ...(tag.values.color !== undefined && { color: tag.values.color }),
            ...(tag.values.icon !== undefined && { icon: tag.values.icon }),
            ...(tag.setNull?.icon && { icon: null }),
            updatedAt: response.data.updatedAt,
          })
          .where(
            and(
              eq(RoutineTag.id, tag.routineTagId),
              eq(RoutineTag.ownerPublicId, publicId)
            )
          );
      }
    });
  };

  static syncHardDeleteMyRoutineTagById = async (
    request: HardDeleteMyRoutineTagByIdRequest,
    _response: HardDeleteMyRoutineTagByIdResponse
  ): Promise<void> => {
    if (!localDB.isReady) await localDB.ensureReady();

    await localDB.transaction(async tx => {
      await tx
        .delete(RoutinesToTags)
        .where(eq(RoutinesToTags.tagId, request.body.routineTagId));
      await tx
        .delete(RoutineTag)
        .where(eq(RoutineTag.id, request.body.routineTagId));
    });
  };

  static syncHardDeleteMyRoutineTagsByIds = async (
    request: HardDeleteMyRoutineTagsByIdsRequest,
    _response: HardDeleteMyRoutineTagsByIdsResponse
  ): Promise<void> => {
    if (!localDB.isReady) await localDB.ensureReady();
    if (request.body.routineTagIds.length === 0) return;

    await localDB.transaction(async tx => {
      await tx
        .delete(RoutinesToTags)
        .where(inArray(RoutinesToTags.tagId, request.body.routineTagIds));
      await tx
        .delete(RoutineTag)
        .where(inArray(RoutineTag.id, request.body.routineTagIds));
    });
  };
}
