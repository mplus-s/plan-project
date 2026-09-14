# Architecture

The structural source of truth. If implementation contradicts this file, the
file is updated in the same session — not later.

## Folder structure

<The actual tree, annotated. Not a description of one — someone should be able
to create the empty folders from this exactly.>

```
src/
  features/
    <feature>/
      components/
      hooks/
      api/
      types.ts
      index.ts        the only barrel — this feature's public surface
  shared/             genuinely cross-cutting only
  app/                routing, providers, composition root
e2e/                  end-to-end tests, one file per feature area
```

## Layer boundaries

| Path | Owns | Must never |
| --- | --- | --- |
| `<path>` | <responsibility> | <the negative half — this is the load-bearing column> |

## Naming conventions

- Files: `<kebab-case.ts>`. Named after the responsibility they contain, not the
  technology.
- Symbols: `<convention>`
- Tests: `<placement and naming>`

## Protected files

Do not hand-edit; edit `<what>` instead:

- `<generated output path>` — <generator>
- `<vendored primitives path>` — <how to restyle instead>

## Data model

<Entities and their fields at intent level. `status enum: DRAFT, ARCHIVED`, not
a schema block. Relationships. Where each kind of data lives.>

### Storage seam

<If there is more than one store or backend: the one module everything goes
through, and the rule that nothing else imports the driver directly. Name the
known exceptions explicitly — an undocumented exception is how a seam rots.>

## State ownership

| Kind of state | Lives in | Example |
| --- | --- | --- |
| Server cache | <lib> | <…> |
| Client state | <lib> | modals, drafts, filters |
| Dependency injection | Context / container | theme, auth, i18n |

<Plus any rule that prevents the common rot: split contexts by update frequency;
no hand-rolled loading/error/staleness flags; reducer only for interdependent
transitions.>

## Error and edge-case boundaries

<Per feature area: what degrades gracefully and what takes down the screen.
Where errors are handled. What the operational-vs-programmer error split is.>

## Shared helpers

<Any helper more than one spec must use verbatim, given here in full, once.
Specs point at it rather than re-deriving it. This is the one place code
belongs in a planning doc. Delete the section if there are none.>

## Invariants — violating one is a defect

Concrete and checkable, not aspirations. 6–15 of them.

1. <e.g. Business logic never touches `req`/`res`. A service takes and returns
   plain values.>
2. <e.g. Nothing instantiates a DB client at import time; `src/app/container.ts`
   is the only composition root.>
3. <e.g. Every backend endpoint created by a spec is consumed by at least one
   other spec.>
4. <e.g. Components hold no business logic.>
5. <e.g. Input is validated at the boundary with a schema; types are inferred
   from the schema, never hand-written alongside it.>
6. <e.g. No storage row is returned to a client — DTOs in and out.>
