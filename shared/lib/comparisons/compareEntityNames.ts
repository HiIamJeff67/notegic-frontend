import { compare } from "@shared/lib/string/compare";

type NamedEntity = { id: string } & (
  | { name: string }
  | { title: string }
  | { label: string }
);

export const compareEntityNames = (
  left: NamedEntity,
  right: NamedEntity
): number => {
  const leftName =
    "name" in left ? left.name : "title" in left ? left.title : left.label;
  const rightName =
    "name" in right ? right.name : "title" in right ? right.title : right.label;
  return compare(leftName, rightName) || compare(left.id, right.id);
};
