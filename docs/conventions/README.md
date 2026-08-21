# Notegic Frontend Conventions

This directory is the shared baseline for developers and agents changing the
frontend. The existing codebase is the source of truth; these documents turn
recurring patterns into explicit rules for new work.

## How to use

1. Read the documents that match the change scope before implementation.
2. Follow the nearest established pattern in the same directory or feature.
3. Prefer the smallest change that preserves existing behavior and public
   contracts.
4. Update the relevant convention when a cross-feature decision changes.
5. Treat naming rules as forward-looking unless a migration issue explicitly
   owns a rename.

## Document index

| Document | Scope |
| --- | --- |
| [01-ui.md](01-ui.md) | UI primitives, composition, accessibility, and responsive layout |
| [02-styles.md](02-styles.md) | Tailwind tokens, global CSS, density, motion, and visual language |
| [03-icons-and-images.md](03-icons-and-images.md) | Entity icons, action icons, images, and media ownership |
| [04-file-and-folder-naming.md](04-file-and-folder-naming.md) | TypeScript file names, folder names, route names, and role suffixes |
| [05-helpers-and-abstractions.md](05-helpers-and-abstractions.md) | Helper functions, shared utilities, abstraction boundaries, and directness |
| [06-react-hooks.md](06-react-hooks.md) | Hook ownership, lifecycle boundaries, local logic, and hook-specific reuse |

## Priority order

1. Correctness, security, data integrity, and existing public contracts.
2. Explicit conventions in this directory.
3. Established patterns adjacent to the changed feature.
4. Framework conventions, especially TanStack Router route-file syntax.
5. The smallest readable, testable implementation.

## Scope rule

Do not add a shared abstraction, package, or dependency for a possible future
platform. This documentation currently covers the Web application only. Future
application architecture is tracked in Linear and should not be introduced
into the codebase docs until that work begins.
