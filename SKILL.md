---
name: plan-project
description: Plan a project or feature as a set of very small, dependency-ordered spec files plus four steering docs — agent guide, architecture, design system, and a reuse inventory that stops duplicate components/constants — with a progress tracker. Use when starting a new project, adding a feature to an existing codebase, or when asked to plan, spec out, break down, or scope work before implementing. Output is `spec-run` compatible.
---

# plan-project

Turn a brief — or an existing repository — into a spec set small enough that a
fresh, context-free agent session can pick up exactly one unit, finish it,
verify it end to end, and leave a written handoff.

**This skill plans. It does not implement.** Planning ends when the spec set
validates. Execution is `spec-run` (see [Hand off](#phase-5--hand-off)).

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
  NN-<slug>.md
  NN-verification-pass.md   the final gate
```

Four steering docs, one tracker, one index, and many small specs. Steering docs
are written once and read by every spec. Specs are disposable units of work.

## When to use it

- A brand-new project, from a one-paragraph brief.
- A feature added to an existing codebase — same shape, specs numbered from the
  next free number, `INVENTORY.md` built by reading the real code first.
- A refactor or migration big enough that it won't fit in one sitting.

Not for a one-file fix, a bug, or anything you could finish in the current
session. Say so and just do the work.

---

## Phase 0 — Ground truth, then intake

**Never write a scope section from memory.** Establish what is actually there
before asking the user anything, so the questions are informed.

Greenfield: confirm the directory is empty or note what is in it.

Existing repo — run these and read the results:

```bash
git log --oneline -15; git status --short
cat package.json 2>/dev/null | head -60          # or pyproject.toml, go.mod, Cargo.toml…
find . -maxdepth 3 -type d -not -path '*/node_modules/*' -not -path '*/.git/*' | sort
ls .claude/ AGENTS.md CLAUDE.md .kiro/ specs/ context/ 2>/dev/null
```

Then interview. Use `AskUserQuestion` for forks with real cost either way; ask
in **one batched call**, not a drip. The questions worth asking are the ones
whose answers change the spec set:

1. **Scope boundary and explicit non-goals** — what v1 is *not*. This is the
   single highest-value answer; without it every spec grows.
2. **Stack**, if not already fixed by the repo.
3. **Design direction** — do they have a palette/brand/reference, or is Claude
   deciding? If they supply one, record it verbatim and invent nothing.
4. **Auth / multi-user / persistence** — these restructure the architecture.
5. **Deployment target**, if it constrains the stack.

Anything they did not answer is not product truth. Do not invent scope no
answer supports; put it in `Open questions` in `README.md` instead.

---

## Phase 1 — Stack and patterns

Spec `00` is always a **decision spec**: it records the stack, the storage
engine, the state strategy, and the testing approach, with rationale and the
alternatives that lost. A decision spec's "done" is the decision being made,
not code being written — mark it `Done` once recorded.

**If the stack is React / React Native / Node**, load
[`references/stack-patterns/react-node.md`](references/stack-patterns/react-node.md).
It is the house architecture and it is not up for re-derivation.

**If it is anything else** — Django, Rails, Go, Flutter, SwiftUI, Laravel,
Spring — load
[`references/stack-patterns/unknown-stack.md`](references/stack-patterns/unknown-stack.md)
and research the current idiom before writing `ARCHITECTURE.md`. Use the
`context7` MCP (`resolve-library-id` → `query-docs`) for framework docs and
`WebSearch` for structure conventions. **Do not write an architecture from
training-data memory for a stack you did not verify** — record what you checked
and when, in spec 00's Log.

---

## Phase 2 — The four steering docs

Write these before splitting anything. Every spec is generated against them, so
a contradiction here propagates into every unit.

Full contents and required sections:
[`references/steering-docs.md`](references/steering-docs.md).

| Doc | Owns | One-line test of a good one |
| --- | --- | --- |
| `AGENT-GUIDE.md` | Read order, one-unit-per-session rule, verify-before-asserting, done bar, both e2e run commands | A fresh session that reads only this knows how to behave |
| `ARCHITECTURE.md` | Real folder tree, layer boundaries, data model, naming, protected files, numbered invariants | Someone could create the empty folder tree from it exactly |
| `DESIGN-SYSTEM.md` | Closed token list with real hex values, type scale, spacing, radii, states, motion, a11y | A token not listed there does not exist |
| `INVENTORY.md` | Every reusable component/hook/util/constant/type with its path | Answers "does this already exist?" without a grep |

Two rules that carry most of the weight:

- **`DESIGN-SYSTEM.md` is a closed list.** Specs may only name tokens that
  appear in it. Inventing a plausible-sounding variant is a real, observed
  failure mode. Raw hex codes and raw palette classes are banned everywhere
  except this file. If the user supplied a design, transcribe it; otherwise
  decide it fully — palette, type, spacing, radii, elevation, motion — and say
  why in one line each.
- **`INVENTORY.md` is the anti-duplication mechanism.** For an existing repo,
  build it by reading the real code, not by guessing. For greenfield it starts
  as a skeleton and every spec appends to it as its last step. See
  [`references/reuse-inventory.md`](references/reuse-inventory.md).

Skip `DESIGN-SYSTEM.md` only for a project with no user interface at all — and
say so explicitly in `README.md` rather than silently omitting it.

---

## Phase 3 — Split into specs

Read [`references/splitting.md`](references/splitting.md) for the sizing rules
and a worked split. Read [`references/spec-format.md`](references/spec-format.md)
for the exact file format — it is a contract with `spec-run`, not a style
preference.

The short version:

- **One boundary per spec.** UI + background job is two specs. Persistence +
  realtime state is two specs. Three unrelated routes is three specs.
- **A feature is several specs**, near-always: data layer → API → UI shell →
  interactions → polish. Splitting is correct; one oversized unit is the
  failure mode.
- **40–130 lines.** Length correlates with trouble, not clarity. A long spec is
  a spec that should have been two.
- **Number by dependency.** A spec may only depend on lower numbers. Forward
  references are a defect.
- **The last spec is always a verification pass** — clean build, every earlier
  spec's `Done when` re-checked, full Playwright suite green, duplication sweep.
- **A mid-plan fork gets its own decision spec.** Never bury a decision inside
  an execution spec.

Every spec carries an **e2e obligation**, and it comes in two sizes. Anything a
user can see or click needs a Playwright test in its `Done when` — but that
per-spec gate is **scoped**: this feature's test file plus a capped `@smoke`
set, so it costs the same at spec 30 as at spec 3. The whole suite (`[suite]`)
is gated only at **checkpoint specs** — the last spec of each vertical slice,
anything touching tokens/auth/routing/the shared data layer — and at the
verification pass. A whole-suite run in every spec makes execution time
quadratic in the size of the set, and it is not what keeps the set honest.

The harness itself is an early spec of its own, and it fixes both run commands
so no later spec invents one. See
[`references/e2e-playwright.md`](references/e2e-playwright.md) for the contract,
the `@smoke` budget, the under-two-minutes escape hatch, and the per-stack
equivalents (Maestro/Detox for React Native, supertest + a real process for a
headless backend).

---

## Phase 4 — Validate before handing over

A spec set is not finished because it reads well. Run the validator:

```bash
python3 ~/.claude/skills/plan-project/scripts/validate-specs.py <project>/specs
```

It mechanically checks the things that actually went wrong in prior corpora:
missing or malformed headers, `Log` not last, dependencies that don't resolve
or point forward, two specs owning the same file, deferrals with no target spec,
`Reuses` paths that exist nowhere, untiered `Done when` bullets, UI specs with
no `[e2e]` criterion, whole-suite runs mistagged as `[e2e]`, a spec set with no
checkpoint before the verification pass, raw hex outside the design system, and
tracker rows that don't match the spec files.

Fix everything it reports as `ERROR`. Justify or fix every `WARN` — a warning
you chose to accept goes in `README.md` under `Known gaps`, not into silence.

Then do the two checks a script cannot do:

1. **Coverage.** Every endpoint, component, or module a spec creates is
   consumed by some later spec. Four specs can each individually-correctly
   defer wiring one button and leave three backends with zero callers.
2. **Prior-state truth.** Every "X is already installed" / "the existing Y" in
   any spec is derivable from an ancestor spec's `Done when`, or from a file
   that is actually on disk right now. Check the ones you wrote. This is the
   defect class that produces the most wasted implementation time.

---

## Phase 5 — Hand off

Don't start implementing. Tell the user:

```bash
spec-run status     # the table and what runs next
spec-run plan       # the execution order
spec-run next       # run one spec in a fresh session
spec-run            # work the whole queue, one fresh session each
```

`spec-run` gives each spec its own empty context window and treats the spec's
`Log` plus `PROGRESS.md` as the only handoff — which is why the format above is
a contract and not decoration.

---

## Hard rules

1. **Ground every claim.** A path, a package, a library export, a prior state —
   check it against the tree, `package.json`, or the installed `.d.ts` before
   writing it into a spec. Every defect class here is an unchecked factual
   claim about the world, not a prose problem.
2. **Specs are instructions, not descriptions.** Imperative: "Create
   `lib/db.ts`". At the intent level, never the code level — a spec that emits
   implementation code is a defect. The implementing agent owns syntax.
3. **`Explicit non-scope` is mandatory and every entry names its target spec.**
   A deferral with no target excludes work nobody will ever do.
4. **`Done when` is a checklist of binary, tiered facts**, ending with the
   build command. Never "the flow works well."
5. **Reuse before creating.** Every spec names what it reuses. Creating a
   second Button, a second date formatter, or a second colour constant is a
   review failure, not a style preference.
6. **Surface decisions, never bury them.** A fork with real cost either way
   gets written down with a recommendation and left for a human.
7. **Don't scaffold an empty `Log`.** It is added when work starts.

## Reference index

| File | Read it when |
| --- | --- |
| [`references/spec-format.md`](references/spec-format.md) | Writing any spec file — the exact format and the `spec-run` contract |
| [`references/steering-docs.md`](references/steering-docs.md) | Phase 2 — required sections of all four steering docs |
| [`references/splitting.md`](references/splitting.md) | Phase 3 — sizing rules, the DAG, a worked split |
| [`references/reuse-inventory.md`](references/reuse-inventory.md) | Building `INVENTORY.md` and enforcing reuse |
| [`references/e2e-playwright.md`](references/e2e-playwright.md) | Writing the e2e obligation, the scoped/suite split, and the harness spec |
| [`references/stack-patterns/react-node.md`](references/stack-patterns/react-node.md) | The stack is React, React Native, or Node |
| [`references/stack-patterns/unknown-stack.md`](references/stack-patterns/unknown-stack.md) | The stack is anything else |
| `templates/` | Copy-and-fill starting points for every file above |
| `scripts/validate-specs.py` | Phase 4 — always |
