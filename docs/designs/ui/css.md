# CSS and Tailwind

Workspace styling is Tailwind CSS v4 utilities plus a small set of global
stylesheets. The Vite plugin is `@tailwindcss/vite`. The entry imported by the
app is `apps/web/src/global/styles/globals.css`:

```css
@import "tailwindcss";
```

`globals.css` owns `@theme`, theme classes, density, reduced motion, and base
element rules. Feature components use utilities. A feature stylesheet exists
only for a contract utilities cannot express cleanly.

## What owns a style

| File | Loaded by | Owns |
| --- | --- | --- |
| `globals.css` | Application entry | Tailwind, theme tokens, density, reduced motion, base caret and cursor, number-input spin removal, switch thumb. |
| `scrollbar.css` | `globals.css` | Thin scrollbars and `.hide-scrollbar`. |
| `loading.css` | `globals.css` | Loading-logo merge animation. |
| `sidebar.css` | `globals.css` | Sidebar group expand/collapse and the density height that must beat utility `h-*`. |
| `panel.css` | `AuthPanel` only | Panel gradient, texture, shine, screw, and access-button glow. Not an app stylesheet. |
| `article.css` | `ArticleNavigation` | Wrapped article-sidebar labels. Density must not force those rows back to one line. |
| `inspector.css` | `StationRoutineInspectorHost` | Inspector controls stay on `--background`. |
| `block-editor.css` | Block pack editor and the block-pack payload editor | BlockNote menus, tokens, and language picker. |
| `app-command.css` | `AppCommand` and `ArticleCommand` | Command palette pull and reveal. |
| `image.css` | `Image` | Blur reveal after load. |

`apps/web/tailwind.config.ts` is the leftover file referenced by
`components.json`. The running theme does not come from it: `globals.css` has
no `@config`, and the v4 plugin reads the CSS. Add a semantic color in
`globals.css` (`@theme inline` and the theme class), not in that config. Do
not add `@tailwindcss/typography` usage or `prose` classes; the app does not
use them.

Class names are joined with `cn` from `@shared/lib/classname/cn`. Primitive
variants use `cva` in the primitive file (`button.tsx`, `toggle.tsx`,
`sidebar.tsx` menu buttons, `code-block.tsx`, `marker.tsx`, `button-group.tsx`,
`input-group.tsx`). Do not create a second `cva` map in a feature for a
variant the primitive already has.

## Tailwind rules

- Prefer utilities on the component that owns the layout. A long class list
  that appears once stays there.
- Use semantic colors from [appearance](appearance.md). Arbitrary values are
  for a measured local exception, such as the settings sheet width
  `w-[min(94vw,38rem)]`, not for a new palette.
- Theme-scoped utilities exist because `globals.css` declares
  `@custom-variant` for `standard`, `dark`, `light`, `neon`, `ocean`,
  `forest`, `phoenix`, `pearl`, `sakura`, and `citrus`. Use one only when the
  difference is structural. Color differences belong to tokens.
- `data-slot` is the styling contract. Density, inspector, article, and editor
  CSS select those slots. A new control that must participate in density sets
  the same `data-slot` the global rule already lists, or it extends that rule
  in `globals.css` when the slot is a real shared control.
- Icon-sized buttons set `data-size="icon"` through `Button`. Do not add a
  local height that fights `--density-control-height` unless the control is
  `data-density-static`.
- Responsive prefixes already in use are `sm`, `md`, and `lg`. Match the
  nearest shell instead of adding `xl` or `2xl` for one screen.
- State styling uses Radix `data-state`, `data-active`, and `disabled:`. Do
  not mirror that state in a hand-written class toggle when the primitive
  already publishes it.

## When plain CSS is the right tool

Add or extend a stylesheet only when one of these is true:

- the rule is a cross-application contract: a token, density, reduced motion,
  scrollbar, or third-party editor override;
- a keyframe or mask cannot be expressed as a utility the codebase already
  uses;
- a third-party DOM (BlockNote, Radix collapsible height) needs a selector
  the component does not control.

Keep that file next to the contract it serves, and import it from the owner
listed above. Do not create `styles.ts`, a class-name helper, or a
`helpers/` module to hide one component's class list. See
[Style helper boundaries](../../conventions/02-styles.md#style-helper-boundaries).

## Base rules already in effect

`globals.css` applies `border-border` and `outline-ring/50` on every element,
sets `caret-color` from `--caret` or `--foreground`, and sets `body` to
`bg-canvas text-foreground font-sans`. Buttons use `cursor: pointer` and
disabled buttons use the default cursor. Number inputs hide the spinner in
WebKit and Firefox. Switch thumbs use `--switch-thumb` when unchecked and
`--primary-foreground` when checked. Do not reimplement those resets on a
single input.
