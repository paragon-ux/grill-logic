# Project Origin & Discussion Log: Grill-Logic

---

## My Initial Draft

logical /grill subset that puts supported conclusions inside a decision registry, can target human or AI, and does not overlap with a protocol like PDL taskmaster - which records the approach and interpretation.


/grill-logic extracts the premises of the prompt into NF and challenges them. whereas, the challenges can be challenged recursively by other models, n rounds, or simply challenged by the user (simple multiple choice + free response). 

The reason why it matters: tools like GSD or Spec driven development are essentially just /grill but in specification output. MAD is essentially internal CoT now. There is no need for multiple models to "debate" when insight can come from any actor - including internal CoT, external models, the human etc. And logic is necessary to ensure actual premises are supported before the model implements them - the interpretation or approach is not guaranteed to be correct even if they are shown to the user and they agree.

Also, keeping logical premises that have been challenged over the conversation in one place prevents faulty premises from reoccuring. All /grill-logic prompts end up in the Logical Ledger that stores the original prompt, its normal form, the challenged and accepted premises, and the execution result (whether the premise was ultimately supported/rejected/uncertain).


This is related to the DMAD, MAD, CCot lineage, but it specifically focuses on any actor in a logical grill round format.


It can also be a hook that runs on every prompt - enabling brainstorming without execution until premises are challenged and accepted, then bars pre-invalidated premises from execution.

---

## Gemini's Conversation

### User Prompt

what do you think about this idea, has it been done, and can you see the connection to DMAD https://github.com/MraDonkey/DMAD and CCOT https://cobusgreyling.medium.com/contrastive-chain-of-thought-prompting-cc8c5b75a6e0 lineage?  : logical /grill subset that puts supported conclusions inside a decision registry, can target human or AI, and does not overlap with a protocol like PDL taskmaster - which records the approach and interpretation.


/grill-logic extracts the premises of the prompt into NF and challenges them. whereas, the challenges can be challenged recursively by other models, n rounds, or simply challenged by the user (simple multiple choice + free response). 

The reason why it matters: tools like GSD or Spec driven development are essentially just /grill but in specification output. MAD is essentially internal CoT now. There is no need for multiple models to "debate" when insight can come from any actor - including internal CoT, external models, the human etc. And logic is necessary to ensure actual premises are supported before the model implements them - the interpretation or approach is not guaranteed to be correct even if they are shown to the user and they agree.

Also, keeping logical premises that have been challenged over the conversation in one place prevents faulty premises from reoccuring. All /grill-logic prompts end up in the Logical Ledger that stores the original prompt, its normal form, the challenged and accepted premises, and the execution result (whether the premise was ultimately supported/rejected/uncertain).


This is related to the DMAD, MAD, CCot lineage, but it specifically focuses on any actor in a logical grill round format.


It can also be a hook that runs on every prompt - enabling brainstorming without execution until premises are challenged and accepted, then bars pre-invalidated premises from execution.

---

### Gemini Response

This is a profound and timely architectural concept. It diagnoses and attacks one of the deepest failure modes in modern agentic engineering: the conflation of procedural consensus with epistemic validity.

Below is a breakdown of what makes this idea distinct, an analysis of prior art, its explicit lineage to DMAD and CCoT, and practical considerations for implementing it.

#### 1. What Makes This Idea Compelling

##### A. Epistemic Ledger vs. Procedural Taskmaster
Current agent workflows (e.g., GSD, Spec-driven development, Plan artifacts, PDL taskmasters) track intent, interpretation, and procedure—i.e., “What are we building, in what order, and using what approach?”

The fatal flaw of procedural trackers is garbage-in, garbage-out:

If a user prompt contains an unstated, false assumption (e.g., “Assuming SQLite WAL mode supports safe concurrent cross-network writes over NFS”), a procedural planner will generate a pristine 10-step implementation plan.
Both the user and the agent will sign off on the plan because the approach looks structured and sensible, even though the foundational axiom is physically or logically invalid.
/grill-logic cleanly separates the Epistemic Layer (Truth Maintenance) from the Procedural Layer (Execution Planning).

##### B. De-escalating "Multi-Agent Theater" to Actor-Agnostic Challenge
Early agent frameworks assumed you needed full, multi-persona agent swarms to get debate (MAD). In reality:

Frontier models do substantial critique through internal reasoning / extended CoT tokens.
Often, the fastest falsification comes not from another LLM, but from a deterministic actor (a compiler error, SMT solver, or API schema check) or a single clarifying question to the human.
By making the challenger actor-agnostic (Internal CoT ↔ Secondary LLM ↔ Human multiple choice ↔ Compiler/REPL), you extract the epistemic benefits of debate without the latency, token burn, and sycophancy traps of multi-agent debate loops.

