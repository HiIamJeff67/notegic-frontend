import { Fragment } from "react";
import { useTranslation } from "react-i18next";
import {
  Article,
  ArticleContent,
  ArticleNavigationBar,
  type ArticleNavigationItem,
  ArticleParagraph,
  ArticleParagraphContent,
  ArticleParagraphHeader,
  ArticleParagraphSeparator,
  ArticleSubParagraph,
  ArticleSubParagraphContent,
  ArticleSubParagraphHeader,
} from "@/components/commons/Article/Article";

type PlaygroundArticle = ArticleNavigationItem & {
  eyebrow: string;
};

const ArticleSubsections = ({ items }: { items: ArticleNavigationItem[] }) => (
  <>
    {items.map(item => (
      <ArticleSubParagraph key={item.id} id={item.id}>
        <ArticleSubParagraphHeader className="text-foreground">
          {item.title}
        </ArticleSubParagraphHeader>
        <ArticleSubParagraphContent className="text-muted-foreground">
          <p>{item.description}</p>
          {item.children && item.children.length > 0 && (
            <ArticleSubsections items={item.children} />
          )}
        </ArticleSubParagraphContent>
      </ArticleSubParagraph>
    ))}
  </>
);

const PlaygroundArticleParagraph = ({ item }: { item: PlaygroundArticle }) => (
  <ArticleParagraph id={item.id}>
    <ArticleParagraphHeader>
      <p className="text-sm font-medium text-muted-foreground">
        {item.eyebrow}
      </p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight">
        {item.title}
      </h1>
      <p className="mt-3 text-base leading-7 text-muted-foreground">
        {item.description}
      </p>
    </ArticleParagraphHeader>
    <ArticleParagraphContent>
      {item.children && <ArticleSubsections items={item.children} />}
    </ArticleParagraphContent>
  </ArticleParagraph>
);

const PlaygroundPage = () => {
  const { t } = useTranslation();
  const articleItems: PlaygroundArticle[] = [
    {
      id: "profile",
      title: t("navigation.profile"),
      eyebrow: t("settings.accountSettings"),
      description: t("workspace.playground.profileDescription"),
      weight: 2,
      children: [
        {
          id: "profile-avatar",
          title: t("settingsPage.account.personal.avatar"),
          description: t("workspace.playground.avatarDescription"),
          weight: 1,
        },
        {
          id: "profile-display-name",
          title: t("settingsPage.account.fields.displayName"),
          description: t("workspace.playground.displayNameDescription"),
          weight: 2,
        },
      ],
    },
    {
      id: "security",
      title: t("settingsPage.account.security.title"),
      eyebrow: t("settings.accountSettings"),
      description: t("settingsPage.account.security.description"),
      weight: 4,
      children: [
        {
          id: "security-password",
          title: t("auth.password"),
          description: t(
            "settingsPage.account.modification.changePasswordDescription"
          ),
          weight: 2,
        },
        {
          id: "security-two-factor",
          title: t("workspace.playground.twoFactor"),
          description: t("workspace.playground.twoFactorDescription"),
          weight: 3,
        },
        {
          id: "security-recovery",
          title: t("settingsPage.account.binding.title"),
          description: t("settingsPage.account.binding.description"),
          weight: 2,
        },
      ],
    },
    {
      id: "appearance",
      title: t("settingsPage.preferences.appearance.title"),
      eyebrow: t("settings.preferences"),
      description: t("settingsPage.preferences.appearance.description"),
      weight: 5,
      children: [
        {
          id: "appearance-theme",
          title: t("settingsPage.preferences.appearance.theme"),
          description: t(
            "settingsPage.preferences.appearance.themeDescription"
          ),
          weight: 2,
        },
        {
          id: "appearance-density",
          title: t("settingsPage.preferences.appearance.density"),
          description: t(
            "settingsPage.preferences.appearance.densityDescription"
          ),
          weight: 3,
        },
        {
          id: "appearance-editor",
          title: t("settingsPage.preferences.editor.title"),
          description: t("settingsPage.preferences.editor.description"),
          weight: 3,
          children: [
            {
              id: "appearance-editor-motion",
              title: t("settingsPage.preferences.appearance.reduceMotion"),
              description: t(
                "settingsPage.preferences.appearance.reduceMotionDescription"
              ),
              weight: 1,
            },
          ],
        },
      ],
    },
  ];

  return (
    <div className="h-full min-h-0 bg-canvas px-4 py-6 sm:px-6 lg:px-3">
      <Article>
        <ArticleNavigationBar items={articleItems} />
        <ArticleContent>
          {articleItems.map((item, index) => (
            <Fragment key={item.id}>
              {index > 0 && <ArticleParagraphSeparator />}
              <PlaygroundArticleParagraph item={item} />
            </Fragment>
          ))}
        </ArticleContent>
      </Article>
    </div>
  );
};

export default PlaygroundPage;
