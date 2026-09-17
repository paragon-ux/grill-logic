# Grill-Logic Reference Examples

This document demonstrates the practical execution of Grill-Logic across common architectural failure modes: flawed inferential leaps, false foundational axioms, empirical uncertainty, and sound valid arguments.

---

## Case 1: The "Cache Reflex" (Flawed Inferential Leap)

### Context & User Prompt
> *"Our primary PostgreSQL database is experiencing high read latency on user profile lookups. Let's install Redis and refactor the repository to query Redis first."*

### Step 0: Pre-Flight Epistemic Gate Check
Before planning or code generation begins, the continuous gate runs:
```bash
node scripts/grill-state.mjs check-gate --proposal "Install Redis caching layer in front of PostgreSQL for user profile lookups"
```
* **Status**: Exit Code 0 (No prior collision in genesis state). Passes to Step 1.

### Step 1: Mandatory Interpretation Gate (`/add-logic`)
Decomposes explicit premises, hidden assumptions, and proposed conclusion:
```text
Premises:
  P1: Primary PostgreSQL DB is experiencing high read latency on user profile lookups.
  P2: Redis is an in-memory key-value store with sub-millisecond read latency.
  P_hidden: The database read latency is caused by storage throughput limits rather than missing indices or unoptimized execution plans.
Conclusion:
  C: Deploy Redis cache layer in front of PostgreSQL database.
```
* **NeSy Solver Validation**: Deductive form is evaluated. The leap $(P_1 \land P_2 \land P_{\text{hidden}}) \implies C$ is formally non-contradictory but structurally uncertain, clearing the gate for empirical probing.
* **Ledger Baseline**: Added to `LOGICAL_LEDGER.md` as `FORMULATED`.

### Step 2: Mode B Challenge Exchange (`/self-grill`)
* **Challenger Subagent ($W_{\text{subagent}} = 0.8$)**: Dispatched with session `dispatch_token` and single loss function.
* **Empirical Tool Probe (`run_command`)**: Runs query execution profiling:
  ```sql
  EXPLAIN ANALYZE SELECT * FROM users WHERE tenant_id = 't_123' AND email = 'user@example.com';
  ```
* **Probe Finding**: Sequential table scan (`Seq Scan on users`) taking 540ms because composite index `(tenant_id, email)` is missing. Adding a B-Tree index resolves query in 1.8ms at zero operational overhead.
* **Asymmetric CoT (ADR-0002)**: Challenger inverts the conclusion ($C \implies \neg P_1$). Round 1 adheres strictly to the 90/10 invariant (zero premature solutions offered).

### Step 3: Epistemic Ledger Update
```markdown
| Arg ID | Premises ($P$) | Proposed Conclusion ($C$) | Status | Challenger & Evidence | Resulting Action / Contrastive Refutation Rule |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **ARG-01** | P1: PostgreSQL read latency.<br>P2: Redis has sub-ms reads.<br>P_hidden: Bottleneck is DB throughput. | C: Deploy Redis cache layer. | **REJECTED** | **Challenger Probe** (`EXPLAIN ANALYZE`): Latency caused by sequential scan on unindexed `users(tenant_id, email)`. Index resolves in 1.8ms. | **Contrastive Refutation Rule**: Do not infer external caching layers ($C$) from read latency ($P1$) without profiling query plans.<br>**Advisory Action ($C'$)**: Add composite B-tree index on `(tenant_id, email)`. |
```

