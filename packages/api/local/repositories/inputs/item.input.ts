import { ItemType } from "@shared/api/interfaces/enums/itemType.enum";

export type CreateItemInput = {
  id: string;
  name: string;
  rootShelfId: string;
  parentSubShelfId: string;
  ownerPublicId: string;
  type: ItemType;
  at?: Date;
};

export type UpdateItemInput = {
  id: string;
  name: string;
  rootShelfId: string;
  ownerPublicId: string;
  at?: Date;
};

export type DeleteItemInput = {
  id: string;
  rootShelfId: string;
  ownerPublicId: string;
  at?: Date;
};

export type GetManyItemsInput = {
  parentSubShelfIds: string[];
};
