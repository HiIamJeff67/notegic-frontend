import { cn } from "@shared/util/utils";
import { GitBranchIcon } from "lucide-react";
import {
  ArticleParagraph,
  ArticleParagraphContent,
  ArticleParagraphHeader,
  ArticleSubParagraph,
  ArticleSubParagraphContent,
  ArticleSubParagraphHeader,
} from "@/components/commons/Article/Article";
import { VersionCard } from "@/components/commons/VersionCard/VersionCard";
import { versionRoadmap } from "@/components/commons/VersionCard/versions";

const versionSections = versionRoadmap.map(version => ({
  version,
  navigation: {
    id: `version-${version.version.replaceAll(".", "-")}`,
    title: `v${version.version}`,
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
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          See what is available now and what we are working toward next.
        </p>
      </ArticleParagraphHeader>
      <ArticleParagraphContent>
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
      </ArticleParagraphContent>
    </ArticleParagraph>
  );
};

export default Versions;
