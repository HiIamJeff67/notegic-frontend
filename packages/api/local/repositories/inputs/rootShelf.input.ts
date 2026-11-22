import type { AccessControlPermission } from "@shared/api/interfaces/enums/accessControlPermission.enum";

export type CreateRootShelfInput = {
  id: string;
  name: string;
  ownerPublicId: string;
  at?: Date;
};

export type CreateManyRootShelvesInput = {
  shelves: CreateRootShelfInput[];
};

export type GetRootShelfInput = {
  id: string;
};

export type GetObservedRootShelfInput = {
  id: string;
  ownerPublicId: string;
};

export type UpsertObservedRootShelfInput = {
  id: string;
  name: string;
  ownerPublicId: string;
  permission: AccessControlPermission;
  subShelfCount: number;
  itemCount: number;
  at: Date;
};

export type GetManyRootShelvesInput = {
  ids?: string[];
  ownerPublicId?: string;
};

export type UpdateRootShelfInput = {
  id: string;
  name: string;
  ownerPublicId: string;
  at?: Date;
};

export type UpdateManyRootShelvesInput = {
  shelves: UpdateRootShelfInput[];
};

export type DeleteRootShelfInput = {
  id: string;
  ownerPublicId: string;
  at?: Date;
};

export type DeleteManyRootShelvesInput = {
  shelves: DeleteRootShelfInput[];
};

export type RestoreRootShelfInput = {
  id: string;
  ownerPublicId: string;
  at?: Date;
};

export type RestoreManyRootShelvesInput = {
  shelves: RestoreRootShelfInput[];
};
