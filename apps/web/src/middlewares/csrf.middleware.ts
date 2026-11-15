import { createCsrfMiddleware } from "@tanstack/react-start";

export const csrfMiddleware = createCsrfMiddleware({
  filter: ctx => ctx.handlerType === "serverFn",
});
