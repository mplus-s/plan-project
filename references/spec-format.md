# Spec file format

This is a **contract**, not a style preference. `spec-run` parses these files to
decide what runs next, and checks after every session that the file is still
readable by the next one. Deviating breaks the runner silently.

## The file

`specs/NN-<kebab-slug>.md`, two-digit zero-padded number, numbered by dependency.

```markdown
# Spec 04 — Card CRUD and drag-and-drop

**Status:** Not started
**Depends on:** Spec 02, Spec 03
**Owns:** `src/features/board/components/card-item.tsx`, `src/features/board/hooks/use-card-drag.ts`
**Reuses:** `src/features/board/api/cards.ts` (spec 02), `DESIGN-SYSTEM.md#surfaces`, `INVENTORY.md#confirm-dialog`

## Goal

One or two sentences in plain terms. What is true when this is done, and what
it explicitly defers.

## Scope

The actual files, areas, and behaviours this spec touches — specific enough
that someone could start without re-deriving it. Intent level, not code level.

## Explicit non-scope

- Attachments and due dates on the card face → spec 06.
- Multi-board routing → spec 07.

## Reuse first

- Card read/write goes through `src/features/board/api/cards.ts`. Do not
  query the store directly from a component.
- Confirmation uses the existing `ConfirmDialog` (`INVENTORY.md#confirm-dialog`).
  Do not add a second dialog primitive.

## Steps

1. …
2. …

## Done when

- [ ] `pnpm typecheck` and `pnpm lint` pass with 0 errors, 0 warnings. [static]
- [ ] `pnpm build` passes. [static]
- [ ] `pnpm test:e2e e2e/card-crud.spec.ts` passes headless: a card dragged
      between columns is still there after reload. [e2e]
- [ ] `pnpm test:smoke` passes with 0 failures. [e2e]
- [ ] Deleting a card cascades to its attachments. [runtime]

## Log

<!-- added when work starts, never scaffolded empty -->

---

## The header block

Everything above the first `##`. `spec-run` greps it with `-m1` and re-checks it
after every session, so:

- `**Status:**` and `**Depends on:**` **must be there, must be first**, and must
  stay above the first `##` heading. If a session moves them, the runner reports
  damage.
- Each key sits on **one line**. `**Owns:**` that will not fit on one line is
  the clearest signal you have that the spec should be two specs.

| Key | Required | Value |
| --- | --- | --- |
| `**Status:**` | yes | Exactly one of `Not started` · `In progress` · `Blocked` · `Done` |
| `**Depends on:**` | yes | `Spec 01, Spec 02`, a range `00-06`, or `—` for none |
| `**Owns:**` | yes | Comma-separated paths this spec creates or is the sole editor of. `—` for a decision spec |
| `**Reuses:**` | recommended | Paths, `DESIGN-SYSTEM.md#anchor`, or `INVENTORY.md#anchor` this spec must build on rather than reinvent |

`Owns` is what makes ownership collisions machine-checkable: two specs listing
the same path is an error, and it is the most common cause of two sessions
writing conflicting versions of one file.

## Required sections, in this order

`Goal` · `Scope` · `Explicit non-scope` · `Reuse first` · `Steps` · `Done when` · `Log`

- `Reuse first` may be omitted only on spec 00 and on a spec that genuinely
  builds the first of its kind. Say which in `Scope` if you omit it.
- **`Log` is always last.** `spec-run` verifies this. It is a diary, append-only,
  dated, never rewritten. It is allowed to be longer and messier than the rest
  of the file — corrected numbers, the real path found instead of the assumed
  one, "here is what I actually did and why".
- Do not scaffold an empty `Log`. Add the heading when the first entry is written.

## `Explicit non-scope` — the highest-value section

Each entry names something a competent agent would **plausibly** do that this
unit must not, and **names the spec that picks it up**. The arrow and number are
machine-checked.

```markdown
- Attachments on the card face → spec 06.
- Dark theme tokens → spec 09.
```

A deferral with no target, or a target that does not exist, is an error: it
excludes work nobody will ever do. In a prior corpus 4 of ~21 deferrals were
permanently orphaned, and four specs each individually-correctly deferred
wiring one button — leaving three backend units with zero callers. That
intersection is why coverage is checked across the whole set, not per spec.

