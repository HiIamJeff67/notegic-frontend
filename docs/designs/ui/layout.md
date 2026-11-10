# Layout

The workspace is one horizontal shell. Public pages are not inside that shell.
Overlays keep their own scroll and always leave a close or cancel control
reachable. Flex children that hold text use `min-w-0` so they shrink instead
of pushing the page wider than the viewport.

## Shells

| Surface | Owner | Structure |
| --- | --- | --- |
| Signed-in app | `components/core/AppUtilitiesWrapper/AppUtilitiesWrapper.tsx` | `flex min-h-svh w-full min-w-0 flex-1`, containing `AppCommand`, `AppSidebar`, and `AppSidebarInset`. |
| Page body | `AppSidebarInset` | `h-dvh min-w-0 min-h-0 overflow-hidden` on the resizable inset. The page inside scrolls, the shell does not grow a second page scrollbar. |
| Public auth | Route page plus `GridBackground` and `AuthPanel` | Centered panel, `min-h-screen`, horizontal padding `px-4 sm:px-8`. No sidebar, no account providers. |
| Public documents | `components/commons/Article/` | Root route. Article sidebar may wrap labels. Content is `min-w-0 flex-1` with `--article-inline-padding`. |
| Settings | `components/sheets/SettingsSheet/SettingsSheet.tsx` | Non-modal right sheet, `modal={false}`, width `min(94vw, 38rem)` down to `min(52vw, 38rem)` at `lg`. Outside interaction does not dismiss it. |
| Command palette | `AppCommand` | Pull-down overlay. Article pages use `ArticleCommand` and the same `app-command.css`. |

App-only pages live under the `_root` route so they receive the sidebar and
account providers. A public page is a root route and must not depend on that
chrome. This repeats the route rule in
[UI conventions](../../conventions/01-ui.md#responsive-layout) because layout
breaks when a public page assumes the shell.

## Spacing

Parent sections get more space than sibling options. Use the density variables
when the gap should follow the user's density setting:

- `--density-content-gap` between sections;
- `--density-content-padding` inside a padded region;
- `--density-control-height` is applied by the global slot rules, so a normal
  button or input does not also set a fixed `h-10` unless it opts out;
- menu and sidebar rows use `--density-menu-item-height`.

Fixed workspace bands use `--app-toolbar-height` (`3rem`) and
`--app-navigation-height`. Do not invent a second toolbar height for one
editor.

`Marker` (`components/ui/marker.tsx`) is the labeled divider: `default` for a
quiet caption, `separator` for a caption with rules on both sides, and
`border` for a caption sitting on a bottom border. Use it instead of a raw
`<hr>` plus a span when a section needs a caption.

## Overlays

Dialogs use `components/ui/dialog.tsx`:

- overlay is `fixed inset-0 z-50 bg-overlay`;
- content is `bg-card`, `max-w-[calc(100%-2rem)]`, `sm:max-w-lg`, `gap-4`,
  `rounded-lg`, `border`, `p-6`, `shadow-lg`, centered with translate;
- header is `flex flex-col gap-2 text-center sm:text-left`;
- footer is `flex flex-col-reverse gap-2 sm:flex-row sm:justify-end`, so the
  last action is the visual primary on a narrow screen and sits on the right
  from `sm` up;
- the close icon is part of `DialogContent` unless `showCloseButton={false}`.

Sheets use `components/ui/sheet.tsx`. The default side is right, `w-3/4` until
`sm:max-w-sm`, with a border on the inner edge. Settings replaces that width
locally; other sheets should start from the primitive.

Do not fix overlapping popovers by raising `z-index`. Sidebar previews yield
to context menus through `ContextMenuProvider` and `SidebarHoverCard`, as
specified in [UI conventions](../../conventions/01-ui.md#composition-and-interaction).

## Dialog actions

Put both actions in `DialogFooter`. Match the existing dialog of the same
kind.

Destructive confirmation, as in `DeleteStationDialog`,
`DeleteRoutineDialog`, and `DeleteShelfItemDialog`:

1. Cancel, `type="button"`, `variant="outline"`, closes without submitting.
2. The verb, `variant="destructive"`, with `Spinner` while the mutation is
   pending.

Labels follow
[Two-action confirmation dialogs](../../conventions/01-ui.md#two-action-confirmation-dialogs):
one verb when the title already has the object, **Continue** to advance a
step, **Confirm** for a routine confirmation, **Delete permanently** when
permanence matters, and a disabled completion label such as **Verified** when
the action cannot be repeated.

Create and rename dialogs that already exist (`CreateStationDialog`,
`RenameDialog`, and the other create dialogs beside them) use a different
current pair: Cancel is `variant="destructive"` and the submit button is
`variant="default"`. A new create or rename flow joins that owner or that
pair. Do not invent a third footer, and do not restyle those dialogs as part
of an unrelated change.

## Regions that already have a layout

| Region | Rule |
| --- | --- |
| Sidebar rows | Entity icon, truncated name through `TruncatedText`, disclosure chevron for shelves. Hover cards close while a context menu is open. |
| Inspectors | `inspector-surface` plus `inspector.css`. Opened from the shared edit action, not a second panel. |
| Routine graph | Start is a `size-20` circle with the title outside. Other tasks are `min-w-56 max-w-64 rounded-md bg-card`. Handles stay on the node. |
| Routine tables and charts | Tables use `SeparatableTable` or `components/ui/table`. Charts sit in `ChartFrame` / `ChartWidgetFrame` and scroll inside the overview, not the shell. |
| Dashboard | Widgets occupy frame cells. Editing chrome uses `Extendable`. Widget persistence stays with [widget conventions](../../conventions/09-widgets.md). |
| Editors | BlockNote owns the document surface. Toolbar height aligns to `--app-toolbar-height`. Suggestion menus are styled in `block-editor.css`. |
| Forms | One column, `min-w-0`, labels through `components/ui/label` or an accessible name. Related fields group with a `Marker` or vertical gap, not a new card per field. |

## Narrow widths

- Page content in a flex row has `min-w-0` and wraps or stacks.
- Dialog content already uses `w-full max-w-[calc(100%-2rem)]`. A local
  `w-4/5` on an existing dialog is that dialog's choice; a new dialog can
  keep the primitive default.
- Footer buttons stack through `flex-col-reverse` below `sm`. Do not pin them
  to a single non-wrapping row.
- Sheet close and primary actions stay inside the visible panel. Settings
  pins the close control to the top-right of the sheet.
- Sidebar labels truncate. Article navigation labels wrap, because
  `article.css` overrides the fixed row height there only.
