import type {
  DeleteMeResponse,
  LoginResponse,
  LoginViaGoogleResponse,
  LogoutResponse,
  RegisterRequest,
  RegisterResponse,
  RegisterViaGoogleResponse,
  ResetEmailRequest,
  ResetEmailResponse,
  ResetMeResponse,
} from "@shared/api/interfaces/auth.interface";
import { UserStatus } from "@shared/api/interfaces/enums";
import { AccessControlPermission } from "@shared/api/interfaces/enums/accessControlPermission.enum";
import { localDB } from "@/api/local/db";
import { RootShelf, UsersToShelves } from "@/api/local/schemas";
import { User } from "@/api/local/schemas/user.schema";
import { and, eq, exists, sql } from "drizzle-orm";

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

  static async syncRegisterViaGoogle(
    response: RegisterViaGoogleResponse
  ): Promise<void> {
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

  static async syncLoginViaGoogle(
    response: LoginViaGoogleResponse
  ): Promise<void> {
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
    if (!localDB.isReady) await localDB.ensureReady();
    await localDB.delete(RootShelf).where(
      exists(
        localDB
          .select({ one: sql`1` })
          .from(UsersToShelves)
          .where(
            and(
              eq(UsersToShelves.userPublicId, response.embedded.publicId),
              eq(UsersToShelves.rootShelfId, RootShelf.id),
              eq(UsersToShelves.permission, AccessControlPermission.Owner)
            )
          )
      )
    );
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
