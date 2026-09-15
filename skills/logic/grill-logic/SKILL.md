---
name: grill-logic
description: Grill the premises and inferential leaps of an architectural proposal or prompt before writing code. Use when proposing a system design, database change, dependency, or refactor.
disable-model-invocation: true
argument-hint: "[proposal or plan text]"
---

# Grill-Logic

Stress-test an architectural proposal or plan before anyone acts on it. Grill-Logic isolates the inferential bridge between your premises and your conclusion, challenging the jump before code execution begins.

This skill delegates the epistemic audit to `epistemic-verifier`, which runs **multi-round epistemic challenge** (proposing, challenging, and cross-examining assumptions round-by-round until the frontier is settled).

## How to Invoke

Prompts do not require quotation marks or synthetic flags. State your proposal naturally:

```bash
# Default: Runs multi-round epistemic challenge until settled
/grill-logic migrate session tokens to redis cluster

# Autonomous self-grill (AFK): Audits internally without interrupting you
/grill-logic self-grill: refactor query pipeline to use raw sockets

# Interactive human interview (HITL): Formulates multiple-choice questions for you
/grill-logic interview me on adopting GraphQL for our mobile backend

# Deterministic probe: Enforces empirical tool/compiler verification
/grill-logic check in sandbox if jemalloc builds with MSVC
```

## The Rhythm

1. **Deconstruct**: Extracts explicit premises ($P_1..P_n$), uncovers hidden assumptions ($P_{\text{hidden}}$), and isolates the candidate action ($C$).
2. **Multi-Round Epistemic Challenge**:
   * *Round 1*: Attacks the inferential bridge ($P \vdash C$). Does $P$ necessitate $C$, or is there a simpler alternative $C'$?
   * *Round 2*: Challenges the counter-hypothesis itself. If an alternative is proposed, stress-tests its boundary conditions.
   * *Round $k$*: Continues until the epistemic frontier is settled.
3. **Ledger & Gate**: Records status (`SUPPORTED`, `REJECTED`, or `UNCERTAIN`) in `LOGICAL_LEDGER.md`. If rejected, registers an active **Contrastive Refutation Rule** and halts execution.

Call the Skill tool for `epistemic-verifier` to execute the audit.
