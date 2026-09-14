#!/usr/bin/env python3
"""
validate-specs.py — mechanical checks over a plan-project spec set.

Usage:
    validate-specs.py [specs-dir]        # default: ./specs, else ./*/specs, else .

Checks the things that actually go wrong: malformed headers that break
`spec-run`, dependencies that don't resolve or point forward, two specs owning
one file, deferrals with no target, `Reuses` paths that exist nowhere, untiered
`Done when` bullets, UI specs with no end-to-end criterion, whole-suite runs
mistagged as scoped `[e2e]`, spec sets with no checkpoint before the final
verification pass, code emission, raw hex outside the design system, and tracker
rows that don't match the files.

Exit codes: 0 clean (warnings allowed) · 1 errors found · 2 no spec set here.
"""

import os
import re
import sys
from collections import defaultdict

STATUSES = {"Not started", "In progress", "Blocked", "Done"}
REQUIRED_SECTIONS = ["Goal", "Scope", "Explicit non-scope", "Steps", "Done when"]
STEERING = ["README.md", "PROGRESS.md", "AGENT-GUIDE.md", "ARCHITECTURE.md", "INVENTORY.md"]
TIERS = re.compile(r"\[(static|runtime|e2e|suite|requires:[^\]]*)\]", re.I)
# a backticked end-to-end runner invocation, e.g. `npx playwright test e2e/x.spec.ts`
RUNNER = re.compile(r"`([^`]*\b(?:playwright\s+test|maestro\s+test|detox\s+test"
                    r"|test:e2e)\b[^`]*)`", re.I)
# evidence that such an invocation is scoped rather than the whole suite
SCOPED = re.compile(r"(\.spec\.|\.test\.|/|--grep|--project|--shard|--only-changed"
                    r"|--last-failed|@\w|smoke)", re.I)
UI_EXT = (".tsx", ".jsx", ".vue", ".svelte", ".dart", ".swift", ".kt", ".html")
UI_DIR = re.compile(r"(^|/)(components?|screens?|pages?|views?|widgets?|app)(/|$)")
CODE_LANGS = {"ts", "tsx", "js", "jsx", "python", "py", "go", "java", "rb",
              "php", "prisma", "sql", "css", "scss", "swift", "kotlin", "dart",
              "rust", "rs", "c", "cpp", "cs"}
HEX = re.compile(r"(?<![\w.#/-])#(?:[0-9a-fA-F]{8}|[0-9a-fA-F]{6}|[0-9a-fA-F]{3})(?![\w-])")
SPEC_RE = re.compile(r"^(\d{2})-(.+)\.md$")

if sys.stdout.isatty():
    RED, YEL, GRN, DIM, BOLD, RST = ("\033[31m", "\033[33m", "\033[32m",
                                     "\033[2m", "\033[1m", "\033[0m")
else:
    RED = YEL = GRN = DIM = BOLD = RST = ""

problems = defaultdict(list)          # file -> [(level, message)]


def err(f, msg):
    problems[f].append(("ERROR", msg))


def warn(f, msg):
    problems[f].append(("WARN", msg))


# ------------------------------------------------------------------ locate --
def find_specs_dir(argv):
    if len(argv) > 1:
        return os.path.abspath(argv[1])
    if os.path.isdir("specs"):
        return os.path.abspath("specs")
    for entry in sorted(os.listdir(".")):
        cand = os.path.join(entry, "specs")
        if os.path.isdir(cand):
            return os.path.abspath(cand)
    if os.path.isfile("PROGRESS.md"):
        return os.path.abspath(".")
    return None


# ------------------------------------------------------------------- parse --
def header_keys(head):
    """Every **Key:** value line in the header block."""
    out = {}
    for line in head.splitlines():
        m = re.match(r"^\*\*([^:*]+):\*\*\s*(.*)$", line.strip())
        if m:
            out[m.group(1).strip().lower()] = m.group(2).strip()
    return out


def split_sections(text):
    """Ordered [(title, body)] for every top-level ## heading, plus the header."""
    parts = re.split(r"^##\s+(.+?)\s*$", text, flags=re.M)
    head = parts[0]
    sections = []
    for i in range(1, len(parts), 2):
        sections.append((parts[i].strip(), parts[i + 1]))
    return head, sections


def csv_paths(value):
    """Split an Owns/Reuses value into cleaned entries."""
    if not value or value.strip() in {"—", "-", "none", "None", "n/a"}:
        return []
    out = []
    for raw in value.split(","):
        item = raw.strip().strip("`").strip()
        item = re.sub(r"\s*\((?:spec|Spec)\s*\d+\)\s*$", "", item).strip()
        item = re.sub(r"\s*\((?:new|existing)\)\s*$", "", item).strip()
        if item:
            out.append(item)
    return out


