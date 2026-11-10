# Appearance

Notegic's workspace is a compact industrial tool: monospace type, small radii,
neutral surfaces, and color used for meaning. The default theme is
`Default Standard` on the dark base (`shared/lib/theme/defaults.ts`). A user
can switch the base to light and the accent family among the built-in
subthemes. Feature code does not restyle itself per theme; it uses semantic
tokens and the active theme class supplies the values.

Public sign-in is the deliberate exception. `AuthPanel` is an instrument panel,
not a workspace card. Keep that treatment on the public auth surface. Do not
copy its screws, green title, or raw gradients into the workspace.

## How to choose a color

1. Use a semantic utility: `bg-canvas`, `bg-inset`, `bg-background`,
   `bg-card`, `bg-popover`, `bg-sidebar`, `text-foreground`,
   `text-muted-foreground`, `border-border`, `bg-primary`,
   `text-primary-foreground`, `bg-destructive`, `bg-accent`, `bg-muted`,
   `bg-overlay`, or `ring-ring`.
2. Let the active subtheme own accent. Do not hardcode Standard's brown, or
   any other subtheme primary, inside a feature.
3. Charts use `var(--chart-1)` through `var(--chart-5)` through
   `getChartColor` in `apps/web/src/components/charts/color.ts`.
4. HTTP method badges use the `http-get`, `http-post`, `http-put`, and
   `http-patch` tokens.
5. A raw Tailwind palette class or hex value is limited to the exceptions at
   the end of this document.
6. A genuinely new semantic color is added in `globals.css` as a variable and
   an `@theme` color, then recorded here. Do not add it only in
   `apps/web/tailwind.config.ts`.

Hex values below are sRGB approximations of the OKLCH source so a person can
see the color. The source of truth is the `oklch(...)` value in
`apps/web/src/global/styles/globals.css`. Feature code keeps the token, not
the hex.

`ThemeProvider` puts `dark` or `light` on `document.documentElement`, then adds
the subtheme class taken from the second word of a default theme name
(`standard`, `neon`, `ocean`, `forest`, `phoenix`, `pearl`, `sakura`,
`citrus`). A stored custom theme uses its id as the class. Subthemes override
primary, accent, decoration, sidebar accent, ring, switch thumb, and caret.
They do not replace the neutral canvas.

## Dark base

Applied with `.dark`. This is the default base.

| Token | OKLCH | Approx. sRGB | Use |
| --- | --- | --- | --- |
| `--canvas` | `oklch(0.185 0 0)` | `#131313` | Page ground behind panels. `body` uses `bg-canvas`. |
| `--inset` | `oklch(0.215 0 0)` | `#191919` | Recessed strips inside the canvas. |
| `--background` | `oklch(0.32 0 0)` | `#333333` | Control and input surface. |
| `--foreground` | `oklch(0.985 0 0)` | `#FAFAFA` | Primary text. |
| `--card` | `oklch(0.255 0 0)` | `#232323` | Cards, dialog content, graph task nodes. |
| `--popover` | `oklch(0.29 0 0)` | `#2B2B2B` | Menus and popovers. |
| `--primary` | `oklch(0.922 0 0)` | `#E5E5E5` | Neutral primary before a subtheme replaces it. |
| `--primary-foreground` | `oklch(0.205 0 0)` | `#171717` | Text on primary. |
| `--secondary` | `oklch(0.29 0 0)` | `#2B2B2B` | Secondary button fill. |
| `--muted` | `oklch(0.235 0 0)` | `#1E1E1E` | Quiet fills. |
| `--muted-foreground` | `oklch(0.7 0 0)` | `#9E9E9E` | Secondary text and placeholders. |
| `--accent` | `oklch(0.31 0 0)` | `#303030` | Hover and selected neutral. |
| `--destructive` | `oklch(0.63 0.191 22.216)` | `#E64B51` | Destructive actions. |
| `--destructive-foreground` | `oklch(0.985 0 0)` | `#FAFAFA` | Text on destructive. |
| `--border` | `oklch(1 0 0 / 11%)` | white at 11% | Hairline containment. |
| `--input` | `oklch(1 0 0 / 16%)` | white at 16% | Input border. |
| `--ring` | `oklch(0.62 0 0)` | `#868686` | Focus ring until a subtheme replaces it. |
| `--overlay` | `oklch(0 0 0 / 56%)` | black at 56% | Dialog and sheet scrim. |
| `--sidebar` | `oklch(0.275 0 0)` | `#282828` | App sidebar surface. |
| `--sidebar-primary` | `oklch(0.488 0.243 264.376)` | `#1447E6` | Sidebar emphasis before a subtheme replaces it. |

