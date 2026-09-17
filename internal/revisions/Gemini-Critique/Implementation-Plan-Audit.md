Searched for files: *adr*
Listed directory adr
Searched for files: *implementation_plan*.md
Viewed implementation_plan.md:1-127
Searched for "0003"
Searched for "ADR-0003"
Searched for "0003"
Searched for "0003"
Viewed implementation_plan.md:115-140
Listed directory 0f3b7e15-5f6a-4d89-89f9-97b4e735ae01
Viewed decision-tree-summary.md:1-121
Viewed walkthrough.md:1-87
Viewed transcript.jsonl:120-630
Viewed transcript.jsonl:600-630
Searched for ""step_index":606"
Searched for "Review the proposed implementation plan"
Listed directory logs
Viewed transcript_full.jsonl:600-640
Viewed 0002-asymmetric-cot-and-frontier-closure.md:1-100
Viewed LOGICAL_LEDGER.md:1-13
Viewed grill-state.mjs:360-450
Viewed SKILL.md:1-80
Viewed SKILL.md:1-60
Viewed SKILL.md:1-60
Viewed grill-state.mjs:290-330
Viewed grill-state.mjs:1080-1120
Viewed grill-state.mjs:500-540
Viewed grill-state.mjs:540-565
Viewed grill-state.mjs:120-160
Searched for "function parseArgs"
Searched for "parseArgs"
Viewed grill-state.mjs:1650-1716
Searched for "parseArgs"
Searched for "parse"
Viewed grill-state.mjs:1600-1655
Viewed grill-state.mjs:1590-1605

# Architectural Review: Proposed ADR-0003 Implementation Plan & Epistemic Invariant Specifications

