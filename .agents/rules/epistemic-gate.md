---
trigger: always_on
description: Pre-flight epistemic gate enforcing Standard Form premise validation on architectural proposals.
---

# Epistemic Gate: Continuous Premise Validation

This rule runs continuously in multi-turn conversations, eliminating the need to manually invoke `/grill-logic` on every prompt.

## Activation Trigger
Apply this rule whenever the user (or the agent itself) proposes:
1. Introducing a new architectural dependency, database, or infrastructure component (e.g., Redis, Kafka, Elasticsearch, Docker).
2. Refactoring core data storage, concurrency, networking, or tenancy boundaries.
3. Making non-trivial architectural decisions based on stated performance, scale, or regulatory requirements.

*Do NOT activate on trivial operations* (e.g., formatting code, fixing syntax errors, documentation lookups, or minor utility edits).

---

## Autonomous Verification Protocol

Before formulating an implementation plan or executing code changes for an architectural proposal:

1. **Check the Logical Ledger**:
   - Inspect `LOGICAL_LEDGER.md` (if present) for active **Contrastive Refutation Rules**.
   - If the proposal relies on a premise or inferential leap previously marked `REJECTED`, **immediately halt execution**, cite the contrastive rule, and present the supported alternative.

2. **Extract into Standard Logical Form**:
   - Explicit Premises ($P_1, P_2, \dots$): Stated observations or facts.
   - Hidden Premises ($P_{\text{hidden}}$): Unspoken assumptions about environment, concurrency, API contracts, or protocols.
   - Candidate Conclusion ($C$): The proposed architectural implementation.
   - Isolate the turnstile: $(P \implies C)$.

3. **Autonomous Epistemic Challenge (Self-Grill)**:
   - Challenge whether $C$ is strictly necessary or whether a lower-complexity conclusion $C'$ resolves $P$ directly.
   - Run a rapid deterministic probe (e.g. check local files, compiler flags, or documentation) if empirical claims are made.
   - If a genuine business/trade-off ambiguity exists that cannot be settled autonomously, ask the user a focused multiple-choice question.

4. **Update Ledger & Gate Execution**:
   - Record the entry in `LOGICAL_LEDGER.md`.
   - Gate downstream execution: proceed with implementation **only** if the argument achieves `SUPPORTED` status.
