export enum UserStatus {
  Online = "Online",
  AFK = "AFK",
  DoNotDisturb = "DoNotDisturb",
  Offline = "Offline",
}

export const AllUserStatus: UserStatus[] = Object.values(UserStatus);
