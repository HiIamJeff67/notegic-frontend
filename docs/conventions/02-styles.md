# Style Conventions

This document is how to write CSS and Tailwind. The colors, type, radius,
density, and motion a person should see are in
[UI appearance](../designs/ui/appearance.md). Use the tokens below so a theme
change reaches the new interface without a new palette.

## Tokens and global CSS

- `apps/web/src/global/styles/globals.css` is the global entrypoint. It imports Tailwind, animation, scrollbar, loading, and sidebar styles and defines theme and density tokens. Feature components import their own editor, Article, Inspector, or graph overrides only where needed.
- Use semantic Tailwind tokens (`bg-canvas`, `bg-background`, `text-foreground`, `text-muted-foreground`, `border-border`, `bg-sidebar`) instead of raw colour values in feature code.
- Add a new global rule only for a cross-application contract such as a theme token, density, reduced motion or a third-party editor override. Keep feature-specific styling beside its component.
- `panel.css` is imported only by `AuthPanel`; it is not an application-wide stylesheet.

`globals.css` is the running theme. It has no `@config`. The Vite plugin is
`@tailwindcss/vite`. `apps/web/tailwind.config.ts` is the leftover file named
by `components.json`; do not add tokens there, and do not add `prose` classes.
The app does not use `@tailwindcss/typography`.

Join classes with `cn` from `@shared/lib/classname/cn`. Primitive variants use
`cva` in the primitive file. Do not add a second `cva` map in a feature for a
variant the primitive already has.

`data-slot` is the styling contract. Density, inspector, article, and editor
CSS select those slots. A new shared control that must follow density sets an
existing slot or extends the `html[data-density]` rule in `globals.css`.

| Stylesheet | Loaded by | Use it for |
| --- | --- | --- |
| `globals.css` | Application entry | Tailwind, tokens, themes, density, reduced motion, base caret and cursor, number-input spin removal, switch thumb. |
| `scrollbar.css` | `globals.css` | Thin scrollbars and `.hide-scrollbar`. |
| `loading.css` | `globals.css` | Loading-logo animation. |
| `sidebar.css` | `globals.css` | Sidebar group animation and the density height that must beat a utility `h-*`. |
| `panel.css` | `AuthPanel` only | The public auth panel's gradient, texture, and glow. |
| `article.css` | `ArticleNavigation` | Wrapped article-sidebar labels. |
| `inspector.css` | `StationRoutineInspectorHost` | Inspector controls stay on `--background`. |
| `block-editor.css` | Block pack editor and the block-pack payload editor | BlockNote menus and the language picker. |
| `app-command.css` | `AppCommand` and `ArticleCommand` | Command palette motion. |
| `image.css` | `Image` | Blur reveal after load. |

Add or extend a stylesheet only for a cross-application contract, a keyframe
the existing utilities cannot express, or a third-party DOM the component does
not control. Import it from the owner in the table. Do not create `styles.ts`
or a class-name helper to hide one component's class list.

Theme-scoped utilities exist for `standard`, `dark`, `light`, `neon`, `ocean`,
`forest`, `phoenix`, `pearl`, `sakura`, and `citrus`. Use one only when the
structure changes. Color differences belong to tokens.

Responsive prefixes already in use are `sm`, `md`, and `lg`. Match the nearest
surface instead of adding `xl` or `2xl` for one screen. State styling uses
Radix `data-state` and `disabled:` when the primitive already publishes them.

## Density and motion

- Density is controlled by `html[data-density]` and the `--density-*` variables. Reuse those variables for controls, content gaps, menu rows and tables.
- A normal Button participates in density automatically. Fixed-size controls use `size="icon"`; global density intentionally excludes `data-size="icon"` so they remain square.
- Use `data-density-static` only when a non-icon control must deliberately ignore density.
- Respect `html[data-reduce-motion="true"]`; do not introduce essential information that is visible only through animation.

## Visual language

- Use the existing compact, industrial shadcn language: small radii, semantic borders, restrained shadows and token-driven contrast.
- Borders describe containment or a true separation. Do not add a border merely to make a layout visible.
- Separators and spacing communicate hierarchy; parent sections receive more space than sibling options.
- Prefer local utility classes over bespoke CSS. Add a reusable component before repeating a long visual pattern in multiple features.

## Style helper boundaries

- Keep a one-use class composition, responsive condition, or visual state
  decision in the component that owns it when the result is readable.
- Do not create a style helper file to hide a short Tailwind class list or a
  single component's variant decision.
- Reuse the existing token, primitive, or styling utility before adding a new
  class-name wrapper. A new abstraction must represent a real repeated visual
  concept, not merely reduce the number of lines in one component.
- Keep component-local style variants and constants beside the component when
  no other component consumes them. Do not create a `styles/`, `constants/`, or
  `helpers/` module for one consumer.
- Keep styling decisions in the presentation layer. A style helper must not
  perform data fetching, mutate storage, or conceal feature workflow logic.
