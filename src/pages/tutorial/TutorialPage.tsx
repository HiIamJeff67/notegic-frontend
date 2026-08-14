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
import { useAppRouterActions } from "@/hooks/useAppRouter";

const domainTutorials = [
  {
    id: "root-shelves",
    title: "Root Shelves",
    summary:
      "A root shelf is the top-level workspace boundary for a collection of Notezy content.",
    structure: "Root shelf → sub shelves → Block Packs → blocks",
    details:
      "Use a root shelf when a team, project, or personal area needs its own members, ownership, and permissions. Keep broad access decisions at this level so every nested resource inherits a clear context.",
  },
  {
    id: "sub-shelves",
    title: "Sub Shelves",
    summary:
      "Sub shelves divide a root shelf into smaller, navigable areas without creating another top-level workspace.",
    structure: "Root shelf → sub shelf → ordered items",
    details:
      "Use sub shelves for projects, subjects, or stages of work. Their ordering and traversal endpoints let a client render the same hierarchy users see in Notezy.",
  },
  {
    id: "materials",
    title: "Materials",
    summary:
      "Materials are source files and references that support the content stored in a shelf or document.",
    structure: "Material → metadata + content reference + parent location",
    details:
      "Treat materials as inputs rather than documents themselves. Keep their metadata stable, attach them to the appropriate parent, and use recovery endpoints when a user needs to restore one.",
  },
  {
    id: "block-packs",
    title: "Block Packs",
    summary:
      "A Block Pack is a collaborative document container made from one or more blocks.",
    structure: "Block Pack → ordered blocks → realtime editing session",
    details:
      "Use the Block Pack API for lifecycle and permissions. The separate private realtime ticket flow is responsible for collaborative editing; API keys should remain on your server.",
  },
  {
    id: "blocks",
    title: "Blocks",
    summary:
      "Blocks are the small content units that make up a Block Pack.",
    structure: "Block Pack → block id → content + ordering metadata",
    details:
      "Address blocks through their containing Block Pack when possible. This keeps authorization and ordering decisions tied to the document boundary.",
  },
  {
    id: "stations",
    title: "Stations",
    summary:
      "Stations are execution-oriented workspaces where routines and their resources come together.",
    structure: "Station → members + permissions + routine links",
    details:
      "Use a station to model where work runs. Manage membership and permission changes before creating automation that depends on the station.",
  },
  {
    id: "routines",
    title: "Routines",
    summary:
      "A routine describes a repeatable automation flow and its schedule.",
    structure: "Routine → schedule → routine tasks",
    details:
      "A routine is the definition, not a single execution. Keep the routine stable and use its task links and lifecycle operations to inspect or change the work it schedules.",
  },
  {
    id: "routine-tasks",
    title: "Routine Tasks",
    summary:
      "Routine tasks are executable steps created from a routine and claimed by the scheduler.",
    structure: "Routine → task payload → worker claim → result",
    details:
      "A task can remain idle until it is eligible to run. The monthly execution quota is consumed when the backend claims the task, so clients must not reject a task based on a local payload estimate.",
  },
  {
    id: "routine-tags",
    title: "Routine Tags",
    summary:
      "Routine tags are lightweight labels for grouping and finding routine tasks.",
    structure: "Tag → linked routine tasks → filtered task view",
    details:
      "Use tags for user-facing organization and filtering. They are independent resources, so deleting a tag should not be treated as deleting the tasks it labels.",
  },
] as const;

const navigationItems = [
  {
    id: "tutorial",
    title: "Tutorial overview",
    description: "API-key integrations and the Notezy resource model.",
    weight: 5,
  },
  {
    id: "api-keys",
    title: "API keys",
    description: "Generate and safely use an integration key.",
    weight: 5,
  },
  {
    id: "api-key-management",
    title: "Key management",
    description: "Review, rotate, and revoke keys.",
    weight: 4,
  },
  {
    id: "notezy-model",
    title: "Notezy structure",
    description: "The resource hierarchy at a glance.",
    weight: 5,
  },
  ...domainTutorials.map(domain => ({
    id: domain.id,
    title: domain.title,
    description: domain.summary,
    weight: 3 as const,
  })),
  {
    id: "integration-patterns",
    title: "Integration patterns",
    description: "Keep API keys on the server and call the public gateway.",
    weight: 4,
  },
] satisfies ArticleNavigationItem[];

