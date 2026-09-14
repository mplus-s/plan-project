# Spec NN — <Title>

**Status:** Not started
**Depends on:** Spec NN, Spec NN
**Owns:** `path/to/file.ts`, `path/to/other.tsx`
**Reuses:** `path/to/existing.ts` (spec NN), `DESIGN-SYSTEM.md#<anchor>`, `INVENTORY.md#<anchor>`

## Goal

<One or two sentences in plain terms: what is true when this is done, and what
it explicitly defers. No "and also".>

## Scope

<The actual files, areas, and behaviours this spec touches — specific enough
that someone could start without re-deriving it. Intent level, not code level:
"status enum: DRAFT, ARCHIVED", not a Prisma block.>

## Explicit non-scope

- <Something a competent agent would plausibly do here but must not> → spec NN.
- <Another> → spec NN.

## Reuse first

- <The specific temptation, named.> Do not <create the second thing>.
- <Where the existing helper/component/token lives, and that it is the one to use.>

## Steps

1. <Concrete enough to start from, not a restatement of the Goal.>
2. <…>

## Done when

- [ ] <Verifiable statement about behaviour.> [runtime]
- [ ] `<scoped e2e cmd> e2e/<feature>.spec.ts` passes headless: <the
      user-visible truth it proves, including a reload assertion>. [e2e]
- [ ] `<smoke cmd>` passes with 0 failures. [e2e]
- [ ] `<typecheck cmd>` and `<lint cmd>` pass with 0 errors, 0 warnings. [static]
- [ ] `<build cmd>` passes. [static]
<!-- Checkpoint specs only — the last spec of a slice, or one touching tokens,
     auth, routing, or the shared data layer. On those, add this line and
     delete the comment; on every other spec delete the whole block.
     [ ] `<whole-suite cmd>` passes with 0 failures; real count in the Log. [suite]
-->

## Log

<!-- Added when work starts. Do not scaffold this empty — delete the heading
     until there is a first entry. -->
