import { UserPlan, UserRole, UserStatus } from "@shared/api/interfaces/enums";
import { User } from "@shared/api/interfaces/types/user.type";

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
