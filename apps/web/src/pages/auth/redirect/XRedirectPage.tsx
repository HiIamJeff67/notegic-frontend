import { useTranslation } from "react-i18next";

const XRedirectPage = () => {
  const { t } = useTranslation();
  return <div>{t("workspace.pages.xRedirectUnavailable")}</div>;
};

export default XRedirectPage;
