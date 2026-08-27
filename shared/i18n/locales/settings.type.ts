import type { EnglishSettingsTranslation } from "./settings.en";

type TranslationTree<T> = {
  [Key in keyof T]: T[Key] extends string ? string : TranslationTree<T[Key]>;
};

export type SettingsTranslation = TranslationTree<
  typeof EnglishSettingsTranslation
>;
