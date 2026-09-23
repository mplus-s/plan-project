# Model selection per spec

Every spec carries a `**Model:**` header line naming the tier the work sits in
and one model per provider at that tier. It exists because the specs in one set
are not the same size of problem: a data-model or auth spec and a "wire the
footer links" spec do not deserve the same model, and the planning session is
the only point where the whole set is visible at once.

```markdown
**Model:** Standard — `claude-sonnet-5` · `gpt-6-sol` · `gemini-3.8-flash`
```

One line, the tier first, then the three ids separated by `·`. `bin/spec-run`
reads this line and passes the `claude-*` id to that spec's session as
`--model`, so a wrong id is a failed run, not a cosmetic error. `-m/--model`
on the command line overrides it; `--ignore-spec-model` turns the whole
mechanism off.

## The three tiers

| Tier | Anthropic | OpenAI | Google |
| --- | --- | --- | --- |
| **Heavy** | `claude-opus-5` | `gpt-6-astra` | `gemini-3.1-pro-preview` |
| **Standard** | `claude-sonnet-5` | `gpt-6-sol` | `gemini-3.8-flash` |
| **Light** | `claude-haiku-4-5` | `gpt-6-luna` | `gemini-3.5-flash-lite` |

Verified against the providers' own model pages on **2026-09-23**. Model
lineups move faster than this file does — before writing a set, check the ids
against <https://docs.claude.com/en/docs/about-claude/models>,
<https://developers.openai.com/api/docs/models> and
<https://ai.google.dev/gemini-api/docs/models>, and update the table here in the
same session if they have moved. A plausible-looking id that does not exist is
the same defect class as a hallucinated library export.

## Which tier a spec is in

Decide from the **shape of the work**, not from how long the spec is. The
question is how much of the system a mistake here would damage.

**Heavy** — the spec decides something the rest of the set inherits:

- Spec 00 and every other decision spec.
- The data model, the migration, the auth or session boundary.
- Anything cross-cutting: routing, the shared data layer, the token system,
  the e2e harness itself.
- A refactor that moves code other specs already depend on.
- **The verification pass is always Heavy.** It is the one session that has to
  hold the whole set in view and disbelieve the earlier ones.

**Standard** — the default, and most of a set. A feature-sized unit with real
logic: an endpoint plus its validation, a stateful component, CRUD over an
existing model, a screen wired to an existing API.

**Light** — mechanical, local, and verifiable by inspection:

- Config, scripts, CI files, environment plumbing.
- Copy, content, static pages, token or constant tables transcribed from a
  decided design system.
- Scaffolding a folder tree, moving files, renaming with no behaviour change.

When a spec sits between two tiers, take the higher one. The cost difference
between tiers is small next to one session that guesses wrong and has to be
re-run, and a Light session that stalls on a Standard problem costs the whole
session, not the difference.

## Rules

1. **Every spec gets the line**, including spec 00 and the verification pass.
2. **Name all three providers.** The set has to stay runnable on whichever
   agent is available; the spec does not get to assume Claude Code.
3. **Tier the spec, not the session.** If the set is run entirely on one model
   by choice, the line still records the judgement — it is what tells a human
   reviewer which specs are the risky ones.
4. **Never tier below the spec's own `Done when`.** A spec whose criteria
   include a `[suite]` run or a migration is Heavy regardless of its length.
5. **A Light spec that comes back Blocked gets re-tiered, not re-run.** Bump
   the tier, say so in the Log, and run it again. Re-running the same tier on
   the same wall is how a queue burns an afternoon.
