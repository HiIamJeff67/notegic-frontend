import { Dialog } from "@radix-ui/react-dialog";
import { UserRole } from "@shared/api/interfaces/enums";
import { useNetwork } from "@/hooks/useNetwork";
import { useTranslation } from "@/hooks/useTranslation";
import { tError } from "@shared/i18n/error";
import toast from "@shared/lib/toast/toast";
import { useCallback, useState } from "react";
import { getClientMutationHeaders } from "@/api/clientHeaders";
import { useValidateEmail } from "@/api/hooks/auth.hook";
import { useGetMyAccount } from "@/api/hooks/userAccount.hook";
import AuthCodeInput from "@/components/inputs/AuthCodeInput";
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
import { useLoading, useUser } from "@/hooks";

interface SecurityTabProps {
  layout?: "panel" | "page";
}

const SecurityTab = ({ layout }: SecurityTabProps) => {
  const loadingManager = useLoading();
  const { t } = useTranslation();
  const { isOnline } = useNetwork();
  const offlineHint = isOnline
    ? undefined
    : t("workspace.pages.accountOffline");
  const userManager = useUser();
  const emailVerified = useGetMyAccount().data?.data.emailVerified;
  const role = userManager.userData?.role;
  const isEmailVerified =
    emailVerified ?? (role === UserRole.Normal || role === UserRole.Admin);

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
          setValidateEmailDialogOpen(false);
          if (userManager.userData?.role === UserRole.Guest) {
            userManager.updateUserData({ role: UserRole.Normal });
          }
        } catch (error) {
          toast.error(tError(error, t));
        }
      }),
    [userManager, validateEmailMutator, setValidateEmailDialogOpen]
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
              title={offlineHint}
              noValidate
              className="space-y-4"
              method="POST"
              onSubmit={async e => {
                e.preventDefault();
                if (!isOnline) return;
                const formData = new FormData(e.currentTarget);
                const authCode = formData.get("authCode") as string;
                await handleValidateEmailOnClick(authCode);
              }}
            >
              <AuthCodeInput
                className="mt-1"
                disabled={!isOnline}
                send={{ email: userManager.userData?.email }}
              />
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setValidateEmailDialogOpen(false)}
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
          onClick={() => setValidateEmailDialogOpen(true)}
          disable={
            !isOnline ||
            emailVerified !== false ||
            validateEmailMutator.isPending
          }
        >
          {isEmailVerified
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
