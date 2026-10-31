import { GitBranchIcon } from "lucide-react";
import {
  ArticleParagraph,
  ArticleParagraphContent,
  ArticleParagraphHeader,
} from "@/components/commons/Article/Article";
import VersionsContent, { versionSections } from "./VersionsContent";

export const versionsNavigation = {
  id: "versions",
  title: "Versions",
  description: "Released features and the direction of the next version.",
  weight: 4 as const,
  icon: GitBranchIcon,
  children: versionSections.map(section => section.navigation),
} as const;

const Versions = () => {
  return (
    <ArticleParagraph
      id={versionsNavigation.id}
      className="mx-auto max-w-full md:max-w-2xl xl:max-w-4xl"
    >
      <ArticleParagraphHeader>
        <h2 className="text-2xl font-semibold tracking-tight">
          {versionsNavigation.title}
        </h2>
      </ArticleParagraphHeader>
      <ArticleParagraphContent>
        <VersionsContent />
      </ArticleParagraphContent>
    </ArticleParagraph>
  );
};

export default Versions;
