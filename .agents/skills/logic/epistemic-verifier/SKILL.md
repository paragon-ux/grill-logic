---
name: epistemic-verifier
description: The epistemic truth-maintenance engine for Grill-Logic. Extracts Standard Logical Form (P1..Pn ⊢ C), executes multi-round challenge, maintains the Logical Ledger, and gates downstream code execution.
---

# Epistemic Verifier

The reusable truth-maintenance primitive behind `grill-logic` and the continuous epistemic hook. It validates whether an architectural proposal, prompt conclusion, or plan is logically sound and factually grounded **before** code execution begins.

---

## 1. Multi-Round vs. Multi-Turn

* **Multi-Turn**: The conversational session lifecycle across multiple user exchanges. Guarded by the persistent `LOGICAL_LEDGER.md` and continuous hooks (`epistemic-gate.md`) to prevent context poisoning and semantic regression over time.
* **Multi-Round (Intra-Audit Iterative Challenge)**: The iterative challenge rounds executed **within** a single verification audit to break cognitive fixations on unexamined assumptions:
  * **Round 1**: Attack the primary inferential bridge: $P \vdash C$.
  * **Round 2 (Challenge the Counter-Hypothesis)**: If challenger proposes alternative $C'$, extract and challenge the premises of $C'$ ($P_{C'} \vdash C'$).
  * **Round $k$**: Continue until the epistemic frontier is settled.

---

## 2. The 4-Phase Protocol

### Phase 1: Standard Logical Form Extraction
Deconstruct the incoming proposal into Standard Form:
* **Explicit Premises ($P_1, P_2, \dots$)**: Stated observations, requirements, or environmental facts.
* **Hidden Premises ($P_{\text{hidden}}$)**: Unspoken assumptions about concurrency, network, OS ABI, or API contracts.
* **Candidate Conclusion ($C$)**: The proposed architectural action or implementation.
* **Inferential Turnstile**: $\{P_1..P_n, P_{\text{hidden}}\} \vdash C$.

### Phase 2: Multi-Round Epistemic Challenge
Execute iterative rounds of debate targeting the inferential turnstile ($\vdash$):
1. **Fallacy of False Alternative**: Does $P$ necessitate $C$, or does a lower-complexity $C'$ resolve $P$ without operational bloat?
2. **Axiomatic Invalidation**: Is a premise factually false (e.g., SQLite WAL over network storage)?
3. **Boundary Inversion**: Under what load, concurrency, or failure conditions does $C$ fail?

#### Actor-Agnostic Routing (Fastest Falsifier):
* **Deterministic Probe**: Run a 5-line compiler check, CLI command, or documentation search.
* **Internal Adversarial CoT (AFK)**: Formulate the strongest counter-hypothesis in extended thinking.
* **Human Arbitration (HITL)**: Use `ask_question` with structured options when a business trade-off or regulatory scope requires human sign-off.

### Phase 3: Logical Ledger Maintenance
Record the argument in `LOGICAL_LEDGER.md`:
* **`SUPPORTED`**: The inferential bridge holds; premises are verified.
* **`REJECTED`**: The inference is invalid, a premise is false, or a superior $C'$ is proven. Must register an active **Contrastive Refutation Rule**:
  > *"Do not infer [C] from [P] because [Counter-evidence E]. Alternative: [C']."*
* **`UNCERTAIN`**: Requires a targeted sandbox spike before gating.

### Phase 4: Epistemic Gate Decision
* **`SUPPORTED`**: Issue Epistemic Sign-Off. Pass verified conclusions and boundary invariants to the downstream execution engine.
* **`REJECTED`**: **HARD BLOCK**. Halt execution of $C$. Enforce the contrastive negative constraint and pivot to $C'$.
* **`UNCERTAIN`**: Run a 5-line probe to transition status before proceeding.

---

## Output Template

```markdown
### 1. Standard Logical Form
* **P1**: [Premise 1]
* **P2**: [Premise 2]
* **P_hidden**: [Hidden assumption]
* **⊢ C**: [Proposed Action]

### 2. Multi-Round Epistemic Challenge
* **Round 1 (Attack on Bridge)**: [Challenge to P ⊢ C]
* **Challenger & Finding**: [Probe result | CoT critique | Human answer]
* **Round 2 (Counter-Hypothesis Check)**: [Stress-testing alternative C' if proposed]

### 3. Epistemic Ledger Update
* **Status**: [SUPPORTED | REJECTED | UNCERTAIN]
* **Contrastive Rule (if rejected)**: [Active negative constraint]

### 4. Epistemic Gate Decision
* [PASS: Proceed with verified conclusion] OR [BLOCK: Invalidate C, adopt alternative C']
```
