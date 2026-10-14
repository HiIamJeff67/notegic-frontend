import { useTranslation } from "@shared/i18n/useTranslation";
import { WifiOffIcon } from "lucide-react";

const OfflineTab = () => {
  const { t } = useTranslation();
  return (
    <div className="w-full h-full flex flex-col justify-center items-center gap-8 bg-card">
      <WifiOffIcon size={64} />
      <p className="flex-warp">{t("workspace.pages.accountOffline")}</p>
    </div>
  );
};

export default OfflineTab;
