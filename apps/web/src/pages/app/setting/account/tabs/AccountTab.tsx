import { getClientRequestHeaders } from "@/api/clientHeaders";
import { zodResolver } from "@hookform/resolvers/zod";
import { useUpdateMe } from "@/api/hooks/user.hook";
import { AllUserStatus } from "@shared/api/interfaces/enums";
import { FakeUser } from "@shared/constants";
import toast from "@shared/lib/toast";
import { User, UserSchema } from "@shared/types/user.type";
import { memo, useCallback, useEffect, useMemo } from "react";
import { UseFormReturn, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import SettingMenuItem from "@/components/menus/SettingMenu/SettingMenuItem";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
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
import { useLoading } from "@/hooks";
import { useUser } from "@/hooks/useUser";
import { translateError } from "@shared/i18n/error";

interface AccountTabProps {
  layout?: "panel" | "page";
}

const AccountTab = memo(({ layout = "panel" }: AccountTabProps) => {
  const loadingManager = useLoading();
  const { i18n, t } = useTranslation();
  const userManager = useUser();
  const updateMeMutator = useUpdateMe();

  const user: User = useMemo(() => {
    if (!userManager.userData) return FakeUser;
    return {
      publicId: userManager.userData.publicId,
      name: userManager.userData.name,
      displayName: userManager.userData.displayName,
      email: userManager.userData.email,
      role: userManager.userData.role,
      plan: userManager.userData.plan,
      status: userManager.userData.status,
      updatedAt: userManager.userData.updatedAt,
      createdAt: userManager.userData.createdAt,
    };
  }, [userManager.userData]);

  const userForm: UseFormReturn<User> = useForm({
    resolver: zodResolver(UserSchema),
    defaultValues: user,
  }) as UseFormReturn<User>;

  useEffect(() => {
    userForm.reset(user);
  }, [user, userForm]);

  const statusOptions = useMemo(
    () =>
      AllUserStatus.map(status => (
        <SelectItem key={status} value={status}>
          {t(`settingsPage.account.statuses.${status}`)}
        </SelectItem>
      )),
    [t]
  );

  const handleSaveUserOnSubmit = useCallback(
    async (user: User) =>
      await loadingManager.startAsyncTransactionLoading(async () => {
        try {
          const userAgent = navigator.userAgent;
          await updateMeMutator.mutateAsync({
            header: getClientRequestHeaders(userAgent),
            body: {
              values: {
                displayName: user.displayName,
                status: user.status,
              },
              setNull: {
                displayName: user.displayName === null,
                status: user.status === null,
              },
            },
          });

          userManager.updateUserData({
            ...(user.displayName !== undefined && {
              displayName: user.displayName,
            }),
            ...(user.status !== undefined && {
              status: user.status,
            }),
          });

          toast.success(t("settingsPage.account.messages.accountUpdated"));
        } catch (error) {
          toast.error(translateError(error, t));
        }
      }),
    [loadingManager, userManager, t, updateMeMutator]
  );

  return (
    <Form {...userForm}>
      <form
        className={`w-full flex flex-col ${
          layout === "panel" ? "h-full overflow-hidden" : ""
        }`}
        method="POST"
        onSubmit={userForm.handleSubmit(handleSaveUserOnSubmit)}
      >
        <div
          className={`flex flex-col gap-6 ${
            layout === "panel"
              ? "min-h-full overflow-y-scroll bg-muted px-8 pt-12 pb-8 ![scrollbar-color:var(--muted-foreground)_var(--secondary)]"
              : ""
          }`}
        >
          <FormField
            control={userForm.control}
            name="publicId"
            render={({ field }) => (
              <FormItem>
                <SettingMenuItem
                  title={t("settingsPage.account.fields.publicId")}
                  description={field.value}
                >
                  <></>
                </SettingMenuItem>
              </FormItem>
            )}
          />

          <FormField
            control={userForm.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <SettingMenuItem
                  title={t("settingsPage.account.fields.accountName")}
                  description={field.value}
                >
                  <></>
                </SettingMenuItem>
              </FormItem>
            )}
          />

          <FormField
            control={userForm.control}
            name="displayName"
            render={({ field }) => (
              <FormItem>
                <SettingMenuItem
                  title={t("settingsPage.account.fields.displayName")}
                  description={
                    field.value ||
                    t("settingsPage.account.fields.displayNameUnset")
                  }
                >
                  <FormControl>
                    <Input
                      {...field}
                      value={field.value ?? ""}
                      placeholder={t(
                        "settingsPage.account.fields.setDisplayName"
                      )}
                      className="w-[200px]"
                    />
                  </FormControl>
                </SettingMenuItem>
                <FormMessage className="ml-[200px] mt-1" />
              </FormItem>
            )}
          />

          <FormField
            control={userForm.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <SettingMenuItem
                  title={t("settingsPage.account.fields.email")}
                  description={field.value}
                >
                  <></>
                </SettingMenuItem>
              </FormItem>
            )}
          />

          <FormField
            control={userForm.control}
            name="role"
            render={({ field }) => (
              <FormItem>
                <SettingMenuItem
                  title={t("settingsPage.account.fields.role")}
                  description={field.value}
                >
                  <></>
                </SettingMenuItem>
              </FormItem>
            )}
          />

          <FormField
            control={userForm.control}
            name="plan"
            render={({ field }) => (
              <FormItem>
                <SettingMenuItem
                  title={t("settingsPage.account.fields.plan")}
                  description={field.value}
                >
                  <></>
                </SettingMenuItem>
              </FormItem>
            )}
          />

          <FormField
            control={userForm.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <SettingMenuItem
                  title={t("settingsPage.account.fields.status")}
                  description={t("settingsPage.account.fields.currentStatus", {
                    status: t(`settingsPage.account.statuses.${field.value}`),
                  })}
                >
                  <FormControl>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue
                          placeholder={t(
                            "settingsPage.account.fields.selectStatus"
                          )}
                        />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectLabel>
                            {t("settingsPage.account.fields.status")}
                          </SelectLabel>
                          <SelectSeparator />
                          {statusOptions}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </FormControl>
                </SettingMenuItem>
                <FormMessage className="ml-[200px] mt-1" />
              </FormItem>
            )}
          />

          <FormField
            control={userForm.control}
            name="createdAt"
            render={({ field }) => (
              <FormItem>
                <SettingMenuItem
                  title={t("settingsPage.account.fields.joinedAt")}
                  description={
                    field.value instanceof Date
                      ? field.value.toLocaleDateString(i18n.resolvedLanguage)
                      : field.value
                  }
                  hideSeparator
                >
                  <></>
                </SettingMenuItem>
              </FormItem>
            )}
          />

          <div
            className={`flex justify-start gap-4 pt-6 ${
              layout === "panel" ? "border-t border-border/50" : ""
            }`}
          >
            <Button variant="default" type="submit" className="max-w-2/5">
              {t("settingsPage.account.fields.saveAccount")}
            </Button>
            <Button
              variant="destructive"
              type="button"
              className="max-w-2/5"
              onClick={() => userForm.reset(user)}
            >
              {t("settingsPage.account.fields.resetChanges")}
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
});

export default AccountTab;
