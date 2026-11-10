# UI catalog

This directory is the current selection for Notegic Web appearance, CSS,
layout, and interface components. It is a Markdown inventory, in the same role
as the [Icon map](../../conventions/icon-map.md): agents and contributors look
here before creating a control, style, or layout, then import the existing
owner. It is not a runtime registry, theme engine, or component wrapper.

Contributor rules stay in [UI conventions](../../conventions/01-ui.md) and
[Style conventions](../../conventions/02-styles.md). This catalog records what
the product currently uses and where that choice lives in code. When the
catalog and the code disagree, the code wins; update the catalog in the same
change that changes the selection.

## Read this first

1. Search [components](components.md) for the interaction. Reuse that owner.
2. Read [appearance](appearance.md) before choosing a color, type, radius,
   density, or motion treatment.
3. Read [CSS](css.md) before adding a class, stylesheet, or style helper.
4. Read [layout](layout.md) before placing a page, dialog, sheet, or shell.
5. Read [examples](examples.md) when the change should match an existing
   product surface instead of inventing a new visual pattern.

Icons stay in the [Icon map](../../conventions/icon-map.md). Do not copy icon
rows into this catalog.

## Value of a new UI piece

Create a helper or component only when the existing pattern cannot do the job.
A new screen, dialog, route, or entry point is not that reason. Search the
nearest feature, `apps/web/src/components/`, and this catalog first.

When creation is actually required, its value is reuse across past, present,
and likely future callers:

- If the same behavior already has more than one caller, extract one owner
  those callers import. Follow the nearest existing file, prop, and test
  pattern.
- The same extraction is allowed when future callers in this product are
  likely to need the same stable concept, and the abstraction does not grow
  flags for imaginary cases. Still follow an existing pattern.
- A new pattern — a new folder role, registry, framework, generic helper
  layer, or any structure this repository does not already use — must be
  confirmed with the repository owner before it is written.
- A one-use fragment stays beside its owner.

Record a deliberate exception here when one caller must keep a different
implementation. The account-settings code field is
[`AuthCodeInput`](../../../apps/web/src/components/inputs/AuthCodeInput.tsx).
Public authentication keeps its own field inside
[`AuthPanel`](../../../apps/web/src/components/panels/AuthPanel/AuthPanel.tsx)
and must not be folded into `AuthCodeInput`. See
[Account verification code](examples.md#account-verification-code).

The same gate applies outside UI. Frontend helpers follow
[Value of a new abstraction](../../conventions/05-helpers-and-abstractions.md#value-of-a-new-abstraction).
A new icon component follows that gate and is registered in the icon map; it
does not get its own registry.

## Maintenance

Update the affected document when a selection is added, replaced, or removed.
Check imports and callers, not only the new file name. Keep an exception
searchable. Do not mass-rename working components to match a newer label.

For a rescan, start with:

```sh
rg -n --glob '*.{tsx,css}' 'data-slot=|cva\\(|@theme|className=' apps/web/src/components apps/web/src/global/styles
```

Then open the owner named in this catalog before deciding that a new file is
needed.
