# GitHub issue and PR workflow

One spec is one issue is one pull request. The spec set is the plan, the issue
tracker is where humans watch it happen, and neither is allowed to drift from
the other.

The implementing session does this, not the planning session. The planner's job
is to leave the `**Issue:**` header line in place (`—` until an issue exists)
and to state the workflow in `AGENT-GUIDE.md`; `bin/spec-run` puts the same
steps in every session prompt, and switches them off when the project has no
GitHub remote or `gh` is not authenticated.

## Preconditions

```bash
gh auth status                       # authenticated
git remote get-url origin            # a github.com remote
gh label create spec --color 0E8A16 --description "One spec from the plan" --force
```

`gh` failing is not a reason to abandon the spec. It is bookkeeping around the
work: write what failed in the Log and do the work.

## At the start of a spec — find, then create

**Search before creating.** Two issues for one spec is the failure this
ordering exists to prevent, and it happens whenever a session assumes a fresh
start:

```bash
gh issue list --state all --search "Spec 04 in:title" \
  --json number,title,state,url
```

Match on the title prefix `Spec 04 ` — that prefix is the join key between the
spec file and the issue, which is why the title format is fixed.

**If no issue exists**, create one:

```bash
gh issue create \
  --title "Spec 04 — Card CRUD and drag-and-drop" \
  --label spec --label spec:04 \
  --body-file - <<'BODY'
From `specs/04-card-crud.md`.

<the spec's Goal, verbatim>

**Done when**
<the spec's Done-when list, verbatim>

Depends on: #<issue numbers of the specs this one depends on>
BODY
```

**If one exists**, use it — never open a second. Either way, finish by claiming
it and recording it:

```bash
gh issue edit <n> --add-assignee @me
gh issue comment <n> --body "Started — session for spec 04, $(date +%F)."
```

Then write the number into **both** files before any code is written:

- the spec's header: `**Issue:** #<n>`
- the tracker row's `Issue` column: `#<n>`

A session that does the work first and the bookkeeping last is a session whose
issue never gets created, because that is the step that gets cut when something
goes wrong.

## At the end of a spec — branch, PR, move to Done

```bash
git switch -c spec/04-card-crud
git add -A && git commit -m "Spec 04 — card CRUD and drag-and-drop

Closes #<n>"
git push -u origin spec/04-card-crud
gh pr create --fill --body "Closes #<n>

Spec: \`specs/04-card-crud.md\`
Done-when evidence is in that spec's Log."
```

`Closes #<n>` in the PR body is what actually closes the issue, and only when
the PR merges. **Never merge your own PR** — the PR is the human review gate,
and a spec queue that merges itself has no gate at all.

Moving the issue to Done depends on what the repo has:

- **A project board with a Status field** — move the item:

  ```bash
  gh project item-list <number> --owner <owner> --format json   # find the item id
  gh project item-edit --id <item-id> --project-id <project-id> \
    --field-id <status-field-id> --single-select-option-id <done-option-id>
  ```

  The ids come from `gh project field-list <number> --owner <owner> --format json`.
  Look them up; do not guess them.

- **No board** — the merge closes the issue via `Closes #<n>`. Say that in the
  Log rather than closing the issue by hand: an issue closed without a merged
  PR is a spec that looks finished and is not.

## What goes in the Log

The issue URL, the PR URL, and anything `gh` refused to do. The next session
inherits only what is on disk — a PR number that exists solely in a terminal
that has since closed is lost work.

## Rules

1. **Search before create.** Always, even on a clean-looking queue.
2. **Issue before code**, PR after the `Done when` checks actually pass.
3. **One issue, one PR, one spec.** A PR that closes two issues means two
   specs were done in one session, which the one-spec-per-session rule forbids.
4. **Never merge your own PR**, and never close an issue by hand to make a
   board look tidy.
5. **`gh` failures are logged, not fatal.** The spec's `Done when` is the gate;
   the issue is the record.
