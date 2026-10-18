import { gatewayEndpointGroups } from "@/pages/document/api-reference/generated/publicAPIData";
import {
  ArticleLink,
  ArticleSubParagraph,
  ArticleSubParagraphContent,
  ArticleSubParagraphHeader,
} from "@/components/commons/Article/Article";

const resourceGuides = [
  {
    id: "root-shelves",
    title: "Root Shelves",
    summary:
      "A root shelf is the top-level workspace boundary for a collection of Notegic content.",
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
      "Use sub shelves for projects, subjects, or stages of work. Their ordering and traversal endpoints let a client render the same hierarchy users see in Notegic.",
  },
  {
    id: "materials",
    title: "Materials",
    summary:
      "Materials are source files and references that support the content stored in a shelf or document.",
    structure: "Material → metadata + content reference + parent location",
    details:
      "Keep reference files beside related notes and manage them in Notegic. Material operations are not currently available through the public API.",
  },
  {
    id: "block-packs",
    title: "Block Packs",
    summary:
      "A Block Pack is a collaborative document container made from one or more blocks.",
    structure: "Block Pack → ordered blocks → realtime editing session",
    details:
      "Use the Block Pack API to organize documents and manage access. Collaborative editing is available in Notegic, not through this public API contract.",
  },
  {
    id: "blocks",
    title: "Blocks",
    summary: "Blocks are the small content units that make up a Block Pack.",
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
    summary: "Routine tasks define individual steps of a routine.",
    structure: "Routine → task purpose + payload + dependencies",
    details:
      "Configure each step's purpose, payload, priority, and retry settings. Task definitions and execution results are separate.",
  },
  {
    id: "routine-tags",
    title: "Routine Tags",
    summary: "Routine tags are labels for grouping and finding routines.",
    structure: "Tag → linked routines → filtered routine view",
    details:
      "Link tags to routines to organize related automations. Removing a tag does not mean deleting its routines.",
  },
  {
    id: "routine-task-dependencies",
    title: "Routine Task Dependencies",
    summary: "Dependencies connect steps within a routine.",
    structure: "Routine → preceding task → dependent task",
    details:
      "Use the dependency operations to read and manage which tasks must precede other tasks in the same routine.",
  },
];

export const resourceNavigation = resourceGuides.map(domain => ({
  id: domain.id,
  title: domain.title,
  description: domain.summary,
  weight: 3 as const,
}));
const Resources = () => {
  return (
    <>
      {resourceGuides.map(domain => {
        return (
          <ArticleSubParagraph
            id={domain.id}
            key={domain.id}
            separatorFullWidth
          >
            <ArticleSubParagraphHeader level={0}>
              {domain.title}
            </ArticleSubParagraphHeader>
            <ArticleSubParagraphContent level={1}>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {domain.summary}
              </p>
              <p>{domain.details}</p>
              <p className="font-mono text-xs leading-6 text-muted-foreground">
                Structure: {domain.structure}
              </p>
              {gatewayEndpointGroups.some(group => group.id === domain.id) ? (
                <ArticleLink href={`/document#gateway-${domain.id}`}>
                  View {domain.title} API operations
                </ArticleLink>
              ) : (
                <p className="text-sm text-muted-foreground">
                  This resource is available in Notegic, but does not currently
                  have a public integration API.
                </p>
              )}
            </ArticleSubParagraphContent>
          </ArticleSubParagraph>
        );
      })}
    </>
  );
};
export default Resources;
