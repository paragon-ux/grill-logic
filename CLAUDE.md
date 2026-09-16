# Grill-Logic for Claude Code

This repository contains the **Grill-Logic** skill, rule, and hook suite for Claude Code and agentic environments.

---

## Repository Structure

* `skills/logic/grill-logic/SKILL.md`: User-facing entry point (~40 lines).
* `skills/logic/epistemic-verifier/SKILL.md`: Core truth engine (multi-round epistemic verification).
* `skills/setup/setup-grill-logic/SKILL.md`: Prompt-driven setup skill.
* `skills/setup/clear-ledger/SKILL.md`: Automated ledger reset and archiving skill (`/clear-ledger`).
* `references/logical-ledger-spec.md`: Format specification and status lifecycles for `LOGICAL_LEDGER.md`.
* `references/examples.md`: Concrete case studies demonstrating inferential stress-testing.
* `.agents/rules/epistemic-gate.md`: Always-on rule for continuous premise validation in multi-turn sessions.
* `references/hooks-setup-guide.md`: Harness-agnostic agent lifecycle hook architecture guide.
* `LOGICAL_LEDGER.md`: Active project decision registry.

---

## 3-Step Setup

1. **Install Skills**: `git clone https://github.com/paragon-ux/grill-logic ~/.claude/skills/grill-logic` (or `npx skills add github:paragon-ux/grill-logic`)
2. **Run Setup**: Type `/setup-grill-logic` inside Claude Code to scaffold ledger and continuous rules.
3. **Bam**: Ready to roll.

---

## Invocation in Claude Code

### Slash Command Usage
Invoke directly via slash command without quotation marks:
```bash
/grill-logic migrate session tokens to redis cluster
```

### Natural Language Mode Signaling (No CLI Flags)
Do not use synthetic CLI flags (`--flags`). The skill parses mode and depth directly from natural phrasing:

* **Autonomous Self-Grill (AFK)**:
  ```bash
  /grill-logic self-grill: refactor query pipeline to use raw sockets
  ```
  The agent switches into an internal adversarial CoT and executes tool probes without interrupting the user.
* **Interactive Human Interview (HITL)**:
  ```bash
  /grill-logic interview me on adopting GraphQL for our mobile backend
  ```
  The agent presents structured multiple-choice questions for the user to adjudicate key trade-offs.
* **Deterministic Sandbox Probe**:
  ```bash
  /grill-logic check in sandbox if jemalloc builds with MSVC
  ```
  The agent runs empirical compiler/tool checks.
* **Recursive Multi-Round Depth**:
  ```bash
  /grill-logic deep dive 2 rounds: decompose monolith into 6 microservices
  ```

---

## Multi-Round vs. Multi-Turn Operation

* **Multi-Turn (Conversational Session)**: In multi-turn conversations, you do not need to repeatedly type `/grill-logic`. The repository includes `.agents/rules/epistemic-gate.md`, an always-on rule that automatically activates whenever an architectural, infrastructure, or dependency change is proposed. It forces pre-flight premise validation and checks `LOGICAL_LEDGER.md` for active negative constraints before generating procedural plans or writing code.
* **Multi-Round (Intra-Audit Iterative Challenge)**: Rounds refer to iterative adversarial challenge cycles within a single audit. Executed via the Dual State Machine:
  - **Mode A: User Grill-Logic**: Collaborative debate with the human targeting mutual concordance ($W_{\text{human}}$ is high, $S_{\text{human}}$ is dampened).
  - **Mode B: Self-Grill**: Ephemeral subagent audit grounded in Diverse Multi-Agent Debate (DMAD, ICLR 2025) targeting logical certainty ($W_{\text{subagent}} > W_{\text{LLM}}$, $S_{\text{LLM}}$ at full strength).

---

## Core Epistemic Invariants (v2)

When working in this codebase or extending Grill-Logic:
1. **The 90/10 Invariant (Hard Gating)**: Allocate ~90% to challenging premises, and at most ~10% to offering solutions. Never emit code snippets or architecture solutions during challenge turns. Emit the Solution Triad (Minimal, Robust, Advanced + Free Response) only on the turn after concordance.
2. **Decoupled Challenger-Credibility $\neq$ Target-Deference**: Freshly spawned subagents challenge with full authority ($S_{\text{LLM}}$ hits full strength), but the proposer counters at full strength without reflexive deference.
3. **No Academic Jargon**: Do not emit mathematical turnstiles (`⊢`), propositional calculus syntax, or formal logic jargon in user-facing dialogue. Use plain software engineering terms.
4. **Negative Constraints (CCoT)**: When an argument is rejected, formulate an explicit contrastive refutation rule to prevent the model from regressing back into the invalid approach in subsequent turns.
5. **Architectural Specifications**: Reference [`references/grill-logic-whitepaper.md`](references/grill-logic-whitepaper.md) and [`references/build-requirements.md`](references/build-requirements.md) for canonical specifications.