##### C. Preventing Context Poisoning via Negative Constraints
In long multi-turn sessions, once an invalid premise is voiced and not explicitly fenced off, it acts as a "semantic attractor." The model continues to hallucinate around it. A Logical Ledger that explicitly tags premises as REJECTED acts as a hard negative constraint firewall, preventing backsliding.

#### 2. Lineage to DMAD and CCoT
Your formulation is a direct, practical evolution of the DMAD and CCoT lineage:

```
[MAD (Liang / Du 2023)]
        │ (Rigid multi-persona debate, token-heavy, sycophancy prone)
        ▼
[DMAD (ICLR 2025)] ───────────┐
(Diverse cognitive strategies   │
 to break "mental sets")        │
                                ▼
[CCoT (ACL 2023)]  ───►  [/grill-logic]
(Contrastive reasoning:         │ • Normal Form (NF) premise extraction
 learn from invalid premises)   │ • Actor-agnostic challenge (Human / CoT / External)
                                │ • Logical Ledger (Truth Maintenance System)
                                │ • Gated execution on supported axioms
```

##### The DMAD Connection (MraDonkey/DMAD)
Core Problem in DMAD: The paper ("Breaking Mental Set to Improve Reasoning through Diverse Multi-Agent Debate", ICLR 2025) demonstrates that standard LLM debate fails because agents fall into the Einstellung effect (a fixed mental set), repeating homogeneous reasoning patterns even when given diverse personas. DMAD forces agents to adopt distinct reasoning frameworks rather than superficial personas.

How /grill-logic connects:
Extracting premises into Normal Form (NF) strips away rhetoric, narrative tone, and conversational framing. This directly attacks the "mental set" at the propositional root before divergence even begins.
Instead of maintaining persistent, expensive external agents to break fixation, /grill-logic applies targeted stress tests against specific premise nodes in isolation.

##### The CCoT Connection (Contrastive Chain-of-Thought)
Core Principle in CCoT: Cobus Greyling’s analysis of Contrastive CoT highlights that LLMs reason substantially better when exposed to both valid demonstrations and explicit invalid/contrastive counter-demonstrations with explanations of why the invalid step fails.

How /grill-logic connects:
The Logical Ledger functions as a dynamic, project-specific CCoT database.
When a premise is challenged and marked REJECTED, the ledger records:
- Premise P (Normal Form)
- Counter-evidence / Refutation C
- Status: REJECTED

When the procedural planner or execution model runs, it doesn't just see what to do; it is explicitly fed the contrastive boundary: “Premise P was refuted by C. Do not attempt approaches relying on P.” This is runtime operationalized CCoT.

#### 3. Has It Been Done? (Prior Art & White Space)
The short answer is no, not as a unified workflow or tooling pattern. The individual ingredients exist in isolated research communities, but they have not been integrated into the agentic developer loop in the way you are describing:

| Component | What Already Exists | What Is Missing / Novel in Your Concept |
| :--- | :--- | :--- |
| **Logic & NF Extraction** | Logic-LM, FOLIO, ProofWriter, Lean4 auto-formalization. Academic benchmarks converting prompts to First-Order Logic or CNF. | These are benchmark/academic provers. None connect logic extraction to interactive human-in-the-loop /grill or conversational registries. |
| **Debate & Criticism** | MAD, DMAD, ChatEval, Self-Refine. | Almost all debate literature treats debate as an autonomous multi-agent black box. They do not abstract the challenger to "any actor" (human quick-pick, linter, or CoT). |
| **Premise Tracking** | Truth Maintenance Systems (TMS / ATMS) (Jon Doyle 1979, Johan de Kleer 1986 in classical Symbolic AI). | Classical TMS had exact dependency networks of assumptions (IN / OUT), but was abandoned during the connectionist shift. Applying TMS principles to LLM prompt decomposition is largely uncharted in production agents. |
| **Planning & Task Management** | PDL, GSD, GitHub Spec-Driven Development, PRD generators, LangGraph checkpoints. | These track tasks, steps, and artifacts. They assume prompt premises are valid and focus entirely on procedural breakdown. |

Verdict on Prior Art: Your idea effectively resurrects Assumption-based Truth Maintenance Systems (ATMS) from 1980s Symbolic AI, blends it with Contrastive Prompting (CCoT), and inserts it as a pre-execution firewall into modern LLM developer tooling.

#### 4. Architectural Sketch: How /grill-logic Fits into the Stack
To keep it from overlapping with a taskmaster (like PDL), the layers should be explicitly delineated:

