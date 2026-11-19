# Desktop shell and Tauri

Rules for the Notegic desktop shell. They follow the Tauri v2 project layout,
command names, permission identifiers, and sidecar layout published at
[v2.tauri.app](https://v2.tauri.app/). Rust code inside `src-tauri/` also
follows ordinary Rust naming and `rustfmt`.

The webview under `apps/desktop/src/` stays on the TypeScript, React, and test
conventions in this directory. It imports `packages/` and its own tree. It does
not import `apps/web`. Product boundaries for that webview stay in
[Desktop application preparation](../designs/systems/desktop-application-preparation.md)
and [Shared application boundaries](../designs/systems/shared-application-boundaries.md).

## Ownership

| Path | Owns | Follow |
| --- | --- | --- |
| `apps/desktop/src/` | React entry and the code router | `main.tsx`, `router.tsx` |
| `apps/desktop/src/pages/` | Desktop screens | Web `pages/` naming. No `routes/` file tree |
| `apps/desktop/src/api/functions/` | PascalCase API functions in `domain.function.ts` | Same role as Web `api/functions/` |
| `apps/desktop/src/api/local/` | Inert replacements for Web `api/local` | Not the native SQLite driver |
| `apps/desktop/src/api/server/` | Inert Start server and `async_hooks` replacements | Delete when Web imports are gone |
| `apps/desktop/src/api/tokens/` | Client-held tokens, including the in-memory access token | Same folder role as Web `api/tokens/` |
| `apps/desktop/src-tauri/` | Window, capabilities, permissions, and process lifecycle | This document |
| `apps/desktop/package.json` | Frontend `dev`, `build`, and `tauri` scripts | This document |
| `packages/` | Portable TypeScript contracts | Existing package ownership |

Do not rename a Tauri-owned file so that it matches a TypeScript role suffix.
Do not apply these Rust names to `apps/web/` or `packages/`.

## Project layout

Keep the Tauri layout. Do not invent a parallel Rust tree.

```text
apps/desktop/
  package.json
  index.html
  src/
    main.tsx
    router.tsx
    styles.css
    pages/
  test/
    boundary/
    e2e/
    results/
  sidecars/
    driver/
  src-tauri/
    Cargo.toml
    Cargo.lock
    build.rs
    tauri.conf.json
    src/lib.rs
    src/main.rs
    src/sidecar.rs
    src/native_auth.rs
    capabilities/
    permissions/
    icons/
    binaries/
    gen/schemas/
```

- `test/` holds desktop-only suites in the category directories from [08-testing.md](08-testing.md). `release/` is available to desktop and a future mobile app. Create a category directory only when a suite needs it. `test/results/` is generated Playwright output and is not committed.
- `tauri.conf.json` is the marker the CLI uses to find the Rust project. The default format is JSON. A platform override is `tauri.macos.conf.json`, `tauri.windows.conf.json`, or `tauri.linux.conf.json`, merged with JSON Merge Patch. Arrays in an override replace the base array. The window sets `dragDropEnabled` to false so widget drops stay in the webview. The native file-drop handler otherwise takes the drop, and the widget returns to where the drag started.
- `build.rs` calls `tauri_build::build()` only.
- `src/lib.rs` owns `run()` and `#[cfg_attr(mobile, tauri::mobile_entry_point)]`. It declares domain modules, registers their state, and lists commands in `generate_handler!`.
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
| Rust modules and files | snake_case | `sidecar.rs` |
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

A command lives at the bottom of the domain module that owns its state. It is `pub` so `lib.rs` can name it in `generate_handler!`. The module path is not part of the invoke name, so `sidecar::sidecar_session` is still invoked as `sidecar_session`. Do not collect commands into `src/commands/`: that module can call only the domain's public items, so private methods would have to be widened for a pass-through.

Rust parameters stay snake_case. Tauri serializes command arguments as camelCase. Add `#[tauri::command(rename_all = "snake_case")]` only when a caller must send snake_case. Structs that cross this boundary use `#[serde(rename_all = "camelCase")]`. An `async` command takes owned arguments, not `&str` or `State<'_, T>`.

Return a `Result` for a failure the webview can handle. Format Rust with `rustfmt` defaults. Do not add a project `rustfmt.toml` unless a Tauri or Rust default cannot express the constraint.

## Rust modules

One file is one domain. The domain's center is its struct. A child module exists only for a second type or a separate privacy boundary. Do not give each method its own file. `lib.rs` stays the composition root.

Separate domains in the same file with the Zed `sep30` snippet. Put a short domain name in the title, such as `Sidecar`. The marker is a block comment with thirty `=` signs on each side of that name.

Inside a domain, declare helper types first, then the main struct, then that struct's `impl` directly underneath it. Name methods after the behavior. The struct already supplies the domain, so `Sidecar::start` does not repeat `sidecar` in the method name. Keep a method private when only the domain uses it. Domain constants sit above the helper types.

Avoid a free helper. The same rule as [Helpers and Abstraction Boundaries](05-helpers-and-abstractions.md) applies: inline a one-use step, and do not add a function whose name only restates the lines. When a helper is still warranted:

- Used by one method: keep it as a private function in that domain, or as a private method on the impl. Do not make it `pub` or `pub(crate)`. The exported surface is the type and the methods it helps.
- Used by more than one file in the same category: give that category its own module and import it.
- Used by more than one domain in this file only, with no prospect of another file needing it: put those functions once at the top of the file, above every domain. Prefer removing this case. A file-wide helper is a sign the file holds unrelated domains.

After the last domain, add one `sep30` section titled `Commands`. Tauri command functions go there and nowhere else in the file. A command reads or calls its domain type. It does not grow a second copy of the behavior.

The last `sep30` section is titled `Tests`. It holds `#[cfg(test)] mod tests` and sits below the commands. Tests stay inside the domain module so they can call private methods. Do not add a sibling `*_test.rs`. A large test module may live at `<domain>/tests.rs` only as a child module declared with `#[path]`.

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

The current shell starts `sidecars/driver/server.ts` with a system `node` process. That process is the database sidecar. It opens the native SQLite file with Drizzle. Rust passes the app data directory path and does not open the database. Do not copy this process for another sidecar. Package a new sidecar as a binary.

## Frontend scripts

`apps/desktop/package.json` keeps `dev`, `build`, and `tauri`. `beforeDevCommand` and `beforeBuildCommand` call `dev` and `build`. The webview does not boot TanStack Start or Nitro; that boundary is in the desktop preparation design.
