import type {
  DeleteMeResponse,
  LoginResponse,
  LogoutResponse,
  RegisterRequest,
  RegisterResponse,
  ResetEmailRequest,
  ResetEmailResponse,
  ResetMeResponse,
} from "@shared/api/interfaces/auth.interface";
import { UserStatus } from "@shared/api/interfaces/enums";
import { AccessControlPermission } from "@shared/api/interfaces/enums/accessControlPermission.enum";
import { and, eq, inArray, or } from "drizzle-orm";
import { localDB } from "@/api/local/db";
import {
  Item,
  RootShelf,
  Routine,
  RoutineTag,
  RoutineTask,
  RoutinesToItems,
  RoutinesToTags,
  RoutinesToTasks,
  Station,
  UsersToShelves,
  UsersToStations,
} from "@/api/local/schemas";
import { User } from "@/api/local/schemas/user.schema";

export class AuthLocalSynchronizer {
  static async syncRegister(
    request: RegisterRequest,
    response: RegisterResponse
  ): Promise<void> {
    if (!localDB.isReady) await localDB.ensureReady();
    await localDB.transaction(async tx => {
      await tx.update(User).set({ isLoggedIn: false });
      await tx
        .insert(User)
        .values({
          publicId: response.data.publicId,
          name: request.body.name,
          displayName: response.data.displayName,
          email: request.body.email,
          status: UserStatus.Online,
          isLoggedIn: true,
          updatedAt: response.data.createdAt,
          createdAt: response.data.createdAt,
        })
        .onConflictDoUpdate({
          target: User.publicId,
          set: {
            name: request.body.name,
            displayName: response.data.displayName,
            email: request.body.email,
            status: UserStatus.Online,
            isLoggedIn: true,
            updatedAt: response.data.createdAt,
            createdAt: response.data.createdAt,
          },
        });
    });
  }

  static async syncRegisterViaOAuth(response: RegisterResponse): Promise<void> {
    if (!localDB.isReady) await localDB.ensureReady();
    await localDB.transaction(async tx => {
      await tx.update(User).set({ isLoggedIn: false });
      await tx
        .insert(User)
        .values({
          publicId: response.data.publicId,
          name: response.data.name,
          displayName: response.data.displayName,
          email: response.data.email,
          status: UserStatus.Online,
          isLoggedIn: true,
          updatedAt: response.data.createdAt,
          createdAt: response.data.createdAt,
        })
        .onConflictDoUpdate({
          target: User.publicId,
          set: {
            name: response.data.name,
            displayName: response.data.displayName,
            email: response.data.email,
            status: UserStatus.Online,
            isLoggedIn: true,
            updatedAt: response.data.createdAt,
            createdAt: response.data.createdAt,
          },
        });
    });
  }

  static async syncLogin(response: LoginResponse): Promise<void> {
    if (!localDB.isReady) await localDB.ensureReady();
    await localDB.transaction(async tx => {
      await tx.update(User).set({ isLoggedIn: false });
      await tx
        .insert(User)
        .values({
          publicId: response.data.publicId,
          name: response.data.name,
          displayName: response.data.displayName,
          email: response.data.email,
          status: UserStatus.Online,
          isLoggedIn: true,
          updatedAt: response.data.updatedAt,
          createdAt: response.data.createdAt,
        })
        .onConflictDoUpdate({
          target: User.publicId,
          set: {
            name: response.data.name,
            displayName: response.data.displayName,
            email: response.data.email,
            status: UserStatus.Online,
            isLoggedIn: true,
            updatedAt: response.data.updatedAt,
            createdAt: response.data.createdAt,
          },
        });
    });
  }

  static async syncLogout(response: LogoutResponse): Promise<void> {
    if (!localDB.isReady) await localDB.ensureReady();
    await localDB.transaction(async tx => {
      await tx
        .update(User)
        .set({
          status: UserStatus.Offline,
          isLoggedIn: false,
        })
        .where(eq(User.publicId, response.embedded.publicId));
      await tx.update(User).set({ isLoggedIn: false }); // just to make sure there's no users are logged in
    });
  }

