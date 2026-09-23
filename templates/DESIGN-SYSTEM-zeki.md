# Design system

**This is a closed list. A token not listed here does not exist.** It is the
only file in the repo allowed to contain a raw hex value.

**Source:** Zeki brand — `skills/plan-project/references/brand-zeki.md`, read <date>.
Colour, type, radius and logo come from the brand and are **not** re-decided
here. Everything marked `<…>` is this project's call.

## Direction

<Two or three sentences about this product specifically. Zeki branding fixes
the palette and the type; it does not make every project look like the
marketing site. Name the anti-pattern being avoided.>

## Theme

<Light only / both. The brand is built light-first: white page, cream bands,
navy ink. If dark mode is in scope, it is navy-surfaced — say so and fill the
dark column below; if it is not, say "Light only" plainly.>

## Colour tokens

Brand roles first — these values are fixed:

| Token | Value | Use |
| --- | --- | --- |
| `--brand-navy` | `#113C94` | Primary action, links, headings, inverse surfaces |
| `--brand-navy-deep` | `#12358C` | Navy hover/pressed |
| `--brand-blue` | `#2466A2` | Secondary brand blue, informational |
| `--brand-sky` | `#64BBE4` | Illustration, charts, soft accents |
| `--brand-yellow` | `#FFC918` | The one highlighted action per screen, small accents |
| `--brand-yellow-hover` | `#F0B800` | Yellow hover/pressed |
| `--brand-cream` | `#FFF6ED` | Soft section band |

Applied roles:

| Token | Value | Use |
| --- | --- | --- |
| `--surface-base` | `#FFFFFF` | Page background |
| `--surface-subtle` | `#FFF6ED` | Alternating section band |
| `--surface-raised` | `#FFFFFF` | Cards, panels, navbar — separated by border, not shadow |
| `--surface-overlay` | `#FFFFFF` | Modals, popovers, dropdowns |
| `--surface-hover` | `#F4F6FB` | Row and list hover |
| `--surface-inverse` | `#113C94` | Hero, footer, anything navy-filled |
| `--border-default` | `#E2E6F0` | Dividers, input borders |
| `--border-subtle` | `#EFF1F7` | Low-emphasis separation |
| `--text-primary` | `#10233F` | Body and headings (15.7:1 on white) |
| `--text-secondary` | `#4A5A72` | Supporting copy (7.0:1 on white) |
| `--text-muted` | `#6B7689` | Timestamps, metadata (4.6:1 on white; large text only on cream) |
| `--text-on-inverse` | `#FFFFFF` | Text on `--surface-inverse` (10.0:1) |
| `--text-on-yellow` | `#113C94` | Text and icons on `--brand-yellow` (6.5:1) |
| `--accent` | `#113C94` | Primary action, focus ring |
| `--accent-hover` | `#12358C` | Primary action hover |
| `--accent-soft` | `#E7EDF9` | Selected rows, quiet accent fills |
| `--state-success` | `#14795A` | Success |
| `--state-warning` | `#A85C00` | Warning, soft limits |
| `--state-danger` | `#B3261E` | Destructive action, errors |
| `--state-info` | `#2466A2` | Informational |

Rationale: navy carries the interface and yellow is punctuation — one
yellow action per screen, at most. Warning is **not** brand yellow: yellow is
already the CTA colour here, so a yellow warning reads as an invitation.

Hard rules:

- `--brand-yellow` is a **fill**, never text on white or cream (1.5:1).
- Yellow surfaces always carry `--text-on-yellow`.
- No other blue, yellow or grey enters the project. Needing one means adding it
  here with a rationale, not inlining it.

## Typography

| Role | Family | Fallback stack |
| --- | --- | --- |
| Sans / Heading | `Poppins` | `Poppins, "Segoe UI", system-ui, -apple-system, sans-serif` |
| Mono | `<…>` | `ui-monospace, <…>, monospace` — IDs, paths, code, slugs |

Weights: **600** headings · **500** buttons and labels · **400** body. Nothing
else is available. Headings carry `-0.01em` tracking; body carries ≥1.6
line-height — Poppins is wide and reads cramped without both.

| Step | Size / line-height | Use |
| --- | --- | --- |
| `xs` | `<…>` | <…> |
| `sm` | `<…>` | <…> |
| `base` | `<…>` | Body |
| `lg` | `<…>` | <…> |
| `xl` | `<…>` | <…> |

## Spacing, radii, elevation

- **Spacing scale:** `<base unit>` → `<the steps>`
- **Radii:** `8px` default (brand) · pills for tags and badges ·
  `<12–16px>` for large modals and hero panels
- **Elevation:** the brand is flat — borders and the cream band do the
  separating. Shadows only for things that actually float: `<shadow-1>`
  (dropdown) · `<shadow-2>` (modal). Three at most.

## Brand assets

| Asset | Path in this project | Use |
| --- | --- | --- |
| Lockup (navy) | `<…>` | Header / footer, ≥120px wide |
| Lockup (white) | `<…>` | On navy or photographic surfaces |
| Mark | `<…>` | Favicon, app icon, tight headers, ≥24px |

Clear space is half the mark's height. Never recolour, rotate, outline or
stretch either mark. Copy these from
`skills/plan-project/assets/zeki/` in the first UI spec and list them in
`INVENTORY.md`.

## Layout conventions

- Navbar: `<height, behaviour, what sits left and right — the lockup sits left>`
- Sidebar: `<width; overlays or pushes — say which>`
- Container max-widths and breakpoints: `<…>`
- Sections alternate `--surface-base` and `--surface-subtle`; two cream bands
  never touch.
- **Wide content** (tables, diagrams, code blocks) scrolls inside its own
  `overflow-x` container. The page body never scrolls horizontally.

## Component conventions

- **Buttons:** `primary` = navy fill, white text · `highlight` = yellow fill,
  navy text, **one per screen** · `secondary` = navy border, navy text ·
  `ghost` = navy text only. A submitting button says `Saving…` and disables.
- **Form fields:** `<anatomy, label placement, where inline errors render>`
- **Destructive confirmation:** `<…>` — danger red, never yellow.
- **Row actions:** `<hover-revealed, plus the focus/open states that reveal them>`
- **Empty states:** `<the standard shape>`
- **Loading states:** `<the standard shape; a queued state is explained in words>`
- **Soft limits** read as guidance — `--state-warning`, not `--state-danger`.

## States

| Element | Hover | Focus-visible | Disabled |
| --- | --- | --- | --- |
| Primary button | `--accent-hover` | 2px `--accent` ring, 2px offset | 40% opacity, no pointer |
| Highlight button | `--brand-yellow-hover` | 2px `--accent` ring, 2px offset | 40% opacity, no pointer |
| Row | `--surface-hover` | `<…>` | `<…>` |
| Input | `<…>` | 2px `--accent` ring | `<…>` |

## Motion

- Durations: `<…>` · Easing: `<…>`
- What may animate: `<…>`. What may not: `<…>`.
- `prefers-reduced-motion: reduce` → `<what changes>`.

## Accessibility floor

- Contrast: **4.5:1** minimum for body text, **3:1** for large text — verified
  against the *actual* background, including the cream band.
- Focus is always visible, never removed without a replacement.
- Minimum interactive target: **44×44px**.
- Every icon-only control has an accessible name; the logo link's is
  "Zeki Expert Solutions — home".
- Every flow is completable by keyboard.
