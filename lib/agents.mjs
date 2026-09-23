// Per-agent adapter definitions.
//
// The real content (~94KB) is installed once into a neutral payload directory.
// Each agent gets a short adapter that points into it. This is not a stylistic
// choice: Windsurf caps a workspace rule file at 12,000 characters and SKILL.md
// alone is over that, and Cursor bills every always-applied token on every
// request. One payload, thin adapters, nothing duplicated.

export const DESCRIPTION =
  "Plan a project or feature as a set of very small, dependency-ordered spec " +
  "files plus steering docs and a progress tracker. Use when starting a new " +
  "project, adding a feature to an existing codebase, or when asked to plan, " +
  "spec out, break down, or scope work before implementing.";

/** The shared adapter body. `p` is the payload dir, relative to the repo root. */
export function body(p) {
  return `# plan-project — plan work as small, dependency-ordered specs

Use this when asked to **plan, spec out, break down, or scope** work before
implementing: a new project, a feature added to an existing codebase, or a
refactor too big for one sitting. Not for a one-file fix or a bug — say so and
just do the work.

**Read \`${p}/SKILL.md\` in full before producing anything.** That file is the
procedure; what follows is only enough to know why you must open it.

## The shape of the output

\`\`\`
<project>/specs/
  README.md            index — every spec, dependency order, gate per spec
  PROGRESS.md          tracker — status table + append-only dated log
  AGENT-GUIDE.md       how an implementing agent works in this repo
  ARCHITECTURE.md      folders, layers, data model, numbered invariants
  DESIGN-SYSTEM.md     the closed token list (skip only if there is no UI)
  INVENTORY.md         reuse registry — what exists, so nothing is rebuilt
  00-<decision>.md     a blocking decision, not a coding task
  01-<slug>.md         …one small unit each
  NN-verification-pass.md   the final gate
\`\`\`

## The rules that carry the weight

1. **Ground every claim.** A path, a package, a library export, a prior state —
   check it against the real tree before writing it into a spec. Every defect
   class here is an unchecked factual claim, not a prose problem.
2. **One boundary per spec**, 40–130 lines. A feature is several specs: data →
   API → UI shell → interactions → polish. If the Goal needs "and also", split.
3. **Number by dependency.** A spec may only depend on lower numbers.
4. **\`Explicit non-scope\` is mandatory** and every entry names its target spec.
   A deferral with no target excludes work nobody will ever do.
5. **\`Done when\` is binary and tiered** — \`[static]\` \`[runtime]\` \`[e2e]\`
   \`[suite]\` \`[requires: …]\` — and ends with the build command. Never "the
   flow works well".
6. **Reuse before creating.** Every spec names what it reuses. A second Button
   or a second date formatter is a review failure.
7. **Surface decisions, never bury them.** A fork with real cost either way gets
   written down with a recommendation and left for a human.
8. **Specs state intent, not code.** A spec that emits implementation code is a
   defect — the implementing agent owns syntax.

## Section order in every spec

\`Goal\` · \`Scope\` · \`Explicit non-scope\` · \`Reuse first\` · \`Steps\` ·
\`Done when\` · \`Log\` — with \`**Status:**\` and \`**Depends on:**\` in the
header block above the first \`##\`, and \`Log\` always last.

## Validate before handing over

\`\`\`bash
python3 ${p}/scripts/validate-specs.py <project>/specs
\`\`\`

Fix every \`ERROR\`. Justify or fix every \`WARN\` — an accepted warning goes in
\`README.md\` under \`Known gaps\`, not into silence.

## Read as needed

| File | When |
| --- | --- |
| \`${p}/SKILL.md\` | **Always — this is the procedure** |
| \`${p}/references/spec-format.md\` | Writing any spec file |
| \`${p}/references/splitting.md\` | Deciding where the boundaries go |
| \`${p}/references/steering-docs.md\` | Writing the four steering docs |
| \`${p}/references/reuse-inventory.md\` | Building INVENTORY.md |
| \`${p}/references/e2e-playwright.md\` | The end-to-end obligation |
| \`${p}/references/stack-patterns/react-node.md\` | Stack is React / RN / Node |
| \`${p}/references/stack-patterns/unknown-stack.md\` | Any other stack |
| \`${p}/templates/\` | Copy-and-fill starting points |

**This plans. It does not implement.** Planning ends when the validator passes.
`;
}

// Marker pair for files we append to rather than own outright.
export const MARK_BEGIN = "<!-- BEGIN plan-project (npx github:mplus-s/plan-project) -->";
export const MARK_END = "<!-- END plan-project -->";
// Begin markers written by earlier versions. merge() replaces a block opened
// by any of these, so a changed install command never appends a second copy.
export const MARK_BEGINS = [
  MARK_BEGIN,
  "<!-- BEGIN plan-project (npx plan-project) -->",
];

