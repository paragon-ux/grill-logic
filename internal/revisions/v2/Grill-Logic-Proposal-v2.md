# Grill-Logic & Self-Grill — Protocol Flows (Rev. 2)

*Companion document to `Grill-Logic-Final-Spec.md`. This revises the original proposal's flow diagrams to reference the Autonomy Weight (`W`) and Skepticism Signal (`S`) formalized there, and corrects a role inconsistency in the original's summary table (§5). Structure is otherwise preserved.*

Proposal: Grill-Logic skill. It is not a skill where the LLM simply challenges and provides solutions. The biggest problem is in the word "challenge."

LLMs are not pure logical solvers — even neurosymbolic AI is vulnerable to fallacy. They need to be ~90% challenging logic, ~10% providing solutions. That gives autonomy over important decisions to the decision-affected actor — formalized as the actor's **Autonomy Weight (`W`)** — who concurs with the premise of the challenge with low skepticism only when that concurrence is earned, not assumed.

The LLM should *not* provide a solution unless the user asks in the *next* turn after the challenge.

> **Note on how `W`/`S` apply:** Object-level challenge rigor — how hard a premise actually gets pushed on — is constant throughout the system. The LLM does not weaken its argument, and neither does the subagent, regardless of who the target is. `W` and `S` govern a separate, *meta* layer only: how much weight a bias/rigor signal about an actor's own reasoning process is given. That signal lands at full strength when directed at the LLM (low `W` as target, in both flows) and is dampened when directed at the human (high `W` as target, in User Grill-Logic) — it never touches the strength of the underlying debate itself.

# 1. User prompts with Grill-Logic

Core idea: The LLM challenges the weakest premises of the user's argument, using evidence and solvers, until both sides converge on a synthesized conclusion. Because the human carries high `W` (final say, full consequence-stakes), the *meta-signal* the LLM forms about the human's own reasoning — `S_human` — is dampened by design: diagnostic, not overriding. The challenge itself is not dampened.

```
USER PROMPT
    |
    v
LLM IDENTIFIES WEAKEST PREMISES
    |
    v
LLM CHALLENGES PREMISES
    |
    +--> Evidence
    |
    +--> Solvers / Reasoning
    |
    v
USER EVALUATES CHALLENGE
    |
    +-----------------------------+
    |                             |
    v                             v
USER COUNTERS                 USER ACCEPTS
    |                             |
    v                             v
LLM GENERATES S_human           LLM INCORPORATES
(behavioral: new content vs     ACCEPTED PREMISES
reassertion — see §2B analog)   |
    |                             |
    v                             |
S_human DAMPENED PER W_human     |
(high — final say / stakes)      |
    |                             |
    v                             |
SURFACED TO USER DIAGNOSTICALLY  |
(meta-signal only — does not     |
weaken the object-level          |
challenge that follows)          |
    |                             |
    v                             |
LLM EVALUATES USER'S             |
COUNTERARGUMENT                  |
    |                             |
    v                             |
LLM COUNTERS USER'S              |
COUNTER WITH:                    |
    |                             |
    +--> More evidence           |
    |                             |
    +--> Solvers / Reasoning     |
    |                             |
    +--> Helpful guidance        |
    |                             |
    +--> Possible middle ground  |
    |                             |
    v                             |
USER EVALUATES AGAIN             |
    |                             |
    +---------->------------------+
                 |
                 v
       SYNTHESIZED CONCLUSION
                 |
                 v
       USER EVENTUALLY AGREES
                 |
                 v
       DEBATE REACHES CONCORDANCE
                 |
                 v
       LLM PROVIDES 3 POTENTIAL
       SOLUTIONS + FREE RESPONSE
                 |
                 v
       QUESTIONS TOOL
```

### Important behavioral rules

