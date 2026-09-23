# Zeki branding

The house brand: **Zeki Expert Solutions — "Your Trusted Technology Partner"**
(<https://zekiexperts.com/>). Load this file only when the intake answered
**Zeki branding** to the design question in Phase 0. It is the source for
`DESIGN-SYSTEM.md` on a Zeki-branded project; fill
[`../templates/DESIGN-SYSTEM-zeki.md`](../templates/DESIGN-SYSTEM-zeki.md)
rather than deciding a palette.

Everything below was read off the live site (Elementor global kit + rendered
CSS + the logo files), not from memory. Re-derive it, don't extend it: if the
project needs a token this file does not have, add it to the project's
`DESIGN-SYSTEM.md` with a one-line rationale and say in the Log that it is a
project extension, not brand.

---

## Logo

Files live in [`../assets/zeki/`](../assets/zeki/) — copy the ones a project
actually uses into that project's own asset directory (`public/`,
`assets/`, `static/`…) as part of the first UI spec, and record them in
`INVENTORY.md`.

| File | What it is | Use |
| --- | --- | --- |
| `zeki-wordmark.svg` | Full lockup, navy, 291×81 (embeds a raster) | Web headers where an SVG is wanted |
| `zeki-wordmark.png` | Same lockup, trimmed, 1200×276 | Anywhere the SVG's raster payload is not wanted |
| `zeki-wordmark-white.png` | Knockout lockup | On navy / photo / dark surfaces only |
| `zeki-mark.png` | Hexagon **Z** mark, 103×118 | Favicon, app icon, avatar, tight headers |
| `zeki-mark-white.png` | Knockout mark | On navy / dark surfaces only |

Rules:

- The lockup reads **"Zeki Expert Solutions"** with the tagline **"Your Trusted
  Technology Partner"** underneath. Don't retype it as text — use the asset.
- Clear space around any mark: **half the mark's height** on all sides.
- Minimum sizes: lockup **120px** wide, mark **24px** wide.
- Never recolour, rotate, outline, add a shadow to, or stretch either mark. Use
  the white knockout on dark, the navy original on light — nothing else.
- The `.svg` is a vector wrapper around a 1667×834 PNG, so it does **not** scale
  losslessly past that. Above ~1600px wide, treat the PNG and the SVG as the
  same asset.

---

## Colour

Brand values, as they exist on the site:

| Name | Hex | Where it comes from |
| --- | --- | --- |
| Zeki navy | `#113C94` | Site primary — headings, buttons, links |
| Zeki navy deep | `#12358C` | Pressed/hover navy |
| Logo ink | `#163D69` | Wordmark type |
| Zeki blue | `#2466A2` | The **Z** in the mark; secondary brand blue |
| Zeki sky | `#64BBE4` | Mark highlight; charts, illustration |
| Zeki yellow | `#FFC918` | The CTA / highlight colour |
| Zeki cream | `#FFF6ED` | Soft section band behind content |

Two things that decide most Zeki-branded layouts:

- **Navy is the workhorse, yellow is the punctuation.** Yellow is for the one
  action that matters on a screen, and for small accents (underlines, bullets,
  badges). A screen with three yellow buttons has no primary action.
- **Yellow is a fill colour, never a text colour on white.** `#FFC918` on white
  is 1.5:1. Yellow surfaces carry navy text (`#113C94` on `#FFC918` = 6.5:1).

Because brand yellow is the CTA, **warning states must not be yellow** — they
use `#A85C00`, or the pair would be unreadable as a signal. That is the one
place the design system deliberately diverges from the brand palette.

---

## Typography

- **Poppins** for everything — 600 for headings, 500 for buttons and labels,
  400 for body. The site loads Poppins, Inter and Lato; only Poppins is brand.
- Fallback stack: `Poppins, "Segoe UI", system-ui, -apple-system, sans-serif`.
- Poppins is geometric and wide: headings want **tight tracking** (`-0.01em`)
  and body wants **generous leading** (1.6+) or it reads cramped.
- Mono is not a brand face. Pick one per project (`ui-monospace, "JetBrains
  Mono", monospace`) and record it in `DESIGN-SYSTEM.md`.

## Shape and depth

- Radius: **8px** is the site's card/button radius — that is the brand default.
  Pills for tags/badges, 12–16px for large modals or hero panels.
- The site is flat: borders and cream bands do the separating, not shadows. Keep
  elevation to at most three shadows and use them only for things that float
  (dropdowns, modals, toasts).

---

## Writing DESIGN-SYSTEM.md from this

1. Copy `templates/DESIGN-SYSTEM-zeki.md` to `<project>/specs/DESIGN-SYSTEM.md`.
2. Set `Source: Zeki brand (references/brand-zeki.md), read <date>`.
3. Fill in the project-specific rows the template leaves open — the type scale's
   actual steps, the mono face, the layout conventions, the component
   conventions. The brand does not decide those; the project does.
4. Write the **Direction** section for *this* product. Zeki branding constrains
   colour, type and logo; it does not mean every project looks like the
   marketing site. Name the anti-pattern this product is avoiding.
5. Keep the closed-list rule: a token not in the file does not exist, and the
   file is still the only place a raw hex may appear.
6. Add a **Brand assets** row to `INVENTORY.md` naming the copied logo files and
   their path in the project, so no spec re-downloads or re-traces them.

## What to check before shipping a Zeki-branded UI

These belong in the verification pass spec's `Done when`:

- The lockup appears at least once (header or footer) at ≥120px and with its
  clear space intact.
- The favicon is the Zeki mark.
- No screen has more than one yellow primary action.
- No yellow text on a white or cream surface anywhere.
- Body text meets 4.5:1 and large text 3:1 against its actual background — check
  on the cream band too, not only on white.
