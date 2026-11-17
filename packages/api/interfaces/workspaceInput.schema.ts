import { z } from "zod";

export const ItemNameSchema = z
  .string({ error: "validation.nameRequired" })
  .min(1, { error: "validation.nameRequired" })
  .max(128, { error: "validation.nameTooLong" })
  .refine(value => value.trim().length > 0, {
    error: "validation.nameRequired",
  });

export const DescriptionSchema = z
  .string({ error: "validation.description" })
  .max(1024, { error: "validation.description" });

export const BackgroundURLSchema = z.url({
  error: "validation.backgroundUrl",
});