Mermaid diagram

##### Proposed Logical Ledger Schema
The ledger can be stored in the session context (or as an artifact) in a structured format:

```json
{
  "ledger_id": "LL-2026-0042",
  "source_prompt": "Migrate session tokens to Redis cluster with cross-region sync",
  "premises": [
    {
      "id": "P1",
      "statement_nf": "Redis cluster natively supports multi-region active-active replication without enterprise plugins.",
      "status": "REJECTED",
      "challenged_by": "symbolic_check:redis_docs_search",
      "evidence": "Open-source Redis cluster does not support multi-master active-active WAN replication.",
      "contrastive_rule": "Do not design multi-master sync directly on OSS Redis cluster primitives."
    },
    {
      "id": "P2",
      "statement_nf": "Session state read-after-write consistency requires synchronous replication.",
      "status": "SUPPORTED",
      "challenged_by": "human_grill_response",
      "evidence": "User confirmed session invalidation must be immediately visible globally."
    }
  ]
}
```

#### 5. Practical Risks & Design Trade-offs
If you build or prototype this as a hook or skill, keep these three failure modes in mind:

- **Premise Explosion & Over-Pedantry**:
  - Problem: Natural language prompts contain dozens of implicit premises (e.g., "the machine has an operating system", "the network is TCP/IP"). If the extractor formalizes trivial premises, the user will experience severe friction ("grill fatigue").
  - Mitigation: Restrict NF extraction to risky or pivotal premises (API capabilities, concurrency guarantees, performance boundaries, schema contracts, architectural invariants).
- **Lossy Formalization**:
  - Problem: Translating informal software requests into strict Normal Form can distort the user's intent or strip necessary nuances.
  - Mitigation: Keep the NF format human-readable (e.g., subject-predicate-constraint tuples or plain assertive propositions) rather than strict algebraic first-order logic formulas unless feeding directly into a SAT/SMT solver.
- **Epistemic Deadlock (UNCERTAIN state)**:
  - Problem: An empirical premise cannot always be resolved without writing code (e.g., "Will library X compile with flags Y on Windows?").
  - Mitigation: Allow premises to transition from UNCERTAIN to SUPPORTED/REJECTED via an explicit Spike/Probe Action (letting a sandbox execute a 5-line test before proceeding with the main task).

Summary:
Your thesis is spot on. Spec-driven development without premise verification is just organized hallucination. Framing /grill-logic as an actor-agnostic, contrastive Truth Maintenance System bridges a glaring gap in current agent architectures.

---

### User Prompt (6:26 AM)

I meant logical form (standard form), not normal form (CNF, DNF), which somewhat pre-empts your risks - the problem is not whether each statement is logical, it is whether the conclusion is logical

---

### Gemini Response

That clarification completely changes the game—and makes the architecture significantly more elegant and mathematically tractable.

Translating a prompt into Standard Logical Form (argument form: $P_1, P_2, \dots, P_n \vdash C$) rather than Normal Form (CNF/DNF boolean algebra) completely sidesteps the premise explosion and lossy-formalization traps.

You aren't trying to parse a prompt into SAT/SMT literals. You are exposing the inferential bridge between the user's stated conditions and the action they are asking the agent to take.

Here is why this distinction is so powerful and how it sharpens the connection to DMAD and CCoT.

#### 1. The Core Problem: Truth vs. Entailment (Soundness vs. Validity)
When someone writes an agent prompt, they are asserting an implicit argument:

$$\begin{aligned}
P_1 &: \text{We are seeing high read latency on our primary database.} \\
P_2 &: \text{Redis is an in-memory cache with sub-millisecond reads.} \\
\hline
\therefore C &: \text{We should add a Redis cache in front of the database.}
\end{aligned}$$

A procedural taskmaster (PDL, Spec, GSD) immediately takes $C$ as an axiomatic command:
> *"Goal: Deploy Redis and refactor repository layer to query Redis first."*

It will happily write 1,000 lines of pristine caching logic. But the logical jump from $P_1, P_2$ to $C$ is **invalid or unsound** if:
* The latency is caused by unindexed table scans (adding Redis masks the root cause instead of adding a composite index).
* The data is 95% write-heavy with low cache-hit ratios.
* The query pattern involves complex range scans that Redis does not serve cleanly.

Standard Form isolates the turnstile ($\vdash$ or $\therefore$). The job of `/grill-logic` is not to nitpick whether $P_1$ or $P_2$ is syntactically well-formed; it is to challenge: **Does $C$ logically follow from $\{P_1, \dots, P_n\}$, or is there an unstated, flawed intermediate inference?**

