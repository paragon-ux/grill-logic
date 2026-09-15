# AGENTS.md: Root Guidelines for AI Coding Agents

This document defines the operational contracts and discovery protocols for AI coding agents (Antigravity, OpenAI/Codex, Cursor, Windsurf, and Claude Code) working within this repository.

---

## 1. Agent Discovery & Customization Hierarchy

Antigravity and compliant agent harnesses discover capabilities in this repository via the following paths:

* **Continuous Rules**: `.agents/rules/*.md`
  * [`.agents/rules/epistemic-gate.md`](file:///c:/Users/USER/Desktop/Frameworks/grill-logic/.agents/rules/epistemic-gate.md): Always-on epistemic rule enforcing pre-flight premise validation on architectural proposals.
* **Lifecycle Hook Architecture**: [`references/hooks-setup-guide.md`](file:///c:/Users/USER/Desktop/Frameworks/grill-logic/references/hooks-setup-guide.md): Abstract non-Git agent hook architecture and operational contract.
* **On-Demand Skills**:
  * [`skills/logic/grill-logic/SKILL.md`](file:///c:/Users/USER/Desktop/Frameworks/grill-logic/skills/logic/grill-logic/SKILL.md): User-facing entry point (~40 lines).
  * [`skills/logic/epistemic-verifier/SKILL.md`](file:///c:/Users/USER/Desktop/Frameworks/grill-logic/skills/logic/epistemic-verifier/SKILL.md): Core truth engine (multi-round epistemic verification).
  * [`skills/setup/setup-grill-logic/SKILL.md`](file:///c:/Users/USER/Desktop/Frameworks/grill-logic/skills/setup/setup-grill-logic/SKILL.md): Automated repository configuration skill.
* **Harness Metadata**: `skills/<category>/<name>/agents/openai.yaml`
  * Declares interface display names, descriptions, and invocation policy for Codex / Antigravity runners.

---

## 2. Core Epistemic Protocol for Agents

When operating as an AI agent in this environment, adhere to the following truth-maintenance standards:

### A. Epistemic Lifecycle Separation
* **Multi-Turn (Session Lifecycle)**: The ongoing conversation across multiple prompts and tasks. Guarded continuously by `LOGICAL_LEDGER.md` and `.agents/rules/epistemic-gate.md`. Rejected premises and their active **Contrastive Refutation Rules** persist across turns to prevent semantic drift and design regression.
* **Multi-Round (Intra-Audit Recursive Grilling)**: Iterative adversarial challenge rounds executed **within a single verification audit**:
  * *Round 1*: Attack the primary bridge ($P \vdash C$).
  * *Round 2*: Stress-test the challenger's counter-hypothesis ($P_{C'} \vdash C'$).
  * *Round $k$*: Iterate until epistemic convergence.

### B. Pre-Flight Epistemic Check
Before generating an implementation plan or writing code for an architectural proposal:
1. **Inspect `LOGICAL_LEDGER.md`**: Check if the proposal relies on a premise previously marked **`REJECTED`**. If an active Contrastive Refutation Rule exists, halt immediately, cite the rule, and pivot to the supported alternative.
2. **Deconstruct into Standard Logical Form**:
   * Explicit Premises ($P_1, P_2, \dots$)
   * Hidden Assumptions ($P_{\text{hidden}}$)
   * Candidate Action / Conclusion ($C$)
   * Isolate the turnstile: $\{P_1..P_n, P_{\text{hidden}}\} \vdash C$
3. **Actor-Agnostic Challenge (Multi-Round)**:
   * Test the inferential bridge: Does $P$ necessitate $C$, or does a simpler $C'$ resolve $P$ without operational bloat?
   * If an assumption is empirical, execute a rapid 1-to-5-line probe or documentation lookup.
   * If an assumption hinges on business intent or domain trade-offs, present a structured multiple-choice question to the user.
4. **Update the Registry**: Record the argument outcome in `LOGICAL_LEDGER.md`. Proceed to implementation **only** if status is `SUPPORTED`.

---

## 3. Natural Language Invocation Protocol

* **No Synthetic Flags**: Do not output or expect CLI flags like `--rounds` or `--actor`.
* **No Surrounding Quotations**: Prompts are unquoted natural language.
* **Mode Parsing**:
  * If the prompt mentions `"self-grill"`, `"autonomously"`, or `"afk"`, conduct the adversarial challenge internally using extended thinking and tool probes without pausing for human input.
  * If the prompt mentions `"interview me"`, `"ask me"`, or `"grill me"`, present structured multiple-choice questions to the user.
  * If the prompt mentions `"sandbox"`, `"verify docs"`, or `"probe"`, prioritize empirical tool verification.

---

## 4. Multi-Harness Cross References

* For Claude Code specific setup, see [`CLAUDE.md`](file:///c:/Users/USER/Desktop/Frameworks/grill-logic/CLAUDE.md).
* For reference case studies and problem archetypes, see [`references/examples.md`](file:///c:/Users/USER/Desktop/Frameworks/grill-logic/references/examples.md).
* For Logical Ledger formatting standards, see [`references/logical-ledger-spec.md`](file:///c:/Users/USER/Desktop/Frameworks/grill-logic/references/logical-ledger-spec.md).
