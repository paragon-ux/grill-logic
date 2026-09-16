---
name: self-grill
description: Autonomous AI Iterative Self-Prompting (DMAD Engine). Hands-free epistemic truth verification and premise stress-testing driven by real empirical tool probes with fail-closed negative constraint gating.
disable-model-invocation: true
argument-hint: "[architectural proposal or infrastructure change]"
---

# Self-Grill: Autonomous DMAD Epistemic Engine

Stress-test an architectural proposal, infrastructure component, database choice, or boundary refactor autonomously **before** planning or writing code.

Self-Grill executes **State Machine 1 (Autonomous AI Iterative Self-Prompting)** under the game-theoretic principles of **Diverse Multi-Agent Debate (DMAD, ICLR 2025)**. It operates hands-free (AFK), driven strictly by **real empirical tool executions**, and fails closed on any unverified condition.

---

## Non-Negotiable Invariants

1. **No Simulated Text Monologues**: Every challenge round requires a **real tool execution** (`run_command`, `grep_search`, `view_file`, or subagent dispatch). Simulating fictional "Round 1, Round 2" text debates without tool data is an epistemic violation.
2. **Fail-Closed Input Gate**: Invocation with an empty, missing, or vague proposal immediately halts with `INPUT_GATE_HALT`. The model never hallucinates arbitrary topics.
3. **Decoupled Asymmetric Authority ($W_{\text{subagent}} = 0.8 > W_{\text{LLM}} = 0.2$)**:
   - The subagent's challenge lands at full strength ($S_{\text{LLM}}$).
   - The main model ($W=0.2$) is **physically prohibited** from overriding a subagent `REJECTED` verdict without an empirical counter-probe disproving the subagent's findings.
4. **Token-Locked Handshake**: State transitions are locked to a one-time `dispatch_token` in `.grill-logic/state.json`. Unsigned commits fail closed.
5. **Hard Gating**: If evidence refutes the proposal, `REJECTED` is committed to `LOGICAL_LEDGER.md` and code generation is **hard-blocked**.

---

## Operational Execution Protocol

```
[Proposal Ingested]
        │
        ▼
1. Initialize State & Validate Input Gate ──> (Fails closed if empty)
        │
        ▼
2. Deconstruct Axioms (Stated vs. Hidden)
        │
        ▼
3. Dispatch Ephemeral Subagent with Dispatch Token
        │
        ▼
4. Subagent Runs Real Tool Probe & Records Audit (S_LLM, Verdict, Rule)
        │
        ▼
5. Confrontation: Defend with Empirical Counter-Probe or Concede
        │
        ▼
6. Subagent Sign-off (if SUPPORTED)
        │
        ▼
7. Commit to LOGICAL_LEDGER.md & Gate Downstream Execution
```

### Step 1: Initialize Session & Input Gate
Run the state engine with the proposal:
```bash
node scripts/grill-state.mjs init --machine autonomous --input "<proposal>"
```
- **If exit code is non-zero (e.g. `INPUT_GATE_HALT`)**: STOP IMMEDIATELY. Output the diagnostic block. Do not proceed.
- **If exit code is 0**: Note the unique `Dispatch Token` (e.g. `dmad_tok_e4b1`).

### Step 2: Deconstruct Axioms
Deconstruct the proposal into clean software engineering terms:
- **Stated Constraints ($P_1, P_2, \dots$)**: Explicit factual claims and scale requirements.
- **Hidden Assumptions ($P_{\text{hidden}}$)**: Unspoken premises regarding concurrency, locking, network latency, or failure domains.
- **Candidate Conclusion ($C$)**: The proposed architectural implementation.

### Step 3: Dispatch Ephemeral Subagent
Spawn an isolated adversarial challenger via `invoke_subagent`:
```json
{
  "Subagents": [{
    "TypeName": "grill_logic_challenger",
    "Role": "Adversarial Epistemic Challenger",
    "Model": "inherit",
    "Prompt": "AUDIT REQUEST: [proposal]\nDISPATCH TOKEN: [dispatch_token]\n\n1. Deconstruct premises and hidden assumptions.\n2. Apply DMAD strategies (backward refutation, empirical probing, premise inversion).\n3. Execute a real tool probe (grep_search, view_file, run_command, search_web) to test the weakest link.\n4. Log your audit directly: node scripts/grill-state.mjs record-subagent-audit --token [dispatch_token] --risk <LOW|MODERATE|HIGH> --syco <0.0-1.0> --conf <0.0-1.0> --fixed-set <true|false> --probe-tool <tool> --probe-finding \"<finding>\" --verdict <SUPPORTED|REJECTED> --rule \"<contrastive rule>\"\n5. If SUPPORTED, execute: node scripts/grill-state.mjs signoff-subagent --token [dispatch_token]\n6. Return your audit summary to parent."
  }]
}
```
**Turn Rule**: Do not generate evaluation text. Let the subagent execute.

### Step 4: Evaluate Subagent Verdict
When the subagent returns its message:
- **If Subagent Verdict is `REJECTED`**:
  - The main model cannot override $W_{\text{subagent}}$ with generative prose.
  - If you believe the subagent is factually wrong, you MUST run an empirical tool probe disproving it and log it.
  - Otherwise, you MUST accept the refutation.
- **If Subagent Verdict is `SUPPORTED`**:
  - Verify that `subagent_signoff` was recorded.

### Step 5: Commit to Ledger & Gate Execution
Run the commit command:
```bash
# If refuted:
node scripts/grill-state.mjs commit --status REJECTED --rule "When designing for [P], DO NOT use [C] because [Evidence]. Instead, use [C']."

# If supported:
node scripts/grill-state.mjs commit --status SUPPORTED --rule "Verified via empirical probe [Tool]"
```

- **If `REJECTED`**: Code generation is **strictly blocked**. Output the Contrastive Refutation Rule to the user and pivot to the supported alternative.
- **If `SUPPORTED`**: Present the Post-Concordance Solution Triad (Option 1 Minimal, Option 2 Standard, Option 3 Scale) to the user before generating code.
