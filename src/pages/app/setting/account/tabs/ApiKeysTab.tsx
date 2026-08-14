import { KeyRoundIcon, ShieldCheckIcon } from "lucide-react";
import { useTranslation } from "react-i18next";
import SettingMenu from "@/components/menus/SettingMenu/SettingMenu";
import SettingMenuItem from "@/components/menus/SettingMenu/SettingMenuItem";
import { Button } from "@/components/ui/button";

interface ApiKeysTabProps {
  layout?: "panel" | "page";
}

const ApiKeysTab = ({ layout = "panel" }: ApiKeysTabProps) => {
  const { t } = useTranslation();

  return (
    <SettingMenu layout={layout} menuItemsClassName="gap-4">
      <div className="rounded-md border border-border bg-background/55 p-5">
        <div className="flex items-start gap-3">
          <div className="rounded-sm border border-primary/30 bg-primary/10 p-2">
            <ShieldCheckIcon className="size-5 text-primary" />
          </div>
          <div className="min-w-0">
            <h3 className="font-medium text-foreground">
              {t("settingsPage.account.apiKeys.securityTitle")}
            </h3>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">
              {t("settingsPage.account.apiKeys.securityDescription")}
            </p>
          </div>
        </div>
      </div>

      <SettingMenuItem
        title={t("settingsPage.account.apiKeys.title")}
        description={t("settingsPage.account.apiKeys.description")}
      >
        <Button type="button" disabled>
          {t("settingsPage.account.apiKeys.create")}
        </Button>
      </SettingMenuItem>

      <div className="flex min-h-48 flex-col items-center justify-center rounded-md border border-dashed border-border bg-background/35 p-8 text-center">
        <KeyRoundIcon className="size-8 text-muted-foreground" />
        <h3 className="mt-3 font-medium text-foreground">
          {t("settingsPage.account.apiKeys.emptyTitle")}
        </h3>
        <p className="mt-1 max-w-md text-sm leading-6 text-muted-foreground">
          {t("settingsPage.account.apiKeys.emptyDescription")}
        </p>
      </div>
    </SettingMenu>
  );
};

export default ApiKeysTab;
