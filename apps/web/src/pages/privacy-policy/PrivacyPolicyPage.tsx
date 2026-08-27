import { ExternalLinkIcon } from "lucide-react";
import type { ReactNode } from "react";
import { Trans, useTranslation } from "react-i18next";
import {
  ArticleSubParagraph,
  ArticleSubParagraphContent,
  ArticleSubParagraphHeader,
} from "@/components/commons/Article/Article";
import { useAppRouterActions } from "@/hooks/useAppRouter";

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
  const router = useAppRouterActions();
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
        <p className="text-sm leading-6 text-muted-foreground">
          {t("workspace.pages.privacy.collectDetails")}
        </p>
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
        <p className="text-sm leading-6 text-muted-foreground">
          {t("workspace.pages.privacy.useDetails")}
        </p>
      </PrivacySection>

      <PrivacySection
        id="privacy-sharing"
        title={t("workspace.pages.privacy.sharingTitle")}
      >
        <p>{t("workspace.pages.privacy.sharingText")}</p>
        <p className="text-sm leading-6 text-muted-foreground">
          {t("workspace.pages.privacy.sharingDetails")}
        </p>
      </PrivacySection>

      <PrivacySection
        id="privacy-retention"
        title={t("workspace.pages.privacy.retentionTitle")}
      >
        <p>{t("workspace.pages.privacy.retentionText")}</p>
        <p className="text-sm leading-6 text-muted-foreground">
          {t("workspace.pages.privacy.retentionDetails")}
        </p>
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
        <p className="text-sm leading-6 text-muted-foreground">
          {t("workspace.pages.privacy.cookiesDetails")}
        </p>
      </PrivacySection>

      <PrivacySection
        id="privacy-changes"
        title={t("workspace.pages.privacy.changesTitle")}
      >
        <p>{t("workspace.pages.privacy.changesText")}</p>
        <p className="text-sm leading-6 text-muted-foreground">
          {t("workspace.pages.privacy.changesDetails")}
        </p>
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
        <p className="text-sm leading-6 text-muted-foreground">
          {t("workspace.pages.privacy.contactDetails")}
        </p>
        <a
          className="inline-flex items-center gap-1.5 text-sm font-medium text-primary underline underline-offset-4 hover:text-primary/80"
          href="/eula"
          onClick={event => {
            event.preventDefault();
            router.push("/eula");
          }}
        >
          {t("workspace.pages.privacy.viewEula")}
          <ExternalLinkIcon className="size-3.5" />
        </a>
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