/** A compact section for shared files (AGENTS.md, copilot-instructions.md). */
export function section(p) {
  return `## Planning a project or feature

When asked to plan, spec out, break down, or scope work before implementing —
a new project, a feature on an existing codebase, or a refactor too big for one
sitting — follow the procedure in \`${p}/SKILL.md\`. Read it in full first.

It produces \`specs/\`: four steering docs, a progress tracker, an index, and
many small dependency-ordered spec files, each sized so a fresh session with no
context can finish and verify one unit. Key rules: ground every claim against
the real tree; one boundary per spec (40–130 lines); \`Explicit non-scope\` is
mandatory and names its target spec; \`Done when\` is binary and tiered
(\`[static]\` \`[runtime]\` \`[e2e]\` \`[suite]\`); specs state intent, never code.

Validate before handing over:
\`python3 ${p}/scripts/validate-specs.py <project>/specs\`

Not for a one-file fix or a bug — say so and just do the work.`;
}

/**
 * Every supported agent.
 *   detect  — paths that mean this agent is in use in the target repo
 *   write   — [relative path, contents] the adapter is written to
 *   append  — true when we merge into a file the user may already own
 */
export const AGENTS = [
  {
    id: "claude",
    name: "Claude Code",
    tier: "native",
    detect: [".claude", "CLAUDE.md"],
    note: "full skill, progressive disclosure, invoked by the Skill tool",
    link: { from: ".claude/skills/plan-project" },
    globalDir: [".claude", "skills", "plan-project"],
  },
  {
    // Codex CLI reads SKILL.md-format skills from .agents/skills/ — the same
    // shape as a Claude Code skill, so it gets the real thing rather than a
    // pointer. Its AGENTS.md chain is capped at 32 KiB, which this avoids.
    id: "codex",
    name: "OpenAI Codex",
    tier: "native",
    detect: [".agents/skills", ".codex"],
    note: "SKILL.md skill at .agents/skills/ — full fidelity",
    link: { from: ".agents/skills/plan-project" },
    globalDir: [".codex", "skills", "plan-project"],
  },
  {
    id: "cursor",
    name: "Cursor",
    tier: "model-decides",
    detect: [".cursor", ".cursorrules"],
    note: "Apply Intelligently — Cursor pulls it in from the description",
    file: (p) => [
      ".cursor/rules/plan-project.mdc",
      `---\ndescription: ${DESCRIPTION}\nglobs:\nalwaysApply: false\n---\n\n${body(p)}`,
    ],
  },
  {
    // Workspace rules live in .agents/rules/ (.agent/rules/ is the legacy
    // fallback). Antigravity also reads a root AGENTS.md, which this installer
    // writes too — the rule file is the more targeted of the two.
    id: "antigravity",
    name: "Google Antigravity",
    tier: "model-decides",
    detect: [".agents/rules", ".agent/rules", ".antigravity", "GEMINI.md"],
    note: "workspace rule in .agents/rules/",
    file: (p) => [
      ".agents/rules/plan-project.md",
      `---\ndescription: ${DESCRIPTION}\n---\n\n${body(p)}`,
    ],
  },
  {
    id: "windsurf",
    name: "Windsurf",
    tier: "model-decides",
    detect: [".windsurf", ".windsurfrules", ".codeium", ".devin"],
    note: "trigger: model_decision (stays under the 12,000-char cap)",
    file: (p) => [
      ".windsurf/rules/plan-project.md",
      `---\ntrigger: model_decision\ndescription: ${DESCRIPTION}\n---\n\n${body(p)}`,
    ],
  },
  {
    id: "copilot",
    name: "GitHub Copilot",
    tier: "model-decides",
    detect: [".github"],
    note: "applyTo: specs/** — plus a pointer appended to copilot-instructions.md",
    file: (p) => [
      ".github/instructions/plan-project.instructions.md",
      `---\napplyTo: "specs/**,**/specs/**"\ndescription: ${DESCRIPTION}\n---\n\n${body(p)}`,
    ],
    append: (p) => [".github/copilot-instructions.md", section(p)],
  },
  {
    id: "cline",
    name: "Cline",
    tier: "model-decides",
    detect: [".clinerules"],
    note: "plain rule file",
    file: (p) => [".clinerules/plan-project.md", body(p)],
  },
  {
    id: "roo",
    name: "Roo Code",
    tier: "model-decides",
    detect: [".roo", ".roorules"],
    note: "plain rule file",
    file: (p) => [".roo/rules/plan-project.md", body(p)],
  },
  {
    id: "agents",
    name: "AGENTS.md",
    tier: "always-on",
    detect: ["AGENTS.md"],
    note: "Codex, Gemini CLI, Aider, Zed, Amp, Jules, Warp, Junie, goose, opencode…",
    append: (p) => ["AGENTS.md", section(p)],
    always: true, // offered even when no marker file exists
  },
];
