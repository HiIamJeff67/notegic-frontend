import { createMiddleware } from "@tanstack/react-start";
import { fetchServerFunction } from "@/api/functions/serverFn";

export const sessionMiddleware = createMiddleware({ type: "function" }).client(
  ({ next }) => next({ fetch: fetchServerFunction })
);
