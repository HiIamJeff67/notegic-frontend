import { cn } from "@shared/util/utils";
import {
  BlocksIcon,
  BookOpenIcon,
  ChevronDown,
  ChevronRight,
  FileCode2Icon,
  GitBranchIcon,
  Globe2Icon,
  KeyRoundIcon,
  ShieldCheckIcon,
  ShieldIcon,
  WrenchIcon,
} from "lucide-react";
import { Fragment, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Article,
  ArticleContent,
  type ArticleNavigationItem,
  ArticleParagraph,
  ArticleParagraphContent,
  ArticleParagraphHeader,
  ArticleParagraphSeparator,
  ArticleSidebar,
  ArticleSubParagraph,
  ArticleSubParagraphContent,
  ArticleSubParagraphHeader,
} from "@/components/commons/Article/Article";
import PrismCode from "@/components/commons/PrismCode/PrismCode";
import { useAppRouterActions } from "@/hooks/useAppRouter";
import {
  BlockPackIcon,
  MaterialIcon,
  RootShelfIcon,
  RoutineIcon,
  RoutineTagIcon,
  RoutineTaskIcon,
  StationIcon,
  SubShelfIcon,
} from "@/components/icons/WorkspaceEntityIcons";
import { PrivacyPolicySections } from "@/pages/privacy-policy/PrivacyPolicyPage";
import {
  type DocumentEndpoint,
  type DocumentField,
  documentSources,
  gatewayEndpointGroups,
  gatewayRules,
} from "./publicApiData";

const methodClassName: Record<string, string> = {
  DELETE: "bg-red-500/10 text-red-700 dark:text-red-300",
  GET: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
  PATCH: "bg-violet-500/15 text-violet-700 dark:text-violet-300",
  POST: "bg-yellow-500/15 text-yellow-700 dark:text-yellow-300",
  PUT: "bg-blue-500/15 text-blue-700 dark:text-blue-300",
};

const apiGatewayDomainIds = new Set([
  "root-shelves",
  "sub-shelves",
  "materials",
  "block-packs",
  "blocks",
  "stations",
  "routines",
  "routine-tasks",
  "routine-tags",
]);

const gatewayDomainOrder = [
  "root-shelves",
  "sub-shelves",
  "stations",
  "materials",
  "block-packs",
  "blocks",
  "routines",
  "routine-tasks",
  "routine-tags",
] as const;

const apiGatewayEndpointGroups = gatewayEndpointGroups
  .filter(group => apiGatewayDomainIds.has(group.id))
  .sort(
    (left, right) =>
      gatewayDomainOrder.indexOf(left.id as (typeof gatewayDomainOrder)[number]) -
      gatewayDomainOrder.indexOf(right.id as (typeof gatewayDomainOrder)[number])
  );

const apiGatewayDomainIcons: Record<string, ArticleNavigationItem["icon"]> = {
  "root-shelves": RootShelfIcon,
  "sub-shelves": SubShelfIcon,
  materials: MaterialIcon,
  "block-packs": BlockPackIcon,
  blocks: BlocksIcon,
  stations: StationIcon,
  routines: RoutineIcon,
  "routine-tasks": RoutineTaskIcon,
  "routine-tags": RoutineTagIcon,
} as const;

