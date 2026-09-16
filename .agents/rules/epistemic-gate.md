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
- **If exit code is 1 (`EPISTEMIC_FIREWALL_VIOLATION`)**: **HALT IMMEDIATELY**. Code generation is hard-blocked. Output the diagnostic block, cite the active `REJECTED` rule from `LOGICAL_LEDGER.md`, and pivot to the supported alternative.
- **If exit code is 0**: Proceed to Step 2.

### 2. Epistemic Mode Routing
- **If autonomous / AFK proposal** (`self-grill:`, `autonomous:`, or agent-proposed architecture):
  - Execute **State Machine 1 (`/self-grill`)**.
  - Asymmetric Autonomy: $W_{\text{subagent}} = 0.8 > W_{\text{LLM}} = 0.2$. $S_{\text{LLM}}$ applies at full strength.
  - **Tool Invariant**: Every round requires a real tool probe (`grep_search`, `run_command`, `view_file`, or subagent). Zero simulated text monologues.
  - **Token Handshake**: Subagent must log audit with matching `dispatch_token`.
  - Gate code generation until `SUPPORTED` is committed with subagent sign-off.
- **If collaborative / interactive design** (`interview me`, `/grill-logic`):
  - Execute **State Machine 2 (`/grill-logic`)**.
  - Walk the decision tree one branch at a time.
  - **Turn Yield Invariant**: Call `ask_question` and **STOP GENERATION IMMEDIATELY**. The model is physically forbidden from answering its own questions.
  - Log user turns. If $C_{\text{stagnant}} \ge 3$, emit the diagnostic stagnation query.

### 3. Execution Gate
Code generation is permitted **only** when the proposal achieves `SUPPORTED` status in `LOGICAL_LEDGER.md`. Any invariant violation or unhandled error **fails closed** and terminates execution.