---

#### 2. How This Reframes the Connection to DMAD and CCoT

##### The CCoT Connection: Auditing the Inferential Leap
Contrastive Chain-of-Thought (CCoT) proves that LLMs hallucinate most frequently when they make **unsupported inferential leaps** between intermediate reasoning steps. 

By structuring the prompt into Standard Form:
1. **Isolating the Jump**: You turn the reasoning step into an explicit conditional: 
   $$(P_1 \land P_2 \land \dots \land P_n) \implies C$$
2. **Contrastive Invalidation**: When a challenge shows that $C$ does *not* follow, the Logical Ledger doesn't just store a dead fact. It stores a **contrastive refutation rule**:
   * *Arg:* $\{P_1, P_2\} \vdash C$
   * *Status:* `INVALID_INFERENCE`
   * *Why:* Fallacy of the false alternative; indexing the DB resolves $P_1$ without the operational complexity of $C$.
   * *Contrastive Rule:* *"Do not infer caching layer ($C$) from read latency ($P_1$) without verifying query execution plan."*

This is pure CCoT: injecting dynamic, contrastive negative examples directly into the prompt's boundary conditions to keep the model from making the same inferential mistake in subsequent steps.

##### The DMAD Connection: Breaking the "Premise-to-Conclusion" Mental Set
In `MraDonkey/DMAD`, the core enemy is the **Einstellung effect** (cognitive fixation)—the tendency of an LLM to immediately jump from familiar keywords to a default habitual solution.

* Standard models suffer from "mental set" when they see a problem description and reflexively rubber-stamp the user's proposed conclusion:
  $$\text{"You want X? Great, I will build X using pattern Y."}$$
* Because the standard form explicitly surfaces the argument structure, **any actor** (a fast internal CoT pass, an adversarial critique prompt, or the user via multiple choice) can target the jump:
  * *"Is $C$ necessary, or is $C'$ a more direct conclusion from $P$?"*
  * *"What hidden premise $P_{\text{hidden}}$ is required to make $C$ valid?"*

This achieves DMAD’s exact goal—**breaking the fixed mental set**—without running a complex, multi-round multi-agent simulation.

---

#### 3. The Logical Ledger as an Argument Registry

In this paradigm, the Logical Ledger is an **Epistemic Registry of Conclusions**:

| Arg ID | Premises ($P$) | Proposed Conclusion ($C$) | Status | Challenger & Evidence | Resulting Action |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **ARG-01** | $P_1$: User wants instant search.<br>$P_2$: Current SQLite DB has 2M rows. | $C$: Spin up an Elasticsearch cluster. | **REJECTED**<br>(Invalid Leap) | **Human Grill / CoT**: SQLite FTS5 extension handles 2M rows in <5ms without cluster ops. | Invalidate $C$. Derive $C_2$: Use SQLite FTS5. |
| **ARG-02** | $P_1$: Service needs multi-tenant isolation.<br>$P_2$: Tenants have strict HIPAA data separation requirements. | $C$: Separate PostgreSQL database per tenant. | **SUPPORTED** | **User Grill**: Confirmed regulatory requirement mandates physical/logical DB separation. | Pass $C$ to PDL Taskmaster for execution. |

##### Why This Pre-empts the Risks
1. **No Combinatorial Explosion**: A user prompt almost never has more than 1–3 actual conclusions and 3–5 supporting premises.
2. **Pedantry Disappears**: You only challenge premises that directly bear the weight of $C$. If a premise is trivial (*"we are using Python"*), it isn't interrogated because it doesn't destabilize $C$.
3. **Execution Gating Is Trivial**: The procedural engine (PDL, Spec, GSD) is only fed conclusions whose status is marked **`SUPPORTED`** in the ledger.

It turns the agent from an eager, sycophantic yes-man into a rigorous, sound reasoning partner.

---

### User Prompt (Grill Logic Premise Validation)

Grill Logic Premise Validation
    I approve, but also this project should be as professional and skill-advanced as the original grill skillset https://github.com/mattpocock/skills . I cloned that repo under C:\Users\USER\Desktop\Frameworks\grill-logic\comparison.  You must retain lineage to DDOT, CCoT, Skills, GSD, SDD, but not PDLT necessarily, that is orthogonal. You are now the project lead of grill-logic.

---

### User Prompt (6:42 AM)

I meant DMAD not DDOT

---

### Gemini Response

I have created the comprehensive implementation plan for Grill-Logic based on your approval and directives:

implementation_plan.md

