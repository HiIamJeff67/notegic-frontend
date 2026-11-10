# Examples

These are existing product surfaces. Match their structure and components when
a change belongs to the same kind of work. Paths are the owners to open, not
templates to copy into a new folder.

## Public sign-in

The product meets a person as an instrument, then becomes a workspace after
authentication. `pages/auth` renders `GridBackground` and `AuthPanel`. The
panel is at most 450px wide, centered, with corner screws and a green
monospace title. Dark mode uses the `panel-gradient` skin. OAuth providers
use `OAuthIcon`. Turnstile, when required, is `CloudflareTurnstile` in the
panel's `verification` slot.

Do not rebuild this panel from `Card` and `Button` for a new public auth
step. Add an input to the `inputs` array, or a provider to `oauthButtons`.

## Account verification code

Changing email, password, bindings, and security checks inside the workspace
uses one code field: `AuthCodeInput`. Current callers are
`pages/app/setting/account/tabs/AccountModificationTab.tsx`,
`SecurityTab.tsx`, and `BindingTab.tsx`. The field knows how to send, resend,
and count down. Callers pass `value`, `onChange`, and `send.email`.

Password reset on the public site does not use that component. It passes a
code input with `rightButton` to `AuthPanel`, because the panel owns the
public field chrome and the Turnstile gate. That split is intentional.

## Workspace shell

After sign-in the product is a shelf of materials and a station of routines.
`AppUtilitiesWrapper` keeps three regions in one row: command palette,
sidebar, and the inset page. The sidebar identifies objects with
`WorkspaceEntityIcons` and `TruncatedText`. Row menus are the entity menu
folders. Hover detail is `HoverDetailCard`, and it closes while a context
menu is open.

A new workspace object uses its entity icon, its menu folder, and the
existing create dialog. It does not get a new shell.

## Rename

Shelf and station objects share `RenameDialog` through `ModalProvider`. The
dialog is a title, a description, one `Input`, and the create/rename button
pair: destructive Cancel and default submit, with `Spinner` while the rename
is in flight. A new rename entry passes the copy and the mutation callback.
It does not create `RenameShelfDialog` or `RenameRoutineDialog`.

## Destructive delete

Deleting a station uses `DeleteStationDialog`: the title names the action,
the description states the consequence, Cancel is `outline`, and Delete is
`destructive`. Routine and shelf-item deletes use the same footer. The
pending state disables both buttons. Success and failure go through `toast`.

A permanent action uses the permanence wording from
[Two-action confirmation dialogs](../../conventions/01-ui.md#two-action-confirmation-dialogs)
on this same footer.

## Routine graph

A routine is a dependency graph, not a list of cards. `RoutineTaskGraphNode`
draws Start as a circle whose title sits outside the node. An active Start
uses emerald; an inactive Start falls back to muted tokens. Every other task
is a compact `bg-card` rectangle with a status dot (`RoutineTaskStatusDot`),
a truncated title, and context-menu actions for edit and delete. Edit opens
the inspector. The graph editor owns alignment, activation, and filters; their
icons are already in the icon map.

Do not replace Start with a play icon or a generic rounded card.

## Dashboard

The dashboard is a personal surface on the same workspace, not a second
application. Widgets register in `components/widgets/basic/basic.ts` and the
guide module. The built-in set is clock, calendar, timer, todo, scratch pad,
guide, and video guide. Todo text uses `DebouncedInput`. Frame sizes and
local persistence stay with the widget module and
[widget conventions](../../conventions/09-widgets.md). `CreateWidgetDialog`
and `EditWidgetDialog` are the add and edit flows.

A new widget joins that registry. It does not introduce a new grid.

## Settings beside the work

Account and preferences open in `SettingsSheet` over the current page. The
sheet is non-modal, so the workspace remains visible, and clicking outside
does not discard it. The header is visually hidden (`sr-only`) because the
page inside has its own title. Account code fields on those pages are
`AuthCodeInput`. Display-mode and density controls that must stay a fixed
size use `data-density-static`.

Do not navigate to a separate settings application for a new preference.

## Public documentation

Product and API documents use `Article` and `CodeExamplePanel`. Code samples
are tabs of `curl`, `http`, or `json` passed as strings. Copy uses the code
block's copy button. Method badges use `ArticleMethodBadge` and the HTTP
tokens. The article sidebar may wrap long titles; the app sidebar truncates.

Editable documents are BlockNote in the block pack editor, not a second
`CodeExample`.

## Loading and recovery

Opening the app, a large document, or another screen that cannot be used yet
goes through `LoadingCover` and `LoadingProvider`. The logo animation is
`loading.css`. Recovery of local data is `LocalDBRecoveryCover`, with
`ShieldCheckIcon` for the advisory check and `RotateCcwIcon` for the
destructive rebuild.

A button-sized wait uses `Spinner` inside the `Button`. It does not create a
feature loading bar.
