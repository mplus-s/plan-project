# <Project> — spec index

<One paragraph: what this project is, and the single most important scope
boundary. Written so someone who has never seen it can decide whether a given
piece of work belongs here.>

This folder breaks the work into small, independently workable specs — goal,
exact scope, explicit non-scope, steps, and a done-when checklist each. Work
through them in numeric order; `00` is the decision everything else depends on.

Track progress in [PROGRESS.md](./PROGRESS.md).

## Steering docs — read before any spec

| Doc | What it settles |
|---|---|
| [AGENT-GUIDE.md](./AGENT-GUIDE.md) | How to work here: read order, one spec per session, verification bar |
| [ARCHITECTURE.md](./ARCHITECTURE.md) | Folder tree, layer boundaries, data model, invariants |
| [DESIGN-SYSTEM.md](./DESIGN-SYSTEM.md) | The closed token list: colour, type, spacing, states, motion |
| [INVENTORY.md](./INVENTORY.md) | What already exists — check before creating anything |

## Spec list

`Gate` is the end-to-end obligation: **scoped** (this spec's own test file plus
`@smoke`) or **suite** (the whole suite green). Checkpoints are the last spec of
each vertical slice and anything touching tokens, auth, routing, or the shared
data layer.

| # | Spec | Gate | What it covers |
|---|---|---|---|
| 00 | [<Decision>](./00-<slug>.md) | — | <Stack, storage, state, testing, design direction. Read first.> |
| 01 | [<Title>](./01-<slug>.md) | scoped | <one line> |
| NN | [<Slice end>](./NN-<slug>.md) | **suite** | <one line — checkpoint: completes <capability>> |
| NN | [Verification pass](./NN-verification-pass.md) | **suite** | Final gate: clean build, every done-when re-checked, full e2e suite, duplication sweep. |

## Dependency order

| Spec | Depends on |
|---|---|
| 00 | — |
| 01 | 00 |
| 02 | 01 |

## Status shorthand

- **Not started** — nothing done yet
- **In progress** — actively being worked, or resumed from a stopped session
- **Blocked** — waiting on a decision or another spec
- **Done** — done-when checklist fully checked, and actually verified

## Open questions

<Anything the intake did not settle. Do not invent scope to fill these — they
stay here until a human answers them. Delete the section if empty.>

## Known gaps

<Validator warnings that were deliberately accepted, with one line of why.
Delete the section if empty.>