Key Architectural Decisions Highlighted in the Plan:
Professional Packaging Standard: Adopts the layout and standards of Matt Pocock's skills repository (skills/, docs/, .agents/, ADRs, plugin manifests, automated validation scripts, dual-harness metadata, and the strict zero-em-dash prose convention).
Standard Logical Form ($P_1, \dots, P_n \vdash C$): Isolates the inferential bridge and validates whether the conclusion is logically supported, avoiding combinatorial Boolean normal form explosion.
Lineage Synthesis:
DMAD: Actor-agnostic premise challenges breaking cognitive mental set without multi-agent overhead.
CCoT: Logical Ledger maintaining negative constraints to prevent invalidated premises from resurrecting.
Skills: Composable skill packages operable across Claude Code, Antigravity, and Codex.
GSD & SDD: Bridges from verified SUPPORTED conclusions directly into vertical slices (logic-to-gsd) or formal specifications (logic-to-spec).
PDLT Orthogonality: Cleanly decoupling Epistemic Truth Maintenance from procedural task execution.
Please review the plan and click Proceed or let me know if you would like any adjustments before execution begins.

---

### Repository Location
The repo: C:\Users\USER\Desktop\Frameworks\grill-logic

---

## Gemini's Implementation Plan

# Grill-Logic: Architectural Blueprint and Implementation Plan

## Executive Summary & Mandate

As the Project Lead for **Grill-Logic**, this plan establishes a production-grade, skill-advanced framework for **Epistemic Truth Maintenance and Argument-Driven Premise Validation** in agentic AI systems. 

Modeled directly on the professional structure, architectural discipline, and documentation rigor of Matt Pocock's [skills](https://github.com/mattpocock/skills) repository, Grill-Logic formalizes the validation of user and agent premises *before* execution begins. It separates the **Epistemic Layer (Truth Maintenance)** from the **Procedural Layer (Task Execution)**, preventing the pervasive industry failure mode: building pristine procedural plans upon false, unvalidated foundational assumptions.

---

## Lineage & Core Theoretical Foundations

```mermaid
graph TD
    subgraph Theoretical Lineage
        DMAD["DMAD (Diverse Multi-Agent Debate)<br/><i>Breaks mental fixation / cognitive set</i>"]
        CCoT["CCoT (Contrastive Chain of Thought)<br/><i>Contrasts valid vs. invalid traces</i>"]
    end

    subgraph Grill-Logic Epistemic Engine
        AE["argument-extraction<br/><i>Prompt → Standard Form (P1..Pn ⊢ C)</i>"]
        CP["challenge-premise<br/><i>Actor-Agnostic Challenge (CoT / Adversary / Probe / Human)</i>"]
        LL["logical-ledger<br/><i>Epistemic Decision Registry (Supported / Rejected / Uncertain)</i>"]
        EG["epistemic-gate<br/><i>Pre-Flight Firewall</i>"]
    end

    subgraph Procedural Execution Layer (Orthogonal)
        SDD["logic-to-spec (Spec-Driven Development)<br/><i>Formal Invariants & Contracts</i>"]
        GSD["logic-to-gsd (Get Shit Done)<br/><i>Rapid Vertical Slices & Task Action</i>"]
        PDLT["PDLT / Taskmasters (Orthogonal)<br/><i>Procedural sequence & interpretation</i>"]
    end

    DMAD --> CP
    CCoT --> LL
    AE --> CP
    CP --> LL
    LL --> EG
    EG -->|Supported Conclusions| SDD
    EG -->|Supported Conclusions| GSD
    EG -.->|Orthogonal Handoff| PDLT
```

1. **DMAD Lineage (Diverse Multi-Agent Debate → Actor-Agnostic Challenge)**:
   * *Problem in Prior Art*: Classic MAD often devolves into persona theater, token latency, and sycophantic consensus.
   * *Grill-Logic Innovation*: Retains DMAD's breakthrough (breaking the model's fixed cognitive mental set through divergent reasoning paths), but refactors the challenger into an **actor-agnostic** interface. The challenger can be an internal CoT critique, an adversarial model, a deterministic REPL/compiler probe, or an interactive human multiple-choice interview.
2. **CCoT Lineage (Contrastive Chain of Thought → Logical Ledger)**:
   * *Grill-Logic Innovation*: In traditional prompting, refuted premises frequently re-emerge later in long conversations. Grill-Logic converts refuted inferences into persistent **negative constraints** within the `Logical Ledger`. This functions as an epistemic firewall that prevents invalid leaps from resurrecting.
3. **Standard Logical Form ($P_1, P_2, \dots, P_n \vdash C$) vs. Normal Forms (CNF/DNF)**:
   * Bypasses combinatorial explosion and lossy boolean logic transformations.
   * Focuses directly on the **inferential bridge** ($\vdash$ or $\therefore$): does premise set $P$ actually entail conclusion $C$, or is there an unstated, flawed assumption?
