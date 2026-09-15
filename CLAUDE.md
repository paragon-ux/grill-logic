# Grill-Logic for Claude Code

This repository contains the **Grill-Logic** skill, rule, and hook suite for Claude Code and agentic environments.

---

## Repository Structure

* `skills/logic/grill-logic/SKILL.md`: User-facing entry point (~40 lines).
* `skills/logic/epistemic-verifier/SKILL.md`: Core truth engine (multi-round epistemic verification).
* `skills/setup/setup-grill-logic/SKILL.md`: Prompt-driven setup skill.
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

* **Multi-Turn (Conversational Session)**: In multi-turn conversations, you do not need to repeatedly type `/grill-logic`. The repository includes `.agents/rules/epistemic-gate.md`, an always-on rule that automatically activates whenever an architectural, infrastructure, or dependency change is proposed. It forces pre-flight Standard Form ($P \vdash C$) validation and checks `LOGICAL_LEDGER.md` for active negative constraints before generating procedural plans or writing code.
* **Multi-Round (Intra-Audit Iterative Challenge)**: Rounds refer to iterative adversarial challenge cycles within a single audit. Round 1 challenges the primary inferential bridge; Round 2 stress-tests the counter-hypothesis or alternative; Round $k$ converges on the verified frontier.

---

## Core Epistemic Invariants

When working in this codebase or extending Grill-Logic:
1. **Standard Logical Form ($P \vdash C$)**: Always isolate the inferential bridge ($\vdash$) rather than compiling natural language into Boolean literals (CNF/DNF).
2. **Epistemic vs. Procedural Separation**: Grill-Logic only determines whether an underlying premise or conclusion is logically sound and factually true. It delegates procedural execution to GSD, Spec-Driven Development, or direct coding.
3. **Negative Constraints (CCoT)**: When an argument is rejected, formulate an explicit contrastive refutation rule to prevent the model from regressing back into the invalid approach in subsequent turns.
