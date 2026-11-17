export enum UserRole {
  Admin = "Admin",
  Normal = "Normal",
  Guest = "Guest",
}

export const AllUserRoles: UserRole[] = Object.values(UserRole);
