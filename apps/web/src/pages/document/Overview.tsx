import { BookOpenIcon } from "lucide-react";
import {
  ArticleLink,
  ArticleParagraph,
  ArticleParagraphContent,
  ArticleParagraphHeader,
} from "@/components/commons/Article/Article";

export const overviewNavigation = {
  id: "overview",
  title: "Overview",
  description: "Website guides and the published API contract.",
  weight: 5 as const,
  icon: BookOpenIcon,
} as const;

const Overview = ({
  operationCount,
  domainCount,
}: {
  operationCount: number;
  domainCount: number;
}) => {
  return (
    <ArticleParagraph
      id={overviewNavigation.id}
      className="mx-auto max-w-full md:max-w-2xl xl:max-w-4xl"
    >
      <ArticleParagraphHeader>
        <h1 className="text-3xl font-semibold tracking-tight">Document</h1>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          Guides for using Notegic and building integrations with its public
          API.
        </p>
      </ArticleParagraphHeader>
      <ArticleParagraphContent>
        <div className="grid gap-3 sm:grid-cols-3">
          {[
            [String(operationCount), "API operations"],
            ["OpenAPI 3.1", "Public HTTP contract"],
            [String(domainCount), "API-key resource domains"],
          ].map(([value, label]) => (
            <div
              className="rounded-sm border border-border/70 bg-background p-4"
              key={label}
            >
              <p className="font-mono text-lg font-semibold text-foreground">
                {value}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">{label}</p>
            </div>
          ))}
        </div>
        <p>
          Build server-side integrations with shelves, documents, stations, and
          routines. Start with an API key, then use the resource reference to
          choose an operation.
        </p>
        <p>
          <ArticleLink href="/document#website">
            Explore the Website guide
          </ArticleLink>
        </p>
      </ArticleParagraphContent>
    </ArticleParagraph>
  );
};

export default Overview;
