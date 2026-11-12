# Notegic Desktop

The desktop shell is a Tauri 2 window. It does not load the Web application,
`shared/`, BlockNote, or the Node sidecar.

[NOT-153](https://linear.app/notegic/issue/NOT-153/initialize-the-tauri-desktop-shell)
owns the shell. The preparation gates in
[desktop application preparation](../../docs/designs/systems/desktop-application-preparation.md)
start after this window can host the current editor and a native SQLite sidecar.
Those pieces are not part of this shell yet.

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
Rust owns the window process only.
