import { getClientRequestHeaders } from "@shared/api/clientHeaders";
import { zodResolver } from "@hookform/resolvers/zod";
import { useUpdateMyInfo } from "@shared/api/hooks/userInfo.hook";
import { AllCountries, AllUserGenders } from "@shared/api/interfaces/enums";
import { FakeUserInfo } from "@shared/constants";
import toast from "@shared/lib/toast";
import { UserInfo, UserInfoSchema } from "@shared/types/user.type";
import { format } from "date-fns";
import { memo, useCallback, useEffect, useMemo, useState } from "react";
import { UseFormReturn, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import AvatarIcon from "@/components/icons/AvatarIcon";
import ModifyImageHover from "@/components/hovers/ModifyImageHover/ModifyImageHover";
import SettingMenuItem from "@/components/menus/SettingMenu/SettingMenuItem";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
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
import { Textarea } from "@/components/ui/textarea";
import { useLoading } from "@/hooks";
import { useUser } from "@/hooks/useUser";
import { translateError } from "@/i18n/error";

interface ProfileTabProps {
  layout?: "panel" | "page";
}

type ProfileImageField = "avatarURL" | "coverBackgroundURL";

const ProfileTab = memo(({ layout = "panel" }: ProfileTabProps) => {
  const loadingManager = useLoading();
  const { i18n, t } = useTranslation();
  const userManager = useUser();

  const updateUserInfoMutator = useUpdateMyInfo();

  const [birthDateDialogOpen, setBirthDateDialogOpen] = useState(false);
  const [editingImageField, setEditingImageField] =
    useState<ProfileImageField | null>(null);
  const [editingImageURL, setEditingImageURL] = useState("");

  useEffect(() => {
    const fetchUserInfo = async () => {
      if (userManager.userInfo) return;
      await userManager.fetchUserInfo();
    };

    fetchUserInfo();
  }, []);

  const userInfoForm: UseFormReturn<UserInfo> = useForm({
    resolver: zodResolver(UserInfoSchema),
    defaultValues: userManager.userInfo ?? FakeUserInfo,
  }) as UseFormReturn<UserInfo>;

  useEffect(() => {
    userInfoForm.reset(userManager.userInfo ?? FakeUserInfo);
  }, [userManager, userInfoForm]);

  const coverBackgroundURL = userInfoForm.watch("coverBackgroundURL");
  const avatarURL = userInfoForm.watch("avatarURL");

  const backgroundStyle = useMemo(
    () => ({
      minHeight: 180,
      background: coverBackgroundURL
        ? `url(${coverBackgroundURL}) center/cover no-repeat`
        : "var(--foreground)",
    }),
    [coverBackgroundURL]
  );

  const avatarFallbackText =
    userManager.userData?.displayName || userManager.userData?.name || "U";

  const genderOptions = useMemo(
    () =>
      AllUserGenders.map(gender => (
        <SelectItem key={gender} value={gender}>
          {gender}
        </SelectItem>
      )),
    []
  );

  const countryOptions = useMemo(
    () => [
      <SelectItem
        key="NO_COUNTRY"
        value="NO_COUNTRY"
        className="text-muted-foreground"
      >
        {t("settingsPage.account.personal.countryUnset")}
      </SelectItem>,
      ...AllCountries.map(country => (
        <SelectItem key={country} value={country}>
          {country}
        </SelectItem>
      )),
    ],
    [t]
  );

  const handleSaveUserInfoOnSubmit = useCallback(
    async (userInfo: UserInfo): Promise<void> =>
      await loadingManager.startAsyncTransactionLoading(async () => {
        try {
          const userAgent = navigator.userAgent;
          await updateUserInfoMutator.mutateAsync({
            header: getClientRequestHeaders(userAgent),
            body: {
              values: {
                avatarURL: userInfo.avatarURL,
                coverBackgroundURL: userInfo.coverBackgroundURL,
                header: userInfo.header,
                introduction: userInfo.introduction,
                gender: userInfo.gender,
                country: userInfo.country,
                birthDate: userInfo.birthDate,
              },
              setNull: {
                avatarURL: userInfo.avatarURL === null,
                coverBackgroundURL: userInfo.coverBackgroundURL === null,
                header: userInfo.header === null,
                introduction: userInfo.introduction === null,
                gender: userInfo.gender === null,
                country: userInfo.country === null,
                birthDate: userInfo.birthDate === null,
              },
            },
          });

          userManager.updateUserData({
            ...(userInfo.avatarURL !== undefined && {
              avatarURL: userInfo.avatarURL,
            }),
          });
          userManager.updateUserInfo(userInfo);
          toast.success(t("settingsPage.account.messages.profileUpdated"));
        } catch (error) {
          toast.error(translateError(error, t));
        }
      }),
    [loadingManager, userManager, t, updateUserInfoMutator]
  );

  return (
    <Form {...userInfoForm}>
      <form
        method="POST"
        onSubmit={userInfoForm.handleSubmit(handleSaveUserInfoOnSubmit)}
        className={`w-full flex flex-col ${
          layout === "panel" ? "h-full overflow-hidden" : ""
        }`}
      >
        <div
          className={`flex w-full flex-col gap-6 ${
            layout === "panel"
              ? "h-full overflow-y-scroll bg-muted [scrollbar-color:var(--muted-foreground)_var(--secondary)]!"
              : ""
          }`}
        >
          <div className="relative w-full group" style={backgroundStyle}>
            <ModifyImageHover
              className="absolute inset-0 bg-black/30"
              onClick={() => {
                setEditingImageField("coverBackgroundURL");
                setEditingImageURL(coverBackgroundURL ?? "");
              }}
              hoverText={t("settingsPage.account.personal.changeCover")}
            />
            <div className="absolute right-8 bottom-[-64px] z-10 group/avatar">
              <div
                className="w-32 h-32 rounded-full border-4 border-border shadow-lg bg-background flex items-center justify-center overflow-hidden relative cursor-pointer"
                onClick={() => {
                  setEditingImageField("avatarURL");
                  setEditingImageURL(avatarURL ?? "");
                }}
              >
                <AvatarIcon
                  avatarURL={avatarURL ?? ""}
                  alt={t("settingsPage.account.personal.avatar")}
                  fallbackText={avatarFallbackText}
                  size={128}
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/avatar:opacity-100 flex items-center justify-center transition">
                  <span className="text-white text-center font-semibold text-sm select-none">
                    {t("settingsPage.account.personal.changeAvatar")}
                  </span>
                </div>
              </div>
            </div>
            <div style={{ height: 120 }} />
          </div>

          <Dialog
            open={editingImageField !== null}
            onOpenChange={open => {
              if (!open) setEditingImageField(null);
            }}
          >
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingImageField === "avatarURL"
                    ? t("settingsPage.account.personal.changeAvatarTitle")
                    : t("settingsPage.account.personal.changeCoverTitle")}
                </DialogTitle>
                <DialogDescription>
                  {t("settingsPage.account.personal.imageDescription")}
                </DialogDescription>
              </DialogHeader>
              <Input
                type="url"
                value={editingImageURL}
                onChange={event => setEditingImageURL(event.target.value)}
                placeholder="https://example.com/image.png"
              />
              <div className="flex justify-between gap-2">
                <Button
                  variant="ghost"
                  type="button"
                  onClick={() => {
                    if (editingImageField) {
                      userInfoForm.setValue(editingImageField, null, {
                        shouldDirty: true,
                        shouldValidate: true,
                      });
                    }
                    setEditingImageField(null);
                  }}
                >
                  {t("settingsPage.account.personal.removeImage")}
                </Button>
                <Button
                  type="button"
                  onClick={() => {
                    const imageURL = editingImageURL.trim();

                    if (imageURL) {
                      try {
                        new URL(imageURL);
                      } catch {
                        toast.error(
                          t("settingsPage.account.messages.invalidImageUrl")
                        );
                        return;
                      }
                    }

                    if (editingImageField) {
                      userInfoForm.setValue(
                        editingImageField,
                        imageURL || null,
                        {
                          shouldDirty: true,
                          shouldValidate: true,
                        }
                      );
                    }
                    setEditingImageField(null);
                  }}
                >
                  {t("settingsPage.account.personal.apply")}
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <div
            className={`flex flex-col gap-6 ${
              layout === "panel" ? "h-full bg-muted px-8 pt-12 pb-8" : ""
            }`}
          >
            <FormField
              control={userInfoForm.control}
              name="header"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {t("settingsPage.account.personal.headline")}
                  </FormLabel>
                  <FormControl>
                    <Input {...field} value={field.value ?? ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={userInfoForm.control}
              name="introduction"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {t("settingsPage.account.personal.introduction")}
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      value={field.value ?? ""}
                      className="text-base mb-6"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={userInfoForm.control}
              name="gender"
              render={({ field }) => (
                <FormItem>
                  <SettingMenuItem
                    title={t("settingsPage.account.personal.gender")}
                    description={
                      field.value ||
                      t("settingsPage.account.personal.genderUnset")
                    }
                  >
                    <FormControl>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger>
                          <SelectValue
                            placeholder={t(
                              "settingsPage.account.personal.selectGender"
                            )}
                          />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            <SelectLabel>
                              {t("settingsPage.account.personal.gender")}
                            </SelectLabel>
                            <SelectSeparator />
                            {genderOptions}
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
              control={userInfoForm.control}
              name="country"
              render={({ field }) => (
                <FormItem>
                  <SettingMenuItem
                    title={t("settingsPage.account.personal.country")}
                    description={
                      field.value ||
                      t("settingsPage.account.personal.countryUnset")
                    }
                  >
                    <FormControl>
                      <Select
                        value={field.value || ""}
                        onValueChange={value => {
                          if (value === "NO_COUNTRY") {
                            field.onChange(null);
                          } else {
                            field.onChange(value);
                          }
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue
                            placeholder={t(
                              "settingsPage.account.personal.countryUnset"
                            )}
                          />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            <SelectLabel>
                              {t("settingsPage.account.personal.country")}
                            </SelectLabel>
                            <SelectSeparator />
                            {countryOptions}
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
              control={userInfoForm.control}
              name="birthDate"
              render={({ field }) => (
                <FormItem>
                  <SettingMenuItem
                    title={t("settingsPage.account.personal.birthDate")}
                    description={
                      field.value
                        ? format(
                            typeof field.value === "string"
                              ? new Date(field.value)
                              : field.value,
                            "yyyy-MM-dd"
                          )
                        : t("settingsPage.account.personal.birthDateUnset")
                    }
                  >
                    <Dialog
                      open={birthDateDialogOpen}
                      onOpenChange={setBirthDateDialogOpen}
                    >
                      <DialogTrigger asChild>
                        <Button variant="outline">
                          {t("settingsPage.account.personal.changeDate")}
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="w-auto">
                        <DialogHeader>
                          <DialogTitle>
                            {t("settingsPage.account.personal.selectBirthDate")}
                          </DialogTitle>
                          <DialogDescription>
                            {t("settingsPage.account.personal.selectBirthDate")}
                          </DialogDescription>
                        </DialogHeader>
                        <div className="flex justify-center">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={date => {
                              field.onChange(date);
                              setBirthDateDialogOpen(false);
                            }}
                            disabled={date =>
                              date > new Date() || date < new Date("1900-01-01")
                            }
                            initialFocus
                          />
                        </div>
                      </DialogContent>
                    </Dialog>
                  </SettingMenuItem>
                  <FormMessage className="ml-[200px] mt-1" />
                </FormItem>
              )}
            />

            <FormField
              control={userInfoForm.control}
              name="updatedAt"
              render={({ field }) => (
                <FormItem>
                  <SettingMenuItem
                    title={t("settingsPage.account.personal.lastUpdated")}
                    description={
                      field.value instanceof Date
                        ? field.value.toLocaleString(i18n.resolvedLanguage)
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
                {t("settingsPage.account.personal.saveProfile")}
              </Button>
              <Button
                variant="destructive"
                type="button"
                className="max-w-2/5"
                onClick={() =>
                  userInfoForm.reset(userManager.userInfo ?? FakeUserInfo)
                }
              >
                {t("settingsPage.account.personal.resetChanges")}
              </Button>
            </div>
            <div className="w-full h-2 shrink-0" />
          </div>
        </div>
      </form>
    </Form>
  );
});

export default ProfileTab;