4. **Skills Standard (Matt Pocock Architecture)**:
   * Full fidelity to the multi-harness skill pattern: `SKILL.md` frontmatter, `agents/openai.yaml`, mirrored `docs/` tree, user-invoked vs. model-invoked boundaries, skill routers (`ask-grill`), no em-dashes in prose, and strict automated linting/testing scripts.
5. **GSD & SDD Downstream Integration**:
   * **SDD (`logic-to-spec`)**: Converts validated conclusions and their boundary invariants into high-precision technical specifications.
   * **GSD (`logic-to-gsd`)**: Immediate fast-forward to pragmatic, vertical slice implementation once conclusions are verified.
6. **Orthogonality to PDLT (Process Definition Language Taskmaster)**:
   * PDLT is purely procedural (sequencing *how* a task is executed step by step). Grill-Logic is purely epistemic (determining *whether* the underlying premise and conclusion are logically sound and valid). Grill-Logic verifies truth; procedural engines execute steps.

---

## User Review Required

> [!IMPORTANT]
> **Key Architectural Design Decisions**:
> 1. **Repository Layout**: Creating the repository at the root of `C:\Users\USER\Desktop\Frameworks\grill-logic\` alongside the `comparison/` directory, while excluding `comparison/` from builds and releases.
> 2. **Prose Quality Constraint**: Enforcing the strict rule from Matt Pocock's skills repository: **no em-dashes anywhere in prose**. Sentence structures will use commas, colons, parentheses, or conjunctions.
> 3. **Dual Harness Invocation Support**: Every skill carries both Claude Code frontmatter (`disable-model-invocation: true` for user skills) and OpenAI/Codex YAML metadata (`agents/openai.yaml`), fully compatible with Antigravity skills.
> 4. **Standard Schemas**: Formalizing standard schemas for argument representations (`schemas/argument-form.json`) and epistemic registry entries (`schemas/logical-ledger.json`).

---

## Proposed Changes

### 1. Root Configuration & Project Manifests

Establish standard repository configuration, metadata, and scripts:

#### [NEW] [package.json](file:///C:/Users/USER/Desktop/Frameworks/grill-logic/package.json)
- Project manifest defining `@grill-logic/skills` (version 1.0.0), linting, testing, and skill synchronization scripts.

#### [NEW] [CLAUDE.md](file:///C:/Users/USER/Desktop/Frameworks/grill-logic/CLAUDE.md)
- Development instructions, bucket organization guidelines, invocation policies, docs mirroring rules, and the strict no-em-dash prose convention.

#### [NEW] [AGENTS.md](file:///C:/Users/USER/Desktop/Frameworks/grill-logic/AGENTS.md)
- Root instructions for AI coding agents and harness runners.

#### [NEW] [CONTEXT.md](file:///C:/Users/USER/Desktop/Frameworks/grill-logic/CONTEXT.md)
- Core domain glossary and epistemic concepts (Standard Logical Form, Inferential Bridge, Epistemic Ledger, Actor-Agnostic Challenge, Soundness vs. Validity, Gatekeeper).

#### [NEW] [README.md](file:///C:/Users/USER/Desktop/Frameworks/grill-logic/README.md)
- Top-level repository overview, architectural motivation, skill catalog grouped into User-invoked and Model-invoked, quickstart, and installation guide.

#### [NEW] [CHANGELOG.md](file:///C:/Users/USER/Desktop/Frameworks/grill-logic/CHANGELOG.md)
- Version history starting with 1.0.0 initial release.

#### [NEW] [LICENSE](file:///C:/Users/USER/Desktop/Frameworks/grill-logic/LICENSE)
- MIT License.

---

### 2. Standards & Architecture Decision Records (`.agents/`)

Store design decisions, lineage proofs, and contributor guidance:

#### [NEW] [.agents/lineage.md](file:///C:/Users/USER/Desktop/Frameworks/grill-logic/.agents/lineage.md)
- Formal analysis of DMAD, CCoT, Skills, GSD, SDD, and how Grill-Logic operationalizes each.
- Explicit demarcation proving why PDLT (procedural task tracking) is orthogonal to Epistemic Truth Maintenance.

#### [NEW] [.agents/invocation.md](file:///C:/Users/USER/Desktop/Frameworks/grill-logic/.agents/invocation.md)
- Rules governing user-invoked vs model-invoked skills, cross-skill dependencies (`Call the Skill tool with ...`), and harness compatibility.

#### [NEW] [.agents/writing-docs.md](file:///C:/Users/USER/Desktop/Frameworks/grill-logic/.agents/writing-docs.md)
- Strict template and writing guidelines for the 4-section documentation pattern (`What it does`, `When to reach for it`, `Common questions`, `It's working if`).

