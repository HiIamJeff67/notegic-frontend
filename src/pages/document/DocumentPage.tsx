import { cn } from "@shared/util/utils";
import { ChevronDown, ChevronRight } from "lucide-react";
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
import {
  type DocumentEndpoint,
  type DocumentField,
  documentSources,
  gatewayEndpointGroups,
  gatewayRules,
  realtimeMessages,
  realtimeRules,
} from "./publicApiData";

const methodClassName: Record<string, string> = {
  DELETE: "bg-red-500/10 text-red-700 dark:text-red-300",
  GET: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
  PATCH: "bg-violet-500/15 text-violet-700 dark:text-violet-300",
  POST: "bg-yellow-500/15 text-yellow-700 dark:text-yellow-300",
  PUT: "bg-blue-500/15 text-blue-700 dark:text-blue-300",
};

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
  endpoints: (typeof gatewayEndpointGroups)[number]["endpoints"];
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
                    <div className="mt-1 font-mono text-sm text-muted-foreground">
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
  const title = t("workspace.navigation.document");
  const articleRef = useRef<HTMLElement>(null);

  const gatewayEndpointNavigation = gatewayEndpointGroups.map(group => ({
    id: `gateway-${group.id}`,
    title: group.title,
    description: group.description,
    weight: 3 as const,
  }));
  const gatewayRuleNavigation = gatewayRules.map(rule => ({
    id: `gateway-rule-${rule.id}`,
    title: rule.title,
    description: rule.summary,
    weight: 3 as const,
  }));
  const realtimeRuleNavigation = realtimeRules.map(rule => ({
    id: `realtime-rule-${rule.id}`,
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
    },
    {
      id: "gateway",
      title: "Gateway v1",
      description: "OpenAPI 3.1, GraphQL, endpoint reference, and HTTP rules.",
      weight: 5,
      children: [
        {
          id: "gateway-contract",
          title: "Contract",
          description: "Gateway contract formats and servers.",
          weight: 3,
        },
        ...gatewayEndpointNavigation,
        {
          id: "gateway-rules",
          title: "Rules",
          description:
            "Authentication, security, rate limits, and compatibility.",
          weight: 3,
        },
        ...gatewayRuleNavigation,
      ],
    },
    {
      id: "realtime",
      title: "RealtimeGateway v1",
      description: "Participant HTTP API and multiplexed WebSocket protocol.",
      weight: 5,
      children: [
        {
          id: "realtime-http",
          title: "HTTP",
          description: "OpenAPI presence endpoint.",
          weight: 3,
        },
        {
          id: "realtime-websocket",
          title: "WebSocket",
          description: "AsyncAPI channels and binary frames.",
          weight: 3,
        },
        {
          id: "realtime-rules",
          title: "Rules",
          description: "Admission, frames, presence, limits, and errors.",
          weight: 3,
        },
        ...realtimeRuleNavigation,
      ],
    },
    {
      id: "versions",
      title: "Versions",
      description: "The current v1 Beta baseline and future comparison rules.",
      weight: 4,
    },
    {
      id: "implementation",
      title: "Implementation",
      description: "How the contracts are generated, grouped, and maintained.",
      weight: 4,
    },
  ] satisfies ArticleNavigationItem[];

  return (
    <div className="h-svh min-h-0 overflow-hidden bg-canvas">
      <div className="flex h-full min-h-0">
        <ArticleSidebar
          items={navigationItems}
          scrollContainerRef={articleRef}
        />
        <Article scrollRef={articleRef} className="min-w-0 flex-1">
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
                  Contract-first documentation for Gateway v1 and
                  RealtimeGateway v1. The backend contract directories remain
                  authoritative.
                </p>
              </ArticleParagraphHeader>
              <ArticleParagraphContent>
                <div className="grid gap-3 sm:grid-cols-3">
                  {[
                    ["168", "Gateway operations"],
                    ["OpenAPI 3.1", "HTTP contracts"],
                    ["AsyncAPI 3.0", "WebSocket contract"],
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
                  Gateway v1 is the cookie-authenticated REST and
                  GraphQL-over-HTTP surface. RealtimeGateway owns participant
                  HTTP lookup and a multiplexed WebSocket protocol for BlockPack
                  collaboration.
                </p>
              </ArticleParagraphContent>
            </ArticleParagraph>

            <ArticleParagraphSeparator />

            <ArticleParagraph id="gateway">
              <ArticleParagraphHeader>
                <h2 className="text-2xl font-semibold tracking-tight">
                  Gateway v1
                </h2>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  The complete Gateway contract is generated from registered
                  routes and server schemas.
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
                      . The same directory bundles GraphQL SDL, operation
                      examples, curl scripts, and Postman imports.
                    </p>
                    <pre className="overflow-x-auto rounded-sm border border-border/70 bg-background p-4 font-mono text-xs leading-6 text-foreground/85">
                      <code>{`GET  http://localhost/api/development/v1
GET  https://api.notezy.app/api/development/v1
Content-Type: application/json`}</code>
                    </pre>
                  </ArticleSubParagraphContent>
                </ArticleSubParagraph>

                {gatewayEndpointGroups.map(group => (
                  <ArticleSubParagraph
                    id={`gateway-${group.id}`}
                    key={group.id}
                  >
                    <ArticleSubParagraphHeader>
                      {group.title}
                    </ArticleSubParagraphHeader>
                    <ArticleSubParagraphContent>
                      <p>{group.description}</p>
                      <EndpointTable endpoints={group.endpoints} />
                    </ArticleSubParagraphContent>
                  </ArticleSubParagraph>
                ))}

                <ArticleSubParagraph id="gateway-rules">
                  <ArticleSubParagraphHeader>Rules</ArticleSubParagraphHeader>
                  <ArticleSubParagraphContent>
                    <p>
                      These rules are operational constraints, not product
                      tutorials. They apply to every endpoint in the Gateway
                      contract.
                    </p>
                  </ArticleSubParagraphContent>
                </ArticleSubParagraph>
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
              </ArticleParagraphContent>
            </ArticleParagraph>

            <ArticleParagraphSeparator />

            <ArticleParagraph id="realtime">
              <ArticleParagraphHeader>
                <h2 className="text-2xl font-semibold tracking-tight">
                  RealtimeGateway v1
                </h2>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  HTTP presence uses OpenAPI 3.1. Bidirectional WebSocket
                  messages use AsyncAPI 3.0.
                </p>
              </ArticleParagraphHeader>
              <ArticleParagraphContent>
                <ArticleSubParagraph id="realtime-http">
                  <ArticleSubParagraphHeader>HTTP</ArticleSubParagraphHeader>
                  <ArticleSubParagraphContent>
                    <div className="overflow-x-auto rounded-sm border border-border/70">
                      <table className="w-full min-w-[620px] border-collapse text-left text-sm">
                        <thead className="bg-muted/40 text-muted-foreground">
                          <tr className="border-b border-border/70">
                            <th className="px-3 py-2 font-medium">Method</th>
                            <th className="px-3 py-2 font-medium">Path</th>
                            <th className="px-3 py-2 font-medium">Response</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td className="px-3 py-2 align-top">
                              <span
                                className={cn(
                                  "inline-flex min-w-16 justify-center rounded-sm px-2 py-1 font-mono text-sm font-semibold",
                                  methodClassName.GET
                                )}
                              >
                                GET
                              </span>
                            </td>
                            <td className="px-3 py-2 font-mono">
                              /block-pack/{"{block-pack-id}"}/participants
                            </td>
                            <td className="px-3 py-2 font-mono text-muted-foreground">
                              ParticipantsResponse
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                    <p>
                      Participant snapshots are ephemeral Redis lease
                      observations, not an authorization source. Each
                      participant exposes public user ID, channel permission,
                      and active connection count.
                    </p>
                  </ArticleSubParagraphContent>
                </ArticleSubParagraph>

                <ArticleSubParagraph id="realtime-websocket">
                  <ArticleSubParagraphHeader>
                    WebSocket
                  </ArticleSubParagraphHeader>
                  <ArticleSubParagraphContent>
                    <p>
                      Connect to
                      <code className="mx-1 rounded bg-muted px-1.5 py-0.5 font-mono text-xs">
                        /realtime/development/v1
                      </code>
                      with a single-use connection ticket, then subscribe to
                      BlockPack channels with a separate channel ticket.
                    </p>
                    <div className="grid gap-3 sm:grid-cols-3">
                      {["ClientControl", "ServerControl", "BinaryFrame"].map(
                        message => (
                          <div
                            className="rounded-sm border border-border/70 bg-background p-3 font-mono text-xs"
                            key={message}
                          >
                            {message}
                          </div>
                        )
                      )}
                    </div>
                    <div className="space-y-2">
                      {realtimeMessages.map(message => (
                        <details
                          className="rounded-sm border border-border/60 bg-background/50 p-3"
                          key={message.name}
                        >
                          <summary className="cursor-pointer text-sm font-medium text-foreground">
                            {message.name}
                          </summary>
                          {message.description && (
                            <p className="mt-2 text-sm text-muted-foreground">
                              {message.description}
                            </p>
                          )}
                          <div className="mt-3 space-y-3">
                            {message.variants.map(variant => (
                              <div
                                className="rounded-sm border border-border/50 p-3"
                                key={variant.name}
                              >
                                <p className="font-mono text-xs font-medium text-foreground">
                                  {variant.name}
                                </p>
                                <div className="mt-2">
                                  <FieldList fields={variant.fields} />
                                </div>
                                <pre className="mt-3 overflow-x-auto rounded-sm border border-border/60 bg-background p-3 font-mono text-xs leading-5 text-foreground/85">
                                  <code>
                                    {JSON.stringify(variant.example, null, 2)}
                                  </code>
                                </pre>
                              </div>
                            ))}
                          </div>
                        </details>
                      ))}
                    </div>
                    <pre className="overflow-x-auto rounded-sm border border-border/70 bg-background p-4 font-mono text-xs leading-6 text-foreground/85">
                      <code>{`offset 0   1 byte   protocol version (1)
offset 1   1 byte   payload type (1 = Yjs, 2 = awareness)
offset 2   4 bytes  unsigned big-endian connectorChannelId
offset 6   remaining raw Yjs or awareness payload`}</code>
                    </pre>
                  </ArticleSubParagraphContent>
                </ArticleSubParagraph>

                <ArticleSubParagraph id="realtime-rules">
                  <ArticleSubParagraphHeader>Rules</ArticleSubParagraphHeader>
                  <ArticleSubParagraphContent>
                    <p>
                      Admission, frame, presence, backpressure, and stable error
                      rules are part of the protocol contract.
                    </p>
                  </ArticleSubParagraphContent>
                </ArticleSubParagraph>
                {realtimeRules.map(rule => (
                  <ArticleSubParagraph
                    id={`realtime-rule-${rule.id}`}
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
              </ArticleParagraphContent>
            </ArticleParagraph>

            <ArticleParagraphSeparator />

            <ArticleParagraph id="versions">
              <ArticleParagraphHeader>
                <h2 className="text-2xl font-semibold tracking-tight">
                  Versions
                </h2>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  Both services currently publish one v1 Beta baseline. No
                  unreleased behavior is implied here.
                </p>
              </ArticleParagraphHeader>
              <ArticleParagraphContent>
                <div className="space-y-3">
                  {[
                    [
                      "Gateway",
                      "v1 Beta · OpenAPI 3.1 · HttpOnly cookies + CSRF · 168 operations",
                    ],
                    [
                      "RealtimeGateway",
                      "v1 Beta · OpenAPI 3.1 HTTP + AsyncAPI 3.0 WebSocket · BlockPack channels",
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
                  The frontend groups operations by the generated OpenAPI tags
                  and keeps the implementation boundary visible: product usage
                  teaching belongs in Tutorial, while this page describes
                  contract behavior and operational constraints.
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