const TutorialPage = () => {
  const { t } = useTranslation();
  const router = useAppRouterActions();
  const title = t("workspace.navigation.tutorial");
  const articleRef = useRef<HTMLElement>(null);

  return (
    <div className="h-svh min-h-0 overflow-hidden bg-canvas">
      <ArticleDisplayProvider
        mode="pagination"
        initialPageId="tutorial"
        headerLinks={[
          { label: "Home", href: "/" },
          { label: "Document", href: "/document" },
        ]}
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
            headerLinks={[
              { label: "Home", href: "/" },
              { label: "Document", href: "/document" },
            ]}
            className="min-w-0 flex-1"
          >
          <ArticleContent>
            <ArticleParagraph id="tutorial">
              <ArticleParagraphHeader>
                <p className="font-mono text-[11px] tracking-[0.16em] text-muted-foreground">
                  NOTEZY TUTORIAL
                </p>
                <h1 className="mt-3 text-3xl font-semibold tracking-tight">
                  {title}
                </h1>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">
                  A practical guide to API-key integrations and the Notezy
                  resource model.
                </p>
              </ArticleParagraphHeader>
              <ArticleParagraphContent>
                <p>
                  Start with the API key workflow, then use the Notezy structure
                  guide to understand which resource family your integration
                  should call.
                </p>
              </ArticleParagraphContent>
            </ArticleParagraph>

            <ArticleParagraphSeparator />

            <ArticleParagraph id="api-keys">
              <ArticleParagraphHeader>
                <h2 className="text-2xl font-semibold tracking-tight">
                  Generate your first API key
                </h2>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  API keys authenticate server-to-server calls to the public
                  API Gateway.
                </p>
              </ArticleParagraphHeader>
              <ArticleParagraphContent>
                <p>
                  An API key is not a replacement for the browser session and
                  must never be shipped to frontend code.
                </p>
                <ol className="list-decimal space-y-2 pl-5">
                  <li>Open Account settings and select API keys.</li>
                  <li>
                    Create a named key for one integration or environment.
                  </li>
                  <li>
                    Copy the complete secret immediately; it is displayed only
                    once.
                  </li>
                  <li>
                    Store it in a server secret manager and send it as
                    <code className="mx-1 rounded bg-muted px-1.5 py-0.5 font-mono text-xs">
                      X-API-Key
                    </code>
                    on each request.
                  </li>
                </ol>
                <pre className="overflow-x-auto rounded-sm border border-border/70 bg-background p-4 font-mono text-xs leading-6">
                  <code>
                    {"curl --request GET \\\n  --header 'X-API-Key: nzy_<secret>' \\\n  https://api.notezy.app/api/development/v1/root-shelves"}
                  </code>
                </pre>
              </ArticleParagraphContent>
            </ArticleParagraph>

            <ArticleParagraphSeparator />

            <ArticleParagraph id="api-key-management">
              <ArticleParagraphHeader>
                <h2 className="text-2xl font-semibold tracking-tight">
                  Manage and revoke keys
                </h2>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  Key metadata is visible after creation, but the secret is
                  never returned again.
                </p>
              </ArticleParagraphHeader>
              <ArticleParagraphContent>
                <ul className="list-disc space-y-2 pl-5">
                  <li>
                    Use separate keys for production and development
                    environments.
                  </li>
                  <li>
                    Rotate a key when an owner or environment changes.
                  </li>
                  <li>
                    Revoke immediately if a secret may have leaked.
                  </li>
                  <li>
                    Keep raw secrets out of logs, URLs, and metrics.
                  </li>
                </ul>
              </ArticleParagraphContent>
            </ArticleParagraph>

            <ArticleParagraphSeparator />

            <ArticleParagraph id="notezy-model">
              <ArticleParagraphHeader>
                <h2 className="text-2xl font-semibold tracking-tight">
                  Understand the Notezy structure
                </h2>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  Notezy separates organization, content, and execution so
                  integrations can request only the resource family they need.
                </p>
              </ArticleParagraphHeader>
              <ArticleParagraphContent>
                <pre className="overflow-x-auto rounded-sm border border-border/70 bg-background p-4 font-mono text-xs leading-6">
                  <code>
                    {"Root shelf\n├─ Sub shelves\n│  ├─ Materials\n│  └─ Block Packs\n│     └─ Blocks\n└─ Station\n   └─ Routine\n      ├─ Routine tasks\n      └─ Routine tags"}
                  </code>
                </pre>
                <p>
                  Each resource section below explains its boundary and links
                  to the public API reference in the{" "}
                  <a
                    className="underline"
                    href="/document#gateway"
                    onClick={event => {
                      event.preventDefault();
                      router.push("/document#gateway");
                    }}
                  >
                    document page
                  </a>
                  .
                </p>
              </ArticleParagraphContent>
            </ArticleParagraph>

            {domainTutorials.map(domain => (
              <Fragment key={domain.id}>
                <ArticleParagraphSeparator />
                <ArticleParagraph id={domain.id}>
                  <ArticleParagraphHeader>
                    <h2 className="text-2xl font-semibold tracking-tight">
                      {domain.title}
                    </h2>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                      {domain.summary}
                    </p>
                  </ArticleParagraphHeader>
                  <ArticleParagraphContent>
                    <p>{domain.details}</p>
                    <p className="font-mono text-xs leading-6 text-muted-foreground">
                      Structure: {domain.structure}
                    </p>
                    <a
                      className="underline"
                      href={"/document#gateway-" + domain.id}
                      onClick={event => {
                        event.preventDefault();
                        router.push("/document#gateway-" + domain.id);
                      }}
                    >
                      View {domain.title} API operations
                    </a>
                  </ArticleParagraphContent>
                </ArticleParagraph>
              </Fragment>
            ))}

            <ArticleParagraphSeparator />

            <ArticleParagraph id="integration-patterns">
              <ArticleParagraphHeader>
                <h2 className="text-2xl font-semibold tracking-tight">
                  Integration patterns
                </h2>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  Keep API keys on the server and call the public gateway.
                </p>
              </ArticleParagraphHeader>
              <ArticleParagraphContent>
                <p>
                  Keep the API key in your backend, worker, or CLI process. Your
                  service calls the API Gateway, validates responses, and exposes
                  only the data your own client needs.
                </p>
                <p>
                  The Notezy web app uses ClientGateway with HttpOnly JWT
                  cookies. Do not add an API key to browser storage, a URL,
                  frontend environment variables, or a WebSocket frame.
                </p>
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
