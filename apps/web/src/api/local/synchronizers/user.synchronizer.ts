import { UserPlan, UserRole, UserStatus } from "@shared/api/interfaces/enums";
import type { UserData } from "@shared/api/interfaces/types/user.type";
import type {
  GetMeResponse,
  GetUserDataResponse,
} from "@shared/api/interfaces/user.interface";
import { asc, eq } from "drizzle-orm";
import { localDB } from "@/api/local/db";
import { User } from "@/api/local/schemas/user.schema";

const virtualUserPublicId = "00000000-0000-4000-8000-0000000000a1";

const toUserData = (row: typeof User.$inferSelect): UserData => ({
  publicId: row.publicId,
  name: row.name,
  displayName: row.displayName,
  email: row.email,
  role: UserRole.Normal,
  plan: UserPlan.Free,
  status: Object.values(UserStatus).includes(row.status as UserStatus)
    ? (row.status as UserStatus)
    : UserStatus.Online,
  avatarURL: "",
  createdAt: row.createdAt,
  updatedAt: row.updatedAt,
});

export class UserLocalSynchronizer {
  static getLoggedInUser = async (): Promise<UserData | null> => {
    if (!localDB.isReady) await localDB.ensureReady();
    const [loggedInUser] = await localDB
      .select()
      .from(User)
      .where(eq(User.isLoggedIn, true))
      .limit(1);
    return loggedInUser?.publicId ? toUserData(loggedInUser) : null;
  };

  static clearLoggedIn = async (): Promise<void> => {
    if (!localDB.isReady) await localDB.ensureReady();
    await localDB
      .update(User)
      .set({ isLoggedIn: false, status: UserStatus.Offline });
  };

  static ensureLoggedInUser = async (): Promise<UserData> => {
    if (!localDB.isReady) await localDB.ensureReady();
    const [existingUser] = await localDB
      .select()
      .from(User)
      .orderBy(asc(User.createdAt))
      .limit(1);
    if (existingUser?.publicId) {
      const now = new Date();
      await localDB.transaction(async tx => {
        await tx.update(User).set({ isLoggedIn: false });
        await tx
          .update(User)
          .set({
            isLoggedIn: true,
            status: UserStatus.Online,
            updatedAt: now,
          })
          .where(eq(User.publicId, existingUser.publicId));
      });
      return toUserData({
        ...existingUser,
        isLoggedIn: true,
        status: UserStatus.Online,
        updatedAt: now,
      });
    }

    const now = new Date();
    await localDB.transaction(async tx => {
      await tx
        .insert(User)
        .values({
          publicId: virtualUserPublicId,
          name: "virtual1",
          displayName: "virtual1",
          email: "virtual1@example.com",
          status: UserStatus.Online,
          isLoggedIn: true,
          updatedAt: now,
          createdAt: now,
        })
        .onConflictDoUpdate({
          target: User.publicId,
          set: {
            isLoggedIn: true,
            updatedAt: now,
          },
        });
    });

    return toUserData({
      publicId: virtualUserPublicId,
      name: "virtual1",
      displayName: "virtual1",
      email: "virtual1@example.com",
      status: UserStatus.Online,
      isLoggedIn: true,
      updatedAt: now,
      createdAt: now,
    });
  };

  static syncGetUserData = async (
    response: GetUserDataResponse
  ): Promise<void> => {
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
          status: response.data.status,
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
            status: response.data.status,
            isLoggedIn: true,
            updatedAt: response.data.updatedAt,
            createdAt: response.data.createdAt,
          },
        });
    });
  };

  static syncGetMe = async (response: GetMeResponse): Promise<void> => {
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
          status: response.data.status,
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
            status: response.data.status,
            isLoggedIn: true,
            updatedAt: response.data.updatedAt,
            createdAt: response.data.createdAt,
          },
        });
    });
  };
}