### Step 4: Epistemic Gate Decision & Firewall Protection
* **Status**: **`REJECTED (BLOCKED)`**. Code generation for Redis is prohibited.
* **Firewall Normalization (ADR-0003)**: Future proposals matching $\text{Target Space} = \text{Clean}(C) \cup \text{Clean}(R_{\text{refute}})$ are blocked at Step 0 ($\tau = 0.30$), while proposals implementing the advisory index ($C'$) pass cleanly.

---

## Case 2: Multi-Region Active-Active Sync (False Axiom)

### Context & User Prompt
> *"Let's configure our open-source Redis cluster to run active-active replication across us-east and eu-west so users experience local writes."*

### Step 0: Pre-Flight Epistemic Gate Check
```bash
node scripts/grill-state.mjs check-gate --proposal "Configure open-source Redis cluster with active-active cross-region replication"
```
* **Status**: Exit Code 0 (No prior collision). Passes to Step 1.

### Step 1: Mandatory Interpretation Gate (`/add-logic`)
```text
Premises:
  P1: Users exist in both us-east and eu-west regions.
  P2: Local write latency requires multi-region active-active replication.
  P_hidden: Open-source Redis Cluster supports multi-master bidirectional WAN synchronization natively.
Conclusion:
  C: Configure open-source Redis cluster with active-active cross-region replication.
```
* **Ledger Baseline**: Confirmed with user and committed as `FORMULATED`.

### Step 2: Mode B Challenge Exchange (`/self-grill`)
* **Challenger Subagent**: Investigates $P_{\text{hidden}}$.
* **Empirical Tool Probe (`search_web` / doc inspection)**: Upstream Redis specifications verify that open-source Redis Cluster supports asynchronous single-master replication only; active-active multi-master WAN replication requires Redis Enterprise (CRDTs) or external multi-datacenter meshes (Dynomite).
* **Verdict**: $P_{\text{hidden}}$ is factually false.

### Step 3: Epistemic Ledger Update
```markdown
| Arg ID | Premises ($P$) | Proposed Conclusion ($C$) | Status | Challenger & Evidence | Resulting Action / Contrastive Refutation Rule |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **ARG-02** | P1: Multi-region users.<br>P2: Need local writes.<br>P_hidden: OSS Redis supports active-active WAN. | C: Configure active-active OSS Redis replication. | **REJECTED** | **Deterministic Probe (Docs Check)**: OSS Redis clustering lacks bidirectional multi-master WAN replication. | **Contrastive Refutation Rule**: Do not design multi-master sync directly on OSS Redis cluster primitives.<br>**Advisory Action ($C'$)**: Deploy single-region primary with cross-region read replicas, or evaluate DynamoDB Global Tables / CockroachDB. |
```

### Step 4: Epistemic Gate Decision
* **Status**: **`BLOCKED`**. Halts deployment scripts. Prevents authoring distributed configurations doomed to split-brain data loss.

---

## Case 3: Native Library ABI Support (Empirical Uncertainty $\to$ Probe)

### Context & User Prompt
> *"We need to optimize high-concurrency memory allocation in our Windows C++ server. Let's replace the MSVC default allocator with jemalloc."*

### Step 0: Pre-Flight Epistemic Gate Check
```bash
node scripts/grill-state.mjs check-gate --proposal "Link jemalloc as the global heap allocator in the MSVC build target"
```
* **Status**: Exit Code 0 (No prior collision). Passes to Step 1.

### Step 1: Mandatory Interpretation Gate (`/add-logic`)
```text
Premises:
  P1: High-concurrency C++ server experiences heap lock contention.
  P2: jemalloc reduces allocation contention in multi-threaded servers.
  P_hidden: jemalloc links cleanly with the MSVC C-Runtime (CRT) on Windows x64 without custom symbol shims.
Conclusion:
  C: Link jemalloc as the global heap allocator in the MSVC build target.
```
* **NeSy Solver**: Status `UNCERTAIN` (structural validity holds, but runtime compatibility requires empirical verification). Baseline registered as `FORMULATED`.

### Step 2: Mode B Challenge Exchange (`/self-grill`)
* **Challenger Subagent ($W_{\text{subagent}} = 0.8$)**: Identifies ABI compatibility risk.
* **Empirical Sandbox Probe (`run_command`)**: Compiles minimal test harness:
  ```powershell
  cl.exe /nologo /MD test.cpp /link jemalloc.lib
  ```
* **Probe Finding**: Linker error `LNK2005: malloc already defined in MSVCRT.lib`. `jemalloc` on Windows requires non-trivial CRT hooking, whereas Microsoft's `mimalloc` drops in natively via `/include:mi_version`.

### Step 3: Epistemic Ledger Update
```markdown
| Arg ID | Premises ($P$) | Proposed Conclusion ($C$) | Status | Challenger & Evidence | Resulting Action / Contrastive Refutation Rule |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **ARG-03** | P1: Windows C++ heap contention.<br>P2: jemalloc optimizes multithreading.<br>P_hidden: jemalloc integrates cleanly with MSVC. | C: Link jemalloc in MSVC project. | **REJECTED** | **Sandbox Compilation Probe**: MSVC CRT symbol collision `LNK2005`. | **Contrastive Refutation Rule**: Do not use jemalloc for drop-in MSVC allocator replacement on Windows.<br>**Advisory Action ($C'$)**: Integrate `mimalloc` using native `/include:mi_version` hook. |
```

### Step 4: Epistemic Gate Decision
* **Status**: **`RESOLVED → ADOPT C'`**.
* **Outcome**: Automatically configure the project with `mimalloc` instead of jemalloc, preventing broken build scripts.

---

## Case 4: Tenancy Isolation Requirements (Human Sequential Interview & Supported Handoff)

### Context & User Prompt
> *"We are onboarding enterprise healthcare customers. We need to implement tenant isolation across our backend services."*

### Step 0: Pre-Flight Epistemic Gate Check
```bash
node scripts/grill-state.mjs check-gate --proposal "Provision a separate PostgreSQL database instance per enterprise tenant"
```
* **Status**: Exit Code 0. Passes to Step 1.

### Step 1: Mandatory Interpretation Gate (`/add-logic`)
```text
Premises:
  P1: Service stores protected healthcare records (PHI).
  P_hidden: Compliance regulations require physical/logical database separation rather than shared-schema row-level security (RLS).
Conclusion:
  C: Provision a separate PostgreSQL database instance per enterprise tenant.
```
* **Ledger Baseline**: Confirmed with user and registered as `FORMULATED`.

### Step 2: Mode A Human Sequential Interview (`/grill-logic`)
* **Interactive Tree Traversal**: The agent frames the core trade-off and calls `ask_question`:
  - *Question*: *"Does your compliance contract or HIPAA policy require separate database instances (physical/logical boundary), or is PostgreSQL Row-Level Security (RLS) within a shared database compliant for your audit scope?"*
  - *Option 1*: Dedicated DB per tenant is legally required by our client BAA agreements.
  - *Option 2*: RLS in a shared DB is acceptable and preferred for operational simplicity.
* **Strict Turn Yield**: Model stops generation immediately.
* **Human Answer ($W_{\text{human}} = 1.0$)**: Option 1 (dedicated DB legally mandated).
* **Behavioral $S_{\text{human}}$**: New constraint introduced; stagnation count remains 0.

### Step 3: Epistemic Ledger Update
```markdown
| Arg ID | Premises ($P$) | Proposed Conclusion ($C$) | Status | Challenger & Evidence | Resulting Action / Contrastive Refutation Rule |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **ARG-04** | P1: PHI record storage.<br>P_hidden: BAA mandates separate DBs per tenant. | C: Provision separate DB per tenant. | **SUPPORTED** | **Human Concordance** ($W_{\text{human}} = 1.0$): Developer confirmed legal contract mandates dedicated DB per tenant. | **Pass to Execution**: Clear task to author multi-database connection router and provisioning scripts ($C$). |
```

### Step 4: Epistemic Gate Decision
* **Status**: **`SUPPORTED (PASS)`**.
* **Outcome**: Hand off the verified conclusion directly to procedural planning (GSD / SDD) to build the database router.
