# AGENTS.md: Root Guidelines for AI Coding Agents

This document defines the operational contracts and discovery protocols for AI coding agents (Antigravity, OpenAI/Codex, Cursor, Windsurf, and Claude Code) working within this repository.

---

## 1. Agent Discovery & Customization Hierarchy

Antigravity and compliant agent harnesses discover capabilities in this repository via the following paths:

* **Continuous Rules**: `.agents/rules/*.md`
  * [`.agents/rules/epistemic-gate.md`](.agents/rules/epistemic-gate.md): Always-on epistemic rule enforcing pre-flight premise validation and fail-closed negative constraint firewalling.
* **On-Demand Skills**:
  * [`skills/logic/add-logic/SKILL.md`](skills/logic/add-logic/SKILL.md): **Step 1 (Interpretation Gate)**. Mandatory Human ↔ LLM gate decomposing premises and conclusions, confirming interpretation baseline verbatim before validation or challenge.
  * [`skills/logic/grill-logic/SKILL.md`](skills/logic/grill-logic/SKILL.md): **State Machine 2 (Human HITL Engine)**. Sequential interactive architectural interview walking a decision tree one branch at a time via `ask_question`.
  * [`skills/logic/self-grill/SKILL.md`](skills/logic/self-grill/SKILL.md): **State Machine 1 (Autonomous DMAD Engine)**. Hands-free epistemic audit driven by real empirical tool probes with token-locked subagent handshakes.
  * [`skills/setup/setup-grill-logic/SKILL.md`](skills/setup/setup-grill-logic/SKILL.md): Automated repository configuration skill.
  * [`skills/setup/clear-ledger/SKILL.md`](skills/setup/clear-ledger/SKILL.md): Automated ledger reset and archiving skill.
* **Epistemic State Engine**: [`scripts/grill-state.mjs`](scripts/grill-state.mjs): Standalone, zero-dependency Node utility governing `.grill-logic/state.json`, $W/S$ calculations, token handshakes, deterministic invariant solving, and fail-closed diagnostic gates.

---

## 2. Core Epistemic Protocol for Agents

When operating as an AI agent in this environment, adhere to the truth-maintenance standards defined in the [Architecture Whitepaper](references/grill-logic-whitepaper.md):

### A. Epistemic Foundations: $W$, $S$, and Decoupled Credibility
* **Autonomy Weight ($W$)**:
  * $W_{\text{human}} = 1.0$ (High): human holds sovereign decision stakes and final say.
  * $W_{\text{subagent}} = 0.8$ (High): freshly spawned subagent operates with virgin context and a single loss function (*challenge correctness*).
  * $W_{\text{LLM}} = 0.2$ (Low): continuous LLM carrying conversational baggage.
* **Decoupled Invariant**: Challenger-credibility $\neq$ target-deference. The subagent's challenge carries maximum weight against the LLM ($S_{\text{LLM}}$ lands at full strength), but the LLM counters the subagent at full strength without reflexive deference.
* **Skepticism Signal ($S$)**: Scales inversely with target $W$.
  * $S_{\text{LLM}}$: Applies at full strength against the main model. Evaluated via introspection (sycophancy score, confirmation bias, fixed mental set).
  * $S_{\text{human}}$: Dampened. Calculated strictly from auditable behavioral metrics ($R_{\text{reassert}}$). Surfaced as a transparent diagnostic query if stagnant turns $\ge 3$, never overriding the human.

### B. Fail-Closed Error Architecture
* Any invariant violation, probe omission, dispatch token mismatch, or active contrastive rule collision **fails closed immediately** with exit code 1 or 2 and sets `EXECUTION_BLOCKED`.
* Code generation and implementation planning are **strictly prohibited** on blocked states. Silent pass-throughs are non-negotiable failures.

### C. The Dedicated Protocol Pipeline
* **Step 1: The Interpretation Gate (`/add-logic [prompt]`)**:
  - Mandatory Human ↔ LLM gate preceding all challenge exchanges.
  - Decomposes premises ($P_1 \dots P_n$) and conclusion ($C$). User corrections are accepted verbatim as baseline.
  - Commits confirmed baseline to `LOGICAL_LEDGER.md` as `FORMULATED`.
