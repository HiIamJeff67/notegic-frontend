# Desktop application preparation

First validation gate for the desktop shell. Run it after the desktop
application is initialized. Passing this gate is required before sync, RAG, or
agent work.

Execution is tracked on [Build Frontend Features](https://linear.app/notegic/project/build-frontend-features-bef74d7ff77e),
Milestone 2 - Bring Web Features to Initialize Desktop Application:

- [NOT-153](https://linear.app/notegic/issue/NOT-153/initialize-the-tauri-desktop-shell)
  initializes the Tauri 2 shell. Both gates are blocked by it.
- [NOT-154](https://linear.app/notegic/issue/NOT-154/prove-blocknote-in-the-desktop-webview)
  is Gate 1.
- [NOT-155](https://linear.app/notegic/issue/NOT-155/open-native-sqlite-from-the-desktop-sidecar)
  is Gate 2.

Related boundaries:

- [Frontend architecture](../codebases/frontend-architecture.md)
- [API, query, storage, and platform boundaries](api-query-storage-platform-boundaries.md)

## Goal

Prove two things:

1. Tauri 2's system webview can host the current BlockNote editor, including
   CJK composition.
2. A TypeScript sidecar can read and write the current Drizzle SQLite schema
   through native SQLite.

## Non-goals

- Choosing a mobile framework.
- Building the sync protocol, RAG index, or agent runtime.
- Replacing the web app's TanStack Start, Nitro, or GraphQL path.
- Treating Electron as the initial shell.
- Moving repositories or adding submodules in this gate.

## Decision

Tauri 2 is the default shell. Three processes stay separate:

| Process | Owns |
| --- | --- |
| System webview | React UI, BlockNote, in-memory `Y.Doc`, TanStack Router and Query |
| TypeScript sidecar (Node) | Native SQLite now; sync, RAG, and the agent later |
| Tauri (Rust) | Window, signing, keychain, sidecar lifecycle, later file associations |

Rust stays a thin operating-system boundary. Tauri commands are local IPC.
They are not TanStack Start server functions, and domain logic stays in
TypeScript next to the Drizzle schema.

The webview keeps React 19, TanStack Router, TanStack Query, BlockNote 0.54,
Yjs 13, Tailwind, xyflow, pdf.js, and the existing UI.

The desktop runtime does not take TanStack Start, Nitro, Apollo as its primary
read/write path, SQLocal, OPFS, or the browser CSRF cookie. Sign-in uses a
device session in the OS keychain and sends a bearer token. The sidecar
accepts only the webview that holds its per-launch localhost token.

If CJK composition in BlockNote is unstable on WKWebView or WebView2, replace
the shell with Electron. The sidecar boundary stays. Electron is the fallback
shell, not a second architecture. Cursor uses Electron because the editor is
the product; this gate exists for the same reason.

## Repository

The frontend repository is expected to become private. Public distribution is
an SDK that wraps the API, plus documentation, brought into the backend and
frontend repositories as submodules. Desktop code, agent prompts, and tool
implementations stay in the private frontend repository.

## What the checks use

The current editor schema lives in `shared/lib/blockpack/editor.ts`: code,
math, diagram, calendar, and Yjs collaboration. Block bytes for the web app
are cached in IndexedDB through `LocalYjsDocumentStore`.

The web app's local database is SQLocal (WASM SQLite in a worker, stored in
OPFS) with Drizzle over `drizzle-orm/sqlite-proxy`. Table definitions use
`drizzle-orm/sqlite-core` under `apps/web/src/api/local/schemas/`. That schema
package is the one the sidecar must open. The web worker, OPFS, and
cross-origin isolation stay on the web app.

Desktop writes go only to the local database. The web simulator and
synchronizer path is a remote-first cache, and this gate does not reuse it.

## Gate 1 — Editor on the system webview

Open one existing BlockPack in the Tauri window. Repeat on macOS (WKWebView)
and Windows (WebView2).

- [ ] Compose Chinese, Japanese, and Korean text in a paragraph without
      dropped, duplicated, or prematurely committed characters.
- [ ] Drag the BlockNote side-menu handle and reorder a block.
- [ ] Edit a code block, including selection and indentation.
- [ ] Edit a math block and a diagram block.
- [ ] Copy and paste blocks inside the editor, and paste text into the editor
      from outside the app.
- [ ] Reload the window and show the same document content.

A composition failure fails the shell. Record the platform, webview version,
and a short reproduction, then switch the shell to Electron. Do not change the
sidecar or a later sync contract to work around it.

## Gate 2 — Native SQLite through the sidecar

- [ ] The sidecar opens one native SQLite file with the Node driver and Drizzle,
      using the existing `sqlite-core` schema.
- [ ] A shelf row written by the sidecar reads back with the same ids and
      timestamps.
- [ ] That write does not open SQLocal, OPFS, or IndexedDB.
- [ ] `Y.Doc` update bytes for the opened BlockPack are stored in SQLite.
- [ ] Quitting and reopening the app restores the shelf row and those document
      bytes.

## After this gate

Start sync and agent work only after both gates pass. macOS must pass both.
Windows must pass Gate 1 before the shell is treated as proven.
