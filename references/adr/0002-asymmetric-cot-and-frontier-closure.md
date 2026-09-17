# ADR-0002: Asymmetric Chain-of-Thought (CoT) and Frontier-Depletion Epistemic Closure

- **Status:** Accepted
- **Date:** 2026-09-16
- **Context:** Multi-Agent Reasoning Architecture, Correlation Mitigation, and Verification Termination

---

## 1. Context & Problem Statement

In developing autonomous truth-maintenance protocols for AI coding agents, multi-agent debate (MAD) and LLM-as-a-judge architectures face four foundational vulnerabilities:

### A. Correlated Errors in Homogeneous LLM Judges
Recent empirical findings from Amazon Science (*"When LLM judges agree, should we believe them?"*, 2025/2026) demonstrate that when multiple LLM agents evaluate complex proposals using symmetrical reasoning frameworks, their agreement does not imply correctness. Homogeneous models share underlying inductive biases, training distributions, and blind spots. Consequently, standard multi-agent debate often produces **correlated errors**—agents reinforcing each other's hallucinations or prematurely agreeing on flawed premises.

### B. The Premature Solution Trap ("Recommendation Forking")
In reviewing interactive developer alignment skills such as Matt Pocock's `/grilling` ([aihero.dev/skills-grilling](https://www.aihero.dev/skills-grilling)), a key pattern is presenting immediate alternative solutions or recommendations (`➡️`) during the initial interview round. While helpful in human conversational brainstorming, injecting candidate solutions into Round 1 of an autonomous multi-agent debate produces catastrophic epistemic failure:
- It causes **premature solution synthesis**, where the challenger diverts focus from validating premises to advocating for a speculative replacement architecture.
- It triggers **reflexive deference**, where the continuous LLM abandons its position not because the empirical premises were disproven, but because an authoritative subagent proposed an attractive alternative.
- It directly violates Grill-Logic's core **90/10 Invariant** (allocating ~90% capacity to challenging premises, and at most ~10% to offering solutions only after concordance).

### C. Arbitrary Debate Termination
Many multi-agent frameworks terminate debate either on arbitrary round counters (e.g., "stop at round 3") or subjective model self-assessment. Without a deterministic termination invariant, debates either oscillate indefinitely or stop prematurely before resolving critical contradictions.

### D. Pseudo-Math & "Rigor Theater"
Attempting to calculate epistemic truth via floating-point formulas ($\mathcal{E} = W \cdot (1 - S)$), continuous probability thresholds, or search ranking algorithms (such as Reciprocal Rank Fusion / RRF) constitutes "rigor theater." Architectural constraints (such as disk I/O limits, network latency under partition, memory allocations, or ACID semantics) are binary physical and logical boundaries, not fractional weights to discount.

---

## 2. Decisions

To resolve these vulnerabilities while preserving the integrity of Grill-Logic's $W/S$ epistemic framework, we adopt four architectural decisions:

### Decision 1: Asymmetric Chain-of-Thought (CoT) Methodologies
To eliminate correlated errors between the Proposer and Challenger without requiring heterogeneous underlying model providers, agents must employ **orthogonal problem-solving strategies** (extending Diverse Multi-Agent Debate, DMAD, ICLR 2025):

1. **Challenger CoT — Backward Refutation / Inversion**:
   - The challenger ($W_{\text{subagent}} = 0.8$) operates strictly backward from the candidate conclusion to its failure boundaries:
     $$\text{CoT}_{\text{challenger}}: C \implies \exists P_{\text{fatal}} \text{ s.t. } \neg P_{\text{fatal}}$$
   - Deconstructs explicit claims and exposes unstated latent assumptions.
   - Executes an empirical tool probe (`view_file`, `grep_search`, `run_command`, `read_url_content`) to test physical viability.
   - **Strict Zero-Solution Constraint**: The challenger is strictly prohibited from proposing alternative architectures or recommendations in Round 1 ($0\%$ solution).

2. **Proposer CoT — Forward Constraint-Satisfaction Synthesis**:
   - The proposer ($W_{\text{LLM}} = 0.2$) operates forward from validated user requirements and the empirical boundaries established by the challenger's probe:
     $$\text{CoT}_{\text{proposer}}: (P_{\text{validated}} \land \text{Bounds}_{\text{probe}}) \implies C'$$
   - Synthesizes a minimal, defensible alternative conclusion $C'$ that explicitly respects the empirical finding.

Because the two agents employ inverse search directions through the problem space (backward refutation vs. forward synthesis), their reasoning paths are decorrelated, neutralizing shared blind spots.

```
+-----------------------------------------------------------------------------------+
|                            ASYMMETRIC CoT TOPOLOGY                                |
|                                                                                   |
|  [ Proposer CoT: Forward Synthesis ]       [ Challenger CoT: Backward Inversion ] |
|  P_validated + Bounds_probe ===> C'        C ===> Identify P_fatal ===> Probe     |
|                                                                                   |
|                   DECORRELATED REASONING ACROSS AGENT BOUNDARIES                  |
|                        (Prevents Correlated Error Trap)                           |
+-----------------------------------------------------------------------------------+
```

---

### Decision 2: Preservation of the 90/10 Invariant
We reaffirm the absolute primacy of the 90/10 Rule across both interactive and autonomous state machines:
- **Round 1 Challenger Output**: **0% Solutions, 100% Premise Challenge**. The challenger must only output:
  1. Deconstructed Premises (Stated vs. Hidden).
  2. Empirical Tool Probe Finding.
  3. Failure Boundary / Contrastive Refutation Rule.