  static async syncResetEmail(
    request: ResetEmailRequest,
    response: ResetEmailResponse
  ): Promise<void> {
    if (!localDB.isReady) await localDB.ensureReady();
    await localDB
      .update(User)
      .set({
        email: request.body.newEmail,
      })
      .where(eq(User.publicId, response.embedded.publicId));
  }

  static async syncResetMe(response: ResetMeResponse): Promise<void> {
    if (!localDB.isEnabled) return;
    if (!localDB.isReady) await localDB.ensureReady();
    const { publicId } = response.embedded;

    await localDB.transaction(async tx => {
      const ownedShelves = await tx
        .select({ id: UsersToShelves.rootShelfId })
        .from(UsersToShelves)
        .where(
          and(
            eq(UsersToShelves.userPublicId, publicId),
            eq(UsersToShelves.permission, AccessControlPermission.Owner)
          )
        );
      const shelfIds = ownedShelves.map(shelf => shelf.id);
      if (shelfIds.length > 0) {
        const items = tx
          .select({ id: Item.id })
          .from(Item)
          .where(inArray(Item.rootShelfId, shelfIds));
        await tx
          .delete(RoutinesToItems)
          .where(inArray(RoutinesToItems.itemId, items));
        await tx.delete(Item).where(inArray(Item.rootShelfId, shelfIds));
        await tx
          .delete(UsersToShelves)
          .where(inArray(UsersToShelves.rootShelfId, shelfIds));
        await tx.delete(RootShelf).where(inArray(RootShelf.id, shelfIds));
      }

      const ownedStations = await tx
        .select({ id: UsersToStations.stationId })
        .from(UsersToStations)
        .where(
          and(
            eq(UsersToStations.userPublicId, publicId),
            eq(UsersToStations.permission, AccessControlPermission.Owner)
          )
        );
      const stationIds = ownedStations.map(station => station.id);
      if (stationIds.length > 0) {
        const routines = tx
          .select({ id: Routine.id })
          .from(Routine)
          .where(inArray(Routine.stationId, stationIds));
        const tasks = tx
          .select({ id: RoutineTask.id })
          .from(RoutineTask)
          .where(inArray(RoutineTask.routineId, routines));
        await tx
          .delete(RoutinesToItems)
          .where(inArray(RoutinesToItems.routineId, routines));
        await tx
          .delete(RoutinesToTags)
          .where(inArray(RoutinesToTags.routineId, routines));
        await tx
          .delete(RoutinesToTasks)
          .where(
            or(
              inArray(RoutinesToTasks.routineId, routines),
              inArray(RoutinesToTasks.taskId, tasks)
            )
          );
        await tx
          .delete(RoutineTask)
          .where(inArray(RoutineTask.routineId, routines));
        await tx.delete(Routine).where(inArray(Routine.stationId, stationIds));
        await tx
          .delete(UsersToStations)
          .where(inArray(UsersToStations.stationId, stationIds));
        await tx.delete(Station).where(inArray(Station.id, stationIds));
      }

      const tags = tx
        .select({ id: RoutineTag.id })
        .from(RoutineTag)
        .where(eq(RoutineTag.ownerPublicId, publicId));
      await tx
        .delete(RoutinesToTags)
        .where(inArray(RoutinesToTags.tagId, tags));
      await tx.delete(RoutineTag).where(eq(RoutineTag.ownerPublicId, publicId));
    });
  }

  static async syncDeleteMe(response: DeleteMeResponse): Promise<void> {
    if (!localDB.isReady) await localDB.ensureReady();
    await localDB.transaction(async tx => {
      await tx
        .delete(User)
        .where(eq(User.publicId, response.embedded.publicId));
      await tx.update(User).set({ isLoggedIn: false }); // just to make sure there's no users are logged in
    });
  }
}
