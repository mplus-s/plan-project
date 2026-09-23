#!/usr/bin/env node
// plan-project — install the planning skill into whichever coding agents a repo uses.
// No dependencies: Node builtins only, so npx is fast and there is no supply chain.

import { existsSync, readFileSync, writeFileSync, mkdirSync, rmSync, symlinkSync,
         lstatSync, cpSync } from "node:fs";
import { join, dirname, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { homedir } from "node:os";
import { AGENTS, MARK_BEGIN, MARK_BEGINS, MARK_END } from "../lib/agents.mjs";
import { multiselect } from "../lib/prompt.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const PKG = resolve(HERE, "..");
const PAYLOAD = ["SKILL.md", "references", "templates", "scripts", "assets"];

const BYLINE = "plan-project \u00b7 by M Shahzad";

const C = process.stdout.isTTY
  ? { r: "\x1b[31m", g: "\x1b[32m", y: "\x1b[33m", d: "\x1b[2m", b: "\x1b[1m", x: "\x1b[0m" }
  : { r: "", g: "", y: "", d: "", b: "", x: "" };

// ------------------------------------------------------------------- args --
const argv = process.argv.slice(2);
const has = (...f) => f.some((x) => argv.includes(x));
const val = (f, d) => {
  const i = argv.indexOf(f);
  return i !== -1 && argv[i + 1] ? argv[i + 1] : d;
};

if (has("-h", "--help")) {
  console.log(`
${C.b}plan-project${C.x} ${C.d}by M Shahzad${C.x} — install the planning skill into your coding agents

  ${C.b}npx github:mplus-s/plan-project${C.x}                 install into every agent detected here
  ${C.b}npx github:mplus-s/plan-project --all${C.x}           install into every supported agent
  ${C.b}npx github:mplus-s/plan-project --agents cursor,claude${C.x}
  ${C.b}npx github:mplus-s/plan-project --global${C.x}        install the Claude Code skill for all projects
  ${C.b}npx github:mplus-s/plan-project --list${C.x}          show what is detected, change nothing
  ${C.b}npx github:mplus-s/plan-project --dry-run${C.x}       show what would be written, change nothing

Options
  --agents <a,b>     comma-separated: ${AGENTS.map((a) => a.id).join(", ")}
  --all              every supported agent, detected or not
  --global           Claude Code skill into ~/.claude/skills (ignores other agents)
  --dir <path>       target repo (default: the current directory)
  --payload <path>   where the content lives (default: .ai/plan-project)
  --dry-run          print the plan, write nothing
  --list             print detected agents and exit
  -y, --yes          skip the picker, take what is detected
  --force            overwrite an adapter that was hand-edited
  -h, --help         this

Run with no arguments in a terminal and it shows a picker, with the agents it
detected already ticked. The content is installed once into the payload
directory; each agent gets a short adapter pointing at it. Re-running updates
in place and is safe.
`);
  process.exit(0);
}

const root = resolve(val("--dir", process.cwd()));
const payloadRel = val("--payload", join(".ai", "plan-project"));
const dry = has("--dry-run");
const force = has("--force");
const global = has("--global");

// ----------------------------------------------------------------- detect --
const detected = AGENTS.filter((a) => a.detect.some((d) => existsSync(join(root, d))));

if (has("--list")) {
  console.log(`\n${C.b}plan-project${C.x} ${C.d}by M Shahzad${C.x}\n`);
  console.log(`${C.b}Target${C.x} ${root}\n`);
  for (const a of AGENTS) {
    const hit = detected.includes(a);
    console.log(`  ${hit ? C.g + "detected" + C.x : C.d + "   --   " + C.x}  ` +
                `${a.id.padEnd(12)} ${C.d}${a.name} · ${a.tier}${C.x}`);
  }
  console.log(`\n${C.d}Install with: npx github:mplus-s/plan-project${C.x}\n`);
  process.exit(0);
}

let chosen;
if (global) {
  const want = argv.includes("--agents")
    ? val("--agents", "").split(",").map((x) => x.trim()).filter(Boolean)
    : ["claude"];
  chosen = AGENTS.filter((a) => a.globalDir && want.includes(a.id));
  if (!chosen.length) {
    console.error(`${C.r}--global supports:${C.x} ` +
      AGENTS.filter((a) => a.globalDir).map((a) => a.id).join(", "));
    process.exit(1);
  }
} else if (argv.includes("--agents")) {
  const want = val("--agents", "").split(",").map((s) => s.trim()).filter(Boolean);
  const bad = want.filter((w) => !AGENTS.some((a) => a.id === w));
  if (bad.length) {
    console.error(`${C.r}Unknown agent(s):${C.x} ${bad.join(", ")}\n` +
                  `Known: ${AGENTS.map((a) => a.id).join(", ")}`);
    process.exit(1);
  }
  chosen = AGENTS.filter((a) => want.includes(a.id));
} else if (has("--all")) {
  chosen = AGENTS;
} else {
  chosen = detected.length ? [...detected] : [];
  const agentsMd = AGENTS.find((a) => a.always);
  if (!chosen.includes(agentsMd)) chosen.push(agentsMd); // always the safe floor

  // Interactive picker, unless this is a pipe/CI or --yes was passed.
  const interactive = process.stdin.isTTY && process.stdout.isTTY &&
                      !has("-y", "--yes") && !dry;
  if (interactive) {
    console.log(`\n${C.b}plan-project${C.x} ${C.d}by M Shahzad${C.x}`);
    console.log(`${C.d}${root}${C.x}\n`);
    const picked = await multiselect(
      AGENTS.map((a) => ({
        label: a.name,
        hint: `${detected.includes(a) ? "detected · " : ""}${a.note}`,
        checked: chosen.includes(a),
      })),
      { title: "Which agents should it install into?", C });
    if (picked === null) {
      console.log(`${C.y}Cancelled.${C.x} Nothing was written.\n`);
      process.exit(130);
    }
    if (!picked.length) {
      console.log(`${C.y}No agents selected.${C.x} Nothing was written.\n`);
      process.exit(0);
    }
    chosen = picked.map((i) => AGENTS[i]);
  }
}

if (!chosen.length) {
  console.error(`${C.r}No agents selected.${C.x} Try --all, or --agents <id>.`);
  process.exit(1);
}

// ------------------------------------------------------------------ write --
const wrote = [];
const skipped = [];

function put(rel, contents) {
  const abs = join(root, rel);
  if (existsSync(abs) && !force) {
    const cur = readFileSync(abs, "utf8");
    if (cur === contents) { skipped.push([rel, "already current"]); return; }
    if (!cur.includes("plan-project")) {
      skipped.push([rel, "exists and is not ours — use --force"]);
      return;
    }
  }
  if (!dry) {
    mkdirSync(dirname(abs), { recursive: true });
    writeFileSync(abs, contents);
  }
  wrote.push(rel);
}

function merge(rel, sectionText) {
  const abs = join(root, rel);
  const block = `${MARK_BEGIN}\n\n${sectionText}\n\n${MARK_END}`;
  let next;
  if (existsSync(abs)) {
    const cur = readFileSync(abs, "utf8");
    const found = MARK_BEGINS.find((m) => cur.includes(m));
    if (found && cur.includes(MARK_END)) {
      const re = new RegExp(
        `${found.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}[\\s\\S]*?` +
        `${MARK_END.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`);
      next = cur.replace(re, block);
      if (next === cur) { skipped.push([rel, "already current"]); return; }
    } else {
      next = cur.trimEnd() + "\n\n" + block + "\n";
    }
  } else {
    next = `# Agent instructions\n\n${block}\n`;
  }
  if (!dry) {
    mkdirSync(dirname(abs), { recursive: true });
    writeFileSync(abs, next);
  }
  wrote.push(`${rel} ${C.d}(merged)${C.x}`);
}

// Refuse to write through something we did not create. A symlink here is the
// dangerous case: copying "into" it writes into whatever it points at, which is
// usually a repo the user is the author of.
function claimable(destAbs) {
  const st = lstatSync(destAbs, { throwIfNoEntry: false });
  if (!st) return { ok: true };
  if (st.isSymbolicLink()) {
    return { ok: false, why: `${destAbs} is a symlink — writing there would ` +
                             `modify its target. Remove it first, or --force.` };
  }
  if (st.isDirectory() && !existsSync(join(destAbs, "SKILL.md"))) {
    return { ok: false, why: `${destAbs} exists and is not a plan-project ` +
                             `install. Remove it first, or --force.` };
  }
  return { ok: true };
}

function copyPayload(destAbs) {
  if (dry) return true;
  const can = claimable(destAbs);
  if (!can.ok && !force) {
    console.error(`  ${C.r}✗${C.x} ${can.why}`);
    return false;
  }
  mkdirSync(destAbs, { recursive: true });
  for (const item of PAYLOAD) {
    cpSync(join(PKG, item), join(destAbs, item), { recursive: true });
  }
  return true;
}

console.log(`${C.b}plan-project${C.x} ${C.d}by M Shahzad${C.x} → ${root}${dry ? C.y + "  (dry run)" + C.x : ""}\n`);

// --global: the skill goes straight into ~/.claude/skills, no payload dir.
if (global) {
  let bad = 0;
  for (const a of chosen) {
    const dest = join(homedir(), ...a.globalDir);
    if (!copyPayload(dest)) { bad = 1; continue; }
    console.log(`  ${C.g}✓${C.x} ${a.name} ${C.d}(all projects)${C.x}  ${dest}`);
  }
  console.log(`\n${C.d}Invoke it in any session with /plan-project.${C.x}\n`);
  process.exit(bad);
}

// Everyone else: one payload, thin adapters.
if (!copyPayload(join(root, payloadRel))) process.exit(1);
console.log(`  ${C.g}✓${C.x} content  ${payloadRel}/  ${C.d}(SKILL.md, references, templates, scripts, assets)${C.x}`);

for (const a of chosen) {
  if (a.link) {
    // Claude Code reads references relative to SKILL.md, so it needs the real
    // tree. A relative symlink keeps one copy; Windows without developer mode
    // cannot make one, so fall back to a copy.
    const abs = join(root, a.link.from);
    let how = "symlink";
    if (!dry) {
      mkdirSync(dirname(abs), { recursive: true });
      const st = lstatSync(abs, { throwIfNoEntry: false });
      if (st && !st.isSymbolicLink() && !existsSync(join(abs, "SKILL.md")) && !force) {
        skipped.push([a.link.from, "exists and is not ours — use --force"]);
        continue;
      }
      try {
        if (st) rmSync(abs, { recursive: true, force: true });
        symlinkSync(relative(dirname(abs), join(root, payloadRel)), abs, "junction");
      } catch {
        copyPayload(abs);
        how = "copy";
      }
    }
    wrote.push(`${a.link.from} ${C.d}(${how})${C.x}`);
    continue;
  }
  if (a.file) { const [rel, text] = a.file(payloadRel); put(rel, text); }
  if (a.append) { const [rel, text] = a.append(payloadRel); merge(rel, text); }
}

for (const w of wrote.slice(0)) console.log(`  ${C.g}✓${C.x} ${w}`);
for (const [rel, why] of skipped) console.log(`  ${C.y}·${C.x} ${rel} ${C.d}— ${why}${C.x}`);

const tiers = [...new Set(chosen.map((a) => a.tier))];
console.log(`\n${C.d}Installed for: ${chosen.map((a) => a.name).join(", ")}${C.x}`);
if (tiers.includes("model-decides") || tiers.includes("always-on")) {
  console.log(`${C.d}Only Claude Code invokes this as a real skill. Elsewhere it is a` +
              ` rule the agent\n  reads when it judges it relevant — ask for it by name if it does not.${C.x}`);
}
console.log(`\n${C.d}Add ${payloadRel}/ to git so your team gets it too.${C.x}\n`);
