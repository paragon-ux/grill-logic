# Grill-Logic Architecture Whitepaper: Game-Theoretic Epistemic Verification for Agentic Coding

**Document Version:** 2.2.0  
**Status:** Canonical Architectural Synthesis  
**Authors:** Paragon UX / Grill-Logic Core Architecture Team  
**Date:** September 2026  

---

## Abstract

Modern large language model (LLM) coding agents routinely fail during complex architectural reasoning due to seven interconnected cognitive and architectural vulnerabilities: **simulated monologue theater** (in which a single agent simulates debate without independent scrutiny), **sycophancy & confirmation bias** (rapidly deferring to user bias or defending past generated code), **premature solution offering** ("premature solution synthesis" / "recommendation forking"), **academic jargon leakage** (exposing mathematical notation in conversational dialogue), **mode confusion & setup fatigue** (burdening developers with brittle multi-tier configuration), **correlated errors across homogeneous judges** (where multiple LLMs share inductive biases and agree on flawed premises), and **"rigor theater"** (unprincipled attempts to calculate epistemic truth via continuous floating-point formulas or search rank fusion).

This paper introduces the architecture of **Grill-Logic v2.2**, a harness-agnostic epistemic verification system founded on Diverse Multi-Agent Debate (DMAD lineage; ICLR 2025), orthogonal Chain-of-Thought (CoT) reasoning topologies, asymmetric autonomy weighting, and strict state-gated execution. We formalize two core variables: **Autonomy Weight ($W$)**, an ordinal ranking derived from evidence-independence and dependence-clarity, and **Skepticism Signal ($S$)**, a meta-cognitive evaluation whose operational impact scales inversely with the target's $W$. By decoupling *challenger-credibility* from *target-deference*, enforcing asymmetric CoT topologies (Challenger Backward Inversion vs. Proposer Forward Synthesis), adhering to a strict **90% challenge / 10% solution invariant**, and governing verification via **Frontier-Depletion Epistemic Closure**, Grill-Logic guarantees rigorous architectural stress-testing without disempowering human judgment or degenerating into unconstrained prompt theater.

---

## 1. Introduction & The Epistemic Crisis in Agentic AI

When coding assistants are tasked with evaluating architectural proposals—such as selecting distributed databases, introducing messaging queues, or defining microservice boundaries—they frequently prioritize conversational agreeableness and fluent text generation over empirical and logical truth.

In empirical testing and real-world dogfooding transcripts, seven fatal failure modes consistently emerge:

1. **Simulated Monologue Theater**: When prompted to perform "multi-round verification" within a single turn, an LLM merely changes its mind sequentially in a single output stream, simulating a debate rather than introducing independent information or genuine adversarial pressure.
2. **Sycophancy & Confirmation Bias (Epistemic Drift)**: The LLM rapidly defers to user bias or circular self-justification, frequently admitting in hindsight that its reasoning suffered from the "streetlight effect" (searching where it is easy rather than where the truth lies).
3. **Premature Solution Offering & Recommendation Forking**: The LLM rushes to generate complex code, infrastructure configurations, or alternative architectural blueprints before the core problem premises have been validated. In multi-agent contexts, offering solutions during initial critique turns short-circuits scrutiny and triggers premature convergence.
4. **Academic Jargon Leakage**: When instructed to perform formal logic, agents frequently leak abstract notation (e.g., turnstiles `⊢`, propositional calculus symbols, epistemic frontier labels) into conversational responses rather than delivering plain-English technical analysis.
5. **Mode Confusion & Setup Fatigue**: Users are subjected to multi-stage interrogations regarding configuration rather than clean, deterministic operational execution.
6. **Correlated Errors in Homogeneous Judges**: As documented in recent AI evaluation research (e.g., Amazon Science, 2025/2026), when multiple agents of the same model class or prompt paradigm evaluate a proposal symmetrically, their agreement does not signify truth. Shared training distributions and blind spots produce false concordance.
7. **Pseudo-Math & "Rigor Theater"**: Attempting to score epistemic truth via floating-point formulas ($\mathcal{E} = W \cdot (1 - S)$) or Reciprocal Rank Fusion (RRF) creates ungrounded approximations. Architectural boundaries (disk saturation, network partitions, memory ceilings, transactional isolation) are physical realities, not continuous probabilities.

Grill-Logic resolves this epistemic crisis by treating architectural validation not as a conversational roleplay, but as a **formal game-theoretic protocol** executed across two distinct modes: **User Grill-Logic** (human-in-the-loop concordance) and **Self-Grill** (autonomous multi-agent audit).

---

## 2. Theoretical Foundations: The $W$ and $S$ Epistemic Framework

### 2.1 The Autonomy Weight ($W$)

The **Autonomy Weight ($W$)** is an ordinal ranking representing an actor's epistemic integrity and authority at the moment of evaluation. It is parameterized along two non-separable dimensions:

$$\text{Autonomy Weight } (W) = f(\text{Evidence-Independence}, \text{Dependence-Clarity})$$

1. **Evidence-Independence**: Whether the actor encounters the specific premise/evidence fresh, with zero prior authorship of, psychological attachment to, or conversational commitment to the proposal under review.
2. **Dependence-Clarity**: Whether the actor's optimization objective is governed by a singular, legible loss function (e.g., "challenge validity ruthlessly") or compromised by multiple entangled, competing objectives (e.g., pleasing the user, preserving conversational tone, defending past generated code).

Independence *conditions* dependence-clarity: an agent whose context is burdened with historical conversation cannot credibly claim a clean loss function.

#### Relative Ordering of $W$
* **In Self-Grill**: 
  $$W_{\text{subagent}} > W_{\text{LLM}}$$
  The subagent is freshly instantiated with only a task handoff. It possesses zero conversational baggage (high evidence-independence) and a single, uncompromised loss function: *challenge correctness* (high dependence-clarity). The main continuous LLM carries forward multiple conflicting signals (helpfulness, tone maintenance, narrative momentum), resulting in low $W$.
