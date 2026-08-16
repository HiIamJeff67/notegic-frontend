# Icons and Images Conventions

## Canonical workspace entity icons

Use `src/components/icons/WorkspaceEntityIcons.ts` for entity identity. The same base icon must appear in navigation, context menus, linked-item pickers, Trash, empty states and future search results.

| Entity | Canonical export | Notes |
| --- | --- | --- |
| Root shelf | `RootShelfIcon` | Notegic custom shelf icon. `EmptyShelfIcon` is only the collapsed/open-state variation in the sidebar. |
| Sub shelf | `SubShelfIcon` | A folder. Use `FolderPlus` only for the create action. |
| Material | `MaterialIcon` | A text/file document. |
| Block pack | `BlockPackIcon` | A package. `PackagePlus` is only the add-items group/action. |
| Station | `StationIcon` | Notegic custom station icon; a user-selected emoji may replace it in a station row. |
| Routine | `RoutineIcon` | A clipboard clock. |
| Routine task | `RoutineTaskIcon` | A clipboard list. |
| Routine tag | `RoutineTagIcon` | A tag. |

## Entity identity vs. actions

- Render the base entity icon next to an existing object, even when that object is deleted, linked, selected or shown in a hover card.
- Use an action-specific Lucide icon for verbs: `PlusIcon`/`FolderPlus` for create, `PencilIcon` for rename/edit, `Trash2Icon` for delete, `ArchiveRestoreIcon` for restore, `ExternalLinkIcon` for open, `SearchIcon` for search, and `GripVerticalIcon` for drag.
- Do not use a generic archive, blocks, tree or file icon as a substitute for an entity when a canonical icon exists.
- Custom user emoji is content, not a replacement for the canonical fallback. Show it where the object supports customization; fall back to the canonical icon when it is absent.

## Icon implementation

- Use `lucide-react` for general-purpose icons and pass Tailwind size classes (`size-4`, `size-5`) in menus and controls.
- Keep Notegic domain glyphs in `src/components/icons/`; they accept the shared `IconProps` contract and use `currentColor`.
- Do not introduce an icon library for a single glyph or embed unlabelled SVG markup in feature components.
- Icon-only controls require an accessible name. Decorative icons next to visible text do not.

## Images and media

- Use `@unpic/react`'s `Image` for remote/profile/upload-preview images that have a stable URL and should receive dimensions and `alt` text.
- Use a raw `img` for local static assets, Blob/object URLs, editor-rendered material content and progressive background layers. Set `alt`; use an empty `alt` only for decorative imagery.
- Use `object-cover` for avatars, covers and thumbnails; preserve the source aspect ratio for document/material content.
- User-selected application backgrounds belong in `BackgroundImagesProvider` and IndexedDB. Do not put user-uploaded background data in global CSS or static assets.
- Local brand assets belong under `src/assets/`; public immutable files such as favicon assets belong under `public/`.
- Image upload/crop flows use the existing Image dialog and `ImageCropper`; do not add a second cropper or image cache.
