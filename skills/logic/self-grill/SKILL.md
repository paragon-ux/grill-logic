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
   - $W$ is **structural authority** (evidence-independence and clean context), **never** a measure of model or user competence.
   - The subagent's challenge lands at full strength ($S_{\text{LLM}}$).
   - The main model ($W=0.2$) is **physically prohibited** from overriding a subagent `REJECTED` verdict without an empirical counter-probe disproving the subagent's findings.
4. **Dynamic Skepticism Timing**: $S_{\text{LLM}}$ measures behavioral reaction to pushback (sycophancy, confirmation bias, fixed mental set). It **cannot be scored at Turn 0** before the target LLM has responded to a challenge.
5. **Token-Locked Handshake**: State transitions are locked to a one-time `dispatch_token` in `.grill-logic/state.json`. Unsigned commits fail closed.
6. **Hard Gating**: If evidence refutes the proposal, `REJECTED` is committed to `LOGICAL_LEDGER.md` and code generation is **hard-blocked**.
7. **Strict 90/10 Invariant & Asymmetric CoT (ADR-0002)**: The challenger executes Backward Inversion CoT ($C \implies \neg P$) and is strictly forbidden from proposing solutions or recommendations in Round 1 (0% solution). The proposer executes Forward Synthesis CoT ($(P + \text{Bounds}) \implies C'$).
8. **Frontier-Depletion Closure (ADR-0002)**: Verification terminates when the epistemic frontier of unaddressed contradictions is depleted ($\mathcal{F} = \emptyset$). Max 2 autonomous rounds before mandatory escalation to the human sovereign ($W_{\text{human}}=1.0$).

---

## Operational Execution Protocol

```
[Proposal Ingested]
        │
        ▼
0. Interpretation Gate (/add-logic) ──> (Human ↔ LLM baseline confirmed; FORMULATED)
        │
        ▼
1. Deterministic Validation (NeSy Solver) ──> (S_A0C_VALIDATION; Fails closed if invalid)
        │
        ▼
2. Initialize State & Issue Token (S_A1_TOKEN_ISSUE)
        │
        ▼
3. Round 1: Dispatch Ephemeral Subagent Challenger (S_A2_SPAWN_CHALLENGER / S_A3)
        │
        ▼
4. Subagent Executes Empirical Probe & Records Challenge (S_A3_ROUND_1_CHALLENGE)
   (--conclusion_status CHALLENGED, S_LLM unassessed)
        │
        ▼
5. Round 2: Proposer Confrontation (S_A4_ROUND_2_PROPOSER_CONFRONTATION)
   - Concede (--type concede) ──> S_A6_REJECTION
   - Counter-Hypothesis (--type counter) ──> Propose C' addressing empirical probe
        │
        ▼
6. Subagent Dynamic S_LLM Evaluation & Follow-up Probe (S_A5_SUBAGENT_EVAL)
   - Evaluates sycophancy, confirmation bias, fixed mental set on LLM response
   - Probes C' for soundness
   - Logs verdict: SUPPORTED (S_A7_CONCORDANCE_SIGN_OFF) or REJECTED (S_A6)
        │
        ▼
7. Commit to LOGICAL_LEDGER.md & Gate Downstream Execution (S_A8_HUMAN_DELIVERY)
```

### Step 0: Mandatory Interpretation Gate (`/add-logic`)
Before dispatching autonomous subagents, verify whether the proposal has been formulated in `LOGICAL_LEDGER.md`.
- **If unformulated**: Execute `/add-logic [proposal]`. Decompose premises ($P_1 \dots P_n$) and conclusion ($C$), confirm baseline with human user verbatim, and commit as `FORMULATED`.
- **Deterministic Validation**: Run `node scripts/grill-state.mjs validate-nesy --payload '<JSON>'`. Only proceed to autonomous dispatch if structurally `valid`.

### Step 1: Initialize Session & Input Gate (S_A1_TOKEN_ISSUE)
Run the state engine with the formulated proposal:
```bash
node scripts/grill-state.mjs init --machine autonomous --input "<proposal>"
```
- **If exit code is non-zero (e.g. `INPUT_GATE_HALT`)**: STOP IMMEDIATELY. Output the diagnostic block. Do not proceed.
- **If exit code is 0**: Note the unique `Dispatch Token` (e.g. `dmad_tok_e4b1`). State transitions to `S_A1_TOKEN_ISSUE`.

### Step 2: Deconstruct Axioms
Deconstruct the proposal into clean software engineering terms:
- **Stated Constraints ($P_1, P_2, \dots$)**: Explicit factual claims and scale requirements.
- **Hidden Assumptions ($P_{\text{hidden}}$)**: Unspoken premises regarding concurrency, locking, network latency, or failure domains.
- **Candidate Conclusion ($C$)**: The proposed architectural implementation.

### Step 3: Round 1 — Dispatch Ephemeral Subagent
Spawn an isolated adversarial challenger via `invoke_subagent`:
```json
{
  "Subagents": [{
    "TypeName": "grill_logic_challenger",
    "Role": "Adversarial Epistemic Challenger",
    "Model": "inherit",
    "Prompt": "AUDIT REQUEST (Round 1): [proposal]\nDISPATCH TOKEN: [dispatch_token]\n\n1. Deconstruct premises and hidden assumptions.\n2. Apply DMAD strategies (backward refutation, empirical probing, premise inversion).\n3. Execute a real tool probe (grep_search, view_file, run_command, search_web) to test the weakest link.\n4. Log your challenge: node scripts/grill-state.mjs record-subagent-audit --token [dispatch_token] --probe-tool <tool> --probe-finding \"<empirical finding>\" --verdict CHALLENGE_ISSUED --rule \"<contrastive refutation rule>\"\n   (Note: S_LLM is left unassessed until the target LLM responds in Round 2).\n5. Return your challenge report to the parent agent."
  }]
}
```
**Turn Rule**: Do not generate evaluation text. Let the subagent execute.

### Step 4: Round 2 — Target LLM Confrontation
When the subagent returns its challenge report and empirical finding:
- Inspect the empirical finding and refutation.
- **Option A (Concede)**: If the refutation is decisive and no viable counter-hypothesis exists:
  ```bash
  node scripts/grill-state.mjs record-llm-response --token [dispatch_token] --type concede --response "Conceded based on empirical finding: [Finding]"
  ```
- **Option B (Counter-Hypothesis $C'$)**: If the proposal can be refined into a minimal, empirically sound architecture resolving the bottleneck:
  ```bash
  node scripts/grill-state.mjs record-llm-response --token [dispatch_token] --type counter --response "Counter-Hypothesis C': [Refined architecture addressing empirical probe]"
  ```

### Step 5: Round 2 Evaluation & Sign-off
Dispatch or send a message to the subagent to evaluate the target LLM's response:
- The subagent evaluates structural metrics deterministically (no arbitrary floating-point guesses):
  - **Sycophancy ($S_{\text{syco}}$)**: $N_{\text{unearned}} / N_{\text{total\_concessions}}$ (0.0 if concessions were backed by empirical evidence).
  - **Confirmation Bias ($S_{\text{conf}}$)**: $E_{\text{unexamined}} / E_{\text{total\_counter}}$ (0.0 if all probe findings were addressed in $C'$).
  - **Fixed Mental Set**: True if LLM repeated refuted conclusion; False if hypothesis class shifted ($C' \neq C$).
  - **Empirical Soundness of $C'$**: Runs follow-up tool probe if needed.
- Subagent logs evaluated audit using deterministic structural arguments:
  ```bash
  node scripts/grill-state.mjs record-subagent-audit --token [dispatch_token] \
    --unearned-concessions <N> --total-concessions <N> \
    --unexamined-counter-evidence <N> --total-counter-evidence <N> \
    --hypothesis-shifted <true|false> \
    --probe-tool <tool> --probe-finding "<probe on C'>" \
    --verdict <SUPPORTED|REJECTED> --rule "<rule>"
  ```
- If and only if verdict is `SUPPORTED`:
  ```bash
  node scripts/grill-state.mjs signoff-subagent --token [dispatch_token]
  ```

### Step 6: Commit to Ledger & Gate Execution
Run the commit command:
```bash
# If refuted:
node scripts/grill-state.mjs commit --status REJECTED --rule "When designing for [P], DO NOT use [C] because [Evidence]. Instead, use [C']."

# If supported:
node scripts/grill-state.mjs commit --status SUPPORTED --rule "Verified via empirical probe [Tool]"
```

- **If `REJECTED`**: Code generation is **strictly blocked**. Output the Contrastive Refutation Rule to the user and pivot to the supported alternative.
- **If `SUPPORTED`**: Present the Post-Concordance Solution Triad (Option 1 Minimal, Option 2 Standard, Option 3 Scale) to the user before generating code.
