# Icons and Images Conventions

## Find and register icons

Check the [Icon map](icon-map.md) before choosing an icon. It lists existing
semantic entity aliases, Lucide exports and aliases, custom/OAuth components,
user emoji and inline/brand exceptions with source references. Reuse the
existing choice for the same meaning; add a new entry in the same change only
when no suitable icon exists. Keep this Markdown inventory current instead of
adding a second runtime icon registry or duplicating SVGs in feature code.

## Canonical workspace entity icons

Use `apps/web/src/components/icons/WorkspaceEntityIcons.ts` for entity identity. The same base icon must appear in navigation, context menus, linked-item pickers, Trash, empty states and future search results.

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
- Use an action-specific Lucide icon for verbs: `PlusIcon`/`FolderPlus` for create, `SquarePen` for edit/open Inspector, `Pencil` for rename, `Trash2Icon` for delete, `ArchiveRestoreIcon` for restore, `ExternalLinkIcon` for open, `SearchIcon` for search, and `GripVerticalIcon` for drag. PDF drawing may keep `PencilIcon`; drawing is not an Inspector action.
- Use `BookOpenIcon` for Document navigation and guide links, `RefreshCw`/`RefreshCwIcon` for refresh/retry, and `CopyIcon`/`Copy` for copying. Preserve `RotateCcwIcon` for reset, and `CheckIcon` for confirmed-copy feedback; these are different states/actions, not competing glyphs.
- Do not use a generic archive, blocks, tree or file icon as a substitute for an entity when a canonical icon exists.
- Custom user emoji is content, not a replacement for the canonical fallback. Show it where the object supports customization; fall back to the canonical icon when it is absent.

## Icon implementation

- Use `lucide-react` for general-purpose icons and pass Tailwind size classes (`size-4`, `size-5`) in menus and controls.
- Keep Notegic domain glyphs in `apps/web/src/components/icons/`; they accept the shared `IconProps` contract and use `currentColor`.
- Do not introduce an icon library for a single glyph or embed unlabelled SVG markup in feature components.
- Icon-only controls require an accessible name. Decorative icons next to visible text do not.

## Images and media

- Prefer `Image` from `@/components/commons/Image/Image` for product images,
  particularly large images, previews and images that should load lazily. Article,
  profile avatars/covers, background pickers, page headers and Material image
  previews share this owner. Do not duplicate load state or blur animations in
  each caller. It accepts local/remote URLs and Blob/object URLs without rewriting
  them or generating extra image requests.
- Keep native `img` or a library image primitive where the existing owner needs
  different behavior: small brand assets, BlockNote-rendered content, Radix Avatar
  loading/fallback composition, cropper internals and the two-layer
  `ProgressiveBackground` thumbnail/full-image transition. `@unpic/react` remains
  available when a supported image CDN's URL transformations are actually needed;
  do not assume it generates thumbnails for arbitrary local files.
- Set `alt`; use an empty `alt` only for decorative imagery.
- Use `object-cover` for avatars, covers and thumbnails; preserve the source aspect ratio for document/material content.
- User-selected application backgrounds belong in `BackgroundImagesProvider` and IndexedDB. Do not put user-uploaded background data in global CSS or static assets.
- Local brand assets belong under `apps/web/assets/`; public immutable files such as favicon assets belong under `apps/web/public/`.
- Image upload/crop flows use the existing Image dialog and `ImageCropper`; do not add a second cropper or image cache.

### Shared Image loading and reveal

`Image` defaults to native `loading="lazy"`, `decoding="async"` and a 350ms
reveal from an 8px blur. The existing parent background remains visible until the
image loads. This is an appearance transition after loading, not a low-resolution
preview during download. No thumbnail generation or additional dependency is
required.

The parent owns its background, dimensions/aspect ratio and `overflow-hidden`
clipping. The component renders one `img`, without a layout wrapper. Supply
`width`/`height` or a sized parent to prevent layout shifts, and keep controls
above the animated image when needed. Keep object URL creation/revocation with
the owner that reads the File/Blob; never call `URL.createObjectURL()` in render.

Use the native `loading`, `decoding`, `fetchPriority`, `srcSet` and `sizes` props
for browser loading behavior. Use `loading="eager"` for immediately needed
avatars, page-header images, upload previews and active Material previews; set
high fetch priority only for genuinely important first-screen images. Native
lazy loading may fetch images before they enter the viewport; it has no
application-defined delay or scroll-distance setting.

`reveal={false}` disables the reveal while retaining loading state. `blur` is
the starting blur in pixels and `duration` is the transition duration in
milliseconds. Both system reduced-motion and the application's
`html[data-reduce-motion="true"]` disable the reveal. These presentation props do
not delay downloads or replace the shared blocking LoadingCover flow.

`onLoadingStatusChange` reports `"loading" | "loaded" | "error"` per `src` so a
caller can drive an indicator, release its existing LoadingCover or show its
existing fallback. It includes cached results and failures that happened before
hydration; source changes start a new loading state. Native `onLoad` and `onError`
remain available for actual browser events. The shared Image does not show its
own spinner, toast or error panel. Responsive `srcSet` candidate selection stays
with the browser; do not treat the status callback as download progress.

```tsx
import Image, {
  type ImageLoadingStatus,
} from "@/components/commons/Image/Image";
import { useState } from "react";

const CoverPreview = ({ coverURL }: { coverURL: string }) => {
  const [imageStatus, setImageStatus] = useState<ImageLoadingStatus>("loading");
  return (
    <div
      className="aspect-video overflow-hidden rounded-sm bg-muted"
      aria-busy={imageStatus === "loading"}
    >
      <Image
        src={coverURL}
        alt="Project cover"
        width={1200}
        height={675}
        className="size-full object-cover"
        loading="lazy"
        blur={8}
        duration={350}
        onLoadingStatusChange={setImageStatus}
      />
    </div>
  );
};
```

Use `imageStatus` in the caller's existing indicator/fallback when needed;
ordinary non-blocking document images do not need a global loading cover.