* **In User Grill-Logic**:
  $$W_{\text{human}} \gg W_{\text{LLM}}$$
  The human carries sovereign consequence-stakes and ultimate operational responsibility. Even if the human exhibits cognitive bias, their authority to make the final trade-off is absolute.
* **Delegation in Self-Grill**:
  $$W_{\text{human}} \xrightarrow{\text{delegation}} W_{\text{subagent}}$$
  When the human commands the system to run Self-Grill, they vest their challenge authority in the freshly spawned subagent.

#### 2.1.1 The Two-Party Invariant

Every stage of the protocol has exactly two parties, never three — but which two depends on the stage:

* **Interpretation (`/add-logic`)** is always Human ↔ LLM, in both modes. The human confirms or corrects the model's decomposition of the prompt before anything is committed to the ledger. This happens before the state machines in §5 begin.
* **Challenge exchange** depends on mode:
  * **User Grill-Logic**: Human ($W_{\text{human}}$) $\leftrightarrow$ LLM ($W_{\text{LLM}}$).
  * **Self-Grill**: LLM ($W_{\text{LLM}}$) $\leftrightarrow$ Adversarial Subagent ($W_{\text{subagent}}$).

In Self-Grill, the subagent does not join the protocol as an independent third party. It acts under $W_{\text{human}} \xrightarrow{\text{delegation}} W_{\text{subagent}}$ (above): the human, having already set the baseline together with the LLM during `/add-logic`, delegates challenge authority to the subagent for that exchange. Any rule elsewhere in this document that refers to "the other party" or "no counter" resolves to exactly one of the two parties above, depending on stage and mode — never a third.

---

### 2.2 Decoupled Challenger-Credibility $\neq$ Target-Deference

A fatal flaw of naive multi-agent architectures is **reflexive deference**. If an agent is assigned "high authority," the counterpart agent simply yields to it, replicating sycophancy across agent boundaries.

Grill-Logic breaks this symmetry with a strict design invariant:
> **Challenger-credibility does not imply target-deference.**

* When the subagent challenges the main LLM, the subagent's challenge carries maximum weight ($S_{\text{LLM}}$ lands at full strength).
* **The subagent does not inherit immunity from scrutiny as a target.** The main LLM counters the subagent at full strength: *"The LLM does not weaken its argument merely because the subagent carries delegated authority."*

This guarantees an authentic adversarial equilibrium: both agents push back with maximal rigor, preventing the subagent from becoming an unchallengeable oracle.

---

### 2.3 The Skepticism Signal ($S$)

The **Skepticism Signal ($S$)** is a meta-evaluative vector assessing the reasoning quality and potential biases of an actor. 

#### The Governing Law
$$\text{Weight of } S \propto \frac{1}{W_{\text{target}}}$$

The operational impact of a skepticism signal scales inversely with the target's Autonomy Weight:

```
+-------------------------------------------------------------------------------+
| S_LLM (Subagent -> LLM)       Target W_LLM is LOW                             |
|                               --> S_LLM applies at FULL STRENGTH.             |
|                                   Forces substantive counter-evidence or      |
|                                   immediate premise concession.               |
+-------------------------------------------------------------------------------+
| S_human (LLM -> Human)        Target W_human is HIGH                          |
|                               --> S_human is DAMPENED.                        |
|                                   Surfaced purely as an auditable behavioral   |
|                                   diagnostic; NEVER overrides human decision.  |
+-------------------------------------------------------------------------------+
```

#### Deterministic Structural Calculation of $S_{\text{LLM}}$
To eliminate prompt hallucinations and arbitrary floating-point scores, $S_{\text{LLM}}$ is computed strictly from observable structural ratios and state transitions:

1. **Sycophancy Metric ($S_{\text{syco}}$)**:
   $$S_{\text{syco}} = \frac{N_{\text{unearned}}}{N_{\text{total\_concessions}}}$$
   An unearned concession occurs when the model yields without citeable empirical evidence or formal deductive necessity. If all concessions are grounded in verified tool probe data, $N_{\text{unearned}} = 0 \implies S_{\text{syco}} = 0.0$.
2. **Confirmation Bias Metric ($S_{\text{conf}}$)**:
   $$S_{\text{conf}} = \frac{E_{\text{unexamined}}}{E_{\text{total\_counter}}}$$
   Measures the proportion of empirical probe findings or counter-evidence that the target LLM failed to address when proposing an alternative hypothesis.
3. **Fixed Mental Set Boolean ($F_{\text{einstellung}}$)**:
   $$F_{\text{einstellung}} = \begin{cases} 1 & \text{if } C' \equiv C \text{ (reiterated refuted conclusion)} \\ 0 & \text{if } C' \neq C \text{ (shifted to alternative hypothesis class)} \end{cases}$$
4. **Epistemic Risk Level**: Evaluated deterministically as `LOW`, `MODERATE`, or `HIGH` based on the combination of these three structural metrics.

#### Dynamic Skepticism Timing
**$S_{\text{LLM}}$ cannot be evaluated at Turn 0.** Sycophancy and confirmation bias are behavioral responses to pushback. In Round 1, $S_{\text{LLM}}$ is intentionally unassessed (`null`). It is evaluated in Round 2 only after the target LLM responds to the challenger's empirical probe.

#### Generating $S_{\text{human}}$ (Auditable Behavioral Log)
An LLM cannot reliably infer a human's internal psychology. Therefore, $S_{\text{human}}$ is calculated **exclusively from auditable behavioral metrics**:

$$\text{Reassertion Ratio } (R_{\text{reassert}}) = \frac{\sum \text{Turns with No New Proposition}}{\sum \text{Turns with New Proposition or Evidence}}$$

* For every user turn, the system records a deterministic binary flag: does this turn introduce a new empirical claim, constraint, or line of reasoning ($Y$), or does it merely reassert a previous stance ($N$)?
* If $R_{\text{reassert}}$ reaches 3 consecutive stagnant turns, $S_{\text{human}}$ triggers a transparent diagnostic query (`HUMAN_STAGNATION_ALERT`):
  > *"You have held this architectural position across three rounds without introducing new constraints or evidence. Would you like to address the open counter-evidence regarding [X], or intentionally accept this operational trade-off and proceed?"*
