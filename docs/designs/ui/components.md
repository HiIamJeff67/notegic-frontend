# Components

Look up the interaction before creating a component. Reuse the owner in this
table. A new entry point passes context and callbacks into that owner. This
catalog complements [Reuse the owning interaction](../../conventions/01-ui.md#reuse-the-owning-interaction).

Primitives live in `apps/web/src/components/ui/` and own Radix or Base UI
behavior plus `data-slot`. Feature code consumes those files. Add a primitive
there only when the control does not exist yet.

## Primitives

| Need | Use | Boundary |
| --- | --- | --- |
| Action | `button.tsx` `Button` | Variants: `default`, `destructive`, `outline`, `secondary`, `ghost`, `link`. Sizes: `default`, `sm`, `lg`, `icon`. `asChild` composes a link. Sets `data-slot="button"` and `data-size`. |
| Grouped actions | `button-group.tsx` | Horizontal or vertical joined buttons. Do not overlap borders by hand. |
| Text field | `input.tsx` `Input` | One-line field. Number spinners are already hidden globally. |
| Multiline | `textarea.tsx` | Multi-line field. Participates in density. |
| Field with adornment | `input-group.tsx` | Prefix, suffix, and inset buttons. `AuthCodeInput` is the code-field composition; do not rebuild that layout with InputGroup. |
| Debounced text | `components/inputs/DebouncedInput.tsx` | Local value, 500ms default, flush on blur. Used by widgets such as Todo. |
| Label | `label.tsx` | Visible label. Icon-only controls use `aria-label` or a tooltip instead. |
| Checkbox, switch, slider | `checkbox.tsx`, `switch.tsx`, `slider.tsx` | Boolean and range. Switch thumb color is global. |
| Select | `select.tsx` | Menu select. A select that must contain custom content uses `ContainableSelect`. |
| Calendar day | `calendar.tsx` | `data-density-static`. DatePicker, TimePicker, and BlockNote calendar compose it. |
| Tabs | `tabs.tsx` | In-page sections and code-example languages. Code tabs do not use ToggleGroup. |
| Toggle | `toggle.tsx`, `toggle-group.tsx` | Pressed state for a mode, not navigation tabs. |
| Dialog | `dialog.tsx` | Modal confirmations and forms. See [layout](layout.md#dialog-actions). |
| Sheet | `sheet.tsx` | Edge panels. Settings uses `SettingsSheet`. |
| Drawer-less menus | `dropdown-menu.tsx`, `context-menu.tsx`, `menubar.tsx` | Use the item wrappers so keyboard and density stay intact. |
| Command palette rows | `command.tsx` | App and article command. Do not build a second filtered list. |
| Popover, hover card, tooltip | `popover.tsx`, `hover-card.tsx`, `tooltip.tsx` | Small floating surfaces. Entity hover detail is `HoverDetailCard`, which composes these. |
| Toast | `toast.tsx`, `toaster.tsx`, `@shared/lib/toast/toast` | One provider in the root. Call `toast.success` / `toast.error`. See [Toast feedback](../../conventions/01-ui.md#toast-feedback). |
| Card | `card.tsx` | `bg-card`, `rounded-xl`, `shadow-sm`. Do not wrap every form in a card. |
| Table | `table.tsx` | Data tables. Column dividers use `SeparatableTable`. |
| Separator, marker | `separator.tsx`, `marker.tsx` | Divider, or a captioned divider. |
| Progress, spinner, skeleton | `progress.tsx`, `spinner.tsx`, `skeleton.tsx` | Inline pending and placeholder. Full-screen pending is `LoadingCover`, not a new spinner overlay. |
| Avatar, breadcrumb | `avatar.tsx`, `breadcrumb.tsx` | Identity image and hierarchy. Workspace paths also have `ItemPath`. |
| Accordion, collapsible | `accordion.tsx`, `collapsible.tsx` | Disclosure sections. Sidebar groups already use the sidebar primitive. |
| Sidebar chrome | `sidebar.tsx` | App and article sidebars. Do not copy the menu-button styles into a feature. |
| Resizable panels | `resizable.tsx` | Split panes. Sidebar width uses `ResizableSidebar`. |
| Form | `form.tsx` | Shared field wiring. A dialog that is one input can keep a local `<form>`. |
| Code | `code-block.tsx` | Highlighted, copyable code. `CodeExamplePanel` is the documentation composition. |
| Aspect ratio, ring | `aspect-ratio.tsx`, `ring.tsx` | Media ratio and the small ring used by version and chart decorations. |

## Shared compositions

| Need | Owner | Callers and boundary |
| --- | --- | --- |
| Account verification code | `components/inputs/AuthCodeInput.tsx` | Account modification, security, and binding tabs. Input plus send/resend button, `useAuthCode`, six digits. Public auth does not use it. |
| Public auth form | `components/panels/AuthPanel/AuthPanel.tsx` | Sign-in, registration, and password reset. Owns labels, right-side field buttons, OAuth row, and the instrument-panel skin. |
| Bot check | `components/commons/CloudflareTurnstile/CloudflareTurnstile.tsx` | Auth and any flow that already requires a Turnstile token. |
| Rename any supported object | `components/dialogs/RenameDialog/RenameDialog.tsx` | Opened through `ModalProvider`. Callers pass title, description, current name, and the mutation. |
| Delete shelf item | `dialogs/ShelfItemDialogs/DeleteShelfItemDialog` | Shelf content. Do not copy its footer into a station dialog. |
| Delete station or routine | `DeleteStationDialog`, `DeleteRoutineDialog` | Station/routine domain. Same destructive footer pattern. |
| Create shelf item, station, routine, tag, task | The dialog folder of that noun | One dialog per create flow. Share fields such as `ColorSelector`; do not merge the dialogs into one generic creator. |
| Image upload, crop, background | `dialogs/ImageDialog/`, `commons/Image`, `commons/ImageCropper` | One cropper and one image cache. See [Icons and images](../../conventions/03-icons-and-images.md). |
| Blocking loading | `components/covers/LoadingCover/` | `LoadingCover`, `AppLoadingCover`, `LoadingProvider`. See [Loading feedback](../../conventions/01-ui.md#loading-feedback). |
| Local database recovery | `covers/LocalDBRecoveryCover` | The only recovery cover. |
| Date, time, weekday, month day, timezone | `DatePicker`, `TimePicker`, `WeekdayPicker`, `MonthlyDayPicker`, `TimezoneSelector` | Schedule fields. They opt calendar controls out of density. |
| Tag and accent color | `ColorSelector` | Routine tag create and inspector. It owns saved swatches and opens `ColorPicker`. Call `ColorSelector`, not `ColorPicker`, from a feature. |
| Select with custom content | `ContainableSelect` | Inspector fields that outgrow `Select`. |
| Truncated label | `TruncatedText` | Sidebar, graph, and editor titles. Pass the available width. |
| Entity hover detail | `HoverDetailCard` | Sidebar and entity menus. It already yields to context menus. |
| Close or edit affordance on a child | `Closeable`, `Editable` | Corner actions. Edit uses the mapped `SquarePen` icon. |
| Drag and drop | `Draggable`, `Droppable`, `DNDable`, `DropFileZone` | Use the existing DND type in `dnd.type.ts` before adding a type. |
| Resize a region | `WidthResizable`, `HeightResizable`, `XYResizable`, or `ui/resizable` | Match the existing axis. Sidebar resize stays in `ResizableSidebar`. |
| Expand a dashboard control | `Extendable` | Dashboard edit chrome. |
| Delayed fallback | `DeferredSuspense` | Avoid a flash of fallback. Do not add another suspense delay helper. |
| Table with vertical rules | `SeparatableTable` | Wraps `Table` and draws rules after the given column indexes. |
| Documentation page | `Article`, `ArticleContent`, `ArticleNavigationBar`, `ArticleSidebar`, `ArticleCommand` | Public document and website pages. |
| Documentation code | `panels/CodeExamplePanel` | Composes `code-block` and tabs. |
| HTTP method pill | `ArticleMethodBadge` | Uses the HTTP color tokens. |
| Workspace path | `paths/ItemPath` | Breadcrumb of shelf and item identity. |
| Version identity | `VersionCard` | About and version surfaces. |
| Notification list | `popovers/NotificationPopover.tsx` and `NotificationDetailPopover` | The notification entry. `NotificationDialog` is the dialog form of that flow. |
| Dashboard widgets | `components/widgets/` | Clock, calendar, timer, todo, scratch pad, guide, video guide. Register a widget in the existing `basic.ts` / guide module. See [widget conventions](../../conventions/09-widgets.md). |
| Charts | `components/charts/` | `BarChart`, `ColumnChart`, `LineChart`, `PieChart`, `BaseChart`, `ChartFrame`. Colors from `getChartColor`. Routine overview widgets compose these; they do not reimplement scales. |

## Feature-owned surfaces

These are the product surfaces. New behavior of the same kind goes through
them. Do not extract a second copy because a menu and a toolbar both need it.

| Surface | Owner |
| --- | --- |
| App shell | `core/AppUtilitiesWrapper`, including `AppSidebar`, `AppCommand`, `SidebarHoverCard`, `ResizableSidebar` |
| Block pack editing | `core/BlockPackEditor` |
| Material reading | `core/MaterialViewer` |
| Routine overview | `core/RoutineOverviewer` and its tables, filters, scope bar, time rails, and charts |
| Routine dependency graph | `core/RoutineTaskDependencyGraphEditor` and `RoutineTaskGraphNode` |
| Station and routine inspectors | `components/inspectors/` hosted by `StationRoutineInspectorHost` |
| Entity menus | `components/menus/` one folder per entity, plus `HomeMenu` and `SettingMenu` |
| Settings sheet | `sheets/SettingsSheet` rendering the account and preferences pages |
| Page backgrounds | `backgrounds/GridBackground` for public auth; `PlaceableBackground`, `ProgressiveBackground`, `LazyBackground`, and `TerrainBackground` for their existing surfaces |
| Placeholders | `holders/MapPlaceholder`, `holders/WrapPlaceholder` |

Entity icons are not in this table. Import them from
`components/icons/WorkspaceEntityIcons.ts` and choose the glyph from the
[Icon map](../../conventions/icon-map.md).

## Fields that must stay separate

`AuthCodeInput` is the reusable account-settings code field. It always renders
a numeric six-digit `Input` named `authCode`, with `autoComplete="one-time-code"`.
When `send.email` is set, it shows Send, Resend, or the countdown and calls
`useAuthCode`.

`AuthPanel` takes an `inputs` array. A code field there is one of those inputs
with a `rightButton`. Password reset states this in
`pages/auth/ForgetPasswordPage.tsx`: public recovery uses the AuthPanel field
instead of `AuthCodeInput`. The panel also owns Turnstile gating, the green
instrument title, and OAuth buttons. Those are not props on `AuthCodeInput`.

`DebouncedInput` is the reusable delayed text field. A single controlled
`Input` does not need it.

## Menu and feedback patterns

- Entity context menus live beside the entity (`RootShelfMenu`,
  `MaterialMenu`, `RoutineMenu`, and the rest). Add an action to that menu.
- `SettingMenuButton` owns the action button for account setting rows. Its
  minimum width reserves four character widths plus the current density's
  horizontal padding and room for an outline border.
- Success and failure of a dialog mutation use `toast` from
  `@shared/lib/toast/toast`, with `t` and `tError` at the call site.
- A pending mutation disables both footer buttons and shows `Spinner` inside
  the button that is working. It does not also mount a `LoadingCover` for a
  short dialog mutation.
- Empty and loading placeholders inside a dialog use the existing
  `*Skeleton` file in that dialog folder when one exists.
