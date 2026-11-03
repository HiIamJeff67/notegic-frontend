# Versions

Previous records past work. Current identifies work in progress today. Next is the upcoming release. Future outlines tentative plans that may change.

## 0.3.0 — Next

The next release brings together improvements to editing, routines, file viewing, recovery, and documentation. The completed work below is being prepared for this release; 0.3.0 remains upcoming until it is announced.

- [x] **More capable note editing**
  Improve code blocks, syntax highlighting, keyboard shortcuts, and editing controls across different screen sizes.

- [x] **More dependable routine graph editing**
  Preserve graph drafts, make saving explicit, and improve activation and schedule configuration feedback.

- [x] **Clearer routine execution history**
  Improve record ordering, filtering, pagination, and the presentation of task inputs, results, and failures.

- [x] **Recoverable editing connections**
  Improve reconnection and recovery so temporary connection interruptions are less disruptive to ongoing editing.

- [x] **Improved material viewing**
  Refresh uploaded files without resetting the viewer, streamline zoom and page controls, and improve loading and file access.

- [x] **Clearer settings and feedback**
  Refine profile images, sidebar behavior, responsive layouts, notifications, and translated input-validation messages.

- [x] **Explicit local data recovery**
  Provide local data exports, recovery checks, and a user-confirmed rebuild flow with clearer guidance.

- [x] **Published guides and learning materials**
  Expand the public documentation with complete website guidance, tutorial videos, screenshots, and public API explanations.

## 0.4.0 — Future

This planned version focuses on finding information faster and making everyday work more convenient. The scope and order of delivery may change, with smaller fixes included as needed.

- [ ] **Unified workspace search**
  Bring existing searches together so people can find notes, reference files, and routine-related items from one entry point.

- [ ] **Search filters and fuzzy matching**
  Narrow results by useful conditions and make searches more tolerant of incomplete or approximate queries.

- [ ] **A global quick-search launcher**
  Open search from anywhere in the app using a keyboard shortcut, then navigate directly to a result. The default shortcut will be chosen after compatibility checks.

- [ ] **More account sign-in options**
  Plan additional sign-in providers, including Meta, Apple, X, and GitHub, with availability confirmed as each integration is completed.

- [ ] **More practical dashboard widgets**
  Add useful everyday widgets and improve the existing dashboard experience as their scope is defined.

## 0.5.0 — Future

This is the planned first milestone for AI integration. Notegic would provide note context, tools, and workflow integration, while inference comes from providers connected by the user. The exact experience will be decided through this milestone. Work toward 1.0.0 will depend on what it establishes rather than a fixed list of later releases.

- [ ] **Connect supported AI providers**
  Explore user-provided API keys and supported provider-account authorization, including subscription access where available. Connecting a model provider is separate from signing in to Notegic.

- [ ] **A first note-focused AI workflow**
  Validate a small, usable flow for working with selected notes and saving useful results before expanding the AI experience.

- [ ] **MCP and tool calling**
  Explore controlled access to note and workflow actions, making it clear which content an AI interaction may read or change.

- [ ] **A direction for knowledge retrieval**
  Define how RAG and retrieval could use existing notes and references, without committing this milestone to a complete retrieval system.

- [ ] **Decide how conversations and notes work together**
  Evaluate chat, editable notes, and graph-based relationships, then describe the next concrete capabilities based on the results.

- [ ] **Evaluate desktop and local agent work**
  Consider a desktop application for local files, task execution, and note management. Its timing and the path toward 1.0.0 depend on the AI integration decisions.

## 0.2.0 — Current

Work on the current 0.2 series continues while we prepare 0.3.0. Its completed capabilities include collaboration, offline change recovery, API key management, notifications, and workspace settings.

- [x] **Richer document blocks**
  Use more structured content types while editing and collaborating on documents.

- [x] **Collaborative editing improvements**
  Keep document changes synchronized while multiple people edit together.

- [x] **Routine execution updates**
  See updates when your automation tasks start and finish.

- [x] **Collaboration permissions**
  Manage Owner, Admin, Write, and Read access, transfer ownership, and leave shared workspaces.

- [x] **Offline change recovery**
  Manage local data preferences and recover pending changes when your connection returns.

- [x] **Public API and API key management**
  Create and revoke integration keys, review usage, and explore the public API reference.

- [x] **Notification panel and inbox**
  Read incoming notifications, distinguish unread items, and remove notifications from the panel or inbox.

- [x] **Settings and workspace refinement**
  Refine shelf interactions, account settings, avatars, branding, preferences, theme behavior, and local data controls.

## 0.1.0 — Previous

The previous release brought the core knowledge workspace together with structured editing, materials, routines, and integration controls.

- [x] **Account and session flows**
  Register, sign in, recover your password, and connect supported sign-in providers.

- [x] **Root shelves and sub-shelves**
  Organize work into nested locations with ordering, item paths, permissions, search, and trash recovery flows.

- [x] **Block Pack editor**
  Create structured documents with custom blocks, diagrams, math, tables, and block-level editing actions.

- [x] **Realtime synchronization**
  Keep shared documents and workspace changes up to date while collaborating.

- [x] **Materials and file viewers**
  Store reference materials with metadata and view PDFs, images, text, and other supported attachment formats.

- [x] **Stations and routines**
  Connect stations to repeatable routines, routine tags, scheduled tasks, payload editors, and execution records.

- [x] **Dashboard widgets**
  Customize the dashboard with practical widgets, background images, local layout preferences, and workspace shortcuts.

- [x] **Local-first data controls**
  Choose how data is kept on your device and adjust private previews, display density, language, and theme.

- [x] **Account security settings**
  Edit profile information, manage linked providers, review security controls, and configure account modifications.

- [x] **Public API and API keys**
  Publish an OpenAPI-based HTTP contract with server-side API key creation, rotation, revocation, and usage guidance.

- [x] **Theme-aware documentation**
  Provide API, privacy, tutorial, and license documentation that adapts to the selected theme and display density.

## 0.0.1 — Previous

The first usable Notegic workspace: an account, a place to organize knowledge, and a dependable local-first editing base.

- [x] **Initial account registration**
  Create a Notegic account and establish the basic authenticated workspace boundary.

- [x] **Workspace hierarchy**
  Introduce the first shelf structure for keeping notes, documents, and references organized by context.

- [x] **Local persistence**
  Keep the essential workspace state available locally so the interface remains useful between network requests.

- [x] **Initial document editing**
  Provide the first editable document surface for capturing and revising structured knowledge.

- [x] **Basic preferences**
  Add the first controls for language, appearance, and workspace presentation preferences.

- [x] **Responsive workspace shell**
  Make the core navigation and workspace usable across desktop and smaller screen layouts.
