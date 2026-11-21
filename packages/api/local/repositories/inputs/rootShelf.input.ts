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
