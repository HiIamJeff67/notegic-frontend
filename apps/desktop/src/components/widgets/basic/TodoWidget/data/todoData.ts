import type { UUID } from "crypto";

export interface TodoItem {
  id: UUID;
  text: string;
  completed: boolean;
  link?: string;
  updatedAt: Date;
  createdAt: Date;
}

export type TodoData = {
  title: string;
  items: TodoItem[];
};

export const getDefaultTodoData = (
  title?: string,
  items?: TodoItem[]
): TodoData => {
  return {
    title: title ?? "",
    items: items ?? [],
  };
};
