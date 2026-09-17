# Challenge Problem

## The Problem with the Current Definition of Challenge

There is once again a problem with the definition of *challenge*.

Challenge is being treated as a method to wholesale launder in fallacies such as strawmanning and confirmation bias.

The problem is not just the 90/10 split. It is also overloading.

Challenging premises and a conclusion is not simply one step that can be plugged into a deterministic solver.

Proof by contradiction is what we were going for, but it is prone to strawmanning loops and self-confirmation. This is because the goalpost can shift for stochastic debaters, even with grounding—for example, by changing the actual point of the original prompt.

---

## What Changed in This Revision

A logical self-audit of this protocol found the three-step ordering below is sound, but several rules inside it were underspecified enough to be gamed — which is exactly the kind of overloading the section above warns about. Five fixes are folded into the steps that follow:

1. **"Accepted" meant five different things.** Interpretation-accepted, premise-accepted, solver-validated, solution-accepted, and automatically-advanced were all being called "accepted," but none of them imply the others. Each step below is explicit about which one it means.
2. **A failed solver check was treated as an automatic refutation.** A solver can fail because the argument is genuinely invalid, but also because the representation is malformed, the expression is unsupported, the premises are inconsistent, or the solver simply can't decide. Only the first case is a refutation.
3. **Formal validity and empirical truth were conflated.** A solver can confirm that a conclusion follows from stated premises. It cannot confirm the premises are true in the world. That's a separate, empirical question, and it belongs to the challenge exchange, not the solver.
4. **"No counter" was being read as agreement.** It isn't. Silence, uncertainty, and missing evidence all look identical to agreement if agreement is a binary flag. Step 3 replaces the flag with a tally and one governing rule: rejection requires an empirical counter to count.
5. **The number of parties in a challenge was left ambiguous.** There are exactly two, and which two depends on the mode. Step 3 states this directly.

---

## Step 1. Add-Logic

### Decompose and Confirm the Logical Set

Firstly, the model must decompose the correct premises and conclusion from the prompt.

The user must agree with the model's interpretation of the explicated logical set.

**If the user corrects the logical set, that correction must be accepted verbatim as the baseline, even if it is erroneous.**

Exceptions:

* The ledger already contains the logical set.
* The new logical set is too close to duplication.

However, if the model declines to add the logical set because of either exception, it must inform the user rather than silently declining.

### Interpretation Is Not Challenge, and Agreement Is Not Truth

This step is not a step to challenge. It is a step to confirm interpretation, in logical form.

Agreement at this stage means the user confirms the logical set is what is actually being discussed. It does not mean the premises are true, and it does not mean the model has verified anything. **Interpretation-accepted** and **premise-true** are different states, and only the first one is established here. The premises stay open to challenge in Step 2 and Step 3, no matter how confidently the user or model stated them.

Once confirmed, the logical set is added to the ledger.

This must happen before self-grill or grill-logic can ever happen.

It has to be a separate skill that can chain to the other two, but the other two cannot run without it.

This is the `/add-logic` skill.

### /add-logic Requirements

* The logical set must be explicated from the prompt.
* The model must present its interpretation to the user.
* The user must agree with the interpretation. This confirms the baseline claim under discussion — not its truth.
* If the user corrects the logical set, the correction becomes the baseline verbatim.
* The ledger must not already contain the same entry.
* The model must deduplicate existing entries.
* If the logical set is already in the ledger, or is too close to duplication, the model must inform the user rather than silently declining.
* The logical set is added to the ledger only after the user agrees with the model's interpretation.

### Chaining to Grill-Logic or Self-Grill

Only then can you run self-grill or grill-logic.

At that point, there are debatable, user-accepted premises to challenge — "accepted" here meaning accepted as the baseline claim, not accepted as fact.

Example chains:

`/add-logic The sky is blue because of Rayleigh scattering /grill-logic`

`/add-logic Grass is green because of chlorophyll /self-grill`

If the `/add-logic` skill is not called first, the other two skills must use it.

Again, `/add-logic` ledger entries will not have a label until they go through `/grill-logic` or `/self-grill`.

---

## Step 2. Deterministic Validation

### Enter Core Logic into a Solver

After adding logic in logical form to the ledger:

The LLM must enter its core logic into a solver for deterministic validation.

### What the Solver Validates, and What It Doesn't

The solver checks whether the conclusion follows from the stated premises. It does not, and cannot, check whether those premises are true in the world. That's a structural check, not an empirical one: a solver can confirm an argument's structure is valid while a premise is still false. Establishing that premises are actually true is the job of the challenge exchange in Step 3, using empirical evidence — not the job of the solver.

