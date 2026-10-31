// Generated from apps/web/src/pages/document/privacy-policy/sources/privacy-policy.md; run npm run generate:document.
import { ExternalLinkIcon } from "lucide-react";
import {
  ArticleLink,
  ArticleSubParagraph,
  ArticleSubParagraphContent,
  ArticleSubParagraphHeader,
} from "@/components/commons/Article/Article";
const PrivacyPolicyContent = () => {
  const contactEmail = import.meta.env.VITE_CONTACT_EMAIL ?? "";
  return (
    <>
      <p className="mb-8 text-sm text-muted-foreground">
        {"Last updated: March 9, 2026"}
      </p>
      <ArticleSubParagraph id="privacy-collection" separatorFullWidth>
        <ArticleSubParagraphHeader>
          {"1. Information we collect"}
        </ArticleSubParagraphHeader>
        <ArticleSubParagraphContent>
          <p>{"When you use Notegic, we may collect:"}</p>
          <ul className="list-disc ml-6 mt-2 space-y-1">
            <li>
              {"Account information, such as your name and email address"}
            </li>
            <li>{"Content you create, such as notes and documents"}</li>
            <li>{"Usage data, such as pages visited and features used"}</li>
            <li>{"Device and browser information"}</li>
          </ul>
          <p className="text-sm leading-6 text-muted-foreground">
            {
              "We collect only the information needed to operate, secure, and improve the service. Some information is provided by you, while technical data may be created automatically when the application runs."
            }
          </p>
        </ArticleSubParagraphContent>
      </ArticleSubParagraph>
      <ArticleSubParagraph id="privacy-use" separatorFullWidth>
        <ArticleSubParagraphHeader>
          {"2. How we use your information"}
        </ArticleSubParagraphHeader>
        <ArticleSubParagraphContent>
          <ul className="list-disc ml-6 mt-2 space-y-1">
            <li>{"To provide and maintain the Notegic service"}</li>
            <li>{"To improve the user experience"}</li>
            <li>{"To communicate with you about updates"}</li>
          </ul>
          <p className="text-sm leading-6 text-muted-foreground">
            {
              "This includes authenticating your account, saving and synchronizing content, supporting collaboration, diagnosing failures, preventing abuse, and understanding which parts of the product need improvement. We do not use your private notes as advertising material."
            }
          </p>
        </ArticleSubParagraphContent>
      </ArticleSubParagraph>
      <ArticleSubParagraph id="privacy-sharing" separatorFullWidth>
        <ArticleSubParagraphHeader>
          {"3. Data sharing"}
        </ArticleSubParagraphHeader>
        <ArticleSubParagraphContent>
          <p>
            {
              "We do not sell your personal data. We may share data with third-party services, such as authentication providers, only as needed to operate the service."
            }
          </p>
          <p className="text-sm leading-6 text-muted-foreground">
            {
              "Service providers may process information on our behalf for hosting, authentication, storage, email delivery, analytics, or security. They receive access appropriate to their task and are expected to protect the information. We may also disclose information when required by law or to protect the service and its users."
            }
          </p>
        </ArticleSubParagraphContent>
      </ArticleSubParagraph>
      <ArticleSubParagraph id="privacy-retention" separatorFullWidth>
        <ArticleSubParagraphHeader>
          {"4. Data retention"}
        </ArticleSubParagraphHeader>
        <ArticleSubParagraphContent>
          <p>
            {
              "We retain your data while your account is active. You may request deletion at any time by contacting us."
            }
          </p>
          <p className="text-sm leading-6 text-muted-foreground">
            {
              "When you delete content or close your account, we will remove it from active systems within a reasonable period, subject to backups, fraud prevention, dispute resolution, and other legal obligations. Backups may remain for a limited time before they are safely overwritten."
            }
          </p>
        </ArticleSubParagraphContent>
      </ArticleSubParagraph>
      <ArticleSubParagraph id="privacy-rights" separatorFullWidth>
        <ArticleSubParagraphHeader>
          {"5. Your rights"}
        </ArticleSubParagraphHeader>
        <ArticleSubParagraphContent>
          <p>
            {
              "You may access, correct, or delete your personal data. Contact us at "
            }
            <a href={"mailto:" + contactEmail} className="underline">
              {contactEmail}
            </a>
            {"."}
          </p>
          <p className="text-sm leading-6 text-muted-foreground">
            {
              "Depending on applicable law, you may also ask us to explain how your data is used, object to certain processing, request a portable copy, or withdraw consent where consent is the basis. We may ask you to verify your identity before fulfilling a request, and some requests may be limited by legal or security obligations. Contact us with the account email and a clear description of what you want changed."
            }
          </p>
        </ArticleSubParagraphContent>
      </ArticleSubParagraph>
      <ArticleSubParagraph id="privacy-cookies" separatorFullWidth>
        <ArticleSubParagraphHeader>{"6. Cookies"}</ArticleSubParagraphHeader>
        <ArticleSubParagraphContent>
          <p>
            {
              "We use cookies and local storage to maintain your session and preferences."
            }
          </p>
          <p className="text-sm leading-6 text-muted-foreground">
            {
              "These technologies help keep you signed in, remember display preferences, protect requests, and support offline or local-first features. You can clear or block them in your browser, but some parts of Notegic may no longer work correctly."
            }
          </p>
        </ArticleSubParagraphContent>
      </ArticleSubParagraph>
      <ArticleSubParagraph id="privacy-changes" separatorFullWidth>
        <ArticleSubParagraphHeader>
          {"7. Changes to this policy"}
        </ArticleSubParagraphHeader>
        <ArticleSubParagraphContent>
          <p>
            {
              "We may update this policy from time to time. We will notify you of significant changes in the application."
            }
          </p>
          <p className="text-sm leading-6 text-muted-foreground">
            {
              "The effective date at the top of this page identifies the current version. If a change materially affects your rights or how we handle information, we will provide a more prominent notice and, where required, ask for consent."
            }
          </p>
        </ArticleSubParagraphContent>
      </ArticleSubParagraph>
      <ArticleSubParagraph id="privacy-contact" separatorFullWidth>
        <ArticleSubParagraphHeader>{"8. Contact us"}</ArticleSubParagraphHeader>
        <ArticleSubParagraphContent>
          <p>
            {"If you have questions, contact us at "}
            <a href={"mailto:" + contactEmail} className="underline">
              {contactEmail}
            </a>
            {"."}
          </p>
          <p className="text-sm leading-6 text-muted-foreground">
            {
              "Please use an email address associated with your account when asking about personal data. We aim to respond within a reasonable period and may ask for additional information to confirm that the request belongs to you."
            }
          </p>
          <p>
            <ArticleLink
              className="inline-flex items-center gap-1.5 text-sm font-medium text-primary underline underline-offset-4 hover:text-primary/80"
              href="/eula"
            >
              {"View the End User License Agreement (EULA)"}
              <ExternalLinkIcon className="size-3.5" />
            </ArticleLink>
          </p>
        </ArticleSubParagraphContent>
      </ArticleSubParagraph>
    </>
  );
};
export default PrivacyPolicyContent;
