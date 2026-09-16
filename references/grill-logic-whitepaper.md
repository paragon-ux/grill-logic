# Grill-Logic Architecture Whitepaper: Game-Theoretic Epistemic Verification for Agentic Coding

**Document Version:** 2.0.0  
**Status:** Canonical Architectural Synthesis  
**Authors:** Paragon UX / Grill-Logic Core Architecture Team  
**Date:** September 2026  

---

## Abstract

Modern large language model (LLM) coding agents routinely fail during complex architectural reasoning due to five interconnected cognitive vulnerabilities: **sycophancy**, **premature solution offering**, **confirmation bias**, **academic jargon leakage**, and **simulated monologue theater** (in which a single agent simulates adversarial debate within one inference turn without genuine epistemic tension). 

This paper introduces the architecture of **Grill-Logic v2**, a harness-agnostic epistemic verification system founded on Diverse Multi-Agent Debate (DMAD lineage; ICLR 2025), asymmetric autonomy weighting, and strict state-gated execution. We formalize two core variables: **Autonomy Weight ($W$)**, an ordinal ranking derived from evidence-independence and dependence-clarity, and **Skepticism Signal ($S$)**, a meta-cognitive evaluation whose weight scales inversely with the target's $W$. By decoupling *challenger-credibility* from *target-deference* and enforcing a **90% challenge / 10% solution invariant**, Grill-Logic guarantees rigorous architectural stress-testing without disempowering human judgment or degenerating into unconstrained prompt theater.

---

## 1. Introduction & The Epistemic Crisis in Agentic AI

When coding assistants are tasked with evaluating architectural proposals—such as selecting distributed databases, introducing messaging queues, or defining microservice boundaries—they frequently prioritize conversational agreeableness and fluent text generation over empirical and logical truth.

In field testing (specifically observed in empirical dogfooding transcripts), five fatal failure modes consistently emerge:

1. **Simulated Monologue Theater**: When prompted to perform "multi-round verification" within a single turn, an LLM merely changes its mind sequentially in a single output stream, simulating a debate rather than introducing independent information or genuine adversarial pressure.
2. **Sycophancy & Epistemic Drift**: The LLM rapidly defers to user bias or circular self-justification, frequently admitting in hindsight that its reasoning suffered from the "streetlight effect" (searching where it is easy rather than where the truth lies).
3. **Premature Solution Offering ("Solution Vomiting")**: The LLM rushes to generate complex code, infrastructure configurations, and multi-tier implementations before the core problem premises have been validated.
4. **Academic Jargon Leakage**: When instructed to perform formal logic, agents frequently leak abstract notation (e.g., turnstiles `⊢`, propositional calculus symbols, epistemic frontier labels) into conversational responses rather than delivering plain-English technical analysis.
5. **Mode Confusion & Setup Fatigue**: Users are subjected to multi-stage interrogations regarding configuration rather than clean, deterministic operational execution.

Grill-Logic resolves this epistemic crisis by treating architectural validation not as a conversational roleplay, but as a **formal game-theoretic protocol** executed across two distinct modes: **User Grill-Logic** (human-in-the-loop concordance) and **Self-Grill** (autonomous multi-agent audit).

---

## 2. Theoretical Foundations: The $W$ and $S$ Epistemic Framework

### 2.1 The Autonomy Weight ($W$)

The **Autonomy Weight ($W$)** is an ordinal ranking representing an actor's epistemic integrity and authority at the moment of evaluation. It is parameterized along two non-separable dimensions:

$$\text{Autonomy Weight } (W) = f(\text{Evidence-Independence}, \text{Dependence-Clarity})$$

1. **Evidence-Independence**: Whether the actor encounters the specific premise/evidence fresh, with zero prior authorship of, psychological attachment to, or conversational commitment to the proposal under review.
2. **Dependence-Clarity**: Whether the actor's optimization objective is governed by a singular, legible loss function (e.g., "challenge validity ruthlessly") or compromised by multiple entangled, competing objectives (e.g., pleasing the user, preserving conversational tone, defending past generated code).

Independence *conditions* dependence-clarity: an agent whose context is burdened with historical conversation cannot credibly claim a clean loss function.

#### Relative Ordering of $W$:
* **In Self-Grill**: 
  $$W_{\text{subagent}} > W_{\text{LLM}}$$
  The subagent is freshly instantiated with only a task handoff. It possesses zero conversational baggage (high evidence-independence) and a single, uncompromised loss function: *challenge correctness* (high dependence-clarity). The main continuous LLM carries forward multiple conflicting signals (helpfulness, tone maintenance, narrative momentum), resulting in low $W$.
* **In User Grill-Logic**:
  $$W_{\text{human}} \gg W_{\text{LLM}}$$
  The human carries sovereign consequence-stakes and ultimate operational responsibility. Even if the human exhibits cognitive bias, their authority to make the final trade-off is absolute.
