# ADR-0003: Pure Negative-Constraint Falsification, Falsified Boundary Normalization, and Anti-Prescriptive Firewall Invariant

- **Status:** Accepted
- **Date:** 2026-09-17
- **Context:** Epistemic Truth-Maintenance, Demarcation Problem, and Developer Interface Contracts

---

## 1. Context & Problem Statement

Grill-Logic enforces truth-maintenance and epistemic gatekeeping for AI coding agents based on Popperian falsification:
$$\neg \text{Permitted}(X) \iff X \in \mathcal{F}_{\text{falsified}}$$

A developer or agent is free to propose any implementation in the infinite architectural solution space, provided it does not collide with empirically refuted failure modes recorded in `LOGICAL_LEDGER.md`.

### A. The Schema Contamination Hazard & The Polarity Trap
In early iterations of the dynamic cosine similarity firewall, the ledger scanner constructed its rejection vector from the entire content of the ledger row:
$$\text{Vector\ Target} = \text{Clean}(C_{\text{rejected}}) \oplus \text{Clean}(\text{Premises}) \oplus \text{Clean}(R_{\mathit{contrastive\_rule}})$$

Because contrastive refutation rules in Column 6 provide human-readable guidance containing both the prohibited path and the recommended pivot (e.g. *"DO NOT mount SQLite over NFS. MANDATED ALTERNATIVE: Use a client-server PostgreSQL database"*), the target vector literally indexed the token `"PostgreSQL"`.

When an engineer subsequently proposed the sound, recommended architecture (*"Deploy PostgreSQL for shared multi-tenant database"*), bag-of-words / sublinear TF cosine similarity computed a false-positive collision against the REJECTED row.

### B. The 4 Fatal Epistemic Distortions of Heuristic "Alternative Extraction"
To prevent false-positive collisions, the engine introduced "alternative extraction" with polarity math ($\text{Score}_{\text{alt}}$ vs. $\text{Score}_{\text{reject}}$). This reactive patch introduced four catastrophic epistemic distortions:

1. **The Monopoly / "Hall Pass" Prescriptive Gate**:
   The engine only excused proposals matching its *specific* recorded alternative. If the ledger advised `"Use PostgreSQL"`, and an engineer proposed **CockroachDB**, **DuckDB**, or **local NVMe storage**, the engine offered no $\text{Score}_{\text{alt}}$ passkey, creating an authoritarian vendor monopoly that violates negative-constraint epistemology.
2. **The Composite Proposal Trojan Horse**:
   An adversarial or careless agent could propose: *"Use PostgreSQL with row-level security and also mount SQLite with WAL mode over NFS"*. Because the proposal mentioned PostgreSQL, $\text{Score}_{\text{alt}} \ge 0.5$ evaluated to `true`, excusing a fatal invariant violation and bypassing the firewall.
3. **Re-emergence of Static Regex Fragility**:
   Extracting alternatives required parsing `MANDATED ALTERNATIVE:`, `Derived Action:`, and `<br>` delimiters via regular expressions. Natural language occurrences of the word `"alternative:"` in audit prose truncated rules and produced fail-open vulnerabilities.
4. **Pseudo-Math Rigor Theater**:
   Arbitrary float thresholds (`scoreAlt >= 0.5 || scoreAlt >= scoreReject && scoreAlt > 0.1`) attempted to simulate polarity comprehension in continuous token space, violating ADR-0002.

### C. The $C_{\text{rejected}}$ Granularity Dilemma
Merely vectorizing `conclusionRaw` in isolation creates an inverse dilemma:
- **Terse Conclusions (Overbroad Blocks)**: If a refuted proposal's conclusion was recorded simply as `"Deploy SQLite"`, vectorizing only the conclusion blocks all valid SQLite deployments (e.g. local CLI caches).
- **Goal-Oriented Conclusions (Evasions)**: If a conclusion was recorded as `"Improve distributed session persistence"` (with premise `"Use Redis Streams without fsync"`), vectorizing only the conclusion fails to block the fatal Redis Streams pattern while blocking all other session persistence efforts.

---

## 2. Architectural Decisions

### Decision 1: Pure Negative-Constraint Falsification via Falsified Boundary Normalization

We permanently deprecate heuristic alternative extraction, polarity math (`scoreAlt`, `contAlt`, `adoptsAlternative`), and delimiter passkey parsing.

The negative-constraint firewall vectorizes **strictly the conjunction of the candidate conclusion and the clean prohibited boundary**:
$$\text{Target\ Space\ } \mathcal{T}_k = \text{Clean}(C_{\text{rejected}}) \cup \text{Clean}(R_{\mathit{refute\_boundary}})$$

