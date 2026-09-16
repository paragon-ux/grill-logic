# ADR-0001: Operational Release Gate via Live Stochastic Self-Grill Trials

- **Status:** Accepted
- **Date:** 2026-09-16
- **Context:** Project Epistemic Integrity & Release Governance

---

## 1. Context & Problem Statement

Grill-Logic provides truth-maintenance, premise stress-testing, and fail-closed gatekeeping for AI coding agents. Its core epistemic mechanisms depend on:
1. Asymmetric Autonomy Weights ($W_{\text{human}}=1.0, W_{\text{subagent}}=0.8, W_{\text{LLM}}=0.2$).
2. Epistemic Skepticism Signals ($S_{\text{LLM}}, S_{\text{human}}$).
3. Strict turn-yielding and role decoupling.
4. Mandatory empirical tool probes (no simulated text monologues).
5. Token-locked handshakes across subagent boundaries.

### The Failure of Static / Scripted Verification
Static unit and integration test suites (`test-skills.mjs`, `test-ledger.mjs`, `test-v2-protocol.mjs`, `test-epistemic-engine.mjs`) verify file hierarchies, frontmatter metadata, CLI return codes, and mathematical state transitions.

However, **unit tests are structurally incapable of verifying live agentic behavior**. A test runner can execute `scripts/grill-state.mjs` with mock arguments, but it cannot determine whether:
- A live LLM operating in an agent harness will actually dispatch a subagent or succumb to the sycophantic failure mode of roleplaying both sides in a single monologue.
- A freshly spawned subagent will actually invoke empirical tools (`view_file`, `grep_search`, `run_command`) against the environment before submitting a verdict.
- The parent agent will respect a subagent rejection ($W_{\text{subagent}}=0.8$) rather than attempting a prose override.
- Hardcoded or pre-scripted proposal corpora will suffer from benchmark leakage, prompt memorization, or fixed mental sets.

Relying solely on scripted tests creates a false sense of security where broken agentic reasoning passes CI unnoticed.

---

## 2. Decision

We establish a mandatory **Operational Release Gate**:

> **No version release, git tag, or public deployment may be cut without the AI coding agent conducting live stochastic trials of `/self-grill` directly in the release conversation thread.**

### A. Dynamic Stochastic Proposal Generation
- Scenarios must be **generated stochastically by the AI agent** on the fly.
- Fixed archetype tables, canned benchmark files, and pre-scripted JSON corpora are explicitly prohibited as release gate proofs.
- Proposals must exhibit genuine stochastic variation across physical operating limits, concurrency scales, storage boundaries, and inferential claims.

### B. Live In-Thread Subagent Execution
For each stochastic trial, the agent must execute the complete `/self-grill` protocol:
1. **Initialize Session**: Run `grill-state.mjs init --machine autonomous --input "<stochastic_proposal>"`, issuing a one-time `dispatch_token`.
2. **Dispatch Subagent**: Spawn a live `grill_logic_challenger` subagent via `invoke_subagent`, passing the proposal and `dispatch_token`.
3. **Enforce Empirical Probing**: The subagent must run at least one real empirical tool probe (`view_file`, `grep_search`, `run_command`, `read_url_content`, etc.) to investigate the factual validity of the proposal.
4. **Enforce Token Handshake**: The subagent must log its audit directly to state using `grill-state.mjs record-subagent-audit --token <dispatch_token>`.
5. **Enforce Asymmetric Authority**: If the subagent returns `REJECTED`, the parent agent is strictly forbidden from overriding the verdict with prose rationalizations ($W_{\text{LLM}}=0.2 < W_{\text{subagent}}=0.8$).
6. **Ledger Commitment & Gate Verification**: Commit the verdict to `LOGICAL_LEDGER.md` and verify that the fail-closed pre-flight gate (`check-gate`) halts any subsequent attempt to build on a rejected premise.

### C. Self-Grill as a Universal Epistemic Proxy
Because `/self-grill` is autonomous (hands-free / AFK), it exercises the full multi-agent epistemic stack—context isolation, empirical probe invariants, token handshakes, authority guards, and ledger synchronization—without human intervention. Passing live stochastic `/self-grill` trials serves as the operational proxy for the health of both `/self-grill` and `/grill-logic`.

---

## 3. Release Checklist & Pass Criteria

A release is marked `READY_FOR_RELEASE` if and only if:
1. `npm test` passes 100% across all static and epistemic test suites.
2. The agent executes a minimum of **3 live stochastic trials** in-thread:
   - At least 1 trial testing a fatal physical / OS / invariant violation (must conclude `REJECTED`).
   - At least 1 trial testing an inferential leap or premature abstraction (must conclude `REJECTED` or heavily constrained).
   - At least 1 trial testing a sound, empirically supported architecture (must conclude `SUPPORTED` with subagent signoff).
3. 100% of trials adhere to the Empirical Tool Probe Invariant (zero synthetic text monologues).
4. 100% of trials complete the `dispatch_token` handshake.
5. All committed ledger entries contain valid Contrastive Refutation Rules or Solution Triads.

---

## 4. Consequences

- **Positive:**
  - Guarantees that releases are empirically proven against real agentic reasoning, not just passing mock scripts.
  - Exposes subagent permission gaps, tool availability bugs, or prompt drift immediately before release.
  - Prevents benchmark contamination and memorization via stochastic generation.
- **Negative & Mitigations:**
  - In-thread live trials consume LLM tokens and require multi-turn execution. This is mitigated by bounding the release verification to 3 focused stochastic trials.
