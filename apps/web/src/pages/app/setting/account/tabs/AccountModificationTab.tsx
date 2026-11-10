import { NotegicError } from "@shared/api/exceptions/errors";
import { UserRole } from "@shared/api/interfaces/enums";
import { tError } from "@shared/i18n/error";
import toast from "@shared/lib/toast/toast";
import { WebURLPathDictionary } from "@shared/lib/url/web";
import { useCallback, useState } from "react";
import { getClientMutationHeaders } from "@/api/clientHeaders";
import {
  useDeleteMe,
  useForgetPassword,
  useResetEmail,
  useResetMe,
} from "@/api/hooks/auth.hook";
import AuthCodeInput from "@/components/inputs/AuthCodeInput";
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
import { useAppRouter, useLoading, useStationRoutine, useUser } from "@/hooks";
import { useNetwork } from "@/hooks/useNetwork";
import { useTranslation } from "@/hooks/useTranslation";

interface AccountModificationTabProps {
  layout?: "panel" | "page";
  onPanelClose: () => void;
}

const AccountModificationTab = ({
  layout,
  onPanelClose,
}: AccountModificationTabProps) => {
  const router = useAppRouter();
  const loadingManager = useLoading();
  const { t } = useTranslation();
  const { isOnline } = useNetwork();
  const offlineHint = isOnline
    ? undefined
    : t("workspace.pages.accountOffline");
  const userManager = useUser();
  const { refresh: refreshStationRoutines } = useStationRoutine();
  const currentEmail = userManager.userData?.email;

  const resetMeMutator = useResetMe();
  const resetEmailMutator = useResetEmail();
  const forgetPasswordMutator = useForgetPassword();
  const deleteMeMutator = useDeleteMe();

  const [resetMeDialogOpen, setResetMeDialogOpen] = useState<boolean>(false);
  const [resetEmailDialogOpen, setResetEmailDialogOpen] =
    useState<boolean>(false);
  const [pendingEmail, setPendingEmail] = useState<string | null>(null);
  const [changePasswordDialogOpen, setChangePasswordDialogOpen] =
    useState<boolean>(false);
  const [deleteMeDialogOpen, setDeleteMeDialogOpen] = useState<boolean>(false);

  const handleResetMe = useCallback(
    async (authCode: string): Promise<void> =>
      await loadingManager.startAsyncTransactionLoading(async () => {
        try {
          const userAgent = navigator.userAgent;
          await resetMeMutator.mutateAsync({
            header: getClientMutationHeaders(userAgent),
            body: {
              authCode: authCode,
            },
          });
          userManager.setUserInfo(null);
          userManager.updateUserData({ avatarURL: "" });
          setResetMeDialogOpen(false);
          void refreshStationRoutines().catch(error => console.error(error));
          await userManager.fetchUserData();
          onPanelClose();
          toast.success(t("settingsPage.account.messages.accountReset"));
          router.push(WebURLPathDictionary.app.dashboard._);
        } catch (error) {
          toast.error(tError(error, t));
        }
      }),
    [router, userManager, resetMeMutator, refreshStationRoutines, onPanelClose]
  );

  const handleResetEmail = useCallback(
    async (newEmail: string, authCode: string) =>
      await loadingManager.startAsyncTransactionLoading(async () => {
        try {
          const userAgent = navigator.userAgent;
          const response = await resetEmailMutator.mutateAsync({
            header: getClientMutationHeaders(userAgent),
            body: {
              newEmail,
              authCode,
              confirm: pendingEmail !== null,
            },
          });
          if (response.data.verificationRequired) {
            setPendingEmail(newEmail);
            return;
          }
          setPendingEmail(null);
          setResetEmailDialogOpen(false);
          userManager.updateUserData({
            email: newEmail,
            ...(userManager.userData?.role === UserRole.Guest && {
              role: UserRole.Normal,
            }),
          });
          toast.success(t("settingsPage.account.messages.emailReset"));
        } catch (error) {
          toast.error(tError(error, t));
        }
      }),
    [userManager, resetEmailMutator, pendingEmail, setResetEmailDialogOpen]
  );

  const handleChangePassword = useCallback(
    async (newPassword: string, confirmPassword: string, authCode: string) =>
      await loadingManager.startAsyncTransactionLoading(async () => {
        try {
          if (newPassword !== confirmPassword) {
            throw new NotegicError(
              "PasswordConfirmationMismatch"
            ).setPresentation("auth.validation.passwordMismatch");
          }

          if (userManager.userData?.email === undefined) {
            router.push(WebURLPathDictionary.home);
            userManager.logout();
            throw new Error("settingsPage.account.sessionExpired");
          }

          const userAgent = navigator.userAgent;
          await forgetPasswordMutator.mutateAsync({
            header: getClientMutationHeaders(userAgent),
            body: {
              account: userManager.userData?.email,
              newPassword: newPassword,
              authCode: authCode,
            },
          });
          setChangePasswordDialogOpen(false);
          toast.success(t("settingsPage.account.messages.passwordChanged"));
        } catch (error) {
          toast.error(tError(error, t));
        }
      }),
    [
      userManager,
      t,
      forgetPasswordMutator,
      setChangePasswordDialogOpen,
      onPanelClose,
    ]
  );

  const handleDeleteMe = useCallback(
    async (confirmDeleteText: string, authCode: string) =>
      await loadingManager.startAsyncTransactionLoading(async () => {
        try {
          if (confirmDeleteText !== "DELETE") {
            throw new NotegicError(
              "DeleteConfirmationMismatch"
            ).setPresentation(
              "settingsPage.account.modification.deleteConfirmationInvalid"
            );
          }

          const userAgent = navigator.userAgent;
          await deleteMeMutator.mutateAsync({
            header: getClientMutationHeaders(userAgent),
            body: {
              authCode: authCode,
            },
          });
          setDeleteMeDialogOpen(false);
          onPanelClose();
          userManager.setUserData(null);
          toast.success(t("settingsPage.account.messages.accountDeleted"));
          router.push(WebURLPathDictionary.home);
        } catch (error) {
          toast.error(tError(error, t));
        }
      }),
    [
      router,
      userManager,
      t,
      deleteMeMutator,
      setDeleteMeDialogOpen,
      onPanelClose,
    ]
  );

  const authCodeDelivery = { email: currentEmail };

  return (
    <SettingMenu
      layout={layout}
      dialogs={[
        <Dialog open={resetMeDialogOpen} onOpenChange={setResetMeDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {t("settingsPage.account.modification.resetAccount")}
              </DialogTitle>
              <DialogDescription>
                {t("settingsPage.account.modification.resetWarning")}
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
                await handleResetMe(authCode);
              }}
            >
              <AuthCodeInput
                className="mt-1"
                disabled={!isOnline}
                send={authCodeDelivery}
              />
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setResetMeDialogOpen(false)}
                >
                  {t("common.cancel")}
                </Button>
                <Button
                  variant="destructive"
                  type="submit"
                  disabled={!isOnline}
                >
                  {t("settingsPage.account.modification.reset")}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>,
        <Dialog
          open={resetEmailDialogOpen}
          onOpenChange={open => {
            setResetEmailDialogOpen(open);
            if (!open) setPendingEmail(null);
          }}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {t("settingsPage.account.modification.changeEmail")}
              </DialogTitle>
              <DialogDescription className="wrap-anywhere">
                {pendingEmail
                  ? t("settingsPage.account.modification.verifyNewEmail", {
                      email: pendingEmail,
                    })
                  : currentEmail
                    ? t(
                        "settingsPage.account.modification.verifyCurrentEmail",
                        {
                          email: currentEmail,
                        }
                      )
                    : t(
                        "settingsPage.account.modification.changeEmailDialogDescription"
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
                const authCode = formData.get("authCode") as string;
                const newEmail =
                  pendingEmail ?? String(formData.get("newEmail") ?? "");
                await handleResetEmail(newEmail, authCode);
              }}
            >
              <div className="relative flex justify-between items-center mt-1">
                <Input
                  disabled={!isOnline}
                  id="newEmail"
                  name="newEmail"
                  type="email"
                  defaultValue={pendingEmail ?? undefined}
                  readOnly={pendingEmail !== null}
                  placeholder={t(
                    "settingsPage.account.modification.enterNewEmail"
                  )}
                  required
                  className="w-full px-4 py-3"
                />
              </div>
              <AuthCodeInput
                key={pendingEmail ? "new-email-code" : "current-email-code"}
                className="mt-1"
                disabled={!isOnline}
                send={pendingEmail ? undefined : authCodeDelivery}
              />
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setResetEmailDialogOpen(false);
                    setPendingEmail(null);
                  }}
                >
                  {t("common.cancel")}
                </Button>
                <Button variant="default" type="submit" disabled={!isOnline}>
                  {pendingEmail
                    ? t("common.confirm")
                    : t("settingsPage.account.modification.continue")}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>,
        <Dialog
          open={changePasswordDialogOpen}
          onOpenChange={setChangePasswordDialogOpen}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {t("settingsPage.account.modification.changePassword")}
              </DialogTitle>
              <DialogDescription>
                {t(
                  "settingsPage.account.modification.changePasswordDialogDescription"
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
                const newPassword = formData.get("newPassword") as string;
                const confirmPassword = formData.get(
                  "confirmPassword"
                ) as string;
                const authCode = formData.get("authCode") as string;
                await handleChangePassword(
                  newPassword,
                  confirmPassword,
                  authCode
                );
              }}
            >
              <div className="relative flex justify-between items-center mt-1">
                <Input
                  disabled={!isOnline}
                  id="newPassword"
                  name="newPassword"
                  type="password"
                  placeholder={t("auth.newPassword")}
                  required
                  className="mt-1"
                />
              </div>
              <div className="relative flex justify-between items-center mt-1">
                <Input
                  disabled={!isOnline}
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  placeholder={t("auth.confirmNewPassword")}
                  required
                  className="mt-1"
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
                  onClick={() => setChangePasswordDialogOpen(false)}
                >
                  {t("common.cancel")}
                </Button>
                <Button type="submit" disabled={!isOnline}>
                  {t("common.confirm")}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>,
        <Dialog open={deleteMeDialogOpen} onOpenChange={setDeleteMeDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="text-destructive">
                {t("settingsPage.account.modification.deleteAccountTitle")}
              </DialogTitle>
              <DialogDescription>
                {t("settingsPage.account.modification.deleteWarning")}
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
                const authCode = (formData.get("authCode") ?? "") as string;
                const confirmDeleteText = formData.get(
                  "confirmDeleteText"
                ) as string;
                await handleDeleteMe(confirmDeleteText, authCode);
              }}
            >
              <AuthCodeInput
                className="mt-1"
                disabled={!isOnline}
                send={authCodeDelivery}
              />
              <div className="relative flex justify-between items-center mt-1">
                <Input
                  disabled={!isOnline}
                  id="confirmDeleteText"
                  name="confirmDeleteText"
                  type="text"
                  placeholder={t(
                    "settingsPage.account.modification.enterDelete"
                  )}
                  required
                  className="w-full px-4 py-3"
                />
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setDeleteMeDialogOpen(false);
                  }}
                >
                  {t("common.cancel")}
                </Button>
                <Button
                  variant="destructive"
                  type="submit"
                  disabled={!isOnline}
                >
                  {t("settingsPage.account.modification.deletePermanently")}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>,
      ]}
    >
      <SettingMenuItem
        title={t("settingsPage.account.modification.resetAccount")}
        description={t("settingsPage.account.modification.resetWarning")}
      >
        <SettingMenuButton
          ariaLabel={t("settingsPage.account.modification.resetAccount")}
          variant="outline"
          onClick={() => setResetMeDialogOpen(true)}
        >
          {t("settingsPage.account.modification.resetAction")}
        </SettingMenuButton>
      </SettingMenuItem>

      <SettingMenuItem
        title={t("settingsPage.account.modification.changeEmail")}
        description={t(
          "settingsPage.account.modification.changeEmailDialogDescription"
        )}
        descriptionDetail={
          currentEmail
            ? t("settingsPage.account.modification.currentEmail", {
                email: currentEmail,
              })
            : undefined
        }
      >
        <SettingMenuButton
          ariaLabel={t("settingsPage.account.modification.changeEmail")}
          variant="outline"
          onClick={() => setResetEmailDialogOpen(true)}
        >
          {t("settingsPage.account.modification.changeAction")}
        </SettingMenuButton>
      </SettingMenuItem>

      <SettingMenuItem
        title={t("settingsPage.account.modification.changePassword")}
        description={t(
          "settingsPage.account.modification.changePasswordDescription"
        )}
      >
        <SettingMenuButton
          ariaLabel={t("settingsPage.account.modification.changePassword")}
          variant="outline"
          onClick={() => setChangePasswordDialogOpen(true)}
        >
          {t("settingsPage.account.modification.changeAction")}
        </SettingMenuButton>
      </SettingMenuItem>

      <SettingMenuItem
        title={t("settingsPage.account.modification.deleteAccount")}
        description={t(
          "settingsPage.account.modification.deleteAccountDescription"
        )}
        titleClassName="text-destructive"
        hideSeparator
      >
        <SettingMenuButton
          variant="destructive"
          onClick={() => setDeleteMeDialogOpen(true)}
        >
          {t("common.delete")}
        </SettingMenuButton>
      </SettingMenuItem>
    </SettingMenu>
  );
};

export default AccountModificationTab;
