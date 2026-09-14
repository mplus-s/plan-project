# House patterns — React, React Native, Node

The architecture for this stack is settled. Do not re-derive it per project;
write it into `ARCHITECTURE.md` and enforce it in specs.

## The five rules

If only five rules were enforced across a codebase, these:

1. **Separate server state from client state.** TanStack Query (or SWR) for
   server cache; Zustand or Jotai for client state; Context for dependency
   injection only. This alone deletes most Redux boilerplate.
2. **Feature-based folders, not type-based folders.** Colocate the component,
   hook, test, and types.
3. **Custom hooks are the unit of logic reuse.** HOCs and render props are
   legacy.
4. **Node: controller → service → repository.** Business logic never touches
   `req`/`res`.
5. **Dependency injection via factory functions or constructors.** Nothing
   instantiates a DB client at import time.

Everything below is elaboration.

---

## React / React Native

### Structure

Feature-sliced, with a thin `shared/` for genuinely cross-cutting code:

```
src/
  features/
    checkout/
      components/
      hooks/
      api/
      types.ts
      index.ts       ← the only barrel in this feature
  shared/
  app/               ← routing, providers, composition root
```

Type-based folders (`components/`, `hooks/`, `utils/`) collapse at around 50
files. **Barrel files only at feature boundaries** — deep barrels cause circular
imports and defeat tree-shaking.

### Composition

- **Compound components for anything with variants**
  (`<Select><Select.Option/></Select>`). This is what prevents the
  fourteen-boolean-prop component.
- **Slots over config props.** Pass `renderHeader` or `children`, not
  `headerTitle` + `headerIcon` + `headerColor`.
- **Container/presentational, applied lightly.** Not every component needs a
  pair — but any component doing data fetching *and* complex rendering gets
  split, so the render half is testable and reusable.

### State

- Server cache belongs in a query library. Client state (modals, form drafts,
  filters) in Zustand or Jotai. Context for DI (theme, auth, i18n), **not** for
  frequently-changing values.
- **Split contexts by update frequency.** One `AppContext` holding user + theme
  + cart means every cart change re-renders the whole tree.
- **Reducer for interdependent transitions** (wizards, multi-step forms).
  `useState` for everything else.

### Boundaries

Error boundaries and Suspense boundaries are **architectural decisions, not
afterthoughts**. Decide per feature what degrades gracefully and what takes down
the screen — and write that decision into the feature's spec.

### React Native specifics

- **Platform-specific files** (`button.ios.tsx` / `button.android.tsx`) beat
  `Platform.OS` conditionals sprinkled through a component.
- `StyleSheet.create` **outside** the component body — inline style objects
  break memoization.
- Long lists: wrap `renderItem` in `useCallback`, always provide
  `keyExtractor`, prefer **FlashList**.
- **Navigation as a typed module** with a central param-list type. Untyped
  `navigate('Screen', {...})` is a common production bug source.
- No synchronous heavy work on the JS thread.

---

## Node.js

### Layering

```
route/controller  → HTTP concerns only (parse, validate, respond)
service           → business logic, framework-agnostic, no req/res
repository        → data access, one per aggregate
```

**The test for whether you got this right:** could you expose the same service
over gRPC or a CLI without touching it? If not, the layering is wrong.

### Injection and lifecycle

- **Factory functions** — `createUserService({ userRepo, logger })` — or a
  container. Avoid module-level singletons that connect on import; they make
  tests require a live database.
- **One composition root** that wires everything at startup, and it is the only
  file that knows about concrete implementations.

### Boundaries

- **Validate at the edge with a schema library (Zod), and infer types from the
  schema.** Never trust `req.body` typed as `any`.
- **DTOs in and out.** Don't leak database rows to clients — it couples the API
  to the schema and eventually leaks a `password_hash`.

### Errors

- Custom error classes carrying a status code and a machine-readable code, plus
  **one** error-handling middleware. No `try`/`catch` in every handler.
- Distinguish **operational** errors (retry or respond) from **programmer**
  errors (crash, let the supervisor restart).

### Config and ops

- **One validated config module.** `process.env` is referenced nowhere else in
  the codebase.
- Graceful shutdown (drain connections, finish in-flight work), health and
  readiness endpoints, structured logging with a correlation id threaded through
  the request.
- **Background work goes to a queue** (BullMQ) — not `setTimeout`, not
  fire-and-forget promises.

### Architecture

**Modular monolith** with clear internal module boundaries, until there is an
actual scaling or team-topology reason to split. Microservices bought too early
cost distributed transactions and undebuggable failures for no benefit.

---

## Shared types across client and server

Shared TypeScript types between a React/RN client and a Node backend belong in a
**workspace package** (pnpm workspaces or Nx), with the API contract as the
single source of truth. If multiple teams run against one backend, this is the
highest-leverage cross-cutting decision available.

---

## Anti-patterns — flag these in any spec or review

- `useEffect` computing derived state that could be a plain expression or
  `useMemo`.
- Redux/Zustand used as a server cache with hand-rolled loading/error/staleness
  flags.
- A single god Context wrapping the app.
- Business logic inside an Express handler.
- Abstractions written before the second concrete use case.
- Repositories that return ORM entities instead of domain objects.
- `any` at API boundaries; unchecked `as` casts.
- React Native: synchronous heavy work on the JS thread; unkeyed list items.

---

## Turning this into `ARCHITECTURE.md`

Do not paste this file. Instantiate it:

1. Write the **real folder tree** with this project's actual feature names.
2. Write the **layer boundary table** with this project's actual paths.
3. Pick and name the concrete libraries (query lib, state lib, validation lib,
   queue) in spec 00 with one line of rationale each.
4. Turn the five rules and the relevant anti-patterns into **numbered
   invariants** in `ARCHITECTURE.md`, phrased as checkable statements:

   > 4. Business logic never touches `req`/`res`. A service function takes and
   >    returns plain values.
   > 5. Server state lives in TanStack Query. No loading/error flag is
   >    hand-rolled in a store.
   > 6. Nothing instantiates a DB client at import time; `src/app/container.ts`
   >    is the only composition root.

5. Keep the anti-pattern list in `AGENT-GUIDE.md` as the review checklist.
