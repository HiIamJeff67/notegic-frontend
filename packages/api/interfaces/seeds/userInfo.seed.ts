import { UserGender } from "@shared/api/interfaces/enums";
import { UserInfo } from "@shared/api/interfaces/types/user.type";

export const FakeUserInfo: UserInfo = {
  avatarURL: null,
  coverBackgroundURL: null,
  header: null,
  introduction: null,
  gender: UserGender.PreferNotToSay,
  country: null,
  birthDate: new Date(),
  updatedAt: new Date(),
};
