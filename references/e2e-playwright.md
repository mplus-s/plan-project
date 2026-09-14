# The end-to-end obligation

A spec is not done because the code compiles. It is done when the thing a user
does actually works, proven by something that ran in this session.

**Every spec that produces something a user can see or click carries at least
one `[e2e]` criterion in its `Done when`, and that box is ticked only after the
test ran and passed.** No exceptions for "it's just a small component" — a
component nobody can reach is not a milestone.

What that criterion *runs*, though, is scoped — see below. Re-proving the whole
application in every session is the thing that makes a spec set slow to execute,
and it is not what keeps it honest.

## Two gates, not one

There are two different obligations hiding in "the tests pass", and they have
very different costs:

| Obligation | Tag | Runs | Where |
| --- | --- | --- | --- |
| This unit's user path works | `[e2e]` | this feature's spec file **+ the `@smoke` set** | every user-facing spec |
| Nothing earlier broke | `[suite]` | the **whole** suite, from a clean build | checkpoint specs + the verification pass |

The per-spec gate is bounded — one feature file plus a smoke set that is capped
at about a minute — so it costs the same at spec 30 as at spec 3. The full-suite
gate grows with the project, so it is paid deliberately and rarely.

### Which specs carry `[suite]`

- **The last spec of each vertical slice** — the one that completes a
  user-reachable capability. That is the natural point to prove the slice
  integrated with everything before it.
- **Any spec that touches something cross-cutting**: design tokens, auth,
  routing, the shared data layer, anything every screen reads. A scoped run
  cannot see the blast radius of these, so scoping them is a real gap.
- **The verification pass**, always.

Everything else runs scoped. Name the checkpoint specs in `README.md` when the
DAG is drawn, so the choice is visible rather than left to whoever executes.

### The escape hatch

While the whole suite finishes in **under about two minutes**, keeping `[suite]`
on every spec is simpler and strictly safer — take it. Switch to scoped runs
once it crosses that line. State which mode the project is in, and the threshold,
in `AGENT-GUIDE.md`, so a session does not have to guess.

### What this trades away

A spec that breaks an unrelated earlier feature now surfaces at the next
checkpoint rather than inside the session that caused it. That is the cost. The
`@smoke` set is the mitigation and it is why the set must genuinely cover the
critical paths — if smoke is decorative, this trade is a bad one. The
verification pass remains the backstop.

## The harness is its own early spec

Before the first UI spec, there is a spec that owns the harness:

```markdown
# Spec 02 — End-to-end test harness

**Status:** Not started
**Depends on:** Spec 01
**Owns:** `playwright.config.ts`, `e2e/smoke.spec.ts`, `e2e/fixtures/`
**Reuses:** —

## Goal
Playwright installed, configured against the dev server, and green on one
trivial smoke test — so every later spec can carry a real `[e2e]` criterion
instead of a manual claim. Fixes the two run commands every later spec uses:
the scoped one and the whole-suite one.
```

Its `Done when` ends with both commands passing headless. Everything after it
inherits a working harness, which is the entire point of putting it this early:
a harness introduced at spec 11 means specs 03–10 have no proof.

## Setup

```bash
npm init playwright@latest        # or: npm i -D @playwright/test && npx playwright install --with-deps chromium
```

Config decisions the harness spec must settle, because otherwise each later spec
re-decides them:

- **`webServer`** in `playwright.config.ts` so the suite starts the app itself
  (`reuseExistingServer: !process.env.CI`). A suite that assumes a server is
  already up fails differently on every machine.
- **`baseURL`**, so tests say `page.goto('/board')`, not a hardcoded port.
- **Browsers**: chromium only is fine for a v1 — say so rather than leaving
  three projects configured and two never run.
- **Trace/screenshot on failure** (`trace: 'on-first-retry'`). Without it a
  headless failure in an unattended `spec-run` is unreadable.
- **Test data strategy**: seeded fixture, API setup, or UI setup. Pick one and
  write it in `ARCHITECTURE.md`; mixed strategies produce flaky suites.
- **The `@smoke` tag and the two scripts.** `test:smoke` runs the tagged set;
  the bare runner runs everything. Later specs cite these script names, never a
  hand-assembled command line:

  ```jsonc
  "test:e2e":   "playwright test",                 // the [suite] gate
  "test:smoke": "playwright test --grep @smoke"    // part of every [e2e] gate
  ```

### Keeping `@smoke` honest

The smoke set is the only regression cover most sessions get, so it has a budget
and a rule:

- **Under ~60 seconds, always.** If it grows past that, tests come out — it is a
  critical-path set, not a second suite.
