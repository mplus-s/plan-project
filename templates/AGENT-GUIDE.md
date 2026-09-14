# Agent guide — how work happens in this repo

You are a fresh session with no prior context. Everything you need is on disk,
and everything you leave behind must be on disk too.

## Read before implementing

In this order, then the spec you were pointed at:

1. `specs/README.md` — what this project is, and the spec index
2. `specs/ARCHITECTURE.md` — folders, layers, data model, invariants
3. `specs/DESIGN-SYSTEM.md` — the closed token list *(skip for non-UI work)*
4. `specs/INVENTORY.md` — what already exists
5. `specs/PROGRESS.md` — **current state, what is actually done, known gaps**

`PROGRESS.md` is the single source of current state. Its status table and the
tail of its Log **outrank any assumption carried in from a previous session**.

## One spec per session

Implement exactly the spec you were given — nothing more. Its `Explicit
non-scope` is **binding**: if you notice work that belongs to another spec, write
one line about it in the Log and leave it alone. Do not start the next spec; a
separate fresh session picks it up.

A spec that combines UI and background work, or persistence and realtime state,
or several unrelated routes, is more than one spec. Say so and stop, rather than
doing all of it.

## Verify before you assert

Never write "X is already installed" or "the existing Y" without checking.

- A package claimed as pre-installed → read `<manifest file>`.
- A file path → resolve it against the tree.
- A library export → grep the installed types, or check the docs.
- A prior-state claim → find the ancestor spec's `Done when` that establishes it.
- An env-derived value behaving oddly → print what the process actually received
  before suspecting the code.

## Reuse before creating

Before creating any component, hook, constant, type, or util: search
`INVENTORY.md`, then grep the codebase **for the concept, not just the name you
would have used**. If a near match exists, extend it. Creating a second one is a
review failure.

After creating anything reusable, append it to `INVENTORY.md` **in this same
session** — path, purpose, and what it should be used instead of. An inventory
that lags one session behind is an inventory nobody trusts.

## Design tokens are a closed list

A token not in `DESIGN-SYSTEM.md` does not exist. Never a raw hex value, never a
raw palette class. If a needed token is genuinely missing, add it to
`DESIGN-SYSTEM.md` in this session and say so in the Log — do not invent a
plausible-sounding variant locally.

## End-to-end proof is not optional

Anything a user can see or click needs a passing end-to-end test before its box
is ticked.

- Harness: **<Playwright | Maestro | …>**
- Tests live in: `<e2e/>`
- **Scoped run** (every spec): `<npm run test:e2e e2e/<feature>.spec.ts>` plus
  `<npm run test:smoke>`
- **Whole suite** (checkpoint specs and the verification pass only):
  `<npm run test:e2e>`
- Tick an `[e2e]` or `[suite]` box only after the command ran and passed **in
  this session**. "Tests added" is not "tests passing".

### Which gate this spec owes

Read the spec's `Done when`; it says. The rule behind it:

- Most specs run **scoped** — their own feature file plus the `@smoke` set. This
  stays fast no matter how big the suite gets, which is the whole point.
- **Checkpoint specs** also run the whole suite (`[suite]`): the last spec of a
  vertical slice, and any spec touching design tokens, auth, routing, or the
  shared data layer.
- Suite mode for this project: **<scoped | full-suite-everywhere>**. While the
  whole suite finishes under **<2 minutes>**, every spec may simply run it —
  simpler and strictly safer. Past that, scoped runs are the default and this
  line gets updated.

If a scoped run passes but you have reason to think something else broke, run
the whole suite anyway and say so in the Log. The gate is a floor, not a ceiling.

### The `@smoke` set

`<npm run test:smoke>` is the only regression cover a scoped session gets. It is
capped at **<60 seconds>** and covers the critical paths only — load,
authenticate, complete the single most important action. Adding a test to it is
a deliberate act: say so in the Log, with the new runtime. If it drifts past its
budget, tests come out.

## Acceptance criterion tiering

| Tier | Tag | Meaning |
| --- | --- | --- |
| S | `[static]` | Typecheck, lint, build, or file inspection |
| R | `[runtime]` | Needs the app running, single process |
| E | `[e2e]` | A **scoped** end-to-end run that actually runs — this feature's file, plus `@smoke` |
| F | `[suite]` | The **whole** end-to-end suite green — checkpoint specs and the verification pass |
| X | `[requires: …]` | Needs live external services or multiple clients — list them |

`[static]` is mandatory on every spec. `[requires:]` names its dependencies so
nobody silently reports "passes" on something they could not run.

## Before finishing a spec

1. The spec works end to end within its defined scope.
2. No invariant in `ARCHITECTURE.md` was violated.
3. `<typecheck>` clean, `<lint>` clean (**0 errors, 0 warnings**), `<build>` passes.
4. Every `[e2e]` — and on a checkpoint spec, every `[suite]` — command in the
   spec's `Done when` has actually been run, with the real numbers in the Log.
5. `INVENTORY.md` records anything new and reusable.
6. `PROGRESS.md` and the spec's own Log reflect the work **and any verification
   gaps**.

## Update the tracker before finishing

Record what was built, what was verified, and — explicitly — **what could not be
verified in this environment**. Progress must reflect the actual state, not the
intended state. A caveat stated is worth more than a claim assumed.

Tick only boxes you genuinely confirmed. Append a dated Log entry with real
paths and real numbers, including any place an earlier estimate turned out
wrong — the correction is useful information, so record it rather than quietly
editing the estimate away.

**The Log you write is the only thing the next session inherits. Write it for
someone with zero context.**

## When blocked

Set `Blocked` in both the spec and `PROGRESS.md`, write in the Log what you
tried and what decision is needed, and stop. Do not guess your way past a real
decision.

## Review checklist — flag these

<Carry over the anti-patterns for this stack. For React/Node see the skill's
`react-node.md`; for anything else, the list produced during stack research.>

- <anti-pattern>
- <anti-pattern>
