# Challenge Problem

## The Problem with the Current Definition of Challenge

There is once again a problem with the definition of *challenge*.

Challenge is being treated as a method to wholesale launder in fallacies such as strawmanning and confirmation bias.

The problem is not just the 90/10 split. It is also overloading.

Challenging premises and a conclusion is not simply one step that can be plugged into a deterministic solver.

Proof by contradiction is what we were going for, but it is prone to strawmanning loops and self-confirmation. This is because the goalpost can shift for stochastic debaters, even with grounding—for example, by changing the actual point of the original prompt.

---

## Step 1. Add-Logic

### Decompose and Confirm the Logical Set

Firstly, the model must decompose the correct premises and conclusion from the prompt.

The user must agree with the model's interpretation of the explicitated logical set.

**If the user corrects the logical set, that correction must be accepted verbatim as the baseline, even if it is erroneous.**

Exceptions:

* The ledger already contains the logical set.
* The new logical set is too close to duplication.

However, if the model declines to add the logical set because of either exception, it must inform the user rather than silently declining.

### Interpretation Is Not Challenge

This step is not a step to challenge. It is a step to confirm interpretation, in logical form.

Once confirmed, the logical set is added to the ledger.

This must happen before self-grill or grill-logic can ever happen.

It has to be a separate skill that can chain to the other two, but the other two cannot run without it.

This is the `/add-logic` skill.

### /add-logic Requirements

* The logical set must be explicitlyated from the prompt.
* The model must present its interpretation to the user.
* The user must agree with the interpretation.
* If the user corrects the logical set, the correction becomes the baseline verbatim.
* The ledger must not already contain the same entry.
* The model must deduplicate existing entries.
* If the logical set is already in the ledger, or is too close to duplication, the model must inform the user rather than silently declining.
* The logical set is added to the ledger only after the user agrees with the model's interpretation.

### Chaining to Grill-Logic or Self-Grill

Only then can you run self-grill or grill-logic.

At that point, there are debatable, user-accepted premises to challenge.

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

### Validation Before Interpretation

After the logic is validated, and only then, can the LLM interpret it and begin the challenge (`grill-logic`) or proposal (`self-grill`).

If it fails validation, it must be refuted immediately by the model.

This essentially bootstraps the conversation.

The rest is empirical evidence exchanged between the challenger (human/subagent) and the proposer.

---

## Step 3. Solution Proposal and Acceptance

Once all of the premises have been either refuted or accepted:

Only then is a solution proposed.

The solution must be run through the solver.

If validated, it becomes the tentative solution.

The tentative solution remains uncertain until accepted.

Only once both parties agree does it become the accepted solution in the ledger.

However, if the other party does not have a counter, the protocol automatically agrees for them.

---

## Summary

That is the proper decomposition of a challenge:

1. **Add-Logic** — Decompose and confirm the logical set, then add it to the ledger.
2. **Deterministic Validation** — Enter the core logic into a solver and validate it before interpretation or challenge.
3. **Solution Proposal and Acceptance** — Propose and validate a solution, then move it from tentative to accepted once both parties agree, or automatically agree if the other party has no counter.