def dep_numbers(value):
    """'Spec 01, Spec 02' | '00-06' | '—'  ->  [1, 2] | [0..6] | []"""
    if not value or value.strip() in {"—", "-", "none", "None", "nothing"}:
        return []
    nums = set()
    for m in re.finditer(r"(\d{1,2})\s*-\s*(\d{1,2})", value):
        lo, hi = int(m.group(1)), int(m.group(2))
        if lo <= hi:
            nums.update(range(lo, hi + 1))
    stripped = re.sub(r"\d{1,2}\s*-\s*\d{1,2}", "", value)
    for m in re.finditer(r"\d{1,2}", stripped):
        nums.add(int(m.group()))
    return sorted(nums)


def bullets_of(body):
    """Bullets from a section, with wrapped continuation lines joined back on."""
    out = []
    for line in body.splitlines():
        if re.match(r"^\s*[-*]\s", line):
            out.append(line.strip())
        elif out and line.strip() and not line.startswith("#"):
            out[-1] += " " + line.strip()
    return out


def heading_anchors(text):
    """GitHub-style slugs for every heading in a markdown file."""
    slugs = set()
    for h in re.findall(r"^#{1,6}\s+(.+?)\s*$", text, re.M):
        h = h.strip().strip("`")
        slug = re.sub(r"[^a-z0-9]+", "-", h.lower()).strip("-")
        if slug:
            slugs.add(slug)
    return slugs


def is_ui_path(p):
    return p.endswith(UI_EXT) or bool(UI_DIR.search(os.path.dirname(p)))


