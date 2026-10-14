import { NotegicAPIError } from "@shared/api/exceptions";
import { NotegicError } from "@shared/api/exceptions/errors";
import { NotegicValidationError } from "@shared/api/exceptions/errors/validation.error";
import i18n from "@/i18n";

// Drafts persist translation keys, not text tied to the language at failure.
export const getDependencyDraftErrorKey = (error: unknown): string => {
  if (
    error instanceof NotegicError &&
    error.getPresentation &&
    i18n.exists(error.getPresentation)
  ) {
    return error.getPresentation;
  }

  if (
    error instanceof NotegicAPIError ||
    error instanceof NotegicValidationError
  ) {
    const key = `server.error.${error.unWrap.reason}`;
    if (i18n.exists(key)) return key;
  }

  if (error instanceof Error && i18n.exists(error.message)) {
    return error.message;
  }

  return "error.encounterUnknownError";
};
