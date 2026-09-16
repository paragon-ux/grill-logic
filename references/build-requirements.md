# Grill-Logic v2: Engineering Requirements Document (ERD)

**Document Version:** 2.0.0  
**Status:** Approved for Implementation  
**Companion Documents:**  
- Architecture Whitepaper: [`references/grill-logic-whitepaper.md`](grill-logic-whitepaper.md)  
- Formal Spec: [`internal/revisions/Grill-Logic-Final-Spec.md`](../internal/revisions/Grill-Logic-Final-Spec.md)  
- Protocol Flows: [`internal/revisions/Grill-Logic-Proposal-v2.md`](../internal/revisions/Grill-Logic-Proposal-v2.md)  

---

## 1. Purpose & Scope

This document specifies the concrete functional, behavioral, and verification requirements for building **Grill-Logic v2**. It operationalizes the game-theoretic and epistemic principles defined in the Architecture Whitepaper—specifically the **Autonomy Weight ($W$)**, the **Skepticism Signal ($S$)**, the **90/10 Solution Gating Invariant**, and the **Dual State Machine**—into production agent skills, continuous rules, subagent definitions, and test suites.

---

## 2. System Architecture & Component Breakdown

Grill-Logic v2 consists of five tightly integrated subsystems:

```
+-------------------------------------------------------------------------------+
| 1. ENTRY & ROUTING SUBSYSTEM                                                  |
|    - skills/logic/grill-logic/SKILL.md (~40 line user-facing router)           |
|    - AGENTS.md & CLAUDE.md discovery hooks                                    |
+-------------------------------------------------------------------------------+
                                    |
                                    v
+-------------------------------------------------------------------------------+
| 2. DUAL STATE MACHINE TRUTH ENGINE                                            |
|    - skills/logic/epistemic-verifier/SKILL.md (Core Protocol Engine)          |
|    - Mode A: User Grill-Logic (Interactive Concordance Loop)                  |
|    - Mode B: Self-Grill (Autonomous Adversarial Epistemic Engine)             |
+-------------------------------------------------------------------------------+
          |                                                   |
          v                                                   v
+-----------------------------------+   +---------------------------------------+
| 3. ADVERSARIAL ORACLE SUBSYSTEM   |   | 4. CONTINUOUS MONITORING & STORAGE    |
|    - Fresh Subagent Dispatch      |   |    - .agents/rules/epistemic-gate.md  |
|    - Single Loss Function Config  |   |    - LOGICAL_LEDGER.md Schema         |
|    - Direct CoT Inspection (S_LLM)|   |    - Contrastive Refutation Engine    |
+-----------------------------------+   +---------------------------------------+
                                    |
                                    v
+-------------------------------------------------------------------------------+
| 5. VALIDATION & TEST HARNESS                                                  |
|    - scripts/test-skills.mjs & scripts/test-ledger.mjs                        |
|    - scripts/test-dogfood-remediation.mjs (5 failure regression tests)        |
+-------------------------------------------------------------------------------+
```

---

## 3. Functional Requirements (FR)

### 3.1 FR-1: Routing & Skill Entry (`skills/logic/grill-logic/SKILL.md`)

* **FR-1.1**: The entry skill must remain lightweight ($\le 60$ lines) and serve exclusively as the user-facing routing interface.
* **FR-1.2**: Natural Language Invocation: The skill must parse natural user language without requiring synthetic CLI flags (e.g., no `--rounds`, no `--actor`).
* **FR-1.3**: Mode Detection:
  * If the user prompt contains phrases such as `"self-grill"`, `"autonomously"`, `"afk"`, `"verify proposal"`, or is triggered pre-flight by the epistemic gate, route directly to **Mode B (Self-Grill)**.
  * If the user prompt contains phrases such as `"grill me"`, `"interview me"`, or presents an architectural design for collaborative review, route directly to **Mode A (User Grill-Logic)**.
  * If unstated, default to **Mode A** when interacting with a human prompt, and **Mode B** when invoked autonomously by an agent before code generation.
* **FR-1.4**: Proactive Delegation: The skill must immediately forward execution state to `skills/logic/epistemic-verifier/SKILL.md`.

---

### 3.2 FR-2: Dual State Machine Engine (`skills/logic/epistemic-verifier/SKILL.md`)

The core truth engine must implement the two state graphs specified in Section 5 of the Whitepaper with strict phase boundaries:

