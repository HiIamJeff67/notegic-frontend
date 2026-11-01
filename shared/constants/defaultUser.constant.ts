import {
  UserGender,
  UserPlan,
  UserRole,
  UserStatus,
} from "@shared/api/interfaces/enums";
import { User, UserInfo } from "@shared/api/interfaces/types/user.type";

export const FakeUser: User = {
  publicId: "FAKE_PUBLIC_ID",
  name: "FAKE_NAME",
  displayName: "FAKE_DISPLAY_NAME",
  email: "FAKE_EMAIL@email.com",
  role: UserRole.Normal,
  plan: UserPlan.Free,
  status: UserStatus.Online,
  updatedAt: new Date(),
  createdAt: new Date(),
};

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