const domainGuides: Record<string, { summary: string; structure: string }> = {
  "root-shelves": {
    summary:
      "Root shelves are the top-level workspaces that organize a user's Notezy content and permissions.",
    structure:
      "A root shelf owns its sub shelves, memberships, and the content tree beneath it; the API exposes the shelf as the boundary for access control.",
  },
  "sub-shelves": {
    summary:
      "Sub shelves are nested collections inside a root shelf, useful for separating projects, topics, or workflows.",
    structure:
      "A sub shelf belongs to one parent shelf and can order and traverse the items that it contains.",
  },
  materials: {
    summary:
      "Materials are source files or references that can be attached to the knowledge structure.",
    structure:
      "A material has metadata and content, can point to a parent location, and can be recovered or removed through its lifecycle endpoints.",
  },
  "block-packs": {
    summary:
      "Block Packs are collaborative documents that group related blocks into one editable unit.",
    structure:
      "A Block Pack is the container; blocks hold the document content, while permissions and realtime editing are managed at the pack boundary.",
  },
  blocks: {
    summary:
      "Blocks are the smallest content units used to build a Block Pack document.",
    structure:
      "A block is addressed inside a Block Pack and carries its content and ordering metadata.",
  },
  stations: {
    summary:
      "Stations are execution-oriented workspaces that connect routines with the resources they operate on.",
    structure:
      "A station has members, permissions, and visualizable state; routine links determine which work can run there.",
  },
  routines: {
    summary:
      "Routines describe repeatable automation flows that can be attached to a station.",
    structure:
      "A routine owns its schedule and task links; its lifecycle endpoints manage the definition rather than an individual run.",
  },
  "routine-tasks": {
    summary:
      "Routine tasks are executable steps created from a routine and claimed by the scheduler when they are ready.",
    structure:
      "A task contains its payload and lifecycle state; cost is charged when the backend claims an execution, not when the task is saved.",
  },
  "routine-tags": {
    summary:
      "Routine tags provide lightweight labels for finding and grouping routine tasks.",
    structure:
      "A tag is an independent resource that can be created, linked to tasks, and permanently deleted.",
  },
};

const privacyPolicyNavigation = [
  ["privacy-collection", "Information we collect"],
  ["privacy-use", "How we use information"],
  ["privacy-sharing", "Information sharing"],
  ["privacy-retention", "Data retention"],
  ["privacy-rights", "Your rights"],
  ["privacy-cookies", "Cookies"],
  ["privacy-changes", "Policy changes"],
  ["privacy-contact", "Contact"],
].map(([id, title]) => ({
  id,
  title,
  description: title,
  weight: 3 as const,
}));

const RuleBlock = ({
  rule,
}: {
  rule: { summary: string; bullets: readonly string[] };
}) => (
  <>
    <p>{rule.summary}</p>
    <ul className="mt-4 list-disc space-y-2 pl-5">
      {rule.bullets.map(bullet => (
        <li key={bullet}>{bullet}</li>
      ))}
    </ul>
  </>
);

const FieldList = ({ fields }: { fields: DocumentField[] }) => {
  if (fields.length === 0) {
    return <p className="text-muted-foreground">No documented fields.</p>;
  }

  return (
    <ul className="space-y-1.5">
      {fields.map(field => (
        <li key={field.name}>
          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
            <code className="font-mono text-sm text-foreground">
              {field.name}
            </code>
            <span className="font-mono text-sm text-muted-foreground">
              {field.type}
              {field.required ? " · required" : " · optional"}
            </span>
          </div>
          {field.description && (
            <p className="mt-0.5 text-sm leading-5 text-muted-foreground">
              {field.description}
            </p>
          )}
          {field.children && field.children.length > 0 && (
            <div className="mt-1.5 border-l border-border/70 pl-3">
              <FieldList fields={field.children} />
            </div>
          )}
        </li>
      ))}
    </ul>
  );
};