Dark chart series, in order: `#1447E6`, `#00BC7D`, `#FE9A00`, `#AD46FF`,
`#FF2056`. These are the approximations of `--chart-1` through `--chart-5`.

## Light base

Applied with `.light`.

| Token | OKLCH | Approx. sRGB | Use |
| --- | --- | --- | --- |
| `--canvas` | `oklch(0.995 0 0)` | `#FDFDFD` | Page ground. |
| `--inset` | `oklch(0.975 0 0)` | `#F7F7F7` | Recessed strips. |
| `--background` | `oklch(0.875 0 0)` | `#D6D6D6` | Control surface. |
| `--foreground` | `oklch(0.15 0 0)` | `#0B0B0B` | Primary text. |
| `--card` | `oklch(0.94 0 0)` | `#EBEBEB` | Cards and dialogs. |
| `--popover` | `oklch(0.915 0 0)` | `#E3E3E3` | Menus and popovers. |
| `--primary` | `oklch(0.205 0 0)` | `#171717` | Neutral primary before a subtheme replaces it. |
| `--primary-foreground` | `oklch(0.985 0 0)` | `#FAFAFA` | Text on primary. |
| `--muted` | `oklch(0.955 0 0)` | `#F0F0F0` | Quiet fills. |
| `--muted-foreground` | `oklch(0.43 0 0)` | `#505050` | Secondary text. |
| `--accent` | `oklch(0.895 0 0)` | `#DCDCDC` | Hover and selected neutral. |
| `--destructive` | `oklch(0.54 0.22 27.325)` | `#D00114` | Destructive actions. |
| `--border` | `oklch(0.76 0 0)` | `#B1B1B1` | Containment. |
| `--input` | `oklch(0.8 0 0)` | `#BEBEBE` | Input border. |
| `--ring` | `oklch(0.48 0 0)` | `#5D5D5D` | Focus ring until a subtheme replaces it. |
| `--overlay` | `oklch(0 0 0 / 36%)` | black at 36% | Dialog and sheet scrim. |
| `--sidebar` | `oklch(0.93 0 0)` | `#E8E8E8` | App sidebar surface. |

Light chart series, in order: `#326EFF`, `#007E44`, `#822400`, `#8700D9`,
`#B7001F`.

## Subthemes

Each row is the accent family layered on the current dark or light base.
`primary` is the action color. `decoration` is the second hue for ornamental
emphasis, not a second button style. Sidebar primary follows `primary`.

| Class | Base default | Primary | Accent | Decoration | Product reading |
| --- | --- | --- | --- | --- | --- |
| `standard` | dark | `#855732` | `#4F3B2C` | `#3C4330` | Default. Warm metal and olive, the product's normal voice. |
| `neon` | dark | `#9A6BFF` | `#493283` | `#DF59D7` | High-chroma violet for a deliberately loud workspace. |
| `ocean` | light | `#61AFBD` | `#356D76` | `#509779` | Cool water on a light ground. |
| `forest` | dark | `#486749` | `#2B3E2B` | `#9C663C` | Low-chroma green with a wood decoration. |
| `phoenix` | dark | `#9D3434` | `#642625` | `#B16E37` | Deep red with an ember decoration. |
| `pearl` | light | `#43617B` | `#CEDDEB` | `#008E96` | Pale blue-gray with a teal decoration. |
| `sakura` | light | `#AE4976` | `#F8D2DF` | `#518253` | Pink with a leaf decoration. |
| `citrus` | light | `#7F5D09` | `#F2DFBC` | `#208562` | Amber with a green decoration. |

## HTTP method colors

Used by documentation method badges, not by workspace actions.

