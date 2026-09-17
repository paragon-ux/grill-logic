# Grill-Logic: Epistemic Truth Maintenance for AI Agents

> **Epistemic Truth Maintenance, Neurosymbolic Premise Validation, and Negative-Constraint Firewalls for Real Software Engineering.**

Developing real software with AI coding agents is hard. Standard workflows (GSD, Spec-Driven Development, PRD generators, plan artifacts) suffer from a fatal blindspot: **they conflate procedural consensus with epistemic validity**.

When a user prompt or agent proposal contains an unstated, false assumption (e.g., assuming SQLite WAL mode works safely over NFS, or that database read latency requires an external caching cluster), procedural planners will happily generate 1,000 lines of pristine, well-structured code around a fundamentally broken premise. Both user and agent sign off because the steps look sensible, even though the foundational axiom is physically or logically invalid.

**Grill-Logic v2.2** cleanly separates the **Epistemic Layer (Truth Maintenance)** from the **Procedural Layer (Task Execution)**. It provides a formal, neurosymbolic verification pipeline with mathematical Autonomy Weight ($W$), Skepticism Signals ($S$), deterministic invariant solving, and fail-closed runtime negative constraints.

---

## 3-Step Setup

Setup takes less than a minute. No manual configuration or file copying required:

### 1. Get the skills

Add Grill-Logic to your agent environment:

```bash
# Using skills CLI / npm
npx skills add github:paragon-ux/grill-logic

# Or clone directly into your personal agent directory
git clone https://github.com/paragon-ux/grill-logic ~/.claude/skills/grill-logic
# (For Antigravity: clone or copy into $HOME/.gemini/antigravity/skills/grill-logic)
```

### 2. Run `/setup-grill-logic`

Open your project in Claude Code, Antigravity, Cursor, Windsurf, or your preferred agent harness, and run:

```bash
/setup-grill-logic
```

The prompt-driven setup skill will:
- Initialize `LOGICAL_LEDGER.md` (the persistent truth registry and negative constraint firewall).
- Install `.agents/rules/epistemic-gate.md` for hands-free continuous premise verification and pre-flight negative constraint checks.
- Register the Grill-Logic protocol in your existing `CLAUDE.md` and/or `AGENTS.md`.

### 3. Bam. Ready to roll.

The continuous epistemic gate monitors architectural proposals automatically. When proposing designs:
1. Run `/add-logic [proposal]` to formulate premises and validate deductive form.
2. Run `/self-grill [proposal]` for hands-free autonomous audits before writing code.
3. Run `/grill-logic [topic]` for interactive turn-by-turn design interviews.

## The Dedicated Protocol Pipeline

```
                                [Architectural Proposal]
                                           │
                                           ▼
                    ┌──────────────────────────────────────────────┐
                    │  Pre-Flight Negative Constraint Firewall     │
                    │  • Pure Negative Falsification (ADR-0003)    │
                    │  • Target: Clean(C_rejected) ∪ Clean(R_refute)│
                    │  • Sublinear TF + Bigram Vector Cosine (τ=.30)│
                    │  • Fails closed if collision detected       │
                    └──────────────────────┬───────────────────────┘
                                           │ (Exit Code 0: Clean)
                                           ▼
                    ┌──────────────────────────────────────────────┐
                    │  Step 1: Interpretation Gate (/add-logic)    │
                    │  • Mandatory Human ↔ LLM decomposition       │
                    │  • Confirms explicit (P1..Pn) & conclusion (C)│
                    │  • Deterministic NeSy Solver Validation     │
                    │  • Dynamic Deduplication (τ_dup = 0.50)      │
                    │  • Commits baseline as FORMULATED            │
                    └──────────────────────┬───────────────────────┘
                                           │
                   ┌───────────────────────┴───────────────────────┐
                   ▼                                               ▼
      [State Machine 1: Autonomous]                   [State Machine 2: Human]
      (Autonomous DMAD Engine)                        (Sequential HITL Interview)
      • Command: `/self-grill [proposal]`             • Command: `/grill-logic [topic]`
      • Target: LLM Proposer Architecture             • Target: Human Decision Tree
      • Target Autonomy: W_LLM = 0.2 (Low)            • Target Autonomy: W_human = 1.0 (High)
      • Skepticism: S_LLM lands at FULL STRENGTH      • Skepticism: S_human is DAMPENED
      • Driven by real tool probes                    • Driven by interactive `ask_question`
      • Token-locked subagent handshake (W=0.8)       • Strict Turn Yield on Question
      • Asymmetric CoT (Backward Inversion vs Synth)  • Behavioral Stagnation Alert (S_human)
      • Auto-Dedup Policy (Zero Deadlock)             • Zero User Flags (Pure Natural Language)
      • State: `.grill-logic/state.json`              • State: `.grill-logic/state.json`
      • Fail-Closed: Blocks on any error              • Fail-Closed: Blocks on any error
```

