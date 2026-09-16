---
name: grill-logic
description: Grill the premises of an architectural proposal or plan before writing code. Prevents building on unexamined assumptions.
disable-model-invocation: true
argument-hint: "[proposal or design text]"
---

# Grill-Logic

Stress-test an architectural proposal, database choice, infrastructure component, or major refactor before code execution begins. Grill-Logic challenges the weakest premises of an argument, ensuring that engineering plans rest upon verified facts rather than unexamined assumptions.

The system enforces a strict **90% challenge / 10% solution invariant**: solutions are never offered during challenge turns and are only presented after concordance is reached.

---

## Invocation & Modes

Grill-Logic parses natural language directly without requiring synthetic CLI flags:

### 1. Mode A: User Grill-Logic (Interactive Concordance)
Use when collaborating with the agent to refine an architecture:
```text
/grill-logic interview me on migrating our session store to Redis
/grill-logic grill me on decomposing the monolith into 6 microservices
/grill-logic [proposal text]
```
- **Dynamic**: The agent challenges your weakest premises using evidence and solvers.
- **Human Authority**: Your autonomy weight ($W_{\text{human}}$) is high. You retain sovereign decision stakes and final say.
- **Solution Gating**: Once concordance is reached, the agent presents 3 candidate solutions plus a free-response option via an interactive question.

### 2. Mode B: Self-Grill (Autonomous Adversarial Audit)
Use when you want an autonomous, thorough audit before code generation:
```text
/grill-logic self-grill: use SQLite WAL mode over NFS for multi-container workers
/grill-logic autonomously audit our caching strategy before implementation
```
- **Dynamic**: The agent spawns a fresh adversarial subagent with virgin context ($W_{\text{subagent}} > W_{\text{LLM}}$).
- **Cognitive Diversity**: Grounded in Diverse Multi-Agent Debate (DMAD, ICLR 2025) to break fixed mental sets through distinct problem-solving strategies.
- **Rigorous Sign-Off**: The subagent generates $S_{\text{LLM}}$ by inspecting the proposer's reasoning trace and signs off before delivery.

---

## Execution Handoff

Immediately invoke the `epistemic-verifier` skill to execute the verified state machine protocol.
