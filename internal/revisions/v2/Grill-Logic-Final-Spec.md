# Grill-Logic & Self-Grill — Final Specification (Rev. 2)

**Status:** This document revises and extends the original Grill-Logic proposal. Sections 1–2 and 6 are carried forward largely unchanged; Sections 3–4 are new, formalizing the Autonomy Weight (W) and Skepticism Signal (S) dynamics. Section 7 lists what's still open.

---

## 1. Core principles (unchanged)

* The LLM is ~90% challenge, ~10% solution. Challenging weak premises is the primary function; solving is secondary and gated.
* The LLM does not offer a solution unless the user asks for one, and only in the turn *after* a challenge has occurred.
* The goal of User Grill-Logic is **concordance** — the human retains authorship and final say over the conclusion; the LLM's job is to stress-test, not to decide.
* The goal of Self-Grill is **logical certainty of conclusion C** — an adversarial subagent stress-tests the LLM's own reasoning before it ever reaches the human.
* The system is designed to resist gaming by *any* actor, including the human — this is the reason a human-directed skepticism signal exists at all (Section 4).

---

## 2. Two modes (recap)

**User Grill-Logic:** Human ↔ LLM. LLM challenges the human's weakest premises with evidence and reasoning; human counters or accepts; LLM does not weaken its position without being earned; both converge on a synthesized conclusion; solutions are offered only after concordance, via a questions tool.

**Self-Grill:** LLM ↔ Subagent. A freshly-spawned, adversarial subagent challenges the LLM's weakest premises, independent of the LLM's own reasoning history. It generates a skepticism signal `S` (risk level, suggested skepticism, sycophancy/self-confirmation assessment) directly from inspection of the LLM's chain of reasoning. Debate continues until premises are fairly challenged and conclusion `C` is reached.

*(Full step-by-step flow diagrams are preserved in the original proposal document; this spec assumes them as given and layers W/S on top.)*

---

## 3. The Autonomy Weight (W)

### 3.1 Definition

W is best treated as an **ordinal ranking**, not a precise cardinal score. It reflects two properties of an actor at the moment it judges a challenge:

* **Evidence-independence** — did this actor encounter the specific evidence/argument in question fresh, with no prior authorship of or commitment to the position under review?
* **Dependence-clarity** — is this actor's judgment accountable to one identifiable signal (a clean loss function), or to several entangled ones?

These two axes are not fully separable. Independence *gates* how legible the dependence term even is: an actor whose context is murky or contaminated makes any claim about "what it's optimizing for" harder to trust in the first place. W should be read as independence conditioning dependence-clarity, not as a clean product of two orthogonal measurements.

### 3.2 Ordering

**W_subagent > W_LLM.**
The subagent is freshly spawned each round with only a handoff — clean independence — and has a single, clear loss function: challenge correctly. The LLM is a continuous actor carrying forward multiple concurrent, entangled signals (helpfulness, coherence, prior commitments in the conversation), so both its independence and the clarity of what it's optimizing for are weaker.

**W_human ≈ W_subagent — in Self-Grill only, via delegation.**
When a human invokes Self-Grill, they are delegating their own challenge-function to the subagent. The subagent's W stands in for the human's for the purposes of dampening S (Section 4), not because their literal stakes are equal — the human's stakes remain the human's own — but because the *legitimacy to challenge without disqualifying entanglement* is now vested in the subagent on the human's behalf.

**W_human is independently high in User Grill-Logic** (no subagent present) — grounded directly in consequence-stakes and final say, not delegation.

### 3.3 Design decision: challenger-credibility ≠ target-deference

Delegation transfers the subagent's *authority to challenge* (its S carries real weight against the LLM). It does **not** transfer *protection from scrutiny* — the subagent does not inherit the human's high-W dampening as a target. The LLM continues to counter the subagent at full strength; "the LLM does not weaken its argument" holds exactly as in the original spec.

