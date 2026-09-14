# Inventory — what already exists

**Check this before creating any component, hook, constant, type, or util.**
If a near match exists, extend it. Creating a second one is a review failure.

**Appending to this file is the last step of every spec.** An inventory that
lags one session behind is an inventory nobody trusts.

Entry shape — three lines, with a stable anchor so specs can cite
`INVENTORY.md#<anchor>`:

```markdown
### `<anchor-name>`
`<path>` — <one-line purpose>
**Use instead of:** <what not to build>
**Added by:** spec NN.
```

Keep it to three lines. This is an index, not documentation — if an entry needs
a paragraph, the thing it describes needs a doc comment instead.

## Components

<none yet>

## Hooks

<none yet>

## API / services

<none yet>

## Utils

<none yet>

## Constants

<none yet>

## Types

<none yet>

## Test helpers and fixtures

<none yet — including any `data-testid` conventions, so they are not reinvented>
