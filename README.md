# plan-project

A [Claude Code](https://claude.com/claude-code) skill that turns a brief — or an
existing repository — into a set of very small, dependency-ordered spec files
that a fresh, context-free agent session can pick up one at a time.

Each spec is small enough that one session can read it, implement it, verify it
end to end, and leave a written handoff. The skill plans; it does not implement.

## What it produces

```
<project>/specs/
  README.md              index — one table, every spec, dependency order
  PROGRESS.md            the tracker — status table + append-only dated log
  AGENT-GUIDE.md         how an implementing agent works in this repo
  ARCHITECTURE.md        folders, layers, boundaries, data model, invariants
  DESIGN-SYSTEM.md       the closed token list: colour, type, space, motion, states
  INVENTORY.md           reuse registry — what already exists, so nothing is rebuilt
  00-<decision>.md       a blocking decision, not a coding task
  01-<slug>.md           …one small unit each
  NN-verification-pass.md   the final gate
```

Four steering docs, one tracker, one index, and many small specs. Steering docs
are written once and read by every spec. Specs are disposable units of work.

## Install

Clone into your Claude Code skills directory:

```bash
git clone https://github.com/mplus-s/plan-project.git ~/.claude/skills/plan-project
```

Then invoke it in any session with `/plan-project`, or just ask to plan or spec
out a project.

## The validator

A spec set is not finished because it reads well:

```bash
python3 ~/.claude/skills/plan-project/scripts/validate-specs.py <project>/specs
```

Exit `0` clean (warnings allowed) · `1` errors · `2` no spec set found. It
mechanically checks the things that actually go wrong:

- header keys present, `Status` in the four-word vocabulary, `## Log` last
- dependencies resolve, and never point forward
- no two specs list the same path in `Owns`
- every `Explicit non-scope` deferral names a target spec that exists
- every `Reuses` path is on disk or owned by an earlier spec
- every `Done when` bullet carries a verifiability tier, and every spec has a
  `[static]` gate; every UI spec has an end-to-end one
- a whole-suite test run mistagged as a scoped `[e2e]`, and a spec set with no
  checkpoint before the final verification pass
- tracker rows match the spec files, one for one
- warns on code blocks in specs, raw hex outside `DESIGN-SYSTEM.md`, specs over
  130 lines, and anything created that no other spec ever mentions

## Ideas it is built around

- **A feature is several specs, not one.** Data layer → API → UI shell →
  interactions → polish. Length correlates with trouble, not clarity.
- **`Explicit non-scope` is mandatory, and every deferral names its target
  spec.** A deferral with no target excludes work nobody will ever do.
- **`Done when` is binary and tiered** — `[static]`, `[runtime]`, `[e2e]`,
  `[suite]`, `[requires: …]` — never "the flow works well".
- **End-to-end proof is scoped.** Every user-facing spec runs its own test file
  plus a capped smoke set; the whole suite is gated only at checkpoints and the
  final verification pass, so execution time stays flat as the set grows.
- **Ground every claim.** A path, a package, a library export, a prior state —
  checked against the real tree before it goes into a spec.
- **Reuse before creating.** `INVENTORY.md` makes "does this already exist?"
  answerable in one read.
- **Surface decisions, never bury them.** A fork with real cost either way gets
  written down with a recommendation and left for a human.

## Layout

```
SKILL.md                 the procedure — kept short, it is always loaded
references/              progressive disclosure; loaded only when relevant
  spec-format.md         the spec file format
  steering-docs.md       required sections of the four steering docs
  splitting.md           sizing rules and a worked split
  reuse-inventory.md     INVENTORY.md and the duplication sweep
  e2e-playwright.md      the end-to-end obligation, per stack
  stack-patterns/        react-node.md (house rules) · unknown-stack.md (research)
templates/               copy-and-fill starting points
scripts/validate-specs.py   the mechanical check
```

## Licence

MIT
