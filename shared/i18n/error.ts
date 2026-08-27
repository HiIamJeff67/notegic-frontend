import { NotegicError } from "@shared/api/exceptions/errors";
import type { TFunction } from "i18next";

export const translateError = (error: unknown, t: TFunction): string => {
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

  if (error instanceof NotegicError) {
    const presentation = error.getPresentation;
    return presentation
      ? String(t(presentation as never, { defaultValue: presentation }))
      : String(t("error.encounterUnknownError"));
  }

  if (error instanceof Error || typeof error === "string") {
    return String(
      t((typeof error === "string" ? error : error.message) as never, {
        defaultValue: t("error.encounterUnknownError"),
      })
    );
  }

  return String(t("error.encounterUnknownError"));
};
