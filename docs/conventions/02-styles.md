# Style Conventions

## Tokens and global CSS

- `apps/web/src/global/styles/globals.css` is the global entrypoint. It imports Tailwind, animation, scrollbar, loading and sidebar styles, and defines theme and density tokens.
- Use semantic Tailwind tokens (`bg-canvas`, `bg-background`, `text-foreground`, `text-muted-foreground`, `border-border`, `bg-sidebar`) instead of raw colour values in feature code.
- Add a new global rule only for a cross-application contract such as a theme token, density, reduced motion or a third-party editor override. Keep feature-specific styling beside its component.
- `panel.css` is imported only by `AuthPanel`; it is not an application-wide stylesheet.

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