* **Step 2: Deterministic Validation (Solver)**:
  - Validates deductive form ($P \vdash C$) before challenge begins.
  - 5-Way Failure Taxonomy: Only `formally_invalid` auto-refutes; `malformed`, `unsupported_expression`, `inconsistent_premises`, and `undecidable` route to repair or probes.
* **Step 3: Two-Party Challenge State Machines**:
  - **Machine 1 (`/self-grill [proposal]`)**:
    - LLM ↔ Subagent exchange (subagent carries delegated human authority; $W_{\text{subagent}}=0.8 > W_{\text{LLM}}=0.2$).
    - **Empirical-Counter Rule**: Rejections require empirical probe evidence to be valid. No-counter enables procedural acceptance.
    - **Tool Invariant**: Every round requires an actual tool execution (`run_command`, `grep_search`, `view_file`).
    - **Token Handshake**: Subagent must authenticate via session `dispatch_token`.
  - **Machine 2 (`/grill-logic [topic]`)**:
    - Human ↔ LLM interactive interview.
    - Decomposes topic into an ordered decision tree.
    - **Strict Turn Yield**: Must call `ask_question` and **STOP GENERATION IMMEDIATELY**.
    - Tracks behavioral $S_{\text{human}}$. If stagnant turns $\ge 3$, raises `HUMAN_STAGNATION_ALERT`.

### D. Mandatory Operational Release Gate (ADR-0001)
* **Live In-Thread Verification**: Before any release, version tag, or deployment, the agent must execute live stochastic trials of `/self-grill` directly in the conversation thread.
* **No Pre-Scripted Archetypes**: Proposals must be generated stochastically on the fly to prevent model memorization or benchmark leakage.
* **Empirical Execution Contract**: Each trial must spawn a live `grill_logic_challenger` subagent via `invoke_subagent`, verify real tool probe executions, authenticate the session `dispatch_token`, and enforce asymmetric authority ($W_{\text{LLM}}=0.2$ cannot override $W_{\text{subagent}}=0.8$).
* **Universal Epistemic Proxy**: Successful completion of autonomous live trials serves as the operational proxy for both `/self-grill` and `/grill-logic` state machines.

### E. Asymmetric CoT & Frontier-Depletion Closure (ADR-0002)
* **Asymmetric CoT Topologies**: To prevent correlated errors across homogeneous LLM agents (Amazon Science findings), agents execute orthogonal reasoning paths:
  - *Challenger CoT*: Backward Inversion / Refutation ($C \implies \neg P$) with 0% solutions in Round 1.
  - *Proposer CoT*: Forward Constraint-Satisfaction Synthesis ($(P + \text{Bounds}) \implies C'$).
* **Strict 90/10 Invariant**: Round 1 challenger must NEVER offer solutions or recommendations (`➡️`). Solutions are strictly gated until concordance (State `S_A7` / `S_U7`).
* **Frontier-Depletion Closure**: Debates terminate when the epistemic frontier of unexamined contradictions and untested assumptions is empty ($\mathcal{F} = \emptyset$). Max 2 autonomous rounds before mandatory human escalation ($W_{\text{human}}=1.0$).
* **Structural Impossibility Over Pseudo-Math**: Rejects continuous float formulas ($\mathcal{E} = W \cdot (1 - S)$) or RRF rankings. Safety is enforced mechanically via deterministic state transition barriers, token locks, and fail-closed exit codes.

---

## 3. Communication Protocol

* **No Synthetic Flags**: Do not output or expect CLI flags like `--rounds` or `--actor`.
* **No Academic Logic Jargon**: Do not emit mathematical turnstiles (`⊢`), propositional calculus symbols, or formal epistemic labels in conversational prose. Use clear software engineering terminology.
* **Command Routing**:
  * Run `/self-grill [proposal]` for hands-free autonomous audits before code generation.
  * Run `/grill-logic [topic]` for interactive design interviews and architectural alignment.
