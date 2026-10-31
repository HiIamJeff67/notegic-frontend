import { ShieldIcon } from "lucide-react";
import {
  ArticleParagraph,
  ArticleParagraphContent,
  ArticleParagraphHeader,
} from "@/components/commons/Article/Article";
import { privacySections } from "./generated";
import PrivacyPolicyContent from "./PrivacyPolicyContent";

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
      </ArticleParagraphHeader>
      <ArticleParagraphContent>
        <div lang="en">
          <PrivacyPolicyContent />
        </div>
      </ArticleParagraphContent>
    </ArticleParagraph>
  );
};

export default PrivacyPolicy;
