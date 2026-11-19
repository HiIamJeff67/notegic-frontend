<a href="https://www.notegic.com"><img src="apps/web/assets/logo/header-image.png" alt="Notegic" /></a>

# Notegic Frontend

Notegic is a workspace for turning notes, reference materials, and recurring
work into an organized, connected workflow. This repository contains the
applications that people use to create, manage, and collaborate on that work.

## Highlights

- Organize content into shelves, folders, materials, and block packs.
- Write and share structured documents with live collaboration.
- Plan routines, tasks, dependencies, and their progress.
- Personalize dashboards, preferences, and account settings.
- Manage notifications, connected sign-in methods, and API keys.

## Applications

| Application | Status | Details |
| --- | --- | --- |
| [Web](apps/web/README.md) | Available | Browser experience, local setup, supported features, and Web-specific architecture. |
| [Desktop](apps/desktop/README.md) | Shell | Tauri 2 window. The web UI, sidecar, and preparation gates are not in this shell yet. |
| Mobile | Planned | Its README will live at `apps/mobile/README.md` when the application is introduced. |

## Repository structure

```text
apps/
  web/              Current browser application
  desktop/          Tauri 2 desktop shell
  mobile/           Future mobile application boundary
packages/
  api/              Contracts, GraphQL inputs, and the client SDK
  hooks/            DOM hooks and providers
  i18n/             Translation resources
  lib/              Libraries, shared types, and reducers
  ui/               Components, shadcn primitives, and theme CSS
docs/               Product, architecture, and operating documentation
test/               Frontend verification
scripts/            Repository tooling
```

For application-specific setup, commands, technical decisions, and folder
structure, start with the relevant README under `apps/`. The broader
documentation map is in [docs/README.md](docs/README.md).

## License

Proprietary software by Notegic — All rights reserved. Use of this repository
is governed by the [EULA](LICENSE.md) and its [Traditional Chinese version](<LICENSE(tw).md>).
Third-party licenses are listed in [LICENSES/third_party](LICENSES/third_party).

<!-- DEVLOG:START -->
## Development log

This section is automatically maintained from the current change and recent local Git history. Detailed intent belongs in commit messages and design documents.

### Recent snapshots

- [2026-11/2026-11-20](docs/devlogs/2026-11/2026-11-20.md)
- [2026-11/2026-11-19](docs/devlogs/2026-11/2026-11-19.md)
- [2026-11/2026-11-17](docs/devlogs/2026-11/2026-11-17.md)
- [2026-11/2026-11-16](docs/devlogs/2026-11/2026-11-16.md)
- [2026-11/2026-11-15](docs/devlogs/2026-11/2026-11-15.md)
<!-- DEVLOG:END -->
