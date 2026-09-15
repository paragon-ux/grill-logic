# Project Epistemic Registry: Logical Ledger

This ledger acts as a persistent truth-maintenance registry and runtime **negative constraint firewall**. Any proposal relying on an entry marked `REJECTED` is automatically gated from execution.

---

## Active Decision Registry

| Arg ID | Premises ($P$) | Proposed Conclusion ($C$) | Status | Challenger & Evidence | Resulting Action / Contrastive Refutation Rule |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **ARG-01** | **P1**: [Stated observation 1]<br>**P2**: [Stated observation 2]<br>**P_hidden**: [Hidden assumption] | **C**: [Proposed architectural action] | **SUPPORTED**, **REJECTED**, or **SUPERSEDED** | **[Auditor / Method]**: [Verification findings and evidence] | **Contrastive Rule**: Do not infer [C] from [P] because [Evidence].<br>**Derived Action ($C'$)**: [Supported alternative] |
