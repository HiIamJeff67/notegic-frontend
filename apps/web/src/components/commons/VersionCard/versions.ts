export type VersionTask = {
  title: string;
  description: string;
  completed: boolean;
};

export type VersionData = {
  version: string;
  label: string;
  status: "next" | "current" | "released";
  description: string;
  tasks: readonly VersionTask[];
};

export const versionRoadmap: readonly VersionData[] = [
  {
    version: "0.3.0",
    label: "Next",
    status: "next",
    description:
      "The next release focuses on AI integration and a more advanced, human-centered conversational interface that connects dialogue with Notegic's existing note structure.",
    tasks: [
      {
        title: "Unified workspace search",
        description:
          "Search across root shelves, sub-shelves, Block Packs, materials, routines, and tags from one entry point.",
        completed: false,
      },
      {
        title: "Search filters and keyboard access",
        description:
          "Narrow results by resource type and update time, with a keyboard-first quick search flow.",
        completed: false,
      },
      {
        title: "Improve routine scheduling",
        description:
          "Make schedule previews, execution feedback, retries, overdue tasks, and routine task lifecycle states clearer.",
        completed: false,
      },
      {
        title: "AI-integrated document blocks",
        description:
          "Extend the BlockNote schema safely so AI-generated content can work with math, diagrams, calendar configuration, projection, collaboration, and future integrations.",
        completed: false,
      },
      {
        title: "Structured AI conversations",
        description:
          "Build a more capable and human-centered conversation experience that can reference existing notes, organize responses into reusable blocks, and turn dialogue into structured knowledge.",
        completed: false,
      },
      {
        title: "Provide more videos for tutorial and document",
        description:
          "Add more guided videos for tutorials and documentation so users can understand core workflows and discover more of Notegic's capabilities.",
        completed: false,
      },
      {
        title: "Public API gateway evolution",
        description:
          "Continue separating public API gateway responsibilities from client session flows and document compatibility and migration boundaries.",
        completed: false,
      },
    ],
  },
  {
    version: "0.2.0",
    label: "Current",
    status: "current",
    description:
      "The current release extends the original workspace baseline with collaboration, local policy enforcement, public API groundwork, notification delivery, and refined workspace controls.",
    tasks: [
      {
        title: "Custom BlockNote blocks",
        description:
          "Add custom document blocks and align the editor schema with the realtime document model.",
        completed: true,
      },
      {
        title: "Yjs editor write path",
        description:
          "Move editor structural writes to the realtime Yjs channel and retire the legacy REST mutation flow.",
        completed: true,
      },
      {
        title: "Realtime routine task lifecycle",
        description:
          "Deliver user-targeted running and completed task lifecycle events over the realtime connection.",
        completed: true,
      },
      {
        title: "Collaboration permissions",
        description:
          "Align Owner, Admin, Write, and Read permissions with ownership transfer, self-leave, quota ownership, and realtime channel access.",
        completed: true,
      },
      {
        title: "Local policy and offline queue enforcement",
        description:
          "Connect localVault and offlineQueue settings to local database readiness, transaction retries, terminal failures, logout scoping, and online recovery.",
        completed: true,
      },
      {
        title: "Public API and API key groundwork",
        description:
          "Add the public API contract, API key management, realtime transport documentation, quota UI, and generated API reference pages.",
        completed: true,
      },
      {
        title: "Notification panel and inbox",
        description:
          "Add notification list, unread, read, and delete contracts together with cache integration, realtime notification frames, the notification popover, and the inbox dialog.",
        completed: true,
      },
      {
        title: "Settings and workspace refinement",
        description:
          "Refine shelf interactions, account settings, avatars, branding, preferences, theme behavior, and local data controls.",
        completed: true,
      },
    ],
  },
  {
    version: "0.1.0",
    label: "Released",
    status: "released",
    description:
      "The previous release brought the core knowledge workspace together with structured editing, materials, routines, and integration controls.",
    tasks: [
      {
        title: "Account and session flows",
        description:
          "Support registration, sign-in, password recovery, OAuth redirects, session refresh, and account-level error handling.",
        completed: true,
      },
      {
        title: "Root shelves and sub-shelves",
        description:
          "Organize work into nested locations with ordering, item paths, permissions, search, and trash recovery flows.",
        completed: true,
      },
      {
        title: "Block Pack editor",
        description:
          "Create structured documents with BlockNote, custom blocks, diagrams, math, tables, and block-level editing actions.",
        completed: true,
      },
      {
        title: "Realtime synchronization",
        description:
          "Synchronize collaborative document changes and workspace mutations while keeping local caches and pending work isolated.",
        completed: true,
      },
      {
        title: "Materials and file viewers",
        description:
          "Store reference materials with metadata and view PDFs, images, text, and other supported attachment formats.",
        completed: true,
      },
      {
        title: "Stations and routines",
        description:
          "Connect stations to repeatable routines, routine tags, scheduled tasks, payload editors, and execution records.",
        completed: true,
      },
      {
        title: "Dashboard widgets",
        description:
          "Customize the dashboard with practical widgets, background images, local layout preferences, and workspace shortcuts.",
        completed: true,
      },
      {
        title: "Local-first data controls",
        description:
          "Manage local database, offline queue, attachment cache, private previews, density, language, and theme preferences.",
        completed: true,
      },
      {
        title: "Account security settings",
        description:
          "Edit profile information, manage linked providers, review security controls, and configure account modifications.",
        completed: true,
      },
      {
        title: "Public API and API keys",
        description:
          "Publish an OpenAPI-based HTTP contract with server-side API key creation, rotation, revocation, and usage guidance.",
        completed: true,
      },
      {
        title: "Theme-aware documentation",
        description:
          "Provide API, privacy, tutorial, and license documentation that adapts to the selected theme and display density.",
        completed: true,
      },
    ],
  },
  {
    version: "0.0.1",
    label: "Foundation",
    status: "released",
    description:
      "The first usable Notegic workspace: an account, a place to organize knowledge, and a dependable local-first editing base.",
    tasks: [
      {
        title: "Initial account registration",
        description:
          "Create a Notegic account and establish the basic authenticated workspace boundary.",
        completed: true,
      },
      {
        title: "Workspace hierarchy",
        description:
          "Introduce the first shelf structure for keeping notes, documents, and references organized by context.",
        completed: true,
      },
      {
        title: "Local persistence",
        description:
          "Keep the essential workspace state available locally so the interface remains useful between network requests.",
        completed: true,
      },
      {
        title: "Initial document editing",
        description:
          "Provide the first editable document surface for capturing and revising structured knowledge.",
        completed: true,
      },
      {
        title: "Basic preferences",
        description:
          "Add the first controls for language, appearance, and workspace presentation preferences.",
        completed: true,
      },
      {
        title: "Responsive workspace shell",
        description:
          "Make the core navigation and workspace usable across desktop and smaller screen layouts.",
        completed: true,
      },
    ],
  },
];

export const getVersionProgress = (versions: readonly VersionData[]) => {
  const tasks = versions.flatMap(version => version.tasks);
  return {
    completed: tasks.filter(task => task.completed).length,
    total: tasks.length,
  };
};
