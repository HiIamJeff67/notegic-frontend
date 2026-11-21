export type CreateSubShelfOutput = {
  id: string;
  sequence: number;
};

export type UpdateSubShelfOutput = CreateSubShelfOutput;
export type DeleteSubShelfOutput = CreateSubShelfOutput;

export type SubShelfRecord = {
  id: string;
  name: string;
  rootShelfId: string;
  prevSubShelfId: string | null;
  path: string[];
  updatedAt: Date;
  createdAt: Date;
};

export type GetManySubShelvesOutput = {
  shelves: SubShelfRecord[];
};
