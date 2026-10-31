// Generated from apps/web/src/pages/document/versions/sources/versions.md; run npm run generate:document.

import { cn } from "@shared/lib/className/cn";
import {
  ArticleSubParagraph,
  ArticleSubParagraphContent,
  ArticleSubParagraphHeader,
} from "@/components/commons/Article/Article";
import { VersionCard } from "@/components/commons/VersionCard/VersionCard";
import { versionRoadmap } from "./generated";

export const versionSections = versionRoadmap.map(version => ({
  version,
  navigation: {
    id: "version-" + version.version.replaceAll(".", "-"),
    title: "v" + version.version,
    description: version.description,
    weight: 3 as const,
    badge: (
      <span
        className={cn(
          "shrink-0 rounded-full px-2 py-0.5 font-sans text-[10px] font-medium leading-4",
          version.status === "next"
            ? "bg-primary/10 text-primary"
            : "bg-muted text-muted-foreground"
        )}
      >
        {version.label}
      </span>
    ),
  },
}));

const VersionsContent = () => (
  <div className="space-y-0">
    {versionSections.map(({ version, navigation }) => (
      <ArticleSubParagraph
        id={navigation.id}
        key={navigation.id}
        separatorFullWidth
      >
        <ArticleSubParagraphHeader
          level={0}
          className="flex flex-wrap items-center gap-3 font-mono text-lg"
        >
          <span>{navigation.title}</span>
          {navigation.badge}
        </ArticleSubParagraphHeader>
        <ArticleSubParagraphContent level={1}>
          <VersionCard version={version} />
        </ArticleSubParagraphContent>
      </ArticleSubParagraph>
    ))}
  </div>
);
export default VersionsContent;
