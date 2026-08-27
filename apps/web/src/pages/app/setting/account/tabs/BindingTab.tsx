import { getClientMutationHeaders } from "@/api/clientHeaders";
import { useUpdateMyAccount } from "@/api/hooks/userAccount.hook";
import { AllCountryCodes, CountryCode } from "@shared/api/interfaces/enums";
import { WebURLPathDictionary } from "@shared/constants";
import { getOAuthGoogleSearchParamsString } from "@shared/lib/getURL";
import toast from "@shared/lib/toast";
import { CSRFTokenGenerator } from "@shared/lib/tokenGenerator";
import { useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import SettingMenu from "@/components/menus/SettingMenu/SettingMenu";
import SettingMenuButton from "@/components/menus/SettingMenu/SettingMenuButton";
import SettingMenuItem from "@/components/menus/SettingMenu/SettingMenuItem";
import { Button } from "@/components/ui/button";
import {
  Dialog,
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
import { useAppRouter, useLoading, useUser } from "@/hooks";
import { translateError } from "@shared/i18n/error";

interface BindTabProps {
  layout?: "panel" | "page";
  sendAuthCodeTimeCounter: number;
  setSendAuthCodeTimeCounter: (newSendAuthCodeTimeCounter: number) => void;
  isSendAuthCodePending: boolean;
  handleSendAuthCode: (
    onSuccess?: () => void,
    onBlock?: () => void,
    fallback?: () => void
  ) => void;
  onPanelClose: () => void;
}

const BindingTab = ({
  layout,
  sendAuthCodeTimeCounter,
  setSendAuthCodeTimeCounter,
  isSendAuthCodePending,
  handleSendAuthCode,
  onPanelClose,
}: BindTabProps) => {
  const router = useAppRouter();
  const loadingManager = useLoading();
  const { t } = useTranslation();
  const userManager = useUser();

  const updateUserAccountMutator = useUpdateMyAccount();

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
          toast.error(translateError(error, t));
        }
      }),
    [
      router,
      userManager,
      t,
      updateUserAccountMutator,
      setSendAuthCodeTimeCounter,
      setBindBackupEmailDialogOpen,
    ]
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
          toast.error(translateError(error, t));
        }
      }),
    [
      router,
      userManager,
      t,
      updateUserAccountMutator,
      setSendAuthCodeTimeCounter,
      setBindPhoneNumberDialogOpen,
    ]
  );

  return (
    <SettingMenu
      layout={layout}
      dialogs={[
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
              className="space-y-4"
              method="POST"
              onSubmit={async e => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const backupEmail = formData.get("backupEmail") as string;
                const authCode = formData.get("authCode") as string;
                await handleBindBackupEmail(backupEmail, authCode);
              }}
            >
              <div className="relative flex justify-between items-center mt-1">
                <Input
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
                  disabled={sendAuthCodeTimeCounter > 0}
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
                <Button variant="destructive" type="submit">
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
              className="space-y-4"
              method="POST"
              onSubmit={async e => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const countryCode = formData.get("countryCode") as CountryCode;
                const phoneNumber = formData.get("phoneNumber") as string;
                const authCode = formData.get("authCode") as string;
                await handleBindPhoneNumber(countryCode, phoneNumber, authCode);
              }}
            >
              <div className="relative flex justify-between items-center mt-1">
                <Select name="countryCode" required>
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
                  disabled={sendAuthCodeTimeCounter > 0}
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
                <Button variant="destructive" type="submit">
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
          onClick={() => {
            setBindPhoneNumberDialogOpen(true);
            handleSendAuthCode();
          }}
        >
          {t("settingsPage.account.binding.bind")}
        </SettingMenuButton>
      </SettingMenuItem>
      <SettingMenuItem
        title={t("settingsPage.account.binding.gmail")}
        description={t("settingsPage.account.binding.gmailDescription")}
      >
        <SettingMenuButton
          variant="outline"
          onClick={() =>
            router.forceNavigate(
              WebURLPathDictionary.oauth.google(
                getOAuthGoogleSearchParamsString({
                  csrfToken: CSRFTokenGenerator.generate(),
                  action: "binding",
                  from: router.getCurrentPath(),
                })
              )
            )
          }
        >
          {t("settingsPage.account.binding.bind")}
        </SettingMenuButton>
      </SettingMenuItem>
      <SettingMenuItem
        title={t("settingsPage.account.binding.meta")}
        description={t("settingsPage.account.binding.metaDescription")}
      >
        <SettingMenuButton variant="outline" onClick={() => {}}>
          {t("settingsPage.account.binding.bind")}
        </SettingMenuButton>
      </SettingMenuItem>
      <SettingMenuItem
        title={t("settingsPage.account.binding.discord")}
        description={t("settingsPage.account.binding.discordDescription")}
        hideSeparator
      >
        <SettingMenuButton variant="outline" onClick={() => {}}>
          {t("settingsPage.account.binding.bind")}
        </SettingMenuButton>
      </SettingMenuItem>
    </SettingMenu>
  );
};

export default BindingTab;
