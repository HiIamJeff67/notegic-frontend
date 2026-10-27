import { ValidationClientException } from "@shared/api/exceptions/client/validation.exception";
import { NotegicValidationError } from "@shared/api/exceptions/errors/validation.error";
import { z } from "zod";

// Validate before transport, offline persistence or draft mutation.
export const parseRequest = <Schema extends z.ZodType>(
  schema: Schema,
  input: unknown
): z.output<Schema> => {
  const result = schema.safeParse(input);
  if (!result.success) {
    throw new NotegicValidationError(
      ValidationClientException.ZodParsingFailed(result.error)
    ).setPresentation(
      result.error.issues[0]?.message ?? "validation.invalidInput"
    );
  }
  return result.data;
};
