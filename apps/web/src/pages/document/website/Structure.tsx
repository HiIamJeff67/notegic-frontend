import {
  ArticleLink,
  ArticleSubParagraph,
  ArticleSubParagraphContent,
  ArticleSubParagraphHeader,
} from "@/components/commons/Article/Article";
export const structureNavigation = {
  id: "notegic-model",
  title: "Notegic structure",
  description: "The resource hierarchy at a glance.",
  weight: 5 as const,
} as const;
const Structure = () => {
  return (
    <ArticleSubParagraph id={structureNavigation.id} separatorFullWidth>
      <ArticleSubParagraphHeader level={0}>
        Understand the Notegic structure
      </ArticleSubParagraphHeader>
      <ArticleSubParagraphContent level={1}>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Notegic separates organization, content, and execution so integrations
          can request only the resource family they need.
        </p>
        <pre className="overflow-x-auto rounded-sm border border-border/70 bg-background p-4 font-mono text-xs leading-6">
          <code>
            {
              "Root shelf\n├─ Sub shelves\n│  ├─ Materials\n│  └─ Block Packs\n│     └─ Blocks\n└─ Station\n   └─ Routine\n      ├─ Routine tasks\n      └─ Routine tags"
            }
          </code>
        </pre>
        <p>
          The sections below explain Notegic resources. Links to the{" "}
          <ArticleLink href="/document#gateway">API reference</ArticleLink>{" "}
          appear only where a public integration API is available.
        </p>
      </ArticleSubParagraphContent>
    </ArticleSubParagraph>
  );
};
export default Structure;
