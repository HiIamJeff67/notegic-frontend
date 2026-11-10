import { cn } from "@shared/lib/classname/cn";
import {
  LocalStorage,
  LocalStorageKey,
} from "@shared/lib/storage/localStorage";
import { WebURLPathDictionary } from "@shared/lib/url/web";
import {
  HeartIcon,
  IdCardIcon,
  KeyRoundIcon,
  Link2Icon,
  Maximize2Icon,
  PanelRightOpenIcon,
  ShieldCheckIcon,
  UserPenIcon,
  UserRoundIcon,
} from "lucide-react";
import { useEffect } from "react";
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
import {
  useAppRouter,
  useNetwork,
  useScreen,
  useSettingsDisplay,
} from "@/hooks";
import { useTranslation } from "@/hooks/useTranslation";
import AccountModificationTab from "./tabs/AccountModificationTab";
import AccountTab from "./tabs/AccountTab";
import ApiKeysTab from "./tabs/ApiKeysTab";
import BindingTab from "./tabs/BindingTab";
import ProfileTab from "./tabs/ProfileTab";
import SecurityTab from "./tabs/SecurityTab";
import UpgradeTab from "./tabs/UpgradeTab";

const AccountSettingsPage = ({
  displayMode = "page",
  previewMode = false,
  initialSection,
}: {
  displayMode?: "page" | "sheet";
  previewMode?: boolean;
  initialSection?: string;
}) => {
  const router = useAppRouter();
  const { t } = useTranslation();
  const { isOnline } = useNetwork();
  const offlineHint = isOnline
    ? undefined
    : t("workspace.pages.accountOffline");
  const { width: screenWidth } = useScreen();
  const sidebarManager = useSidebar();
  const { openSheet, closeSheet } = useSettingsDisplay();
  const navigationItems = [
    {
      id: "personal",
      title: t("settingsPage.account.personal.title"),
      description: t("settingsPage.account.personal.description"),
      weight: 5,
      icon: UserRoundIcon,
    },
    {
      id: "account",
      title: t("settingsPage.account.account.title"),
      description: t("settingsPage.account.account.description"),
      weight: 3,
      icon: IdCardIcon,
    },
    {
      id: "api-keys",
      title: t("settingsPage.account.apiKeys.title"),
      description: t("settingsPage.account.apiKeys.description"),
      weight: 3,
      icon: KeyRoundIcon,
    },
    {
      id: "upgrade",
      title: t("settingsPage.account.upgrade.title"),
      description: t("settingsPage.account.upgrade.description"),
      weight: 4,
      icon: HeartIcon,
    },
    {
      id: "security",
      title: t("settingsPage.account.security.title"),
      description: t("settingsPage.account.security.description"),
      weight: 2,
      icon: ShieldCheckIcon,
    },
    {
      id: "binding",
      title: t("settingsPage.account.binding.title"),
      description: t("settingsPage.account.binding.description"),
      weight: 3,
      icon: Link2Icon,
    },
    {
      id: "account-modification",
      title: t("settingsPage.account.modification.title"),
      description: t("settingsPage.account.modification.description"),
      weight: 4,
      icon: UserPenIcon,
    },
  ] satisfies ArticleNavigationItem[];

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

  return (
    <div
      className={cn(
        "relative h-full min-h-0 [&_.flex.flex-col.gap-5]:gap-[var(--density-content-gap)] [&_.flex.flex-col.gap-6]:gap-[var(--density-content-gap)]",
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
              router.push(WebURLPathDictionary.app.setting.account);
              return;
            }

            openSheet("account");
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
          <ArticleParagraph id="personal">
            <ArticleParagraphHeader>
              <p className="font-mono text-[11px] tracking-[0.16em] text-muted-foreground">
                {t("settingsPage.account.eyebrow")}
              </p>
              <div className="mt-3 flex items-center gap-3">
                <UserRoundIcon className="size-7 shrink-0" />
                <h1 className="text-3xl font-semibold tracking-tight">
                  {t("settingsPage.account.personal.title")}
                </h1>
              </div>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                {t("settingsPage.account.personal.description")}
              </p>
            </ArticleParagraphHeader>
            <ArticleParagraphContent className="max-w-none space-y-0 text-foreground">
              <fieldset
                disabled={!isOnline}
                title={offlineHint}
                className="min-w-0"
              >
                <ProfileTab layout="page" />
              </fieldset>
            </ArticleParagraphContent>
          </ArticleParagraph>

          <ArticleParagraphSeparator fullWidth />

          <ArticleParagraph id="account">
            <ArticleParagraphHeader>
              <div className="flex items-center gap-3">
                <IdCardIcon className="size-6 shrink-0" />
                <h2 className="text-2xl font-semibold tracking-tight">
                  {t("settingsPage.account.account.title")}
                </h2>
              </div>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                {t("settingsPage.account.account.description")}
              </p>
            </ArticleParagraphHeader>
            <ArticleParagraphContent className="max-w-none space-y-0 text-foreground">
              <fieldset
                disabled={!isOnline}
                title={offlineHint}
                className="min-w-0"
              >
                <AccountTab layout="page" />
              </fieldset>
            </ArticleParagraphContent>
          </ArticleParagraph>

          <ArticleParagraphSeparator fullWidth />

          <ArticleParagraph id="api-keys">
            <ArticleParagraphHeader>
              <div className="flex items-center gap-3">
                <KeyRoundIcon className="size-6 shrink-0" />
                <h2 className="text-2xl font-semibold tracking-tight">
                  {t("settingsPage.account.apiKeys.title")}
                </h2>
              </div>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                {t("settingsPage.account.apiKeys.description")}
              </p>
            </ArticleParagraphHeader>
            <ArticleParagraphContent className="max-w-none space-y-0 text-foreground">
              <ApiKeysTab layout="page" enabled={!previewMode && isOnline} />
            </ArticleParagraphContent>
          </ArticleParagraph>

          <ArticleParagraphSeparator fullWidth />

          <ArticleParagraph id="upgrade">
            <ArticleParagraphHeader>
              <div className="flex items-center gap-3">
                <HeartIcon className="size-6 shrink-0" />
                <h2 className="text-2xl font-semibold tracking-tight">
                  {t("settingsPage.account.upgrade.title")}
                </h2>
              </div>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                {t("settingsPage.account.upgrade.description")}
              </p>
            </ArticleParagraphHeader>
            <ArticleParagraphContent className="max-w-none space-y-0 text-foreground">
              <UpgradeTab layout="page" />
            </ArticleParagraphContent>
          </ArticleParagraph>

          <ArticleParagraphSeparator fullWidth />

          <ArticleParagraph id="security">
            <ArticleParagraphHeader>
              <div className="flex items-center gap-3">
                <ShieldCheckIcon className="size-6 shrink-0" />
                <h2 className="text-2xl font-semibold tracking-tight">
                  {t("settingsPage.account.security.title")}
                </h2>
              </div>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                {t("settingsPage.account.security.description")}
              </p>
            </ArticleParagraphHeader>
            <ArticleParagraphContent className="max-w-none space-y-0 text-foreground">
              <fieldset
                disabled={!isOnline}
                title={offlineHint}
                className="min-w-0"
              >
                <SecurityTab layout="page" />
              </fieldset>
            </ArticleParagraphContent>
          </ArticleParagraph>

          <ArticleParagraphSeparator fullWidth />

          <ArticleParagraph id="binding">
            <ArticleParagraphHeader>
              <div className="flex items-center gap-3">
                <Link2Icon className="size-6 shrink-0" />
                <h2 className="text-2xl font-semibold tracking-tight">
                  {t("settingsPage.account.binding.title")}
                </h2>
              </div>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                {t("settingsPage.account.binding.description")}
              </p>
            </ArticleParagraphHeader>
            <ArticleParagraphContent className="max-w-none space-y-0 text-foreground">
              <fieldset
                disabled={!isOnline}
                title={offlineHint}
                className="min-w-0"
              >
                <BindingTab layout="page" />
              </fieldset>
            </ArticleParagraphContent>
          </ArticleParagraph>

          <ArticleParagraphSeparator fullWidth />

          <ArticleParagraph id="account-modification">
            <ArticleParagraphHeader>
              <div className="flex items-center gap-3">
                <UserPenIcon className="size-6 shrink-0" />
                <h2 className="text-2xl font-semibold tracking-tight">
                  {t("settingsPage.account.modification.title")}
                </h2>
              </div>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                {t("settingsPage.account.modification.description")}
              </p>
            </ArticleParagraphHeader>
            <ArticleParagraphContent className="max-w-none space-y-0 text-foreground">
              <fieldset
                disabled={!isOnline}
                title={offlineHint}
                className="min-w-0"
              >
                <AccountModificationTab
                  layout="page"
                  onPanelClose={() =>
                    router.push(WebURLPathDictionary.app.dashboard._)
                  }
                />
              </fieldset>
            </ArticleParagraphContent>
          </ArticleParagraph>
        </ArticleContent>
      </Article>
    </div>
  );
};

export default AccountSettingsPage;
