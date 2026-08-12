import { useTranslation } from "react-i18next";
import {
  Article,
  ArticleContent,
  type ArticleNavigationItem,
  ArticleNavigationSidebar,
  ArticleParagraph,
  ArticleParagraphContent,
  ArticleParagraphHeader,
} from "@/components/commons/Article/Article";

const TutorialPage = () => {
  const { t } = useTranslation();
  const title = t("workspace.navigation.tutorial");
  const description = t("workspace.pages.tutorialComingSoon");
  const navigationItems = [
    {
      id: "tutorial",
      title,
      description,
      weight: 3,
    },
  ] satisfies ArticleNavigationItem[];

  return (
    <div className="h-svh min-h-0 overflow-hidden bg-canvas px-4 py-6 sm:px-6 lg:px-3">
      <Article>
        <ArticleNavigationSidebar items={navigationItems} />
        <ArticleContent>
          <ArticleParagraph id="tutorial">
            <ArticleParagraphHeader>
              <p className="font-mono text-[11px] tracking-[0.16em] text-muted-foreground">
                Notezy
              </p>
              <h1 className="mt-3 text-3xl font-semibold tracking-tight">
                {title}
              </h1>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                {description}
              </p>
            </ArticleParagraphHeader>
            <ArticleParagraphContent />
          </ArticleParagraph>
        </ArticleContent>
      </Article>
    </div>
  );
};

export default TutorialPage;
