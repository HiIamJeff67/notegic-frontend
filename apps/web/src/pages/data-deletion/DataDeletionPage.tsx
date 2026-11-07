import { Article, ArticleContent } from "@/components/commons/Article/Article";
import DataDeletion from "@/pages/document/data-deletion/DataDeletion";

export default function DataDeletionPage() {
  return (
    <div className="h-svh min-h-0 overflow-hidden bg-canvas">
      <Article>
        <ArticleContent className="max-w-full md:max-w-4xl md:[--article-reading-width:var(--container-2xl)] xl:max-w-6xl xl:[--article-reading-width:var(--container-4xl)]">
          <DataDeletion standalone />
        </ArticleContent>
      </Article>
    </div>
  );
}
