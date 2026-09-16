---
name: add-logic
description: Interpretation Gate for Grill-Logic. Decomposes prompts into explicit premises and conclusion, confirms baseline verbatim with user, and registers FORMULATED entries in the Logical Ledger before challenge.
disable-model-invocation: true
argument-hint: "[architectural prompt or proposal to formulate]"
---

# Add-Logic: The Epistemic Interpretation Gate

The **Interpretation Gate (`/add-logic`)** is the mandatory first step of the Grill-Logic protocol. It decomposes an architectural proposal into explicit premises ($P_1 \dots P_n$) and a proposed conclusion ($C$), confirms the baseline interpretation with the human, and registers the entry in `LOGICAL_LEDGER.md` before any challenge can occur.

Neither `/grill-logic` nor `/self-grill` may run without a confirmed logical baseline. If invoked on an unformulated proposal, they must invoke `/add-logic` first.

---

## Core Invariants

1. **Interpretation is Not Challenge**: This step confirms *what is being discussed*, not that it is true.
2. **Agreement is Not Truth**: User agreement confirms the baseline claim under discussion. Premises remain open to empirical challenge in downstream stages.
3. **Verbatim Baseline Rule**: If the user corrects the logical set, that correction **must be accepted verbatim as the baseline**, even if erroneous. Preserving user intent takes absolute precedence at this stage.
4. **Always Human ↔ LLM**: `/add-logic` is always a two-party Human ↔ LLM exchange, even when the subsequent challenge is delegated to an autonomous subagent under `/self-grill`.
5. **Deduplication Required**: Check `LOGICAL_LEDGER.md` for duplicate or near-duplicate entries before adding. If a duplicate exists, inform the user rather than silently declining.
6. **Formulated State**: Initial ledger entries carry status `FORMULATED` (no `SUPPORTED`, `REJECTED`, or `UNCERTAIN` label until validation and challenge).

---

## Operational Execution Protocol

### Step 1: Deconstruct the Prompt
Decompose the user's prompt into:
- **Explicit Premises ($P_1, P_2, \dots$)**: Stated requirements, scale targets, or operational constraints.
- **Hidden / Latent Premises ($P_{\text{hidden}}$)**: Unspoken technical assumptions required for the leap.
- **Proposed Conclusion ($C$)**: The specific architectural implementation or decision.

### Step 2: Present Interpretation to User
Present the explicitated logical set clearly in plain software engineering terms:
```text
I have decomposed your proposal into the following baseline logical set:

• Premise 1 (P1): [Explicit requirement or constraint]
• Premise 2 (P2): [Explicit requirement or constraint]
• Hidden Premise (P_hidden): [Latent assumption]
⊢ Proposed Conclusion (C): [Proposed architectural decision]

Does this accurately capture what you are proposing? 
(You may confirm or provide verbatim corrections).
```

### Step 3: Accept Corrections Verbatim & Deduplicate
- If the user provides corrections, adopt them **verbatim** as the baseline.
- Check `LOGICAL_LEDGER.md` for existing entries.
- If duplicate: Inform the user and reference the existing `ARG-XX`.

### Step 4: Commit Baseline to Ledger as FORMULATED
Register the formulated entry via the state engine:
```bash
node scripts/grill-state.mjs add-logic --prompt "<original prompt>" --premises '<JSON array of premises>' --conclusion "<conclusion>"
```
This commits the argument to `LOGICAL_LEDGER.md` with status `FORMULATED` and initializes tallies as unassessed (zero votes cast):
`tally: { proposer: null, challenger: null, premises: { agree: 0, disagree: 0, uncertain: 0 }, solution: { agree: 0, disagree: 0, uncertain: 0 } }`.
(User agreement here confirms the discussion baseline, not premise truth).

### Step 5: Deterministic Validation (NeSy Solver)
Run deterministic validation on the formulated entry:
```bash
node scripts/grill-state.mjs validate-nesy --payload '<JSON expressions and dependencies>'
```
Handle the 5-way solver taxonomy outcome:
- **`valid`**: Proceed to challenge (`/self-grill` or `/grill-logic`).
- **`malformed`**: Reformulate JSON/expression syntax and retry.
- **`inconsistent_premises`**: Surface internal circularity to user; re-run `/add-logic`.
- **`unsupported_expression`**: Flag in ledger; fall back to internal reasoning.
- **`undecidable`**: Mark `UNCERTAIN`; route to empirical probe in Round 1.
- **`formally_invalid`**: **Immediate Refutation**. Commit `REJECTED` and emit contrastive rule. Halt.

### Step 6: Chaining to Challenge Mode
Once validated, chain directly into the requested challenge mode:
- If autonomous: `/self-grill [ARG-ID]`
- If interactive: `/grill-logic [ARG-ID]`
