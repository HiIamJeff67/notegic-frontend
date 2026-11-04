import { cn } from "@shared/lib/classname/cn";
import {
  LocalStorage,
  LocalStorageKey,
} from "@shared/lib/storage/localStorage";
import { WebURLPathDictionary } from "@shared/lib/url/web";
import {
  AppWindowIcon,
  BellIcon,
  HardDriveIcon,
  InfoIcon,
  LayoutDashboardIcon,
  Maximize2Icon,
  MessageSquareWarningIcon,
  PaletteIcon,
  PanelRightOpenIcon,
  PenLineIcon,
  ShieldIcon,
} from "lucide-react";
import { type ReactNode, useEffect } from "react";
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
import { SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import { useAppRouterActions, useScreen, useSettingsDisplay } from "@/hooks";
import { useLocalPreferences } from "@/hooks/useLocalPreferences";
import { useTranslation } from "@/hooks/useTranslation";
import {
  AppearanceSettings,
  DashboardSettings,
  EditorSettings,
  OfflineSettings,
} from "./PreferencesPageContent";
import AboutTab from "./tabs/AboutTab";
import BrowserPermissionsTab from "./tabs/BrowserPermissionsTab";
import FeedbackTab from "./tabs/FeedbackTab";
import NotificationsTab from "./tabs/NotificationsTab";
import PrivacyTab from "./tabs/PrivacyTab";

const PreferencesPage = ({
  displayMode = "page",
  initialSection,
}: {
  displayMode?: "page" | "sheet";
  initialSection?: string;
}) => {
  const { isReady } = useLocalPreferences();
  const router = useAppRouterActions();
  const { width: screenWidth } = useScreen();
  const { openSheet, closeSheet } = useSettingsDisplay();
  const sidebarManager = useSidebar();
  const { t } = useTranslation();

  useEffect(() => {
    const section =
      initialSection ??
      (typeof window === "undefined"
        ? ""
        : decodeURIComponent(window.location.hash.slice(1)));
    if (!section) return;

    const animationFrame = requestAnimationFrame(() => {
      document.getElementById(section)?.scrollIntoView({
        behavior: "auto",
        block: "start",
      });
    });

    return () => cancelAnimationFrame(animationFrame);
  }, [initialSection]);

  const navigationConfig = [
    ["appearance", "settingsPage.preferences.appearance", 5, PaletteIcon],
    ["dashboard", "settingsPage.preferences.dashboard", 3, LayoutDashboardIcon],
    ["editor", "settingsPage.preferences.editor", 4, PenLineIcon],
    ["offline", "settingsPage.preferences.offline", 3, HardDriveIcon],
    ["privacy", "settingsPage.preferences.privacy", 2, ShieldIcon],
    [
      "browser-permissions",
      "settingsPage.preferences.browserPermissions",
      3,
      AppWindowIcon,
    ],
    [
      "feedback",
      "settingsPage.preferences.feedback",
      3,
      MessageSquareWarningIcon,
    ],
    ["notifications", "settingsPage.preferences.notifications", 3, BellIcon],
    ["about", "settingsPage.preferences.about", 2, InfoIcon],
  ] as const satisfies ReadonlyArray<
    readonly [
      string,
      string,
      NonNullable<ArticleNavigationItem["weight"]>,
      NonNullable<ArticleNavigationItem["icon"]>,
    ]
  >;
  const navigationItems = navigationConfig.map(([id, key, weight, icon]) => ({
    id,
    title: String(t(`${key}.title` as never)),
    description: String(t(`${key}.description` as never)),
    weight,
    icon,
  })) satisfies ArticleNavigationItem[];

  return (
    <div
      className={cn(
        "relative h-full min-h-0",
        sidebarManager.isMobile && "pt-10",
        displayMode === "sheet" ? "bg-sidebar" : "bg-canvas"
      )}
    >
      {sidebarManager.isMobile && (
        <SidebarTrigger className="fixed top-2 right-2 z-40" />
      )}
      {screenWidth >= 1024 && (
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
            LocalStorage.setItem(
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
      )}
      <Article className="gap-0 overflow-x-hidden lg:gap-0">
        <ArticleNavigationBar
          items={navigationItems}
          className={
            displayMode === "sheet" ? "hidden lg:block lg:w-8" : "lg:w-8"
          }
        />
        <ArticleContent className="m-0 flex flex-col gap-0 !pb-[var(--density-content-padding)]">
          <PreferenceTab
            id="appearance"
            icon={PaletteIcon}
            title={t("settingsPage.preferences.appearance.title")}
            description={t("settingsPage.preferences.appearance.description")}
            eyebrow={t("settingsPage.preferences.eyebrow")}
            primary
          >
            {isReady && <AppearanceSettings layout="article" />}
          </PreferenceTab>

          <ArticleParagraphSeparator />

          <PreferenceTab
            id="dashboard"
            icon={LayoutDashboardIcon}
            title={t("settingsPage.preferences.dashboard.title")}
            description={t("settingsPage.preferences.dashboard.description")}
          >
            {isReady && <DashboardSettings layout="article" />}
          </PreferenceTab>

          <ArticleParagraphSeparator />

          <PreferenceTab
            id="editor"
            icon={PenLineIcon}
            title={t("settingsPage.preferences.editor.title")}
            description={t("settingsPage.preferences.editor.description")}
          >
            {isReady && <EditorSettings layout="article" />}
          </PreferenceTab>

          <ArticleParagraphSeparator />

          <PreferenceTab
            id="offline"
            icon={HardDriveIcon}
            title={t("settingsPage.preferences.offline.title")}
            description={t("settingsPage.preferences.offline.description")}
          >
            {isReady && <OfflineSettings layout="article" />}
          </PreferenceTab>

          <ArticleParagraphSeparator />

          <PreferenceTab
            id="privacy"
            icon={ShieldIcon}
            title={t("settingsPage.preferences.privacy.title")}
            description={t("settingsPage.preferences.privacy.description")}
          >
            <PrivacyTab layout="article" />
          </PreferenceTab>

          <ArticleParagraphSeparator />

          <PreferenceTab
            id="browser-permissions"
            icon={AppWindowIcon}
            title={t("settingsPage.preferences.browserPermissions.title")}
            description={t(
              "settingsPage.preferences.browserPermissions.description"
            )}
          >
            <BrowserPermissionsTab layout="article" />
          </PreferenceTab>

          <ArticleParagraphSeparator />

          <PreferenceTab
            id="feedback"
            icon={MessageSquareWarningIcon}
            title={t("settingsPage.preferences.feedback.title")}
            description={t("settingsPage.preferences.feedback.description")}
          >
            <FeedbackTab layout="article" />
          </PreferenceTab>

          <ArticleParagraphSeparator />

          <PreferenceTab
            id="notifications"
            icon={BellIcon}
            title={t("settingsPage.preferences.notifications.title")}
            description={t(
              "settingsPage.preferences.notifications.description"
            )}
          >
            <NotificationsTab layout="article" />
          </PreferenceTab>

          <ArticleParagraphSeparator />

          <PreferenceTab
            id="about"
            icon={InfoIcon}
            title={t("settingsPage.preferences.about.title")}
            description={t("settingsPage.preferences.about.description")}
          >
            <AboutTab layout="article" />
          </PreferenceTab>
        </ArticleContent>
      </Article>
    </div>
  );
};

const PreferenceTab = ({
  id,
  icon: Icon,
  title,
  description,
  eyebrow,
  children,
  primary = false,
}: {
  id: string;
  icon: NonNullable<ArticleNavigationItem["icon"]>;
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
      <div className={cn("flex items-center gap-3", primary && "mt-3")}>
        <Icon className="size-6 shrink-0" size={24} />
        {primary ? (
          <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
        ) : (
          <h2 className="text-2xl font-semibold tracking-tight">{title}</h2>
        )}
      </div>
      <p className="mt-3 text-sm leading-6 text-muted-foreground">
        {description}
      </p>
    </ArticleParagraphHeader>
    <ArticleParagraphContent className="max-w-none space-y-0 text-foreground">
      {children}
    </ArticleParagraphContent>
  </ArticleParagraph>
);

export default PreferencesPage;
