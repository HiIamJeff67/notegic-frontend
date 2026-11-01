export type ThemeTranslationKey =
  | "themes.defaultStandard"
  | "themes.defaultNeon"
  | "themes.defaultOcean"
  | "themes.defaultForest"
  | "themes.defaultPhoenix"
  | "themes.defaultPearl"
  | "themes.defaultSakura"
  | "themes.defaultCitrus";

export interface ThemeData {
  id: string;
  name: string;
  isDark: boolean;
  translationKey: ThemeTranslationKey;
  authorName: string;
  authorAvatarURL: string;
  version: string;
  downloadURL: string;
  isDefault: boolean; // if it is not default, then we need the client to download it using downloadURL
  isLoaded: boolean; // using by individual users
  updatedAt: Date;
  createdAt: Date;
}
