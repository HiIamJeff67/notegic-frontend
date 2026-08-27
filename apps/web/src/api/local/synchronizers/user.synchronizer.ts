import type {
  GetMeResponse,
  GetUserDataResponse,
} from "@shared/api/interfaces/user.interface";
import { localDB } from "@/api/local/db";
import { User } from "@/api/local/schemas/user.schema";

export class UserLocalSynchronizer {
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
