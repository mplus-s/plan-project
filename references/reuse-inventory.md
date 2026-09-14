# `INVENTORY.md` — the anti-duplication mechanism

The failure this exists to stop: session 4 writes `formatDate`, session 9 writes
`dateFormat`, session 14 writes `toDisplayDate`. None of them was wrong in
isolation. Nobody notices until three of them disagree about timezones.

A fresh session has no memory of what earlier sessions built. Grep is not a
reliable substitute, because it only finds things you already thought to look
for — you cannot grep for a component whose name you would have chosen
differently. `INVENTORY.md` is the index that makes "does this already exist?"
answerable in one read.

## Building it for an existing repo

Do this **before writing any spec**, in Phase 2. Read the real code; do not
guess. A useful starting sweep, adapted to the stack:

```bash
# components / screens
find src -type f \( -name '*.tsx' -o -name '*.jsx' -o -name '*.vue' -o -name '*.svelte' \) \
  -not -path '*/node_modules/*' | sort

# hooks and composables
grep -rl --include='*.ts' --include='*.tsx' -E '^export (default )?function use[A-Z]' src

# exported utils, constants, and types
grep -rhoE '^export (const|function|class|type|interface|enum) [A-Za-z0-9_]+' src \
  | sort -u

# design values that should have been tokens
grep -rnE '#[0-9a-fA-F]{3,8}\b' src --include='*.ts*' --include='*.css' | head -50
```

Then read the files the sweep surfaces. The inventory records **purpose**, and
purpose is not derivable from a symbol name — a `Card` that is a payment card
and a `Card` that is a surface container are the duplication you are trying to
catch, and they look identical in a grep.

That last grep is a bonus finding: raw hex still in the source is either a
missing token or a token violation, and it belongs in `DESIGN-SYSTEM.md` and in
a cleanup spec.

## Building it for greenfield

It starts as a skeleton — the section headings, the rules, and an empty table
under each. It fills up as specs complete, because **appending to it is the last
step of every spec**.

## The format

Grouped by kind. Every entry gets a stable anchor so specs can cite
`INVENTORY.md#confirm-dialog`, and a `Use instead of` column that says what
*not* to build.

```markdown
## Components

### `confirm-dialog`
`src/shared/components/confirm-dialog.tsx` — destructive-action confirmation,
title + body + cancel/confirm, no text input.
**Use instead of:** any new modal, alert, or "are you sure" prompt.
**Added by:** spec 03.

### `empty-state`
`src/shared/components/empty-state.tsx` — centred icon + one line of muted copy,
optional action slot.
**Use instead of:** ad-hoc "nothing here yet" markup.
**Added by:** spec 05.

## Hooks

### `use-debounced-value`
`src/shared/hooks/use-debounced-value.ts` — debounces any value, default 250ms.
**Use instead of:** a local `setTimeout` in a component.
**Added by:** spec 07.

## API / services

## Utils

## Constants

### `query-keys`
`src/shared/query-keys.ts` — every TanStack Query key in the app, one factory
per resource.
**Use instead of:** an inline array literal as a query key anywhere.
**Added by:** spec 04.

## Types
```

Keep entries to three lines. This is an index, not documentation — if an entry
needs a paragraph, the thing it describes needs a doc comment instead.

## How specs consume it

Two mechanisms, both mandatory:

1. **The `**Reuses:**` header line** names the exact paths and anchors this spec
   must build on. The validator checks every one of them resolves — to a file on
   disk, or to something an ancestor spec owns. A `Reuses` entry that resolves
   nowhere is an invented reference, which is how hallucinated symbols become
   permanent project API.

2. **The `## Reuse first` section** says it in prose, with the specific
   temptation named:

   > - Card read/write goes through `src/features/board/api/cards.ts`. Do not
   >   query the store directly from a component.
   > - Confirmation uses the existing `ConfirmDialog`
   >   (`INVENTORY.md#confirm-dialog`). Do not add a second dialog primitive.

   Naming the temptation is what makes it work. "Reuse existing components" is
   ignorable; "do not add a second dialog primitive" is not.

## The rule in `AGENT-GUIDE.md`

> Before creating any component, hook, constant, type, or util: search
> `INVENTORY.md`, then grep the codebase for the concept (not just the name you
> would have used). If a near match exists, extend it or lift it into `shared/`.
> Creating a second one is a review failure.
>
> After creating anything reusable, append it to `INVENTORY.md` **in the same
> session**, with its path, its purpose, and what it should be used instead of.
> An inventory that lags one session behind is an inventory nobody trusts.

## The duplication sweep

The verification-pass spec runs it. It is a real step with real commands, not a
vibe check:

```bash
# near-duplicate exported symbol names
grep -rhoE '^export (const|function|class) [A-Za-z0-9_]+' src \
  | awk '{print tolower($3)}' | sort | uniq -c | sort -rn | head -20

# components with suspiciously similar names
find src -name '*.tsx' -exec basename {} .tsx \; | sort

# raw hex that should be a token
grep -rnE '#[0-9a-fA-F]{3,8}\b' src --include='*.ts*' --include='*.css' \
  | grep -v 'design-tokens'

# inventory entries whose file no longer exists
grep -oE '`[^`]+\.(ts|tsx|js|jsx|css)`' specs/INVENTORY.md | tr -d '`' \
  | while read -r p; do [ -f "$p" ] || echo "STALE: $p"; done
```

Findings go in the verification spec's Log, and anything real becomes a cleanup
spec — not a silent edit during the verification pass, which is meant to observe
and not to change things.

## What this does not do

It does not stop deliberate duplication, and it should not try. Two components
that look similar today and are owned by different features are often correctly
separate — premature extraction into `shared/` is its own anti-pattern, and
abstractions written before the second concrete use case are worse than
duplication. The inventory's job is to make the choice **conscious**, not to
force extraction.