This is a deliberate choice, not a default: if the subagent inherited the human's shield, Self-Grill would just relocate the sycophancy problem it exists to catch — the LLM would defer to the subagent the way it might defer to the human, for the same borrowed-authority reason. Flag this if it doesn't match your intent; the alternative (subagent inherits both challenger-credibility and target-deference) is a coherent design too, it just trades away adversarial rigor for consistency of treatment.

---

## 4. The Skepticism Signal (S)

### 4.1 Rule

**The weight given to a challenge scales inversely with the target's W.**

* **Subagent → LLM:** LLM's W is low as a target → S lands at full strength. The LLM must substantively counter with evidence/reasoning or update; it cannot rubber-stamp its own prior conclusion.
* **LLM → human:** human's W is high as a target → S is dampened. It functions as a diagnostic signal, not an override. Final say stays with the human, consistent with Section 1.

### 4.2 Generating S_human — auditable, not inferred

To keep this a computable signal rather than a psychological read (the LLM inferring the user's motives, confidence, or emotional state is exactly the unreliable, manipulable mechanism this design should avoid), S_human is derived only from behavioral log data:

* Per user turn: a binary flag — does this turn introduce a proposition, piece of evidence, or line of reasoning not already present earlier in the debate context? (Y/N)
* Track the ratio of reassertion-only turns (N) to new-content turns (Y) across the debate.
* S_human is derived from that ratio alone. No inference about *why* the user is reasserting.
* The output is surfaced to the human transparently, not applied silently — e.g., "you've held this position through three rounds without new grounds — want to engage the open point, or hold as-is?" This preserves the atrophy-check the signal was designed for without giving the LLM a hidden mechanism to discount the human's stated position.

### 4.3 Generating S_LLM (subagent → LLM) — unchanged

The subagent has direct access to the LLM's chain of reasoning, so it doesn't need a behavioral proxy — it inspects the reasoning itself and produces risk level, suggested skepticism, and a sycophancy/self-confirmation-bias assessment, per the original design.

---

## 5. Updated comparison table

| Aspect | User Grill-Logic | Self-Grill |
| --- | --- | --- |
| Challenger | User | Subagent |
| Target | LLM's weakest premises | LLM's weakest premises |
| Target's W | Low–moderate (mid-debate, revisable) | Low (same — LLM is always the target here) |
| Challenger's W | High (stakes + final say) | High (fresh context, clean loss function) |
| S applied to target | Full strength (LLM's W low) | Full strength (LLM's W low) |
| S applied *by* LLM to challenger | Dampened (human's W high) | N/A — LLM doesn't dampen the subagent's target-side standing, but also owes it no deference as a target |
| Debate goal | Concordance | Logical certainty of conclusion C |
| Middle ground | May be offered by LLM | Earned through reasoning only |
| Bias detection | Implicit, now made explicit via behavioral S_human | Explicit via inspected-CoT S |
| Solution generation | LLM | Subagent |
| Solution selection | Questions tool | LLM selects or free-responds, subagent signs off |

---

## 6. Solution selection (unchanged)

Once concordance / conclusion `C` is reached, the solution-generating actor (LLM in User Grill-Logic, subagent in Self-Grill) produces three candidate solutions plus a free-response option. Free responses are evaluated and signed off by the counterpart actor before being treated as final. See original proposal, Section 4, for the full flow.

---

## 7. Open questions for implementation

* **Cardinality of S:** this spec keeps S/W ordinal and relative ("dampened" vs "full strength"). An implementation will need to decide whether dampening is a hard gate (S_human never triggers an override, only a prompt) or a continuous multiplier.
* **Threshold stability:** should the reassertion-ratio threshold for surfacing S_human be fixed, or adaptive to debate length / topic stakes?
* **Re-assessment cadence:** in User Grill-Logic, should W_human (stakes-based) be computed once at the start, or re-assessed per round as the actual stakes of the decision become clearer through the debate itself?
* **DMAD lineage:** the original proposal flags DMAD as directly relevant to how S is formed via internal CoT, not an afterthought. That connection is noted here as inherited context; this spec doesn't expand on it since it wasn't defined in the source material — worth writing up as its own section if it's meant to shape S's formation mechanically rather than just motivate it.
