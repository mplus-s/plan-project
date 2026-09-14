# Splitting a project into very small specs

The goal is a unit a fresh session with an empty context window can read,
implement, verify end to end, and commit — then stop. If a unit cannot be
finished in one sitting by someone who knows nothing yet, it is too big.

## The sizing rules

1. **One boundary per spec.** UI + background job → two specs. Persistence +
   realtime state → two specs. Three unrelated API routes → three specs. If you
   have to write "and also" in the Goal, split it.
2. **40–130 lines**, median around 55. Length correlates with trouble, not
   clarity. Four of the highest-divergence units in the reference corpus were
   its four longest specs.
3. **`Owns:` fits on one line.** If it does not, that is the split telling you
   where it goes.
4. **One commit.** If the natural commit message needs a semicolon, split it.
5. **A spec depends only on lower numbers.** No forward references, ever.

## A feature is several specs

This is the part people get wrong. "User authentication" is not a spec; it is
five. The standard decomposition, in dependency order:

| Layer | What it owns | Typical spec |
| --- | --- | --- |
| Contract | Types, schema, validation shapes | `NN-auth-types-and-schema` |
| Data | Tables/migrations, repository functions | `NN-auth-persistence` |
| Service | Business logic, framework-agnostic | `NN-auth-service` |
| Transport | Routes/handlers, validation at the edge, DTOs | `NN-auth-routes` |
| Client data | Query/mutation hooks, cache keys | `NN-auth-client-queries` |
| UI shell | Screens, layout, empty/loading/error states | `NN-login-screen` |
| Interaction | Submit, validation feedback, redirects | `NN-login-flow` |
| Edge cases | Session expiry, refresh, logout everywhere | `NN-session-lifecycle` |

Not every feature needs all eight. Most need four to six. Collapsing Service
into Transport is the most defensible merge for a small project — collapsing UI
shell into Interaction is the least, because it is where specs balloon.

## Worked example — "add commenting to a document viewer"

Wrong: one spec, "implement comments".

Right, eight specs:

```
12  comment data model and repository        Owns: db/migrations/003_comments.sql, src/features/comments/api/repo.ts
13  comment service and permissions          Depends on 12
14  comment REST routes + DTOs               Depends on 13
15  comment query/mutation hooks             Depends on 14
16  comment thread UI shell (read-only)      Depends on 15   ← first [e2e] here
17  comment composer and submit flow         Depends on 16
18  edit, delete, and optimistic update      Depends on 17
19  unread badge + notification hook-in      Depends on 17
```

Note what this buys:

- Spec 16 is where the first Playwright test lands, and it can be written before
  the composer exists — a read-only thread rendering seeded data is a real,
  provable milestone.
- Spec 19 depends on 17, not 18. The DAG is not a straight line, and saying so
  lets two specs run in either order.
- Spec 18's `Explicit non-scope` says "notification badge → spec 19", so neither
  session drifts into the other's work.
- **Spec 18 is the checkpoint** — the last spec that completes the commenting
  capability, so it carries the `[suite]` gate. Specs 12–17 and 19 run scoped:
  their own test file plus `@smoke`. One full-suite run for the slice instead of
  eight.

## The DAG

Draw it before numbering. For each spec, ask: what must be true before this can
start? That answer *is* `Depends on`, and it is stated explicitly in every file
— never left implicit in the numbering.

Number so that dependencies are always lower. Where two specs are independent,
number by which one unblocks more work.

Keep it in `README.md` as a table. If the project is large enough that the table
is hard to read, add a Mermaid graph — but the table is the source of truth,
because it is what the validator parses.

**Mark the checkpoints while drawing it.** Each vertical slice ends at one spec
that completes a user-reachable capability; that spec carries the `[suite]`
gate and every other spec in the slice runs scoped. Marking them in the
`README.md` table makes the choice reviewable instead of leaving it to whoever
executes. See [`e2e-playwright.md`](e2e-playwright.md).

## Fixed positions

**Spec 00 is a decision, not a coding task.** Stack, storage, state strategy,
testing approach, design direction — with alternatives and rationale. Marked
`Done` once recorded.

**An early spec is the scaffold**: repo init, tooling, lint/format/typecheck
config, the folder tree from `ARCHITECTURE.md` created empty, and the design
tokens from `DESIGN-SYSTEM.md` written into a real token file. Every later spec
consumes tokens instead of hardcoding values, which only works if this spec runs
early.

**An early spec is the e2e harness** — Playwright installed, configured,
scripted, and green on one trivial smoke test. It comes before the first UI
spec, so that every UI spec after it can carry a real `[e2e]` criterion.

**Each slice ends at a checkpoint spec.** Not a separate file — the slice's last
spec, the one that makes the capability reachable, simply carries `[suite]` as
well as `[e2e]`. Any spec touching something cross-cutting (design tokens, auth,
routing, the shared data layer) is also a checkpoint, because a scoped run
cannot see the blast radius of those.

**The last spec is the verification pass.** Depends on everything. Rebuild from
clean, re-check every earlier `Done when` against the real artifact, run the
whole suite, sweep for duplication, and record every correction in its Log.

**A mid-plan fork gets its own decision spec.** When a real choice appears while
planning — "do we also do the mobile client?", "which payment provider?" — it
becomes a numbered decision spec with a recommendation and the alternatives, and
a human decides. Never bury a decision inside an execution spec, and never pick
the default silently.

## Adding specs to an existing set

Same shape, numbered from the next free number. Two extra obligations:

1. **Build or refresh `INVENTORY.md` first**, from the real code. Specs that add
   to a codebase are the ones most likely to duplicate what is already there.
2. **Cite real file paths and real line references**, verified now — not
   transcribed from a plan doc written earlier, which may already be stale.

If the existing repo has no spec set, create the four steering docs by reading
the code, and say in each one that it was derived from the code rather than
decided up front — so a later reader knows which parts are intent and which are
observation.

## Anti-patterns in a spec set

- A spec whose Goal contains "and also".
- A spec with no `Explicit non-scope` — it will grow.
- A deferral with no target spec number.
- Two specs listing the same path in `Owns`.
- A spec that creates an endpoint no other spec consumes.
- `Done when` bullets that are restatements of the Goal.
- A spec that pastes implementation code instead of stating intent.
- Twelve specs that each independently decide what a button looks like, because
  `DESIGN-SYSTEM.md` was left half-decided.
- Every spec re-running the whole e2e suite. That is a `[suite]` gate wearing an
  `[e2e]` tag, and it makes execution time quadratic in the size of the set.
- A slice with no checkpoint — nothing between its first spec and the final
  verification pass ever proves the slice integrated.