## `Done when` — binary, tiered, ends with the build

Every bullet is checkable by inspection or by running something, and carries a
verifiability tier:

| Tier | Tag | Meaning |
| --- | --- | --- |
| S | `[static]` | Typecheck, lint, build, or file inspection |
| R | `[runtime]` | Needs the app running, single process |
| E | `[e2e]` | A **scoped** Playwright (or platform-equivalent) run that actually runs — this feature's file, plus the `@smoke` set |
| F | `[suite]` | The **whole** end-to-end suite green. Checkpoint specs and the verification pass only |
| X | `[requires: X, Y]` | Needs live external services or multiple clients — list them |

- **At least one `[static]` on every spec**, and the last two are always the
  typecheck/lint and build commands.
- **At least one `[e2e]` on every spec that produces something a user sees or
  clicks.** No exceptions for "it's just a small component".
- **`[e2e]` is scoped, `[suite]` is not.** A bare whole-suite command
  (`npx playwright test` with no file and no `--grep`) tagged `[e2e]` is a
  defect: it makes every session re-prove every earlier spec, which is quadratic
  in the size of the set and is what the two tags exist to separate. Tag it
  `[suite]` and move it to a checkpoint spec.
- **`[suite]` belongs on the last spec of each vertical slice**, on any spec
  touching something cross-cutting (tokens, auth, routing, the shared data
  layer), and always on the verification pass. See
  [`e2e-playwright.md`](e2e-playwright.md) for the full rule and the
  under-two-minutes escape hatch.
- `[requires:]` names its dependencies so nobody silently reports "passes" on
  something they could not run. In a prior corpus 57% of criteria needed live
  services with no marker, and the build was the only gate that ever gated.

Never write "the design flow works well", "the UI looks correct", or "tested
manually" without saying what was run.

## Intent level, never code level

> status enum: `DRAFT`, `ARCHIVED`

not

> ```prisma
> enum ProjectStatus { DRAFT ARCHIVED }
> ```

The implementing agent owns syntax, naming details, and library specifics. The
spec owns *what must be true when it is done*. **A spec that emits
implementation code is a defect** — it dates instantly, it conflicts with the
real file, and it invites copy-paste over comprehension.

The exception: a shared helper that several specs must use **verbatim** belongs
in `ARCHITECTURE.md` in full, once, and the specs point at it.

## Prior-state assertions

"X is already installed", "the existing Y", "as set up in spec 02" — these are
load-bearing and they go wrong. Every assertion about prior state must be
derivable from an ancestor spec's `Done when`, or from a file that is on disk
right now.

A false prior-state claim sends the implementer to reconcile reality mid-unit,
which is exactly when scope blows out. A prior corpus claimed "Prisma is already
installed" when it was not — twice, in one corpus.

## Symbol provenance

Distinguish the two sources explicitly, because they fail differently:

- **Library exports** — resolve against the installed `.d.ts` or the docs
  (`context7`). If it is not there, the spec is wrong.
- **Project symbols** — created by this spec or an ancestor, checked against
  that ancestor's `Done when`.

A prior corpus told an implementer to "use `useLiveblocksFlow`", a name that
does not exist in Liveblocks. The implementer created it as a project hook
because the spec said to, a later spec referenced it again, and a hallucinated
library export became permanent project API by inheritance.

## Length

**40–130 lines. Median around 55.** A spec running long is a signal the unit
should be split — in the reference corpus, the four longest specs were also four
of the highest-divergence units. Length correlated with trouble, not clarity.

## Special specs

**Spec 00 — the decision spec.** Records the stack, storage, state strategy,
testing approach, and design direction, each with the alternatives that lost and
one line of rationale. `Owns: —`. Its `Done when` is the decision being recorded,
not code existing, so it is marked `Done` as soon as it is written and the
scaffold exists. Later forks get their own decision specs — clearly marked, never
buried inside an execution spec.

**The last spec — the verification pass.** Always present, always last, always
depends on everything (`Depends on: 00-12`). It rebuilds from clean, re-checks
every earlier spec's `Done when` against the real artifact, runs the whole
Playwright suite (`[suite]`, with the real pass count in its Log), and does the
duplication sweep described in `reuse-inventory.md`. Its Log is where "spec 05 claimed X, actually Y" gets
recorded.