#### Mode A: User Grill-Logic (Interactive Loop)
* **FR-2.1 (Premise Extraction)**: On initial user prompt, extract explicit premises ($P_1..P_n$) and uncover hidden assumptions ($P_{\text{hidden}}$).
* **FR-2.2 (Challenge Emission)**: Challenge the weakest premises using empirical evidence, documentation lookups, and minimal code probes.
* **FR-2.3 (90/10 Invariant Enforcement)**: Under no circumstances may solutions, code implementations, or architecture recommendations be emitted during a challenge turn.
* **FR-2.4 (Behavioral $S_{\text{human}}$ Tracking)**:
  * For each user turn, record whether the user introduced a new proposition/constraint ($Y$) or repeated prior stances ($N$).
  * Maintain the reassertion ratio $R_{\text{reassert}} = N / (Y + \epsilon)$.
  * When $N \ge 3$ consecutive turns without new propositions, surface a transparent diagnostic question:
    > *"You have maintained this stance through 3 rounds without introducing new constraints. Do you want to engage the open trade-off on [X], or intentionally accept this operational risk and proceed?"*
  * $S_{\text{human}}$ is dampened by $W_{\text{human}}$ and must **never** lock out or override the user.
* **FR-2.5 (Concordance & Solution Triad)**:
  * Once the user and LLM converge on conclusion $C$, transition to State `S_U7`.
  * Present exactly three solutions plus a free response option via the harness interactive question interface (`ask_question`):
    - **Option 1**: Minimal / Standard Library (Zero new dependencies).
    - **Option 2**: Robust / Standard Pattern (Production-grade, moderate complexity).
    - **Option 3**: Advanced / Distributed Pattern (High-scale, higher operational complexity).
    - **Option 4**: Write-in / Hybrid (Free response).

#### Mode B: Self-Grill (Autonomous Adversarial Audit)
* **FR-2.6 (Subagent Instantiation & DMAD Cognitive Diversity)**:
  * The main LLM must invoke a freshly spawned subagent using `invoke_subagent`.
  * The subagent must inherit virgin context (zero conversational history) to guarantee $W_{\text{subagent}} > W_{\text{LLM}}$ (evidence-independence and dependence-clarity).
  * **Diverse Problem-Solving Strategies (DMAD Lineage, ICLR 2025)**: Rather than adopting a cosmetic persona (which leads to the Einstellung effect / fixed mental sets), the subagent must be instructed to employ distinct reasoning methods:
    1. *Backward Refutation*: Testing if a lower-complexity $C'$ satisfies the premises.
    2. *Empirical Probing*: Running deterministic tool/sandbox checks or doc lookups.
    3. *Premise Inversion*: Formulating explicit counter-hypotheses ($P_{\text{alt}} \vdash \neg C$).
  * The subagent handoff must mandate a singular loss function: *"Audit and challenge this proposal ruthlessly using diverse problem-solving strategies. Do not assist. Do not optimize for conversational harmony."*
* **FR-2.7 (Direct CoT Inspection & $S_{\text{LLM}}$ Einstellung Detection)**:
  * The subagent inspects the main LLM's reasoning trace and computes $S_{\text{LLM}}$:
    - `Risk Level`: `LOW` | `MODERATE` | `HIGH`
    - `Einstellung / Sycophancy Score`: Detection of fixed mental sets, unearned consensus, or self-rationalization.
    - `Suggested Skepticism`: Mandatory counter-hypotheses to test.
* **FR-2.8 (Full-Strength $S_{\text{LLM}}$ Application)**:
  * Because target $W_{\text{LLM}}$ is low, $S_{\text{LLM}}$ lands at full strength.
  * The main LLM must either produce verifiable counter-evidence or concede the challenged premise.
* **FR-2.9 (Decoupled Challenger-Credibility)**:
  * The main LLM counters the subagent at full strength. The subagent does not inherit human target-deference.
* **FR-2.10 (Autonomous Solution Validation & Sign-Off)**:
  * Post-convergence on conclusion $C$, the subagent generates the Solution Triad.
  * The main LLM selects an option or provides a free response.
  * If the LLM selects free-response, the subagent evaluates it against $S_{\text{LLM}}$ and must issue an explicit **SIGN-OFF** before results are surfaced to the human.

---

### 3.3 FR-3: Continuous Epistemic Gate (`.agents/rules/epistemic-gate.md`)

* **FR-3.1 (Trigger Sensitivity)**: Automatically activate whenever an architectural change is proposed:
  - Introducing a new database, queue, cache, or infrastructure component (e.g., Redis, Kafka, SQLite over NFS).
  - Modifying concurrency, tenancy, persistence, or network boundaries.
* **FR-3.2 (Ledger Inspection)**:
  - Check [`LOGICAL_LEDGER.md`](../LOGICAL_LEDGER.md) for existing entries.
  - If the proposal relies on a premise marked `REJECTED`, immediately halt execution, cite the corresponding **Contrastive Refutation Rule**, and refuse to generate implementation code.
* **FR-3.3 (Autonomous Gating)**:
  - Run Self-Grill before generating implementation plans or editing files.
  - Gate downstream execution: proceed to code editing **only** if the argument achieves `SUPPORTED` status in the ledger.

---

### 3.4 FR-4: Logical Ledger Specification & Schema (`LOGICAL_LEDGER.md`)