Where $R_{\mathit{refute\_boundary}}$ is extracted by stripping all advisory alternative clauses (`MANDATED ALTERNATIVE:`, `Derived Action:`, `Alternative:`) from the rule cell:

```javascript
const cleanRuleBoundary = ruleCellRaw
  .replace(/(?:<br>|\n|\s+)(?:\*\*)?(?:mandated alternative|derived action|alternative)(?:\*\*)?:.+$/i, '')
  .replace(/<br>/gi, ' ')
  .replace(/[*_]/g, '')
  .replace(/^(?:\*\*)?(?:contrastive refutation rule|contrastive rule)(?:\*\*)?:\s*/gi, '')
  .trim();

const targetText = `${conclusionRaw} ${cleanRuleBoundary}`.trim();
const targetVec = vectorize(targetText, allowlist);
```

#### Formal Invariant Solver Operator:
An architectural proposal $Q$ violates epistemic constraints if and only if:
$$\text{Violation}(Q) \iff \exists R_k \in \mathcal{L}_{\text{rejected}} \text{ s.t. } \text{Score}_{\text{reject}}(V_Q, V_{\mathcal{T}_k}) \ge \tau_{\text{firewall}}$$

Where:
- $\tau_{\text{firewall}} = 0.30$ (calibrated for normalized boundary vectors).
- $\text{Score}_{\text{reject}} = \begin{cases} \max(\text{CosineSim}, \text{Containment}) & \text{if } \text{CosineSim} \ge 0.15 \land N_{\text{matched}} \ge 2 \\ \text{CosineSim} & \text{otherwise} \end{cases}$

Because $\mathcal{T}_k$ contains zero positive alternative tokens:
1. **Clean Alternatives Pass Cleanly**: A proposal for `"PostgreSQL"`, `"CockroachDB"`, or `"NVMe"` shares $0.000$ similarity with $\mathcal{T}_k$ and passes instantly.
2. **The Composite Trojan Horse is Closed**: Any proposal attempting the prohibited pattern fails closed, regardless of whether it also mentions the alternative.

---

### Decision 2: Schema Parity Across Genesis and Ledger Invariants

Built-in Genesis System Invariants (`GENESIS_SYSTEM_INVARIANTS`) and dynamic ledger rows in `LOGICAL_LEDGER.md` follow the exact same target representation:
$$\mathcal{T}_{\text{genesis}} = \text{sys.conclusion} \cup \text{sys.refuted}$$
$$\mathcal{T}_{\text{ledger}} = C_{\text{rejected}} \cup R_{\mathit{refute\_boundary}}$$

Neither target vector ever includes `sys.alternative` or `mandated_alternative`.

---

### Decision 3: Demarcation of Contrastive Rules as Contextual Advisory Syntheses ($C'$)

Under Popperian falsification, an empirical tool probe can only prove that architecture $X$ fails under boundary $B$; it **cannot prove** that recommended alternative $Y$ is universally optimal across all future contexts.

