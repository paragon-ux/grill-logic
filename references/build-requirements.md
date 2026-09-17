# Grill-Logic v2.2: Engineering Requirements Document (ERD)

**Document Version:** 2.2.0  
**Status:** Approved for Implementation & Production Release  
**Companion Documents:**  
- Architecture Whitepaper: [`references/grill-logic-whitepaper.md`](grill-logic-whitepaper.md)  
- Epistemic Registry Spec: [`references/logical-ledger-spec.md`](logical-ledger-spec.md)  
- Mandatory Stochastic Release Gate: [`references/adr/0001-live-stochastic-release-gate.md`](adr/0001-live-stochastic-release-gate.md)  
- Asymmetric CoT & Frontier-Depletion: [`references/adr/0002-asymmetric-cot-and-frontier-closure.md`](adr/0002-asymmetric-cot-and-frontier-closure.md)  
- Pure Negative Falsification & Firewall: [`references/adr/0003-negative-constraint-falsification-and-anti-prescriptive-firewall.md`](adr/0003-negative-constraint-falsification-and-anti-prescriptive-firewall.md)  

---

## 1. Purpose & Scope

This document specifies the concrete functional, behavioral, and verification requirements for **Grill-Logic v2.2**. It operationalizes the epistemic truth-maintenance principles defined in the Architecture Whitepaper—specifically the **Autonomy Weight ($W$)**, the **Skepticism Signal ($S$)**, the **Dynamic Neurosymbolic Epistemic Firewall (ADR-0003)**, the **Step 1 Interpretation Gate (`/add-logic`)**, the **Deterministic NeSy Invariant Solver**, the **90/10 Solution Gating Invariant**, the **Asymmetric CoT Topologies (ADR-0002)**, and the **Dual State Machines**—into production agent skills, continuous rules, standalone runtime engines, and test suites.

---

## 2. System Architecture & Component Breakdown

Grill-Logic v2.2 consists of six tightly integrated subsystems:

```
+-------------------------------------------------------------------------------+
| 1. PRE-FLIGHT NEGATIVE-CONSTRAINT FIREWALL (ADR-0003)                        |
|    - scripts/grill-state.mjs check-gate                                       |
|    - Sublinear TF + Word-Bigram Cosine Similarity (τ = 0.30, κ ≥ 0.65)        |
|    - Falsified Boundary Normalization: Target = Clean(C_rej) ∪ Clean(R_refute)|
|    - Pure Negative Falsification (Zero Prescriptive Bias / No Trojan Bypass)  |
|    - User Allowlist: .grill-logic/allowlist.json                              |
+-------------------------------------------------------------------------------+
                                    | (Exit Code 0: Clean)
                                    v
+-------------------------------------------------------------------------------+
| 2. STEP 1: INTERPRETATION GATE & DETERMINISTIC NESY SOLVER                    |
|    - skills/logic/add-logic/SKILL.md (Mandatory pre-challenge gate)           |
|    - Explicit premise isolation (P1..Pn) & candidate conclusion (C)           |
|    - Deterministic 5-way NeSy Solver (valid, malformed, inconsistent, etc.)   |
|    - Dynamic Deduplication (τ_dup = 0.50): In-place update vs disambiguation |
|    - Ledger baseline registration: Status = FORMULATED                        |
+-------------------------------------------------------------------------------+
                                    |
                    +---------------+---------------+
                    |                               |
                    v                               v
+---------------------------------------+ +-------------------------------------+
| 3. MODE A: HUMAN HITL ENGINE          | | 4. MODE B: AUTONOMOUS DMAD ENGINE   |
|    - skills/logic/grill-logic/SKILL.md| |    - skills/logic/self-grill/SKILL.md|
|    - Sequential decision tree walk    | |    - Fresh subagent dispatch (W=0.8)|
|    - Strict Turn Yield (ask_question) | |    - Session dispatch_token handshake|
|    - Behavioral S_human (R_reassert)  | |    - Empirical tool probes required  |
|    - Human Stagnation Alert (N ≥ 3)   | |    - Asymmetric CoT (Inversion/Synth)|
|    - Zero User Flags (Natural Lang)   | |    - Frontier-Depletion Closure (F=∅)|
+---------------------------------------+ +-------------------------------------+
                    |                               |
                    +---------------+---------------+
                                    |
                                    v
+-------------------------------------------------------------------------------+
| 5. CONTINUOUS MONITORING, PERSISTENCE & FAIL-CLOSED RUNTIME                   |
|    - .agents/rules/epistemic-gate.md (Continuous pre-flight hook)             |
|    - LOGICAL_LEDGER.md (Persistent truth registry & negative constraint store)|
|    - scripts/grill-state.mjs (.grill-logic/state.json runtime engine)         |
|    - Standardized fail-closed diagnostic blocks (Exit code 1 / 2)             |
+-------------------------------------------------------------------------------+
                                    |
                                    v
+-------------------------------------------------------------------------------+
| 6. EMPIRICAL VERIFICATION & TEST HARNESS                                      |
|    - scripts/test-epistemic-engine.mjs (169 mathematical & invariant tests)  |
|    - scripts/test-skills.mjs (100% byte-for-byte packaging parity suite)     |
|    - scripts/test-ledger.mjs & test-v2-protocol.mjs (Lifecycle & schema)     |
|    - Mandatory Live Stochastic Release Gate (ADR-0001) in-thread verification |
+-------------------------------------------------------------------------------+
```

