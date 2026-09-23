# <Project> — progress tracker

The single source of truth for "where are we". Update it in the same pass as the
spec file — never as an afterthought, or the two drift.

| # | Spec | Status | Depends on | Model | Issue | Notes |
|---|------|--------|------------|-------|-------|-------|
| 00 | [<Decision>](./00-<slug>.md) | Not started | — | Heavy | — | |
| 01 | [<Title>](./01-<slug>.md) | Not started | 00 | Standard | — | |
| NN | [Verification pass](./NN-verification-pass.md) | Not started | 00-NN | Heavy | — | Final gate |

`Notes` is a **one-line pointer**, not a summary — the real detail lives in each
spec's own Log. `Model` is the tier from the spec's own `**Model:**` line; the
full per-provider ids live there, not here. `Issue` is `—` until a session opens
the GitHub issue, then `#<n>` — and it must match the spec header, because that
pair is what stops a second issue being opened on a later run.

## Status legend

Not started · In progress · Blocked · Done

## Log

Append-only, dated, newest at the bottom. One entry per spec or per meaningful
chunk of work, mirroring what went into that spec's own Log. This is the "read
one file to catch up" view.

- **YYYY-MM-DD** — <what happened, real paths, real numbers, and any place an
  earlier estimate turned out wrong>
