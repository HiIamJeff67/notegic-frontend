import { getClientRequestHeaders } from "@shared/api/clientHeaders";
import { useSendAuthCode } from "@shared/api/hooks/auth.hook";
import { AuthCodeBlockedSecond, WebURLPathDictionary } from "@shared/constants";
import { LocalStorageManipulator } from "@shared/lib/localStorageManipulator";
import toast from "@shared/lib/toast";
import { LocalStorageKey } from "@shared/types/localStorage.type";
import { cn } from "@shared/util/utils";
import { Maximize2Icon, PanelRightOpenIcon } from "lucide-react";
import { useCallback, useEffect, useState, useTransition } from "react";
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
import { useAppRouter, useNetwork, useSettingsDisplay, useUser } from "@/hooks";
import { translateError } from "@/i18n/error";
import AccountModificationTab from "./tabs/AccountModificationTab";
import AccountTab from "./tabs/AccountTab";
import ApiKeysTab from "./tabs/ApiKeysTab";
import BindingTab from "./tabs/BindingTab";
import OfflineTab from "./tabs/OfflineTab";
import ProfileTab from "./tabs/ProfileTab";
import SecurityTab from "./tabs/SecurityTab";
import UpgradeTab from "./tabs/UpgradeTab";

const AccountSettingsPage = ({
  displayMode = "page",
}: {
  displayMode?: "page" | "sheet";
}) => {
  const router = useAppRouter();
  const { t } = useTranslation();
  const userManager = useUser();
  const { isOnline } = useNetwork();
  const { openSheet, closeSheet } = useSettingsDisplay();
  const sendAuthCodeMutator = useSendAuthCode();
  const [sendAuthCodeTimeCounter, setSendAuthCodeTimeCounter] = useState(0);
  const [isSendAuthCodePending, startSendAuthCodeTransition] = useTransition();
  const navigationItems = [
    {
      id: "personal",
      title: t("settingsPage.account.personal.title"),
      description: t("settingsPage.account.personal.description"),
      weight: 5,
    },
    {
      id: "account",
      title: t("settingsPage.account.account.title"),
      description: t("settingsPage.account.account.description"),
      weight: 3,
    },
    {
      id: "api-keys",
      title: t("settingsPage.account.apiKeys.title"),
      description: t("settingsPage.account.apiKeys.description"),
      weight: 3,
    },
    {
      id: "upgrade",
      title: t("settingsPage.account.upgrade.title"),
      description: t("settingsPage.account.upgrade.description"),
      weight: 4,
    },
    {
      id: "security",
      title: t("settingsPage.account.security.title"),
      description: t("settingsPage.account.security.description"),
      weight: 2,
    },
    {
      id: "binding",
      title: t("settingsPage.account.binding.title"),
      description: t("settingsPage.account.binding.description"),
      weight: 3,
    },
    {
      id: "account-modification",
      title: t("settingsPage.account.modification.title"),
      description: t("settingsPage.account.modification.description"),
      weight: 4,
    },
  ] satisfies ArticleNavigationItem[];

  useEffect(() => {
    if (sendAuthCodeTimeCounter === 0) return;
    const timer = setInterval(() => {
      setSendAuthCodeTimeCounter(current => {
        if (current <= 1) {
          clearInterval(timer);
          return 0;
        }
        return current - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [sendAuthCodeTimeCounter]);

  const handleSendAuthCode = useCallback(
    (onSuccess?: () => void, onBlock?: () => void, fallback?: () => void) =>
      startSendAuthCodeTransition(async () => {
        try {
          if (sendAuthCodeTimeCounter > 0) {
            onBlock?.();
            toast.error(
              t("settingsPage.account.authCodeAlreadySent", {
                count: sendAuthCodeTimeCounter,
              })
            );
            return;
          }
          if (userManager.userData?.email === undefined) {
            router.push(WebURLPathDictionary.home);
            userManager.logout();
            throw new Error(t("settingsPage.account.sessionExpired"));
          }

          const response = await sendAuthCodeMutator.mutateAsync({
            header: getClientRequestHeaders(navigator.userAgent),
            body: { email: userManager.userData.email },
          });
          const blockTime = Math.floor(
            (new Date(response.data.blockAuthCodeUntil).getTime() -
              Date.now()) /
              1000
          );

          onSuccess?.();
          setSendAuthCodeTimeCounter(
            Math.max(AuthCodeBlockedSecond, blockTime)
          );
          toast.success(
            t("settingsPage.account.authCodeSent", {
              email: userManager.userData.email,
            })
          );
        } catch (error) {
          fallback?.();
          setSendAuthCodeTimeCounter(0);
          toast.error(translateError(error, t));
        }
      }),
    [t, router, sendAuthCodeMutator, sendAuthCodeTimeCounter, userManager]
  );

  const authCodeProps = {
    sendAuthCodeTimeCounter,
    setSendAuthCodeTimeCounter,
    isSendAuthCodePending,
    handleSendAuthCode,
  };

  return (
    <div
      className={cn(
        "relative h-full min-h-0 [&_.flex.flex-col.gap-5]:gap-[var(--density-content-gap)] [&_.flex.flex-col.gap-6]:gap-[var(--density-content-gap)]",
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
            router.push(WebURLPathDictionary.app.setting.account);
            return;
          }

          openSheet("account");
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
          <ArticleParagraph id="personal">
            <ArticleParagraphHeader>
              <p className="font-mono text-[11px] tracking-[0.16em] text-muted-foreground">
                {t("settingsPage.account.eyebrow")}
              </p>
              <h1 className="mt-3 text-3xl font-semibold tracking-tight">
                {t("settingsPage.account.personal.title")}
              </h1>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                {t("settingsPage.account.personal.description")}
              </p>
            </ArticleParagraphHeader>
            <ArticleParagraphContent className="max-w-none text-foreground">
              {isOnline ? <ProfileTab layout="page" /> : <OfflineTab />}
            </ArticleParagraphContent>
          </ArticleParagraph>

          <ArticleParagraphSeparator />

          <ArticleParagraph id="account">
            <ArticleParagraphHeader>
              <h2 className="text-2xl font-semibold tracking-tight">
                {t("settingsPage.account.account.title")}
              </h2>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                {t("settingsPage.account.account.description")}
              </p>
            </ArticleParagraphHeader>
            <ArticleParagraphContent className="max-w-none text-foreground">
              {isOnline ? <AccountTab layout="page" /> : <OfflineTab />}
            </ArticleParagraphContent>
          </ArticleParagraph>

          <ArticleParagraphSeparator />

          <ArticleParagraph id="api-keys">
            <ArticleParagraphHeader>
              <h2 className="text-2xl font-semibold tracking-tight">
                {t("settingsPage.account.apiKeys.title")}
              </h2>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                {t("settingsPage.account.apiKeys.description")}
              </p>
            </ArticleParagraphHeader>
            <ArticleParagraphContent className="max-w-none text-foreground">
              {isOnline ? <ApiKeysTab layout="page" /> : <OfflineTab />}
            </ArticleParagraphContent>
          </ArticleParagraph>

          <ArticleParagraphSeparator />

          <ArticleParagraph id="upgrade">
            <ArticleParagraphHeader>
              <h2 className="text-2xl font-semibold tracking-tight">
                {t("settingsPage.account.upgrade.title")}
              </h2>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                {t("settingsPage.account.upgrade.description")}
              </p>
            </ArticleParagraphHeader>
            <ArticleParagraphContent className="max-w-none text-foreground">
              {isOnline ? <UpgradeTab layout="page" /> : <OfflineTab />}
            </ArticleParagraphContent>
          </ArticleParagraph>

          <ArticleParagraphSeparator />

          <ArticleParagraph id="security">
            <ArticleParagraphHeader>
              <h2 className="text-2xl font-semibold tracking-tight">
                {t("settingsPage.account.security.title")}
              </h2>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                {t("settingsPage.account.security.description")}
              </p>
            </ArticleParagraphHeader>
            <ArticleParagraphContent className="max-w-none text-foreground">
              {isOnline ? (
                <SecurityTab {...authCodeProps} layout="page" />
              ) : (
                <OfflineTab />
              )}
            </ArticleParagraphContent>
          </ArticleParagraph>

          <ArticleParagraphSeparator />

          <ArticleParagraph id="binding">
            <ArticleParagraphHeader>
              <h2 className="text-2xl font-semibold tracking-tight">
                {t("settingsPage.account.binding.title")}
              </h2>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                {t("settingsPage.account.binding.description")}
              </p>
            </ArticleParagraphHeader>
            <ArticleParagraphContent className="max-w-none text-foreground">
              {isOnline ? (
                <BindingTab
                  {...authCodeProps}
                  layout="page"
                  onPanelClose={() => {}}
                />
              ) : (
                <OfflineTab />
              )}
            </ArticleParagraphContent>
          </ArticleParagraph>

          <ArticleParagraphSeparator />

          <ArticleParagraph id="account-modification">
            <ArticleParagraphHeader>
              <h2 className="text-2xl font-semibold tracking-tight">
                {t("settingsPage.account.modification.title")}
              </h2>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                {t("settingsPage.account.modification.description")}
              </p>
            </ArticleParagraphHeader>
            <ArticleParagraphContent className="max-w-none text-foreground">
              {isOnline ? (
                <AccountModificationTab
                  {...authCodeProps}
                  layout="page"
                  onPanelClose={() =>
                    router.push(WebURLPathDictionary.app.dashboard._)
                  }
                />
              ) : (
                <OfflineTab />
              )}
            </ArticleParagraphContent>
          </ArticleParagraph>
        </ArticleContent>
      </Article>
    </div>
  );
};

export default AccountSettingsPage;
