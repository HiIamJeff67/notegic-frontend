import { ItemType } from "@shared/api/interfaces/enums/itemType.enum";

export type ItemRecord = {
  id: string;
  name: string;
  rootShelfId: string;
  parentSubShelfId: string;
  type: ItemType;
  updatedAt: Date;
  createdAt: Date;
};

export type CreateItemOutput = {
  id: string;
  sequence: number;
};

export type UpdateItemOutput = CreateItemOutput;
export type DeleteItemOutput = CreateItemOutput;

export type GetManyItemsOutput = {
  items: ItemRecord[];
};
