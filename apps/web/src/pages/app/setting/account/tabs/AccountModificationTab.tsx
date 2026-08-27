import { getClientMutationHeaders } from "@/api/clientHeaders";
import {
  useDeleteMe,
  useForgetPassword,
  useResetEmail,
  useResetMe,
} from "@/api/hooks/auth.hook";
import { UserRole } from "@shared/api/interfaces/enums";
import { WebURLPathDictionary } from "@shared/constants";
import toast from "@shared/lib/toast";
import { useCallback, useState } from "react";
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
import { useAppRouter, useLoading, useUser } from "@/hooks";
import { translateError } from "@shared/i18n/error";

interface AccountModificationTabProps {
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

const AccountModificationTab = ({
  layout,
  sendAuthCodeTimeCounter,
  setSendAuthCodeTimeCounter,
  isSendAuthCodePending,
  handleSendAuthCode,
  onPanelClose,
}: AccountModificationTabProps) => {
  const router = useAppRouter();
  const loadingManager = useLoading();
  const { t } = useTranslation();
  const userManager = useUser();

  const resetMeMutator = useResetMe();
  const resetEmailMutator = useResetEmail();
  const forgetPasswordMutator = useForgetPassword();
  const deleteMeMutator = useDeleteMe();

  const [resetMeDialogOpen, setResetMeDialogOpen] = useState<boolean>(false);
  const [resetEmailDialogOpen, setResetEmailDialogOpen] =
    useState<boolean>(false);
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
          setSendAuthCodeTimeCounter(0);
          setResetMeDialogOpen(false);
          await userManager.fetchUserData();
          onPanelClose();
          toast.success(t("settingsPage.account.messages.accountReset"));
          router.push(WebURLPathDictionary.app.dashboard._);
        } catch (error) {
          toast.error(translateError(error, t));
        }
      }),
    [
      router,
      userManager,
      t,
      resetMeMutator,
      setSendAuthCodeTimeCounter,
      setResetMeDialogOpen,
      onPanelClose,
    ]
  );

  const handleResetEmail = useCallback(
    async (newEmail: string, authCode: string) =>
      await loadingManager.startAsyncTransactionLoading(async () => {
        try {
          const userAgent = navigator.userAgent;
          await resetEmailMutator.mutateAsync({
            header: getClientMutationHeaders(userAgent),
            body: {
              newEmail: newEmail,
              authCode: authCode,
            },
          });
          setSendAuthCodeTimeCounter(0);
          setResetEmailDialogOpen(false);
          userManager.updateUserData({ email: newEmail });
          toast.success(t("settingsPage.account.messages.emailReset"));
        } catch (error) {
          toast.error(translateError(error, t));
        }
      }),
    [
      userManager,
      t,
      resetEmailMutator,
      setSendAuthCodeTimeCounter,
      setResetEmailDialogOpen,
    ]
  );

  const handleChangePassword = useCallback(
    async (newPassword: string, confirmPassword: string, authCode: string) =>
      await loadingManager.startAsyncTransactionLoading(async () => {
        try {
          if (newPassword !== confirmPassword) {
            throw new Error(
              t("settingsPage.account.modification.passwordMismatch")
            );
          }

          if (userManager.userData?.email === undefined) {
            router.push(WebURLPathDictionary.home);
            userManager.logout();
            throw new Error(t("settingsPage.account.sessionExpired"));
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
          setSendAuthCodeTimeCounter(0);
          setChangePasswordDialogOpen(false);
          toast.success(t("settingsPage.account.messages.passwordChanged"));
        } catch (error) {
          toast.error(translateError(error, t));
        }
      }),
    [
      userManager,
      t,
      forgetPasswordMutator,
      setSendAuthCodeTimeCounter,
      setChangePasswordDialogOpen,
      onPanelClose,
    ]
  );

  const handleDeleteMe = useCallback(
    async (confirmDeleteText: string, authCode: string) =>
      await loadingManager.startAsyncTransactionLoading(async () => {
        try {
          if (confirmDeleteText !== "DELETE") {
            throw new Error(
              t("settingsPage.account.modification.deleteConfirmationInvalid")
            );
          }

          const userAgent = navigator.userAgent;
          await deleteMeMutator.mutateAsync({
            header: getClientMutationHeaders(userAgent),
            body: {
              authCode: authCode,
            },
          });
          setSendAuthCodeTimeCounter(0);
          setDeleteMeDialogOpen(false);
          onPanelClose();
          userManager.setUserData(null);
          toast.success(t("settingsPage.account.messages.accountDeleted"));
          router.push(WebURLPathDictionary.home);
        } catch (error) {
          toast.error(translateError(error, t));
        }
      }),
    [
      router,
      userManager,
      t,
      deleteMeMutator,
      setSendAuthCodeTimeCounter,
      setDeleteMeDialogOpen,
      onPanelClose,
    ]
  );

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
              className="space-y-4"
              method="POST"
              onSubmit={async e => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const authCode = formData.get("authCode") as string;
                await handleResetMe(authCode);
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
                  variant="secondary"
                  onClick={() => setResetMeDialogOpen(false)}
                >
                  {t("common.cancel")}
                </Button>
                <Button variant="destructive" type="submit">
                  {t("settingsPage.account.modification.confirmReset")}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>,
        <Dialog
          open={resetEmailDialogOpen}
          onOpenChange={setResetEmailDialogOpen}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {t("settingsPage.account.modification.changeEmail")}
              </DialogTitle>
              <DialogDescription>
                {t(
                  "settingsPage.account.modification.changeEmailDialogDescription"
                )}
              </DialogDescription>
            </DialogHeader>
            <form
              className="space-y-4"
              method="POST"
              onSubmit={async e => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const authCode = formData.get("authCode") as string;
                const newEmail = formData.get("newEmail") as string;
                await handleResetEmail(authCode, newEmail);
              }}
            >
              <div className="relative flex justify-between items-center mt-1">
                <Input
                  id="newEmail"
                  name="newEmail"
                  type="email"
                  placeholder={t(
                    "settingsPage.account.modification.enterNewEmail"
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
                  onClick={() => setResetEmailDialogOpen(false)}
                >
                  {t("common.cancel")}
                </Button>
                <Button variant="destructive" type="submit">
                  {t("settingsPage.account.modification.confirmChange")}
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
              className="space-y-4"
              method="POST"
              onSubmit={async e => {
                e.preventDefault();
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
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  placeholder={t("auth.confirmNewPassword")}
                  required
                  className="mt-1"
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
                  type="button"
                  variant="outline"
                  onClick={() => setChangePasswordDialogOpen(false)}
                >
                  {t("common.cancel")}
                </Button>
                <Button type="submit">
                  {t("settingsPage.account.modification.updatePassword")}
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
              className="space-y-4"
              method="POST"
              onSubmit={async e => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const authCode = (formData.get("authCode") ?? "") as string;
                const confirmDeleteText = formData.get(
                  "confirmDeleteText"
                ) as string;
                await handleDeleteMe(confirmDeleteText, authCode);
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
                  required={userManager.userData?.role !== UserRole.Guest}
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
              <div className="relative flex justify-between items-center mt-1">
                <Input
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
                  variant="outline"
                  onClick={() => {
                    setDeleteMeDialogOpen(false);
                  }}
                >
                  {t("common.cancel")}
                </Button>
                <Button variant="destructive" type="submit">
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
          variant="outline"
          onClick={() => {
            setResetMeDialogOpen(true);
            handleSendAuthCode();
          }}
        >
          {t("settingsPage.account.modification.resetAccount")}
        </SettingMenuButton>
      </SettingMenuItem>

      <SettingMenuItem
        title={t("settingsPage.account.modification.changeEmail")}
        description={t(
          "settingsPage.account.modification.changeEmailDialogDescription"
        )}
      >
        <SettingMenuButton
          variant="outline"
          onClick={() => {
            setResetEmailDialogOpen(true);
            handleSendAuthCode();
          }}
        >
          {t("settingsPage.account.modification.changeEmail")}
        </SettingMenuButton>
      </SettingMenuItem>

      <SettingMenuItem
        title={t("settingsPage.account.modification.changePassword")}
        description={t(
          "settingsPage.account.modification.changePasswordDescription"
        )}
      >
        <SettingMenuButton
          variant="outline"
          onClick={() => {
            setChangePasswordDialogOpen(true);
            handleSendAuthCode();
          }}
        >
          {t("settingsPage.account.modification.changePassword")}
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
          onClick={() => {
            setDeleteMeDialogOpen(true);
            handleSendAuthCode();
          }}
        >
          {t("common.delete")}
        </SettingMenuButton>
      </SettingMenuItem>
    </SettingMenu>
  );
};

export default AccountModificationTab;