---

### 3. Functional Requirements (FR)

### 3.1 FR-1: User Skill Entry & Command Routing
* **FR-1.1**: The system must provide three specialized, lightweight user-facing skills:
  - `/add-logic [proposal]`: Step 1 Interpretation Gate decomposing premises and candidate conclusions.
  - `/self-grill [proposal]`: Mode B Autonomous DMAD Epistemic Engine.
  - `/grill-logic [topic]`: Mode A Human HITL Sequential Interview.
* **FR-1.2 (Natural Language Invocation)**: Skills must parse natural user language without requiring synthetic CLI flags (e.g. no `--rounds`, no `--actor`).
* **FR-1.3 (Zero User Flags)**: Developers interact exclusively in natural language. Programmatic flags (`--arg-id`, `--allow-duplicate`, `--token`) are managed entirely by agent harnesses.

---

### 3.2 FR-2: Pre-Flight Dynamic Epistemic Firewall (ADR-0003)
* **FR-2.1 (Sublinear TF + Word-Bigram Cosine Model)**:
  - Text must be tokenized into unigrams ($\ge 2$ characters, preserving technical abbreviations like `DB`, `OS`, `IP`, `S3`, `NFS`) and contiguous word-bigrams (`token1_token2`).
  - Term weights must follow sublinear term frequency: $w_t = (1 + \ln(\text{count}_t)) \cdot \text{weight}_{\text{length}}(t)$.
  - Similarity must be computed via vector cosine angle: $\text{sim}(\vec{A}, \vec{B}) = \frac{\vec{A} \cdot \vec{B}}{\|\vec{A}\| \|\vec{B}\|}$.
