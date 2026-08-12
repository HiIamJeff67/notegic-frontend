import { Trans, useTranslation } from "react-i18next";

const CONTACT_EMAIL = "your-email@example.com";

const PrivacyPolicyPage = () => {
  const { t } = useTranslation();
  const emailLink = (
    <a href={`mailto:${CONTACT_EMAIL}`} className="underline" />
  );

  return (
    <div className="max-w-3xl mx-auto px-6 py-12 text-foreground">
      <h1 className="text-3xl font-bold mb-2">
        {t("workspace.pages.privacy.title")}
      </h1>
      <p className="text-sm text-muted-foreground mb-8">
        {t("workspace.pages.privacy.lastUpdated")}
      </p>

      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-2">
          {t("workspace.pages.privacy.collectTitle")}
        </h2>
        <p>{t("workspace.pages.privacy.collectIntro")}</p>
        <ul className="list-disc ml-6 mt-2 space-y-1">
          <li>{t("workspace.pages.privacy.accountInfo")}</li>
          <li>{t("workspace.pages.privacy.createdContent")}</li>
          <li>{t("workspace.pages.privacy.usageData")}</li>
          <li>{t("workspace.pages.privacy.deviceInfo")}</li>
        </ul>
      </section>

      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-2">
          {t("workspace.pages.privacy.useTitle")}
        </h2>
        <ul className="list-disc ml-6 mt-2 space-y-1">
          <li>{t("workspace.pages.privacy.provideService")}</li>
          <li>{t("workspace.pages.privacy.improveExperience")}</li>
          <li>{t("workspace.pages.privacy.communicateUpdates")}</li>
        </ul>
      </section>

      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-2">
          {t("workspace.pages.privacy.sharingTitle")}
        </h2>
        <p>{t("workspace.pages.privacy.sharingText")}</p>
      </section>

      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-2">
          {t("workspace.pages.privacy.retentionTitle")}
        </h2>
        <p>{t("workspace.pages.privacy.retentionText")}</p>
      </section>

      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-2">
          {t("workspace.pages.privacy.rightsTitle")}
        </h2>
        <p>
          <Trans
            i18nKey="workspace.pages.privacy.rightsText"
            values={{ email: CONTACT_EMAIL }}
            components={{ email: emailLink }}
          />
        </p>
      </section>

      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-2">
          {t("workspace.pages.privacy.cookiesTitle")}
        </h2>
        <p>{t("workspace.pages.privacy.cookiesText")}</p>
      </section>

      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-2">
          {t("workspace.pages.privacy.changesTitle")}
        </h2>
        <p>{t("workspace.pages.privacy.changesText")}</p>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-2">
          {t("workspace.pages.privacy.contactTitle")}
        </h2>
        <p>
          <Trans
            i18nKey="workspace.pages.privacy.contactText"
            values={{ email: CONTACT_EMAIL }}
            components={{ email: emailLink }}
          />
        </p>
      </section>
    </div>
  );
};

export default PrivacyPolicyPage;
