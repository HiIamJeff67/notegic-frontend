import { createCsrfMiddleware, createStart } from "@tanstack/react-start";
import { apiErrorSerialization } from "@/api/adapters/exceptionSerialization.adapter";

const csrfMiddleware = createCsrfMiddleware({
  filter: ctx => ctx.handlerType === "serverFn",
});

export const startInstance = createStart(() => ({
  requestMiddleware: [csrfMiddleware],
  serializationAdapters: [apiErrorSerialization],
}));