* **FR-2.2 (Pure Negative-Constraint Falsification)**:
  - When scanning candidate proposals against `REJECTED` ledger entries, the target vector must be computed strictly over the normalized union of the falsified conclusion and clean refutation boundary: $\text{Target Space} = C_{\text{rejected}} \cup R_{\text{refute\_boundary}}$.
  - Mandated alternatives, derived actions, and prescriptive advice ($C'$) must be stripped from the target space prior to vectorization, mechanically preventing Trojan-horse composite bypasses and polarity traps.
* **FR-2.3 (Firewall Collision & Containment Gating)**:
  - If $\text{sim}(\vec{P}, \vec{T}) \ge \tau_{\text{firewall}}$ (default $\tau = 0.30$) or containment $\kappa(\vec{P}, \vec{T}) \ge 0.65$, `scripts/grill-state.mjs check-gate` must emit a collision flag, print a standardized diagnostic block, and exit with code 2.
* **FR-2.4 (User Allowlist)**:
  - The firewall must honor `.grill-logic/allowlist.json` containing user-specified `exempt_terms`, `exempt_rules`, and `threshold_overrides`. The engine itself must contain zero hardcoded stop words.

---

### 3.3 FR-3: Step 1 Interpretation Gate & NeSy Solver (`skills/logic/add-logic/SKILL.md`)
* **FR-3.1 (Mandatory Prerequisite)**: The interpretation gate must execute before any challenge exchange across both Mode A and Mode B.
* **FR-3.2 (Premise/Conclusion Decomposition)**: Decomposes prompt into stated premises ($P_1 \dots P_n$) and proposed conclusion ($C$). User corrections are accepted verbatim as baseline.
* **FR-3.3 (Deterministic 5-Way NeSy Solver)**:
  - Evaluates deductive form ($P \vdash C$) deterministically:
    - `valid`: Passes to state machine challenge.
    - `formally_invalid`: Explicit logical contradiction ($P \land \neg P$); auto-refutes without requiring empirical tool probes.
    - `malformed` / `inconsistent_premises`: Halts and routes back to `/add-logic` for baseline repair.
    - `undecidable`: Inconclusive form; passes forward requiring empirical tool probes.
* **FR-3.4 (Dynamic Deduplication Gate)**:
  - Vectorizes proposal against existing ledger rows ($\tau_{\text{dup}} = 0.50$).
  - Human mode: Emits `POTENTIAL_DUPLICATE_FLAG` if duplicate found.
  - Autonomous mode: Auto-updates in-place if $\text{sim} > 0.85$; auto-disambiguates if $0.50 \le \text{sim} \le 0.85$.

---

### 3.4 FR-4: State Machine 1: Autonomous DMAD Engine (`skills/logic/self-grill/SKILL.md`)
* **FR-4.1 (Subagent Instantiation & Virgin Context)**:
  - The main LLM must invoke a freshly spawned subagent using `invoke_subagent`.
  - The subagent operates with virgin context and a single loss function (*challenge correctness*), establishing $W_{\text{subagent}} = 0.8 > W_{\text{LLM}} = 0.2$.
* **FR-4.2 (Session Dispatch Token Handshake)**:
  - The engine generates a cryptographic session `dispatch_token`. The challenger subagent must supply this token to record audits or sign off.
* **FR-4.3 (Mandatory Empirical Tool Probes)**:
  - Every challenge round requires executing a real empirical probe (`run_command`, `grep_search`, `view_file`, or docs inspection). Pure text monologues are prohibited.
* **FR-4.4 (Asymmetric CoT Topologies - ADR-0002)**:
  - Challenger executes Backward Inversion CoT ($C \implies \neg P$).
  - Proposer executes Forward Constraint Synthesis CoT ($(P + \text{Bounds}) \implies C'$).
  - Strict 90/10 Invariant: Round 1 challenger must never offer solutions or recommendations (`➡️`).
* **FR-4.5 (Frontier-Depletion Closure)**:
  - Audits terminate when the epistemic frontier is empty ($\mathcal{F} = \emptyset$). Maximum 2 autonomous rounds before mandatory human escalation ($W_{\text{human}} = 1.0$).
* **FR-4.6 (Asymmetric Authority Guard)**:
  - $W_{\text{LLM}} = 0.2$ cannot override $W_{\text{subagent}} = 0.8$ rejection without empirical counter-probe evidence.

---

### 3.5 FR-5: State Machine 2: Human HITL Sequential Interview (`skills/logic/grill-logic/SKILL.md`)
* **FR-5.1 (Decision Tree Decomposition)**: Decomposes architectural topics into an ordered sequential decision tree.
* **FR-5.2 (Strict Turn Yield)**: The agent ingests topic $\to$ formulates a single clarifying trade-off $\to$ calls `ask_question` $\to$ **YIELDS TURN IMMEDIATELY**. Answering for the human is mechanically prohibited.
* **FR-5.3 (Behavioral $S_{\text{human}}$ Tracking)**:
  - Tracks the user reassertion ratio $R_{\text{reassert}} = N / (Y + \epsilon)$ based on whether new propositions are introduced.
  - If stagnant turns $N \ge 3$, raises `HUMAN_STAGNATION_ALERT` requiring transparent diagnostic acknowledgment, never overriding the human.
* **FR-5.4 (Concordance & Post-Concordance Solution Triad)**:
  - Upon convergence on conclusion $C$, presents exactly three solutions via `ask_question`:
    - Option 1: Minimal / Standard Library (Zero new dependencies).
    - Option 2: Robust / Standard Pattern (Production-grade).
    - Option 3: Distributed / Scale Pattern (High-scale).

---

### 3.6 FR-6: Continuous Epistemic Gate & Fail-Closed Runtime (`.agents/rules/epistemic-gate.md`)
* **FR-6.1 (Pre-Flight Execution Hook)**: Automatically scans proposals against `LOGICAL_LEDGER.md` via `scripts/grill-state.mjs check-gate` prior to plan creation or code generation.
* **FR-6.2 (Fail-Closed Barrier)**: Any invariant violation, probe omission, dispatch token mismatch, or active contrastive rule collision immediately halts execution with exit code 1 or 2 and sets `EXECUTION_BLOCKED`.
* **FR-6.3 (Prohibition of Code Generation)**: Code editing and implementation planning are strictly blocked on halted states.

---

### 3.7 FR-7: Logical Ledger Schema (`LOGICAL_LEDGER.md`)
* **FR-7.1**: Every completed audit updates `LOGICAL_LEDGER.md` in-place or appends a new entry.
* **FR-7.2**: Schema fields:
  - `Arg ID`: Unique sequential identifier (`ARG-01`, `ARG-02`).
  - `Premises (P)`: Stated premises and uncovered hidden assumptions.
  - `Proposed Conclusion (C)`: The proposed architectural decision.
  - `Status`: `FORMULATED`, `VALIDATING`, `SUPPORTED`, `REJECTED`, `UNCERTAIN`, or `SUPERSEDED`.
  - `Challenger & Evidence`: Challenger identity ($W$), empirical probe outputs, or benchmarks.
  - `Resulting Action / Contrastive Refutation Rule`: Permanent negative design rule ($R_{\text{refute\_boundary}}$) and advisory action ($C'$).

---

### 3.8 FR-8: Language & Presentation Rules
* **FR-8.1 (No Academic Logic Jargon)**: The agent must not emit mathematical turnstiles (`⊢`), propositional calculus syntax, or academic logic terms in user-facing prose.
* **FR-8.2 (Plain Engineering Terminology)**: Translate all formal concepts into software engineering language:
  - Premises $\to$ *"Assumptions & Constraints"*
  - Turnstile $\to$ *"Proposed Architecture"*
  - Contrastive Rule $\to$ *"Engineering Guideline / Anti-pattern Guardrail"*

---

## 4. Non-Functional Requirements (NFR)

* **NFR-1 (Zero External Dependencies)**: The runtime engine (`scripts/grill-state.mjs`) and test suites must run on Node.js 18+ standard library with zero external npm dependencies, native C++ extensions, or external vector databases.
* **NFR-2 (Harness Portability)**: Definitions and skills must be fully compliant across Antigravity (`.agents/`), Claude Code (`CLAUDE.md`), OpenAI Codex (`skills/*/openai.yaml`), Cursor, and Windsurf.
* **NFR-3 (Execution Performance)**: Pre-flight ledger similarity checks and NeSy validation must complete in $< 50$ milliseconds.
* **NFR-4 (Deterministic Tool Probing)**: Empirical premise verification must execute real tools (`run_command`, `grep_search`, `view_file`, or docs inspection) rather than generative approximations.

---

## 5. Verification & Acceptance Criteria

| Requirement ID | Verification Method | Acceptance Criteria |
| :--- | :--- | :--- |
| **FR-1 (Routing)** | Automated Test | `/add-logic`, `/self-grill`, and `/grill-logic` route to their dedicated state paths. |
| **FR-2 (Firewall Math)** | Mathematical Unit Tests | Sublinear TF, word-bigram cosine similarity ($\tau=0.30$), and containment ($\kappa \ge 0.65$) correctly block collisions and pass non-violating alternatives. |
| **FR-2 (Pure Falsification)** | Negative Constraint Test | Target space evaluation on $(C_{\text{rej}} \cup R_{\text{refute}})$ blocks forbidden boundaries while permitting recommended alternatives ($C'$). |
| **FR-3 (NeSy Solver)** | Deterministic Test Suite | 5-way taxonomy handles valid, malformed, inconsistent, and formally invalid ASTs; only `formally_invalid` auto-refutes without probes. |
| **FR-4 (Autonomous DMAD)** | Live In-Thread Trials | Subagent is spawned with virgin context ($W=0.8$); token handshake succeeds; real tool probe is executed; 90/10 invariant holds in Round 1. |
| **FR-5 (HITL Interview)** | Interactive Test | Agent calls `ask_question` and immediately yields turn. Behavioral stagnation tracking alerts after $N \ge 3$ repeated turns. |
| **FR-6 (Fail-Closed Gate)** | CLI Integration Test | Proposing a rejected premise triggers exit code 2 and outputs the standardized diagnostic block with zero code generated. |
| **FR-7 (Ledger Schema)** | Markdown Validator | `LOGICAL_LEDGER.md` maintains valid tabular schema and handles in-place row updates cleanly. |
| **NFR-1 (Zero Dependencies)** | Package Audit | `package.json` contains zero runtime dependencies. `node scripts/test-epistemic-engine.mjs` passes 169/169 tests. |

---

## 6. Implementation Traceability Matrix

| Component | Target File | Requirements Addressed |
| :--- | :--- | :--- |
| Mandatory Interpretation Gate | [`skills/logic/add-logic/SKILL.md`](../skills/logic/add-logic/SKILL.md) | FR-1.1, FR-3.1, FR-3.2, FR-3.3, FR-3.4, FR-8.1 |
| Autonomous DMAD Engine | [`skills/logic/self-grill/SKILL.md`](../skills/logic/self-grill/SKILL.md) | FR-1.1, FR-4.1 - FR-4.6, FR-8.1, NFR-4 |
| Human HITL Sequential Interview | [`skills/logic/grill-logic/SKILL.md`](../skills/logic/grill-logic/SKILL.md) | FR-1.1, FR-5.1 - FR-5.4, FR-8.1 |
| Epistemic State Engine & Solver | [`scripts/grill-state.mjs`](../scripts/grill-state.mjs) | FR-2.1 - FR-2.4, FR-3.3, FR-4.2, FR-6.2, NFR-1, NFR-3 |
| Continuous Epistemic Gate | [`.agents/rules/epistemic-gate.md`](../.agents/rules/epistemic-gate.md) | FR-6.1, FR-6.2, FR-6.3 |
| Subagent Challenger Spec | [`.agents/agents/grill_logic_challenger/agent.md`](../.agents/agents/grill_logic_challenger/agent.md) | FR-4.1, FR-4.2, FR-4.3, FR-4.4 |
| Automated Test Suites | [`scripts/test-epistemic-engine.mjs`](../scripts/test-epistemic-engine.mjs), [`scripts/test-skills.mjs`](../scripts/test-skills.mjs) | FR-2.1, FR-3.3, NFR-1, NFR-2 |
| Root Guidelines & Contracts | [`AGENTS.md`](../AGENTS.md), [`CLAUDE.md`](../CLAUDE.md) | FR-1.2, FR-1.3, FR-8.1, FR-8.2 |

