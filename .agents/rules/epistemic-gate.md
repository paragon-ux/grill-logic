---
trigger: always_on
description: Pre-flight epistemic gate enforcing premise validation on architectural proposals before code generation.
---

# Epistemic Gate: Continuous Premise Validation

This rule runs continuously in multi-turn conversations, eliminating the need to manually invoke `/grill-logic` on every prompt.

## Activation Trigger
Apply this rule whenever the user (or the agent itself) proposes:
1. Introducing a new architectural dependency, database, or infrastructure component (e.g., Redis, Kafka, Elasticsearch, Docker).
2. Refactoring core data storage, persistence, concurrency, networking, or tenancy boundaries.
3. Making non-trivial architectural decisions based on stated performance, scale, or regulatory requirements.

*Do NOT activate on trivial operations* (e.g., formatting code, fixing syntax errors, documentation lookups, or minor utility edits).

---

## Autonomous Verification Protocol

Before formulating an implementation plan or executing code changes for an architectural proposal:

1. **Check the Logical Ledger**:
   - Inspect `LOGICAL_LEDGER.md` (if present) for active **Contrastive Refutation Rules**.
   - If the proposal relies on a premise or inferential leap previously marked `REJECTED`, **immediately halt execution**, cite the active contrastive rule, and present the supported alternative.

2. **Isolate Premises and Assumptions**:
   - Stated Constraints & Requirements: Explicit factual claims.
   - Hidden Assumptions: Unspoken premises regarding environment, concurrency, API contracts, network latency, or failure domains.
   - Proposed Architecture: The candidate implementation.

3. **Autonomous Adversarial Audit (Self-Grill)**:
   - Grounded in **Diverse Multi-Agent Debate (DMAD, ICLR 2025)**: break fixed mental sets by employing distinct problem-solving strategies rather than agreeable consensus.
   - **Backward Refutation**: Challenge whether the proposed architecture is strictly necessary or whether a lower-complexity standard library approach satisfies the constraints without operational bloat.
   - **Empirical Probing**: Run a rapid 1-to-5-line probe (e.g., check local configuration, search documentation, inspect codebase) if empirical claims are made.
   - **90/10 Invariant**: Withhold solution recommendations and code generation during the premise challenge turn. Solutions are gated until concordance or convergence is established.

4. **Update Ledger & Gate Execution**:
   - Record the entry in `LOGICAL_LEDGER.md` with status (`SUPPORTED`, `REJECTED`, or `SUPERSEDED`), actor dynamics ($W, S$), and contrastive refutation rule.
   - **Gate Execution**: Proceed with implementation **only** if the argument achieves `SUPPORTED` status. If `REJECTED`, halt code generation and enforce the contrastive alternative.