```
LLM CHALLENGES WEAK PREMISES
    |
    v
Evidence + Solvers
    |
    v
User counters or accepts
    |
    v
If user counters:
    |
    v
LLM generates S_human from behavioral log
(new proposition this turn? Y/N)
    |
    v
S_human dampened per W_human (high W -> soft signal)
    |
    v
Diagnostic surfaced to user, not used to override
    |
    v
LLM responds with more evidence
    |
    v
LLM does not weaken its argument
    |
    v
LLM may offer middle ground
    |
    v
Continue until synthesized conclusion
```

Goal: Concordance between the user and LLM, followed by a solution-selection step. `W_human` is never spent down by `S_human` — dampening is structural, not earned or lost turn to turn.

# 2. LLM uses Self-Grill

Core idea: A subagent acts as an adversarial oracle, challenging the LLM's weakest premises. The LLM must evaluate those challenges, with a skepticism signal `S_LLM` helping detect sycophancy and self-confirmation bias. Because the subagent is freshly spawned (clean independence) with a single loss function — challenge correctly — it carries the highest `W` in the system: `W_subagent > W_LLM`. `S_LLM` is applied at full strength; the LLM's low `W` as target means no dampening softens it, at either the object or meta level — the two coincide here.

## A. Main debate flow

```
USER PROMPT
    |
    v
LLM GENERATES INITIAL REASONING
    |
    v
LLM IDENTIFIES WEAKEST PREMISES
    |
    v
SUBAGENT SPAWNED FRESH
(W_subagent: high - clean independence,
single loss function)
    |
    v
SUBAGENT CHALLENGES WEAKEST PREMISES
    |
    +--> Evidence
    |
    +--> Solvers / Reasoning
    |
    +--> Alternative interpretations
    |
    v
SUBAGENT GENERATES S_LLM
    |
    +--> Risk level
    |
    +--> Suggested level of skepticism
    |
    +--> Sycophancy / self-confirmation
    |    bias assessment
    |
    v
S_LLM APPLIED AT FULL STRENGTH
(W_LLM low as target - no dampening)
    |
    v
LLM EVALUATES SUBAGENT CHALLENGE
    |
    +-------------------------------+
    |                               |
    v                               v
LLM ACCEPTS CHALLENGE           LLM COUNTERS
    |                               |
    v                               v
LLM UPDATES REASONING            SUBAGENT EVALUATES
    |                             LLM'S COUNTER
    |                               |
    |                               v
    |                          SUBAGENT COUNTERS
    |                          WITH MORE EVIDENCE
    |                               |
    |                               +--> Helpful guidance
    |                               |
    |                               +--> Alternative reasoning
    |                               |
    |                               +--> Middle ground
    |                               |    (earned, not automatic)
    |                               |
    +---------------<---------------+
                    |
                    v
          LLM EVALUATES AGAIN
                    |
                    v
          PREMISES FAIRLY CHALLENGED
                    |
                    v
          SYNTHESIZED CONCLUSION C
                    |
                    v
          LLM EVENTUALLY AGREES
```

## B. Skepticism variable `S_LLM`