- **Solution Triad Gating**: Solutions are unlocked **only** after concordance is reached (State `S_A7` / `S_U7`), structured into the standard triad:
  - **Option 1 (Minimal / Standard Library)**: Zero extra infrastructure, simplest path.
  - **Option 2 (Robust / Standard Pattern)**: Balanced industry standard.
  - **Option 3 (Scale / High-Load Pattern)**: Distributed pattern for proven extreme constraints.
  - **Option 4 (Free Response)**: Developer-specified hybrid.

---

### Decision 3: Frontier-Depletion Closure Protocol
Drawing upon the core principle of Matt Pocock's `/grilling`, verification terminates via **Frontier Depletion** rather than arbitrary turn limits.

1. **The Epistemic Frontier ($\mathcal{F}$)**:
   $$\mathcal{F} = \{ \text{unexamined contradictions}, \text{untested assumptions}, \text{unaddressed probe findings} \}$$
2. **Closure Invariant**:
   A debate reaches valid termination if and only if the epistemic frontier is completely depleted:
   $$\mathcal{F} = \emptyset$$
3. **The 2-Round Dialectic Closure Loop**:
   - **Round 1 (Frontier Expansion)**: Challenger exposes unstated assumptions and executes an empirical probe, generating frontier items $\mathcal{F} = \{ e_1, e_2, \dots \}$.
   - **Round 2 (Frontier Depletion)**:
     - If the proposer concedes: $\mathcal{F}$ collapses; conclusion $C$ is marked `REJECTED`.
     - If the proposer counters with $C'$: Proposer must address every element $e_i \in \mathcal{F}$.
     - Challenger evaluates the response using deterministic structural counts ($N_{\text{unearned}}$, $E_{\text{unexamined}}$, hypothesis shift).
     - Challenger runs a follow-up verification probe on $C'$. If no new unaddressed contradictions emerge, $\mathcal{F} = \emptyset$.
     - Concordance is reached; challenger issues `signoff-subagent` token.
4. **Escalation Boundary**:
   If after 2 rounds the frontier cannot be depleted ($\mathcal{F} \neq \emptyset$), autonomous execution ceases immediately and escalates directly to the human sovereign ($W_{\text{human}} = 1.0$) with an auditable summary of the unresolved contradiction.

```
       [ Proposal Ingested ]
                 │
                 ▼
       [ Round 1: Challenger Backward Inversion ]
                 │
                 ├── Expose P_hidden & Failure Modes
                 └── Execute Empirical Tool Probe
                 │
                 ▼
       [ Frontier Populated: F = { e1, e2, ... } ]
                 │
                 ▼
       [ Round 2: Proposer Forward Synthesis (C') ]
                 │
                 ├── Concede ───────────> [ F = ∅ : REJECTED Committed ]
                 └── Synthesize C'
                             │
                             ▼
       [ Subagent Audit & Follow-Up Probe ]
                 │
                 ├── Contradictions Remain (F ≠ ∅) ──> [ Escalate to W_human ]
                 └── All Points Addressed (F = ∅)
                             │
                             ▼
                 [ Sign-off Token Issued ]
                             │
                             ▼
                 [ Solution Triad Unlocked ]
```

---

### Decision 4: Structural Impossibility Over Pseudo-Math
We reject pseudo-mathematical scoring formulas ($\mathcal{E} = W \cdot (1 - S)$ float products, RRF ordinal ranking) in favor of **deterministic structural constraints**:
1. **Physical State Barriers**: The state machine strictly prevents transition from `CHALLENGE_ISSUED` to `SUPPORTED` without cryptographic `dispatch_token` subagent sign-off.
2. **Binary Tool Probe Requirement**: State transitions fail closed (`exit code 1/2`) if an empirical tool execution is not recorded in `.grill-logic/state.json`.
3. **Deterministic Structural Metrics**: $S_{\text{LLM}}$ components are computed as exact ratios of observable counts:
   - $S_{\text{syco}} = N_{\text{unearned}} / N_{\text{total\_concessions}}$
   - $S_{\text{conf}} = E_{\text{unexamined}} / E_{\text{total\_counter}}$
   - $F_{\text{einstellung}} = (C' \equiv C)$
4. **Fail-Closed Execution Firewall**: If any premise is `REJECTED`, code generation tools and implementation plans are hard-blocked by continuous agent rules.

---

## 3. Consequences

### Positive Consequences
- **Decorrelated Validation**: Eliminates the correlated-error trap highlighted by Amazon Science by enforcing orthogonal CoT directions across agents.
- **Protection Against Premature Solution Synthesis**: Strict 90/10 enforcement prevents the challenger from becoming a premature solution dispenser, preserving adversarial pressure.
- **Deterministic & Defensible Termination**: Verification stops because the epistemic frontier is objectively empty, not because a timer or round counter expired.
- **Zero "Rigor Theater"**: No opaque floating-point scores or fake formulas; all gates are enforced mechanically by tool execution, state machine transitions, and exit codes.

### Negative Consequences & Mitigations
- **Context Overhead**: A 2-round structured exchange consumes additional inference steps compared to single-turn generation.
  * *Mitigation:* The 2-round cap strictly bounds latency, and the resulting architecture prevents massive downstream rewrites.
- **Engineering Discipline**: Proposers cannot lazily accept alternative designs without addressing each empirical probe point.
  * *Mitigation:* The state engine provides explicit diagnostics explaining exactly which counter-evidence remains unexamined.
