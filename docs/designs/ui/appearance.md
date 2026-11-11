# UI appearance

This document describes the appearance a person should see, and the
consistency that appearance requires. How to choose a component, where a file
lives, and how stylesheets are owned are in
[UI conventions](../../conventions/01-ui.md),
[UI components](../../conventions/ui-components.md), and
[Style conventions](../../conventions/02-styles.md).

The examples below use those conventions: semantic tokens, existing `Button`
variants, and utilities. They show the shape of the markup, not a new
component.

## What the product feels like

The workspace is a compact industrial tool. Type is monospace. Corners are
small. Surfaces are neutral gray or near-white, and color is reserved for
meaning: the current theme's action color, a destructive action, a quiet
secondary line, or a status that must be recognized at a glance. Borders
contain something or separate two real regions. Space, not extra boxes,
creates hierarchy. Shadows stay small on objects and larger only on a dialog
or a sheet that floats above the work.

The default presentation is the Standard theme on a dark ground: warm metal
for actions, olive as the second hue, and light gray text on near-black
surfaces. A person can switch the ground between dark and light, and can
switch the action color among the built-in themes. The workspace does not
restyle itself per screen. The same action, the same object, and the same
quiet text look the same in the sidebar, a menu, a table, and a dialog.

Public sign-in is the one surface that does not look like the workspace. It
is an instrument panel: dark metal, corner screws, and a green monospace
title. After authentication the product becomes the neutral workspace. Do not
bring the screws, the green title, or the metal gradient into the workspace.

## Color

A person reads color by role.

| Role | Dark ground | Light ground | What it means |
| --- | --- | --- | --- |
| Page ground | `#131313` | `#FDFDFD` | The area behind the work. |
| Recessed strip | `#191919` | `#F7F7F7` | A band set into that ground. |
| Control surface | `#333333` | `#D6D6D6` | Buttons, fields, and other controls. |
| Primary text | `#FAFAFA` | `#0B0B0B` | The words the person is meant to read. |
| Object surface | `#232323` | `#EBEBEB` | A card, a dialog, or a task on the graph. |
| Menu surface | `#2B2B2B` | `#E3E3E3` | A menu or popover. |
| Quiet text | `#9E9E9E` | `#505050` | A placeholder, a path, or a secondary line. |
| Destructive | `#E64B51` | `#D00114` | Delete and other destructive actions. |
| Hairline | white at 11% | `#B1B1B1` | The edge of a contained region. |
| Scrim | black at 56% | black at 36% | The dim layer behind a dialog. |
| Sidebar | `#282828` | `#E8E8E8` | The workspace navigation column. |

These are the sRGB readings of the theme tokens. New interface code uses the
token, so a theme change repaints the role:

```tsx
<section className="min-w-0 bg-canvas text-foreground">
  <article className="rounded-lg border border-border bg-card shadow-sm">
    <h2 className="text-sm font-medium">{title}</h2>
    <p className="text-xs text-muted-foreground">{detail}</p>
  </article>
</section>
```

The action color changes with the selected theme. Standard is `#855732` with
an olive second hue. Neon is violet. Ocean is cool water. Forest is
low-chroma green. Phoenix is deep red. Pearl is pale blue-gray. Sakura is
pink. Citrus is amber. The second hue is decoration, not a second button
style. A feature does not hardcode one theme's action color.

Charts repeat five series in order. On a dark ground they read blue
`#1447E6`, green `#00BC7D`, amber `#FE9A00`, violet `#AD46FF`, and red
`#FF2056`. Documentation method marks use green for GET, yellow for POST,
blue for PUT, violet for PATCH, and the destructive red for DELETE.

Two existing colors are status, not a new palette. An active Routine Start
is emerald `#10B981`. An inactive Start falls back to the quiet surface and
quiet text. The public panel title is green `#4ADE80` on the dark panel and
`#16A34A` on the light panel.

## Type, corner, and elevation

Both interface text and code use JetBrains Mono, then the platform monospace
stack. There is no second UI font.

Corners are 6px for a small mark, 8px for a button, a field, and a graph
task, 10px for a dialog, and 14px for a card. The base radius is 10px.

An object in the workspace may have a small shadow. A dialog or sheet may
have a large shadow. A shadow is not a substitute for a border, and a border
is not added just to make a region visible.

Focus is a two-pixel ring in the theme's ring color, offset from the control.
The ring stays visible.

## Density and motion

Density is a preference, not a separate layout. Balanced is the normal size.
Comfortable gives controls and rows more height and more space. Compact
tightens them. The person should see the same screen, only with more or less
room.

