// Generated from apps/web/src/pages/document/versions/sources/versions.md; run npm run generate:document.
import type { VersionData } from "@/components/commons/VersionCard/VersionCard";
export const versionsDescription =
  "Previous records past work. Current identifies work in progress today. Next is the upcoming release. Future outlines tentative plans that may change.";
export const versionRoadmap: readonly VersionData[] = [
  {
    version: "0.3.0",
    label: "Next",
    status: "next",
    description:
      "The next release brings together improvements to editing, routines, file viewing, recovery, and documentation. The completed work below is being prepared for this release; 0.3.0 remains upcoming until it is announced.",
    tasks: [
      {
        title: "More capable note editing",
        description:
          "Improve code blocks, syntax highlighting, keyboard shortcuts, and editing controls across different screen sizes.",
        completed: true,
      },
      {
        title: "More dependable routine graph editing",
        description:
          "Preserve graph drafts, make saving explicit, and improve activation and schedule configuration feedback.",
        completed: true,
      },
      {
        title: "Clearer routine execution history",
        description:
          "Improve record ordering, filtering, pagination, and the presentation of task inputs, results, and failures.",
        completed: true,
      },
      {
        title: "Recoverable editing connections",
        description:
          "Improve reconnection and recovery so temporary connection interruptions are less disruptive to ongoing editing.",
        completed: true,
      },
      {
        title: "Improved material viewing",
        description:
          "Refresh uploaded files without resetting the viewer, streamline zoom and page controls, and improve loading and file access.",
        completed: true,
      },
      {
        title: "Clearer settings and feedback",
        description:
          "Refine profile images, sidebar behavior, responsive layouts, notifications, and translated input-validation messages.",
        completed: true,
      },
      {
        title: "Explicit local data recovery",
        description:
          "Provide local data exports, recovery checks, and a user-confirmed rebuild flow with clearer guidance.",
        completed: true,
      },
      {
        title: "Published guides and learning materials",
        description:
          "Expand the public documentation with complete website guidance, tutorial videos, screenshots, and public API explanations.",
        completed: true,
      },
    ],
  },
  {
    version: "0.4.0",
    label: "Future",
    status: "future",
    description:
      "This planned version focuses on finding information faster and making everyday work more convenient. The scope and order of delivery may change, with smaller fixes included as needed.",
    tasks: [
      {
        title: "Unified workspace search",
        description:
          "Bring existing searches together so people can find notes, reference files, and routine-related items from one entry point.",
        completed: false,
      },
      {
        title: "Search filters and fuzzy matching",
        description:
          "Narrow results by useful conditions and make searches more tolerant of incomplete or approximate queries.",
        completed: false,
      },
      {
        title: "A global quick-search launcher",
        description:
          "Open search from anywhere in the app using a keyboard shortcut, then navigate directly to a result. The default shortcut will be chosen after compatibility checks.",
        completed: false,
      },
      {
        title: "More account sign-in options",
        description:
          "Plan additional sign-in providers, including Meta, Apple, X, and GitHub, with availability confirmed as each integration is completed.",
        completed: false,
      },
      {
        title: "More practical dashboard widgets",
        description:
          "Add useful everyday widgets and improve the existing dashboard experience as their scope is defined.",
        completed: false,
      },
    ],
  },
  {
    version: "0.5.0",
    label: "Future",
    status: "future",
    description:
      "This is the planned first milestone for AI integration. Notegic would provide note context, tools, and workflow integration, while inference comes from providers connected by the user. The exact experience will be decided through this milestone. Work toward 1.0.0 will depend on what it establishes rather than a fixed list of later releases.",
    tasks: [
      {
        title: "Connect supported AI providers",
        description:
          "Explore user-provided API keys and supported provider-account authorization, including subscription access where available. Connecting a model provider is separate from signing in to Notegic.",
        completed: false,
      },
      {
        title: "A first note-focused AI workflow",
        description:
          "Validate a small, usable flow for working with selected notes and saving useful results before expanding the AI experience.",
        completed: false,
      },
      {
        title: "MCP and tool calling",
        description:
          "Explore controlled access to note and workflow actions, making it clear which content an AI interaction may read or change.",
        completed: false,
      },
      {
        title: "A direction for knowledge retrieval",
        description:
          "Define how RAG and retrieval could use existing notes and references, without committing this milestone to a complete retrieval system.",
        completed: false,
      },
      {
        title: "Decide how conversations and notes work together",
        description:
          "Evaluate chat, editable notes, and graph-based relationships, then describe the next concrete capabilities based on the results.",
        completed: false,
      },
      {
        title: "Evaluate desktop and local agent work",
        description:
          "Consider a desktop application for local files, task execution, and note management. Its timing and the path toward 1.0.0 depend on the AI integration decisions.",
        completed: false,
      },
    ],
  },
  {
    version: "0.2.0",
    label: "Current",
    status: "current",
    description:
      "Work on the current 0.2 series continues while we prepare 0.3.0. Its completed capabilities include collaboration, offline change recovery, API key management, notifications, and workspace settings.",
    tasks: [
      {
        title: "Richer document blocks",
        description:
          "Use more structured content types while editing and collaborating on documents.",
        completed: true,
      },
      {
        title: "Collaborative editing improvements",
        description:
          "Keep document changes synchronized while multiple people edit together.",
        completed: true,
      },
      {
        title: "Routine execution updates",
        description: "See updates when your automation tasks start and finish.",
        completed: true,
      },
      {
        title: "Collaboration permissions",
        description:
          "Manage Owner, Admin, Write, and Read access, transfer ownership, and leave shared workspaces.",
        completed: true,
      },
      {
        title: "Offline change recovery",
        description:
          "Manage local data preferences and recover pending changes when your connection returns.",
        completed: true,
      },
      {
        title: "Public API and API key management",
        description:
          "Create and revoke integration keys, review usage, and explore the public API reference.",
        completed: true,
      },
      {
        title: "Notification panel and inbox",
        description:
          "Read incoming notifications, distinguish unread items, and remove notifications from the panel or inbox.",
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
    label: "Previous",
    status: "previous",
    description:
      "The previous release brought the core knowledge workspace together with structured editing, materials, routines, and integration controls.",
    tasks: [
      {
        title: "Account and session flows",
        description:
          "Register, sign in, recover your password, and connect supported sign-in providers.",
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
          "Create structured documents with custom blocks, diagrams, math, tables, and block-level editing actions.",
        completed: true,
      },
      {
        title: "Realtime synchronization",
        description:
          "Keep shared documents and workspace changes up to date while collaborating.",
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
          "Choose how data is kept on your device and adjust private previews, display density, language, and theme.",
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
    label: "Previous",
    status: "previous",
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
