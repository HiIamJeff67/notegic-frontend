import {
  ArticleSubParagraph,
  ArticleSubParagraphContent,
  ArticleSubParagraphHeader,
} from "@/components/commons/Article/Article";
export const apiKeysNavigation = {
  id: "api-keys",
  title: "API keys",
  description: "Generate and safely use an integration key.",
  weight: 5 as const,
} as const;
const APIKeys = () => {
  return (
    <ArticleSubParagraph id={apiKeysNavigation.id} separatorFullWidth>
      <ArticleSubParagraphHeader level={0}>
        Generate your first API key
      </ArticleSubParagraphHeader>
      <ArticleSubParagraphContent level={1}>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          API keys authenticate server-to-server calls to the public API
          Gateway.
        </p>
        <p>
          An API key is not a replacement for the browser session and must never
          be shipped to frontend code.
        </p>
        <ol className="list-decimal space-y-2 pl-5">
          <li>Open Account settings and select API keys.</li>
          <li>Create a named key for one integration or environment.</li>
          <li>
            Copy the complete secret immediately; it is displayed only once.
          </li>
          <li>
            Store it in a server secret manager and send it as{" "}
            <code className="mx-1 rounded bg-muted px-1.5 py-0.5 font-mono text-xs">
              X-API-Key
            </code>{" "}
            on each request.
          </li>
        </ol>
        <pre className="overflow-x-auto rounded-sm border border-border/70 bg-background p-4 font-mono text-xs leading-6">
          <code>
            {
              "curl --request GET \\\n  --header 'X-API-Key: nzy_<secret>' \\\n  https://api.notegic.com/v1/root-shelves"
            }
          </code>
        </pre>
      </ArticleSubParagraphContent>
    </ArticleSubParagraph>
  );
};
export default APIKeys;
