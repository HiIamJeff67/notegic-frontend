import {
  createCsrfMiddleware,
  createMiddleware,
  createStart,
} from "@tanstack/react-start";
import { apiErrorSerialization } from "@/api/adapters/exceptionSerialization.adapter";
import { fetchServerFunction } from "@/api/bridges/session.bridge";

const csrfMiddleware = createCsrfMiddleware({
  filter: ctx => ctx.handlerType === "serverFn",
});

const sessionMiddleware = createMiddleware({ type: "function" }).client(
  ({ next }) => next({ fetch: fetchServerFunction })
);

export const startInstance = createStart(() => ({
  requestMiddleware: [csrfMiddleware],
  functionMiddleware: [sessionMiddleware],
  serializationAdapters: [apiErrorSerialization],
}));
