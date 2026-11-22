import type { AccessControlPermission } from "@shared/api/interfaces/enums/accessControlPermission.enum";

export type CreateRootShelfOutput = {
  id: string;
  sequence: number;
};

export type CreateManyRootShelvesOutput = {
  shelves: CreateRootShelfOutput[];
};

export type GetRootShelfOutput =
  | {
      id: string;
      name: string;
      subShelfCount: number;
      itemCount: number;
      lastAnalyzedAt: Date;
      deletedAt: Date | null;
      updatedAt: Date;
      createdAt: Date;
    }
  | undefined;

export type GetObservedRootShelfOutput =
  | (Exclude<GetRootShelfOutput, undefined> & {
      permission: AccessControlPermission;
    })
  | undefined;

export type GetManyRootShelvesOutput = {
  shelves: Exclude<GetRootShelfOutput, undefined>[];
};

export type UpdateRootShelfOutput = {
  id: string;
  sequence: number;
};

export type UpdateManyRootShelvesOutput = {
  shelves: UpdateRootShelfOutput[];
};

export type DeleteRootShelfOutput = {
  id: string;
  sequence: number;
};

export type DeleteManyRootShelvesOutput = {
  shelves: DeleteRootShelfOutput[];
};

export type RestoreRootShelfOutput = {
  id: string;
  sequence: number;
};

export type RestoreManyRootShelvesOutput = {
  shelves: RestoreRootShelfOutput[];
};
