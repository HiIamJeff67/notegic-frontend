---
name: ui-and-styles-and-layout
description: Apply Notegic UI, CSS, Tailwind, layout, and component-reuse rules before creating or changing interface code. Use when adding or editing pages, dialogs, controls, colors, styles, density, themes, or layout.
---

# UI, styles, and layout

Before changing interface code, read the matching parts of the [UI catalog](../../../docs/designs/ui/README.md). The catalog is the current selection of owners, tokens, and shells. [UI conventions](../../../docs/conventions/01-ui.md) and [Style conventions](../../../docs/conventions/02-styles.md) are the rules. The codebase wins when they disagree; update the catalog in the same change that changes a selection.

Read only the documents the change needs:

- [Appearance](../../../docs/designs/ui/appearance.md) for color, type, radius, density, and motion.
- [CSS](../../../docs/designs/ui/css.md) for Tailwind v4, tokens, and stylesheets.
- [Layout](../../../docs/designs/ui/layout.md) for shells, overlays, spacing, and dialog footers.
- [Components](../../../docs/designs/ui/components.md) before creating or duplicating a control.
- [Examples](../../../docs/designs/ui/examples.md) when the change belongs to an existing product surface.
- The [Icon map](../../../docs/conventions/icon-map.md) when the change selects or adds an icon.

## Reuse before a new piece

Search the catalog and `apps/web/src/components/` before writing a component or style helper. A new screen, dialog, or entry point uses the owner that already implements that interaction.

Create a helper or component only when that existing pattern cannot express the need. Then judge reuse:

- Past or present callers already share the behavior: extract one owner they import, on the nearest existing pattern.
- Likely future callers need the same stable concept: the same extraction is allowed, still on an existing pattern, without flags for imaginary cases.
- The change needs a new folder role, registry, framework, or generic helper layer: ask the user before writing it.
- The fragment has one caller: keep it beside that owner.

`AuthCodeInput` is the shared account-settings code field. Public `AuthPanel` flows keep their own code field. Do not merge those two.

The same gate is recorded in [Value of a new abstraction](../../../docs/conventions/05-helpers-and-abstractions.md#value-of-a-new-abstraction).

## Dialog actions

For a two-action confirmation, follow [dialog action conventions](../../../docs/conventions/01-ui.md#two-action-confirmation-dialogs) and the footer patterns in [layout](../../../docs/designs/ui/layout.md#dialog-actions). Destructive confirmation uses outline Cancel on the left and the destructive verb on the right. Existing create and rename dialogs keep their current pair. Do not invent a third footer.

## Check

Name the existing owner you reused, or the concrete gap that forced a new one. A new color uses a semantic token from `globals.css`, not a raw hex in a feature. A new layout keeps `min-w-0`, density slots, and a reachable close or cancel control. Run the narrowest relevant test, and verify a user-visible UI change in the browser.
