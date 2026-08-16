import { ThemeData } from "@shared/types/theme.type";

// export const DefaultDarkTheme: Theme = {
//   id: "ae29bb37-d4ba-4826-bf56-9074e23ea65b",
//   name: "Default Dark",
//   translationKey: "themes.defaultDark",
//   authorName: "Notegic Team",
//   authorAvatarURL: "", // place Notegic brand Icon here
//   version: "v1",
//   downloadURL: "",
//   isDefault: true,
//   isLoaded: true,
//   updatedAt: new Date("2025-06-09T08:26:27.347Z"),
//   createdAt: new Date("2025-06-09T08:26:27.347Z"),
// };

// export const DefaultLightTheme: Theme = {
//   id: "9663dc5f-1980-4ca4-b1e5-54c63dcd3ff8",
//   name: "Default Light",
//   translationKey: "themes.defaultLight",
//   authorName: "Notegic Team",
//   authorAvatarURL: "", // place Notegic brand Icon here
//   version: "v1",
//   downloadURL: "",
//   isDefault: true,
//   isLoaded: false,
//   updatedAt: new Date("2025-06-09T08:26:27.347Z"),
//   createdAt: new Date("2025-06-09T08:26:27.347Z"),
// };

export const DefaultStandardTheme: ThemeData = {
  id: "2a377bf8-6101-4237-9293-e23594529cdd",
  name: "Default Standard",
  isDark: true,
  translationKey: "themes.defaultStandard",
  authorName: "Notegic Team",
  authorAvatarURL: "", // place Notegic brand Icon here
  version: "v1",
  downloadURL: "",
  isDefault: true,
  isLoaded: false,
  updatedAt: new Date("2025-06-09T08:26:27.347Z"),
  createdAt: new Date("2025-06-09T08:26:27.347Z"),
};

export const DefaultNeonTheme: ThemeData = {
  id: "a9fc704e-f3c8-47ad-b761-967def87d2db",
  name: "Default Neon",
  isDark: true,
  translationKey: "themes.defaultNeon",
  authorName: "Notegic Team",
  authorAvatarURL: "", // place Notegic brand Icon here
  version: "v1",
  downloadURL: "",
  isDefault: true,
  isLoaded: false,
  updatedAt: new Date("2025-06-09T08:26:27.347Z"),
  createdAt: new Date("2025-06-09T08:26:27.347Z"),
};

export const DefaultOceanTheme: ThemeData = {
  id: "d8aa6503-8449-46fb-8528-9a18782a630a",
  name: "Default Ocean",
  isDark: false,
  translationKey: "themes.defaultOcean",
  authorName: "Notegic Team",
  authorAvatarURL: "", // place Notegic brand Icon here
  version: "v1",
  downloadURL: "",
  isDefault: true,
  isLoaded: false,
  updatedAt: new Date("2025-06-09T08:26:27.347Z"),
  createdAt: new Date("2025-06-09T08:26:27.347Z"),
};

export const DefaultForestTheme: ThemeData = {
  id: "786b96b1-c9e7-4e6e-a07a-8396d9f0740d",
  name: "Default Forest",
  isDark: true,
  translationKey: "themes.defaultForest",
  authorName: "Notegic Team",
  authorAvatarURL: "",
  version: "v1",
  downloadURL: "",
  isDefault: true,
  isLoaded: false,
  updatedAt: new Date("2025-06-09T08:26:27.347Z"),
  createdAt: new Date("2025-06-09T08:26:27.347Z"),
};

export const DefaultPhoenixTheme: ThemeData = {
  id: "1f1c7c86-8f88-42d4-822f-b99d3374910b",
  name: "Default Phoenix",
  isDark: true,
  translationKey: "themes.defaultPhoenix",
  authorName: "Notegic Team",
  authorAvatarURL: "",
  version: "v1",
  downloadURL: "",
  isDefault: true,
  isLoaded: false,
  updatedAt: new Date("2025-06-09T08:26:27.347Z"),
  createdAt: new Date("2025-06-09T08:26:27.347Z"),
};

export const DefaultPearlTheme: ThemeData = {
  id: "f9b79d87-5b85-42b7-9a7a-86d1a425933d",
  name: "Default Pearl",
  isDark: false,
  translationKey: "themes.defaultPearl",
  authorName: "Notegic Team",
  authorAvatarURL: "",
  version: "v1",
  downloadURL: "",
  isDefault: true,
  isLoaded: false,
  updatedAt: new Date("2025-06-09T08:26:27.347Z"),
  createdAt: new Date("2025-06-09T08:26:27.347Z"),
};

export const DefaultSakuraTheme: ThemeData = {
  id: "728ba94b-734e-427d-aaf8-6b9c982944ee",
  name: "Default Sakura",
  isDark: false,
  translationKey: "themes.defaultSakura",
  authorName: "Notegic Team",
  authorAvatarURL: "",
  version: "v1",
  downloadURL: "",
  isDefault: true,
  isLoaded: false,
  updatedAt: new Date("2025-06-09T08:26:27.347Z"),
  createdAt: new Date("2025-06-09T08:26:27.347Z"),
};

export const DefaultCitrusTheme: ThemeData = {
  id: "a694c8c4-a036-439c-82e8-0ea7f3292c7d",
  name: "Default Citrus",
  isDark: false,
  translationKey: "themes.defaultCitrus",
  authorName: "Notegic Team",
  authorAvatarURL: "",
  version: "v1",
  downloadURL: "",
  isDefault: true,
  isLoaded: false,
  updatedAt: new Date("2025-06-09T08:26:27.347Z"),
  createdAt: new Date("2025-06-09T08:26:27.347Z"),
};

// only setup the default themes here for initial use,
// if more themes are required, the user can view the theme store
// and add the themes from it by using useThemeStore.addTheme()
// with passing a theme data which is extracted from the database(see the backend)
export const DefaultThemes = [
  // DefaultDarkTheme,
  // DefaultLightTheme,
  DefaultStandardTheme,
  DefaultForestTheme,
  DefaultNeonTheme,
  DefaultPhoenixTheme,
  DefaultOceanTheme,
  DefaultPearlTheme,
  DefaultSakuraTheme,
  DefaultCitrusTheme,
];