The subagent generates `S_LLM` and hands it to the LLM as a risk signal and suggested level of skepticism, formed by direct inspection of the LLM's chain of reasoning (final spec §4.3) — not a behavioral proxy, since the subagent has direct access to the LLM's reasoning trace (unlike `S_human`, which cannot see the human's reasoning and must infer from behavior alone).

```
SUBAGENT EVALUATES LLM
    |
    v
IDENTIFY POSSIBLE BIASES
    |
    +--> Sycophancy
    |
    +--> Self-confirmation bias
    |
    +--> Insufficiently objective reasoning
    |
    v
GENERATE S_LLM
    |
    +--> Risk level
    |
    +--> Suggested skepticism
    |
    v
HAND OFF S_LLM TO LLM
(applied full strength - W_LLM low as target)
    |
    v
LLM USES S_LLM TO DECIDE
HOW OBJECTIVELY TO EVALUATE
THE SUBAGENT'S CHALLENGE
```

### Proposed skepticism behavior

```
S_LLM = LOW RISK
    |
    v
LLM MAY ACCEPT CHALLENGE
IF REASONING SUPPORTS IT

S_LLM = HIGH RISK
    |
    v
LLM SHOULD EVALUATE
MORE OBJECTIVELY
    |
    v
RE-EXAMINE PREMISES
    |
    v
RE-EVALUATE CONCLUSION C
```

Risk level modulates *how* the LLM evaluates a given challenge. It does not modulate *whether* the challenge lands at full object-level strength — that's already guaranteed by `W_LLM` being low as target, which is constant within Self-Grill.

# 3. Self-Grill: Counterargument protocol

This is the more detailed loop between the LLM and subagent.

```
SUBAGENT CHALLENGES LLM
    |
    v
LLM EVALUATES CHALLENGE
    |
    +--------------------------------------+
    |                                      |
    v                                      v
LLM ACCEPTS                           LLM COUNTERS
    |                                      |
    v                                      v
LLM UPDATES REASONING                 SUBAGENT EVALUATES
    |                                 LLM'S COUNTER
    |                                      |
    |                                      v
    |                                 SUBAGENT COUNTERS
    |                                      |
    |                                      +--> Evidence
    |                                      |
    |                                      +--> Solvers
    |                                      |
    |                                      +--> Guidance
    |                                      |
    |                                      +--> Alternative reasoning
    |                                      |
    |                                      v
    |                                 LLM EVALUATES AGAIN
    |                                      |
    +------------------<-------------------+
                       |
                       v
              CONCLUSION C REFINED
                       |
                       v
              PREMISES FAIRLY CHALLENGED
                       |
                       v
              LOGICAL PURITY OF C
```

### Rules

```
1. Subagent challenges weakest premises.
2. LLM evaluates the challenge.
3. LLM counters when its confidence in the
   counterargument meets the defined threshold.
4. Subagent responds with evidence and reasoning.
5. Middle ground is earned through argument.
6. Both sides continue until the premises
   have been fairly challenged.
7. The objective is certainty in conclusion C,
   not skepticism for its own sake.
8. Subagent's challenges carry full weight
   (W_subagent > W_LLM). The LLM owes the
   subagent no reciprocal target-side deference:
   challenger-credibility and target-deference
   are decoupled (final spec S3.3). The LLM does
   not weaken its argument merely because the
   subagent carries delegated authority.
```

# 4. Solution selection flow

After the debate reaches a conclusion, the subagent provides three possible solutions plus a free-response option. Free-response validation reapplies `S_LLM` under the same high-`W_subagent` / low-`W_LLM` relationship that governed the debate itself — the subagent's sign-off is not a formality.

```
SYNTHESIZED CONCLUSION C
    |
    v
SUBAGENT GENERATES SOLUTIONS
    |
    +--> Solution 1
    |
    +--> Solution 2
    |
    +--> Solution 3
    |
    +--> Free response
    |
    v
LLM SELECTS OR PROVIDES RESPONSE
    |
    +-----------------------------+
    |                             |
    v                             v
CHOOSE SOLUTION 1-3          FREE RESPONSE
    |                             |
    v                             v
SELECTED SOLUTION             SUBAGENT EVALUATES
    |                         FREE RESPONSE
    |                             |
    |                             v
    |                         GENERATE S_LLM
    |                             |
    |                             v
    |                         SUBAGENT SIGN-OFF
    |                         (full strength - W_LLM
    |                         low as target)
    |                             |
    |                             v
    |                         DECISION VALIDATED
    |                             |
    +--------------<--------------+
                   |
                   v
            FINAL SOLUTION
                   |
                   v
     DELIVERED TO HUMAN (W_human high -
     final say retained regardless of how
     the solution was validated upstream)
```

# 5. Side-by-side comparison (corrected)

The original table had Challenger/Target reversed for User Grill-Logic — it listed "User" as challenger and "LLM's weakest premises" as target in both columns, which contradicts §1's own flow ("the LLM challenges the weakest premises of the user's argument"). Corrected below.

| Aspect | User Grill-Logic | LLM Self-Grill |
| --- | --- | --- |
| Challenger | LLM | Subagent |
| Target | User's weakest premises | LLM's weakest premises |
| Challenger's `W` | Moderate — diffuse, entangled signals (same continuous LLM) | High — fresh context, single clean loss function |
| Target's `W` | High — stakes + final say | Low — same LLM, same reason |
| Object-level challenge strength | Full strength, always ("LLM does not weaken its argument") | Full strength, always (subagent does not weaken its argument) |
| Meta-signal | `S_human` — assesses the human's own reasoning rigor | `S_LLM` — assesses the LLM's own reasoning rigor |
| Meta-signal source | Behavioral log (new content vs. reassertion) | Direct inspection of LLM's CoT |
| Meta-signal application | Dampened — diagnostic, surfaced not enforced (target's `W` high) | Full strength — no dampening (target's `W` low) |
| Debate goal | Concordance | Logical certainty of conclusion C |
| Middle ground | May be offered by LLM | Earned through reasoning |
| Solution generation | LLM | Subagent |
| Solution selection | Questions tool | LLM selects or free-responds |
| Free-response validation | Not specified | Subagent evaluates and signs off, via `S_LLM` |

# 6. Condensed conceptual architecture

```
                         USER
                          |
                          v
                    INITIAL PROMPT
                          |
                          v
                   MAIN LLM REASONING
                          |
                          v
                    WEAK PREMISES
                          |
             +------------+------------+
             |                         |
             v                         v
       USER GRILL-LOGIC          SUBAGENT SELF-GRILL
       (target = human;          (target = LLM;
       W_human high)             W_subagent > W_LLM)
             |                         |
             v                         v
       LLM CHALLENGES USER          SUBAGENT CHALLENGES LLM
             |                         |
             v                         v
       EVIDENCE + SOLVERS        EVIDENCE + SOLVERS
             |                         |
             v                         v
       USER / LLM DEBATE          LLM / SUBAGENT DEBATE
       (object-level: full        (object-level: full
       strength always;           strength always;
       S_human: dampened,         S_LLM: full strength,
       diagnostic only)           no dampening)
             |                         |
             v                         v
       CONCORDANCE              SKEPTICISM SIGNAL S_LLM
             |                         |
             |                         v
             |                   OBJECTIVE EVALUATION
             |                         |
             +------------+------------+
                          |
                          v
                  SYNTHESIZED CONCLUSION C
                          |
                          v
                  3 SOLUTIONS + FREE RESPONSE
                          |
                          v
                   FINAL DECISION
                          |
                          v
              HUMAN RETAINS FINAL SAY
              (W_human high in both paths)
```

**Key distinction:** User Grill-Logic is a collaborative debate aimed at concordance, where the challenge itself stays at full strength but the LLM's *meta-signal* about the human's reasoning is dampened by the human's high `W`. Self-Grill introduces an adversarial subagent whose `W` exceeds the LLM's own, so its meta-signal `S_LLM` is never dampened — it exists specifically to keep the LLM from blindly confirming its own reasoning, with the intended endpoint being a well-defended conclusion `C`. In Self-Grill, the human's `W` is not independently recomputed; it is inherited by the subagent through delegation (final spec §3.2), which is why the subagent is licensed to challenge as hard as it does without needing separate justification.

---

That is why solutions have to be earned — they require skepticism (`S_LLM` on the LLM's side, `S_human` — dampened — on the human's side) for the ability to improve the logical purity of the conclusion against any actor. That is where the lineage of DMAD is highly relevant, not just an afterthought. Internal CoT is part of the formation of `S_LLM` specifically — not just a small detail; `S_human` is deliberately *not* CoT-derived, since the LLM has no reliable access to the human's reasoning process, only to what they've said.

It also prevents gaming by any actor — including the human — while keeping the object-level debate itself, on both sides, immune to being softened by either actor's `W`.
