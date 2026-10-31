// Generated from apps/web/src/pages/document/versions/sources/versions.md; run npm run generate:document.
import type { VersionData } from "@/components/commons/VersionCard/VersionCard";
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
          "Bring AI-generated content into structured notes, with support for richer content such as math and diagrams.",
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
    ],
  },
  {
    version: "0.2.0",
    label: "Current",
    status: "current",
    description:
      "The current release improves collaboration, offline change recovery, API key management, notifications, and workspace settings.",
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
    label: "Legacy",
    status: "released",
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
    label: "Legacy",
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
