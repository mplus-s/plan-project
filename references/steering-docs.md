# The four steering docs

Written once in Phase 2, read by every spec, and updated in the same session as
any implementation that changes them. Specs are disposable; these are not.

If implementation contradicts one of these, the doc is updated in that same
session — not "later". A steering doc that describes an architecture the code no
longer has is worse than no doc, because it is trusted.

---

## 1. `AGENT-GUIDE.md`

The doc a fresh, context-free session reads first. Test of a good one: someone
who reads only this file knows how to behave in this repo without asking.

**Required sections:**

### Read before implementing
A numbered read order, then the spec being implemented. Name `PROGRESS.md` as
the single source of current state, and say explicitly that it **outranks any
assumption carried in from a previous session**.

### One spec per session
Implement exactly the spec named in the tracker's next-up row, nothing more. The
spec's `Explicit non-scope` is **binding**. A spec combining UI and background
work, or persistence and realtime state, or several unrelated routes, is more
than one spec — splitting it is correct; proposing one oversized unit is the
failure mode.

### Claim the GitHub issue before writing code
The search-then-create order, the title prefix `Spec NN — ` that joins the issue
to the spec file, writing `#<n>` back into the spec header and the tracker row
before any code, the PR with `Closes #<n>`, and "never merge your own PR". Say
plainly that `gh` failures are logged, not fatal, and that the whole section is
skipped when the project has no GitHub remote. Full commands:
[`github-workflow.md`](github-workflow.md).

### The model on the spec is the model to run
The `**Model:**` line's tier is the sizing judgement made while the whole set
was visible; `spec-run` passes the Claude id through. State the re-tier rule: a
spec that stalls gets bumped a tier and re-run, not retried at the same one.
See [`model-selection.md`](model-selection.md).

### Verify before you assert
The named checks, as commands:
- A package claimed as pre-installed → read `package.json`.
- A file path → resolve it against the tree.
- A library export → grep the installed `.d.ts`, or `context7`.
- A prior-state claim → find the ancestor spec's `Done when` that establishes it.
- An env-derived value behaving oddly → print what the process actually received
  before suspecting the code.

### Reuse before creating
Point at `INVENTORY.md` and state the rule: before creating any component, hook,
constant, type, or util, search the inventory and then the codebase. If a near
match exists, extend it. Creating a second one is a review failure. Every spec
ends by appending what it created to `INVENTORY.md`.

### Design tokens are a closed list
A token not in `DESIGN-SYSTEM.md` does not exist. Never a raw hex, never a raw
palette class. If a needed token is genuinely missing, add it to
`DESIGN-SYSTEM.md` in the same session and say so in the Log — do not invent a
plausible-sounding variant locally.

### End-to-end proof is not optional
State the e2e contract from `e2e-playwright.md`: what must have a test, where
tests live, and that a box is ticked only after the command actually ran and
passed in this session. Write **both** run commands, because they are different
gates and a session must not have to guess:

- the **scoped** run every spec owes — this feature's test file plus the
  `@smoke` set;
- the **whole-suite** run that only checkpoint specs and the verification pass
  owe.

Also state which mode the project is in and the threshold — while the whole
suite runs under about two minutes, every spec may simply run it — and the
`@smoke` set's time budget, since that set is the only regression cover a
scoped session gets.

### Acceptance criterion tiering
The `[static]` / `[runtime]` / `[e2e]` / `[suite]` / `[requires:]` table from
`spec-format.md`, plus: tier `[static]` is mandatory on every spec.

### Before finishing a spec
1. The spec works end to end within its defined scope.
2. No invariant in `ARCHITECTURE.md` was violated.
3. Typecheck, lint (**0 errors, 0 warnings**), and build all pass.
4. Every `[e2e]` — and on a checkpoint spec, every `[suite]` — command in
   the spec's `Done when` has been run, with the real numbers in the Log.
5. `INVENTORY.md` records anything new and reusable.
6. `PROGRESS.md` and the spec's own Log reflect the work **and any verification
   gaps**.

### Update the tracker before finishing
Record what was built, what was verified, and — explicitly — **what could not be
verified in this environment**. Progress must reflect the actual state, not the
intended state. A caveat stated is worth more than a claim assumed.

### When blocked
Set `Blocked` in both the spec and the tracker, write what was tried and what
decision is needed, and stop. Do not guess past a real decision.

---

## 2. `ARCHITECTURE.md`

Test of a good one: someone could create the empty folder tree from it exactly,
and could tell you which layer a new file belongs in without asking.

**Required sections:**

### Folder structure
The **actual tree**, annotated. Not a description of one.

```
src/
  features/
    checkout/
      components/     presentational + container pairs
      hooks/          the unit of logic reuse
      api/            server-state queries and mutations
      types.ts
      index.ts        the only barrel — the feature's public surface
  shared/             genuinely cross-cutting only
  app/                routing, providers, composition root
```

### Layer boundaries
A table: path → what it owns → what it must never do. Include the negative half;
"components hold no business logic" is the load-bearing part.

### Naming conventions
File case, symbol case, test file placement, what a file is named after
(responsibility, not technology).

### Protected files
Generated output, vendored primitives, migration files — anything not to be
edited by hand, and what to edit instead.

### Data model
Entities, their fields at intent level (`status enum: DRAFT, ARCHIVED`), the
relationships, and where each kind of data lives. If there is more than one
store, state the seam: the one module everything goes through, and the rule that
nothing else imports the driver directly.

