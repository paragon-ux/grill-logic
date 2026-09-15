# Agent Lifecycle Hook Architecture & Setup Guide

This document defines the **abstract operational contract** for implementing non-Git agent lifecycle hooks across AI coding environments. 

Rather than maintaining proprietary, harness-specific shell scripts, Grill-Logic establishes a universal protocol that any agentic harness can implement to achieve continuous, hands-free premise validation.

---

## 1. What is an Epistemic Lifecycle Hook?

In multi-turn agent workflows, developers frequently propose architectural changes, introduce external dependencies, or refactor storage boundaries across multiple prompts. Asking the developer to manually type `/grill-logic` on every single turn introduces cognitive friction.

An **Epistemic Lifecycle Hook** automates this by intercepting conversational turns at runtime. It acts as an autonomous circuit breaker: whenever an architectural claim is detected, it forces pre-flight premise verification *before* the agent begins procedural planning or code generation.

---

## 2. The Abstract Interception Protocol

An epistemic lifecycle hook operates across four distinct phases:

```
User Prompt Submitted
         │
         ▼
[Phase A: Interception Timing] ──> (Post-input, Pre-generation)
         │
         ▼
[Phase B: Assertion Analysis]  ──> (Detects architectural / infrastructure claims)
         │
         ▼
[Phase C: Registry Check]      ──> (Queries LOGICAL_LEDGER.md for active REJECTED rules)
         │
         ▼
[Phase D: Epistemic Directive] ──> (Injects ephemeral Standard Form P ⊢ C requirement)
         │
         ▼
Agent Model Generation / Tool Use Begins
```

### Phase A: Interception Timing
The hook must execute synchronously at the boundary between user input submission and model generation:
* **After**: The user prompt is received.
* **Before**: The agent generates reasoning tokens, formulates an implementation plan, or calls tools.

### Phase B: Assertion Analysis
The hook inspects the latest conversational turn against architectural and infrastructure indicators:
* Introducing databases, caching layers, message brokers, or container runtimes (e.g., PostgreSQL, Redis, Kafka, SQLite, Docker).
* Refactoring core concurrency, networking, or tenancy boundaries (e.g., async runtimes, connection pooling, multi-tenant isolation).
* Making non-trivial scaling or performance claims (e.g., zero-copy I/O, distributed sharding).
* *Filter out trivial requests*: Syntax fixes, code formatting, documentation lookups, and unit test tweaks bypass the hook.

### Phase C: Truth Registry Check
The hook inspects `LOGICAL_LEDGER.md` (if present at the workspace root):
* Scans the active decision table for arguments marked **`REJECTED`**.
* Extracts active **Contrastive Refutation Rules** (e.g., *"Do not infer caching layer from read latency without profiling query plans"*).
* If the proposal matches a refuted pattern, the hook alerts the model to block execution immediately and present the supported alternative.

### Phase D: Epistemic Intervention
If an architectural assertion is confirmed, the hook injects an ephemeral directive into the active context window:
> *"[Epistemic Gate Active]: Architectural assertion detected. Before writing code or generating procedural plans: (1) deconstruct premises into Standard Logical Form ($P_1..P_n \vdash C$), (2) verify active negative constraints in LOGICAL_LEDGER.md, and (3) gate execution until status is SUPPORTED."*

---

## 3. Implementation Models

Depending on the architecture of your agent harness, implement the epistemic hook using one of two patterns:

### Model 1: Static Instruction Injection (Zero-Script Hook)

Most modern AI agent harnesses continuously include project instructions or rule files in every model turn.

* **How to configure**:
  1. Place [`.agents/rules/epistemic-gate.md`](../.agents/rules/epistemic-gate.md) in your project root or harness rules directory.
  2. Reference the core protocol in your root agent configuration files (e.g., [`AGENTS.md`](../AGENTS.md), [`CLAUDE.md`](../CLAUDE.md), or system instructions).
* **Advantages**:
  - Requires **zero external scripts**, runtimes, or process spawning.
  - 100% portable across any agent environment that supports project-level rules.
  - Automatically maintained without cross-platform shell incompatibilities.

### Model 2: Event-Driven Lifecycle Interceptor (Dynamic Hook)

For harnesses that expose programmable hook endpoints (e.g., pre-invocation, pre-prompt, or prompt middleware):

* **Input Contract**:
  - The harness passes the invocation payload (prompt text, message array, or transcript URI) to the interceptor handler via stdin or function argument.
* **Processing Contract**:
  - Inspect the input string for architectural triggers.
  - Query `LOGICAL_LEDGER.md` for active constraints.
* **Output Contract**:
  - If triggered: Emit an ephemeral system message or context injection object.
  - If not triggered: Emit an empty/null response immediately.
* **The Fail-Open Invariant**:
  - The hook interceptor must **always fail open**. If a script crashes, encounters malformed JSON, or times out, it must exit cleanly without injecting text and without halting the agent session.

---

## 4. Contract Checklist

When implementing an epistemic hook in any custom agent runner or harness:

- [ ] Executes strictly before model token generation begins.
- [ ] Bypasses trivial operations (formatting, documentation, typos).
- [ ] Intercepts proposals introducing infrastructure, databases, or boundary refactors.
- [ ] Enforces Standard Logical Form extraction ($P_1..P_n \vdash C$).
- [ ] Enforces active negative constraints from `LOGICAL_LEDGER.md`.
- [ ] Complies with the Fail-Open Invariant (never crashes the conversation loop).
