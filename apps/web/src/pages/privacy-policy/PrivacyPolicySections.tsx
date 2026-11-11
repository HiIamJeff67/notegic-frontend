import { ExternalLinkIcon } from "lucide-react";
import type { ReactNode } from "react";
import { Trans } from "react-i18next";
import {
  ArticleSubParagraph,
  ArticleSubParagraphContent,
  ArticleSubParagraphHeader,
} from "@/components/commons/Article/Article";
import { useAppRouterActions } from "@/hooks/useAppRouter";
import { useTranslation } from "@/hooks/useTranslation";

const PrivacyPolicySection = ({
  id,
  title,
  children,
  separatorFullWidth,
}: {
  id: string;
  title: string;
  children: ReactNode;
  separatorFullWidth?: boolean;
}) => (
  <ArticleSubParagraph id={id} separatorFullWidth={separatorFullWidth}>
    <ArticleSubParagraphHeader>{title}</ArticleSubParagraphHeader>
    <ArticleSubParagraphContent>{children}</ArticleSubParagraphContent>
  </ArticleSubParagraph>
);

export const PrivacyPolicySections = ({
  separatorFullWidth = false,
}: {
  separatorFullWidth?: boolean;
}) => {
  const { t } = useTranslation();
  const router = useAppRouterActions();
  const emailLink = (
    <a
      href={`mailto:${import.meta.env.VITE_CONTACT_EMAIL}`}
      className="underline"
    />
  );

  return (
    <>
      <p className="text-muted-foreground mb-8 text-sm">
        {t("workspace.pages.privacy.lastUpdated")}
      </p>
      <PrivacyPolicySection
        id="privacy-collection"
        separatorFullWidth={separatorFullWidth}
        title={t("workspace.pages.privacy.collectTitle")}
      >
        <p>{t("workspace.pages.privacy.collectIntro")}</p>
        <ul className="mt-2 ml-6 list-disc space-y-1">
          <li>{t("workspace.pages.privacy.accountInfo")}</li>
          <li>{t("workspace.pages.privacy.createdContent")}</li>
          <li>{t("workspace.pages.privacy.usageData")}</li>
          <li>{t("workspace.pages.privacy.deviceInfo")}</li>
        </ul>
        <p className="text-muted-foreground text-sm leading-6">
          {t("workspace.pages.privacy.collectDetails")}
        </p>
      </PrivacyPolicySection>

      <PrivacyPolicySection
        id="privacy-use"
        separatorFullWidth={separatorFullWidth}
        title={t("workspace.pages.privacy.useTitle")}
      >
        <ul className="mt-2 ml-6 list-disc space-y-1">
          <li>{t("workspace.pages.privacy.provideService")}</li>
          <li>{t("workspace.pages.privacy.improveExperience")}</li>
          <li>{t("workspace.pages.privacy.communicateUpdates")}</li>
        </ul>
        <p className="text-muted-foreground text-sm leading-6">
          {t("workspace.pages.privacy.useDetails")}
        </p>
      </PrivacyPolicySection>

      <PrivacyPolicySection
        id="privacy-sharing"
        separatorFullWidth={separatorFullWidth}
        title={t("workspace.pages.privacy.sharingTitle")}
      >
        <p>{t("workspace.pages.privacy.sharingText")}</p>
        <p className="text-muted-foreground text-sm leading-6">
          {t("workspace.pages.privacy.sharingDetails")}
        </p>
      </PrivacyPolicySection>

      <PrivacyPolicySection
        id="privacy-retention"
        separatorFullWidth={separatorFullWidth}
        title={t("workspace.pages.privacy.retentionTitle")}
      >
        <p>{t("workspace.pages.privacy.retentionText")}</p>
        <p className="text-muted-foreground text-sm leading-6">
          {t("workspace.pages.privacy.retentionDetails")}
        </p>
      </PrivacyPolicySection>

      <PrivacyPolicySection
        id="privacy-rights"
        separatorFullWidth={separatorFullWidth}
        title={t("workspace.pages.privacy.rightsTitle")}
      >
        <p>
          <Trans
            i18nKey="workspace.pages.privacy.rightsText"
            values={{ email: import.meta.env.VITE_CONTACT_EMAIL }}
            components={{ email: emailLink }}
          />
        </p>
        <p className="text-muted-foreground mt-3 text-sm leading-6">
          {t("workspace.pages.privacy.rightsDetails")}
        </p>
      </PrivacyPolicySection>

      <PrivacyPolicySection
        id="privacy-cookies"
        separatorFullWidth={separatorFullWidth}
        title={t("workspace.pages.privacy.cookiesTitle")}
      >
        <p>{t("workspace.pages.privacy.cookiesText")}</p>
        <p className="text-muted-foreground text-sm leading-6">
          {t("workspace.pages.privacy.cookiesDetails")}
        </p>
      </PrivacyPolicySection>

      <PrivacyPolicySection
        id="privacy-changes"
        separatorFullWidth={separatorFullWidth}
        title={t("workspace.pages.privacy.changesTitle")}
      >
        <p>{t("workspace.pages.privacy.changesText")}</p>
        <p className="text-muted-foreground text-sm leading-6">
          {t("workspace.pages.privacy.changesDetails")}
        </p>
      </PrivacyPolicySection>

      <PrivacyPolicySection
        id="privacy-contact"
        separatorFullWidth={separatorFullWidth}
        title={t("workspace.pages.privacy.contactTitle")}
      >
        <p>
          <Trans
            i18nKey="workspace.pages.privacy.contactText"
            values={{ email: import.meta.env.VITE_CONTACT_EMAIL }}
            components={{ email: emailLink }}
          />
        </p>
        <p className="text-muted-foreground text-sm leading-6">
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
      </PrivacyPolicySection>
    </>
  );
};
