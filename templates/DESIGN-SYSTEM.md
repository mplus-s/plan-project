# Design system

**This is a closed list. A token not listed here does not exist.** It is the
only file in the repo allowed to contain a raw hex value.

**Source:** <user-supplied | decided here>

## Direction

<Two or three sentences: what this should feel like, and what it must not look
like. Name the anti-pattern being avoided — "not another purple-gradient SaaS
landing page" is a more useful constraint than "modern and clean".>

## Theme

<Dark only / light only / both. If one only, say so plainly — e.g. "Dark only.
`<html>` carries `class="dark"` permanently. No toggle." That is a valid and
simplifying answer; leaving it open is not.>

## Colour tokens

| Token | Value | Use |
| --- | --- | --- |
| `--surface-base` | `#______` | Page background |
| `--surface-raised` | `#______` | Cards, panels, navbar |
| `--surface-overlay` | `#______` | Modals, popovers |
| `--surface-hover` | `#______` | Row and list hover |
| `--border-default` | `#______` | Dividers, input borders |
| `--border-subtle` | `#______` | Low-emphasis separation |
| `--text-primary` | `#______` | Body and headings |
| `--text-secondary` | `#______` | Supporting copy |
| `--text-muted` | `#______` | Timestamps, metadata |
| `--accent` | `#______` | Primary action, focus ring |
| `--accent-hover` | `#______` | Primary action hover |
| `--state-success` | `#______` | Success |
| `--state-warning` | `#______` | Warning, soft limits |
| `--state-danger` | `#______` | Destructive action, errors |

Semantic names only — never `blue-500`. One line of rationale for the palette as
a whole, not per token.

## Typography

| Role | Family | Fallback stack |
| --- | --- | --- |
| Sans | `<…>` | `<real fallback stack>` |
| Mono | `<…>` | `<…>` — IDs, paths, code, slugs |
| Heading | `<…>` | `<…>` |

| Step | Size / line-height | Use |
| --- | --- | --- |
| `xs` | `<…>` | <…> |
| `sm` | `<…>` | <…> |
| `base` | `<…>` | Body |
| `lg` | `<…>` | <…> |
| `xl` | `<…>` | <…> |

Weights available: `<…>`. Anything not listed is not available.

## Spacing, radii, elevation

- **Spacing scale:** `<base unit>` → `<the steps>`
- **Radii:** `<small elements>` / `<cards>` / `<modals>` / `<pills>`
- **Elevation:** `<shadow-1>` … — three is usually enough. If there are eight,
  half are unused.

## Layout conventions

- Navbar: `<height, behaviour, what sits left and right>`
- Sidebar: `<width; overlays or pushes — say which>`
- Container max-widths and breakpoints: `<…>`
- **Wide content** (tables, diagrams, code blocks) scrolls inside its own
  `overflow-x` container. The page body never scrolls horizontally.

## Component conventions

Decided once here so twelve specs don't each decide differently.

- **Buttons:** variants and when each is used; what a submitting button says
  (`Saving…`) and that it disables while in flight.
- **Form fields:** anatomy, label placement, where inline errors render.
- **Destructive confirmation:** <what it looks like; whether it requires typed
  confirmation — usually it should not>.
- **Row actions:** <hover-revealed, and the exact focus/open states that must
  also reveal them>.
- **Empty states:** <the standard shape>.
- **Loading states:** <the standard shape — and that a queued/waiting state is
  explained in words, not left as a spinner indistinguishable from a hang>.
- **Soft limits** read as guidance, not errors — warning colour, not danger,
  when nothing actually rejects the input.

## States

For every interactive element class: hover · focus-visible · active · disabled ·
loading · error · empty.

| Element | Hover | Focus-visible | Disabled |
| --- | --- | --- | --- |
| `<…>` | `<…>` | `<…>` | `<…>` |

## Motion

- Durations: `<…>` · Easing: `<…>`
- What may animate: `<…>`. What may not: `<…>`.
- `prefers-reduced-motion: reduce` → <what changes>.

## Accessibility floor

- Contrast: **<ratio>** minimum for body text, **<ratio>** for large text.
- Focus is always visible, never removed without a replacement.
- Minimum interactive target: **<size>**.
- Every icon-only control has an accessible name.
- Every flow is completable by keyboard.
