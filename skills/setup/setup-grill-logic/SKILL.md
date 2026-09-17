---
name: setup-grill-logic
description: "Configure this repo for Grill-Logic: initialize LOGICAL_LEDGER.md, set up continuous epistemic gate rules, and wire agent configuration. Run once before first use."
disable-model-invocation: true
---

# Setup Grill-Logic

Scaffold the epistemic verification configuration for this repository:

- **Truth Ledger**: Initializes `LOGICAL_LEDGER.md` for persistent premise verification and contrastive negative constraints (CCoT).
- **Epistemic Gate**: Installs continuous premise verification (`.agents/rules/epistemic-gate.md`).
- **Harness Documentation**: Registers Grill-Logic protocols in `CLAUDE.md` and/or `AGENTS.md`.
- **Agent Lifecycle Hooks**: Links to `references/hooks-setup-guide.md` for wiring dynamic prompt/invocation hooks in custom harnesses.

This is a prompt-driven skill, not a rigid script. Explore the current repo state, present your findings, confirm with the user, then write.

## Process

### 1. Explore

Inspect the repo to understand its current setup:

- `AGENTS.md` and `CLAUDE.md` at the repo root: Does either exist? Is an `## Epistemic Gate` or `Grill-Logic` section already present?
- `LOGICAL_LEDGER.md`: Does a project epistemic ledger already exist?
- `.agents/rules/epistemic-gate.md`: Is the continuous rule already in place?

### 2. Present Findings and Ask

Summarize what exists and what is missing. Then walk through the sections in order. Lead each with the recommended choice so the user can accept in one word.

**Section A: Logical Ledger Location.**
> Explainer: `LOGICAL_LEDGER.md` stores all audited architectural decisions, validated premises, and active contrastive refutation rules. It prevents the agent from repeating refuted designs in subsequent turns.
> Default: `LOGICAL_LEDGER.md` at repo root (recommended: **keep default**).

**Section B: Continuous Epistemic Gate.**
> Explainer: The epistemic gate monitors conversation turns for proposals introducing infrastructure, databases, or major refactors, running pre-flight premise verification automatically without requiring `/grill-me` or `/grill-logic` each time.
> Default: Install `.agents/rules/epistemic-gate.md` (recommended: **yes**). (For dynamic non-Git agent interceptor hooks, see `references/hooks-setup-guide.md`).

**Section C: Multi-Harness Documentation.**
> Explainer: Adds protocol discovery and instructions to your agent configuration files (`CLAUDE.md` for Claude Code, `AGENTS.md` for Antigravity, Cursor, and Codex).
> Default: Update the file(s) already present (recommended: **yes**).

### 3. Confirm and Write

Show the user what will be created or updated:

1. **`LOGICAL_LEDGER.md`**: Create if missing, using the template in [ledger-template.md](./ledger-template.md).
2. **`.agents/rules/epistemic-gate.md`**: Write the continuous rule using [epistemic-gate-template.md](./epistemic-gate-template.md).
3. **`CLAUDE.md` / `AGENTS.md`**:
   Add or update the Epistemic Gate section:

```markdown
## Epistemic Gate (Grill-Logic)

Before generating implementation plans or code changes for architectural proposals (new infrastructure, database changes, boundary refactors):
1. Pre-flight check against `LOGICAL_LEDGER.md` (fail-closed negative constraint firewall): `node scripts/grill-state.mjs check-gate --proposal "<proposal>"`.
2. Formulate explicit premises and conclusion via Interpretation Gate: `/add-logic [proposal]`.
3. Stress-test inferential bridges via autonomous audit (`/self-grill [proposal]`) or interactive interview (`/grill-logic [topic]`).
4. Gate downstream code generation: proceed only when status is `SUPPORTED` or `ACCEPTED_SOLUTION`.
```

### 4. Done

Inform the user that Grill-Logic is active.
Remind them:
- Natural language mode cues work out of the box (e.g., `self-grill: ...`, `interview me on ...`, `probe ...`).
- Continuous gating will automatically trigger when proposing architectural changes.
- Manual invocation is always available via `/add-logic [proposal]`, `/self-grill [proposal]`, or `/grill-logic [topic]`.
