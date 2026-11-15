import { createStart } from "@tanstack/react-start";
import { apiErrorSerializationAdapter } from "@/adapters/apiErrorSerialization.adapter";
import { csrfMiddleware } from "@/middlewares/csrf.middleware";
import { sessionMiddleware } from "@/middlewares/session.middleware";
import { unreachableRemoteMiddleware } from "@/middlewares/unreachableRemote.middleware";

export const startInstance = createStart(() => ({
  requestMiddleware: [csrfMiddleware],
  functionMiddleware: [sessionMiddleware, unreachableRemoteMiddleware],
  serializationAdapters: [apiErrorSerializationAdapter],
}));