### A Solver Failure Is Not Automatically a Refutation

Not every way a solver check can fail means the argument is false. A solver run can come back as:

* **Formally invalid** — the conclusion genuinely does not follow from the premises, or the premises are self-contradictory. This is the only case that counts as a refutation. The model refutes it immediately.
* **Malformed** — the logical set wasn't translated into solver-readable form correctly. The model reformulates the representation and re-runs it. This is not a refutation of the argument itself.
* **Unsupported expression** — the solver can't represent what the argument is claiming. The model falls back to internal reasoning and flags this in the ledger rather than treating the argument as false.
* **Inconsistent premises** — the premise set itself contains a contradiction independent of the conclusion. The model surfaces which premises conflict and returns to `/add-logic` to resolve it before proceeding.
* **Undecidable** — the solver can't determine an answer either way. The argument is marked `UNCERTAIN` in the ledger and routed to an empirical probe, not refuted.

Only the first case — genuine formal invalidity — triggers immediate refutation. The rest route to reformulation, internal reasoning, premise repair, or an empirical probe, matching the ledger's existing `SUPPORTED` / `REJECTED` / `UNCERTAIN` status lifecycle and its distinction between explicit and hidden premises.

### Validation Before Interpretation

After the logic is validated, and only then, can the LLM interpret it and begin the challenge (`grill-logic`) or proposal (`self-grill`).

If it fails validation, the model routes it according to which failure type occurred above — only the formally-invalid case is refuted immediately.

This essentially bootstraps the conversation.

The rest is empirical evidence exchanged between the challenger (human/subagent) and the proposer.

---

## Step 3. Solution Proposal and Acceptance

### There Are Exactly Two Parties

Every challenge exchange has exactly two parties — never three. Which two depends on the mode:

* **`/grill-logic`**: the human and the LLM.
* **`/self-grill`**: the LLM and the subagent. The subagent acts on the human's delegated authority; it is not a third party the human also has to separately agree with.

### Propose, Validate, Tally

Once all of the premises have been either refuted or accepted:

Only then is a solution proposed.

The solution must be run through the solver.

If validated, it becomes the tentative solution.

The tentative solution remains uncertain until accepted.

### The Empirical-Counter Rule

The rule governing acceptance is this: **a rejection is not accepted as valid unless it is backed by an empirical counter.** A party can decline to agree without that silence being treated as a valid objection, and a party can object without that objection being treated as a refutation — only a rejection with cited evidence, a probe result, or a demonstrated logical flaw moves a proposition to `REJECTED`.

This replaces the old shortcut of "if the other party has no counter, the protocol agrees for them." No counter does not mean agreement — it may mean uncertainty, missing evidence, or that the point hasn't been evaluated yet. What it does mean, under this rule, is that no valid objection is currently on the table, so the protocol has grounds to advance. That advancement is a **procedural acceptance** — the protocol proceeding because nothing has substantiated a rejection — not a claim about what the other party actually believes.

### Tracking Agreement as a Tally, Not a Flag

Rather than a single accepted/not-accepted flag, each proposition carries a running tally of agreement, disagreement, and unresolved uncertainty, recorded alongside the evidence behind each entry (the ledger's existing Challenger & Evidence field). This keeps three things separate that used to get flattened into one:

1. **Agreement with the interpretation** — does the logical set from `/add-logic` accurately represent the prompt?
2. **Agreement with the premises** — do the two parties accept each premise, per the Empirical-Counter Rule above?
3. **Agreement with the solution** — do the two parties accept the proposed conclusion?

These three tallies are tracked independently. Resolving one does not resolve the others, and a solution never inherits an interpretation's or a premise's agreement state by default.

Only once a solution clears its own tally — no outstanding rejection backed by an empirical counter — does it move from tentative to accepted in the ledger.

---

## Summary

That is the proper decomposition of a challenge:

1. **Add-Logic** — Decompose and confirm the logical set, then add it to the ledger. Confirmation establishes the baseline under discussion, not its truth.
2. **Deterministic Validation** — Enter the core logic into a solver and validate it before interpretation or challenge. Only genuine formal invalidity counts as refutation; other solver failures route to reformulation, internal reasoning, premise repair, or an empirical probe.
3. **Solution Proposal and Acceptance** — Propose and validate a solution between exactly two parties (human/LLM in `/grill-logic`, LLM/subagent in `/self-grill`), then move it from tentative to accepted once no rejection backed by an empirical counter remains against it.
