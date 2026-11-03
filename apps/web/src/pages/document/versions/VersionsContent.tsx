// Generated from apps/web/src/pages/document/versions/sources/versions.md; run npm run generate:document.

import { cn } from "@shared/lib/classname/cn";
import {
  ArticleSubParagraph,
  ArticleSubParagraphContent,
  ArticleSubParagraphHeader,
} from "@/components/commons/Article/Article";
import { VersionCard } from "@/components/commons/VersionCard/VersionCard";
import { Button } from "@/components/ui/button";
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

const VersionsContent = ({
  visiblePreviousCount,
  onShowMore,
  onShowAll,
  onShowLess,
}: {
  visiblePreviousCount: number;
  onShowMore: () => void;
  onShowAll: () => void;
  onShowLess: () => void;
}) => {
  const previousSections = versionSections.filter(
    section => section.version.status === "previous"
  );
  const visiblePreviousIds = new Set(
    previousSections
      .slice(0, visiblePreviousCount)
      .map(section => section.navigation.id)
  );
  const lastVisibleId = versionSections
    .filter(
      section =>
        section.version.status !== "previous" ||
        visiblePreviousIds.has(section.navigation.id)
    )
    .at(-1)?.navigation.id;
  const previousIds = previousSections
    .map(section => section.navigation.id)
    .join(" ");
  return (
    <div className="space-y-0">
      {versionSections.map(({ version, navigation }) => (
        <ArticleSubParagraph
          id={navigation.id}
          key={navigation.id}
          separatorFullWidth
          className={
            version.status === "previous" &&
            !visiblePreviousIds.has(navigation.id)
              ? "hidden"
              : undefined
          }
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
            {previousSections.length > 0 && navigation.id === lastVisibleId && (
              <div
                role="group"
                aria-label="Previous versions"
                className="mt-5 flex flex-wrap justify-start gap-4"
              >
                {visiblePreviousCount === 0 ? (
                  <Button
                    id="versions-show-more"
                    type="button"
                    variant="link"
                    className="h-auto px-0 hover:text-primary/80"
                    aria-expanded={false}
                    aria-controls={previousIds}
                    onClick={onShowMore}
                  >
                    Show more
                  </Button>
                ) : (
                  <>
                    <Button
                      id="versions-show-all"
                      type="button"
                      variant="link"
                      className="h-auto px-0 hover:text-primary/80"
                      disabled={visiblePreviousCount >= previousSections.length}
                      aria-controls={previousIds}
                      onClick={onShowAll}
                    >
                      Show all
                    </Button>
                    <Button
                      id="versions-show-less"
                      type="button"
                      variant="link"
                      className="h-auto px-0 hover:text-primary/80"
                      aria-expanded={true}
                      aria-controls={previousIds}
                      onClick={onShowLess}
                    >
                      Show less
                    </Button>
                  </>
                )}
              </div>
            )}
          </ArticleSubParagraphContent>
        </ArticleSubParagraph>
      ))}
    </div>
  );
};
export default VersionsContent;
