export enum AccessControlPermission {
  Owner = "Owner",
  Admin = "Admin",
  Write = "Write",
  Read = "Read",
}

export const AllAccessControlPermissions: AccessControlPermission[] =
  Object.values(AccessControlPermission);
