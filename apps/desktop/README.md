# Notegic Desktop

The desktop shell is a Tauri 2 window. Its webview renders the existing web
pages and components through TanStack Router. It does not boot TanStack Start's
server runtime, Nitro, or SQLocal.

Account and data requests from those components still use the web client until
the bearer-token client and native SQLite sidecar exist. Server function calls
reject. The local database boundary stays disabled. A Node sidecar starts with
the window and rejects a request that lacks its per-launch token.

The files that stay out of the desktop runtime are listed in
[webview-source-skips.md](webview-source-skips.md).

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
