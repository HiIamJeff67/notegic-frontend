import { Fragment, useRef } from "react";
import { useTranslation } from "react-i18next";
import {
  Article,
  ArticleContent,
  ArticleDisplayProvider,
  type ArticleNavigationItem,
  ArticleParagraph,
  ArticleParagraphContent,
  ArticleParagraphHeader,
  ArticleParagraphSeparator,
  ArticleSidebar,
} from "@/components/commons/Article/Article";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useAppRouterActions } from "@/hooks/useAppRouter";

const domainTutorials = [
  {
    id: "root-shelves",
    key: "rootShelves",
  },
  {
    id: "sub-shelves",
    key: "subShelves",
  },
  {
    id: "materials",
    key: "materials",
  },
  {
    id: "block-packs",
    key: "blockPacks",
  },
  {
    id: "blocks",
    key: "blocks",
  },
  {
    id: "stations",
    key: "stations",
  },
  {
    id: "routines",
    key: "routines",
  },
  {
    id: "routine-tasks",
    key: "routineTasks",
  },
  {
    id: "routine-tags",
    key: "routineTags",
  },
] as const;

const navigationKeys = [
  {
    id: "tutorial",
    titleKey: "navigation.overview",
    descriptionKey: "navigation.overviewDescription",
    weight: 5,
  },
  {
    id: "api-keys",
    titleKey: "navigation.apiKeys",
    descriptionKey: "navigation.apiKeysDescription",
    weight: 5,
  },
  {
    id: "api-key-management",
    titleKey: "navigation.keyManagement",
    descriptionKey: "navigation.keyManagementDescription",
    weight: 4,
  },
  {
    id: "notegic-model",
    titleKey: "navigation.model",
    descriptionKey: "navigation.modelDescription",
    weight: 5,
  },
  ...domainTutorials.map(domain => ({
    id: domain.id,
    titleKey: `domains.${domain.key}.title`,
    descriptionKey: `domains.${domain.key}.summary`,
    weight: 3 as const,
  })),
  {
    id: "integration-patterns",
    titleKey: "navigation.integrationPatterns",
    descriptionKey: "navigation.integrationPatternsDescription",
    weight: 4,
  },
  {
    id: "q-and-a",
    titleKey: "navigation.qa",
    descriptionKey: "navigation.qaDescription",
    weight: 4,
  },
] as const;

const tutorialQuestionKeys = [
  {
    key: "blockPack",
  },
  {
    key: "apiKeyStorage",
  },
  {
    key: "separateEnvironments",
  },
  {
    key: "shelfDifference",
  },
  {
    key: "station",
  },
  {
    key: "routineDifference",
  },
  {
    key: "routineQuota",
  },
  {
    key: "leakedApiKey",
  },
] as const;

