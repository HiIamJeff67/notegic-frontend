import { WebURLPathDictionary } from "@shared/constants";
import { LocalStorageManipulator } from "@shared/lib/localStorageManipulator";
import { LocalStorageKey } from "@shared/types/localStorage.type";
import { cn } from "@shared/util/utils";
import { Maximize2Icon, PanelRightOpenIcon } from "lucide-react";
import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import {
  Article,
  ArticleContent,
  ArticleNavigationBar,
  type ArticleNavigationItem,
  ArticleParagraph,
  ArticleParagraphContent,
  ArticleParagraphHeader,
  ArticleParagraphSeparator,
} from "@/components/commons/Article/Article";
import { Button } from "@/components/ui/button";
import { useAppRouterActions, useSettingsDisplay } from "@/hooks";
import { useLocalPreferences } from "@/hooks/localPreferences";
import {
  AppearanceSettings,
  DashboardSettings,
  EditorSettings,
  OfflineSettings,
} from "./PreferencesPageContent";
import AboutTab from "./tabs/AboutTab";
import BrowserPermissionsTab from "./tabs/BrowserPermissionsTab";
import NotificationsTab from "./tabs/NotificationsTab";
import PrivacyTab from "./tabs/PrivacyTab";

const PreferencesPage = ({
  displayMode = "page",
}: {
  displayMode?: "page" | "sheet";
}) => {
  const { isReady } = useLocalPreferences();
  const router = useAppRouterActions();
  const { openSheet, closeSheet } = useSettingsDisplay();
  const { t } = useTranslation();
  const navigationConfig = [
    ["appearance", "settingsPage.preferences.appearance", 5],
    ["dashboard", "settingsPage.preferences.dashboard", 3],
    ["editor", "settingsPage.preferences.editor", 4],
    ["offline", "settingsPage.preferences.offline", 3],
    ["privacy", "settingsPage.preferences.privacy", 2],
    ["browser-permissions", "settingsPage.preferences.browserPermissions", 3],
    ["notifications", "settingsPage.preferences.notifications", 3],
    ["about", "settingsPage.preferences.about", 2],
  ] as const satisfies ReadonlyArray<
    readonly [string, string, NonNullable<ArticleNavigationItem["weight"]>]
  >;
  const navigationItems = navigationConfig.map(([id, key, weight]) => ({
    id,
    title: String(t(`${key}.title` as never)),
    description: String(t(`${key}.description` as never)),
    weight,
  })) satisfies ArticleNavigationItem[];

  return (
    <div
      className={cn(
        "relative h-full min-h-0",
        displayMode === "sheet" ? "bg-sidebar" : "bg-canvas"
      )}
    >
      <Button
        data-density-static
        type="button"
        variant="default"
        size="icon"
        className="absolute top-0 left-0 z-20 m-2 size-7 p-0 select-none bg-transparent text-foreground hover:bg-primary"
        aria-label={
          displayMode === "sheet"
            ? t("settingsPage.openAsPage")
            : t("settingsPage.openInSheet")
        }
        title={
          displayMode === "sheet"
            ? t("settingsPage.openAsPage")
            : t("settingsPage.openInSheet")
        }
        onClick={() => {
          LocalStorageManipulator.setItem(
            LocalStorageKey.settingsDisplayMode,
            displayMode === "sheet" ? "page" : "sheet"
          );

          if (displayMode === "sheet") {
            closeSheet();
            router.push(WebURLPathDictionary.app.setting.preferences);
            return;
          }

          openSheet("preferences");
          router.push(WebURLPathDictionary.app.dashboard._);
        }}
      >
        {displayMode === "sheet" ? <Maximize2Icon /> : <PanelRightOpenIcon />}
      </Button>
      <Article className="gap-0 p-[var(--density-content-padding)] lg:gap-0">
        <ArticleNavigationBar
          items={navigationItems}
          paragraphBaseHeight={12}
          subParagraphBaseHeight={6}
          className={
            displayMode === "sheet" ? "hidden lg:block lg:w-8" : "lg:w-8"
          }
        />
        <ArticleContent className="m-[var(--density-content-padding)]">
          <PreferenceTab
            id="appearance"
            title={t("settingsPage.preferences.appearance.title")}
            description={t("settingsPage.preferences.appearance.description")}
            eyebrow={t("settingsPage.preferences.eyebrow")}
            primary
          >
            {isReady && <AppearanceSettings />}
          </PreferenceTab>

          <ArticleParagraphSeparator />

          <PreferenceTab
            id="dashboard"
            title={t("settingsPage.preferences.dashboard.title")}
            description={t("settingsPage.preferences.dashboard.description")}
          >
            {isReady && <DashboardSettings />}
          </PreferenceTab>

          <ArticleParagraphSeparator />

          <PreferenceTab
            id="editor"
            title={t("settingsPage.preferences.editor.title")}
            description={t("settingsPage.preferences.editor.description")}
          >
            {isReady && <EditorSettings />}
          </PreferenceTab>

          <ArticleParagraphSeparator />

          <PreferenceTab
            id="offline"
            title={t("settingsPage.preferences.offline.title")}
            description={t("settingsPage.preferences.offline.description")}
          >
            {isReady && <OfflineSettings />}
          </PreferenceTab>

          <ArticleParagraphSeparator />

          <PreferenceTab
            id="privacy"
            title={t("settingsPage.preferences.privacy.title")}
            description={t("settingsPage.preferences.privacy.description")}
          >
            <PrivacyTab />
          </PreferenceTab>

          <ArticleParagraphSeparator />

          <PreferenceTab
            id="browser-permissions"
            title={t("settingsPage.preferences.browserPermissions.title")}
            description={t(
              "settingsPage.preferences.browserPermissions.description"
            )}
          >
            <BrowserPermissionsTab />
          </PreferenceTab>

          <ArticleParagraphSeparator />

          <PreferenceTab
            id="notifications"
            title={t("settingsPage.preferences.notifications.title")}
            description={t(
              "settingsPage.preferences.notifications.description"
            )}
          >
            <NotificationsTab />
          </PreferenceTab>

          <ArticleParagraphSeparator />

          <PreferenceTab
            id="about"
            title={t("settingsPage.preferences.about.title")}
            description={t("settingsPage.preferences.about.description")}
          >
            <AboutTab />
          </PreferenceTab>
        </ArticleContent>
      </Article>
    </div>
  );
};

const PreferenceTab = ({
  id,
  title,
  description,
  eyebrow,
  children,
  primary = false,
}: {
  id: string;
  title: string;
  description: string;
  eyebrow?: string;
  children: ReactNode;
  primary?: boolean;
}) => (
  <ArticleParagraph id={id}>
    <ArticleParagraphHeader>
      {primary && (
        <p className="font-mono text-[11px] tracking-[0.16em] text-muted-foreground">
          {eyebrow}
        </p>
      )}
      {primary ? (
        <h1 className="mt-3 text-3xl font-semibold tracking-tight">{title}</h1>
      ) : (
        <h2 className="text-2xl font-semibold tracking-tight">{title}</h2>
      )}
      <p className="mt-3 text-sm leading-6 text-muted-foreground">
        {description}
      </p>
    </ArticleParagraphHeader>
    <ArticleParagraphContent className="max-w-none text-foreground">
      {children}
    </ArticleParagraphContent>
  </ArticleParagraph>
);

export default PreferencesPage;
