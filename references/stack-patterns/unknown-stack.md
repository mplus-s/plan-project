# When the stack is not React / React Native / Node

`react-node.md` is the house architecture and is not up for re-derivation. For
anything else — Django, Rails, Laravel, Go, Flutter, SwiftUI, Jetpack Compose,
Spring, Phoenix, .NET — **research the current idiom before writing
`ARCHITECTURE.md`. Do not write it from training-data memory.**

The reason is specific: framework conventions move, and a plausible-sounding
structure that is one major version stale produces a whole spec set that fights
the framework. The cost of being wrong here is paid by every spec.

## The research procedure

Do this once, in Phase 1, and record it in spec 00's Log with the date and what
you actually read.

### 1. Establish the real version first

```bash
cat pyproject.toml requirements.txt go.mod Cargo.toml composer.json pubspec.yaml \
    Gemfile build.gradle* Package.swift 2>/dev/null | head -60
```

Greenfield: ask, or take the current stable release and say so. The version
determines which conventions are current — everything below is answered
*for that version*, not in general.

### 2. Framework docs via `context7`

```
mcp__context7__resolve-library-id  → the library id
mcp__context7__query-docs          → project layout, recommended structure,
                                     testing, the framework's own opinion
```

Prefer this over web search for anything the official docs cover. Query for the
specific decisions you need, not "best practices":

- The framework's own recommended project layout for an app of this size
- Where business logic is supposed to live
- The dependency-injection / wiring story
- The official testing setup, and the end-to-end story specifically
- Validation at the boundary
- Configuration and secrets handling
- Migration/schema tooling, if there is persistence

### 3. Structure conventions via `WebSearch`

For what docs deliberately don't prescribe — folder layout at scale, service
layers, where the community landed. Search for the version, e.g.
`"Go project layout 2026 standard"`, `"Django app structure large project"`,
`"Flutter feature-first architecture riverpod"`. Weight: official docs > the
framework's own style guide > widely-adopted community layout > one blog post.

### 4. Look at the repo you are in

For an existing codebase, **the repo's own conventions outrank every external
source**. Read it before importing anything. If the repo contradicts the
community idiom, follow the repo and note the divergence in `ARCHITECTURE.md` —
a spec set that fights the codebase it lives in fails immediately.

## What you must come back with

Answer all of these before writing `ARCHITECTURE.md`. Any you cannot answer goes
to `Open questions` in `README.md` rather than being guessed:

| Question | Goes into |
| --- | --- |
| The idiomatic folder tree for this framework, at this size | `ARCHITECTURE.md` → Folder structure |
| Where business logic lives, and what it must not touch | `ARCHITECTURE.md` → Layer boundaries |
| How dependencies are wired, and when they are constructed | `ARCHITECTURE.md` → Layer boundaries |
| Where validation happens at the boundary | `ARCHITECTURE.md` → invariants |
| The naming convention for files and symbols | `ARCHITECTURE.md` → Naming |
| Generated/protected paths not to hand-edit | `ARCHITECTURE.md` → Protected files |
| The test runner, and the **end-to-end** harness specifically | `AGENT-GUIDE.md` + the harness spec |
| The build/typecheck/lint commands, verbatim | Every spec's `Done when` |
| The UI kit and theming mechanism, if there is a UI | `DESIGN-SYSTEM.md` |

The build, typecheck, and lint commands must be **run once** and confirmed to
work before they appear in fifteen `Done when` checklists. A wrong command in
every spec is fifteen wasted session starts.

## Translating the five house rules

The house rules are stack-specific in wording and general in intent. Carry the
intent across, and write the translated version into `ARCHITECTURE.md` as
numbered invariants:

| House rule | The general form to enforce |
| --- | --- |
| Server state separate from client state | Cached remote data and local UI state are distinct, with distinct lifecycles. Do not hand-roll loading/error/staleness flags |
| Feature folders, not type folders | Colocate everything one feature needs. Type-based trees collapse at scale |
| Hooks are the unit of reuse | Whatever this framework's composable unit is (composables, mixins, view models, services) is the reuse unit — not inheritance, not copy-paste |
| controller → service → repository | Transport, business logic, and data access are three layers, and the middle one is framework-agnostic. **Test: could you expose the same logic over a CLI without touching it?** |
| DI via factories/constructors | Nothing connects to a database or external service at import time |

Plus the two that are universal:

- **Validate at the edge, with types inferred from the schema.** Never trust
  unvalidated input past the boundary.
- **DTOs in and out.** Don't leak storage rows to clients.

## Record what you did

Spec 00's Log gets the receipts:

```markdown
- **2026-09-08** — Stack research. Django 5.2 (from `pyproject.toml`). Read the
  official docs on app structure and testing via context7, plus the Django
  styleguide on service layers. Adopted: apps-as-features with `services.py` and
  `selectors.py` per app, no fat models. Rejected: DRF viewsets for the internal
  API — the endpoints here are three custom actions, not CRUD, so plain views
  are simpler. E2E via Playwright against `manage.py runserver` with a seeded
  fixture; `pytest-django` for the rest. Commands confirmed working:
  `ruff check .`, `mypy .`, `pytest`.
```

If research and the repo disagree, or two credible sources disagree on something
with real cost, that is a **decision spec**, not a coin flip — write the
alternatives and the recommendation and let a human decide.