#### [NEW] [.agents/install-block.md](file:///C:/Users/USER/Desktop/Frameworks/grill-logic/.agents/install-block.md)
- Standard installation snippets for Claude Code, Antigravity, and Codex.

#### [NEW] [.agents/adr/0001-epistemic-layer-separation.md](file:///C:/Users/USER/Desktop/Frameworks/grill-logic/.agents/adr/0001-epistemic-layer-separation.md)
- ADR on decoupling Epistemic Truth Maintenance from procedural planning and task execution.

#### [NEW] [.agents/adr/0002-standard-form-argumentation.md](file:///C:/Users/USER/Desktop/Frameworks/grill-logic/.agents/adr/0002-standard-form-argumentation.md)
- ADR on selecting Standard Logical Form ($P \vdash C$) over Boolean Normal Forms (CNF/DNF) to prevent combinatorial explosion and focus on inferential validity.

#### [NEW] [.agents/adr/0003-actor-agnostic-dmad.md](file:///C:/Users/USER/Desktop/Frameworks/grill-logic/.agents/adr/0003-actor-agnostic-dmad.md)
- ADR on abstracting multi-agent debate into actor-agnostic challenge mechanics (internal reasoning, adversary LLM, human MCQ, sandbox probe).

#### [NEW] [.agents/adr/0004-contrastive-ledger-as-ccot.md](file:///C:/Users/USER/Desktop/Frameworks/grill-logic/.agents/adr/0004-contrastive-ledger-as-ccot.md)
- ADR on implementing the Logical Ledger as dynamic Contrastive Chain-of-Thought (negative constraints preventing fallacy resurrection).

---

### 3. Plugin Manifests (`.claude-plugin/`)

#### [NEW] [.claude-plugin/plugin.json](file:///C:/Users/USER/Desktop/Frameworks/grill-logic/.claude-plugin/plugin.json)
- Claude Code plugin manifest registering all promoted skills.

#### [NEW] [.claude-plugin/marketplace.json](file:///C:/Users/USER/Desktop/Frameworks/grill-logic/.claude-plugin/marketplace.json)
- Self-contained single-plugin marketplace manifest.

---

### 4. JSON Schemas (`schemas/`)

#### [NEW] [schemas/argument-form.json](file:///C:/Users/USER/Desktop/Frameworks/grill-logic/schemas/argument-form.json)
- Schema for prompts decomposed into Standard Form (Premises, Unstated Assumptions, Candidate Conclusions, Inferences).

#### [NEW] [schemas/logical-ledger.json](file:///C:/Users/USER/Desktop/Frameworks/grill-logic/schemas/logical-ledger.json)
- Schema for the persistent Epistemic Decision Registry (Argument ID, Premises, Status: `SUPPORTED` | `REJECTED` | `UNCERTAIN`, Challenger, Evidence, Invalidation Traces).

---

### 5. Skills (`skills/`)

Skills structured into 3 distinct buckets:

#### Category A: `skills/logic/` (Core Epistemic Engine)
* **[NEW] `skills/logic/grill-logic/SKILL.md`** & `agents/openai.yaml`:
  * **User-invoked**. The primary entry point. Orchestrates the relentless logical audit of prompts, decomposing arguments, running challenge rounds, updating the ledger, and controlling gating.
* **[NEW] `skills/logic/argument-extraction/SKILL.md`** & `agents/openai.yaml`:
  * **Model-invoked**. Parses unstructured prompt requests into Standard Logical Form ($P_1..P_n \vdash C$). Uncovers implicit hidden premises.
* **[NEW] `skills/logic/challenge-premise/SKILL.md`** & `agents/openai.yaml`:
  * **Model-invoked**. DMAD-inspired engine that generates counter-hypotheses, boundary failures, and challenges to the inferential bridge.
* **[NEW] `skills/logic/logical-ledger/SKILL.md`** & `agents/openai.yaml`:
  * **Model-invoked**. CCoT-inspired registry manager. Records argument outcomes, writes negative constraints, and audits past decisions to halt fallacy resurrection.
* **[NEW] `skills/logic/epistemic-gate/SKILL.md`** & `agents/openai.yaml`:
  * **Model-invoked**. Pre-flight execution gatekeeper. Rejects or holds tasks whose supporting arguments have not achieved `SUPPORTED` status.
* **[NEW] `skills/logic/README.md`**:
  * Bucket documentation linking each skill.

