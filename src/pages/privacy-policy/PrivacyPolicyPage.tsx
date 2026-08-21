import type { ReactNode } from "react";
import { Trans, useTranslation } from "react-i18next";
import {
  ArticleSubParagraph,
  ArticleSubParagraphContent,
  ArticleSubParagraphHeader,
} from "@/components/commons/Article/Article";

const CONTACT_EMAIL = "your-email@example.com";

const PrivacySection = ({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: ReactNode;
}) => (
  <ArticleSubParagraph id={id}>
    <ArticleSubParagraphHeader>{title}</ArticleSubParagraphHeader>
    <ArticleSubParagraphContent>{children}</ArticleSubParagraphContent>
  </ArticleSubParagraph>
);

export const PrivacyPolicySections = () => {
  const { t } = useTranslation();
  const emailLink = (
    <a href={`mailto:${CONTACT_EMAIL}`} className="underline" />
  );

  return (
    <>
      <p className="mb-8 text-sm text-muted-foreground">
        {t("workspace.pages.privacy.lastUpdated")}
      </p>
      <PrivacySection
        id="privacy-collection"
        title={t("workspace.pages.privacy.collectTitle")}
      >
        <p>{t("workspace.pages.privacy.collectIntro")}</p>
        <ul className="list-disc ml-6 mt-2 space-y-1">
          <li>{t("workspace.pages.privacy.accountInfo")}</li>
          <li>{t("workspace.pages.privacy.createdContent")}</li>
          <li>{t("workspace.pages.privacy.usageData")}</li>
          <li>{t("workspace.pages.privacy.deviceInfo")}</li>
        </ul>
      </PrivacySection>

      <PrivacySection
        id="privacy-use"
        title={t("workspace.pages.privacy.useTitle")}
      >
        <ul className="list-disc ml-6 mt-2 space-y-1">
          <li>{t("workspace.pages.privacy.provideService")}</li>
          <li>{t("workspace.pages.privacy.improveExperience")}</li>
          <li>{t("workspace.pages.privacy.communicateUpdates")}</li>
        </ul>
      </PrivacySection>

      <PrivacySection
        id="privacy-sharing"
        title={t("workspace.pages.privacy.sharingTitle")}
      >
        <p>{t("workspace.pages.privacy.sharingText")}</p>
      </PrivacySection>

      <PrivacySection
        id="privacy-retention"
        title={t("workspace.pages.privacy.retentionTitle")}
      >
        <p>{t("workspace.pages.privacy.retentionText")}</p>
      </PrivacySection>

      <PrivacySection
        id="privacy-rights"
        title={t("workspace.pages.privacy.rightsTitle")}
      >
        <p>
          <Trans
            i18nKey="workspace.pages.privacy.rightsText"
            values={{ email: CONTACT_EMAIL }}
            components={{ email: emailLink }}
          />
        </p>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          {t("workspace.pages.privacy.rightsDetails")}
        </p>
      </PrivacySection>

      <PrivacySection
        id="privacy-cookies"
        title={t("workspace.pages.privacy.cookiesTitle")}
      >
        <p>{t("workspace.pages.privacy.cookiesText")}</p>
      </PrivacySection>

      <PrivacySection
        id="privacy-changes"
        title={t("workspace.pages.privacy.changesTitle")}
      >
        <p>{t("workspace.pages.privacy.changesText")}</p>
      </PrivacySection>

      <PrivacySection
        id="privacy-contact"
        title={t("workspace.pages.privacy.contactTitle")}
      >
        <p>
          <Trans
            i18nKey="workspace.pages.privacy.contactText"
            values={{ email: CONTACT_EMAIL }}
            components={{ email: emailLink }}
          />
        </p>
      </PrivacySection>
    </>
  );
};

const PrivacyPolicyPage = () => {
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
