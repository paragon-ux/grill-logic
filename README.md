# Grill-Logic: Epistemic Truth Maintenance for AI Agents

> **Epistemic Truth Maintenance and Argument-Driven Premise Validation for Real Software Engineering.**

Developing real software with AI coding agents is hard. Standard workflows (GSD, Spec-Driven Development, PRD generators, plan artifacts) suffer from a fatal blindspot: **they conflate procedural consensus with epistemic validity**.

When a user prompt or agent proposal contains an unstated, false assumption (e.g., assuming SQLite WAL mode works safely over NFS, or that database read latency requires an external caching cluster), procedural planners will happily generate 1,000 lines of pristine, well-structured code around a fundamentally broken premise. Both user and agent sign off because the steps look sensible, even though the foundational axiom is physically or logically invalid.

**Grill-Logic** cleanly separates the **Epistemic Layer (Truth Maintenance)** from the **Procedural Layer (Task Execution)**. It provides two dedicated, tool-driven state machines with mathematical Autonomy Weight ($W$), Skepticism Signals ($S$), and fail-closed runtime negative constraints.

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

Open your project in Claude Code, Antigravity, or your preferred agent harness, and run:

```bash
/setup-grill-logic
```

The prompt-driven setup skill will:
- Initialize `LOGICAL_LEDGER.md` (the persistent truth registry and negative constraint firewall).
- Install `.agents/rules/epistemic-gate.md` for hands-free continuous premise verification.
- Register the Grill-Logic protocol in your existing `CLAUDE.md` and/or `AGENTS.md`.

### 3. Bam. Ready to roll.

Run `/self-grill` for autonomous audits or `/grill-logic` for interactive design alignment.

---

## The Two Dedicated State Machines

```
                                  [User Request]
                                         │
                   ┌─────────────────────┴─────────────────────┐
                   ▼                                           ▼
      [State Machine 1: Autonomous]               [State Machine 2: Human]
      (DMAD Self-Iterative Loop)                 (Sequential Turn-by-Turn)
      • Command: `/self-grill [proposal]`        • Command: `/grill-logic [topic]`
      • Target: LLM / Proposed Architecture      • Target: Human Decision Tree
      • Target Autonomy: W_LLM = 0.2 (Low)       • Target Autonomy: W_human = 1.0 (High)
      • Skepticism: S_LLM lands at FULL STRENGTH • Skepticism: S_human is DAMPENED
      • Driven by real tool probes               • Driven by `ask_question` tool
      • Dispatch Token Handshake                 • Strict Turn Yield on Question
      • State: `.grill-logic/state.json`         • State: `.grill-logic/state.json`
      • Fail-Closed: Blocks on any error         • Fail-Closed: Blocks on any error
```

### 1. State Machine 1: Autonomous DMAD Engine (`/self-grill`)
* **Trigger**: `/self-grill [proposal]` or `self-grill:` or `autonomous:`
* **Execution**: Hands-free / AFK loop driven strictly by **real empirical tool probes** (`grep_search`, `run_command`, `view_file`, or subagent). Zero simulated text monologues.
* **Token Handshake**: The subagent logs its audit directly into `.grill-logic/state.json` using a one-time session `dispatch_token`.
* **Asymmetric $W$ Guard**: $W_{\text{LLM}} = 0.2$ is physically blocked from overriding $W_{\text{subagent}} = 0.8$ rejection without an empirical counter-probe.

### 2. State Machine 2: Human Sequential Interview (`/grill-logic`)
* **Trigger**: `/grill-logic [topic]` or `interview me on [topic]`
* **Execution**: Walks down an architectural decision tree one branch at a time.
* **Strict Turn Yield**: Ingests topic $\to$ formulates single decision $\to$ calls `ask_question` tool $\to$ **YIELDS TURN IMMEDIATELY**. The model is physically prohibited from answering for the user.
* **Behavioral Stagnation Tracking ($S_{\text{human}}$)**: Every turn logs whether user introduced new propositions. If $C_{\text{stagnant}} \ge 3$, raises `HUMAN_STAGNATION_ALERT` requiring diagnostic acknowledgment.
* **Permanent Invariants**: Confirmed decisions are logged into `LOGICAL_LEDGER.md` as `SUPPORTED`.

---

## Fail-Closed Error Architecture

If an invariant is violated, an empirical probe is omitted, a token is mismatched, or a proposal matches an active `REJECTED` rule:
1. The engine (`scripts/grill-state.mjs`) **fails closed immediately** with a non-zero exit code.
2. The state is marked `EXECUTION_BLOCKED`.
3. Procedural code generation is **hard-blocked**. Silent pass-throughs are strictly prohibited.

---

## Repository Map

```
grill-logic/
├── .agents/
│   ├── rules/
│   │   └── epistemic-gate.md    # Always-on continuous hook rule for multi-turn sessions
│   └── skills/                  # Mirrored skill tree for Antigravity discovery
│       └── logic/
│           ├── grill-logic/     # Human HITL Sequential Interview Engine
│           └── self-grill/      # Autonomous DMAD Epistemic Engine
├── core/
├── scripts/
│   ├── clear-ledger.mjs         # Automated ledger reset and archiving tool
│   └── grill-state.mjs          # Standalone epistemic state engine & fail-closed runtime
├── skills/
│   ├── logic/
│   │   ├── grill-logic/         # Human HITL Sequential Interview Engine
│   │   └── self-grill/          # Autonomous DMAD Epistemic Engine
│   └── setup/
│       ├── clear-ledger/        # Automated ledger reset skill (/clear-ledger)
│       └── setup-grill-logic/   # Prompt-driven automated repository configurer
├── references/
│   ├── grill-logic-whitepaper.md # Canonical architectural & theoretical whitepaper
│   ├── build-requirements.md   # System specifications and acceptance criteria
│   ├── hooks-setup-guide.md    # Abstract agent lifecycle hook architecture guide
│   ├── logical-ledger-spec.md  # Registry format, transitions, and contrastive rule conventions
│   └── examples.md             # Concrete case studies (caching leaps, auth invariants, DB sync)
├── .gitignore                   # Ignores internal/ and comparison/
├── AGENTS.md                    # Operational guidelines for AI coding agents
├── CLAUDE.md                    # Dedicated developer guide for Claude Code
├── LICENSE                      # MIT License
├── LOGICAL_LEDGER.md            # Live project epistemic decision registry
├── package.json                 # Project manifest and validation scripts
└── README.md                    # This document
```

---

## Lineage & Theoretical Foundations

Grill-Logic synthesizes breakthroughs across cognitive science, multi-agent debate, and epistemic truth maintenance:
* **Diverse Multi-Agent Debate (DMAD, ICLR 2025)**: Proves that cosmetic persona assignment traps models in the *Einstellung effect* (fixed mental sets). Grill-Logic equips adversarial subagents with distinct problem-solving strategies (backward refutation, empirical probing, premise inversion) to break cognitive fixations.
* **Autonomy Weight ($W$) & Skepticism Signal ($S$)**: Decouples challenger-credibility from target-deference ($W_{\text{subagent}} > W_{\text{LLM}}$), applying $S_{\text{LLM}}$ at full strength against the main model while preserving sovereign developer authority ($W_{\text{human}}$).
* **The 90/10 Invariant**: Gating solution generation until after premise concordance is reached, preventing premature solution offering.
* **Contrastive Chain of Thought (CCoT)**: Inspires our runtime negative constraint firewall in `LOGICAL_LEDGER.md`, turning refuted architectures into permanent refutation rules that block semantic regression across turns.
