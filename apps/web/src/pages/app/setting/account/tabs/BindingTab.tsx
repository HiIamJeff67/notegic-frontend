import { NotegicAPIError } from "@shared/api/exceptions";
import { AllCountryCodes, CountryCode } from "@shared/api/interfaces/enums";
import { tError } from "@shared/i18n/error";
import toast from "@shared/lib/toast/toast";
import type { OAuthProviderType } from "@shared/types/oauthProvider.type";
import { useCallback, useMemo, useState } from "react";
import { getClientMutationHeaders } from "@/api/clientHeaders";
import {
  useUpdateMyAccount,
  useGetMyAccount,
} from "@/api/hooks/userAccount.hook";
import AuthCodeInput from "@/components/inputs/AuthCodeInput";
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
import { useOAuth } from "@/hooks/useOAuth";

interface BindingTabProps {
  layout?: "panel" | "page";
}

const BindingTab = ({ layout }: BindingTabProps) => {
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
    perform,
    unbind,
    prepare,
    isPreparingOAuthOperation,
    isUnbinding,
    githubAvailable,
    xAvailable,
    discordAvailable,
  } = useOAuth();
  const account = accountQuery.data?.data;
  const backupEmail = account?.backupEmail;
  const phoneNumber = account?.phoneNumber;
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
    {
      name: "discord",
      type: "Discord",
      label: "Discord",
      available: discordAvailable,
      bound: account?.discordBound,
      title: t("settingsPage.account.binding.discord"),
      description: t("settingsPage.account.binding.discordDescription"),
      disconnectTitle: t("settingsPage.account.binding.discordUnbind"),
    },
  ] as const;
  const [unbindProvider, setUnbindProvider] =
    useState<OAuthProviderType | null>(null);
  const [bindProvider, setBindProvider] = useState<OAuthProviderType | null>(
    null
  );
  const [fallbackProvider, setFallbackProvider] = useState<OAuthProviderType>();
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
          setBindBackupEmailDialogOpen(false);
          toast.success(t("settingsPage.account.messages.backupEmailSet"));
        } catch (error) {
          toast.error(tError(error, t));
        }
      }),
    [updateUserAccountMutator, t]
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
          setBindPhoneNumberDialogOpen(false);
          toast.success(t("settingsPage.account.messages.phoneNumberSet"));
        } catch (error) {
          toast.error(tError(error, t));
        }
      }),
    [updateUserAccountMutator, t]
  );

  const authCodeDelivery = { email: userManager.userData?.email };

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
                    const { data } = await prepare({
                      provider: binding.type,
                      authCode,
                    });
                    await perform(binding.name, "binding", data);
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
                    const { data } = await unbind(
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
              <AuthCodeInput
                key={verificationProvider ?? "account-code"}
                className="mt-1"
                disabled={!isOnline}
                send={verificationProvider ? undefined : authCodeDelivery}
              />
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
                {authCodeDelivery.email && (
                  <span className="mt-1 block wrap-anywhere">
                    {t("settingsPage.account.security.enterCodeForEmail", {
                      email: authCodeDelivery.email,
                    })}
                  </span>
                )}
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
              <AuthCodeInput
                className="mt-1"
                disabled={!isOnline}
                send={authCodeDelivery}
              />
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setBindBackupEmailDialogOpen(false)}
                >
                  {t("common.cancel")}
                </Button>
                <Button variant="default" type="submit" disabled={!isOnline}>
                  {t("common.confirm")}
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
              <AuthCodeInput
                className="mt-1"
                disabled={!isOnline}
                send={authCodeDelivery}
              />
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setBindPhoneNumberDialogOpen(false)}
                >
                  {t("common.cancel")}
                </Button>
                <Button variant="default" type="submit" disabled={!isOnline}>
                  {t("common.confirm")}
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
        descriptionDetail={
          backupEmail
            ? t("settingsPage.account.binding.currentBackupEmail", {
                email: backupEmail,
              })
            : undefined
        }
      >
        <SettingMenuButton
          variant="outline"
          disable={!isOnline || !account}
          onClick={() => setBindBackupEmailDialogOpen(true)}
        >
          {backupEmail
            ? t("settingsPage.account.modification.changeAction")
            : t("settingsPage.account.binding.set")}
        </SettingMenuButton>
      </SettingMenuItem>
      <SettingMenuItem
        title={t("settingsPage.account.binding.phoneNumber")}
        description={t("settingsPage.account.binding.phoneNumberDescription")}
        descriptionDetail={
          phoneNumber
            ? t("settingsPage.account.binding.currentPhoneNumber", {
                phone: [account?.countryCode, phoneNumber]
                  .filter(Boolean)
                  .join(" "),
              })
            : undefined
        }
      >
        <SettingMenuButton
          variant="outline"
          disable={!isOnline || phoneNumber === undefined}
          onClick={() => setBindPhoneNumberDialogOpen(true)}
        >
          {phoneNumber
            ? t("settingsPage.account.modification.changeAction")
            : t("settingsPage.account.binding.set")}
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
        const needsPassword =
          provider.bound &&
          registeredProvider === "Email" &&
          account?.passwordConfigured !== true &&
          !providers.some(other => other.name !== provider.name && other.bound);
        const disconnectBlocked =
          provider.bound &&
          (needsPassword ||
            registeredProvider === undefined ||
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
            hideSeparator={provider.name === "discord"}
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
                      (needsPassword
                        ? t("server.error.OAuthPasswordSetupRequired")
                        : t("settingsPage.account.binding.oauthFallbackHint")),
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
    </SettingMenu>
  );
};

export default BindingTab;