# -------------------------------------------------------------------- main --
def main():
    specs_dir = find_specs_dir(sys.argv)
    if not specs_dir or not os.path.isdir(specs_dir):
        print(f"{RED}No spec set found.{RST} Pass a directory, or run from a "
              f"project with a specs/ folder.")
        return 2
    root = os.path.dirname(specs_dir.rstrip("/")) or "."

    files = sorted(f for f in os.listdir(specs_dir) if SPEC_RE.match(f))
    if not files:
        print(f"{RED}No NN-*.md spec files in {specs_dir}.{RST}")
        return 2

    print(f"{BOLD}Validating{RST} {specs_dir}  {DIM}({len(files)} specs){RST}\n")

    # steering docs present
    for doc in STEERING:
        if not os.path.isfile(os.path.join(specs_dir, doc)):
            err(doc, "steering doc is missing")
    design = os.path.join(specs_dir, "DESIGN-SYSTEM.md")
    if not os.path.isfile(design):
        warn("DESIGN-SYSTEM.md",
             "missing — fine only if this project has no user interface; "
             "say so in README.md rather than omitting it silently")

    specs = {}          # num -> dict
    for fn in files:
        num = int(SPEC_RE.match(fn).group(1))
        path = os.path.join(specs_dir, fn)
        text = open(path, encoding="utf-8").read()
        head, sections = split_sections(text)
        keys = header_keys(head)
        if num in specs:
            err(fn, f"duplicate spec number {num:02d} "
                    f"(already used by {specs[num]['file']})")
            continue
        specs[num] = {
            "file": fn, "path": path, "text": text, "head": head,
            "sections": sections, "keys": keys,
            "titles": [t for t, _ in sections],
            "lines": text.count("\n") + 1,
        }

    owners = defaultdict(list)   # path -> [spec num]

    # ---------------------------------------------------------- per spec --
    for num, s in sorted(specs.items()):
        fn, keys, titles = s["file"], s["keys"], s["titles"]

        # header contract with spec-run
        for k in ("status", "depends on", "owns"):
            if k not in keys:
                err(fn, f"header block has no **{k.title()}:** line "
                        f"(spec-run greps for Status and Depends on)")
        status = keys.get("status", "")
        if status and status not in STATUSES:
            err(fn, f"Status {status!r} is not one of: {' · '.join(sorted(STATUSES))}")

        # sections
        for want in REQUIRED_SECTIONS:
            if not any(t.lower().startswith(want.lower()) for t in titles):
                err(fn, f"missing required section '## {want}'")
        if "Log" in titles:
            if titles[-1] != "Log":
                err(fn, "'## Log' is not the last section (spec-run checks this)")
            body = dict(s["sections"]).get("Log", "")
            if not re.search(r"\*\*\d{4}-\d{2}-\d{2}\*\*", body) and status != "Not started":
                warn(fn, "Log has no dated entry")
        elif status in {"In progress", "Blocked", "Done"}:
            err(fn, f"Status is '{status}' but there is no '## Log' section")

        # dependencies
        deps = dep_numbers(keys.get("depends on", ""))
        for d in deps:
            if d not in specs:
                err(fn, f"depends on spec {d:02d}, which does not exist")
            elif d >= num:
                err(fn, f"forward dependency: depends on spec {d:02d}, "
                        f"which is not lower-numbered")

        # ownership
        for p in csv_paths(keys.get("owns", "")):
            owners[p].append(num)

        # non-scope deferrals must name a target
        is_verification = fn.endswith("verification-pass.md")
        nonscope = next((b for t, b in s["sections"]
                         if t.lower().startswith("explicit non-scope")), "")
        bullets = bullets_of(nonscope)
        if not bullets:
            err(fn, "'Explicit non-scope' has no entries — every spec defers "
                    "something a reasonable agent would otherwise do")
        for b in bullets:
            targets = set()
            for m in re.finditer(r"(?:specs?|Specs?|→)\s*#?(\d{1,2})"
                                 r"(?:\s*[-–]\s*(\d{1,2}))?", b):
                lo = int(m.group(1))
                hi = int(m.group(2)) if m.group(2) else lo
                targets.update(range(lo, hi + 1) if lo <= hi else [lo])
            if not targets and not is_verification:
                err(fn, f"non-scope entry names no target spec: {b[:72]!r}")
            for t in sorted(targets):
                if t not in specs and not is_verification:
                    err(fn, f"non-scope entry defers to spec {t:02d}, "
                            f"which does not exist: {b[:60]!r}")

        # done-when tiering
        done = next((b for t, b in s["sections"]
                     if t.lower().startswith("done when")), "")
        checks = [b for b in bullets_of(done) if re.match(r"^[-*]\s*\[.\]", b)]
        if not checks:
            err(fn, "'Done when' has no checklist items (it must be a "
                    "checklist, not prose)")
        tiers = set()
        for c in checks:
            m = TIERS.search(c)
            if not m:
                err(fn, f"'Done when' item has no tier tag "
                        f"[static]/[runtime]/[e2e]/[requires: …]: {c[:66]!r}")
            else:
                tiers.add(m.group(1).split(":")[0].lower())
        if checks and "static" not in tiers:
            err(fn, "no [static] criterion — every spec ends with a "
                    "typecheck/lint/build gate")
        s["tiers"] = tiers
        owns_ui = [p for p in csv_paths(keys.get("owns", "")) if is_ui_path(p)]
        if owns_ui and not tiers & {"e2e", "suite"}:
            err(fn, f"owns user-facing files ({', '.join(owns_ui[:3])}) but has "
                    f"no [e2e] criterion")

        # scoped [e2e] vs whole-suite [suite]
        for c in checks:
            tier = TIERS.search(c)
            tier = tier.group(1).split(":")[0].lower() if tier else ""
            for cmd in RUNNER.findall(c):
                whole = not SCOPED.search(cmd)
                if whole and tier == "e2e":
                    err(fn, f"{cmd.strip()!r} runs the whole suite but is tagged "
                            f"[e2e] — tag it [suite] and put it on a checkpoint "
                            f"spec; a full-suite run in every spec makes "
                            f"execution quadratic")
                elif not whole and tier == "suite":
                    err(fn, f"{cmd.strip()!r} is a scoped run but is tagged "
                            f"[suite] — [suite] means the whole suite green")
        if is_verification and "suite" not in tiers:
            err(fn, "the verification pass must carry a [suite] criterion — the "
                    "whole end-to-end suite from a clean build")

        # code emission
        for lang, block in re.findall(r"```([a-zA-Z0-9+#]*)\n(.*?)```",
                                      s["text"], re.S):
            if lang.lower() in CODE_LANGS and block.count("\n") > 3:
                warn(fn, f"a {lang} code block of {block.count(chr(10))} lines — "
                         f"specs state intent, not implementation")

        # raw hex belongs in DESIGN-SYSTEM.md only
        hexes = sorted(set(HEX.findall(s["text"])))
        if hexes:
            shown = ", ".join(hexes[:5]) + ("…" if len(hexes) > 5 else "")
            warn(fn, f"{len(hexes)} raw colour value(s) ({shown}) — colours "
                     f"live in DESIGN-SYSTEM.md and are cited by token name")

        # length
        if s["lines"] > 130:
            warn(fn, f"{s['lines']} lines — over 130 usually means this should "
                     f"be two specs")
        elif s["lines"] < 15:
            warn(fn, f"only {s['lines']} lines — probably underspecified")

    # ------------------------------------------------------- cross-spec --
    for p, nums in sorted(owners.items()):
        if len(nums) > 1:
            for n in nums:
                err(specs[n]["file"],
                    f"owns {p!r}, which is also owned by spec(s) "
                    f"{', '.join(f'{o:02d}' for o in nums if o != n)}")

    for num, s in sorted(specs.items()):
        fn = s["file"]
        for r in csv_paths(s["keys"].get("reuses", "")):
            if "#" in r and r.split("#")[0].endswith(".md"):
                doc, anchor = r.split("#", 1)
                dp = os.path.join(specs_dir, doc)
                if not os.path.isfile(dp):
                    err(fn, f"Reuses {r!r}: {doc} does not exist")
                else:
                    dtext = open(dp, encoding="utf-8").read()
                    slug = re.sub(r"[^a-z0-9]+", "-", anchor.lower()).strip("-")
                    if slug and slug not in heading_anchors(dtext) \
                            and anchor.lower() not in dtext.lower():
                        err(fn, f"Reuses {r!r}: no heading matching "
                                f"'{anchor}' in {doc}")
                continue
            if r.endswith(".md"):
                continue
            on_disk = os.path.exists(os.path.join(root, r))
            owned_earlier = any(r in csv_paths(specs[o]["keys"].get("owns", ""))
                                for o in specs if o < num)
            if not on_disk and not owned_earlier:
                err(fn, f"Reuses {r!r}, which is neither on disk nor owned by "
                        f"an earlier spec — an invented reference")

    # orphan check: something created and never consumed
    for p, nums in sorted(owners.items()):
        base = os.path.basename(p)
        if re.search(r"(config|\.test\.|\.spec\.|^e2e/|migrations?/)", p):
            continue
        consumers = [n for n, s in specs.items()
                     if n not in nums and (p in s["text"] or base in s["text"])]
        if not consumers:
            warn(specs[nums[0]]["file"],
                 f"creates {p!r} but no other spec mentions it — check it is "
                 f"not an endpoint or component with zero callers")

    if not any(s["file"].endswith("verification-pass.md") for s in specs.values()):
        warn("README.md", "no NN-verification-pass.md — the final gate is "
                          "always the last spec")

    # checkpoint coverage: something must prove the slices integrated before the
    # very end, or the scoped per-spec gates have no backstop until the last spec
    mid = [n for n, s in specs.items()
           if "suite" in s.get("tiers", set())
           and not s["file"].endswith("verification-pass.md")]
    if len(specs) > 6 and not mid:
        warn("README.md",
             f"{len(specs)} specs and no [suite] criterion before the "
             f"verification pass — mark the last spec of each vertical slice as "
             f"a checkpoint, or a regression stays invisible until the end")

    # ---------------------------------------------------------- tracker --
    tracker = os.path.join(specs_dir, "PROGRESS.md")
    if os.path.isfile(tracker):
        ttext = open(tracker, encoding="utf-8").read()
        rows = {}
        for line in ttext.splitlines():
            if not line.strip().startswith("|"):
                continue
            cells = [c.strip() for c in line.strip().strip("|").split("|")]
            if len(cells) >= 3 and re.fullmatch(r"\d{1,2}", cells[0]):
                rows[int(cells[0])] = cells[2]
        for num, s in sorted(specs.items()):
            if num not in rows:
                err("PROGRESS.md", f"no row for spec {num:02d} ({s['file']})")
            elif rows[num] != s["keys"].get("status", ""):
                err("PROGRESS.md",
                    f"spec {num:02d}: tracker says {rows[num]!r}, the spec file "
                    f"says {s['keys'].get('status', '')!r}")
        for num in sorted(rows):
            if num not in specs:
                err("PROGRESS.md", f"row for spec {num:02d}, which has no file")
        if "## Log" not in ttext:
            warn("PROGRESS.md", "no '## Log' section — the tracker's dated log "
                                "is the catch-up view")

    # ----------------------------------------------------------- report --
    n_err = n_warn = 0
    for fn in sorted(problems):
        print(f"{BOLD}{fn}{RST}")
        for level, msg in problems[fn]:
            if level == "ERROR":
                n_err += 1
                print(f"  {RED}ERROR{RST}  {msg}")
            else:
                n_warn += 1
                print(f"  {YEL}WARN {RST}  {msg}")
        print()

    if n_err == 0 and n_warn == 0:
        print(f"{GRN}Clean.{RST} {len(specs)} specs, no findings.")
    else:
        print(f"{len(specs)} specs · {RED}{n_err} error(s){RST} · "
              f"{YEL}{n_warn} warning(s){RST}")
        if n_err == 0:
            print(f"{DIM}Warnings are not blocking — justify each one in "
                  f"README.md under 'Known gaps', or fix it.{RST}")
    return 1 if n_err else 0


if __name__ == "__main__":
    sys.exit(main())
