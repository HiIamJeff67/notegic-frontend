import { useTranslation } from "@shared/i18n/useTranslation";

const XRedirectPage = () => {
  const { t } = useTranslation();
  return <div>{t("workspace.pages.xRedirectUnavailable")}</div>;
};

export default XRedirectPage;
