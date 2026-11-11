---
name: ui-and-styles-and-layout
description: Apply Notegic UI, CSS, Tailwind, layout, and component-reuse rules before creating or changing interface code. Use when adding or editing pages, dialogs, controls, colors, styles, density, themes, or layout.
---

# UI, styles, and layout

Before changing interface code, read the convention that matches the change, then check the appearance the person should see.

How to write and which existing piece to use:

- [UI conventions](../../../docs/conventions/01-ui.md) for composition, dialogs, loading, and responsive behavior.
- [UI components](../../../docs/conventions/ui-components.md) before creating or duplicating a control.
- [Style conventions](../../../docs/conventions/02-styles.md) for Tailwind, tokens, and stylesheets.
- The [Icon map](../../../docs/conventions/icon-map.md) when the change selects or adds an icon.

What the result should look like:

- [UI appearance](../../../docs/designs/ui/appearance.md) for color, type, density, motion, and the existing product surfaces.

The appearance document shows compliant markup. It does not choose a file owner. The conventions do.

## Reuse before a new piece

Search [UI components](../../../docs/conventions/ui-components.md) and `apps/web/src/components/` before writing a component or style helper. A new screen, dialog, or entry point uses the owner that already implements that interaction.

Create a helper or component only when that existing pattern cannot express the need. Then judge reuse:

- Past or present callers already share the behavior: extract one owner they import, on the nearest existing pattern.
- Likely future callers need the same stable concept: the same extraction is allowed, still on an existing pattern, without flags for imaginary cases.
- The change needs a new folder role, registry, framework, or generic helper layer: ask the user before writing it.
- The fragment has one caller: keep it beside that owner.

`AuthCodeInput` is the shared account-settings code field. Public `AuthPanel` flows keep their own code field. Do not merge those two.

The same gate is recorded in [Value of a new abstraction](../../../docs/conventions/05-helpers-and-abstractions.md#value-of-a-new-abstraction).

## Dialog actions

For a two-action confirmation, follow [dialog action conventions](../../../docs/conventions/01-ui.md#two-action-confirmation-dialogs). Destructive confirmation uses outline Cancel on the left and the destructive verb on the right. Existing create and rename dialogs keep their current pair. Do not invent a third footer. The visible order and color are described in [UI appearance](../../../docs/designs/ui/appearance.md#actions).

## Check

Name the existing owner you reused, or the concrete gap that forced a new one. A new color uses a semantic token, not a raw hex in a feature. A new layout keeps `min-w-0`, density, and a reachable close or cancel control. Run the narrowest relevant test, and verify a user-visible UI change in the browser.
