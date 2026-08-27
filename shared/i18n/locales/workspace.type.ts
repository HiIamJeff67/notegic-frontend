import type { EnglishWorkspaceTranslation } from "./workspace.en";

type TranslationTree<T> = {
  [Key in keyof T]: T[Key] extends string ? string : TranslationTree<T[Key]>;
};

export type WorkspaceTranslation = TranslationTree<
  typeof EnglishWorkspaceTranslation
>;