* Under no circumstance does $S_{\text{human}}$ lock the user out or override sovereign human intent ($W_{\text{human}} = 1.0$).

---

### 2.4 Structural Impossibility Over Pseudo-Math ("Rigor Theater")

In epistemic engineering, attempting to score truth via continuous probability products or Reciprocal Rank Fusion (RRF) is a category error. Software architecture is governed by hard physical and logical boundaries:
- A network partition either drops packets or it does not.
- SQLite WAL mode on NFS either risks lock corruption or it does not.
- A database connection pool either exhausts file descriptors at 10,000 concurrent sockets or it does not.

Treating these physical invariants as fractional weights to be blended in an algorithm produces ungrounded "rigor theater." Instead, Grill-Logic replaces probabilistic scoring with mechanical state barriers, binary empirical probe verifications, and fail-closed exit codes: an invariant is either satisfied or execution halts. 

### 2.5 The Neurosymbolic Negative-Constraint Epistemic Firewall (ADR-0003)

In real-world software engineering, developers rarely submit proposals using identical lexical strings to past refutations. A static regex or naive keyword scanner fails due to semantic drift: paraphrasing, synonym substitution, and alternative phrasing easily evade static patterns. Conversely, continuous floating-point scoring across unconstrained embedding models introduces non-deterministic hallucination, high inference cost, and dependency bloat.

Grill-Logic v2.2 introduces a **zero-dependency, standard-library dynamic vector similarity engine** combining sublinear Term Frequency with adjacent word-bigram compound geometry.

#### 2.5.1 The Polarity Trap & Falsified Boundary Normalization
Naive vector similarity in natural language suffers from the **polarity trap**: a contrastive refutation rule stored in the ledger inherently contains both the *prohibited concept* and the *mandated alternative* (e.g., *"DO NOT use schema-per-tenant on PostgreSQL... MANDATED ALTERNATIVE: Shared database with row-level security"*). If a developer subsequently proposes the mandated alternative (*"Implement shared database with row-level security"*), naive bag-of-words similarity detects massive lexical overlap and blocks the correct implementation.

Attempting to resolve this via "alternative extraction" (parsing the advice string and granting a gate exemption if similarity to the alternative is high) creates two fatal epistemic vulnerabilities:
1. **The Monopoly / Hall-Pass Trap**: An alternative recorded in a past ledger row becomes an accidental prescriptive monopoly. Any valid architecture not explicitly listed as the alternative is blocked.
2. **The Composite Trojan-Horse Bypass**: An adversarial or confused proposer can bypass the firewall by proposing the prohibited architecture while simply appending the alternative tokens to their prompt (e.g., *"Deploy SQLite over NFS with PostgreSQL"*).

