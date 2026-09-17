# Grill-Logic for Claude Code

This repository contains the **Grill-Logic** suite of epistemic truth-maintenance skills and fail-closed state machines.

---

## Repository Structure

* `skills/logic/add-logic/SKILL.md`: **Step 1 (Interpretation Gate)**. Mandatory Human ↔ LLM gate decomposing premises and conclusions, confirming interpretation baseline verbatim before validation or challenge.
* `skills/logic/grill-logic/SKILL.md`: **State Machine 2 (Human HITL Engine)**. Sequential interactive architectural interview walking a decision tree one branch at a time via `ask_question`.
* `skills/logic/self-grill/SKILL.md`: **State Machine 1 (Autonomous DMAD Engine)**. Hands-free epistemic audit driven by real empirical tool probes with token-locked subagent handshakes.
* `skills/setup/setup-grill-logic/SKILL.md`: Prompt-driven setup skill.
* `skills/setup/clear-ledger/SKILL.md`: Automated ledger reset and archiving skill (`/clear-ledger`).
* `scripts/grill-state.mjs`: Standalone, zero-dependency Node utility governing `.grill-logic/state.json`, $W/S$ calculations, token handshakes, and fail-closed diagnostic gates.
* `references/adr/`: Architecture Decision Records (ADR-0001 Stochastic Trials, ADR-0002 Asymmetric CoT, ADR-0003 Pure Negative Falsification).
* `references/grill-logic-whitepaper.md`: Canonical architecture whitepaper defining Autonomy Weight ($W$), Skepticism Signal ($S$), DMAD lineage, and 90/10 gating.
* `references/logical-ledger-spec.md`: Format specification and status lifecycles for `LOGICAL_LEDGER.md`.
* `.agents/rules/epistemic-gate.md`: Always-on rule enforcing continuous pre-flight premise verification and fail-closed gating.
* `LOGICAL_LEDGER.md`: Active project decision registry.

---

## 3-Step Setup

1. **Install Skills**: `npx skills add github:paragon-ux/grill-logic` (or clone directly).
2. **Run Setup**: Type `/setup-grill-logic` inside Claude Code to scaffold ledger and continuous rules.
3. **Ready**: State machines and fail-closed gates are active.

---

## Invocation in Claude Code

### 1. Mandatory Interpretation Gate (`/add-logic`)
Run before entering either challenge state machine to decompose premises and validate deductive form:
```bash
/add-logic refactor query pipeline to use raw TCP sockets
```
- Decomposes explicit premises ($P_1 \dots P_n$) and candidate conclusion ($C$).
- User corrections are confirmed verbatim as the baseline.
- Validates logical structure via deterministic NeSy solver (5-way taxonomy).
- Dynamic Deduplication: checks against active ledger entries ($\tau_{\text{dup}} = 0.50$). If a semantic duplicate exists, alerts developer conversationally (Zero User Flags).
- Commits confirmed baseline to `LOGICAL_LEDGER.md` as `FORMULATED`.

### 2. Autonomous Self-Grill (`/self-grill`) (Hands-free / AFK)
Run when you want the agent to stress-test a proposal thoroughly before planning or writing code:
```bash
/self-grill refactor query pipeline to use raw TCP sockets
```
- Dispatches isolated subagent with virgin context ($W_{\text{subagent}} = 0.8 > W_{\text{LLM}} = 0.2$).
- **Tool Invariant**: Every challenge round executes an actual empirical tool probe (`grep_search`, `run_command`, `view_file`).
- Fails closed with structured diagnostics if input is missing or unverified.
- Autonomous Deduplication Policy: Auto-updates if $\text{sim} > 0.85$; auto-disambiguates if $0.50 \le \text{sim} \le 0.85$. Zero autonomous deadlock.

### 3. Interactive Human Interview (`/grill-logic`) (HITL)
Run when you want to explore and align on an architectural design tree:
```bash
/grill-logic migrate session tokens to redis cluster
```
- Decomposes topic into an ordered decision tree.
- **Turn Yield Invariant**: Calls `AskUserQuestion` / `ask_question` and **yields turn immediately**. The model is physically prohibited from answering for the user.
- Tracks behavioral $S_{\text{human}}$: if stagnant turns $\ge 3$, raises `HUMAN_STAGNATION_ALERT`.
- Commits confirmed invariants to `LOGICAL_LEDGER.md` as `SUPPORTED`.

---

## Fail-Closed Error Architecture

Whenever an invariant is violated, a probe is omitted, or an active `REJECTED` rule in `LOGICAL_LEDGER.md` is matched:
1. The engine **fails closed immediately** with exit code 1 or 2.
2. The state is marked `EXECUTION_BLOCKED`.
3. Procedural code generation is **hard-blocked**. Silent pass-throughs are strictly prohibited.

---

## Release Gate Protocol (ADR-0001)

Before cutting any release, tagging a new version, or publishing changes:
1. All static unit and schema tests must pass (`npm test`).
2. The AI agent must execute live stochastic `/self-grill` trials directly in the conversation thread.
3. Proposals must be stochastically synthesized on the fly (no fixed templates or static corpora).
4. Subagents must be invoked live, proving empirical tool probing, token-locked state logging, and asymmetric authority enforcement.

---

## Asymmetric CoT & Frontier-Depletion Closure (ADR-0002)

* **Decorrelated Reasoning**: Challenger executes Backward Inversion CoT ($C \implies \neg P$); Proposer executes Forward Synthesis CoT ($(P + \text{Bounds}) \implies C'$). Prevents correlated errors (Amazon Science findings).
* **Strict 90/10 Invariant**: Challenger must NEVER offer solutions or recommendations in Round 1. Solutions unlocked only after concordance.
* **Frontier-Depletion Closure**: Terminate when the epistemic frontier of unaddressed contradictions is empty ($\mathcal{F} = \emptyset$). Max 2 autonomous rounds before human escalation ($W_{\text{human}}=1.0$).
* **Structural Impossibility**: No fake math or continuous float scoring. Gates are enforced by deterministic state machines, exit codes, and token handshakes.

---

## Pure Negative Falsification & Zero User Flags (ADR-0003)

* **Falsified Boundary Normalization**: Negative constraint similarity evaluates strictly against the normalized conjunction of the falsified conclusion and prohibited failure boundary ($\text{Target Space} = C_{\text{rejected}} \cup R_{\text{refute\_boundary}}$) using sublinear TF + word-bigram cosine similarity ($\tau = 0.30$).
* **Anti-Prescriptive Firewall**: Contrastive advice and alternatives ($C'$) are advisory human explanations, never mathematical gate passkeys. Composite proposals mentioning alternatives cannot bypass firewall blocks.
* **Zero User Flags**: Developers interact purely through natural language. Claude Code inspects structured diagnostic exit codes and passes CLI flags (`--arg-id`, `--allow-duplicate`) programmatically.


