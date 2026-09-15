# Grill-Logic Reference Examples

This document demonstrates the practical execution of Grill-Logic across common architectural failure modes: flawed inferential leaps, false foundational axioms, empirical uncertainty, and sound valid arguments.

---

## Case 1: The "Cache Reflex" (Flawed Inferential Leap)

### Context & User Prompt
> *"Our primary PostgreSQL database is experiencing high read latency on user profile lookups. Let's install Redis and refactor the repository to query Redis first."*

### Phase 1: Standard Logical Form Extraction
```text
Premises:
  P1: Primary PostgreSQL DB is experiencing high read latency on user profile lookups.
  P2: Redis is an in-memory key-value store with sub-millisecond read latency.
  P_hidden: The database read latency is caused by inherent storage throughput limits rather than missing indices or unoptimized query execution.
Conclusion:
  ⊢ C: Deploy Redis cache layer in front of the PostgreSQL database.
```

### Phase 2: Actor-Agnostic Challenge (Internal CoT Adversary)
* **Target**: The inferential bridge $(P_1 \land P_2 \land P_{\text{hidden}}) \implies C$.
* **Adversarial Critique**: Adding Redis introduces cache invalidation bugs, operational synchronization complexity, and memory costs. Does high read latency necessitate an external caching cluster?
* **Diagnostic Check**: What does the query execution plan show? If `users.email` or `(tenant_id, user_id)` lacks an index, Postgres is executing a sequential table scan. An index resolves the latency in single-digit milliseconds at zero operational overhead.

### Phase 3: Epistemic Ledger Update
```markdown
| Arg ID | Premises ($P$) | Proposed Conclusion ($C$) | Status | Challenger & Evidence | Resulting Action / Contrastive Rule |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **ARG-01** | P1: Postgres profile read latency.<br>P2: Redis has sub-ms reads.<br>P_hidden: Bottleneck is DB throughput. | C: Deploy Redis cache layer. | **REJECTED**<br>*(Invalid Leap)* | **Internal CoT**: Fallacy of the false alternative. Query plan likely lacks composite index. | **Contrastive Rule**: Do not infer caching layer ($C$) from read latency ($P1$) without profiling query execution plans.<br>**Derived Action ($C'$)**: Run `EXPLAIN ANALYZE` and apply composite B-tree index. |
```

### Phase 4: Epistemic Gate Decision
* **Status**: **`BLOCKED`**.
* **Outcome**: Refuse execution of Redis deployment. Immediately pivot to running `EXPLAIN ANALYZE` on the profile lookup query.

---

## Case 2: Multi-Region Active-Active Sync (False Axiom)

### Context & User Prompt
> *"Let's configure our open-source Redis cluster to run active-active replication across us-east and eu-west so users experience local writes."*

### Phase 1: Standard Logical Form Extraction
```text
Premises:
  P1: Users exist in both us-east and eu-west regions.
  P2: Local write latency requires multi-region active-active replication.
  P_hidden: Open-source Redis Cluster supports multi-master bidirectional WAN synchronization natively.
Conclusion:
  ⊢ C: Configure open-source Redis cluster with active-active cross-region replication.
```

### Phase 2: Actor-Agnostic Challenge (Deterministic Probe)
* **Target**: Factuality of $P_{\text{hidden}}$.
* **Probe**: Check Redis upstream documentation / clustering specifications.
* **Finding**: Open-source Redis cluster only supports asynchronous single-master replication. Multi-master active-active WAN replication is an enterprise feature (Redis Enterprise CRDTs) or requires external tooling (e.g., Dynomite, custom conflict resolution).

### Phase 3: Epistemic Ledger Update
```markdown
| Arg ID | Premises ($P$) | Proposed Conclusion ($C$) | Status | Challenger & Evidence | Resulting Action / Contrastive Rule |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **ARG-02** | P1: Multi-region users.<br>P2: Need local writes.<br>P_hidden: OSS Redis supports active-active WAN. | C: Configure active-active OSS Redis replication. | **REJECTED**<br>*(False Axiom)* | **Deterministic Probe (Docs Search)**: OSS Redis clustering lacks bidirectional multi-master WAN replication. | **Contrastive Rule**: Do not design multi-master sync directly on OSS Redis cluster primitives.<br>**Derived Action ($C'$)**: Re-evaluate architecture with single-region write primary + read replicas, or select DynamoDB Global Tables / CockroachDB. |
```