const TutorialPage = () => {
  const { t } = useTranslation();
  const router = useAppRouterActions();
  const title = t("workspace.navigation.tutorial");
  const articleRef = useRef<HTMLElement>(null);
  const translateTutorial = (
    key: string,
    options?: Record<string, unknown>
  ): string => t(`tutorial.${key}` as never, options) as string;
  const navigationItems = navigationKeys.map(item => ({
    id: item.id,
    title: translateTutorial(item.titleKey),
    description: translateTutorial(item.descriptionKey),
    weight: item.weight,
  })) satisfies ArticleNavigationItem[];
  const headerLinks = [
    { label: translateTutorial("navigation.home"), href: "/" },
    { label: translateTutorial("navigation.document"), href: "/document" },
  ];

  return (
    <div className="h-svh min-h-0 overflow-hidden bg-canvas">
      <ArticleDisplayProvider
        mode="pagination"
        initialPageId="tutorial"
        headerLinks={headerLinks}
      >
        <div className="flex h-full min-h-0">
          <ArticleSidebar
            items={navigationItems}
            scrollContainerRef={articleRef}
          />
          <Article
            scrollRef={articleRef}
            mode="pagination"
            initialPageId="tutorial"
            headerLinks={headerLinks}
            className="min-w-0 flex-1 pt-10 lg:pt-0"
          >
            <ArticleContent>
              <ArticleParagraph id="tutorial">
                <ArticleParagraphHeader>
                  <h1 className="text-3xl font-semibold tracking-tight">
                    {title}
                  </h1>
                  <p className="mt-3 text-sm leading-6 text-muted-foreground">
                    {translateTutorial("overview.subtitle")}
                  </p>
                </ArticleParagraphHeader>
                <ArticleParagraphContent>
                  <p>{translateTutorial("overview.intro")}</p>
                </ArticleParagraphContent>
              </ArticleParagraph>

              <ArticleParagraphSeparator />

              <ArticleParagraph id="api-keys">
                <ArticleParagraphHeader>
                  <h2 className="text-2xl font-semibold tracking-tight">
                    {translateTutorial("apiKeys.title")}
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    {translateTutorial("apiKeys.subtitle")}
                  </p>
                </ArticleParagraphHeader>
                <ArticleParagraphContent>
                  <p>{translateTutorial("apiKeys.intro")}</p>
                  <ol className="list-decimal space-y-2 pl-5">
                    {[1, 2, 3, 4].map(step => (
                      <li key={step}>
                        {translateTutorial(`apiKeys.step${step}`)}
                        {step === 4 && (
                          <>
                            <code className="mx-1 rounded bg-muted px-1.5 py-0.5 font-mono text-xs">
                              X-API-Key
                            </code>
                            {translateTutorial("apiKeys.step4Suffix")}
                          </>
                        )}
                      </li>
                    ))}
                  </ol>
                  <pre className="overflow-x-auto rounded-sm border border-border/70 bg-background p-4 font-mono text-xs leading-6">
                    <code>
                      {
                        "curl --request GET \\\n  --header 'X-API-Key: nzy_<secret>' \\\n  https://api.notegic.com/v1/root-shelves"
                      }
                    </code>
                  </pre>
                </ArticleParagraphContent>
              </ArticleParagraph>

              <ArticleParagraphSeparator />

              <ArticleParagraph id="api-key-management">
                <ArticleParagraphHeader>
                  <h2 className="text-2xl font-semibold tracking-tight">
                    {translateTutorial("keyManagement.title")}
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    {translateTutorial("keyManagement.subtitle")}
                  </p>
                </ArticleParagraphHeader>
                <ArticleParagraphContent>
                  <ul className="list-disc space-y-2 pl-5">
                    {[1, 2, 3, 4].map(item => (
                      <li key={item}>
                        {translateTutorial(`keyManagement.item${item}`)}
                      </li>
                    ))}
                  </ul>
                </ArticleParagraphContent>
              </ArticleParagraph>

              <ArticleParagraphSeparator />

              <ArticleParagraph id="notegic-model">
                <ArticleParagraphHeader>
                  <h2 className="text-2xl font-semibold tracking-tight">
                    {translateTutorial("model.title")}
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    {translateTutorial("model.subtitle")}
                  </p>
                </ArticleParagraphHeader>
                <ArticleParagraphContent>
                  <pre className="overflow-x-auto rounded-sm border border-border/70 bg-background p-4 font-mono text-xs leading-6">
                    <code>{translateTutorial("model.diagram")}</code>
                  </pre>
                  <p>
                    {translateTutorial("model.intro")}{" "}
                    <a
                      className="underline"
                      href="/document#gateway"
                      onClick={event => {
                        event.preventDefault();
                        router.push("/document#gateway");
                      }}
                    >
                      {translateTutorial("model.documentLink")}
                    </a>
                    .
                  </p>
                </ArticleParagraphContent>
              </ArticleParagraph>

              {domainTutorials.map(domain => {
                const domainPath = `domains.${domain.key}`;
                const domainTitle = translateTutorial(`${domainPath}.title`);
                return (
                  <Fragment key={domain.id}>
                    <ArticleParagraphSeparator />
                    <ArticleParagraph id={domain.id}>
                      <ArticleParagraphHeader>
                        <h2 className="text-2xl font-semibold tracking-tight">
                          {domainTitle}
                        </h2>
                        <p className="mt-2 text-sm leading-6 text-muted-foreground">
                          {translateTutorial(`${domainPath}.summary`)}
                        </p>
                      </ArticleParagraphHeader>
                      <ArticleParagraphContent>
                        <p>{translateTutorial(`${domainPath}.details`)}</p>
                        <p className="font-mono text-xs leading-6 text-muted-foreground">
                          {translateTutorial("domains.structure")}:{" "}
                          {translateTutorial(`${domainPath}.structure`)}
                        </p>
                        <a
                          className="underline"
                          href={`/document#gateway-${domain.id}`}
                          onClick={event => {
                            event.preventDefault();
                            router.push(`/document#gateway-${domain.id}`);
                          }}
                        >
                          {translateTutorial("domains.viewApiOperations", {
                            title: domainTitle,
                          })}
                        </a>
                      </ArticleParagraphContent>
                    </ArticleParagraph>
                  </Fragment>
                );
              })}

              <ArticleParagraphSeparator />

              <ArticleParagraph id="integration-patterns">
                <ArticleParagraphHeader>
                  <h2 className="text-2xl font-semibold tracking-tight">
                    {translateTutorial("integration.title")}
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    {translateTutorial("integration.subtitle")}
                  </p>
                </ArticleParagraphHeader>
                <ArticleParagraphContent>
                  <p>{translateTutorial("integration.paragraph1")}</p>
                  <p>{translateTutorial("integration.paragraph2")}</p>
                </ArticleParagraphContent>
              </ArticleParagraph>

              <ArticleParagraphSeparator />

              <ArticleParagraph id="q-and-a">
                <ArticleParagraphHeader>
                  <h2 className="text-2xl font-semibold tracking-tight">
                    {translateTutorial("qa.title")}
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    {translateTutorial("qa.subtitle")}
                  </p>
                </ArticleParagraphHeader>
                <ArticleParagraphContent>
                  <Accordion type="single" collapsible className="w-full">
                    {tutorialQuestionKeys.map((item, index) => (
                      <AccordionItem key={item.key} value={`question-${index}`}>
                        <AccordionTrigger>
                          {translateTutorial(
                            `qa.questions.${item.key}.question`
                          )}
                        </AccordionTrigger>
                        <AccordionContent className="leading-6 text-muted-foreground">
                          {translateTutorial(`qa.questions.${item.key}.answer`)}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </ArticleParagraphContent>
              </ArticleParagraph>
            </ArticleContent>
          </Article>
        </div>
      </ArticleDisplayProvider>
    </div>
  );
};

export default TutorialPage;