Therefore:
- Contrastive rules and mandated alternatives are classified strictly as **Contextual Advisory Syntheses ($C'$)**.
- They are stored in `LOGICAL_LEDGER.md` and emitted in CLI diagnostics as **"Recommended Synthesis Paths to Explore"** for human and agent reasoning.
- They are **never** utilized as algorithmic passkeys or positive constraints in mathematical gates.

---

### Decision 4: The Zero-Flag User Contract & Autonomous Deduplication Policy

Human developers must never be prompted or expected to supply CLI flags (`--allow-duplicate`, `--arg-id`, `--proposal`, `--prompt`, `--input`). The human interface consists entirely of natural language and simple slash commands (`/add-logic [idea]`, `/self-grill [proposal]`, `/grill-logic [topic]`).

The agent harness and subagents inspect diagnostic exit codes and handle state transitions programmatically:

#### A. Interactive Human HITL Mode (`/add-logic`, `/grill-logic`):
When the state engine returns `POTENTIAL_DUPLICATE_FLAG` (exit code 1), the LLM converses with the user in plain software engineering terms. Non-binary user responses map deterministically to programmatic commands:
- **"Update / Refine / Replace"** $\implies$ Agent re-runs `add-logic --arg-id ARG-XX`.
- **"Why / What is ARG-XX?"** $\implies$ Agent reads and displays the existing row from `LOGICAL_LEDGER.md` without mutating state.
- **"Proceed / Distinct / New"** $\implies$ Agent re-runs `add-logic --allow-duplicate true`.

#### B. Autonomous DMAD Mode (`/self-grill`):
In hands-free autonomous execution (`--machine autonomous`), the engine must never halt or deadlock waiting for user input. The state engine enforces an **Autonomous Deduplication Policy**:
- If similarity against an existing argument $> 0.85$: the engine automatically updates the argument in-place (`--arg-id ARG-XX`).
- If similarity is $0.50 \le \text{sim} \le 0.85$: the engine automatically proceeds as a distinct variant by passing `--allow-duplicate true` with a disambiguated title (e.g. `[Variant B]`).

#### C. Intent-Preserving Refactoring Guidance:
If a proposal describes decommissioning or replacing a legacy system (e.g., *"Migrate away from SQLite over NFS to PostgreSQL"*), the LLM in Step 0 isolates the destination architecture as $C$, ensuring that legacy mentions do not trigger false-positive negative constraint violations.

---

### Decision 5: Deterministic Exit Code & Diagnostic Taxonomy

The state engine enforces deterministic exit codes across all commands:
- **`0`**: `SUCCESS` / `PASS`. Clean execution, gates cleared, or sign-off completed.
- **`1`**: `EPISTEMIC_VIOLATION`. Invariant violation, negative constraint collision (`EPISTEMIC_FIREWALL_VIOLATION`), solver contradiction (`INVARIANT_SOLVER_VIOLATION`), or deduplication halt (`POTENTIAL_DUPLICATE_FLAG`).
- **`2`**: `SYNTAX_GATE_HALT`. Missing required arguments (`INPUT_GATE_HALT`), non-existent argument ID (`ARGUMENT_NOT_FOUND`), or invalid session token (`DISPATCH_TOKEN_MISMATCH`).

---

## 3. Canonical State Machine Mapping

The zero-flag conversational interface maps directly to canonical state identifiers:

```
+──────────────────────────────────────────────────────────────────────────+
|                       CANONICAL EPISTEMIC LIFECYCLE                      |
|                                                                          |
|  [ S_U0A_PREFLIGHT_CHECK ]  ──> check-gate --proposal "<text>"          |
|             │                                                            |
|             ▼ (Pass)                                                     |
|  [ S_U0B_ADD_LOGIC ]        ──> add-logic --prompt "<text>"              |
|             │                                                            |
|             ├─ Near-Duplicate ──> [ S_U0C_DEDUP_RESOLUTION ]             |
|             │                           │                                |
|             │                           ├─ Human: Natural Language       |
|             │                           └─ Autonomous: Auto-Policy       |
|             ▼ (Unique / Resolved)                                        |
|  [ S_U1_PREMISE_ISOLATION ] ──> FORMULATED baseline registered           |
|             │                                                            |
|             ▼                                                            |
|  [ S_U1B_VALIDATION ]       ──> validate-nesy deterministic solver       |
|             │                                                            |
|             ▼                                                            |
|     Mode A (/grill-logic)        Mode B (/self-grill)                    |
|     S_U2_CHALLENGE               S_A1_TOKEN_ISSUE                        |
|     S_U3_AWAIT_USER              S_A2_SPAWN_CHALLENGER (W=0.8)           |
|     S_U4_EVAL_COUNTER            S_A3_ROUND_1_CHALLENGE (0% Sol)         |
|     S_U6_CONCORDANCE             S_A4_ROUND_2_PROPOSER_CONFRONTATION     |
|     S_U7_SOLUTION_TRIAD          S_A5_SUBAGENT_EVAL                      |
|     S_U8_TERMINATION             S_A7_CONCORDANCE_SIGN_OFF               |
+──────────────────────────────────────────────────────────────────────────+
```

---

## 4. Consequences

### Positive
- **Zero Prescriptive Bias**: The engine never forces a specific tool or architecture; the developer is sovereign over all sound alternatives.
- **Elimination of Composite Bypass**: The Trojan horse is mechanically closed; no violation can be excused by mentioning the alternative.
- **Zero Regex Passkeys**: Eliminates brittle parsing of `MANDATED ALTERNATIVE:` in similarity gate paths.
- **Hands-Free Autonomous Execution**: `/self-grill` cannot deadlock on duplicate warnings.
- **Frictionless Developer Experience**: Human developers never manipulate CLI flags.

### Negative & Mitigations
- **Target Extraction Precision**: Requires refutation boundaries to be recorded without trailing alternative advice. Mitigated by `cleanRuleBoundary` normalization, which strips `MANDATED ALTERNATIVE:` and `Derived Action:` prefixes automatically during vector construction.