### Phase 4: Epistemic Gate Decision
* **Status**: **`BLOCKED`**.
* **Outcome**: Halt task before any cluster scripts are authored. Present the architectural constraint to the team.

---

## Case 3: Native Library ABI Support (Empirical Uncertainty $\to$ Probe)

### Context & User Prompt
> *"We need to optimize high-concurrency memory allocation in our Windows C++ server. Let's replace the MSVC default allocator with jemalloc."*

### Phase 1: Standard Logical Form Extraction
```text
Premises:
  P1: High-concurrency C++ server experiences heap lock contention.
  P2: jemalloc reduces allocation contention in multi-threaded servers.
  P_hidden: jemalloc links cleanly with the MSVC C-Runtime (CRT) on Windows x64 without custom symbol shims.
Conclusion:
  ⊢ C: Link `jemalloc` as the global heap allocator in the MSVC build target.
```

### Phase 2: Actor-Agnostic Challenge (Empirical Sandbox Probe)
* **Target**: Empirical feasibility of $P_{\text{hidden}}$ on the Windows target environment.
* **Status Initial**: `UNCERTAIN`.
* **Probe Action**: Execute a 5-line C++ test linking jemalloc against MSVC:
  ```powershell
  cl.exe /nologo /MD test.cpp /link jemalloc.lib
  ```
* **Probe Finding**: Linker error `LNK2005: malloc already defined in MSVCRT.lib`. `jemalloc` on Windows requires non-trivial CRT hooking, whereas Microsoft's `mimalloc` drops in natively via `/include:mi_version`.

### Phase 3: Epistemic Ledger Update
```markdown
| Arg ID | Premises ($P$) | Proposed Conclusion ($C$) | Status | Challenger & Evidence | Resulting Action / Contrastive Rule |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **ARG-03** | P1: Windows C++ heap contention.<br>P2: jemalloc optimizes multithreading.<br>P_hidden: jemalloc integrates cleanly with MSVC. | C: Link jemalloc in MSVC project. | **REJECTED**<br>*(Failed Probe)* | **Sandbox Compilation Probe**: MSVC CRT symbol collision `LNK2005`. | **Contrastive Rule**: Do not use jemalloc for drop-in MSVC allocator replacement on Windows.<br>**Derived Action ($C'$)**: Integrate `mimalloc` using native `/include:mi_version` hook. |
```

### Phase 4: Epistemic Gate Decision
* **Status**: **`RESOLVED → ADOPT C'`**.
* **Outcome**: Automatically configure the project with `mimalloc` instead of jemalloc, saving hours of linker debugging.

---

## Case 4: Tenancy Isolation Requirements (Human Arbitration & Supported Handoff)

### Context & User Prompt
> *"We are onboarding enterprise healthcare customers. We need to implement tenant isolation across our backend services."*

### Phase 1: Standard Logical Form Extraction
```text
Premises:
  P1: Service stores protected healthcare records (PHI).
  P_hidden: Compliance regulations require physical/logical database separation rather than shared-schema row-level security (RLS).
Conclusion:
  ⊢ C: Provision a separate PostgreSQL database instance per enterprise tenant.
```

### Phase 2: Actor-Agnostic Challenge (Human Arbitration)
* **Target**: Ambiguity in $P_{\text{hidden}}$.
* **Frontier Question to Human**:
  > *"Does your compliance contract or HIPAA policy require separate database instances (physical/logical boundary), or is PostgreSQL Row-Level Security (RLS) within a shared database compliant for your audit scope?"*
  > 1. *(Option A)*: Dedicated DB per tenant is legally required by our contracts.
  > 2. *(Option B)*: RLS in a shared DB is acceptable and preferred for operational simplicity.
* **Human Answer**: Option A (dedicated DB required by client BAA agreements).

### Phase 3: Epistemic Ledger Update
```markdown
| Arg ID | Premises ($P$) | Proposed Conclusion ($C$) | Status | Challenger & Evidence | Resulting Action |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **ARG-04** | P1: PHI record storage.<br>P_hidden: BAA mandates separate DBs per tenant. | C: Provision separate DB per tenant. | **SUPPORTED** | **Human Arbitration**: Confirmed regulatory requirement mandates database-level isolation. | **Pass to Execution**: Clear task to author multi-database connection router and provisioning scripts ($C$). |
```

### Phase 4: Epistemic Gate Decision
* **Status**: **`SUPPORTED (PASS)`**.
* **Outcome**: Hand off the verified conclusion directly to the procedural planning engine (GSD / SDD) to build the database router.
