# Grill-Logic: Neurosymbolic Epistemic Truth Maintenance for AI Agents

> **The first neurosymbolic epistemic truth-maintenance firewall for AI coding agents. Mechanically prevents models from building code around physically impossible or logically flawed architectural premises.**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Protocol Version](https://img.shields.io/badge/Protocol-v2.2.0-green.svg)](references/grill-logic-whitepaper.md)
[![Zero Dependencies](https://img.shields.io/badge/Dependencies-0%20(Pure%20Stdlib)-brightgreen.svg)](scripts/grill-state.mjs)
[![Tests Passing](https://img.shields.io/badge/Tests-169%20Passing-success.svg)](scripts/test-epistemic-engine.mjs)

---

## The Problem: The Procedural Blindspot

Developing software with autonomous AI agents (Claude Code, Antigravity, Cursor, Windsurf, Codex) suffers from a fatal blindspot: **they conflate procedural consensus with epistemic validity**.

When a user prompt or agent proposal contains an unstated, false assumption—such as assuming SQLite WAL mode works safely over an NFS share, or that database read latency warrants deploying an external Redis caching cluster—procedural planners (GSD, Spec-Driven Development, PRD generators, plan artifacts) will happily generate 1,000 lines of pristine, well-structured code around a fundamentally broken axiom. Both user and agent sign off because the steps look sensible, even though the foundational premise is physically or logically invalid. Worse, models repeatedly fall back into previously refuted anti-patterns across long multi-turn sessions (*semantic regression*).

## The Solution: Grill-Logic v2.2

**Grill-Logic v2.2** cleanly separates the **Epistemic Layer (Truth Maintenance)** from the **Procedural Layer (Task Execution)**. It introduces a formal, neurosymbolic verification pipeline with mathematical Autonomy Weight ($W$), Skepticism Signals ($S$), deterministic invariant solving, and a fail-closed runtime negative-constraint firewall.

| Capability | Standard Agentic Harness | Grill-Logic v2.2 Epistemic Engine |
| :--- | :--- | :--- |
| **Premise Validation** | Blind procedural agreement ("Looks good!") | **Step 1 Interpretation Gate (`/add-logic`)** with 5-way NeSy solver |
| **Challenger Credibility** | Cosmetic persona prompting (*Einstellung* trap) | **Diverse Multi-Agent Debate (DMAD)** with $W_{\text{subagent}} = 0.8 > W_{\text{LLM}} = 0.2$ |
| **Verification Basis** | Unbacked textual hallucination | **Empirical Tool Probes Required** (`run_command`, `grep_search`, `view_file`) |
| **Solution Pacing** | Premature generation (solutions offered in turn 1) | **Strict 90/10 Invariant**: Solutions gated until post-concordance |
| **Reasoning Diversity** | Symmetric homogeneous CoT (correlated error) | **Asymmetric CoT (ADR-0002)**: Challenger Refutation vs. Proposer Synthesis |
| **Memory Firewall** | Unfiltered prompt context (semantic regression) | **Dynamic Vector Firewall (ADR-0003)**: Bag-of-words + bigram cosine ($\tau = 0.30$) |
| **Negative Constraints** | Rigid static keywords or polarity traps | **Pure Negative Falsification**: Evaluated on $(C_{\text{rejected}} \cup R_{\text{refute\_boundary}})$ |
| **Developer UX** | Complex synthetic flags (`--allow-dup`, `--rounds`) | **Zero User Flags**: Humans converse naturally; agents manage flags |
| **Dependencies** | Heavy vector databases, embeddings, C++ bindings | **Zero Dependencies**: 100% Node.js standard library (`fs`, `crypto`, `path`) |

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
3. A standardized, auditable diagnostic block is emitted to `stderr`:

```text
╔══════════════════════════════════════════════════════════════════════════════╗
║ ⛔ EPISTEMIC GATE HALT: NEGATIVE_CONSTRAINT_COLLISION                        ║
╠══════════════════════════════════════════════════════════════════════════════╣
║ State:          S_A0A_PREFLIGHT_CHECK                                        ║
║ Active Machine: AUTONOMOUS_DMAD                                              ║
║ Actor Context:  Target W=0.2  , Challenger W=0.8                             ║
║ Skepticism:     Risk=HIGH  , S_human=0.00                                    ║
╟──────────────────────────────────────────────────────────────────────────────╢
║ Diagnostic:                                                                  ║
║   Proposal collides with active REJECTED rule [SYS-INV-01] (similarity:      ║
║   0.584, threshold: 0.300). Prohibited boundary: POSIX fcntl byte-range     ║
║   locking over network storage.                                              ║
╟──────────────────────────────────────────────────────────────────────────────╢
║ Remediation:                                                                 ║
║   Proposal violates verified system invariant. To proceed, revise the        ║
║   architecture away from the refuted pattern, or add the term to             ║
║   .grill-logic/allowlist.json.                                               ║
╟──────────────────────────────────────────────────────────────────────────────╢
║ Execution Gate: BLOCKED (Fail-Closed: Code generation prohibited)            ║
╚══════════════════════════════════════════════════════════════════════════════╝
```

Procedural code generation and implementation planning are **strictly prohibited** on blocked states. Silent pass-throughs are non-negotiable failures.

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
├── internal/                       # Public evidentiary audit records, dogfooding logs & architectural specs
│   ├── ADR-0001-LIVE-STOCHASTIC-RELEASE-GATE.md
│   ├── ADR-0002-ASYMMETRIC-COT-AND-FRONTIER-CLOSURE.md
│   ├── ADR-0003-NEGATIVE-CONSTRAINT-FALSIFICATION-AND-ANTI-PRESCRIPTIVE-FIREWALL.md
│   ├── ABLATIONS.md                # Empirical parameter ablation logs
│   ├── EXPERIMENTS.md              # Empirical trial logs & benchmarks
│   ├── LOG.md                      # Chronological protocol execution trail
│   └── revisions/                  # Multi-model independent audit panel reviews
│       ├── ChatGPT-Critique/       # Independent audit findings (ChatGPT o3-mini)
│       ├── Claude-Critique/        # Independent audit findings (Claude 3.7 Sonnet)
│       └── Gemini-Critique/        # Independent audit findings (Gemini 2.5 Pro)
├── references/
│   ├── adr/                        # Architectural Decision Records
│   │   ├── 0001-live-stochastic-release-gate.md
│   │   ├── 0002-asymmetric-cot-and-frontier-closure.md
│   │   └── 0003-negative-constraint-falsification-and-anti-prescriptive-firewall.md
│   ├── grill-logic-whitepaper.md   # Canonical architectural & theoretical whitepaper (v2.2.0)
│   ├── build-requirements.md      # System specifications and acceptance criteria (v2.2.0)
│   ├── hooks-setup-guide.md       # Abstract agent lifecycle hook architecture guide
│   ├── logical-ledger-spec.md     # Registry format, transitions, and contrastive rule conventions (v1.1.0)
│   └── examples.md                # Concrete case studies (caching leaps, auth invariants, DB sync)
├── scripts/
│   ├── clear-ledger.mjs            # Automated ledger reset and archiving tool
│   ├── grill-state.mjs             # Standalone epistemic state engine & fail-closed runtime
│   ├── test-epistemic-engine.mjs   # Comprehensive epistemic invariant & math test suite (169 tests)
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
├── .gitignore                      # Clean repository ignores (un-ignores internal/)
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