Grill-Logic v2.2 resolves this via **Pure Negative-Constraint Falsification (ADR-0003)** backed by **Falsified Boundary Normalization**:
* Epistemic firewalls operate strictly on **negative constraints** (Popperian falsification). A firewall determines solely whether a proposal intersects prohibited failure states; it never prescribes positive solutions.
* Mandated alternatives ($C'$) and contrastive advice are strictly designated as **contextual advisory guidance** for humans and agents, completely segregated from the mathematical vector target.
* The gating vector space evaluates proposals strictly against the normalized conjunction of the falsified conclusion and the synthesized refutation boundary:
  $$\text{Target Space} = \text{Clean}(C_{\text{rejected}}) \cup \text{Clean}(R_{\text{refute\_boundary}})$$
  $$\text{Violation}(Q) \iff \exists R_k \in \mathcal{L}_{\text{rejected}} \text{ s.t. } \text{Score}_{\text{reject}}(V_Q, V_{T_k}) \ge \tau_{\text{firewall}}$$

#### 2.5.2 Vector Space Model: Sublinear TF + Bigram Geometry
To achieve deterministic, microsecond-latency evaluation without external neural embeddings, the state engine computes similarity across a dual-feature vector space:
1. **Tokenization & Technical Acronym Preservation**: Strips punctuation while natively preserving 2- and 3-character domain acronyms (`DB`, `S3`, `IP`, `OS`, `CI`, `TLS`, `AWS`, `RPC`, `SQL`) by enforcing a minimum length of 2 characters.
2. **Compound Bigram Extraction**: Generates unigrams alongside adjacent word bigrams ($t_i + \text{"\_"} + t_{i+1}$), capturing non-separable architectural compounds (`sqlite_wal`, `named_pipes`, `network_filesystem`, `read_replica`, `connection_pool`).
3. **Sublinear Term Weighting**:
   $$w(t) = (1 + \ln(\text{count}(t))) \times \text{length\_weight}(t)$$
   where $\text{length\_weight}(t) = 1.0 + 0.1 \times \min(\text{length}(t), 5)$ grants up to $1.5\times$ weight to specific compound concepts over generic unigrams.
4. **Normalized Cosine Metric**:
   $$\text{sim}(V_A, V_B) = \frac{V_A \cdot V_B}{\|V_A\|_2 \cdot \|V_B\|_2} \in [0.0, 1.0]$$
5. **Directional Containment Gating**: Short, terse proposals matching long refutation rules are evaluated via directional containment:
   $$\text{cont}(V_Q, V_T) = \frac{\sum_{t \in V_Q \cap V_T} w_Q(t)}{\sum_{t \in V_Q} w_Q(t)}$$
   To eliminate false positives on generic unigrams (`database`, `service`, `use`), containment is strictly gated behind a compound bigram match or baseline cosine overlap ($\text{sim} \ge 0.15 \land N_{\text{matched\_unigrams}} \ge 2$).

#### 2.5.3 The Zero-Flag User Contract & Autonomous Deduplication
Human developers interact exclusively through natural language. Requiring human developers to memorize or pass CLI flags (`--allow-duplicate`, `--arg-id`, `--machine`, `--proposal`) defeats the ergonomic premise of agentic coding.
* **Conversational Mapping (Human HITL)**: The state engine emits structured diagnostic exit codes (`POTENTIAL_DUPLICATE_FLAG`, exit code 1). The agent harness converses in plain English, allowing the developer to replace an argument or branch, and translates the developer's choice into programmatic flags behind the scenes.
* **Autonomous Deduplication Policy (Autonomous DMAD)**: In `/self-grill`, headless agents cannot prompt the user without halting execution. When a near-duplicate proposal is detected against the ledger:
  - If $\text{sim} > 0.85$: The engine automatically updates the existing argument in-place (`--arg-id ARG-XX`).
  - If $0.50 \le \text{sim} \le 0.85$: The engine automatically passes `--allow-duplicate true` with an auto-disambiguated title.
  This guarantees headless autonomous progress with zero deadlocks.

---

## 3. Lineage: Diverse Multi-Agent Debate & Amazon Science Correlated Errors

Grill-Logic v2.2 is an operational extension of **Diverse Multi-Agent Debate (DMAD)** ([ICLR 2025](https://openreview.net/forum?id=t6QHYUOQL7); [GitHub: MraDonkey/DMAD](https://github.com/MraDonkey/DMAD)), enriched by recent empirical discoveries regarding multi-agent evaluation dynamics.

```
[ Single-Model Self-Reflection ] 
       │ (Fails due to inherent fixed thinking patterns & circular CoT)
       ▼
[ Standard Multi-Agent Debate (MAD) ]
       │ (Assigns superficial personas, but agents share homogeneous reasoning methods;
       │  devolves into the Einstellung effect and shared blind spots)
       ▼
[ Correlated Errors in LLM Judges (Amazon Science 2025/2026) ]
       │ (Proves that agreement among homogeneous models does NOT imply correctness;
       │  symmetrical debate leads to mutual reinforcement of false premises)
       ▼
[ Diverse Multi-Agent Debate (DMAD, ICLR 2025) ]
       │ (Breaks fixed mental sets by equipping agents with distinct problem-solving strategies)
       ▼
[ Grill-Logic v2.1: Asymmetric CoT Topologies & Frontier Closure ]
       │ (Challenger Backward Inversion CoT vs Proposer Forward Synthesis CoT;
       │  Frontier Depletion closure; 90/10 gating; zero fake-math structural impossibility)
```

### 3.1 The Fixed Mental Set Problem (Einstellung Effect)
As demonstrated by DMAD, standard Multi-Agent Debate (MAD) introduces multiple agents differentiated purely by cosmetic personas (e.g., "Performance Engineer" vs. "Security Architect"). Underneath these labels, models employ identical reasoning methods. This produces the **Einstellung effect**: models lock into a homogeneous mental set, failing to explore alternative hypothesis spaces.

### 3.2 Correlated Errors in LLM Judges (Amazon Science Findings)
Recent research by Amazon Science (*"When LLM judges agree, should we believe them?"*, 2025/2026) revealed a profound vulnerability in multi-agent consensus: **when LLM judges agree, their concordance is frequently driven by correlated error rather than truth**. 

Homogeneous models share pre-training distributions, inductive biases, and failure modes. If two instances of a model analyze an architectural design using the same forward reasoning path, both will overlook the exact same latent assumptions. Symmetrical consensus is therefore an unreliable verification signal.

### 3.3 Asymmetric Chain-of-Thought (CoT) Topologies
To break correlated errors without requiring multi-provider infrastructure, Grill-Logic enforces **orthogonal reasoning directions** across agent boundaries:

```
+-----------------------------------------------------------------------------------+
|                            ASYMMETRIC CoT TOPOLOGY                                |
|                                                                                   |
|  [ Proposer CoT: Forward Synthesis ]       [ Challenger CoT: Backward Inversion ] |
|  - Start: Validated Constraints            - Start: Candidate Conclusion C        |
|  - Ingest: Empirical Probe Findings        - Direction: Work Backward to Bound    |
|  - Direction: Work Forward to C'           - Objective: Isolate P_fatal s.t. ¬P   |
|  - Loss: Minimal Feasible Implementation   - Loss: Falsify Soundness Ruthlessly   |
|                                                                                   |
|                 ORTHOGONAL REASONING PATHS ELIMINATE SHARED BLIND SPOTS           |
|                          (Neutralizes Correlated Errors)                          |
+-----------------------------------------------------------------------------------+
```

1. **Challenger CoT (Backward Inversion / Refutation)**:
   - Starts at conclusion $C$ and works backward: $C \implies \exists P_{\text{fatal}} \text{ s.t. } \neg P_{\text{fatal}}$.
   - Identifies the unstated physical or operational boundary that breaks the proposal.
   - Executes an empirical tool probe (`view_file`, `grep_search`, `run_command`, `read_url_content`) to verify physical realities.
   - Strictly forbidden from generating implementation recommendations in Round 1 ($0\%$ solution).
2. **Proposer CoT (Forward Constraint-Satisfaction Synthesis)**:
   - Starts from the empirical boundary established by the challenger's probe.
   - Works forward: $(P_{\text{valid}} \land \text{Bounds}_{\text{probe}}) \implies C'$.
   - Synthesizes the simplest viable alternative architecture ($C'$) respecting all constraints.

Because the challenger and proposer traverse the search graph in opposite directions, their reasoning paths cannot correlate.

---

## 4. The 90/10 Invariant & Gated Solution Delivery

A fundamental axiom of Grill-Logic is the **90/10 Rule**:
> **An architectural intelligence system must allocate ~90% of its capacity to challenging premises, and at most ~10% to offering solutions.**

### 4.1 The Peril of "Recommendation Forking"
In reviewing interactive developer alignment skills such as Matt Pocock's `/grilling` ([aihero.dev/skills-grilling](https://www.aihero.dev/skills-grilling)), a central technique is offering alternative paths or immediate recommendations (`➡️`) during the initial question turn. 

While effective in collaborative human conversation, injecting candidate recommendations into Round 1 of an autonomous multi-agent debate causes catastrophic failure:
- **Premature Solution Synthesis**: The challenger abandons rigorous falsification and begins championing its own speculative architecture.
- **Reflexive Deference**: The continuous LLM capitulates to the subagent's proposed solution rather than defending or empirically refining its core premises.
- **Epistemic Short-Circuit**: The failure modes of the original proposal remain unprobed.

Grill-Logic strictly resolves this: **In Round 1, the challenger is structurally forbidden from offering any solutions.**

### 4.2 The Turn-Gating Invariant
* Under no circumstances may an agent generate architectural solutions, code implementations, or migration plans while premises are contested.
* Candidate solutions may be emitted **only after concordance is verified** (State `S_U7` / `S_A7`).

### 4.3 The Solution Triad Protocol
Once concordance on conclusion $C$ (or synthesized $C'$) is established, solutions are unlocked in a structured triad:
1. **Option 1 (Minimal / Standard Library)**: The lowest-complexity approach satisfying validated premises with zero external operational bloat.
2. **Option 2 (Robust / Standard Pattern)**: The industry-standard architecture balancing maintainability with resilience.
3. **Option 3 (Advanced / High-Scale Pattern)**: The horizontally distributed design reserved for proven extreme throughput or availability constraints.
4. **Option 4 (Free-Response Option)**: Allowing the developer (or proposer) to specify an unlisted hybrid.

---

## 5. Dual State Machine Architectural Specification

Grill-Logic formalizes its execution through two rigorous, deterministic state graphs.

### 5.0 Pre-Flight Negative Constraint Firewall & Interpretation Gate

Before entering either state machine, any proposal must pass two preliminary gating layers:

1. **Pre-Flight Negative Constraint Firewall (`check-gate`)**:
   The engine scans `LOGICAL_LEDGER.md` using the dynamic vector similarity model (§2.5). If the proposal collides with a previously `REJECTED` conclusion or refutation boundary ($\text{Score}_{\text{reject}} \ge \tau_{\text{firewall}} = 0.30$), execution **fails closed immediately** with exit code 1 (`EPISTEMIC_FIREWALL_VIOLATION`), halting code generation tools before implementation planning begins.

2. **The Interpretation Gate (`/add-logic`)**:
   Mandatory Human ↔ LLM gate (§2.1.1):
   - The LLM decomposes explicit premises ($P_1 \ldots P_n$) and candidate conclusion ($C$).
   - The LLM presents that decomposition to the human. Corrections are accepted verbatim as baseline.
   - **Dynamic Deduplication Gate**: Scans `LOGICAL_LEDGER.md` for near-duplicates ($\tau_{\text{dup}} = 0.50$). In Human mode, emits `POTENTIAL_DUPLICATE_FLAG` to prompt user decision without CLI flags. In Autonomous mode, auto-updates if $\text{sim} > 0.85$ or auto-branches if $0.50 \le \text{sim} \le 0.85$.
   - Commits confirmed baseline to `LOGICAL_LEDGER.md` as `FORMULATED`.

#### 5.0.1 Deterministic Validation and the Solver-Failure Taxonomy

A `FORMULATED` entry is not yet challengeable. It must first pass a deterministic solver check, which validates the *form* of the argument — whether $C$ follows from $P_1 \ldots P_n$ — and nothing else. The solver cannot establish that a premise is true in the world; that is the job of the challenge exchange that follows, using cited evidence and tool probes, not the solver.

A solver run returns one of five outcomes, and only one of them is a refutation:

| Outcome | Meaning | Routing |
|---|---|---|
| **Formally invalid** | The conclusion doesn't follow, or the premises are self-contradictory. | `REJECTED` immediately — the only outcome that auto-refutes. |
| **Malformed** | The logical set wasn't translated into solver-readable form correctly. | Reformulate the representation and re-run. Not a refutation. |
| **Unsupported expression** | The solver can't represent the claim being made. | Fall back to internal reasoning; flag it in the ledger. Not a refutation. |
| **Inconsistent premises** | The premise set itself contains a contradiction independent of $C$. | Return to `/add-logic` to resolve which premise is wrong. |
| **Undecidable** | The solver can't determine an answer either way. | Mark `UNCERTAIN`; route to an empirical probe. |

Only genuine formal invalidity produces an immediate `REJECTED` and a Contrastive Refutation Rule. Everything else keeps the argument alive and routes it toward reformulation, `/add-logic`, or an empirical probe — never toward a false refutation.

```
===================================================================================
MODE A: USER GRILL-LOGIC (Interactive Concordance Loop)
===================================================================================

       [ STATE: S_U0A_PREFLIGHT_CHECK ] Ingest proposal & evaluate negative constraints
                 │
                 ├── Collision with REJECTED rule (Score >= 0.30) → HALT (Exit Code 1)
                 └── Clean (Score < 0.30) → Proceed
                 │
                 ▼
       [ STATE: S_U0B_ADD_LOGIC ] /add-logic — Human ↔ LLM, always (§2.1.1, §5.0)
                 ├── Decompose premises (P1..Pn) and conclusion (C)
                 ├── Present interpretation; human confirms, or corrects verbatim
                 ├── Dynamic Dedup Check (τ_dup = 0.50) → Zero User Flags resolution
                 └── Commit confirmed entry as FORMULATED
                 │
                 ▼
       [ STATE: S_U1_PREMISE_ISOLATION ]
                 ├── Expose Latent/Hidden Assumptions (P_hidden) beyond the FORMULATED set
                 └── Isolate Turnstile (P => C) for solver input
                 │
                 ▼
       [ STATE: S_U1B_VALIDATION ] Deterministic solver check (§5.0.1)
                 ├── Valid                    → proceed to S_U2_CHALLENGE
                 ├── Malformed                 → reformulate representation, retry
                 ├── Unsupported / Undecidable → mark UNCERTAIN, route to probe
                 ├── Inconsistent premises     → return to S_U0B_ADD_LOGIC
                 └── Formally invalid          → REJECTED immediately, halt (only auto-refuting case)
                 │
                 ▼
       [ STATE: S_U2_CHALLENGE ]
                 ├── Execute rapid tool probes / doc lookups
                 ├── Emit rigorous counter-arguments & empirical bounds
                 └── ZERO SOLUTIONS ALLOWED (90/10 Gating)
                 │
                 ▼
       [ STATE: S_U3_AWAIT_USER ] Human evaluates challenge
                /                              \
       (User Counters)          (User Accepts, or has no empirical counter)
              /                                  \
             ▼                                    ▼
   [ STATE: S_U4_EVAL_COUNTER ]          [ STATE: S_U6_CONCORDANCE ]
      ├── Empirical counter cited?           ├── Record SUPPORTED in Ledger —
      │    Yes → tally.premises.disagree++,  │   procedural: no rejection backed
      │          re-evaluate; may REJECT     │   by an empirical counter remains,
      │    No  → does not count as a         │   not a claim the human agrees
      │          rejection (§2.1.1, §5.0)    └── Unlock Solution Gating
      ├── Update Behavioral Log                   │
      │   (New Proposition: Y/N)                  ▼
      ├── Compute S_human (dampened)      [ STATE: S_U7_SOLUTION_PRESENTATION ]
      └── Synthesize Middle Ground             ├── Run C (or synthesized C') through
      +-----> Loop to S_U2                     │   solver → TENTATIVE_SOLUTION
                                                ├── Present 3 Options + Free Response
                                                ├── Execute harness `ask_question` tool
                                                └── STOP GENERATION (Strict Yield)
                                                │
                                                ▼
                                           [ STATE: S_U8_TERMINATION ]
                                                └── Chosen option → ACCEPTED_SOLUTION once
                                                    tally.solution shows no rejection
                                                    backed by an empirical counter

===================================================================================
MODE B: SELF-GRILL (Autonomous Frontier-Depletion Epistemic Engine)
===================================================================================

       [ STATE: S_A0A_PREFLIGHT_CHECK ] Ingest proposal & evaluate negative constraints
                 │
                 ├── Collision with REJECTED rule (Score >= 0.30) → HALT (Exit Code 1)
                 └── Clean (Score < 0.30) → Proceed
                 │
                 ▼
       [ STATE: S_A0B_ADD_LOGIC ] /add-logic — Human ↔ LLM, always (§2.1.1, §5.0)
                 ├── Decompose premises (P1..Pn) and conclusion (C)
                 ├── Present interpretation; human confirms, or corrects verbatim
                 ├── Dynamic Dedup Check (τ_dup = 0.50) → Autonomous Auto-Resolution
                 └── Commit confirmed entry as FORMULATED
                 │
                 ▼
       [ STATE: S_A0C_VALIDATION ] Deterministic solver check (§5.0.1)
                 ├── Valid                    → proceed to S_A1_TOKEN_ISSUE
                 ├── Malformed                 → reformulate representation, retry
                 ├── Unsupported / Undecidable → mark UNCERTAIN, route to probe
                 ├── Inconsistent premises     → return to S_A0B_ADD_LOGIC
                 └── Formally invalid          → REJECTED immediately, halt (only auto-refuting case)
                 │
                 ▼
       [ STATE: S_A1_TOKEN_ISSUE ] State engine generates session `dispatch_token`
                 │
                 ▼
       [ STATE: S_A2_SPAWN_CHALLENGER ]
                 ├── Spawn virgin subagent (clean context, W_subagent = 0.8)
                 └── Single loss function: "Challenge correctness ruthlessly"
                 │
                 ▼
       [ STATE: S_A3_ROUND_1_CHALLENGE (Frontier Expansion) ]
                 ├── Challenger Backward Inversion CoT
                 ├── Execute real empirical tool probe (run_command, view_file, etc.)
                 ├── Populate Epistemic Frontier: F = { e1, e2, ... }
                 ├── Record audit: --verdict CHALLENGE_ISSUED (S_LLM unassessed)
                 └── 0% SOLUTIONS PERMITTED (90/10 Invariant)
                 │
                 ▼
       [ STATE: S_A4_ROUND_2_PROPOSER_CONFRONTATION ] — the two parties: LLM ↔ Subagent (§2.1.1)
                /                                      \
       (LLM Counters with C')                    (LLM Concedes)
              /                                          \
             ▼                                            ▼
   [ STATE: S_A5_SUBAGENT_EVAL ]                [ STATE: S_A6_REJECTION ]
      ├── Proposer Forward Synthesis CoT           ├── F collapses (F = ∅) — the
      ├── Challenger computes structural S_LLM     │   concession stands against the
      │   (S_syco, S_conf, F_einstellung)          │   Round 1 empirical probe, which
      ├── Run follow-up probe on C'                │   is itself the empirical counter
      ├── Each F item clears only via an           ├── Commit REJECTED to Ledger
      │   empirical counter or explicit             └── Hard-block code generation
      │   concession, never mere silence
      │   (§2.1.1, §4.3 ledger spec)
      │
      ├── Contradictions Remain (F ≠ ∅ after R2) ──> [ Escalate to W_human = 1.0 ]
      │
      └── All Points Addressed (F = ∅)
                 │
                 ▼
       [ STATE: S_A7_CONCORDANCE_SIGN_OFF ]
                 ├── Subagent executes signoff-subagent --token [token]
                 ├── Commit SUPPORTED to Ledger
                 └── Generate Solution Triad (Minimal, Robust, Scale)
                     each option enters as TENTATIVE_SOLUTION until tallied
                 │
                 ▼
       [ STATE: S_A8_HUMAN_DELIVERY ]
                 └── Deliver verified architecture with empirical findings;
                     chosen option → ACCEPTED_SOLUTION once tally.solution
                     shows no rejection backed by an empirical counter
```

### 5.1 Frontier-Depletion Epistemic Closure Protocol
Rather than terminating on arbitrary round limits or subjective model feelings, Self-Grill terminates strictly via **Frontier Depletion**:

1. **Epistemic Frontier Definition**:
   $$\mathcal{F} = \{ \text{unexamined contradictions}, \text{untested assumptions}, \text{unaddressed probe findings} \}$$
2. **Closure Condition**:
   A verification exchange reaches valid autonomous concordance if and only if:
   $$\mathcal{F} = \emptyset$$
3. **Bounding Invariant**:
   The autonomous exchange is strictly bounded to **2 rounds**:
   - **Round 1**: Challenger expands the frontier ($\mathcal{F}$) by isolating hidden assumptions and executing empirical tool probes.
   - **Round 2**: Proposer addresses every element in $\mathcal{F}$ by conceding or synthesizing $C'$. The challenger verifies $C'$ via structural $S_{\text{LLM}}$ accounting and follow-up probing.
   - **Escalation Barrier**: If $\mathcal{F} \neq \emptyset$ after Round 2, the system does not loop indefinitely; it halts and escalates directly to the human sovereign ($W_{\text{human}} = 1.0$) with an explicit contradiction report.

### 5.2 The Empirical-Counter Rule and Procedural Agreement Tallies

To prevent silent pass-throughs and ambiguous consensus, Grill-Logic formalizes the conditions under which an argument or solution transitions to `SUPPORTED` or `ACCEPTED_SOLUTION`:

1. **The Empirical-Counter Rule**:
   A rejection is never accepted as epistemically valid unless it is substantiated by a concrete empirical tool probe (`view_file`, `grep_search`, `run_command`) or an undeniable deductive contradiction. A party's mere skepticism, unsupported preference, or rhetorical doubt does not invalidate a premise.

2. **Procedural Advance Over Subjective Belief**:
   The absence of an empirical counter from a party is not an affirmative declaration of absolute truth—it signifies that no substantiated refutation stands against the inferential leap $(P_1 \land \dots \land P_n) \implies C$. The protocol has procedural clearance to advance, preventing infinite circular debate.

3. **Disaggregated Epistemic Tallies**:
   Rather than collapsing verification into a single binary flag, the state engine maintains discrete, independent 3-way tallies (`agree`, `disagree`, `uncertain`) tracked separately across:
   - **Premise Tally**: Evaluates whether the foundational assumptions $(P_1 \dots P_n)$ are empirically sound.
   - **Solution Tally**: Evaluates whether the proposed architecture or code implementation ($C$ or $C'$) satisfies all operational constraints.

An entry transitions to `SUPPORTED` (for premises) or `ACCEPTED_SOLUTION` (for solutions) only when the respective disagree tally contains zero unaddressed empirical counters.

---

## 6. Ledger Synchronization & Cross-Turn Persistence

Epistemic states do not evaporate across conversation turns. All verified premises, rejected hypotheses, and active **Contrastive Refutation Rules** are durably committed to [`LOGICAL_LEDGER.md`](../LOGICAL_LEDGER.md).

### Schema Invariants
Every entry in the ledger must conform to the canonical 6-column schema:
* **Arg ID**: Unique sequential argument identifier (e.g., `ARG-004`).
* **Premises (P)**: Isolated problem preconditions, operational facts, and assumptions.
* **Proposed Conclusion (C)**: Target architectural decision or implementation hypothesis.
* **Status**: Epistemic state (`FORMULATED`, `SUPPORTED`, `REJECTED`, `SUPERSEDED`, `TENTATIVE_SOLUTION`, or `ACCEPTED_SOLUTION`).
* **Challenger & Evidence**: Challenging party along with verifiable empirical probe commands and outputs.
* **Resulting Action / Contrastive Refutation Rule**: Mandatory behavioral constraint binding all future turns for rejections (e.g., *"When handling mobile offline checkout, DO NOT mirror 120,000 menu items locally or implement distributed multi-master sync because mobile payload bloat (100MB+) and inventory volatility cause checkout rejections. Instead, persist draft carts locally and use idempotent HTTP retry queues"*), or approved design action for supported entries.

If a future turn re-proposes an argument resting upon a `REJECTED` premise, the continuous Epistemic Gate rule intercepts the prompt immediately, citing the Contrastive Rule and aborting execution before code changes occur.

---

## 7. Comparative Analysis: Systematic Remediation Matrix

The following matrix documents how Grill-Logic v2.2 systematically remediates each failure mode discovered across empirical dogfooding and contemporary literature:

| Failure Mode | Root Cause in Conventional Agents | Grill-Logic v2.2 Architectural Fix |
| :--- | :--- | :--- |
| **1. Single-Turn Simulated Monologue** | Single LLM simulated both challenger and defender in one text block. | **State S_A2**: Subagent spawned fresh via harness tool (`invoke_subagent`). Fresh context guarantees $W_{\text{subagent}} > W_{\text{LLM}}$. |
| **2. Sycophancy & Circular Self-Critique** | Single model had identical incentives and rationalized its own past CoT. | **$S_{\text{LLM}}$ at Full Strength**: Epistemic skepticism signal derived from direct CoT inspection. Subagent has a singular loss function. |
| **3. Premature Solution Synthesis** | Model rushed to write code and config while questioning premises. | **90/10 Invariant**: Hard state barrier. Solutions are strictly forbidden until State `S_U7` / `S_A7` (the turn *after* concordance). |
| **4. Academic Jargon Leaking (`⊢`, etc.)** | Unfiltered prompt instructions leaked symbolic logic notation into chat. | **Auditable Behavioral Logging**: Logical formalization is maintained internally in metadata/ledger; user-facing dialogue uses plain-English engineering terms. |
| **5. Interrogation & Setup Fatigue** | Brittle multi-tier interactive setup scripts asked redundant user questions. | **Zero-Config Protocol Defaults**: Seamless transition between interactive User Grill-Logic and autonomous Self-Grill without manual flag parsing. |
| **6. Correlated Errors in Homogeneous Judges (Amazon Science)** | Symmetrical agents share training biases, overlooking the same assumptions. | **Asymmetric CoT Topologies**: Challenger executes Backward Inversion CoT; Proposer executes Forward Synthesis CoT. |
| **7. Recommendation Forking / Premature Concession** | Challenger suggests alternative architectures in Round 1, short-circuiting debate. | **0% Solution Round 1 Invariant**: Challenger may only expose assumptions and run probes. Solutions unlocked post-concordance only. |
| **8. Arbitrary Debate Oscillation / Stagnation** | Debates terminate on arbitrary turn counts or subjective feelings. | **Frontier-Depletion Closure**: Terminate when $\mathcal{F} = \emptyset$. Max 2 autonomous rounds before mandatory human escalation. |
| **9. Pseudo-Math & "Rigor Theater"** | Abstract floating-point scores or RRF calculations pretend to quantify truth. | **Structural Impossibility**: Binary state barriers, token locks, tool execution proofs, and fail-closed exit codes. |
| **10. Overloaded Acceptance Semantics** | Conflated interpretation confirmation, premise truth, solver validity, and consensus under a single flag. | **Epistemic State Disaggregation (§5.0, §5.2)**: Disaggregated into discrete states: `FORMULATED`, `Validating`, `SUPPORTED`, `TENTATIVE_SOLUTION`, and `ACCEPTED_SOLUTION`. |
| **11. Solver Failure Treated as Refutation** | Treated malformed representations, parser limits, or undecidability as proving premises false. | **5-Way Solver Taxonomy (§5.0.1)**: Only `formally_invalid` auto-refutes. Other failure types route to reformulation, premise repair, or empirical probes. |
| **12. Conflation of Formal Validity and Empirical Truth** | Believed passing deductive structure ($P \vdash C$) proved premises exist in reality ($P \in \text{Reality}$). | **Structural/Empirical Decoupling (§5.0.1)**: Solvers evaluate deductive validity only. Ground truth is strictly established via empirical tool probes. |
| **13. Silence Conflated with Agreement** | Assumed absence of a counter-argument equaled positive human or subagent assent. | **The Empirical-Counter Rule & Tallies (§2.1.1, §5.2)**: A rejection is accepted only when backed by empirical counter-evidence. Agreement tracked via 3-way tallies (`agree`, `disagree`, `uncertain`). |
| **14. Ambiguous Agent Hierarchy / 3rd-Party Drift** | Treated subagents as independent third parties requiring separate consensus loops. | **Strict Two-Party Invariant (§2.1.1)**: Exactly two parties per mode (`/grill-logic`: Human ↔ LLM; `/self-grill`: LLM ↔ Subagent with delegated authority). |
| **15. Static Epistemic Firewall Fragility & Polarity Traps (ADR-0003)** | Static regex and naive bag-of-words similarity fail on semantic drift and block valid alternatives. | **Falsified Boundary Normalization (§2.5.1)**: Target space normalized strictly to $C_{\text{rejected}} \cup R_{\text{refute\_boundary}}$ using sublinear TF + bigram vector cosine similarity ($\tau = 0.30$). |
| **16. Trojan-Horse Composite Proposal Bypass** | Conflated negative constraints with positive advice, allowing proposals to bypass blocks by citing alternatives. | **Pure Negative-Constraint Falsification (§2.5.1)**: Alternatives ($C'$) are segregated as contextual advice, eliminating bypass passkeys. |
| **17. CLI Flag Fatigue & Autonomous Deadlock** | Brittle user CLI flags required developers to enter `--arg-id` and caused headless `/self-grill` agents to deadlock. | **Zero-Flag User Contract & Autonomous Dedup (§2.5.3)**: Natural language conversational mapping for developers; programmatic threshold auto-resolution for agents. |
| **18. Hardcoded Dictionaries & Loss of Domain Agnosticism** | Hardcoded technology lists broke universality outside predefined web stacks. | **User Sovereignty Allow-List (§2.5.2)**: Custom exemptions and threshold overrides strictly managed by user in `.grill-logic/allowlist.json`. |

---

## 8. Conclusion

By grounding agentic verification in the **Autonomy Weight ($W$)**, the **Skepticism Signal ($S$)**, **Asymmetric Chain-of-Thought topologies**, **Frontier-Depletion Epistemic Closure**, and the **Dynamic Negative-Constraint Firewall (ADR-0003)**, Grill-Logic v2.2 transforms LLM architectural reasoning from agreeable prompt theater into a rigorous, verifiable engineering instrument. It eliminates sycophancy without disempowering human developers, ensuring that software systems and infrastructure are built only upon epistemically sound, empirically proven foundations.

---

## Appendix: Document Revision History

**v2.2.0 (this revision).** Closes six ambiguities surfaced by an audit of the Challenge protocol:

1. Formalizes `/add-logic` as a mandatory interpretation gate preceding both state machines (§2.1.1, §5.0).
2. Adds an explicit deterministic-validation phase with a solver-failure taxonomy, so a failed check is no longer treated as automatic refutation (§5.0.1).
3. Separates formal validity from empirical truth (§5.0.1).
4. Replaces "no counter implies agreement" with a two-party Empirical-Counter Rule and an agreement tally (§5.2).
5. States the two-party invariant explicitly, including that `/add-logic` itself is always Human ↔ LLM even under Self-Grill (§2.1.1).
6. Formalizes Pure Negative-Constraint Falsification (ADR-0003), eliminating composite Trojan-horse bypasses, normalizing target evaluation strictly to the conjunction of falsified conclusion and prohibited failure boundary ($C_{\text{rejected}} \cup R_{\text{refute\_boundary}}$), and enforcing the Zero-Flag User Contract.

See §7 for the updated failure-mode remediation matrix (rows 10–18) and `logical-ledger-spec.md` v1.1 for the corresponding schema changes.
