import { BookOpenIcon } from "lucide-react";
import {
  ArticleParagraph,
  ArticleParagraphContent,
  ArticleParagraphHeader,
} from "@/components/commons/Article/Article";
import APIKeys, { apiKeysNavigation } from "./website/APIKeys";
import Integration, { integrationNavigation } from "./website/Integration";
import KeyManagement, {
  keyManagementNavigation,
} from "./website/KeyManagement";
import Questions, { questionsNavigation } from "./website/Questions";
import Resources, { resourceNavigation } from "./website/Resources";
import Structure, { structureNavigation } from "./website/Structure";

export const websiteNavigation = {
  id: "website",
  title: "Website",
  description: "Guides to Notegic resources, API keys, and integrations.",
  weight: 5 as const,
  icon: BookOpenIcon,
  children: [
    apiKeysNavigation,
    keyManagementNavigation,
    structureNavigation,
    ...resourceNavigation,
    integrationNavigation,
    questionsNavigation,
  ],
};

const Website = () => (
  <ArticleParagraph
    id={websiteNavigation.id}
    className="mx-auto max-w-full md:max-w-2xl xl:max-w-4xl"
  >
    <ArticleParagraphHeader>
      <h2 className="text-2xl font-semibold tracking-tight">Website</h2>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">
        A practical guide to API-key integrations and the Notegic resource
        model.
      </p>
    </ArticleParagraphHeader>
    <ArticleParagraphContent>
      <p>
        Start with the API key workflow, then use the Notegic structure guide to
        understand which resource family your integration should call.
      </p>
      <APIKeys />
      <KeyManagement />
      <Structure />
      <Resources />
      <Integration />
      <Questions />
    </ArticleParagraphContent>
  </ArticleParagraph>
);

export default Website;
