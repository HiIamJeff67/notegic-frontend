export type CreateSubShelfInput = {
  id: string;
  name: string;
  rootShelfId: string;
  ownerPublicId: string;
  prevSubShelfId?: string | null;
  path?: string[];
  at?: Date;
};

export type UpdateSubShelfInput = {
  id: string;
  name: string;
  rootShelfId: string;
  ownerPublicId: string;
  at?: Date;
};

export type DeleteSubShelfInput = {
  id: string;
  rootShelfId: string;
  ownerPublicId: string;
  at?: Date;
};

export type GetManySubShelvesInput = {
  rootShelfIds: string[];
};
