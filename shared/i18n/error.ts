import { NotegicAPIError } from "@shared/api/exceptions";
import { NotegicError } from "@shared/api/exceptions/errors";
import { NotegicValidationError } from "@shared/api/exceptions/errors/validation.error";
import type { TFunction } from "i18next";

export const tError = (error: unknown, t: TFunction): string => {
  const missingTranslation = "\u0000";

  if (error instanceof Error && error.name === "AbortError") {
    console.error(error);
    return "";
  }

  if (
    error instanceof Error &&
    error.message.toLowerCase().includes("operation was aborted")
  ) {
    console.error(error);
    return "";
  }

  if (error instanceof NotegicError && error.getPresentation) {
    const presentation = error.getPresentation;
    const translatedPresentation = t(presentation as never, {
      defaultValue: missingTranslation,
    });

    if (translatedPresentation !== missingTranslation) {
      return String(translatedPresentation);
    }
  }

  if (
    error instanceof NotegicAPIError ||
    error instanceof NotegicValidationError
  ) {
    const key = `server.error.${error.unWrap.reason}`;
    const translatedReason = t(key as never, {
      defaultValue: missingTranslation,
    });

    if (translatedReason !== missingTranslation)
      return String(translatedReason);

    return String(t("error.encounterUnknownError"));
  }

  if (error instanceof NotegicError && error.getPresentation) {
    return String(
      t(error.getPresentation as never, {
        defaultValue: error.getPresentation,
      })
    );
  }

  if (error instanceof Error || typeof error === "string") {
    const message = typeof error === "string" ? error : error.message;

    return String(
      t(message as never, {
        defaultValue: t("error.encounterUnknownError"),
      })
    );
  }

  return String(t("error.encounterUnknownError"));
};
