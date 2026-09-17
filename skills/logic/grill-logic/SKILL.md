---
name: grill-logic
description: Human Sequential Architectural Interview (HITL Engine). Interactive, turn-by-turn alignment walking a design tree one decision at a time via ask_question tool calls with strict turn-yielding and behavioral stagnation tracking.
disable-model-invocation: true
argument-hint: "[architectural topic or design area]"
---

# Grill-Logic: Human Sequential Interview (HITL Engine)

Interactively interview the developer to align on architectural design, persistence boundaries, concurrency models, or infrastructure decisions **before** planning or implementation.

Grill-Logic executes **State Machine 2 (Human Sequential Interview / HITL Engine)**. The agent acts strictly as an interrogator, walking down an architectural decision tree one decision at a time. The human holds high Autonomy Weight ($W_{\text{human}} = 1.0$) and sovereign final say.

---

## Non-Negotiable Invariants

1. **Strict Yield on Question**: The model is **physically prohibited** from answering its own questions. It must invoke the harness `ask_question` tool with structured options and a recommendation, and **immediately end its turn**. Never simulate a user response.
2. **One Branch at a Time**: No multi-part questionnaires ("Section A, Section B, Section C"). Resolve Dependency 1 $\to$ await human response $\to$ resolve Dependency 2.
3. **No Sycophancy**: If a user's choice collides with operational realities or physical limits, the agent's next turn must challenge the collision with evidence and offer a corrective fork.
4. **Behavioral Stagnation Tracking ($S_{\text{human}}$)**: Every user turn is logged for new propositions. If the user repeats their stance for 3 consecutive rounds without introducing new constraints, the engine halts with `HUMAN_STAGNATION_ALERT` requiring a transparent diagnostic query.
5. **Permanent Invariant Ledger**: Once all branches are settled, confirmed trade-offs are logged to `LOGICAL_LEDGER.md` as `SUPPORTED` invariants so future agent turns cannot regress.
6. **Zero User Flags (ADR-0003)**: The developer interacts exclusively through conversational dialogue and interactive `ask_question` options. The developer is never prompted or expected to enter CLI flags. The agent handles all state engine commands behind the scenes.

---

## Operational Execution Protocol

```
[Design Topic Ingested]
         │
         ▼
1. Initialize State & Validate Input Gate ──> (Fails closed if empty)
         │
         ▼
2. Decompose into Ordered Decision Tree (Branches 1..N)
         │
         ▼
3. Formulate Single Branch Decision
         │
         ▼
4. Call `ask_question` Tool with Options & Recommendation ──> STOP TURN (Yield)
         │
         ▼
5. User Submits Decision
         │
         ▼
6. Record Turn & Check Behavioral S_human (New propositions vs. Stagnation)
         │
         ├── (If 3 stagnant turns: Emit Diagnostic Query & Await Acknowledgment)
         │
         ▼
7. Loop to Next Branch until Decision Tree is Settled
         │
         ▼
8. Synthesize Specification & Commit to LOGICAL_LEDGER.md
```

### Step 0: Mandatory Interpretation Gate (`/add-logic`)
Before mapping decision tree branches, ensure the baseline topic is formulated in `LOGICAL_LEDGER.md`.
- **If unformulated**: Execute `/add-logic [topic]`. Decompose premises and proposed conclusion, confirm baseline with user verbatim, and commit as `FORMULATED`.
- **Deterministic Validation**: Run `node scripts/grill-state.mjs validate-nesy --payload '<JSON>'`. Only proceed to the interview if structurally `valid`.

### Step 1: Initialize Session (S_U0_INIT)
Run the state engine with the design topic:
```bash
node scripts/grill-state.mjs init --machine human --input "<topic>"
```
- **If exit code is non-zero (e.g. `INPUT_GATE_HALT`)**: Stop immediately. Output the diagnostic block.
- **If exit code is 0**: Proceed to Step 2. State transitions to `S_U1_PREMISE_ISOLATION`.

### Step 2: Map the Decision Tree
Identify the foundational architectural dependencies. Order them so prerequisites come first:
- *Example (Database Migration)*:
  - Branch 1: Tenancy Model (Shared DB vs. Schema vs. Database per Tenant)
  - Branch 2: Persistence Engine (PostgreSQL vs. SQLite vs. Managed Cloud)
  - Branch 3: Cache Strategy (In-memory vs. Redis vs. Read-through)

### Step 3: Prompt Human via `ask_question` (Strict Yield)
Formulate exactly ONE decision. Invoke `ask_question`:
- **Format**:
  - `question`: Clear, technical description of the trade-off.
  - `options`: List of 2–4 concrete architectural choices. Prefix your recommended choice with `(Recommended)`.
  - Format choices as direct user responses (e.g., *"Use shared database with tenant_id row isolation"*).
- **MANDATORY INVARIANT**: **End your turn immediately after the tool call.** Do not output post-question conversational filler.

### Step 4: Record User Turn & Evaluate $S_{\text{human}}$
When the user submits their answer:
```bash
node scripts/grill-state.mjs record-user-turn --new-prop <true|false> --choice "<user_selection>"
```
- Set `--new-prop true` if the user introduced a new SLA, compliance requirement, operational constraint, or technical rationale.
- Set `--new-prop false` if the user merely selected an option or reasserted a previous stance.

**Handling Stagnation Alert (`HUMAN_STAGNATION_ALERT`)**:
If the engine reports that stagnant turns $\ge 3$:
1. Emit the diagnostic challenge:
   > *"You have maintained this position across 3 rounds without introducing new constraints or evidence. Do you accept this operational trade-off regarding [X], or would you like to address the open counter-evidence?"*
2. Once the user replies, run:
   ```bash
   node scripts/grill-state.mjs record-diagnostic-ack
   ```
   Per $W_{\text{human}} = 1.0$, the human's decision is sovereign and unblocks the next branch.

### Step 5: Synthesize Specification & Commit Ledger
Once all branches are settled:
1. Output the synthesized architectural specification to the developer.
2. Commit the confirmed invariants to `LOGICAL_LEDGER.md`:
```bash
node scripts/grill-state.mjs commit --status SUPPORTED --rule "Confirmed invariants: [Branch 1 resolution], [Branch 2 resolution]"
```
3. Pass the verified architecture to procedural implementation planning.
