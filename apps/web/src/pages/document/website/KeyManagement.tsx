import {
  ArticleSubParagraph,
  ArticleSubParagraphContent,
  ArticleSubParagraphHeader,
} from "@/components/commons/Article/Article";

export const keyManagementNavigation = {
  id: "api-key-management",
  title: "Key management",
  description: "Review, rotate, and revoke keys.",
  weight: 4 as const,
} as const;
const KeyManagement = () => {
  return (
    <ArticleSubParagraph id={keyManagementNavigation.id} separatorFullWidth>
      <ArticleSubParagraphHeader level={0}>
        Manage and revoke keys
      </ArticleSubParagraphHeader>
      <ArticleSubParagraphContent level={1}>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Key metadata is visible after creation, but the secret is never
          returned again.
        </p>
        <ul className="list-disc space-y-2 pl-5">
          <li>
            Use separate keys for production and development environments.
          </li>
          <li>Rotate a key when an owner or environment changes.</li>
          <li>Revoke immediately if a secret may have leaked.</li>
          <li>Keep raw secrets out of logs, URLs, and metrics.</li>
        </ul>
      </ArticleSubParagraphContent>
    </ArticleSubParagraph>
  );
};
export default KeyManagement;
