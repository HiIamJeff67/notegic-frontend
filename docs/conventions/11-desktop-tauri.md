# Desktop shell and Tauri

Rules for the Notegic desktop shell. They follow the Tauri v2 project layout,
command names, permission identifiers, and sidecar layout published at
[v2.tauri.app](https://v2.tauri.app/). Rust code inside `src-tauri/` also
follows ordinary Rust naming and `rustfmt`.

The webview under `apps/desktop/src/` stays on the TypeScript, React, and test
conventions in this directory. Product boundaries for that webview stay in
[Desktop application preparation](../designs/systems/desktop-application-preparation.md).

## Ownership

| Path | Owns | Follow |
| --- | --- | --- |
| `apps/desktop/src/` | React entry, routes, and webview UI | TypeScript conventions in this directory |
| `apps/desktop/src-tauri/` | Window, capabilities, permissions, and process lifecycle | This document |
| `apps/desktop/package.json` | Frontend `dev`, `build`, and `tauri` scripts | This document |
| `shared/` | Portable TypeScript contracts | Existing shared ownership |

Do not rename a Tauri-owned file so that it matches a TypeScript role suffix.
Do not apply these Rust names to `apps/web/` or `shared/`.

## Project layout

Keep the Tauri layout. Do not invent a parallel Rust tree.

```text
apps/desktop/
  package.json
  index.html
  src/
  src-tauri/
    Cargo.toml
    Cargo.lock
    build.rs
    tauri.conf.json
    src/lib.rs
    src/main.rs
    capabilities/
    permissions/
    icons/
    binaries/
    gen/schemas/
```

- `tauri.conf.json` is the marker the CLI uses to find the Rust project. The default format is JSON. A platform override is `tauri.macos.conf.json`, `tauri.windows.conf.json`, or `tauri.linux.conf.json`, merged with JSON Merge Patch. Arrays in an override replace the base array.
- `build.rs` calls `tauri_build::build()` only.
- `src/lib.rs` owns `run()` and `#[cfg_attr(mobile, tauri::mobile_entry_point)]`.
- `src/main.rs` calls that `run()` and stays otherwise unchanged. The called name is `[lib] name` in `Cargo.toml`.
- `capabilities/` holds JSON or TOML capability files. Files in that directory are enabled unless `tauri.conf.json` lists a narrower set.
- `permissions/` holds application permission definitions.
- `icons/` keeps the `tauri icon` outputs: `icon.png`, `icon.icns`, and `icon.ico`.
- `binaries/` holds packaged sidecar executables.
- `gen/schemas/` is generated. Do not edit or commit it.
- Commit `Cargo.lock`.

`tauri` and `tauri-build` stay on the same minor version as `@tauri-apps/cli`. Leave `features = []` on the `tauri` dependency so the CLI enables features from the config.

## Names

| Thing | Form | Example |
| --- | --- | --- |
| Application identifier | Reverse domain, segments of letters, digits, and hyphens | `com.notegic.desktop` |
| `productName` | Display name | `Notegic` |
| Cargo package name | kebab-case crate name | `notegic-desktop` |
| `[lib] name` | snake_case, unique from the binary | `notegic_desktop_lib` |
| Rust modules and files | snake_case | `commands.rs` |
| Rust functions | snake_case | `sidecar_session` |
| Rust types | PascalCase | `SidecarSession` |
| Rust constants | SCREAMING_SNAKE_CASE | `SIDECAR_HEADER` |
| Command invoked from JavaScript | The Rust function name, unique across modules | `invoke("sidecar_session")` |
| Command arguments at the boundary | camelCase JSON keys | `{ "userId": 1 }` for Rust `user_id` |
| Permission identifier | Lowercase ASCII, digits, and internal hyphens | `allow-sidecar-session` |
| Plugin permission | `plugin-name:permission` | `shell:allow-spawn` |
| Capability identifier | kebab-case | `default` |
| Window label | The label in `tauri.conf.json` | `main` |
| Sidecar file | `binaries/<name>` plus `-$TARGET_TRIPLE` | `binaries/notegic-sidecar-aarch64-apple-darwin` |
| Frontend scripts | `dev`, `build`, `tauri` | `beforeDevCommand` runs `dev` |

Permission identifiers allow one colon when a plugin prefix is required. A leading or trailing hyphen, an underscore, or an uppercase letter fails the build. Application commands omit the plugin prefix. The default permission set identifier is `default`.

A command in `lib.rs` is private. A command defined in another module is `pub`. The module path is not part of the invoke name, so `commands::sidecar_session` is still invoked as `sidecar_session`.

Rust parameters stay snake_case. Tauri serializes command arguments as camelCase. Add `#[tauri::command(rename_all = "snake_case")]` only when a caller must send snake_case. Structs that cross this boundary use `#[serde(rename_all = "camelCase")]`. An `async` command takes owned arguments, not `&str` or `State<'_, T>`.

Return a `Result` for a failure the webview can handle. Format Rust with `rustfmt` defaults. Do not add a project `rustfmt.toml` unless a Tauri or Rust default cannot express the constraint.

## Capabilities and permissions

Grant each command explicitly. `core:default` does not expose application commands.

```toml
[[permission]]
identifier = "allow-sidecar-session"
description = "Enables the sidecar_session command."
commands.allow = ["sidecar_session"]
```

Reference that identifier from `capabilities/default.json`. Core and plugin permissions keep their prefix, such as `core:default` and `shell:allow-spawn`. A capability `windows` list uses window labels.

## Sidecar

A new sidecar is a packaged executable under `src-tauri/binaries/`. Configure it with `bundle.externalBin`, for example `binaries/notegic-sidecar`. Spawn it by the file name `notegic-sidecar`, not by the path configured in `externalBin`. Allow it with `shell:allow-execute` or `shell:allow-spawn` and `sidecar: true`. List accepted arguments in the capability, or set `args` explicitly.

The current shell starts `sidecar/server.mjs` with a system `node` process. That process is the existing development sidecar. Do not copy it for another sidecar. Package a new sidecar as a binary.

## Frontend scripts

`apps/desktop/package.json` keeps `dev`, `build`, and `tauri`. `beforeDevCommand` and `beforeBuildCommand` call `dev` and `build`. The webview does not boot TanStack Start or Nitro; that boundary is in the desktop preparation design.
