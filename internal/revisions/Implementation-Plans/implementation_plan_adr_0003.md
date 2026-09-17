# Implementation Plan: ADR-0003 — Pure Negative-Constraint Falsification, Falsified Boundary Normalization, Zero-Flag UX, and Epistemic Engine Parity

## Overview

This implementation plan resolves the architectural gaps, specification ambiguities, and technical edge cases identified by the independent multi-agent audit panel in:
- [`internal/revisions/Gemini-Critique/Implementation-Plan-Audit.md`](../../../internal/revisions/Gemini-Critique/Implementation-Plan-Audit.md)
- [`internal/revisions/Gemini-Critique/Multi-Agentic-Epistemic-System-Audit.md`](../../../internal/revisions/Gemini-Critique/Multi-Agentic-Epistemic-System-Audit.md)

We formally eliminate heuristic alternative extraction and prescriptive polarity scoring in favor of **Pure Popperian Negative-Constraint Falsification** backed by **Falsified Boundary Normalization** ($C_{\text{rejected}} \cup R_{\text{refute\_boundary}}$). We also institute the **Zero-Flag User Contract** (natural language for humans; programmatic flags for agents) with explicit **Autonomous Deduplication Policies** to prevent deadlock in `/self-grill`.

---

## User Review Required

> [!IMPORTANT]
> **Key Architecture Decisions & Mitigations**:
> 1. **Falsified Boundary Normalization**: Resolves the $C_{\text{rejected}}$ granularity dilemma. Rather than indexing only terse conclusions (which causes overbroad false positives) or full cells (schema contamination), the negative constraint engine vectorizes strictly the conjunction of the candidate conclusion and the prohibited boundary:
>    $$\text{Target Space} = \text{Clean}(C_{\text{rejected}}) \cup \text{Clean}(R_{\text{refute\_boundary}})$$
>    Explanatory alternatives are strictly excluded from the mathematical vector.
> 2. **Schema Parity**: Unifies built-in Genesis Invariants and active Ledger Rows to use the exact same normalized target space.
> 3. **Calibrated Threshold & Containment Gating**: Recalibrates $\tau_{\text{firewall}} = 0.30$ and requires a minimum unigram match floor ($N_{\text{matched}} \ge 2$) before containment applies, preventing single-word false positives.
> 4. **Autonomous Deduplication Policy**: Solves the `/self-grill` deadlock. If `active_machine === 'AUTONOMOUS_DMAD'`:
>    - Similarity $> 0.85$: automatically updates argument in-place (`--arg-id ARG-XX`).
>    - Similarity $0.50 \le \text{sim} \le 0.85$: automatically passes `--allow-duplicate true` with a disambiguated title. Zero human blocking in autonomous runs.
> 5. **Zero-Flag Human Experience**: In interactive modes (`/add-logic`, `/grill-logic`), users converse in natural language. Non-binary user responses (Replace, Inspect, Proceed) deterministically map to engine commands.
> 6. **Full Resolution of 7 Systems Edge Cases**: Regex escaping (`escapeRegExp`), case-insensitive table matching (`/gi`), `--arg-id` validation, `--key=value` parsing, `--help` exit code 0, pre-flight header noise suppression, allowlist range clamping $[0.01, 1.0]$, and stranded placeholder cleanup.
> 7. **Byte-for-Byte Skill Parity**: Verified via SHA256 / exact string equality in `test-skills.mjs` across `skills/` and `.agents/skills/`.

---

## Proposed Changes

### Component 1: Architecture Decision Record (ADR-0003)

#### [NEW] [0003-negative-constraint-falsification-and-anti-prescriptive-firewall.md](../../../references/adr/0003-negative-constraint-falsification-and-anti-prescriptive-firewall.md)
Formalize ADR-0003 with rigorous mathematical foundations:
- **1. Context & Root Cause**:
  - Schema contamination in `LOGICAL_LEDGER.md` (combining $C_{\text{rejected}}$, premises, and advice into `refutedText`).
  - The 4 fatal epistemic flaws of alternative extraction: monopoly/hall pass trap, composite proposal Trojan horse (`scoreAlt >= 0.5` bypass), regex parser fragility, and pseudo-math polarity heuristics.