- **One test per user-critical path**, not per feature: can a user load the app,
  authenticate, and complete the single most important action. Nothing else.
- **Tagged at the test, not the file** (`test('...', { tag: '@smoke' }, …)`), so
  a feature file can contribute one smoke test and keep its detail untagged.
- **Adding to it is a deliberate act.** A spec that adds a `@smoke` test says so
  in its Log with the new runtime. Drift here is silent and it is what turns the
  cheap gate expensive again.

## What a spec's e2e criterion looks like

Concrete, names its file, and describes user-visible truth:

```markdown
- [ ] `npx playwright test e2e/card-drag.spec.ts` passes headless: a card
      dragged from Todo to Done is still in Done after a full page reload. [e2e]
- [ ] `npm run test:smoke` passes with 0 failures. [e2e]
```

On a checkpoint spec, and only there, add the whole-suite gate:

```markdown
- [ ] `npm run test:e2e` passes with 0 failures; the real count is in the Log. [suite]
```

Not:

```markdown
- [ ] Drag and drop works.                    ← not binary, not verifiable
- [ ] Tested manually in the browser.         ← not reproducible by the next session
- [ ] Playwright tests added.                 ← "added" is not "passing"
- [ ] `npx playwright test` passes.  [e2e]    ← that is the whole suite; tag it [suite]
                                                 and put it on a checkpoint spec
```

## Rules for the tests themselves

- **Test the user's path, not the implementation.** Role- and text-based
  locators (`getByRole`, `getByLabel`, `getByText`) over CSS selectors — a test
  coupled to a class name breaks on a restyle and proves nothing about behaviour.
- **Add `data-testid` only where semantics genuinely cannot address the
  element**, and note it in `INVENTORY.md` so it is not reinvented.
- **Assert persisted state, not just optimistic UI.** Reload the page and assert
  again. The most common false pass is an optimistic update that never reached
  the server.
- **Web-first assertions** (`await expect(locator).toBeVisible()`), never
  `waitForTimeout`. A sleep is a flake with a delay fuse.
- **One file per feature area**, named for the feature, colocated under `e2e/`.
  Each spec that adds behaviour extends its feature's file rather than starting
  a new one — the same reuse rule as components. This is also what makes the
  scoped gate meaningful: if a feature's tests are scattered across four files,
  running one of them proves less than it looks like.
- **Independent tests.** Any test can run alone. A suite that only passes in
  order cannot be debugged — and under scoped runs it will be run alone.

## The verification-pass spec

The final spec runs the **whole** suite from a clean build, not just the tests
added most recently, and records the real numbers in its Log — `37/37 passing`,
not "tests pass". Its gate is `[suite]`. If a test that used to pass now fails,
that finding is the verification pass doing its job; record it and open a fix
spec.

## Non-web stacks

The obligation is "prove it end to end with something that runs", not
"Playwright specifically". Substitute the platform equivalent and say so in
`AGENT-GUIDE.md`:

| Stack | Harness | Note |
| --- | --- | --- |
| Web app / SPA / SSR | **Playwright** | The default |
| React Native | **Maestro** (flows) or **Detox** | Maestro is far lighter to stand up; prefer it unless Detox is already present |
| Electron / Tauri | **Playwright** via its Electron support | Same harness, different launcher |
| Headless API / CLI | **Playwright's `request` fixture**, or supertest/httpx against a **really started process** | Not unit tests with a mocked transport — the process must actually boot |
| Library with no runtime surface | Integration tests against the public API from a consuming test package | The `[e2e]` tier still applies; it means "used as a consumer would" |

The two-gate split carries over: every harness above can run a single file or a
tagged subset, and every one of them has a whole-suite invocation. Write both
commands into `AGENT-GUIDE.md` whatever the stack.

For a project with both a web client and an API, the web e2e suite covers the
integrated path and the API suite covers the contract. Both are `[e2e]`; say
which in each criterion.

## Where this is enforced

1. `AGENT-GUIDE.md` states the obligation, both run commands, and which mode the
   project is in.
2. Every UI spec carries an `[e2e]` bullet — `validate-specs.py` errors when a
   spec that owns a UI file has none.
3. A bare whole-suite command tagged `[e2e]` is an error: it is the per-spec
   repetition this split exists to remove.
4. Checkpoint specs carry `[suite]`, and the validator warns when a spec set
   long enough to need one has none before the verification pass.
5. The verification-pass spec runs the full suite.
6. `spec-run` gives each session the spec and the tracker, and the session ticks
   the box only after actually running it — the `Log` is where the real numbers
   land, and a Log without them is how you spot a session that skipped it.