| | Control height | Space between sections | Menu row |
| --- | --- | --- | --- |
| Balanced | 36px | 16px | 32px |
| Comfortable | 40px | 20px | 36px |
| Compact | 32px | 12px | 28px |

A normal button, field, and menu row follow that preference. An icon button
stays square. A calendar grid and a control that must keep a fixed size stay
fixed.

When the person asks for reduced motion, animation and smooth scrolling
collapse. A state that matters is still visible without the animation. Dialogs
and sheets may enter and leave, but a second animation is not added on top.

## Actions

A primary action is filled with the theme action color and its contrasting
text. A secondary action is quieter. A destructive action is the destructive
red with light text. A button that only navigates or dismisses a
non-destructive dialog can be a border with no fill. A button in a row of
tools can be text until the pointer is over it.

```tsx
<Button type="submit">{t("common.create")}</Button>
<Button type="button" variant="outline">{t("common.cancel")}</Button>
<Button type="button" variant="destructive">{t("common.delete")}</Button>
```

On a destructive confirmation the person sees Cancel on the left, bordered,
and the destructive verb on the right, filled red. On a narrow screen the
destructive verb stacks above Cancel so the primary action is reached first.
The title names the object and the consequence. The button uses one verb,
such as **Delete** under **Delete station**. **Continue** advances a step.
**Confirm** accepts a change the description already explained. **Delete
permanently** is used when permanence is the point. A finished one-time
action stays visible and disabled, with a label such as **Verified**.

Create and rename already show Cancel in the destructive color and the submit
action in the normal action color. New work of that kind matches that pair.

A button that is working shows a spinner inside itself and both actions are
unavailable. The rest of the workspace does not gain a second loading panel
for that short wait.

## Space

A parent section has more space than the options inside it. Sections follow
the density gap. Text in a horizontal row shrinks or wraps instead of forcing
the page wider than the window.

```tsx
<div className="flex min-w-0 flex-col gap-[var(--density-content-gap)]">
  <h2 className="text-sm font-medium text-foreground">{section}</h2>
  <p className="truncate text-sm text-muted-foreground">{option}</p>
</div>
```

A caption that divides a form sits on a hairline, or between two hairlines.
It is quiet text, smaller than the section title.

## Surfaces

### Public sign-in

The person sees a centered metal panel, at most about 450px wide, on a black
or white grid. The title is green, monospace, and tracked apart. Corner screws
sit on the panel. The fields are stacked. A code field keeps its send action
inside the field, on the right. Connected accounts appear as a row of provider
marks under the form.

This panel is the exception to the workspace tokens. Its metal gradient, brown
texture, and green title stay on this surface. Workspace screens use the
token example above.

### Workspace

After sign-in the person sees three regions in one row: a command palette, a
navigation column, and the current page. The page scrolls inside its region.
The shell does not grow a second page scrollbar.

Each object in the column shows its own glyph and a name that truncates. A
shelf discloses with a chevron. Pointing at a row can show a detail card.
Opening a menu closes that card. The same object uses the same glyph in the
column, a menu, a list, and an empty state.

### Dialogs

A dialog sits centered over a dim scrim, on an object surface, with a small
radius and a large shadow. The title is left-aligned from a normal window
width upward. A close mark stays in the top-right corner. The actions sit at
the end of the dialog and remain reachable when the window is narrow.

### Settings

Account and preferences open as a panel over the current page, from the right.
The workspace stays visible. Clicking the workspace does not discard the
panel. The panel is wide enough to read a form, and narrows with the window
until it nearly fills a phone. Its close mark stays at the top-right.

### Routine graph

A Start is a circle. Its title sits outside the circle. Active is emerald.
Inactive is quiet. Every other task is a compact object-surface rectangle
with a status dot, one truncated title, and a quiet second line. Selecting a
task draws a soft ring in the action color. The graph is a dependency view,
not a stack of cards.

```tsx
<div className="min-w-56 max-w-64 rounded-md border border-border bg-card px-3 py-2 shadow-sm">
  <p className="min-w-0 truncate text-sm font-medium text-foreground">{title}</p>
  <p className="truncate text-xs text-muted-foreground">{detail}</p>
</div>
```

### Dashboard, documents, and waiting

The dashboard is the same workspace, with personal widgets in a grid. A new
widget joins that grid. It does not introduce a second application frame.

Public documents are a reading page. Long titles in the document navigation
wrap. Code samples sit in a bordered block with a language tab and a copy
action. Method names use the method colors above. An editable document is the
block editor, not a second copy of the reading sample.

Opening the application, or a document that cannot be used yet, covers the
work with the loading mark. The mark remains available when the rest of the
page is not. A control-sized wait stays inside the control.
