# AGENTS.md: Root Guidelines for AI Coding Agents

This document defines the operational contracts and discovery protocols for AI coding agents (Antigravity, OpenAI/Codex, Cursor, Windsurf, and Claude Code) working within this repository.

---

## 1. Agent Discovery & Customization Hierarchy

Antigravity and compliant agent harnesses discover capabilities in this repository via the following paths:

* **Continuous Rules**: `.agents/rules/*.md`
  * [`.agents/rules/epistemic-gate.md`](.agents/rules/epistemic-gate.md): Always-on epistemic rule enforcing pre-flight premise validation on architectural proposals.
* **Lifecycle Hook Architecture**: [`references/hooks-setup-guide.md`](references/hooks-setup-guide.md): Abstract non-Git agent hook architecture and operational contract.
* **On-Demand Skills**:
  * [`skills/logic/grill-logic/SKILL.md`](skills/logic/grill-logic/SKILL.md): User-facing entry point (~40 lines).
  * [`skills/logic/epistemic-verifier/SKILL.md`](skills/logic/epistemic-verifier/SKILL.md): Core truth engine (multi-round epistemic verification).
  * [`skills/setup/setup-grill-logic/SKILL.md`](skills/setup/setup-grill-logic/SKILL.md): Automated repository configuration skill.
  * [`skills/setup/clear-ledger/SKILL.md`](skills/setup/clear-ledger/SKILL.md): Automated ledger reset and archiving skill.
* **Harness Metadata**: `skills/<category>/<name>/agents/openai.yaml`
  * Declares interface display names, descriptions, and invocation policy for Codex / Antigravity runners.

---

## 2. Core Epistemic Protocol for Agents (v2)

When operating as an AI agent in this environment, adhere to the truth-maintenance standards defined in the [Architecture Whitepaper](references/grill-logic-whitepaper.md) and [Engineering Requirements Document](references/build-requirements.md):

### A. Epistemic Foundations: $W$, $S$, and Decoupled Credibility
* **Autonomy Weight ($W$)**: An ordinal ranking of evidence-independence and dependence-clarity.
  * $W_{\text{human}}$ is high: human holds sovereign decision stakes and final say.
  * $W_{\text{subagent}} > W_{\text{LLM}}$: freshly spawned subagents operate with virgin context and a single loss function (*challenge correctness*).
* **Decoupled Invariant**: Challenger-credibility $\neq$ target-deference. The subagent's challenge carries maximum weight against the LLM ($S_{\text{LLM}}$ lands at full strength), but the LLM counters the subagent at full strength without reflexive deference.
* **Skepticism Signal ($S$)**: Scales inversely with target $W$. $S_{\text{LLM}}$ applies at full strength against the main model; $S_{\text{human}}$ is dampened and surfaced as an auditable behavioral diagnostic, never overriding the human.
* **DMAD Cognitive Diversity (ICLR 2025)**: Adversarial subagents reject cosmetic personas (which trigger the Einstellung effect / fixed mental sets) in favor of distinct problem-solving strategies (backward refutation, empirical probing, premise inversion).

### B. The 90/10 Invariant (Hard Gating)
Allocate ~90% of effort to challenging premises, and at most ~10% to offering solutions.
* **Zero Solutions During Challenge Turns**: Never offer code snippets, architecture designs, or implementation recommendations while challenging premises.
* **Post-Concordance Triad**: Solutions are emitted *only on the turn after concordance/convergence*. Present exactly 3 solutions (Minimal/Stdlib, Robust/Standard, Advanced/Scale) plus a free-response option.

### C. Pre-Flight Epistemic Check
Before generating an implementation plan or writing code for an architectural proposal:
1. **Inspect `LOGICAL_LEDGER.md`**: Check if the proposal relies on a premise previously marked **`REJECTED`**. If an active Contrastive Refutation Rule exists, halt immediately, cite the rule, and pivot to the supported alternative.
2. **Deconstruct into Premises & Constraints**:
   - Stated Constraints ($P_1, P_2, \dots$)
   - Hidden Assumptions ($P_{\text{hidden}}$)
   - Proposed Architecture ($C$)
3. **Execute Mode-Specific State Machine**:
   - **Mode A (User Grill-Logic)**: If collaborating with human, challenge premises, track behavioral $S_{\text{human}}$, and converge on concordance before offering the Solution Triad via `ask_question`.
   - **Mode B (Self-Grill)**: If running autonomously, spawn virgin subagent (`invoke_subagent`), compute $S_{\text{LLM}}$ via CoT inspection, and obtain subagent sign-off before code generation.
4. **Update the Registry**: Record the argument outcome in `LOGICAL_LEDGER.md`. Proceed to implementation **only** if status is `SUPPORTED`.

---

## 3. Natural Language Invocation & Communication Protocol

* **No Synthetic Flags**: Do not output or expect CLI flags like `--rounds` or `--actor`.
* **No Academic Logic Jargon**: Do not emit mathematical turnstiles (`⊢`), propositional calculus symbols, or formal epistemic labels in conversational prose. Use clear software engineering terminology.
* **Mode Routing**:
  * If the prompt mentions `"self-grill"`, `"autonomously"`, or `"afk"`, route to **Mode B (Self-Grill)**.
  * If the prompt mentions `"interview me"`, `"ask me"`, or `"grill me"`, route to **Mode A (User Grill-Logic)**.
  * If the prompt mentions `"sandbox"`, `"verify docs"`, or `"probe"`, prioritize empirical tool verification.

---

## 4. Architectural Cross References

* Architecture Whitepaper: [`references/grill-logic-whitepaper.md`](references/grill-logic-whitepaper.md)
* Engineering Requirements Document: [`references/build-requirements.md`](references/build-requirements.md)
* Formal Specification: [`internal/revisions/Grill-Logic-Final-Spec.md`](internal/revisions/Grill-Logic-Final-Spec.md)
* Protocol Flows: [`internal/revisions/Grill-Logic-Proposal-v2.md`](internal/revisions/Grill-Logic-Proposal-v2.md)
* Claude Code Setup: [`CLAUDE.md`](CLAUDE.md)
* Logical Ledger Spec: [`references/logical-ledger-spec.md`](references/logical-ledger-spec.md)