const EndpointDetails = ({ endpoint }: { endpoint: DocumentEndpoint }) => {
  const headerParameters = endpoint.parameters.filter(
    parameter => parameter.location === "header"
  );
  const userAgentParameter = headerParameters.find(
    parameter => parameter.name.toLowerCase() === "user-agent"
  );
  const requestHeaders = Object.fromEntries(
    headerParameters
      .filter(parameter => parameter !== userAgentParameter)
      .map(parameter => [parameter.name, parameter.example ?? "example"])
  );
  const requestHeadersJson = JSON.stringify(requestHeaders, null, 2);
  const userAgentJson = JSON.stringify(
    userAgentParameter
      ? { [userAgentParameter.name]: userAgentParameter.example ?? "example" }
      : {},
    null,
    2
  );
  const requestBodyJson = JSON.stringify(
    endpoint.requestExample ?? {},
    null,
    2
  );

  return (
    <div className="grid gap-5 border-t border-border/60 bg-muted/70 p-4 lg:grid-cols-2">
      <div>
        <p className="mb-3 text-base font-semibold text-foreground">Request</p>
        <div className="space-y-4">
          <div className="space-y-2">
            <PrismCode
              title="Headers"
              code={{
                json: requestHeadersJson,
              }}
            />
          </div>
          {userAgentParameter && (
            <div className="space-y-2">
              <PrismCode
                title="User agent"
                code={{
                  json: userAgentJson,
                }}
              />
            </div>
          )}
          {endpoint.requestExample !== null &&
            endpoint.requestExample !== undefined && (
              <div className="space-y-2">
                <PrismCode
                  title="Body"
                  code={{
                    json: requestBodyJson,
                  }}
                />
              </div>
            )}
          <div className="space-y-2">
            <PrismCode
              title="Example"
              code={{
                curl: endpoint.examples.curl,
                http: endpoint.examples.http,
              }}
            />
          </div>
        </div>
        {endpoint.parameters.length > 0 && (
          <div className="mt-4 border-t border-border/60 pt-3">
            <p className="mb-2 text-sm font-medium text-foreground">
              Parameters
            </p>
            <FieldList
              fields={endpoint.parameters.map(parameter => ({
                name: parameter.name,
                type: `${parameter.location} · ${parameter.type}`,
                required: parameter.required,
                description: parameter.description,
                example: parameter.example,
              }))}
            />
          </div>
        )}
      </div>
      <div>
        <p className="mb-3 flex items-center gap-2 text-base font-semibold text-foreground">
          Response
          {endpoint.responseStatus && (
            <span className="rounded-sm border border-emerald-500/40 bg-emerald-500/15 px-2 py-0.5 font-mono text-sm text-emerald-700 dark:text-emerald-300">
              {endpoint.responseStatus}
            </span>
          )}
        </p>
        <PrismCode
          title="Response body"
          code={{
            json: JSON.stringify(endpoint.responseExample, null, 2),
          }}
        />
        <div className="mt-4">
          <p className="mb-2 text-sm font-medium text-foreground">Fields</p>
          <FieldList fields={endpoint.responseFields} />
        </div>
        {endpoint.errors.length > 0 && (
          <div className="mt-5 border-t border-border/60 pt-4">
            <p className="mb-2 text-base font-semibold text-foreground">
              Errors
            </p>
            <div className="space-y-2">
              {endpoint.errors.map(error => (
                <details
                  className="rounded-sm border border-border/70 bg-background/50 p-3"
                  key={`${error.status}-${error.description}`}
                >
                  <summary className="flex cursor-pointer flex-wrap items-center gap-2 text-sm font-medium text-foreground">
                    <span className="rounded-sm border border-red-500/40 bg-red-500/15 px-2 py-0.5 font-mono text-sm text-red-700 dark:text-red-300">
                      {error.status}
                    </span>
                    <span>{error.description}</span>
                  </summary>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    {error.message}
                  </p>
                </details>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const EndpointTable = ({
  endpoints,
}: {
  endpoints: DocumentEndpoint[];
}) => {
  const [expandedOperation, setExpandedOperation] = useState<string | null>(
    null
  );

  return (
    <div className="mt-5 overflow-x-auto rounded-sm border border-border/70">
      <table className="w-full min-w-[760px] table-fixed border-collapse text-left text-sm">
        <colgroup>
          <col className="w-24" />
          <col className="w-[24%]" />
          <col />
          <col className="w-44" />
          <col className="w-10" />
        </colgroup>
        <thead className="bg-muted/40 text-muted-foreground">
          <tr className="border-b border-border/70">
            <th className="px-3 py-2 font-medium">Method</th>
            <th className="px-3 py-2 font-medium">Path</th>
            <th className="px-3 py-2 font-medium">Operation</th>
            <th className="px-3 py-2 font-medium">Shape</th>
            <th className="w-10 px-2 py-2" aria-label="Expand details" />
          </tr>
        </thead>
        <tbody>
          {endpoints.map(endpoint => {
            const operationKey = `${endpoint.method}-${endpoint.path}-${endpoint.operation}`;
            const isExpanded = expandedOperation === operationKey;
            return (
              <Fragment key={operationKey}>
                <tr className="border-b border-border/50">
                  <td className="px-3 py-3 align-middle">
                    <span
                      className={cn(
                        "inline-flex min-w-16 justify-center rounded-sm px-2 py-1 font-mono text-sm font-semibold",
                        methodClassName[endpoint.method] ?? "bg-muted"
                      )}
                    >
                      {endpoint.method}
                    </span>
                  </td>
                  <td className="px-3 py-3 align-middle font-mono text-sm text-foreground/90">
                    {endpoint.path}
                  </td>
                  <td className="px-3 py-3 align-top">
                    <div className="font-medium text-foreground">
                      {endpoint.summary}
                    </div>
                    <div
                      data-article-operation={endpoint.operation}
                      data-article-operation-path={endpoint.path}
                      data-article-operation-summary={endpoint.summary}
                      data-article-operation-method={endpoint.method}
                      className="mt-1 font-mono text-sm text-muted-foreground"
                    >
                      {endpoint.operation}
                    </div>
                    {endpoint.description && (
                      <p className="mt-1 text-sm leading-5 text-muted-foreground">
                        {endpoint.description}
                      </p>
                    )}
                  </td>
                  <td className="px-3 py-3 align-middle">
                    <span className="flex min-h-7 items-center text-sm text-muted-foreground">
                      {endpoint.requestFields.length > 0
                        ? `${endpoint.requestFields.length} fields`
                        : "No body"}
                      <span className="px-1">→</span>
                      {endpoint.responseFields.length > 0
                        ? `${endpoint.responseFields.length} fields`
                        : "No body"}
                    </span>
                  </td>
                  <td className="w-10 px-2 py-3 text-center align-middle">
                    <button
                      aria-expanded={isExpanded}
                      aria-label={
                        isExpanded ? "Collapse details" : "Expand details"
                      }
                      className="inline-flex size-7 items-center justify-center rounded-sm text-foreground hover:bg-muted"
                      type="button"
                      onClick={() =>
                        setExpandedOperation(isExpanded ? null : operationKey)
                      }
                    >
                      {isExpanded ? <ChevronDown /> : <ChevronRight />}
                    </button>
                  </td>
                </tr>
                {isExpanded && (
                  <tr className="border-b border-border/50">
                    <td className="p-0" colSpan={5}>
                      <EndpointDetails endpoint={endpoint} />
                    </td>
                  </tr>
                )}
              </Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

const DocumentPage = () => {
  const { t } = useTranslation();
  const router = useAppRouterActions();
  const title = t("workspace.navigation.document");
  const articleRef = useRef<HTMLElement>(null);
  const gatewayOperationCount = apiGatewayEndpointGroups.reduce(
    (count, group) => count + group.endpoints.length,
    0
  );

  const gatewayEndpointNavigation = apiGatewayEndpointGroups.map(group => ({
    id: `gateway-${group.id}`,
    title: group.title,
    description: group.description,
    weight: 3 as const,
    icon: apiGatewayDomainIcons[group.id],
  }));
  const gatewayRuleNavigation = gatewayRules.map(rule => ({
    id: `gateway-rule-${rule.id}`,
    title: rule.title,
    description: rule.summary,
    weight: 3 as const,
  }));
  const navigationItems = [
    {
      id: "overview",
      title: "Overview",
      description: "The published Notezy v1 public API contract.",
      weight: 5,
      icon: BookOpenIcon,
    },
    {
      id: "quick-start",
      title: "API key quick start",
      description: "Generate, store, use, and revoke an integration key.",
      weight: 5,
      icon: KeyRoundIcon,
    },
    {
      id: "gateway",
      title: "API Gateway v1 (public)",
      description: "OpenAPI 3.1 endpoint reference and HTTP rules.",
      weight: 5,
      icon: Globe2Icon,
      children: [
        {
          id: "gateway-contract",
          title: "Contract",
          description: "Gateway contract formats and servers.",
          weight: 3,
          icon: FileCode2Icon,
        },
        ...gatewayEndpointNavigation,
        {
          id: "gateway-rules",
          title: "Rules",
          description:
            "Authentication, security, rate limits, and compatibility.",
          weight: 3,
          icon: ShieldCheckIcon,
          children: gatewayRuleNavigation,
        },
      ],
    },
    {
      id: "versions",
      title: "Versions",
      description: "The current v1 Beta baseline and future comparison rules.",
      weight: 4,
      icon: GitBranchIcon,
    },
    {
      id: "privacy-policy",
      title: "Privacy and policy",
      description: "How Notezy handles account data and user rights.",
      weight: 4,
      icon: ShieldIcon,
      children: privacyPolicyNavigation,
    },
    {
      id: "implementation",
      title: "Implementation",
      description: "How the contracts are generated, grouped, and maintained.",
      weight: 4,
      icon: WrenchIcon,
    },
  ] satisfies ArticleNavigationItem[];

  return (
    <div className="h-svh min-h-0 overflow-hidden bg-canvas">
      <div className="flex h-full min-h-0">
        <ArticleSidebar
          items={navigationItems}
          scrollContainerRef={articleRef}
        />
        <Article
          scrollRef={articleRef}
          className="min-w-0 flex-1"
        >
          <ArticleContent>
            <ArticleParagraph id="overview">
              <ArticleParagraphHeader>
                <p className="font-mono text-[11px] tracking-[0.16em] text-muted-foreground">
                  NOTEZY PUBLIC API
                </p>
                <h1 className="mt-3 text-3xl font-semibold tracking-tight">
                  {title}
                </h1>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">
                  Contract-first documentation for the public API Gateway v1.
                  The backend contract directories remain authoritative.
                </p>
              </ArticleParagraphHeader>
              <ArticleParagraphContent>
                <div className="grid gap-3 sm:grid-cols-3">
                  {[
                    [String(gatewayOperationCount), "API Gateway operations"],
                    ["OpenAPI 3.1", "Public HTTP contract"],
                    ["9", "API-key resource domains"],
                  ].map(([value, label]) => (
                    <div
                      className="rounded-sm border border-border/70 bg-background p-4"
                      key={label}
                    >
                      <p className="font-mono text-lg font-semibold text-foreground">
                        {value}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {label}
                      </p>
                    </div>
                  ))}
                </div>
                <p>
                  API Gateway v1 is the public REST surface for server-to-server
                  integrations authenticated with X-API-Key. The browser app
                  continues to use the private ClientGateway JWT/cookie flow;
                  API keys must never be placed in browser storage, URLs, or
                  frontend environment variables.
                </p>
              </ArticleParagraphContent>
            </ArticleParagraph>

            <ArticleParagraphSeparator />

            <ArticleParagraph id="quick-start">
              <ArticleParagraphHeader>
                <h2 className="text-2xl font-semibold tracking-tight">
                  API key quick start
                </h2>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  Use an API key only from a trusted server or CLI integration.
                </p>
              </ArticleParagraphHeader>
              <ArticleParagraphContent>
                <ol className="list-decimal space-y-3 pl-5">
                  <li>
                    Open Account settings and select API keys. Create a key
                    with a descriptive name once the ClientGateway key
                    management contract is available.
                  </li>
                  <li>
                    Copy the secret immediately and store it in your server's
                    secret manager. The complete secret is shown only once;
                    never commit it or place it in browser storage.
                  </li>
                  <li>
                    Send it to the public gateway as
                    <code className="mx-1 rounded bg-muted px-1.5 py-0.5 font-mono text-xs">
                      X-API-Key: nzy_...
                    </code>
                    for each integration request.
                  </li>
                  <li>
                    Return to Account settings to review metadata, rotate a
                    compromised key, or revoke a key that is no longer used.
                  </li>
                </ol>
                <p>
                  The browser application itself continues to use the private
                  ClientGateway JWT/cookie session. Read the full workflow in
                  the{" "}
                  <a
                    className="underline"
                    href="/tutorial#api-keys"
                    onClick={event => {
                      event.preventDefault();
                      router.push("/tutorial#api-keys");
                    }}
                  >
                    API key tutorial
                  </a>
                  .
                </p>
              </ArticleParagraphContent>
            </ArticleParagraph>

            <ArticleParagraphSeparator />

            <ArticleParagraph id="gateway">
              <ArticleParagraphHeader>
                <h2 className="text-2xl font-semibold tracking-tight">
                  API Gateway v1 (public)
                </h2>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  The public API Gateway contract is generated from its route
                  allowlist and server schemas.
                </p>
              </ArticleParagraphHeader>
              <ArticleParagraphContent>
                <ArticleSubParagraph id="gateway-contract">
                  <ArticleSubParagraphHeader>
                    Contract
                  </ArticleSubParagraphHeader>
                  <ArticleSubParagraphContent>
                    <p>
                      OpenAPI 3.1 describes the HTTP routes at
                      <code className="mx-1 rounded bg-muted px-1.5 py-0.5 font-mono text-xs">
                        /api/development/v1
                      </code>
                      . The same directory bundles operation examples, curl
                      scripts, and Postman imports. Requests use an X-API-Key
                      header for server-to-server authentication.
                    </p>
                    <pre className="overflow-x-auto rounded-sm border border-border/70 bg-background p-4 font-mono text-xs leading-6 text-foreground/85">
                      <code>{`GET  http://localhost/api/development/v1
GET  https://api.notezy.app/api/development/v1
Content-Type: application/json`}</code>
                    </pre>
                  </ArticleSubParagraphContent>
                </ArticleSubParagraph>

                {apiGatewayEndpointGroups.map(group => {
                  const guide = domainGuides[group.id];
                  return (
                    <ArticleSubParagraph
                      id={`gateway-${group.id}`}
                      key={group.id}
                    >
                      <ArticleSubParagraphHeader>
                        {group.title}
                      </ArticleSubParagraphHeader>
                      <ArticleSubParagraphContent>
                        <p>{guide?.summary ?? group.description}</p>
                        {guide && (
                          <p className="text-sm leading-6 text-muted-foreground">
                            {guide.structure} Read the{" "}
                            <a
                              className="underline"
                              href={`/tutorial#${group.id}`}
                              onClick={event => {
                                event.preventDefault();
                                router.push(`/tutorial#${group.id}`);
                              }}
                            >
                              {group.title.toLowerCase()} tutorial
                            </a>
                            .
                          </p>
                        )}
                        <EndpointTable endpoints={group.endpoints} />
                      </ArticleSubParagraphContent>
                    </ArticleSubParagraph>
                  );
                })}

                <ArticleSubParagraph id="gateway-rules">
                  <ArticleSubParagraphHeader>Rules</ArticleSubParagraphHeader>
                  <ArticleSubParagraphContent>
                    <p>
                      These rules are operational constraints, not product
                      tutorials. They apply to every endpoint in the public
                      API Gateway contract.
                    </p>
                    {gatewayRules.map(rule => (
                      <ArticleSubParagraph
                        id={`gateway-rule-${rule.id}`}
                        key={rule.id}
                      >
                        <ArticleSubParagraphHeader>
                          {rule.title}
                        </ArticleSubParagraphHeader>
                        <ArticleSubParagraphContent>
                          <RuleBlock rule={rule} />
                        </ArticleSubParagraphContent>
                      </ArticleSubParagraph>
                    ))}
                  </ArticleSubParagraphContent>
                </ArticleSubParagraph>
              </ArticleParagraphContent>
            </ArticleParagraph>

            <ArticleParagraphSeparator />

            <ArticleParagraph id="versions">
              <ArticleParagraphHeader>
                <h2 className="text-2xl font-semibold tracking-tight">
                  Versions
                </h2>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  API Gateway currently publishes one v1 Beta baseline. The
                  ClientGateway and RealtimeGateway contracts remain private
                  implementation surfaces and are not listed here.
                </p>
              </ArticleParagraphHeader>
              <ArticleParagraphContent>
                <div className="space-y-3">
                  {[
                    [
                      "API Gateway",
                      `v1 Beta · OpenAPI 3.1 · X-API-Key · ${gatewayOperationCount} operations`,
                    ],
                  ].map(([name, detail]) => (
                    <div
                      className="rounded-sm border border-border/70 bg-background p-4"
                      key={name}
                    >
                      <p className="font-medium text-foreground">{name}</p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {detail}
                      </p>
                    </div>
                  ))}
                </div>
                <p>
                  Future comparisons must cover base paths, authentication,
                  renamed or removed operations, schema changes, errors, limits,
                  migration deadlines, binary frames, ticket claims, and
                  reconnect semantics.
                </p>
              </ArticleParagraphContent>
            </ArticleParagraph>

            <ArticleParagraphSeparator />

            <ArticleParagraph id="privacy-policy">
              <ArticleParagraphHeader>
                <h2 className="text-2xl font-semibold tracking-tight">
                  Privacy and policy
                </h2>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  The same privacy terms apply when an integration accesses
                  resources through an API key.
                </p>
              </ArticleParagraphHeader>
              <ArticleParagraphContent>
                <PrivacyPolicySections />
              </ArticleParagraphContent>
            </ArticleParagraph>

            <ArticleParagraphSeparator />

            <ArticleParagraph id="implementation">
              <ArticleParagraphHeader>
                <h2 className="text-2xl font-semibold tracking-tight">
                  Implementation
                </h2>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  The page is a readable index of the backend-owned contracts;
                  it does not replace the generated artifacts.
                </p>
              </ArticleParagraphHeader>
              <ArticleParagraphContent>
                <div className="space-y-3">
                  {documentSources.map(source => (
                    <div
                      className="rounded-sm border border-border/70 bg-background p-4"
                      key={source.title}
                    >
                      <div className="flex flex-wrap items-baseline justify-between gap-2">
                        <p className="font-medium text-foreground">
                          {source.title}
                        </p>
                        <span className="font-mono text-[10px] text-muted-foreground">
                          {source.format}
                        </span>
                      </div>
                      <p className="mt-2 font-mono text-[11px] text-muted-foreground">
                        {source.path}
                      </p>
                      <p className="mt-2 text-sm text-muted-foreground">
                        {source.detail}
                      </p>
                    </div>
                  ))}
                </div>
                <p>
                  Routes and server schemas remain authoritative. Refresh the
                  public artifacts from the backend contract generator before
                  reviewing API changes:
                </p>
                <pre className="overflow-x-auto rounded-sm border border-border/70 bg-background p-4 font-mono text-xs leading-6 text-foreground/85">
                  <code>make -C contracts public-api-gen</code>
                </pre>
                <p>
                  The frontend groups public API Gateway operations by generated
                  OpenAPI tags and keeps the implementation boundary visible:
                  product usage teaching belongs in Tutorial, while this page
                  describes contract behavior and operational constraints. The
                  web app itself still calls ClientGateway with JWT cookies.
                </p>
              </ArticleParagraphContent>
            </ArticleParagraph>
          </ArticleContent>
        </Article>
      </div>
    </div>
  );
};

export default DocumentPage;
