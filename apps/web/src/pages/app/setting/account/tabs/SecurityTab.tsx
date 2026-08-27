import { getClientMutationHeaders } from "@/api/clientHeaders";
import { Dialog } from "@radix-ui/react-dialog";
import { useValidateEmail } from "@/api/hooks/auth.hook";
import { UserRole } from "@shared/api/interfaces/enums";
import toast from "@shared/lib/toast";
import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import SettingMenu from "@/components/menus/SettingMenu/SettingMenu";
import SettingMenuButton from "@/components/menus/SettingMenu/SettingMenuButton";
import SettingMenuItem from "@/components/menus/SettingMenu/SettingMenuItem";
import { Button } from "@/components/ui/button";
import {
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useAppRouter, useLoading, useUser } from "@/hooks";
import { translateError } from "@shared/i18n/error";

interface SecurityTabProps {
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

const SecurityTab = ({
  layout,
  sendAuthCodeTimeCounter,
  setSendAuthCodeTimeCounter,
  isSendAuthCodePending,
  handleSendAuthCode,
}: SecurityTabProps) => {
  const router = useAppRouter();
  const loadingManager = useLoading();
  const { t } = useTranslation();
  const userManager = useUser();

  const validateEmailMutator = useValidateEmail();

  const [validateEmailDialogOpen, setValidateEmailDialogOpen] =
    useState<boolean>(false);
  const [accountRecordDialogOpen, setAccountRecordDialogOpen] =
    useState<boolean>(false);

  const handleValidateEmailOnClick = useCallback(
    async (authCode: string): Promise<void> =>
      loadingManager.startAsyncTransactionLoading(async () => {
        try {
          const userAgent = navigator.userAgent;
          await validateEmailMutator.mutateAsync({
            header: getClientMutationHeaders(userAgent),
            body: {
              authCode: authCode,
            },
          });
          setSendAuthCodeTimeCounter(0);
          setValidateEmailDialogOpen(false);
          userManager.updateUserData({ role: UserRole.Normal });
        } catch (error) {
          toast.error(translateError(error, t));
        }
      }),
    [
      userManager,
      t,
      validateEmailMutator,
      setSendAuthCodeTimeCounter,
      setValidateEmailDialogOpen,
    ]
  );

  return (
    <SettingMenu
      layout={layout}
      dialogs={[
        <Dialog
          open={validateEmailDialogOpen}
          onOpenChange={setValidateEmailDialogOpen}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {t("settingsPage.account.security.verifyEmail")}
              </DialogTitle>
              <DialogDescription>
                {userManager.userData?.email
                  ? t("settingsPage.account.security.enterCodeForEmail", {
                      email: userManager.userData.email,
                    })
                  : t("settingsPage.account.security.enterCode")}
              </DialogDescription>
            </DialogHeader>
            <form
              className="space-y-4"
              method="POST"
              onSubmit={async e => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const authCode = formData.get("authCode") as string;
                await handleValidateEmailOnClick(authCode);
              }}
            >
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
                  variant="outline"
                  onClick={() => setValidateEmailDialogOpen(false)}
                >
                  {t("common.cancel")}
                </Button>
                <Button variant="default" type="submit">
                  {t("common.confirm")}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>,
        <Dialog
          open={accountRecordDialogOpen}
          onOpenChange={setAccountRecordDialogOpen}
        ></Dialog>,
      ]}
    >
      <SettingMenuItem
        title={t("settingsPage.account.security.verifyEmail")}
        description={t("settingsPage.account.security.verifyEmailDescription")}
      >
        <SettingMenuButton
          variant="outline"
          onClick={() =>
            handleSendAuthCode(
              () => setValidateEmailDialogOpen(true),
              () => setValidateEmailDialogOpen(true)
            )
          }
          disable={
            userManager.userData?.role &&
            userManager.userData.role !== UserRole.Guest
          }
        >
          {userManager.userData?.role &&
          userManager.userData.role !== UserRole.Guest
            ? t("settingsPage.account.security.verified")
            : t("settingsPage.account.security.verify")}
        </SettingMenuButton>
      </SettingMenuItem>
      <SettingMenuItem
        title={t("settingsPage.account.security.activity")}
        description={t("settingsPage.account.security.activityDescription")}
        hideSeparator
      >
        <SettingMenuButton variant="outline" onClick={() => {}}>
          {t("settingsPage.account.security.view")}
        </SettingMenuButton>
      </SettingMenuItem>
    </SettingMenu>
  );
};

export default SecurityTab;
