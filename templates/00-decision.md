# Spec 00 — <Stack, storage and design decision>

**Status:** Not started
**Depends on:** —
**Owns:** —
**Reuses:** —

> A decision spec is not a coding task. Its "done" is the decision being
> recorded with its rationale — not a merged change. Mark it `Done` as soon as
> this file is written and the scaffold it names exists.

## Goal

Settle every choice the rest of the spec set is generated against, so no later
spec has to re-decide one halfway through.

## Decisions

### Stack
**Decided:** <choice>
**Alternatives considered:** <what lost, and why>
**Rationale:** <one or two lines>

### Storage / persistence
**Decided:** <choice>
**Alternatives considered:** <…>
**Rationale:** <…>

### State strategy
**Decided:** <server cache lib / client state lib / what Context is used for>
**Rationale:** <…>

### Testing and end-to-end
**Decided:** <unit runner + e2e harness>
**Commands (confirmed working):** `<typecheck>`, `<lint>`, `<test>`, `<e2e>`, `<build>`
**Rationale:** <…>

### Design direction
**Source:** <user-supplied | decided here>
**Decided:** <the direction in two or three sentences — full token set lives in
DESIGN-SYSTEM.md, not here>
**Rationale:** <…>

## Decisions deferred to a human

<Any fork with real cost either way that should not be picked by an agent.
State the recommendation and the alternatives. Delete if none — but check
honestly first.>

## Explicit non-scope

- Any implementation → spec 01 onward.
- The full token list → `DESIGN-SYSTEM.md`.
- The folder tree → `ARCHITECTURE.md`.

## Steps

1. Run the intake questions and record the answers that constrain the above.
2. For a non-house stack, research the current idiom (see the skill's
   `unknown-stack.md`) and record what was actually read, with the date.
3. Confirm the build/typecheck/lint/test commands actually run.
4. Write `ARCHITECTURE.md`, `DESIGN-SYSTEM.md`, `AGENT-GUIDE.md`, `INVENTORY.md`.
5. Record the decisions above.

## Done when

- [ ] Every decision above is filled in with an alternative and a rationale. [static]
- [ ] All four steering docs exist and do not contradict each other. [static]
- [ ] Every command listed under Testing has been run once and works. [static]
- [ ] Anything unresolved is in `README.md` → Open questions, not guessed. [static]

## Log

- **YYYY-MM-DD** — <what was decided, what was checked to decide it, what was
  left to a human>
