import {
  ArticleSubParagraph,
  ArticleSubParagraphContent,
  ArticleSubParagraphHeader,
} from "@/components/commons/Article/Article";

export const integrationNavigation = {
  id: "integration-patterns",
  title: "Integration patterns",
  description: "Keep API keys on the server and call the public gateway.",
  weight: 4 as const,
} as const;
const Integration = () => {
  return (
    <ArticleSubParagraph id={integrationNavigation.id} separatorFullWidth>
      <ArticleSubParagraphHeader level={0}>
        Integration patterns
      </ArticleSubParagraphHeader>
      <ArticleSubParagraphContent level={1}>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Keep API keys on the server and call the public gateway.
        </p>
        <p>
          Keep the API key on your trusted server or in a CLI secret manager.
          Call the public API and expose only the data your client needs.
        </p>
        <p>
          Do not ask users for their Notegic password. Keep API keys out of
          browser storage, frontend code, URLs, and logs. Explain which data
          your integration accesses.
        </p>
      </ArticleSubParagraphContent>
    </ArticleSubParagraph>
  );
};
export default Integration;
