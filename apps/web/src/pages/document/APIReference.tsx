import {
  BlocksIcon,
  FileCode2Icon,
  Globe2Icon,
  GitBranchIcon,
  ShieldCheckIcon,
} from "lucide-react";
import {
  ArticleInlineText,
  ArticleLink,
  type ArticleNavigationItem,
  ArticleParagraph,
  ArticleParagraphContent,
  ArticleParagraphHeader,
  ArticleSubParagraph,
  ArticleSubParagraphContent,
  ArticleSubParagraphHeader,
} from "@/components/commons/Article/Article";
import {
  BlockPackIcon,
  RootShelfIcon,
  RoutineIcon,
  RoutineTagIcon,
  RoutineTaskIcon,
  StationIcon,
  SubShelfIcon,
} from "@/components/icons/WorkspaceEntityIcons";
import EndpointTable from "./api-reference/EndpointTable";
import APIKey, { apiKeyNavigation } from "./APIKey";
import {
  contractVersion,
  type DocumentRule,
  gatewayEndpointGroups,
  gatewayRules,
  publicApiBaseURL,
} from "./api-reference/generated/publicAPIData";

const apiReferenceDomains = [
  {
    id: "root-shelves",
    icon: RootShelfIcon,
    summary:
      "A root shelf is the top-level workspace boundary for a collection of Notegic content.",
    structure: "Root shelf → sub shelves → Block Packs → blocks",
  },
  {
    id: "sub-shelves",
    icon: SubShelfIcon,
    summary:
      "Sub shelves divide a root shelf into smaller, navigable areas without creating another top-level workspace.",
    structure: "Root shelf → sub shelf → ordered items",
  },
  {
    id: "block-packs",
    icon: BlockPackIcon,
    summary:
      "A Block Pack is a collaborative document container made from one or more blocks.",
    structure: "Block Pack → ordered blocks → realtime editing session",
  },
  {
    id: "blocks",
    icon: BlocksIcon,
    summary: "Blocks are the small content units that make up a Block Pack.",
    structure: "Block Pack → block id → content + ordering metadata",
  },
  {
    id: "stations",
    icon: StationIcon,
    summary:
      "Stations are execution-oriented workspaces where routines and their resources come together.",
    structure: "Station → members + permissions + routine links",
  },
  {
    id: "routines",
    icon: RoutineIcon,
    summary:
      "A routine describes a repeatable automation flow and its schedule.",
    structure: "Routine → schedule → routine tasks",
  },
  {
    id: "routine-tasks",
    icon: RoutineTaskIcon,
    summary: "Routine tasks define individual steps of a routine.",
    structure: "Routine → task purpose + payload + dependencies",
  },
  {
    id: "routine-task-dependencies",
    icon: GitBranchIcon,
    summary: "Dependencies connect steps within a routine.",
    structure: "Routine → preceding task → dependent task",
  },
  {
    id: "routine-tags",
    icon: RoutineTagIcon,
    summary: "Routine tags are labels for grouping and finding routines.",
    structure: "Tag → linked routines → filtered routine view",
  },
] as const;

const apiReferenceChildren: ArticleNavigationItem[] = [
  apiKeyNavigation,
  {
    id: "gateway-contract",
    title: "Contract",
    description: "Contract formats and servers.",
    weight: 3,
    icon: FileCode2Icon,
  },
  ...gatewayEndpointGroups.map(group => ({
    id: `gateway-${group.id}`,
    title: group.title,
    description: group.description,
    weight: 3 as const,
    icon: apiReferenceDomains.find(domain => domain.id === group.id)?.icon,
    command: { separator: true },
  })),
  {
    id: "gateway-rules",
    title: "Rules",
    description: "Authentication, security, rate limits, and compatibility.",
    weight: 3,
    icon: ShieldCheckIcon,
    children: gatewayRules.map(rule => ({
      id: `gateway-rule-${rule.id}`,
      title: rule.title,
      description: rule.summary,
      weight: 3 as const,
      command: { layout: "group" as const },
    })),
  },
];

