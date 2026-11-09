import { NotegicAPIError } from "@shared/api/exceptions";
import { AllCountryCodes, CountryCode } from "@shared/api/interfaces/enums";
import { tError } from "@shared/i18n/error";
import toast from "@shared/lib/toast/toast";
import { useCallback, useMemo, useState } from "react";
import { getClientMutationHeaders } from "@/api/clientHeaders";
import {
  useUpdateMyAccount,
  useGetMyAccount,
} from "@/api/hooks/userAccount.hook";
import SettingMenu from "@/components/menus/SettingMenu/SettingMenu";
import SettingMenuButton from "@/components/menus/SettingMenu/SettingMenuButton";
import SettingMenuItem from "@/components/menus/SettingMenu/SettingMenuItem";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { useLoading, useUser } from "@/hooks";
import { useNetwork } from "@/hooks/useNetwork";
import { useTranslation } from "@/hooks/useTranslation";
import type { OAuthProviderName } from "@/providers/OAuthProvider";
import { useOAuth } from "@/hooks/useOAuth";

interface BindingTabProps {
  layout?: "panel" | "page";
  sendAuthCodeTimeCounter: number;
  setSendAuthCodeTimeCounter: (newSendAuthCodeTimeCounter: number) => void;
  isSendAuthCodePending: boolean;
  handleSendAuthCode: (
    onSuccess?: () => void,
    onBlock?: () => void,
    fallback?: () => void
  ) => void;
}