**Target Document**: `Implementation Plan: ADR-0003, Pure Negative-Constraint Falsification, Zero-Flag UX, and Epistemic Engine Parity` ([`conversation: 0f3b7e15`](file:///C:/Users/USER/.gemini/antigravity/brain/0f3b7e15-5f6a-4d89-89f9-97b4e735ae01/implementation_plan.md))  
**Target Architecture**: ADR-0003 Draft (`0003-negative-constraint-falsification-and-anti-prescriptive-firewall.md`)  
**Audit Context**: Independent Systems, Adversarial, and UX Audits across [Whitepaper v2.2.0](file:///c:/Users/USER/Desktop/Frameworks/grill-logic/references/grill-logic-whitepaper.md), [Logical Ledger Spec v1.1.0](file:///c:/Users/USER/Desktop/Frameworks/grill-logic/references/logical-ledger-spec.md), [ADR-0001](file:///c:/Users/USER/Desktop/Frameworks/grill-logic/references/adr/0001-live-stochastic-release-gate.md), and [ADR-0002](file:///c:/Users/USER/Desktop/Frameworks/grill-logic/references/adr/0002-asymmetric-cot-and-frontier-closure.md).

---

## Executive Summary & High-Level Verdict

The core philosophical shift proposed in the implementation plan—**abandoning heuristic alternative extraction and polarity scoring in favor of pure Popperian negative-constraint falsification ($C_{\text{rejected}}$ isolation) alongside a Zero-Flag User Contract**—is conceptually sound and directly eliminates the Trojan horse bypass (`scoreAlt >= 0.5`) discovered in the adversarial audit.

However, a rigorous systems and epistemic analysis reveals **6 major architectural gaps**, **5 critical specification ambiguities**, and **4 unaddressed operational failure modes**. If implemented as currently drafted, the plan will cause **high false-positive firewall locks on legitimate proposals, fatal deadlocks in autonomous execution (`/self-grill`), and persistent runtime edge-case crashes**.

Below is the exhaustive breakdown of what is missing, ambiguous, and architecturally incomplete.

---

## 1. Ambiguities in Pure Negative-Constraint Falsification & ADR-0003

### A. The $C_{\text{rejected}}$ Granularity Dilemma & Missing "Falsified Boundary Normalization"
* **The Plan Statement**: *"For `REJECTED` rows, vectorize strictly `conclusionRaw` ($C_{\text{rejected}}$)."*
* **The Critical Ambiguity**: Free-form conclusion entries in [`LOGICAL_LEDGER.md`](file:///c:/Users/USER/Desktop/Frameworks/grill-logic/LOGICAL_LEDGER.md#L9) have no standardized semantic granularity. This creates an immediate dual-failure trap:
  1. **The Overbroad / Terse Conclusion Trap (High False Positives)**:
     - If a developer originally submitted: *"Deploy SQLite"* with premise *"P: Mount over multi-node NFS volume"*, and the row was marked `REJECTED`.
     - If the firewall vectorizes strictly `conclusionRaw` (`"Deploy SQLite"`), it will subsequently **block any valid SQLite deployment in the project** (e.g., local single-writer cache, embedded CLI config store), even when no NFS volume is involved.
  2. **The Goal-Oriented Conclusion Trap (Catastrophic False Negatives)**:
     - If a developer submitted: *"Improve distributed session persistence"* with premise *"P: Use Redis Streams without fsync"*, and it was marked `REJECTED`.
     - Vectorizing strictly `conclusionRaw` (`"Improve distributed session persistence"`) means a subsequent proposal explicitly attempting *"Use Redis Streams without fsync"* **evades the firewall completely** (false negative), while any valid attempt to improve session persistence is blocked (false positive).
* **What is Missing**: The plan lacks a specification for **Falsified Boundary Normalization**. ADR-0003 must define how a rejected argument is committed:
  - Either the ledger's proposed conclusion column must be normalized upon rejection to represent the **falsified concrete proposition** ($C_{\text{falsified}} = P_{\text{fatal}} \land C$), or
  - The vectorizer must vectorize the **conjunction of the conclusion and the specific falsified premise** ($C_{\text{rejected}} \cup P_{\text{falsified}}$), strictly omitting non-falsified baseline premises and positive alternatives.

---

### B. Schema Asymmetry Between Ledger Rows and Genesis System Invariants
* **The Plan Statement**: 
  - *"For `REJECTED` rows, vectorize strictly `conclusionRaw` ($C_{\text{rejected}}$)."*
  - *"For `GENESIS_SYSTEM_INVARIANTS`, vectorize strictly `sys.conclusion` and `sys.refuted`."*
* **The Architecture Conflict**: Why do built-in genesis system invariants check both `conclusion` and `refuted`, while active ledger entries only check `conclusion`?
  - In `LOGICAL_LEDGER.md`, Column 6 is titled: `Resulting Action / Contrastive Refutation Rule`.
  - When an adversarial subagent refutes an architecture, the subagent explicitly formulates the prohibited boundary in Column 6 (e.g., *"DO NOT deploy SQLite over NFS or distributed network filesystems"*).
  - By restricting ledger vectorization to `conclusionRaw` only, the plan **discards the exact synthesized refutation rule formulated during the audit**.
* **What is Missing**: ADR-0003 must establish **schema parity** across genesis and user invariants:
  $$\text{Target Space} = \text{Clean}(C_{\text{rejected}}) \cup \text{Clean}(R_{\text{refute\_boundary}})$$
  Only explanatory/advisory alternatives ($C_{\text{alt}}$) should be excluded from the mathematical vector.

---

### C. Target Sparsity Shift & Uncalibrated Threshold ($\tau_{\text{firewall}}$)
* **The Plan Statement**: *"Collision check simplifies to: `scoreReject >= tauFirewall`."*
* **The Mathematical Ambiguity**:
  - In the previous engine, `refutedText` was a 40–60 word composite string (conclusion + premises + rule). At that length, vector norms were large ($\|V\| \approx 5.0 - 7.0$), keeping unigram overlap similarity modest.
  - When $C_{\text{rejected}}$ is isolated to a 3–6 word phrase (e.g., `"Deploy SQLite over NFS"`), target vector length drops radically ($\|V\| \approx 2.0$).
  - In short vectors, two sentences sharing two generic technical unigrams (e.g. `deploy` and `network`) can easily yield cosine similarity $> 0.30$.
  - At $\tau_{\text{firewall}} = 0.25$, **unrelated architectural proposals sharing common engineering vocabulary will trigger false-positive firewall violations**.
* **Missing Composition of `scoreReject`**:
  - Does `scoreReject` still compute `Math.max(cosineSim, containment)`?
  - If `computeContainment` is retained without an alternative passkey, any proposal containing the target words as a subset achieves `containment = 1.0` and immediately halts execution. If containment is dropped, short queries against slightly longer refutations drop below threshold.
* **What is Missing**: ADR-0003 must provide an **explicit mathematical specification** for `scoreReject`:
  - Recalibrate $\tau_{\text{firewall}}$ (e.g., $\tau = 0.35$ for short isolated strings, or apply sublinear length-penalty scaling).
  - Explicitly define whether directional containment is disabled, clamped, or gated by a minimum unigram overlap floor ($N \ge 2$).

---

### D. Formal Epistemic Demarcation of Contrastive Rules
* **The Plan Statement**: *"Contrastive Rules as Diagnostic Output: Mandated alternatives and contrastive rules remain in the ledger and diagnostics as explanatory guidance for humans/agents, but are never fed as positive passkeys into the mathematical similarity gate."*
* **What is Missing**: ADR-0003 fails to formalize the **epistemic status** of contrastive advice under Popperian falsification:
  - In pure negative-constraint falsification, an empirical probe can only prove a negative (that Architecture $X$ fails under Condition $Y$). It **cannot prove** that Mandated Alternative $Y$ is universally sound.
  - Therefore, ADR-0003 must explicitly define contrastive rules as **Contextual Advisory Syntheses ($C'$)**, not verified physical laws. When emitted in diagnostics, they are labeled as *"Recommended Synthesis Paths to Explore"*, ensuring neither the LLM nor human treats them as dogmatic or pre-approved passes.

---

## 2. Missing Specifications in the Zero-Flag User Contract

```
+---------------------------------------------------------------------------------------------------+
|                                  THE ZERO-FLAG INTERACTION GAP                                    |
|                                                                                                   |
|  [ Human HITL Mode (/grill-logic) ]             [ Autonomous DMAD Mode (/self-grill) ]            |
|  POTENTIAL_DUPLICATE_FLAG                       POTENTIAL_DUPLICATE_FLAG                          |
|         │                                              │                                          |
|         ▼                                              ▼                                          |
|  LLM asks: "Refine or New?"                     NO HUMAN IN THE LOOP!                             |
|  Human replies in natural language              Plan is SILENT:                                   |
|  ──> Works as designed                          ──> Halts? Deadlocks? Fails release gate?         |
+---------------------------------------------------------------------------------------------------+
```

### A. Autonomous Mode (`/self-grill`) Deadlock on `POTENTIAL_DUPLICATE_FLAG`
* **The Plan Statement**: 
  *"If `POTENTIAL_DUPLICATE_FLAG` is returned, the LLM presents an intuitive conversational choice: 'Would you like to refine that existing argument in-place, or treat this as a distinct new proposal?'"*
* **The Critical Flaw**: This flow works seamlessly in interactive Human HITL mode (`/grill-logic` or `/add-logic`), but **completely breaks in Autonomous Mode (`/self-grill [proposal]`)**.
  - `/self-grill` is defined across Whitepaper v2.2.0 and ADR-0001 as a **hands-free autonomous audit engine** driven by subagents and tool probes without human blocking.
  - If `/self-grill` encounters `POTENTIAL_DUPLICATE_FLAG` during Step 0 (`add-logic`):
    - If the LLM yields to ask the user, the autonomous run fails its hands-free contract.
    - If the state engine fails closed, the stochastic trials required by ADR-0001 cannot execute automated retries or multi-proposal audits.
* **What is Missing**: An explicit **Autonomous Deduplication Policy**:
  - If `active_machine === 'AUTONOMOUS_DMAD'`:
    1. If `input_text` or `conclusion` matches an existing `ARG-ID` with similarity $> 0.85$, the engine must automatically update that argument in-place (`--arg-id ARG-XX`).
    2. If similarity is between $0.50$ and $0.85$, the autonomous engine must auto-resolve as a distinct proposal by internally passing `--allow-duplicate true` while appending an autogenerated disambiguation tag (e.g. `[Variant B]`).

---

### B. The "Refactor / Deprecate" Collision Trap (Legitimate Negative Mentions)
* **The Problem**: Under pure negative-constraint falsification, any proposal whose text matches a prohibited concept ($C_{\text{rejected}}$) triggers `EPISTEMIC_FIREWALL_VIOLATION`.
* **The Failure Scenario**:
  - Suppose `ARG-01` rejected `Deploy SQLite over NFS`.
  - A developer now submits a legitimate migration proposal:
    *"Decommission and remove SQLite over NFS, migrating all session storage to Redis Cluster."*
  - Because the proposal contains the tokens `"SQLite over NFS"`, the pure negative-constraint firewall **blocks the migration proposal with exit code 1**.
* **What is Missing**:
  - Under the "Zero-Flag Contract", developers cannot be told to manually edit `.grill-logic/allowlist.json`.
  - ADR-0003 and the skill specifications lack an **Intent-Preserving Exemption Protocol**:
    - When a pre-flight firewall violation occurs on a proposal containing migration/deprecation keywords (`decommission`, `replace`, `remove`, `migrate away from`), the LLM in Step 0 must automatically detect refactoring intent and either:
      1. Reformulate the premise/conclusion to isolate the target architecture (`"Deploy Redis Cluster to replace legacy storage"`), or
      2. Programmatically invoke `.grill-logic/allowlist.json` exemptions on behalf of the developer.

---

### C. Non-Binary Human Input & Conversational State Machine
* **The Ambiguity**: In interactive `/add-logic`, the LLM asks: *"Would you like to refine that existing argument in-place, or treat this as a distinct new proposal?"*
* **The Gap**: Human users frequently respond outside the binary choices:
  - *"Neither, let's discard the old one and start fresh."*
  - *"Why is that a duplicate? What was ARG-01?"*
  - *"Just run the audit on this anyway."*
* **What is Missing**: The skill specification lacks a deterministic decision table mapping non-binary user responses to state machine actions:
  - *"Discard/Replace"* $\to$ Run `scripts/grill-state.mjs add-logic --arg-id ARG-XX` (overwrites in-place).
  - *"Why/Inspect"* $\to$ Read and display `ARG-XX` from `LOGICAL_LEDGER.md` without changing state, then re-prompt.
  - *"Ignore/Proceed"* $\to$ Run `scripts/grill-state.mjs add-logic --allow-duplicate true`.

---

## 3. Omitted Audit Findings & Technical Edge Cases

The implementation plan only partially captures the concrete defects surfaced by the 3 independent subagent audits. The following critical bugs were omitted from Component 2:

| Component / Function | Unaddressed Defect | Operational Failure Mode | Required Resolution in Plan |
| :--- | :--- | :--- | :--- |
| **`cmdAddLogic` / `cmdCommit` In-Place Regex** | `argId` regex lacks the case-insensitive `/i` flag. | Passing `--arg-id arg-01` against table row `**ARG-01**` fails regex match, causing row duplication and ledger corruption. | Construct `new RegExp(..., 'gi')`. |
| **`cmdAddLogic` Non-Existent `--arg-id`** | Passing an ID not present in the ledger (e.g. `--arg-id ARG-99`). | Silently appends `| **ARG-99** | ...`, breaking sequential ID continuity and skipping duplicate validation. | Must fail closed with `ARGUMENT_NOT_FOUND` or fall back to auto-incrementing `nextIdNum`. |
| **`loadUserAllowlist` Threshold Clamping** | Plan handles $v > 1.0$, but ignores $v \le 0.0$, `NaN`, or string values. | Setting `"firewall": 0` or `"firewall": -1` causes every proposal in existence to fail closed. Setting `"firewall": "high"` crashes similarity comparisons. | Enforce: `const clamped = Number.isFinite(v) ? Math.min(1.0, Math.max(0.01, v > 1.0 ? v / 100 : v)) : defaultVal;` |
| **`parseArgs` `--key=value` Syntax** | Parser assumes flags and values are space-separated tokens (`--key val`). | Passing `--proposal="Use Redis"` or `--arg-id=ARG-01` parses key as `"proposal=\"Use Redis\"" = true`, failing with `INPUT_GATE_HALT`. | Split token on first `=` if present (`const [k, ...rest] = arg.slice(2).split('=')`). |
| **CLI `--help` Handling** | Running `grill-state check-gate --help` or `add-logic --help` exits with code 1 (`INPUT_GATE_HALT`). | Any user or subagent querying command help is treated as an invalid proposal and blocked. | Add explicit check for `args.help || args.h` across all subcommands, outputting subcommand syntax with exit code 0. |
| **Pre-Flight Diagnostic Header Noise** | Running `check-gate` without an active session displays `State: UNKNOWN`, `Active Machine: UNKNOWN`, `Target W=N/A`. | Creates the false impression that the epistemic state engine is uninitialized or corrupted. | Suppress session state metadata block when running standalone pre-flight commands (`check-gate`, `solve-bounds`). |
| **Stranded Ledger Placeholder** | Direct commits and in-place updates do not remove `*(No active decisions recorded yet...)*`. | Markdown table renders with invalid syntax and stranded text directly beneath active rows. | Strip placeholder globally across all ledger write functions. |

---

## 4. Deficiencies in the Proposed ADR-0003 Draft Structure

Comparing the ADR-0003 outline in Component 1 against [ADR-0001](file:///c:/Users/USER/Desktop/Frameworks/grill-logic/references/adr/0001-live-stochastic-release-gate.md) and [ADR-0002](file:///c:/Users/USER/Desktop/Frameworks/grill-logic/references/adr/0002-asymmetric-cot-and-frontier-closure.md) reveals several structural omissions:

1. **Missing Formal Mathematical Definition**:
   - ADR-0001 formalized the stochastic trial matrix; ADR-0002 formalized the Asymmetric CoT topology ($C \implies \neg P$ vs $(P \land \text{Bounds}) \implies C'$) and frontier depletion ($\mathcal{F} = \emptyset$).
   - The ADR-0003 draft outlines text decisions but provides **zero mathematical formulas** for pure negative-constraint falsification.
   - ADR-0003 must formally define the firewall operator:
     $$\text{Violation}(Q) \iff \exists R_k \in \mathcal{L}_{\text{rejected}} \text{ s.t. } \text{CosineSim}(V_Q, V_{C_k}) \ge \tau_{\text{firewall}}$$
2. **Missing State Machine Transition Mapping**:
   - The ADR does not define how Zero-Flag human interactions map to the canonical state identifiers:
     - `S_U0A_PREFLIGHT_CHECK` $\to$ `S_U0B_ADD_LOGIC` $\to$ `S_U0C_DEDUP_RESOLUTION` $\to$ `S_U1_PREMISE_ISOLATION`.
3. **Missing Exit Code & Diagnostic Taxonomy**:
   - The ADR must explicitly enumerate the deterministic exit codes:
     - `0`: Pass / Clean execution.
     - `1`: Epistemic Violation / Invariant Failure (`EPISTEMIC_FIREWALL_VIOLATION`, `INVARIANT_SOLVER_VIOLATION`, `POTENTIAL_DUPLICATE_FLAG`).
     - `2`: Input Gate Halt / Malformed Arguments (`INPUT_GATE_HALT`, `INVALID_MACHINE_OPERATION`).

---

## 5. Concrete Action Plan & Refinements for the Implementation Plan

To make the Implementation Plan and ADR-0003 production-ready, update the plan with the following specific additions:

### Modification 1: Formalize "Falsified Boundary Normalization" in Component 1 (ADR-0003)
Specify that when an argument is rejected:
1. Column 3 (`Proposed Conclusion`) records the normalized falsified proposition ($C_{\text{falsified}}$).
2. The negative-constraint firewall vectorizes:
   ```javascript
   const targetText = `${conclusionRaw} ${cleanRefutedRule}`.trim();
   const targetVec = vectorize(targetText, allowlist);
   const scoreReject = computeCosineSimilarity(proposalVec, targetVec);
   ```
   *(Completely eliminates `alternativeText`, `scoreAlt`, and regex splitting, while preserving the actual refutation boundary).*

### Modification 2: Add Autonomous Disambiguation Protocol to Component 3 (`SKILL.md`)
Update [`skills/logic/self-grill/SKILL.md`](file:///c:/Users/USER/Desktop/Frameworks/grill-logic/skills/logic/self-grill/SKILL.md) and [`skills/logic/add-logic/SKILL.md`](file:///c:/Users/USER/Desktop/Frameworks/grill-logic/skills/logic/add-logic/SKILL.md):
- In autonomous execution (`--machine autonomous`), if `POTENTIAL_DUPLICATE_FLAG` occurs:
  - If identical source prompt/argument ID: automatically append `--arg-id <COLLIDING_ID>`.
  - If new stochastic proposal: automatically append `--allow-duplicate true`.
  - Never yield or prompt for human input in autonomous mode.

### Modification 3: Plug All 7 Omitted Audit Findings in Component 2 (`grill-state.mjs`)
- Add `escapeRegExp(argId)` and `'gi'` flag to `rowRegex`.
- Add validation for `--arg-id` existence; return diagnostic if ID not found.
- Add `--key=value` parsing support to `parseArgs`.
- Add `--help` / `-h` interceptors to all subcommands returning exit code 0.
- Clean up pre-flight diagnostic headers (suppress `UNKNOWN` state metadata).
- Clamp allowlist threshold overrides to $[0.01, 1.0]$.
- Clean stranded ledger placeholders across both append and update paths.

### Modification 4: Expand Verification Plan in Component 4
- Add an automated test verifying that `/self-grill` autonomously resolves `POTENTIAL_DUPLICATE_FLAG` without hanging or prompting.
- Add a test verifying that `check-gate --help` and `add-logic --help` return exit code 0 with usage documentation.
- Add a test verifying that `--proposal="Use Redis"` parses cleanly.

---

### Summary Checklist for Approval

| Item | Current Status in Proposed Plan | Required Fix Before Execution |
| :--- | :---: | :--- |
| **$C_{\text{rejected}}$ Granularity** | Ambiguous (*"strictly conclusionRaw"*) | Adopt Falsified Boundary Normalization ($C_{\text{rejected}} \cup R_{\text{refute}}$). |
| **Schema Parity (Genesis vs Ledger)** | Asymmetric | Unify target vectorization space across both rule sets. |
| **$\tau_{\text{firewall}}$ Calibration** | Ambiguous (*untested with short vectors*) | Recalibrate to $\tau = 0.35$ or use sublinear length penalties. |
| **Autonomous Mode Disambiguation** | Missing (*deadlocks on duplicate flag*) | Add automated disambiguation policy for `/self-grill`. |
| **Refactoring / Deprecation Intent** | Missing (*blocks migration proposals*) | Add intent-preserving exemption / prompt guidance. |
| **Regex Case-Insensitivity (`/i`)** | Missing | Enforce `new RegExp(..., 'gi')`. |
| **Allowlist Range Clamping** | Partially addressed ($v > 1.0$ only) | Clamp strictly to $[0.01, 1.0]$; guard `NaN` and negative values. |
| **CLI `--help` & `--key=val`** | Missing | Add subcommand help handlers and `=` splitting in `parseArgs`. |