# Notegic Desktop

The desktop shell is a Tauri 2 window. Its webview composes `packages/` and
desktop-owned screens through TanStack Router. It does not import `apps/web`,
and it does not boot TanStack Start's server runtime, Nitro, or SQLocal.

The current `@/` alias still points at `apps/web/src`. That import is a defect
[NOT-153](https://linear.app/notegic/issue/NOT-153/initialize-the-tauri-desktop-shell)
removes. Files both apps use move into `packages/` first. Account and data requests
belong in `apps/desktop/src/api/functions/` and use a bearer token. The native
SQLite sidecar is a later gate. A Node sidecar starts with the window and
rejects a request that lacks its per-launch token.

The Web runtimes the desktop bundle replaces, and the Web client behavior it
still mounts, are the current gap in
[Shared application boundaries](../../docs/designs/systems/shared-application-boundaries.md).

[NOT-153](https://linear.app/notegic/issue/NOT-153/initialize-the-tauri-desktop-shell)
owns this shell. The editor and SQLite gates remain in
[desktop application preparation](../../docs/designs/systems/desktop-application-preparation.md).

## Local development

Requirements are the repository Node.js version from [`.nvmrc`](../../.nvmrc)
and Rust 1.90, which Tauri 2.12 needs. `src-tauri/rust-toolchain.toml` selects
that toolchain when rustup is installed. Install dependencies from the
repository root, then open the window:

```sh
npm install
npm run dev:desktop
```

The window uses the system webview: WKWebView on macOS and WebView2 on Windows.
Rust owns the window and the sidecar process.
