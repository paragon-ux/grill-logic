# Epistemic Gate: Continuous Premise Validation (Fail-Closed)

This rule runs continuously in multi-turn conversations, intercepting architectural proposals to prevent building on unexamined assumptions or refuted designs.

## Activation Triggers
Apply this rule whenever the user (or the agent itself) proposes:
1. Introducing a new architectural dependency, database, or infrastructure component (e.g., Redis, Kafka, Elasticsearch, Docker).
2. Refactoring core data storage, persistence, concurrency, networking, or tenancy boundaries.
3. Making non-trivial architectural decisions based on stated performance, scale, or regulatory requirements.

*Do NOT activate on trivial operations* (e.g., formatting code, fixing syntax errors, documentation lookups, or minor utility edits).

---

## Autonomous Verification Protocol (Fail-Closed)

Before formulating an implementation plan or writing code for an architectural proposal:

### 1. Pre-Flight Negative Constraint Check (Fail-Closed)
Run the state engine gate check against `LOGICAL_LEDGER.md`:
```bash
node scripts/grill-state.mjs check-gate --proposal "<proposal>"
```
- **If exit code is 1 (`EPISTEMIC_FIREWALL_VIOLATION` or `INVARIANT_SOLVER_VIOLATION`)**: **HALT IMMEDIATELY**. Code generation is hard-blocked. Output the diagnostic block, cite the active `REJECTED` rule from `LOGICAL_LEDGER.md` or physical system invariant, and pivot to the supported alternative.
- **Pure Negative-Constraint Falsification (ADR-0003)**: Evaluates semantic similarity using sublinear TF + word-bigram cosine similarity ($\tau_{\text{firewall}} = 0.30$) against the normalized conjunction of the falsified conclusion and prohibited boundary ($\text{Clean}(C_{\text{rejected}}) \cup \text{Clean}(R_{\text{refute\_boundary}})$). Contrastive advice is diagnostic guidance for humans/agents, never a positive constraint or gate passkey.
- **User Sovereignty ($W_{\text{human}}=1.0$)**: Custom domain exemptions and threshold overrides are strictly user-managed via `.grill-logic/allowlist.json`. Zero hardcoded domain stop-word dictionaries or technology whitelists.
- **If exit code is 0**: Proceed to Step 2.

### 2. Interpretation Gate (`/add-logic`)
Before entering either challenge state machine, the proposal must pass the **Interpretation Gate (`/add-logic`)**:
- Decompose explicit premises ($P_1 \dots P_n$) and proposed conclusion ($C$).
- Present interpretation to the user. User corrections become the baseline verbatim.
- **Zero User Flags & Dynamic Deduplication (ADR-0003)**: Scans `LOGICAL_LEDGER.md` using sublinear TF cosine similarity ($\tau_{\text{dup}} = 0.50$). If a semantic duplicate exists, emits `POTENTIAL_DUPLICATE_FLAG` to prevent redundant rows. The human is never asked for CLI flags; the agent converses in plain English and executes programmatic updates (`--arg-id`) or distinct insertions (`--allow-duplicate true`) based on user choice. In autonomous mode (`/self-grill`), the engine auto-resolves duplicates without human blocking.
- Commits confirmed baseline to `LOGICAL_LEDGER.md` as `FORMULATED`.
- Execute deterministic validation via the solver (5-way taxonomy). Only proceed to challenge if structurally valid.

### 3. Epistemic Mode Routing
- **If autonomous / AFK proposal** (`self-grill:`, `autonomous:`, or agent-proposed architecture):
  - Execute **State Machine 1 (`/self-grill`)**.
  - Asymmetric Autonomy: $W_{\text{subagent}} = 0.8 > W_{\text{LLM}} = 0.2$. $S_{\text{LLM}}$ applies at full strength.
  - **Empirical-Counter Rule**: Rejections must be substantiated by empirical tool probe findings.
  - **Tool Invariant**: Every round requires a real tool probe (`grep_search`, `run_command`, `view_file`). Zero simulated text monologues.
  - **Token Handshake**: Subagent must log audit with matching session `dispatch_token`.
  - Gate code generation until `SUPPORTED` is committed with subagent sign-off.
- **If collaborative / interactive design** (`interview me`, `/grill-logic`):
  - Execute **State Machine 2 (`/grill-logic`)**.
  - Walk the decision tree one branch at a time.
  - **Turn Yield Invariant**: Call `ask_question` and **STOP GENERATION IMMEDIATELY**. The model is physically forbidden from answering its own questions.
  - Log user turns. If $C_{\text{stagnant}} \ge 3$, emit the diagnostic stagnation query.

### 4. Execution Gate
Code generation is permitted **only** when the proposal achieves `SUPPORTED` or `ACCEPTED_SOLUTION` status in `LOGICAL_LEDGER.md`. Any invariant violation or unhandled error **fails closed** and terminates execution.