* **Delegation in Self-Grill**:
  $$W_{\text{human}} \xrightarrow{\text{delegation}} W_{\text{subagent}}$$
  When the human commands the system to run Self-Grill, they vest their challenge authority in the freshly spawned subagent.

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

#### The Governing Law:
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

#### Generating $S_{\text{LLM}}$ (Introspection-Based):
Because the subagent has direct access to the main LLM's full chain-of-thought (CoT) and generated argument trace, $S_{\text{LLM}}$ is computed via direct structural inspection:
1. **Sycophancy Score**: Detection of unearned concessions or pandering to prior assumptions.
2. **Confirmation Bias Metric**: Ratio of supporting citations vs. unexamined counter-evidence.
3. **Epistemic Risk Level**: Evaluated as `LOW`, `MODERATE`, or `HIGH`, dictating how rigorously the LLM must re-evaluate its conclusions.

#### Generating $S_{\text{human}}$ (Behavioral Log-Derived):
An LLM cannot reliably infer a human's internal psychology, motives, or emotional state; attempts to do so result in patronizing tone or epistemic hallucinations. Therefore, $S_{\text{human}}$ is calculated **exclusively from auditable behavioral metrics**:

$$\text{Reassertion Ratio } (R_{\text{reassert}}) = \frac{\sum \text{Turns with No New Proposition}}{\sum \text{Turns with New Proposition or Evidence}}$$

* For every user turn, the system records a deterministic binary flag: does this turn introduce a new empirical claim, constraint, or line of reasoning ($Y$), or does it merely reassert a previous stance ($N$)?
* If $R_{\text{reassert}}$ exceeds a threshold (e.g., 3 consecutive $N$ turns), $S_{\text{human}}$ triggers a transparent diagnostic query:
  > *"You have held this architectural position across three rounds without introducing new constraints or evidence. Would you like to address the open counter-evidence regarding [X], or intentionally accept this operational trade-off and proceed?"*
* Under no circumstance does $S_{\text{human}}$ lock the user out or override their decision.

---

## 3. Lineage: Diverse Multi-Agent Debate (DMAD, ICLR 2025) to Grill-Logic