- **2. Core Decisions**:
  - **Decision 1: Pure Negative-Constraint Falsification via Falsified Boundary Normalization**:
    $$\text{Violation}(Q) \iff \exists R_k \in \mathcal{L}_{\text{rejected}} \text{ s.t. } \text{Score}_{\text{reject}}(V_Q, V_{T_k}) \ge \tau_{\text{firewall}}$$
    where target vector $V_{T_k}$ is constructed strictly from $\text{Clean}(C_{\text{rejected}}) \cup \text{Clean}(R_{\text{refute\_boundary}})$.
  - **Decision 2: Demarcation of Contrastive Rules as Contextual Advisory Syntheses ($C'$)**:
    Mandated alternatives are explicitly categorized as advisory diagnostic guidance for humans/agents ("Recommended Synthesis Paths to Explore"), never input to the mathematical gate.
  - **Decision 3: Zero-Flag User Contract & Autonomous Deduplication Protocol**:
    Human developers never use flags. Dual-path handling for `POTENTIAL_DUPLICATE_FLAG`:
    - Human HITL: Conversational decision mapping.
    - Autonomous DMAD: Mechanical threshold-based auto-resolution ($>0.85 \to$ in-place update; $0.50-0.85 \to$ distinct proposal).
  - **Decision 4: Deterministic Exit Code & Diagnostic Taxonomy**:
    - `0`: Pass / Clean execution.
    - `1`: Epistemic Invariant Violation (`EPISTEMIC_FIREWALL_VIOLATION`, `INVARIANT_SOLVER_VIOLATION`, `POTENTIAL_DUPLICATE_FLAG`).
    - `2`: Input Gate Halt / Malformed Syntax (`INPUT_GATE_HALT`, `ARGUMENT_NOT_FOUND`).
  - **Decision 5: Canonical State Machine Mapping**:
    Formal mapping of pre-flight, formulation, dedup, and challenge states:
    `S_U0A_PREFLIGHT_CHECK` $\to$ `S_U0B_ADD_LOGIC` $\to$ `S_U0C_DEDUP_RESOLUTION` $\to$ `S_U1_PREMISE_ISOLATION`.

#### [MODIFY] [AGENTS.md](../../../AGENTS.md)
- Add ADR-0003 summary to Section 2 (Core Epistemic Protocol).
- Reaffirm Section 3: "Zero User Flags. Developers interact via natural language and clean slash commands. Agent harnesses translate intent into programmatic CLI executions."

---

### Component 2: Epistemic State Engine (`scripts/grill-state.mjs`)

#### [MODIFY] [grill-state.mjs](../../../scripts/grill-state.mjs)

1. **Purge Alternative Extraction & Schema Contamination**:
   - Delete `altVec`, `simAlt`, `contAlt`, `scoreAlt`, and `adoptsAlternative`.
   - Delete delimiter regexes (`mandated alternative`, `derived action`, etc.) from the gate passkey path.
   - For `REJECTED` rows, extract clean refutation boundary:
     ```javascript
     // Strip out any mandated alternative or derived action text from the rule to prevent contamination
     const cleanRuleBoundary = ruleCellRaw
       .replace(/(?:<br>|\n|\s+)(?:\*\*)?(?:mandated alternative|derived action|alternative)(?:\*\*)?:.+$/i, '')
       .replace(/<br>/gi, ' ')
       .replace(/[*_]/g, '')
       .replace(/^(?:\*\*)?(?:contrastive refutation rule|contrastive rule)(?:\*\*)?:\s*/gi, '')
       .trim();
     const targetText = `${conclusionRaw} ${cleanRuleBoundary}`.trim();
     const targetVec = vectorize(targetText, allowlist);
     ```
   - Standardize `GENESIS_SYSTEM_INVARIANTS` to match:
     ```javascript
     const targetText = `${sys.conclusion} ${sys.refuted}`.trim();
     const targetVec = vectorize(targetText, allowlist);
     ```
2. **Calibrate `scoreReject` & Containment**:
   - Set $\tau_{\text{firewall}} = 0.30$.
   - Compute `sim = computeCosineSimilarity(proposalVec, targetVec)`.
   - Compute `cont = computeContainment(proposalVec, targetVec)`.
   - Apply containment floor: `scoreReject = (sim >= 0.15 && matchedUnigrams >= 2) ? Math.max(sim, cont) : sim`.
   - Raised collision if and only if `scoreReject >= tauFirewall`.
3. **Autonomous Deduplication Policy in `cmdAddLogic`**:
   - When near-duplicate is detected:
     - Check `active_machine` or `--machine`:
     - If `AUTONOMOUS` / `AUTONOMOUS_DMAD`:
       - If `highest_similarity > 0.85`: automatically perform in-place update for the colliding `arg_id`.
       - If `0.50 <= highest_similarity <= 0.85`: automatically proceed with auto-generated disambiguation tag.
     - If `HUMAN` / interactive: fail closed with `POTENTIAL_DUPLICATE_FLAG` and exit code 1.
4. **Systems Edge-Case Hardening**:
   - **`escapeRegExp` & Case-Insensitive Matching**:
     ```javascript
     function escapeRegExp(str) {
       return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
     }
     const rowRegex = new RegExp(`\\|\\s*\\*\\*${escapeRegExp(argId)}\\*\\*\\s*\\|[^\\n]*`, 'gi');
     ```
   - **Validate `--arg-id` Existence**: If `--arg-id` is passed to `add-logic` or `commit` and does not exist in `LOGICAL_LEDGER.md`, fail closed with diagnostic `ARGUMENT_NOT_FOUND` (exit code 2).
   - **Allowlist Clamping**:
     ```javascript
     const clamped = Number.isFinite(v) ? Math.min(1.0, Math.max(0.01, v > 1.0 ? v / 100.0 : v)) : defaultVal;
     ```
     Safeguard against `data.threshold_overrides === null` via `(data.threshold_overrides && typeof data.threshold_overrides === 'object')`.
   - **Tokenize `exempt_terms`**:
     ```javascript
     exempt_terms: Array.isArray(data.exempt_terms) ? data.exempt_terms.flatMap(t => tokenize(String(t))) : []
     ```
   - **`parseArgs` `--key=value` Syntax**:
     ```javascript
     if (arg.startsWith('--')) {
       const eqIdx = arg.indexOf('=');
       if (eqIdx !== -1) {
         const k = arg.slice(2, eqIdx);
         const v = arg.slice(eqIdx + 1);
         args[k] = v;
         continue;
       }
       ...
     ```
   - **Subcommand `--help` & `-h`**: Check `args.help || args.h` in all CLI commands and display usage with exit code 0.
   - **Pre-Flight Diagnostic Header**: Suppress `State: UNKNOWN`, `Active Machine: UNKNOWN` in `check-gate` and `solve-bounds` when no session is active.
   - **Stranded Placeholder**: Remove `*(No active decisions recorded yet...)*` across both append and update paths.

---

### Component 3: Skill Specifications & Zero-Flag UX

#### [MODIFY] [skills/logic/add-logic/SKILL.md](../../../skills/logic/add-logic/SKILL.md)
- Institutionalize the **Zero-Flag Human Contract**:
  - Developers provide natural language input (`/add-logic [idea]`).
  - Decision table for non-binary developer responses on `POTENTIAL_DUPLICATE_FLAG`:
    - *"Update / Refine / Replace"*: Agent runs `grill-state.mjs add-logic --arg-id ARG-XX`.
    - *"Why / What is ARG-XX?"*: Agent reads and displays ARG-XX row from `LOGICAL_LEDGER.md` without state change.
    - *"Keep separate / New proposal"*: Agent runs `grill-state.mjs add-logic --allow-duplicate true`.
  - Intent-Preserving Migration/Deprecation Guidance:
    - If proposal is refactoring/deprecation (`decommission X in favor of Y`), isolate $Y$ as the proposed conclusion so legacy mentions don't trigger the negative constraint firewall.

#### [MODIFY] [skills/logic/grill-logic/SKILL.md](../../../skills/logic/grill-logic/SKILL.md)
- Ensure complete v2.2.0 alignment:
  - Step 0 mandatory check (`/add-logic`).
  - Interactive decision tree walk with strict turn yield (`ask_question`).
  - Zero flags expected from human.

#### [MODIFY] [skills/logic/self-grill/SKILL.md](../../../skills/logic/self-grill/SKILL.md)
- Ensure complete v2.2.0 alignment:
  - Step 0 mandatory check (`/add-logic`).
  - Autonomous Deduplication Policy execution.
  - Asymmetric CoT, 90/10 Invariant (zero solutions in Round 1).
  - Empirical tool probe requirement and token handshake.

#### [MODIFY] [.agents/rules/epistemic-gate.md](../../../.agents/rules/epistemic-gate.md)
- Update epistemic gate rule to cite ADR-0003, Falsified Boundary Normalization, and zero user flags.

#### [SYNCHRONIZE] Mirror all skills to `.agents/skills/`
- Full file parity between `skills/` and `.agents/skills/`.

---

### Component 4: Test Infrastructure & Verification

#### [MODIFY] [scripts/test-skills.mjs](../../../scripts/test-skills.mjs)
- Upgrade `scripts/test-skills.mjs` to perform recursive byte-for-byte content equality checks across all files in `skills/` vs `.agents/skills/`. Fail closed on any content drift.

#### [MODIFY] [scripts/test-epistemic-engine.mjs](../../../scripts/test-epistemic-engine.mjs)
Expand test suite with concrete assertions for all audited items:
1. **Falsified Boundary Normalization**:
   - `Deploy SQLite over NFS` fails closed.
   - Concise alternative `Use PostgreSQL` passes with 0 collisions.
   - Unrelated SQLite `Use embedded SQLite for local config file cache` passes with 0 collisions.
2. **Composite Trojan Horse Plugged**:
   - `Use PostgreSQL and SQLite with WAL mode over NFS` fails closed (no bypass).
3. **Autonomous Mode Deduplication**:
   - `add-logic --machine autonomous` auto-updates on $>0.85$ match and auto-disambiguates on $0.50-0.85$ match without prompting.
4. **Systems Edge Cases**:
   - `--proposal="Use Redis"` syntax parses cleanly.
   - `check-gate --help` and `add-logic --help` exit with code 0.
   - Regex injection `--arg-id "ARG-.*"` fails cleanly with `ARGUMENT_NOT_FOUND` and does not wipe the ledger table.
   - Case-insensitive `--arg-id arg-01` updates `**ARG-01**` in-place.
   - `allowlist.json` with `"firewall": 25` clamps to $0.25$ (not $25.0$).
   - `threshold_overrides: null` parses without throwing `TypeError`.
   - Stranded placeholder `*(No active decisions recorded yet...)*` is removed from ledger on first row insertion.

---

## Verification Plan

### Automated Tests
1. `node scripts/test-skills.mjs`: Byte-for-byte symmetry check across all skills.
2. `node scripts/test-epistemic-engine.mjs`: Epistemic engine, invariant solver, and all edge cases.
3. `npm test`: Full test suite pass (`test-skills.mjs`, `test-ledger.mjs`, `test-v2-protocol.mjs`, `test-epistemic-engine.mjs`).
4. Mirror Test Run: `npm test` in `test-grill-logic/v2`.

### Manual / Architectural Verification
- Inspect `LOGICAL_LEDGER.md` formatting and verify no stranded text.
- Inspect `scripts/grill-state.mjs` to confirm zero lines of heuristic alternative extraction or polarity scoring remain.
