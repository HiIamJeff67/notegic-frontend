# UI components

Look up the interaction before writing a new component. This document is how
to choose and reuse an existing owner. What the result should look like is in
the [UI appearance](../designs/ui/appearance.md). Icons stay in the
[Icon map](icon-map.md).

Primitives live in `apps/web/src/components/ui/` and own Radix or Base UI
behavior plus `data-slot`. Feature code imports those files. Add a primitive
there only when the control does not exist yet.

## Primitives

| Need | Use | How to use it |
| --- | --- | --- |
| Action | `Button` from `ui/button` | Variants: `default`, `destructive`, `outline`, `secondary`, `ghost`, `link`. Sizes: `default`, `sm`, `lg`, `icon`. `asChild` composes a link. |
| Joined actions | `ui/button-group` | Horizontal or vertical group. Do not overlap borders by hand. |
| One-line field | `Input` from `ui/input` | Number spinners are already hidden globally. |
| Multiline field | `ui/textarea` | Participates in density. |
| Field adornment | `ui/input-group` | Prefix, suffix, and inset buttons. A verification code uses `AuthCodeInput`, not a new InputGroup. |
| Delayed text | `components/inputs/DebouncedInput.tsx` | Local value, 500ms default, flush on blur. A single controlled `Input` does not need it. |
| Label | `ui/label` | Visible label. Icon-only controls use `aria-label` or a tooltip. |
| Checkbox, switch, slider | `ui/checkbox`, `ui/switch`, `ui/slider` | Boolean and range. Switch thumb color is global. |
| Select | `ui/select` | Menu select. Custom content uses `ContainableSelect`. |
| Calendar day | `ui/calendar` | `data-density-static`. Date and time pickers compose it. |
| Tabs | `ui/tabs` | In-page sections and documentation code languages. Code tabs do not use ToggleGroup. |
| Pressed mode | `ui/toggle`, `ui/toggle-group` | A mode, not navigation. |
| Dialog | `ui/dialog` | `DialogFooter` for the action row. See [Two-action confirmation dialogs](01-ui.md#two-action-confirmation-dialogs). |
| Sheet | `ui/sheet` | Edge panel. Settings uses `SettingsSheet`. |
| Menus | `ui/dropdown-menu`, `ui/context-menu`, `ui/menubar` | Use the item wrappers so keyboard behavior and density stay intact. |
| Command rows | `ui/command` | App and article command palettes. |
| Small floating surface | `ui/popover`, `ui/hover-card`, `ui/tooltip` | Entity detail uses `HoverDetailCard`. |
| Toast | `@shared/lib/toast/toast` | `toast.success` and `toast.error`. One provider in the root. See [Toast feedback](01-ui.md#toast-feedback). |
| Card, table | `ui/card`, `ui/table` | Column dividers use `SeparatableTable`. |
| Divider | `ui/separator`, `ui/marker` | `Marker` variants: `default`, `separator`, `border`. |
| Inline pending | `ui/spinner`, `ui/skeleton`, `ui/progress` | A screen that cannot be used yet uses `LoadingCover`, not a new overlay. |
| Sidebar chrome | `ui/sidebar` | App and article sidebars. |
| Code | `ui/code-block` | Documentation pages compose it through `CodeExamplePanel`. |

## Shared compositions

| Need | Import | Boundary |
| --- | --- | --- |
| Account verification code | `components/inputs/AuthCodeInput.tsx` | Account modification, security, and binding. Public auth does not use it. |
| Public auth form | `components/panels/AuthPanel/AuthPanel.tsx` | Sign-in, registration, and password reset. Pass fields through `inputs`. |
| Bot check | `components/commons/CloudflareTurnstile/CloudflareTurnstile.tsx` | Flows that already require a Turnstile token. |
| Rename | `components/dialogs/RenameDialog/RenameDialog.tsx` | Open through `ModalProvider`. Pass title, description, current name, and the mutation. |
| Delete a shelf item, station, or routine | The delete dialog for that noun | Do not copy one domain's dialog into another. |
| Create a shelf item, station, routine, tag, or task | The create dialog for that noun | Share a field such as `ColorSelector`. Do not merge the dialogs into one generic creator. |
| Image upload, crop, background | `dialogs/ImageDialog/`, `commons/Image`, `commons/ImageCropper` | One cropper. See [Icons and images](03-icons-and-images.md). |
| Blocking loading | `components/covers/LoadingCover/` | See [Loading feedback](01-ui.md#loading-feedback). |
| Local database recovery | `covers/LocalDBRecoveryCover` | The only recovery cover. |
| Date, time, weekday, month day, timezone | `DatePicker`, `TimePicker`, `WeekdayPicker`, `MonthlyDayPicker`, `TimezoneSelector` | Schedule fields. |
| Tag color | `ColorSelector` | It owns saved swatches and opens `ColorPicker`. Features call `ColorSelector`. |
| Select with custom content | `ContainableSelect` | Inspector fields that outgrow `Select`. |
| Truncated label | `TruncatedText` | Pass the available width. |
| Entity hover detail | `HoverDetailCard` | It already yields to context menus. |
| Corner close or edit | `Closeable`, `Editable` | Edit uses the mapped `SquarePen` icon. |
| Drag and drop | `Draggable`, `Droppable`, `DNDable`, `DropFileZone` | Reuse a DND type from `dnd.type.ts` before adding one. |
| Resize | `WidthResizable`, `HeightResizable`, `XYResizable`, or `ui/resizable` | Sidebar resize stays in `ResizableSidebar`. |
| Dashboard edit chrome | `Extendable` | Widget persistence stays in [widget conventions](09-widgets.md). |
| Documentation page | `Article` and its navigation, sidebar, and command | Public document routes. |
| Documentation sample | `CodeExamplePanel` | Pass the source strings. See [Documentation code examples](01-ui.md#documentation-code-examples). |
| HTTP method pill | `ArticleMethodBadge` | Uses the HTTP color tokens. |
| Workspace path | `paths/ItemPath` | Shelf and item identity. |
| Notifications | `NotificationPopover`, `NotificationDetailPopover`, `NotificationDialog` | Do not add a second notification list. |
| Charts | `components/charts/` | Colors from `getChartColor`. Routine overview composes these charts. |

## Feature surfaces

Add behavior of the same kind to the existing owner. Do not copy the surface
because a second entry point needs it.

| Surface | Owner |
| --- | --- |
| Signed-in shell | `core/AppUtilitiesWrapper`, including sidebar, command, hover card, and resizable sidebar |
| Block pack editing | `core/BlockPackEditor` |
| Material reading | `core/MaterialViewer` |
| Routine overview | `core/RoutineOverviewer` |
| Routine graph | `core/RoutineTaskDependencyGraphEditor` and `RoutineTaskGraphNode` |
| Inspectors | `components/inspectors/`, hosted by `StationRoutineInspectorHost` |
| Entity menus | `components/menus/`, one folder per entity |
| Settings | `sheets/SettingsSheet` |
| Dashboard widgets | `components/widgets/` |
| Public auth backdrop | `backgrounds/GridBackground` with `AuthPanel` |

## Fields that stay separate

`AuthCodeInput` is the account-settings code field. It renders a six-digit
`Input` named `authCode` and, when `send.email` is set, the send, resend, and
countdown action.

`AuthPanel` takes an `inputs` array. A public code field is one of those
inputs with a `rightButton`. Password reset says this in
`pages/auth/ForgetPasswordPage.tsx`. Do not import `AuthCodeInput` into the
public panel. The panel also owns its Turnstile slot and OAuth buttons.

Entity icons are imported from
`components/icons/WorkspaceEntityIcons.ts`. Choose the glyph from the
[Icon map](icon-map.md).