Grill-Logic v2 is a direct intellectual descendant and operational extension of **Diverse Multi-Agent Debate (DMAD)** ([ICLR 2025](https://openreview.net/forum?id=t6QHYUOQL7); [GitHub: MraDonkey/DMAD](https://github.com/MraDonkey/DMAD)):

```
[ Single-Model Self-Reflection ] 
       │ (Fails due to inherent fixed thinking patterns & circular CoT)
       ▼
[ Standard Multi-Agent Debate (MAD) ]
       │ (Assigns superficial personas, but agents share homogeneous reasoning methods;
       │  devolves into the Einstellung effect / "fixed mental set" and sycophancy)
       ▼
[ Diverse Multi-Agent Debate (DMAD) ]
       │ (Breaks fixed mental sets by equipping agents with distinct reasoning approaches
       │  and diverse problem-solving strategies; outperforms MAD in fewer rounds)
       ▼
[ Grill-Logic v2: Asymmetric W/S Epistemic Architecture ]
       │ (Operationalizes DMAD for software architecture: fresh subagent context,
       │  Autonomy Weight W, Skepticism Signal S, decoupled credibility, and 90/10 gating)
```

### 3.1 The Fixed Mental Set Problem in LLM Reasoning
As established by the DMAD research, previous approaches to LLM truth maintenance exhibit fundamental cognitive ceilings:
1. **Self-Reflection Failure**: An individual model cannot reliably correct its own foundational reasoning mistakes because its reflective prompts remain bounded by the exact same inductive biases and representations that produced the initial error.
2. **The MAD Persona Trap (Einstellung Effect)**: Traditional Multi-Agent Debate (MAD) introduces multiple agents to challenge reasoning, but differentiates them purely through *cosmetic personas* (e.g., "Software Architect" vs. "DevOps Engineer"). Underneath these roleplay wrappers, the underlying models employ the **identical reasoning methods**, resulting in a shared, homogeneous mental set where models fail to explore genuinely alternative hypotheses.

DMAD solves this by forcing agents to employ **distinct problem-solving strategies** (e.g., backward reasoning, decomposition, deductive refutation) rather than superficial personas, proving across benchmarks that true cognitive diversity breaks fixed mental sets and converges to optimal solutions in fewer rounds.

### 3.2 How Grill-Logic v2 Synthesizes and Extends DMAD
Grill-Logic operationalizes DMAD's breakthrough specifically for software engineering and architectural reasoning, resolving three practical challenges unaddressed by pure debate research:

1. **Methodological Diversity Over Persona Roleplay**: In Grill-Logic's Self-Grill, the subagent is not prompted as a cosmetic persona. Instead, it is tasked with executing concrete, distinct problem-solving methods:
   - *Backward Refutation*: Testing whether conclusion $C$ is uniquely necessary or if a lower-complexity $C'$ satisfies the premises.
   - *Empirical Determinism*: Executing rapid sandbox probes, compiler checks, or documentation queries rather than relying on generative speculation.
   - *Premise Inversion*: Constructing explicit counter-hypotheses ($P_{\text{alt}} \vdash \neg C$).
2. **Context Independence via Autonomy Weight ($W$)**: Even diverse reasoning strategies collapse if agents share conversational history and sunk-cost commitments. Grill-Logic guarantees epistemic independence by instantiating the DMAD challenger as a virgin subagent ($W_{\text{subagent}} > W_{\text{LLM}}$) with a single, uncompromised loss function: *challenge correctness*.
3. **$S_{\text{LLM}}$ as an Einstellung Detection Signal**: The subagent inspects the main LLM's chain-of-thought specifically to detect whether the proposer has fallen into a fixed mental set, sycophancy trap, or confirmation loop, providing a quantifiable risk assessment.
4. **Actor-Agnostic Extension**: Grill-Logic extends DMAD beyond model-to-model debate into a unified triad encompassing the developer ($W_{\text{human}}$), autonomous subagents ($W_{\text{subagent}}$), and deterministic runtime tools.

---

## 4. The 90/10 Invariant & Gated Solution Delivery

A fundamental axiom of Grill-Logic is the **90/10 Rule**:
> **An architectural intelligence system must allocate ~90% of its capacity to challenging premises, and at most ~10% to offering solutions.**

### The Turn-Gating Invariant:
* Under no circumstances may an agent generate architectural solutions, code implementations, or migration blueprints during a premise-challenging turn.
* Solutions may be emitted **only on the turn following verified concordance**.

### The Solution Triad Protocol:
Once concordance on conclusion $C$ is reached, solutions are presented in a structured format:
1. **Solution 1 (Minimal / Standard Library)**: The lowest-complexity approach that satisfies the validated premises without external operational bloat.
2. **Solution 2 (Robust / Standard Pattern)**: The industry-standard architecture balancing operational maintenance with resilience.
3. **Solution 3 (Advanced / High-Scale Pattern)**: The fully decomposed or horizontally distributed design, reserved for proven extreme constraints.
4. **Free-Response Option**: Allowing the user (or LLM in Self-Grill) to specify an unlisted hybrid.

In **User Grill-Logic**, these choices are rendered via the harness interactive question interface (`ask_question`). In **Self-Grill**, the subagent generates the solutions, the LLM selects or free-responds, and the subagent executes a formal **$S_{\text{LLM}}$ validation sign-off** before any output reaches the human.

---

## 5. Dual State Machine Architectural Specification

Grill-Logic formalizes its execution through two rigorous, deterministic state graphs.

```
===================================================================================
MODE A: USER GRILL-LOGIC (Interactive Concordance Loop)
===================================================================================

       [ STATE: S_U0_INIT ] User submits architectural proposal
                |
                v
       [ STATE: S_U1_PREMISE_ISOLATION ]
                |-- Extract Explicit Premises (P1..Pn)
                |-- Expose Latent/Hidden Assumptions (P_hidden)
                |-- Isolate Turnstile (P => C)
                v
       [ STATE: S_U2_CHALLENGE ]
                |-- Execute rapid tool probes / doc lookups
                |-- Emit rigorous counter-arguments & evidence
                |-- NO SOLUTIONS ALLOWED (90/10 Gating)
                v
       [ STATE: S_U3_AWAIT_USER ] Human evaluates challenge
               /                        \
      (User Counters)               (User Accepts)
             /                            \
            v                              v
  [ STATE: S_U4_EVAL_COUNTER ]    [ STATE: S_U6_CONCORDANCE ]
     |-- Update Behavioral Log         |-- Record Supported in Ledger
     |   (New Proposition: Y/N)        |-- Unlock Solution Gating
     |-- Compute S_human (dampened)    v
     |-- Synthesize Middle Ground [ STATE: S_U7_SOLUTION_PRESENTATION ]
     +-----> Loop to S_U2              |-- Present 3 Options + Free Response
                                       |-- Execute harness `ask_question` tool
                                       v
                                  [ STATE: S_U8_TERMINATION ]

===================================================================================
MODE B: SELF-GRILL (Autonomous Adversarial Epistemic Engine)
===================================================================================

       [ STATE: S_A0_INIT ] User requests autonomous verification / pre-flight gate
                |
                v
       [ STATE: S_A1_MAIN_REASONING ] Main LLM formulates initial proposal & CoT
                |
                v
       [ STATE: S_A2_SPAWN_ORACLE ]
                |-- Spawn virgin subagent (clean context, W_subagent > W_LLM)
                |-- Single loss function handoff: "Challenge correctness ruthlessly"
                v
       [ STATE: S_A3_SUBAGENT_AUDIT ]
                |-- Direct CoT inspection of Main LLM
                |-- Calculate S_LLM (Sycophancy, confirmation bias, risk level)
                |-- Formulate adversarial challenge + empirical evidence
                v
       [ STATE: S_A4_EVAL_CHALLENGE ] Main LLM evaluates subagent challenge
               /                        \
      (LLM Counters)               (LLM Accepts)
             /                            \
            v                              v
  [ STATE: S_A5_SUBAGENT_COUNTER ]  [ STATE: S_A6_CONVERGENCE ]
     |-- Full-strength S_LLM hits      |-- Synthesized Conclusion C verified
     |   main LLM                      |-- Subagent generates 3 solutions + free
     |-- Epistemic pressure forced     v
     +-----> Loop to S_A4         [ STATE: S_A7_SELECTION_SIGN_OFF ]
                                       |-- Main LLM selects or free-responds
                                       |-- Subagent evaluates free response
                                       |-- Subagent executes formal SIGN-OFF
                                       v
                                  [ STATE: S_A8_HUMAN_DELIVERY ]
                                       |-- Final synthesized verdict delivered
                                       |-- Human retains ultimate sovereign say
```

---

## 6. Ledger Synchronization & Cross-Turn Persistence

Epistemic states do not evaporate across conversation turns. All verified premises, rejected hypotheses, and active **Contrastive Refutation Rules** are durably committed to [`LOGICAL_LEDGER.md`](../LOGICAL_LEDGER.md).

### Schema Invariants:
Every entry in the ledger must specify:
* **Argument ID & Turnstile**: E.g., `ARG-004: {P1, P2} ⊢ C`
* **Actor Dynamics**: Target $W$, Challenger $W$, Applied $S$ strength.
* **Status**: `SUPPORTED`, `REJECTED`, or `SUPERSEDED`.
* **Contrastive Refutation Rule**: A mandatory behavioral constraint binding all future turns (e.g., *"If scaling read traffic on PostgreSQL, optimize query indices or use read replicas; DO NOT introduce Redis without measured cache-invalidation profiling"*).

If a future turn re-proposes an argument resting upon a `REJECTED` premise, the continuous Epistemic Gate rule intercepts the prompt immediately, citing the Contrastive Rule and aborting execution before code changes occur.

---

## 7. Comparative Analysis: Remediation of Dogfood Failures

The following matrix documents how the Grill-Logic v2 architecture systematically closes each failure mode discovered during empirical dogfooding:

| Dogfood Failure Mode | Root Cause in v1.0 | Grill-Logic v2 Architectural Fix |
| :--- | :--- | :--- |
| **1. Single-Turn Simulated Monologue** | Single LLM simulated both challenger and defender in one text block. | **State S_A2**: Subagent must be spawned fresh via harness tool (`invoke_subagent`). Fresh context guarantees $W_{\text{subagent}} > W_{\text{LLM}}$. |
| **2. Sycophancy & Circular Self-Critique** | Single model had identical incentives and rationalized its own past CoT. | **$S_{\text{LLM}}$ at Full Strength**: Epistemic skepticism signal derived from direct CoT inspection. Subagent has a singular loss function. |
| **3. Premature Solution Vomiting** | Model rushed to write code and config while questioning premises. | **90/10 Invariant**: Hard state barrier. Solutions are strictly forbidden until State `S_U7` / `S_A7` (the turn *after* concordance). |
| **4. Academic Jargon Leaking (`⊢`, etc.)** | Unfiltered prompt instructions leaked symbolic logic notation into chat. | **Auditable Behavioral Logging**: Logical formalization is maintained internally in metadata/ledger; user-facing dialogue uses plain-English engineering terms. |
| **5. Interrogation & Setup Fatigue** | Brittle multi-tier interactive setup scripts asked redundant user questions. | **Zero-Config Protocol Defaults**: Seamless transition between interactive User Grill-Logic and autonomous Self-Grill without manual flag parsing. |

---

## 8. Conclusion

By grounding agentic verification in the **Autonomy Weight ($W$)**, the **Skepticism Signal ($S$)**, and the **decoupling of challenger-credibility from target-deference**, Grill-Logic v2 transforms LLM architectural reasoning from agreeable prompt theater into a rigorous, verifiable engineering instrument. It eliminates sycophancy without disempowering human developers, ensuring that code and infrastructure are built only upon epistemically sound foundations.