* **FR-4.1**: Every completed audit must append or update an entry in [`LOGICAL_LEDGER.md`](../LOGICAL_LEDGER.md).
* **FR-4.2**: Required Schema Fields:
  * `Argument ID`: Unique sequential identifier (`ARG-001`, `ARG-002`, etc.).
  * `Proposal`: Verbatim statement of the architectural proposal.
  * `Actor Dynamics`: Challenger $W$, Target $W$, Applied $S$ level.
  * `Turnstile`: Formal deconstruction $\{P_1..P_n, P_{\text{hidden}}\} \vdash C$.
  * `Status`: `SUPPORTED`, `REJECTED`, or `SUPERSEDED`.
  * `Empirical Evidence`: Concrete probe outputs, benchmarks, or documentation citations.
  * `Contrastive Refutation Rule`: A permanent negative design rule governing future turns.

---

### 3.5 FR-5: Language & Presentation Rules

* **FR-5.1 (No Academic Logic Jargon)**: The agent must not emit mathematical turnstiles (`⊢`), propositional calculus syntax ($P \implies Q$), or academic epistemological terms in user-facing dialogue.
* **FR-5.2 (Plain Engineering Terminology)**: Translate all formal concepts into plain software engineering terminology:
  - Premises $\to$ *"Assumptions & Stated Constraints"*
  - Turnstile $\to$ *"Proposed Architecture"*
  - $S_{\text{human}}$ $\to$ *"Observation on open trade-offs"*
  - Contrastive Rule $\to$ *"Engineering Guideline / Anti-pattern Guardrail"*

---

## 4. Non-Functional Requirements (NFR)

* **NFR-1 (Turn Efficiency & Convergence)**:
  - Mode A (User Grill-Logic) should converge within 2 to 4 interactive turns under ordinary circumstances.
  - Mode B (Self-Grill) must execute the subagent audit and converge within 1 to 2 subagent exchanges.
* **NFR-2 (Harness Portability)**:
  - The skill and rule definitions must be fully compliant with Antigravity (`.agents/`), Claude Code (`CLAUDE.md`), OpenAI Codex (`agents/openai.yaml`), and Cursor/Windsurf.
* **NFR-3 (Deterministic Tool Probing)**:
  - Empirical premise verification should favor fast (1-5 line) shell commands, file inspections, or official documentation lookups over generative speculation.

---

## 5. Verification & Acceptance Criteria

| Requirement ID | Verification Method | Acceptance Criteria |
| :--- | :--- | :--- |
| **FR-1 (Routing)** | Automated Test | Prompting with "self-grill" routes to autonomous subagent; "grill me" routes to interactive interview. |
| **FR-2 (90/10 Invariant)** | Automated & Negative Test | No code or implementation files are created or modified during challenge turns. |
| **FR-2 ($W$ and $S$ Mechanics)** | Unit Test & Transcript Audit | Subagent is spawned with virgin context ($W_{\text{subagent}} > W_{\text{LLM}}$); $S_{\text{LLM}}$ forces premise update; $S_{\text{human}}$ dampening prevents user lockout. |
| **FR-3 (Epistemic Gate)** | Regression Test | Proposing a rejected premise (e.g., Redis without profiling) is intercepted by the gate rule with zero code modified. |
| **FR-4 (Ledger Sync)** | Schema Validator | `LOGICAL_LEDGER.md` is updated with valid status, evidence, and Contrastive Refutation Rules. `npm test` passes cleanly. |
| **FR-5 (Jargon Filtering)** | Output Linter | User-facing responses contain zero unescaped `⊢` or formal turnstile strings. |

---

## 6. Implementation Traceability Matrix

| Component | Target File | Requirements Addressed |
| :--- | :--- | :--- |
| User Skill Entrypoint | [`skills/logic/grill-logic/SKILL.md`](../skills/logic/grill-logic/SKILL.md) | FR-1.1, FR-1.2, FR-1.3, FR-1.4, FR-5.1 |
| Epistemic Verifier Engine | [`skills/logic/epistemic-verifier/SKILL.md`](../skills/logic/epistemic-verifier/SKILL.md) | FR-2.1 - FR-2.10, NFR-1 |
| Continuous Epistemic Gate | [`.agents/rules/epistemic-gate.md`](../.agents/rules/epistemic-gate.md) | FR-3.1, FR-3.2, FR-3.3 |
| Subagent Challenger Spec | [`.agents/agents/grill_logic_challenger/agent.md`](../.agents/agents/grill_logic_challenger/agent.md) | FR-2.6, FR-2.7, FR-2.8, FR-2.9 |
| Automated Test Suites | [`scripts/test-skills.mjs`](../scripts/test-skills.mjs), [`scripts/test-ledger.mjs`](../scripts/test-ledger.mjs) | FR-4.1, FR-4.2, NFR-2 |
| Root Guidelines | [`AGENTS.md`](../AGENTS.md), [`CLAUDE.md`](../CLAUDE.md) | FR-1.2, FR-5.1, NFR-2 |
