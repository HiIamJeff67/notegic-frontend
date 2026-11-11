import { usePageTitle } from "@/hooks/usePageTitle";
import { useTranslation } from "@/hooks/useTranslation";
import { pageTitle } from "@/seo/pageTitle";
import { PrivacyPolicySections } from "./PrivacyPolicySections";

const PrivacyPolicyPage = () => {
  usePageTitle(pageTitle("Privacy and Policy"));

  const { t } = useTranslation();

  return (
    <div className="mx-auto max-w-3xl px-6 py-12 text-foreground">
      <h1 className="mb-2 text-3xl font-bold">
        {t("workspace.pages.privacy.title")}
      </h1>
      <PrivacyPolicySections />
    </div>
  );
};

export default PrivacyPolicyPage;