### State ownership
Which state is server cache, which is client state, which is context-for-DI, and
where each lives. This is where most architectures rot; be explicit.

### Shared helpers, in full
Any helper more than one spec must use **verbatim** goes here complete, once.
Specs point at it. This is the one place code belongs in a planning doc.

### Invariants — violating one is a defect
A numbered list of 6–15 statements that must always hold. Concrete and
checkable, not aspirations.

> 3. Request handlers never run AI work or repository scans.
> 4. Metadata in Postgres; documents in the artifact store, reached only through
>    `lib/documents.ts`.
> 5. Every backend endpoint created by a spec is consumed by at least one other spec.

Bad invariant: "the code should be maintainable."

---

## 3. `DESIGN-SYSTEM.md`

Skip only for a project with no user interface at all — and say so in
`README.md` rather than silently omitting it.

Test of a good one: **a token not listed here does not exist.** It is a closed
list, and it is the only file in the repo allowed to contain a raw hex value.

**If the intake chose Zeki branding**, the palette, type, radius and logo are
already decided — read [`brand-zeki.md`](brand-zeki.md), copy
[`../templates/DESIGN-SYSTEM-zeki.md`](../templates/DESIGN-SYSTEM-zeki.md), mark
`Source: Zeki brand, read <date>`, and fill only the rows the brand does not
own: the type scale's steps, the mono face, spacing, layout and component
conventions, motion. Do not re-decide a colour it already fixes, and do not
extend the palette silently — a project-specific token gets a rationale and a
Log line saying it is an extension.

**If the user supplied a design** — a palette, a brand kit, a reference site, a
Figma file — transcribe it and mark `Source: user-supplied`. Invent nothing
around it; ask about the gaps instead.

**If Claude is deciding**, decide it *fully* — a half-decided system gets
finished ad hoc by whichever spec hits it first — and give each choice one line
of rationale. Where a design skill is available and fits the brief
(`hallmark`, `design-taste-frontend`, `impeccable`, `ui-ux-pro-max`), use it to
make the aesthetic call, then record the outcome here. This file is the record,
not the reasoning.

**Required sections:**

### Direction
Two or three sentences: what this should feel like, and what it must not look
like. Name the anti-pattern being avoided.

### Colour tokens
A table — token name, value, and *what it is for*. Semantic names, never
`blue-500`.

| Token | Value | Use |
| --- | --- | --- |
| `--surface-base` | `#0B0C0E` | Page background |
| `--surface-raised` | `#141619` | Cards, panels, navbar |
| `--text-primary` | `#F2F3F5` | Body and headings |
| `--text-muted` | `#8A9099` | Secondary, timestamps |
| `--accent` | `#4C7DFF` | Primary action, focus ring |
| `--state-danger` | `#E5484D` | Destructive action, errors |

State whether there is a light mode. "Dark only, `<html class="dark">`
permanently" is a valid and simplifying answer — say it rather than leaving it
open.

### Typography
Font families with a real fallback stack, the size scale with line heights, and
which weights exist. Name the mono face and what it is for (IDs, paths, code).

### Spacing, radii, elevation
The scale (e.g. 4px base), the radius values and which element size gets which,
and the shadow set. Three shadows is usually enough; if there are eight, half
are unused.

### Layout conventions
Navbar height and behaviour, sidebar width and whether it overlays or pushes,
container max-widths, breakpoints, and the rule that wide content (tables,
diagrams, code) scrolls inside its own container so the page body never scrolls
horizontally.

### Component conventions
The recurring decisions, stated once so twelve specs don't each decide
differently: button variants and when each is used, form field anatomy and
where inline errors render, how row actions reveal on hover, what a destructive
confirmation looks like, what a submitting button says, what an empty state
looks like, what a loading state looks like (and that a `QUEUED`-style wait is
explained, not left as an indistinguishable spinner).

### States and motion
Hover, focus-visible, active, disabled, loading, error, empty — for every
interactive element class. Motion: the duration and easing values, and what is
allowed to animate. Respect `prefers-reduced-motion`.

### Accessibility floor
Contrast minimum, focus visibility, target size, what must have a label, and
keyboard reachability. A number, not "should be accessible".

---

## 4. `INVENTORY.md`

The reuse registry. Full treatment in
[`reuse-inventory.md`](reuse-inventory.md); the short version:

- For an **existing repo**, build it by reading the real code before writing any
  spec. Grep for components, hooks, utils, constants, and types; record path,
  one-line purpose, and the "use this instead of…" note.
- For **greenfield**, it starts as a skeleton with the sections and the rules,
  and every spec appends to it as its final step.
- It is grouped by kind (components, hooks, api/services, utils, constants,
  types) with a stable `#anchor` per entry so specs can cite
  `INVENTORY.md#confirm-dialog`.
- The verification-pass spec does a duplication sweep against it.

---

## Plus: the tracker and the index

`PROGRESS.md` — one table (`# | Spec | Status | Depends on | Notes`), status
vocabulary exactly `Not started` · `In progress` · `Blocked` · `Done`, and an
append-only dated `Log` at the bottom. The `Notes` column is a **one-line
pointer, not a summary** — real detail lives in the spec's own Log. Update it in
the same pass as the spec file; they drift apart otherwise.

`README.md` — the index table (`# | Spec | Gate | What it covers`, where `Gate`
is `scoped` or `suite` so the checkpoints are visible), the dependency-order
table, the status legend, an `Open questions` section for anything the interview
did not settle, and a `Known gaps` section for accepted validator warnings.
