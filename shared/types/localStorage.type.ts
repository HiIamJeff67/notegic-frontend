import { ThemeData } from "@shared/types/theme.type";

export enum LocalStorageKey {
  theme = "theme",
  language = "language",
  lastVisitedAt = "last_visited_at",
  sidebarWidth = "sidebar_width",
  dashboardWidgets = "dashboard_widgets",
  colors = "colors",
  timeRailsStationIndexes = "time_rails_station_indexes",
  routineOverviewCharts = "routine_overview_charts",
  localPreferences = "local_preferences",
  settingsDisplayMode = "settings_display_mode",
  dashboardBackgroundImage = "dashboard_background_image",
}

export type SettingsDisplayMode = "page" | "sheet";

export interface LocalStorageItem {
  [LocalStorageKey.theme]: ThemeData | null;
  [LocalStorageKey.language]: string | null;
  [LocalStorageKey.lastVisitedAt]: Date | null;
  [LocalStorageKey.sidebarWidth]: string | null;
  [LocalStorageKey.dashboardWidgets]: string | null;
  [LocalStorageKey.colors]: string | null;
  [LocalStorageKey.timeRailsStationIndexes]: string[] | null;
  [LocalStorageKey.routineOverviewCharts]: string[] | null;
  [LocalStorageKey.localPreferences]: unknown | null;
  [LocalStorageKey.settingsDisplayMode]: SettingsDisplayMode | null;
  [LocalStorageKey.dashboardBackgroundImage]: string | null;
}
