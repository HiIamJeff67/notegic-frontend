import type {
  GetMySettingResponse,
  UserSetting as UserSettingData,
} from "@shared/api/interfaces/userSetting.interface";
import { eq } from "drizzle-orm";
import { localDB } from "@/api/local/db";
import { UserSetting } from "@/api/local/schemas";

export class UserSettingLocalSynchronizer {
  static getMySetting = async (
    userPublicId: string
  ): Promise<UserSettingData | null> => {
    if (!localDB.isEnabled) return null;
    if (!localDB.isReady) await localDB.ensureReady();

    const setting = await localDB.query.UserSetting.findFirst({
      where: eq(UserSetting.userPublicId, userPublicId),
    });
    if (!setting) return null;

    return {
      language: setting.language,
      density: setting.density,
      startSurface: setting.startSurface,
      reduceMotion: setting.reduceMotion,
      lineWrap: setting.lineWrap,
      quickInsert: setting.quickInsert,
      privatePreviews: setting.privatePreviews,
      routineNudges: setting.routineNudges,
      syncNotifications: setting.syncNotifications,
      quietMode: setting.quietMode,
      quietModeStartMinute: setting.quietModeStartMinute,
      quietModeEndMinute: setting.quietModeEndMinute,
    };
  };

  static syncGetMySetting = async (
    response: GetMySettingResponse
  ): Promise<void> => {
    if (!localDB.isEnabled) return;
    if (!localDB.isReady) await localDB.ensureReady();

    await localDB
      .insert(UserSetting)
      .values({
        userPublicId: response.embedded.publicId,
        ...response.data,
      })
      .onConflictDoUpdate({
        target: UserSetting.userPublicId,
        set: response.data,
      });
  };

  static syncUpdateMySetting = async (
    userPublicId: string,
    values: Partial<UserSettingData>
  ): Promise<void> => {
    if (!localDB.isEnabled || Object.keys(values).length === 0) return;
    if (!localDB.isReady) await localDB.ensureReady();

    await localDB
      .update(UserSetting)
      .set(values)
      .where(eq(UserSetting.userPublicId, userPublicId));
  };
}