const BindingTab = ({
  layout,
  sendAuthCodeTimeCounter,
  setSendAuthCodeTimeCounter,
  isSendAuthCodePending,
  handleSendAuthCode,
}: BindingTabProps) => {
  const loadingManager = useLoading();
  const { t } = useTranslation();
  const { isOnline } = useNetwork();
  const offlineHint = isOnline
    ? undefined
    : t("workspace.pages.accountOffline");
  const userManager = useUser();

  const updateUserAccountMutator = useUpdateMyAccount();
  const accountQuery = useGetMyAccount();
  const {
    beginOAuth,
    unbindOAuth,
    prepareOAuthOperation,
    isPreparingOAuthOperation,
    isUnbinding,
    githubAvailable,
    xAvailable,
  } = useOAuth();
  const account = accountQuery.data?.data;
  const registeredProvider = account?.registeredAuthProviderType;
  const providers = [
    {
      name: "google",
      type: "Google",
      label: "Google",
      available: true,
      bound: account?.googleBound,
      title: t("settingsPage.account.binding.gmail"),
      description: t("settingsPage.account.binding.gmailDescription"),
      disconnectTitle: t("settingsPage.account.binding.googleUnbind"),
    },
    {
      name: "github",
      type: "Github",
      label: "GitHub",
      available: githubAvailable,
      bound: account?.githubBound,
      title: t("settingsPage.account.binding.github"),
      description: t("settingsPage.account.binding.githubDescription"),
      disconnectTitle: t("settingsPage.account.binding.githubUnbind"),
    },
    {
      name: "x",
      type: "X",
      label: "X",
      available: xAvailable,
      bound: account?.xBound,
      title: t("settingsPage.account.binding.x"),
      description: t("settingsPage.account.binding.xDescription"),
      disconnectTitle: t("settingsPage.account.binding.xUnbind"),
    },
  ] as const;
  const [unbindProvider, setUnbindProvider] =
    useState<OAuthProviderName | null>(null);
  const [bindProvider, setBindProvider] = useState<OAuthProviderName | null>(
    null
  );
  const [fallbackProvider, setFallbackProvider] = useState<OAuthProviderName>();
  const [verificationProvider, setVerificationProvider] =
    useState<(typeof providers)[number]["type"]>();
  const disconnecting = providers.find(
    provider => provider.name === unbindProvider
  );
  const fallbackProviders = providers.filter(
    provider =>
      provider.name !== unbindProvider &&
      provider.available &&
      account?.oauthFallbackProviders?.includes(provider.type)
  );
  const needsFallback =
    unbindProvider !== null &&
    (registeredProvider === null || registeredProvider === disconnecting?.type);

  const binding = providers.find(provider => provider.name === bindProvider);
  const selectedFallback = fallbackProviders.find(
    provider =>
      provider.name === (fallbackProvider ?? fallbackProviders[0]?.name)
  );
  const verifyingFallback = providers.find(
    provider => provider.type === verificationProvider
  );

  const [bindBackupEmailDialogOpen, setBindBackupEmailDialogOpen] =
    useState<boolean>(false);
  const [bindPhoneNumberDialogOpen, setBindPhoneNumberDialogOpen] =
    useState<boolean>(false);

  const countryCodeOptions = useMemo(
    () => [
      <SelectItem
        key="NO_COUNTRY_CODE"
        value="NO_COUNTRY_CODE"
        className="text-muted-foreground"
      >
        {t("settingsPage.account.binding.selectCountryCode")}
      </SelectItem>,
      ...AllCountryCodes.map(countryCode => (
        <SelectItem key={countryCode} value={countryCode}>
          {countryCode}
        </SelectItem>
      )),
    ],
    [t]
  );

  const handleBindBackupEmail = useCallback(
    async (backupEmail: string, authCode: string) =>
      await loadingManager.startAsyncTransactionLoading(async () => {
        try {
          const userAgent = navigator.userAgent;
          await updateUserAccountMutator.mutateAsync({
            header: getClientMutationHeaders(userAgent),
            body: {
              authCode: authCode,
              values: {
                backupEmail: backupEmail,
              },
            },
          });
          setSendAuthCodeTimeCounter(0);
          setBindBackupEmailDialogOpen(false);
          toast.success(t("settingsPage.account.messages.backupEmailSet"));
        } catch (error) {
          toast.error(tError(error, t));
        }
      }),
    [updateUserAccountMutator, setSendAuthCodeTimeCounter, t]
  );

  const handleBindPhoneNumber = useCallback(
    async (countryCode: CountryCode, phoneNumber: string, authCode: string) =>
      await loadingManager.startAsyncTransactionLoading(async () => {
        try {
          const userAgent = navigator.userAgent;
          await updateUserAccountMutator.mutateAsync({
            header: getClientMutationHeaders(userAgent),
            body: {
              authCode: authCode,
              values: {
                countryCode: countryCode,
                phoneNumber: phoneNumber,
              },
            },
          });
          setSendAuthCodeTimeCounter(0);
          setBindPhoneNumberDialogOpen(false);
          toast.success(t("settingsPage.account.messages.phoneNumberSet"));
        } catch (error) {
          toast.error(tError(error, t));
        }
      }),
    [updateUserAccountMutator, setSendAuthCodeTimeCounter, t]
  );

  return (
    <SettingMenu
      layout={layout}
      dialogs={[
        <Dialog
          key={unbindProvider ?? bindProvider ?? "oauth-account"}
          open={unbindProvider !== null || bindProvider !== null}
          onOpenChange={open => {
            if (!open) {
              setUnbindProvider(null);
              setBindProvider(null);
              setFallbackProvider(undefined);
              setVerificationProvider(undefined);
            }
          }}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {binding ? binding.title : disconnecting?.disconnectTitle}
              </DialogTitle>
              <DialogDescription>
                {verifyingFallback
                  ? t("settingsPage.account.binding.oauthVerifyFallbackEmail", {
                      provider: verifyingFallback.label,
                    })
                  : t("settingsPage.account.binding.oauthVerifyEmail")}
              </DialogDescription>
            </DialogHeader>
            <form
              title={offlineHint}
              className="space-y-4"
              onSubmit={async event => {
                event.preventDefault();
                if (!isOnline) return;
                const formData = new FormData(event.currentTarget);
                const authCode = String(formData.get("authCode") ?? "");
                if (binding) {
                  try {
                    const { data } = await prepareOAuthOperation({
                      provider: binding.type,
                      authCode,
                    });
                    await beginOAuth(binding.name, "binding", data);
                  } catch (error) {
                    toast.error(
                      error instanceof NotegicAPIError &&
                        error.unWrap.reason === "OAuthVerificationRequired"
                        ? t("settingsPage.account.binding.oauthVerifyAgain")
                        : tError(error, t)
                    );
                  }
                  return;
                }
                if (unbindProvider === null) return;
                await loadingManager.startAsyncTransactionLoading(async () => {
                  try {
                    const { data } = await unbindOAuth(
                      unbindProvider,
                      verificationProvider
                        ? {
                            fallbackProvider: verificationProvider,
                            fallbackEmailCode: authCode,
                          }
                        : {
                            authCode,
                            fallbackProvider: needsFallback
                              ? selectedFallback?.type
                              : undefined,
                          }
                    );
                    if (data.verificationRequired && data.fallbackProvider) {
                      setVerificationProvider(data.fallbackProvider);
                      return;
                    }
                    setUnbindProvider(null);
                    setFallbackProvider(undefined);
                    setVerificationProvider(undefined);
                    toast.success(
                      t("settingsPage.account.binding.oauthDisconnected")
                    );
                    if (needsFallback) {
                      await userManager.fetchUserData();
                    }
                  } catch (error) {
                    if (
                      error instanceof NotegicAPIError &&
                      error.unWrap.reason === "OAuthVerificationRequired"
                    ) {
                      setVerificationProvider(undefined);
                      toast.error(
                        t("settingsPage.account.binding.oauthVerifyAgain")
                      );
                      return;
                    }
                    toast.error(
                      error instanceof NotegicAPIError &&
                        error.unWrap.reason === "OAuthFallbackRequired"
                        ? t("settingsPage.account.binding.oauthFallbackHint")
                        : error instanceof NotegicAPIError &&
                            error.unWrap.reason ===
                              "OAuthFallbackSelectionRequired"
                          ? t(
                              "settingsPage.account.binding.oauthFallbackProvider"
                            )
                          : error instanceof NotegicAPIError &&
                              error.unWrap.reason === "InvalidRequest"
                            ? t(
                                "settingsPage.account.binding.oauthUnbindRejected"
                              )
                            : tError(error, t)
                    );
                  }
                });
              }}
            >
              <div className="relative mt-1">
                <Input
                  disabled={!isOnline}
                  key={verificationProvider ?? "account-code"}
                  name="authCode"
                  aria-label={t("settingsPage.account.security.enterCode")}
                  placeholder={t("settingsPage.account.security.enterCode")}
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  required
                  pattern="[0-9]{6}"
                  maxLength={6}
                  className={
                    verificationProvider
                      ? "w-full px-4 py-3"
                      : "w-full py-3 pr-[40%] pl-4"
                  }
                />
                {!verificationProvider && (
                  <Button
                    type="button"
                    size="sm"
                    variant="default"
                    disabled={
                      !isOnline ||
                      isSendAuthCodePending ||
                      sendAuthCodeTimeCounter > 0
                    }
                    onClick={() => handleSendAuthCode()}
                    className="absolute right-0.5 top-1/2 max-w-2/5 -translate-y-1/2 px-3 text-xs font-bold"
                  >
                    <span className="truncate">
                      {sendAuthCodeTimeCounter > 0
                        ? t("settingsPage.account.security.resendIn", {
                            count: sendAuthCodeTimeCounter,
                          })
                        : t("settingsPage.account.security.resendCode")}
                    </span>
                  </Button>
                )}
              </div>
              {needsFallback &&
                !verificationProvider &&
                fallbackProviders.length > 1 && (
                  <label className="block text-sm">
                    {t("settingsPage.account.binding.oauthFallbackProvider")}
                    <select
                      name="fallback"
                      className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      value={selectedFallback?.name ?? ""}
                      disabled={!isOnline || isUnbinding}
                      onChange={event => {
                        setFallbackProvider(
                          fallbackProviders.find(
                            provider => provider.name === event.target.value
                          )?.name
                        );
                      }}
                      required
                    >
                      {fallbackProviders.map(provider => (
                        <option key={provider.name} value={provider.name}>
                          {provider.label}
                        </option>
                      ))}
                    </select>
                  </label>
                )}
              <DialogFooter>
                <DialogClose asChild>
                  <Button type="button" variant="outline">
                    {t("common.cancel")}
                  </Button>
                </DialogClose>
                <Button
                  type="submit"
                  variant={binding ? "default" : "destructive"}
                  disabled={
                    !isOnline || isUnbinding || isPreparingOAuthOperation
                  }
                >
                  {binding
                    ? t("settingsPage.account.binding.bind")
                    : t("settingsPage.account.binding.unbind")}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>,
        <Dialog
          open={bindBackupEmailDialogOpen}
          onOpenChange={setBindBackupEmailDialogOpen}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {t("settingsPage.account.binding.backupEmail")}
              </DialogTitle>
              <DialogDescription>
                {t("settingsPage.account.binding.backupEmailDialogDescription")}
              </DialogDescription>
            </DialogHeader>
            <form
              title={offlineHint}
              noValidate
              className="space-y-4"
              method="POST"
              onSubmit={async e => {
                e.preventDefault();
                if (!isOnline) return;
                const formData = new FormData(e.currentTarget);
                const backupEmail = formData.get("backupEmail") as string;
                const authCode = formData.get("authCode") as string;
                await handleBindBackupEmail(backupEmail, authCode);
              }}
            >
              <div className="relative flex justify-between items-center mt-1">
                <Input
                  disabled={!isOnline}
                  id="backupEmail"
                  name="backupEmail"
                  type="email"
                  placeholder={t(
                    "settingsPage.account.binding.enterBackupEmail"
                  )}
                  required
                  className="w-full px-4 py-3"
                />
              </div>
              <div className="relative flex justify-between items-center mt-1">
                <Input
                  disabled={!isOnline}
                  id="authCode"
                  name="authCode"
                  type="number"
                  inputMode="numeric"
                  placeholder={t("settingsPage.account.security.enterCode")}
                  autoComplete="one-time-code"
                  maxLength={6}
                  minLength={6}
                  required
                  className="w-full px-4 py-3"
                />
                <Button
                  type="button"
                  size="sm"
                  variant="default"
                  disabled={!isOnline || sendAuthCodeTimeCounter > 0}
                  onClick={() => handleSendAuthCode()}
                  className="absolute right-0.5 max-w-2/5 top-1/2 px-3 -translate-y-1/2 text-xs font-bold"
                >
                  {sendAuthCodeTimeCounter > 0
                    ? t("settingsPage.account.security.resendIn", {
                        count: sendAuthCodeTimeCounter,
                      })
                    : t("settingsPage.account.security.resendCode")}
                </Button>
              </div>
              <DialogFooter>
                <Button
                  variant="secondary"
                  onClick={() => setBindBackupEmailDialogOpen(false)}
                >
                  {t("common.cancel")}
                </Button>
                <Button variant="default" type="submit" disabled={!isOnline}>
                  {t("settingsPage.account.binding.confirmBinding")}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>,
        <Dialog
          open={bindPhoneNumberDialogOpen}
          onOpenChange={setBindPhoneNumberDialogOpen}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {t("settingsPage.account.binding.phoneNumber")}
              </DialogTitle>
              <DialogDescription>
                {t("settingsPage.account.binding.phoneNumberDialogDescription")}
              </DialogDescription>
            </DialogHeader>
            <form
              title={offlineHint}
              noValidate
              className="space-y-4"
              method="POST"
              onSubmit={async e => {
                e.preventDefault();
                if (!isOnline) return;
                const formData = new FormData(e.currentTarget);
                const countryCode = formData.get("countryCode") as CountryCode;
                const phoneNumber = formData.get("phoneNumber") as string;
                const authCode = formData.get("authCode") as string;
                await handleBindPhoneNumber(countryCode, phoneNumber, authCode);
              }}
            >
              <div className="relative flex justify-between items-center mt-1">
                <Select name="countryCode" required disabled={!isOnline}>
                  <SelectTrigger>
                    <SelectValue
                      placeholder={t(
                        "settingsPage.account.binding.selectCountryCode"
                      )}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>
                        {t("settingsPage.account.binding.countryCode")}
                      </SelectLabel>
                      <SelectSeparator />
                      {countryCodeOptions}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
              <div className="relative flex justify-between items-center mt-1">
                <Input
                  disabled={!isOnline}
                  id="phoneNumber"
                  name="phoneNumber"
                  type="phone"
                  placeholder={t(
                    "settingsPage.account.binding.enterPhoneNumber"
                  )}
                  required
                  className="w-full px-4 py-3"
                />
              </div>
              <div className="relative flex justify-between items-center mt-1">
                <Input
                  disabled={!isOnline}
                  id="authCode"
                  name="authCode"
                  type="number"
                  inputMode="numeric"
                  placeholder={t("settingsPage.account.security.enterCode")}
                  autoComplete="one-time-code"
                  maxLength={6}
                  minLength={6}
                  required
                  className="w-full px-4 py-3"
                />
                <Button
                  type="button"
                  size="sm"
                  variant="default"
                  disabled={!isOnline || sendAuthCodeTimeCounter > 0}
                  onClick={() => handleSendAuthCode()}
                  className="absolute right-0.5 max-w-2/5 top-1/2 px-3 -translate-y-1/2 text-xs font-bold"
                >
                  {sendAuthCodeTimeCounter > 0
                    ? t("settingsPage.account.security.resendIn", {
                        count: sendAuthCodeTimeCounter,
                      })
                    : t("settingsPage.account.security.resendCode")}
                </Button>
              </div>
              <DialogFooter>
                <Button
                  variant="secondary"
                  onClick={() => setBindPhoneNumberDialogOpen(false)}
                >
                  {t("common.cancel")}
                </Button>
                <Button variant="default" type="submit" disabled={!isOnline}>
                  {t("settingsPage.account.binding.confirmBinding")}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>,
      ]}
    >
      <SettingMenuItem
        title={t("settingsPage.account.binding.backupEmail")}
        description={t("settingsPage.account.binding.backupEmailDescription")}
      >
        <SettingMenuButton
          variant="outline"
          disable={!isOnline}
          onClick={() => {
            setBindBackupEmailDialogOpen(true);
            handleSendAuthCode();
          }}
        >
          {t("settingsPage.account.binding.bind")}
        </SettingMenuButton>
      </SettingMenuItem>
      <SettingMenuItem
        title={t("settingsPage.account.binding.phoneNumber")}
        description={t("settingsPage.account.binding.phoneNumberDescription")}
      >
        <SettingMenuButton
          variant="outline"
          disable={!isOnline}
          onClick={() => {
            setBindPhoneNumberDialogOpen(true);
            handleSendAuthCode();
          }}
        >
          {t("settingsPage.account.binding.bind")}
        </SettingMenuButton>
      </SettingMenuItem>
      {accountQuery.isError && !account && (
        <SettingMenuItem
          title={t("settingsPage.account.binding.oauthStatusUnavailable")}
        >
          <SettingMenuButton
            variant="outline"
            disable={!isOnline || accountQuery.isFetching}
            onClick={() => void accountQuery.refetch()}
          >
            {t("settingsPage.account.binding.oauthRetryStatus")}
          </SettingMenuButton>
        </SettingMenuItem>
      )}
      {providers.map(provider => {
        const disconnectBlocked =
          provider.bound &&
          (registeredProvider === undefined ||
            ((registeredProvider === null ||
              registeredProvider === provider.type) &&
              !providers.some(
                other =>
                  other.name !== provider.name &&
                  other.available &&
                  account?.oauthFallbackProviders?.includes(other.type)
              )));
        return (
          <SettingMenuItem
            key={provider.name}
            title={provider.title}
            description={provider.description}
          >
            {provider.bound !== undefined ? (
              <span
                className="inline-flex"
                role="group"
                aria-label={provider.title}
                title={
                  [
                    offlineHint,
                    disconnectBlocked &&
                      t("settingsPage.account.binding.oauthFallbackHint"),
                  ]
                    .filter(Boolean)
                    .join(" ") || undefined
                }
              >
                <SettingMenuButton
                  variant="outline"
                  disable={
                    !isOnline ||
                    disconnectBlocked ||
                    (!provider.bound && !provider.available) ||
                    isUnbinding
                  }
                  onClick={() => {
                    if (provider.bound) {
                      setUnbindProvider(provider.name);
                    } else {
                      setBindProvider(provider.name);
                    }
                    if (
                      sendAuthCodeTimeCounter === 0 &&
                      !isSendAuthCodePending
                    ) {
                      handleSendAuthCode();
                    }
                  }}
                >
                  {provider.bound
                    ? t("settingsPage.account.binding.unbind")
                    : t("settingsPage.account.binding.bind")}
                </SettingMenuButton>
              </span>
            ) : !isOnline ||
              (accountQuery.isError && !accountQuery.isFetching) ? (
              <span
                className="text-sm text-muted-foreground"
                title={offlineHint}
              >
                {t("settingsPage.account.binding.oauthStatusUnknown")}
              </span>
            ) : (
              <Spinner className="text-muted-foreground" />
            )}
          </SettingMenuItem>
        );
      })}
      <SettingMenuItem
        title={t("settingsPage.account.binding.discord")}
        description={t("settingsPage.account.binding.discordDescription")}
        hideSeparator
      >
        {account?.discordBound && (
          <span className="text-sm text-muted-foreground">
            {t("settingsPage.account.binding.connected")}
          </span>
        )}
      </SettingMenuItem>
    </SettingMenu>
  );
};

export default BindingTab;