### Step 1: Mandatory Interpretation Gate (`/add-logic [proposal]`)
* **Core Contract**: Mandatory prerequisite preceding all challenge exchanges.
* **Decomposition**: Isolate stated facts ($P_1 \dots P_n$) and candidate conclusion ($C$). User corrections are accepted verbatim as baseline.
* **Deterministic NeSy Validation**: Evaluates formal structure ($P \vdash C$) using a 5-way taxonomy (`valid`, `malformed`, `inconsistent_premises`, `undecidable`, `formally_invalid`). Only `formally_invalid` auto-refutes without probes.
* **Dynamic Deduplication Gate**: Vectorizes proposal against existing ledger rows ($\tau_{\text{dup}} = 0.50$).
  - In Human mode: emits `POTENTIAL_DUPLICATE_FLAG` to prevent redundant rows.
  - In Autonomous mode: auto-updates in-place if $\text{sim} > 0.85$, auto-disambiguates if $0.50 \le \text{sim} \le 0.85$.
* Commits confirmed baseline to `LOGICAL_LEDGER.md` as `FORMULATED`.

### Machine 1: Autonomous DMAD Engine (`/self-grill [proposal]`)
* **Trigger**: `/self-grill [proposal]` or `self-grill:` or `autonomous:`
* **Execution**: Hands-free / AFK loop driven strictly by **real empirical tool probes** (`grep_search`, `run_command`, `view_file`, or subagent). Zero simulated text monologues.
* **Token Handshake**: Subagent logs its challenge directly into `.grill-logic/state.json` using a session `dispatch_token`.
* **Asymmetric $W$ Guard**: $W_{\text{LLM}} = 0.2$ cannot override $W_{\text{subagent}} = 0.8$ rejection without empirical counter-probe evidence.
* **Asymmetric CoT (ADR-0002)**: Challenger executes Backward Inversion CoT ($C \implies \neg P$); Proposer executes Forward Synthesis CoT ($(P + \text{Bounds}) \implies C'$). Strict 90/10 Invariant: Round 1 challenger never offers solutions.

### Machine 2: Human Sequential Interview (`/grill-logic [topic]`)
* **Trigger**: `/grill-logic [topic]` or `interview me on [topic]`
* **Execution**: Walks down an architectural decision tree one branch at a time.
* **Strict Turn Yield**: Ingests topic $\to$ formulates single decision $\to$ calls `ask_question` tool $\to$ **YIELDS TURN IMMEDIATELY**. The model is physically prohibited from answering for the user.
* **Behavioral Stagnation Tracking ($S_{\text{human}}$)**: Every turn logs whether user introduced new propositions. If stagnant turns $\ge 3$, raises `HUMAN_STAGNATION_ALERT` requiring transparent diagnostic acknowledgment.
* **Zero User Flags (ADR-0003)**: Developers converse in natural language and interactive selections. The agent executes programmatic flags behind the scenes.

---

## Fail-Closed Error Architecture

If an invariant is violated, an empirical probe is omitted, a dispatch token is mismatched, or a proposal matches an active `REJECTED` rule:
1. The engine (`scripts/grill-state.mjs`) **fails closed immediately** with exit code 1 or 2.
2. The state is marked `EXECUTION_BLOCKED`.
3. Procedural code generation is **hard-blocked**. Silent pass-throughs are strictly prohibited.

---

## Repository Map

```
grill-logic/
├── .agents/
│   ├── rules/
│   │   └── epistemic-gate.md       # Always-on continuous hook rule for multi-turn sessions
│   └── skills/                     # Mirrored skill tree for Antigravity discovery
│       ├── logic/
│       │   ├── add-logic/          # Step 1: Mandatory Interpretation Gate
│       │   ├── grill-logic/        # State Machine 2: Human HITL Sequential Interview
│       │   └── self-grill/         # State Machine 1: Autonomous DMAD Epistemic Engine
│       └── setup/
│           ├── clear-ledger/       # Automated ledger reset skill (/clear-ledger)
│           └── setup-grill-logic/  # Automated repository configuration skill
├── core/
├── scripts/
│   ├── clear-ledger.mjs            # Automated ledger reset and archiving tool
│   ├── grill-state.mjs             # Standalone epistemic state engine & fail-closed runtime
│   ├── test-epistemic-engine.mjs   # Comprehensive epistemic invariant & math test suite
│   ├── test-ledger.mjs             # Ledger schema & lifecycle test suite
│   ├── test-skills.mjs             # Skills packaging & byte-for-byte parity test suite
│   └── test-v2-protocol.mjs        # Protocol invariant & state machine test suite
├── skills/
│   ├── logic/
│   │   ├── add-logic/              # Step 1: Mandatory Interpretation Gate
│   │   ├── grill-logic/            # State Machine 2: Human HITL Sequential Interview
│   │   └── self-grill/             # State Machine 1: Autonomous DMAD Epistemic Engine
│   └── setup/
│       ├── clear-ledger/           # Automated ledger reset skill (/clear-ledger)
│       └── setup-grill-logic/      # Automated repository configuration skill
├── references/
│   ├── adr/
│   │   ├── 0001-live-stochastic-release-gate.md                   # Mandatory live in-thread trials
│   │   ├── 0002-asymmetric-cot-and-frontier-closure.md           # Asymmetric reasoning & 90/10 gating
│   │   └── 0003-negative-constraint-falsification-and-anti-prescriptive-firewall.md # Falsified boundaries & zero-flag UX
│   ├── grill-logic-whitepaper.md   # Canonical architectural & theoretical whitepaper (v2.2.0)
│   ├── build-requirements.md      # System specifications and acceptance criteria
│   ├── hooks-setup-guide.md       # Abstract agent lifecycle hook architecture guide
│   ├── logical-ledger-spec.md     # Registry format, transitions, and contrastive rule conventions (v1.1.0)
│   └── examples.md                # Concrete case studies (caching leaps, auth invariants, DB sync)
├── .gitignore                      # Clean repository ignores
├── AGENTS.md                       # Operational guidelines for AI coding agents (all harnesses)
├── CLAUDE.md                       # Dedicated developer guide for Claude Code
├── LICENSE                         # MIT License
├── LOGICAL_LEDGER.md               # Live project epistemic decision registry
├── package.json                    # Project manifest (v2.2.0) and validation scripts
└── README.md                       # This document
```

---

## Lineage & Theoretical Foundations

Grill-Logic synthesizes breakthroughs across cognitive science, multi-agent debate, and epistemic truth maintenance:

* **Diverse Multi-Agent Debate (DMAD, ICLR 2025)**: Proves that cosmetic persona assignment traps models in the *Einstellung effect* (fixed mental sets). Grill-Logic equips adversarial subagents with distinct problem-solving strategies (backward refutation, empirical probing, premise inversion) to break cognitive fixations.
* **Autonomy Weight ($W$) & Skepticism Signal ($S$)**: Decouples challenger-credibility from target-deference ($W_{\text{subagent}} = 0.8 > W_{\text{LLM}} = 0.2$), applying $S_{\text{LLM}}$ at full strength against the main model while preserving sovereign developer authority ($W_{\text{human}} = 1.0$).
* **The 90/10 Invariant**: Gating solution generation until after premise concordance is reached, preventing premature solution offering.
* **Mandatory Live Stochastic Release Gate (ADR-0001)**: Mandates live, in-thread autonomous verification trials with genuine tool probes and token handshakes prior to any release or version tag.
* **Asymmetric CoT & Frontier-Depletion Closure (ADR-0002)**: Enforces orthogonal reasoning paths (Challenger Refutation $C \implies \neg P$ vs. Proposer Constraint-Satisfaction $(P + \text{Bounds}) \implies C'$) to prevent correlated errors across homogeneous LLMs. Debates terminate when the epistemic frontier is empty ($\mathcal{F} = \emptyset$).
* **Pure Negative-Constraint Falsification & Zero-Flag Contract (ADR-0003)**: Evaluates semantic similarity strictly against the normalized conjunction of the falsified conclusion and prohibited failure boundary ($\text{Target Space} = C_{\text{rejected}} \cup R_{\text{refute\_boundary}}$) using pure sublinear TF + word-bigram cosine similarity ($\tau = 0.30$). Eliminates composite Trojan-horse bypasses and ensures developers interact purely via natural language while agents manage programmatic flags.