| Method | Mark | Dark foreground | Light foreground fallback |
| --- | --- | --- | --- |
| GET | Tailwind emerald-500 `#10B981` | emerald-300 `#6EE7B7` | emerald-700 `#047857` |
| POST | yellow-500 `#EAB308` | yellow-300 `#FDE047` | yellow-700 `#A16207` |
| PUT | blue-500 `#3B82F6` | blue-300 `#93C5FD` | blue-700 `#1D4ED8` |
| PATCH | violet-500 `#8B5CF6` | violet-300 `#C4B5FD` | violet-700 `#6D28D9` |

Utilities are `bg-http-get`, `text-http-get-foreground`, and the matching
`post`, `put`, and `patch` names. `ArticleMethodBadge` is the owner. DELETE
reuses `bg-destructive/10 text-destructive`. An unknown method uses
`bg-muted text-muted-foreground`.

## Type, radius, and elevation

- Both `--font-sans` and `--font-mono` are JetBrains Mono, then the platform
  monospace stack. Do not introduce a second UI font for a feature.
- `--radius` is `0.625rem` (10px). `rounded-sm` is 6px, `rounded-md` is 8px,
  `rounded-lg` is 10px, and `rounded-xl` is 14px. Buttons, inputs, and graph
  task nodes use `rounded-md`. Dialogs use `rounded-lg`. Cards use
  `rounded-xl`.
- Workspace elevation is `shadow-sm` on cards and graph nodes, `shadow-lg` on
  dialogs and sheets. Do not add a drop shadow to make a layout visible.
- Borders describe containment or a real separation. Hierarchy comes from
  spacing and `text-muted-foreground`, not from extra boxes.
- Focus uses `ring-2 ring-ring` with an offset. Do not remove the focus ring
  to make a control look quieter.

## Density

`LocalPreferencesProvider` sets `html[data-density]` to `comfortable`,
`balanced`, or `compact`. Balanced is the default and uses the `:root`
variables. Comfortable and compact override those variables. The
`html[data-density]` rules still apply min height and padding for all three,
including balanced.

| | Control height | Control padding x | Content gap | Content padding | Menu row | Table cell |
| --- | --- | --- | --- | --- | --- | --- |
| balanced | `2.25rem` | `0.75rem` | `1rem` | `1rem` | `2rem` | `1rem` |
| comfortable | `2.5rem` | `1rem` | `1.25rem` | `1.25rem` | `2.25rem` | `1.25rem` |
| compact | `2rem` | `0.625rem` | `0.75rem` | `0.75rem` | `1.75rem` | `0.625rem` |

`--app-toolbar-height` is `3rem`. `--app-navigation-height` is two menu rows
plus `1.25rem` plus a 1px separator. Normal buttons, inputs, textareas, select
triggers, and menu rows participate automatically through `data-slot`. Icon
buttons (`data-size="icon"`) stay square. `data-density-static` is the opt-out
for a control that must keep a fixed size, such as calendar grids and some
settings rows.

## Motion

`html[data-reduce-motion="true"]` collapses animation, transition, and smooth
scroll to 1ms. Preference storage sets `dataset.reduceMotion`. Sidebar collapse
also respects `prefers-reduced-motion`. Do not convey state only through
motion. Dialog and sheet enter/exit animations belong to the primitives; do
not add a second animation on the same overlay.

## Raw-color exceptions

These are existing choices. They are not permission to add another palette.

| Surface | Choice | Why it stays local |
| --- | --- | --- |
| `AuthPanel` dark skin | Gradient `#2A2A2A` → `#1A1A1A` → `#0F0F0F`, saddle-brown texture `rgba(139, 69, 19, …)`, title `text-green-400` `#4ADE80` | The public instrument panel. Light mode uses `text-green-600` `#16A34A` and a gray glass fill. Owned by `panel.css` and `AuthPanel`. |
| `GridBackground` | Solid black or white behind the grid | Public auth backdrop, chosen from `currentTheme.isDark`. |
| Routine Start node | Active: `border-emerald-500` `#10B981` at 20% fill, emerald text. Inactive: `border-border bg-muted text-muted-foreground`. | Execution-active state of the circular Start node in `RoutineTaskGraphNode`. A task node stays `bg-card`. |
| BlockNote suggestion shadow | `rgb(0 0 0 / 28%)` | Editor menu shadow in `block-editor.css`, independent of theme tokens. |