const RuleBlock = ({ rule }: { rule: DocumentRule }) => (
  <>
    {rule.blocks.map((block, index) => {
      if (block.type === "list") {
        const List = block.ordered ? "ol" : "ul";
        return (
          <List
            className={`space-y-2 pl-5 ${block.ordered ? "list-decimal" : "list-disc"}`}
            key={index}
          >
            {block.items.map(item => (
              <li key={item}>
                <ArticleInlineText>{item}</ArticleInlineText>
              </li>
            ))}
          </List>
        );
      }
      return block.type === "code" ? (
        <pre
          className="overflow-x-auto rounded-sm bg-muted p-4 text-sm"
          key={index}
        >
          <code>{block.text}</code>
        </pre>
      ) : (
        <p key={index}>
          <ArticleInlineText>{block.text}</ArticleInlineText>
        </p>
      );
    })}
  </>
);

export const apiReferenceNavigation = {
  id: "gateway",
  title: "API",
  description: "OpenAPI 3.1 endpoint reference and HTTP rules.",
  weight: 5 as const,
  icon: Globe2Icon,
  children: apiReferenceChildren,
} as const;
const APIReference = () => {
  return (
    <ArticleParagraph id={apiReferenceNavigation.id}>
      <ArticleParagraphHeader className="mx-auto max-w-full md:max-w-2xl xl:max-w-4xl">
        <h2 className="text-2xl font-semibold tracking-tight">
          {apiReferenceNavigation.title}
        </h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Find request parameters, body fields, and response formats for
          supported integrations.
        </p>
      </ArticleParagraphHeader>
      <ArticleParagraphContent>
        <APIKey />
        <ArticleSubParagraph
          id="gateway-contract"
          separatorFullWidth
          className="mx-auto max-w-full md:max-w-2xl xl:max-w-4xl"
        >
          <ArticleSubParagraphHeader>Contract</ArticleSubParagraphHeader>
          <ArticleSubParagraphContent>
            <p>
              Use HTTPS and an X-API-Key header for public API requests. The
              reference describes the API using OpenAPI 3.1.
            </p>
            <p>
              Base URL:{" "}
              <code className="break-all font-mono text-sm">
                {publicApiBaseURL}
              </code>
            </p>
            <p className="text-sm text-muted-foreground">
              Contract revision: {contractVersion}. This is separate from the
              API URL version v1 and the product version.
            </p>
          </ArticleSubParagraphContent>
        </ArticleSubParagraph>

        {gatewayEndpointGroups.map(group => {
          const guide = apiReferenceDomains.find(
            domain => domain.id === group.id
          );
          return (
            <ArticleSubParagraph
              id={`gateway-${group.id}`}
              key={group.id}
              separatorFullWidth
            >
              <ArticleSubParagraphHeader className="mx-auto max-w-full md:max-w-2xl xl:max-w-4xl">
                {group.title}
              </ArticleSubParagraphHeader>
              <ArticleSubParagraphContent>
                <p className="mx-auto max-w-full md:max-w-2xl xl:max-w-4xl">
                  {guide?.summary ?? group.description}
                </p>
                {guide && (
                  <p className="mx-auto max-w-full text-sm leading-6 text-muted-foreground md:max-w-2xl xl:max-w-4xl">
                    {guide.structure}{" "}
                    <ArticleLink href={`/document#${group.id}`}>
                      Read the resource guide
                    </ArticleLink>
                  </p>
                )}
                <EndpointTable endpoints={group.endpoints} />
              </ArticleSubParagraphContent>
            </ArticleSubParagraph>
          );
        })}

        <ArticleSubParagraph
          id="gateway-rules"
          separatorFullWidth
          className="mx-auto max-w-full md:max-w-2xl xl:max-w-4xl"
        >
          <ArticleSubParagraphHeader>Rules</ArticleSubParagraphHeader>
          <ArticleSubParagraphContent>
            <p>
              These rules describe authentication, request handling, security,
              retries, and compatibility across the public API.
            </p>
            {gatewayRules.map(rule => (
              <ArticleSubParagraph
                id={`gateway-rule-${rule.id}`}
                key={rule.id}
                separatorFullWidth
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
  );
};
export default APIReference;
