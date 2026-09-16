# Grill-Logic: Epistemic Truth Maintenance for AI Agents

> **Epistemic Truth Maintenance and Argument-Driven Premise Validation for Real Software Engineering.**

Developing real software with AI coding agents is hard. Standard workflows (GSD, Spec-Driven Development, PRD generators, plan artifacts) suffer from a fatal blindspot: **they conflate procedural consensus with epistemic validity**.

When a user prompt or agent proposal contains an unstated, false assumption (e.g., assuming SQLite WAL mode works safely over NFS, or that database read latency requires an external caching cluster), procedural planners will happily generate 1,000 lines of pristine, well-structured code around a fundamentally broken premise. Both user and agent sign off because the steps look sensible, even though the foundational axiom is physically or logically invalid.

**Grill-Logic** cleanly separates the **Epistemic Layer (Truth Maintenance)** from the **Procedural Layer (Task Execution)**. It extracts the argument into Standard Logical Form ($P \vdash C$), stress-tests the inferential bridge with an actor-agnostic challenge, and maintains a persistent truth ledger with runtime negative constraints.

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

State your architectural ideas or let the continuous gate protect your sessions automatically.

---

## Multi-Round vs. Multi-Turn: The Distinction

Grill-Logic enforces a rigorous architectural separation between conversational turns and adversarial debate rounds:

* **Multi-Turn (Session Lifecycle)**: The ongoing conversation across multiple user prompts and days of development. Guarded continuously by `LOGICAL_LEDGER.md` and `.agents/rules/epistemic-gate.md`. When a premise is rejected in Turn 2, its **Contrastive Refutation Rule** remains active in Turn 20, guaranteeing the model never suffers from semantic attraction or hallucinates the same flawed design again.
* **Multi-Round (Recursive Epistemic Challenge)**: The iterative, adversarial challenge rounds executed **within a single verification audit**:
  * **Round 1 (Attack the Bridge)**: Deconstructs the proposal into Standard Logical Form ($P \vdash C$) and attacks the inferential bridge ($\vdash$). Does $P$ necessitate $C$, or does a simpler $C'$ solve it without operational bloat?
  * **Round 2 (Stress-Test the Alternative)**: If the challenger proposes a counter-hypothesis ($C'$), Round 2 isolates the premises of $C'$ ($P_{C'} \vdash C'$) to ensure the alternative does not introduce hidden failure modes.
  * **Round $k$**: Continues until the epistemic frontier converges on a verified, supported conclusion.

---

## Why Grill-Logic Exists

### Failure Mode #1: The Agent Built on a False Premise
* **The Problem**: You ask an agent to optimize a database lookup. It immediately drafts a 10-step plan to deploy Redis, refactor data access objects, and build cache invalidation hooks. The real issue was an unindexed sequential table scan that a 1-line composite index solves in 2 milliseconds.
* **The Grill-Logic Fix**: Extracts the explicit conditions and candidate action into Standard Form ($P_1..P_n \vdash C$), exposes the inferential turnstile ($\vdash$), and asks: *Does high read latency necessitate an external caching cluster?*

### Failure Mode #2: Multi-Agent Debate is Theater
* **The Problem**: Early agent frameworks spawned swarms of multi-persona agents to debate solutions, causing massive token burn, high latency, and sycophantic consensus without catching factual bugs.
* **The Grill-Logic Fix**: De-escalates debate theater to a fast **actor-agnostic challenge** routed to the quickest available falsifier:
  1. *Deterministic Sandbox Probe*: A 5-line compiler check, CLI command, or documentation search.
  2. *Internal Adversarial CoT*: Rapid counter-hypothesis pass in extended thinking tokens.
  3. *Human Arbitration*: An ergonomic multiple-choice question when business intent requires human judgment.

### Failure Mode #3: Hallucinations Resurrect in Later Turns
* **The Problem**: In a multi-turn conversation, you reject an invalid proposal in Turn 2. By Turn 6, the model suffers from *semantic attraction* and proposes the exact same flawed pattern again.
* **The Grill-Logic Fix (Contrastive Constraints)**: When an argument is rejected, Grill-Logic records an explicit **Contrastive Refutation Rule** in [`LOGICAL_LEDGER.md`](LOGICAL_LEDGER.md). This acts as a persistent negative constraint firewall that hard-blocks regression in subsequent turns.

---

## Natural Language Invocation (No Quotes, No CLI Flags)

Grill-Logic is a skill, not a CLI utility. **Prompts do not require quotation marks or synthetic flags.** The skill infers mode and depth directly from conversational phrasing:

```bash
# Default invocation: Fastest-falsifier heuristic, until settled
/grill-logic migrate session tokens to redis cluster

# Autonomous self-grill (AFK): Agent stresses its own proposal via internal CoT & probes
/grill-logic self-grill: refactor query pipeline to use raw sockets

# Interactive human interview (HITL): Formulates multiple-choice questions for the user
/grill-logic interview me on adopting GraphQL for our mobile backend

# Deterministic probe: Enforces empirical tool/compiler verification
/grill-logic check in sandbox if jemalloc builds with MSVC

# Recursive multi-round depth: Challenges the counter-hypotheses across multiple rounds
/grill-logic deep dive 2 rounds: decompose monolith into 6 microservices
```

---

## Continuous Hook Infrastructure (Hands-Free Multi-Turn)

Typing `/grill-logic` on every prompt in a long conversation is a burden. Grill-Logic provides an abstract, harness-agnostic hook architecture that automatically triggers pre-flight premise verification whenever an architectural or dependency change is proposed:

1. **Always-On Epistemic Rule ([`.agents/rules/epistemic-gate.md`](.agents/rules/epistemic-gate.md))**:
   Zero-script continuous rule active across Antigravity, Claude Code, Cursor, and Codex. Detects architectural assertions, checks [`LOGICAL_LEDGER.md`](LOGICAL_LEDGER.md) for active negative constraints, and stress-tests premises before code generation begins.
2. **Agent Lifecycle Hook Architecture ([`references/hooks-setup-guide.md`](references/hooks-setup-guide.md))**:
   Abstract operational guide defining the prompt-interception lifecycle, assertion analysis patterns, and fail-open guarantees for non-Git agent hooks across any custom harness.

---

## Empirical Scoreboard (Subagent Verification)

Grill-Logic was rigorously dogfooded against common architectural failure modes using autonomous subagents (full audit traces and reference cases documented in [`references/examples.md`](references/examples.md)):

| Proposal | Auditor Finding | Verdict | Contrastive Rule Enforced |
| :--- | :--- | :--- | :--- |
| **SQLite WAL over NFS in Kubernetes** | SQLite WAL requires host-local POSIX shared memory (`-shm`); NFS cannot synchronize across kernels and corrupts B-trees. | **BLOCKED** | Do not infer shared embedded file-based storage from multi-node environments. |
| **600ms Postgres latency $\implies$ Redis cluster** | Point lookup latency caused by unindexed sequential table scan; caching masks root cause and causes stampedes. | **BLOCKED** | Do not infer caching layer from read latency without profiling query plans (`EXPLAIN ANALYZE`). |
| **Windows C++ server $\implies$ Linux `io_uring`** | Windows NT kernel cannot execute `io_uring`; WSL2 virtualization destroys zero-copy DMA semantics. | **BLOCKED** | Do not adopt Linux kernel interfaces on Windows; use Winsock RIO or IOCP. |
| **Monolith $\implies$ 6 microservices (2 Rounds)** | Conway's Law violation (0.5 devs/service); batching causes release friction. Counter-hypothesis (Trunk-Based CD) verified. | **PASS ($C'$)** | Do not infer microservices from release friction on small teams; adopt Trunk-Based CD. |

---

## Repository Map

```
grill-logic/
├── .agents/
│   ├── rules/
│   │   └── epistemic-gate.md    # Always-on continuous hook rule for multi-turn conversations
│   └── skills/                  # Mirrored skill tree for Antigravity discovery
├── skills/
│   ├── logic/
│   │   ├── grill-logic/         # User front door (compact ~40-line invocation interface)
│   │   └── epistemic-verifier/  # Core truth engine (multi-round epistemic verification)
│   └── setup/
│       ├── clear-ledger/        # Automated ledger reset and archiving tool
│       └── setup-grill-logic/   # Prompt-driven automated repository configurer
├── references/
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

---

## References & Deep Dives

* [**Architecture Whitepaper (`references/grill-logic-whitepaper.md`)**](references/grill-logic-whitepaper.md): Canonical theoretical synthesis of DMAD lineage, W/S dynamics, and state machines.
* [**Engineering Requirements Document (`references/build-requirements.md`)**](references/build-requirements.md): System specifications and acceptance criteria.
* [**Epistemic Decision Registry (`LOGICAL_LEDGER.md`)**](LOGICAL_LEDGER.md): The live project ledger enforcing active negative constraints.
* [**Logical Ledger Specification (`references/logical-ledger-spec.md`)**](references/logical-ledger-spec.md): Table format, lifecycle states, transition mechanics, and machine-readable schema.
* [**Case Studies & Reference Examples (`references/examples.md`)**](references/examples.md): Detailed traces showing how Grill-Logic catches caching fallacies, false axioms, and ABI incompatibilities.
* [**Claude Code Guidelines (`CLAUDE.md`)**](CLAUDE.md): Specific instructions and conventions for Claude Code.
* [**Agent Guidelines (`AGENTS.md`)**](AGENTS.md): Operational contracts for Antigravity, Codex, Cursor, and Windsurf.