#### Category B: `skills/engineering/` (Bridges & Execution Probes)
* **[NEW] `skills/engineering/logic-to-spec/SKILL.md`** & `agents/openai.yaml`:
  * **Model/User-invoked**. Spec-Driven Development (SDD) bridge. Takes validated conclusions and converts them into rigorous technical specifications, invariant contracts, and acceptance tests.
* **[NEW] `skills/engineering/logic-to-gsd/SKILL.md`** & `agents/openai.yaml`:
  * **Model/User-invoked**. Get Shit Done (GSD) bridge. Converts verified conclusions directly into rapid, minimal vertical slice tasks and tracer bullets.
* **[NEW] `skills/engineering/probe-execution/SKILL.md`** & `agents/openai.yaml`:
  * **Model-invoked**. Resolves `UNCERTAIN` empirical premises by formulating and running tiny, isolated 5-line sandbox probes/compilation tests.
* **[NEW] `skills/engineering/README.md`**:
  * Bucket documentation linking each skill.

#### Category C: `skills/productivity/` (Routing & Human Interfaces)
* **[NEW] `skills/productivity/ask-grill/SKILL.md`** & `agents/openai.yaml`:
  * **User-invoked**. The router skill (modeled on `ask-matt`), guiding users to the exact skill or workflow that fits their situation.
* **[NEW] `skills/productivity/grill-mcq/SKILL.md`** & `agents/openai.yaml`:
  * **Model-invoked**. Converts premise challenges into ergonomic, multiple-choice frontier questions for human review when human arbitration is needed.
* **[NEW] `skills/productivity/README.md`**:
  * Bucket documentation linking each skill.

#### [NEW] [skills/README.md](file:///C:/Users/USER/Desktop/Frameworks/grill-logic/skills/README.md)
* Overview of all skill buckets.

---

### 6. Documentation Tree (`docs/`)

Mirrors `skills/` with the strict 4-section standard:
* `docs/logic/grill-logic.md`
* `docs/logic/argument-extraction.md`
* `docs/logic/challenge-premise.md`
* `docs/logic/logical-ledger.md`
* `docs/logic/epistemic-gate.md`
* `docs/engineering/logic-to-spec.md`
* `docs/engineering/logic-to-gsd.md`
* `docs/engineering/probe-execution.md`
* `docs/productivity/ask-grill.md`
* `docs/productivity/grill-mcq.md`

---

### 7. Tooling & Verification Scripts (`scripts/`)

#### [NEW] [scripts/link-skills.sh](file:///C:/Users/USER/Desktop/Frameworks/grill-logic/scripts/link-skills.sh)
- Shell script symlinking skills into `~/.claude/skills`, `~/.agents/skills`, and `~/.gemini/antigravity/skills`.

#### [NEW] [scripts/link-skills.ps1](file:///C:/Users/USER/Desktop/Frameworks/grill-logic/scripts/link-skills.ps1)
- PowerShell script symlinking skills for Windows environments.

#### [NEW] [scripts/validate-repo.mjs](file:///C:/Users/USER/Desktop/Frameworks/grill-logic/scripts/validate-repo.mjs)
- Automated repo validator checking:
  1. Frontmatter validity (`name`, `description`).
  2. Matching `agents/openai.yaml` for every skill.
  3. Strict no-em-dash rule enforcement across all markdown files.
  4. Docs mirroring completeness (every engineering, logic, and productivity skill has a corresponding doc).
  5. JSON schemas validity against test fixtures.

#### [NEW] [scripts/validate-ledger.mjs](file:///C:/Users/USER/Desktop/Frameworks/grill-logic/scripts/validate-ledger.mjs)
- Interactive/CLI validator to check consistency, cycles, and status transitions of any project's `LOGICAL_LEDGER.json`.

---

## Verification Plan

### Automated Verification
1. **Repository Structure & Linting**:
   * Run `node scripts/validate-repo.mjs` to ensure:
     * Zero em-dashes exist across all prose files.
     * All skills have matching `agents/openai.yaml` and docs pages.
     * Plugin manifest (`.claude-plugin/plugin.json`) contains exactly the promoted skills.
2. **Schema & Ledger Testing**:
   * Run `node scripts/validate-ledger.mjs` against test ledger fixtures demonstrating valid and invalid argument states.
3. **Link Scripts Syntax**:
   * Verify bash and PowerShell linkage scripts have clean syntax and handle paths properly.

### Manual Verification
1. Verify directory layout against `comparison/skills` to guarantee 1:1 structural excellence.
2. Verify all markdown links render properly and connect correctly to target files.
