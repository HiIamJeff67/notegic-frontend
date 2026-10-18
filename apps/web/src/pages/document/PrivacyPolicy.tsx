import { ShieldIcon } from "lucide-react";
import {
  ArticleParagraph,
  ArticleParagraphContent,
  ArticleParagraphHeader,
} from "@/components/commons/Article/Article";
import { PrivacyPolicySections } from "@/pages/privacy-policy/PrivacyPolicyPage";

const privacySections = [
  ["privacy-collection", "Information we collect"],
  ["privacy-use", "How we use information"],
  ["privacy-sharing", "Information sharing"],
  ["privacy-retention", "Data retention"],
  ["privacy-rights", "Your rights"],
  ["privacy-cookies", "Cookies"],
  ["privacy-changes", "Policy changes"],
  ["privacy-contact", "Contact"],
].map(([id, title]) => ({
  id,
  title,
  description: title,
  weight: 3 as const,
}));

export const privacyPolicyNavigation = {
  id: "privacy-policy",
  title: "Privacy and policy",
  description: "How Notegic handles account data and user rights.",
  weight: 4 as const,
  icon: ShieldIcon,
  children: privacySections,
  command: { layout: "flat" as const },
} as const;

const PrivacyPolicy = () => {
  return (
    <ArticleParagraph
      id={privacyPolicyNavigation.id}
      className="mx-auto max-w-full md:max-w-2xl xl:max-w-4xl"
    >
      <ArticleParagraphHeader>
        <h2 className="text-2xl font-semibold tracking-tight">
          {privacyPolicyNavigation.title}
        </h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Read how Notegic handles your information. Review a third-party
          integration's privacy policy before giving it access to your data.
        </p>
      </ArticleParagraphHeader>
      <ArticleParagraphContent>
        <PrivacyPolicySections separatorFullWidth />
      </ArticleParagraphContent>
    </ArticleParagraph>
  );
};

export default PrivacyPolicy;
