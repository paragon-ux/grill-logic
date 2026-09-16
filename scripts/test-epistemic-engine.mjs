#!/usr/bin/env node

/**
 * test-epistemic-engine.mjs: Rigorous Automated Verification of
 * Epistemic State Engine, Deterministic Invariant Solver & Fail-Closed Invariants.
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✓ ${message}`);
    passed++;
  } else {
    console.error(`  ✗ FAIL: ${message}`);
    failed++;
  }
}

function runCmd(cmd) {
  try {
    const stdout = execSync(cmd, { encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] });
    return { code: 0, stdout, stderr: '' };
  } catch (err) {
    return {
      code: err.status || 1,
      stdout: err.stdout ? err.stdout.toString() : '',
      stderr: err.stderr ? err.stderr.toString() : ''
    };
  }
}

console.log('\n============================================================');
console.log('🧪 GRILL-LOGIC TEST SUITE: Epistemic Engine & Invariant Solver');
console.log('============================================================\n');

// Teardown before starting
runCmd('node scripts/clear-ledger.mjs --no-archive');
if (fs.existsSync('.grill-logic/state.json')) {
  fs.unlinkSync('.grill-logic/state.json');
}

// 1. Input Gate Invariant Tests
console.log('1. Testing Fail-Closed Input Gate Invariants...');

const emptyAuto = runCmd('node scripts/grill-state.mjs init --machine autonomous --input ""');
assert(emptyAuto.code !== 0, 'Empty autonomous input fails closed with non-zero code');
assert(emptyAuto.stderr.includes('INPUT_GATE_HALT'), 'Empty input emits INPUT_GATE_HALT diagnostic');

const vagueHuman = runCmd('node scripts/grill-state.mjs init --machine human --input "abc"');
assert(vagueHuman.code !== 0, 'Vague input (<5 chars) fails closed with non-zero code');
assert(vagueHuman.stderr.includes('INPUT_GATE_HALT'), 'Vague input emits INPUT_GATE_HALT diagnostic');

const invalidMachine = runCmd('node scripts/grill-state.mjs init --machine invalid --input "Valid proposal"');
assert(invalidMachine.code !== 0, 'Invalid machine type fails closed');
assert(invalidMachine.stderr.includes('INVALID_MACHINE_TYPE'), 'Invalid machine emits INVALID_MACHINE_TYPE diagnostic');

// 2. Deterministic Invariant Solver Tests (DMAD Methodological Diversity)
console.log('\n2. Testing Deterministic Invariant Solver...');

// Invariant 1: SQLite WAL over NFS with concurrent writers
const sqliteNfsSolve = runCmd('node scripts/grill-state.mjs check-gate --proposal "sqlite over nfs cluster with multi-writer containers"');
assert(sqliteNfsSolve.code !== 0, 'SQLite over NFS multi-writer fails closed in solver');
assert(sqliteNfsSolve.stderr.includes('INVARIANT_SOLVER_VIOLATION'), 'Emits INVARIANT_SOLVER_VIOLATION diagnostic');
assert(sqliteNfsSolve.stderr.includes('SYS-INV-01'), 'Identifies physical system invariant SYS-INV-01');

// Invariant 2: Linux io_uring on Windows NT
const iouringWinSolve = runCmd('node scripts/grill-state.mjs check-gate --proposal "Use io_uring for async networking on windows servers"');
assert(iouringWinSolve.code !== 0, 'io_uring on Windows fails closed in solver');
assert(iouringWinSolve.stderr.includes('SYS-INV-02'), 'Identifies OS kernel incompatibility SYS-INV-02');

// Invariant 3: Mobile distributed two-way catalog sync
const mobileSyncSolve = runCmd('node scripts/grill-state.mjs check-gate --proposal "React Native offline-first mirror 120,000 catalog items with two-way reconciliation"');
assert(mobileSyncSolve.code !== 0, 'Mobile 120k item two-way sync fails closed in solver');
assert(mobileSyncSolve.stderr.includes('SYS-INV-03'), 'Identifies mobile consistency invariant SYS-INV-03');

// Clean proposal passes solver
const cleanSolve = runCmd('node scripts/grill-state.mjs check-gate --proposal "Deploy PostgreSQL 16 on AWS RDS with pgbouncer connection pooling"');
assert(cleanSolve.code === 0, 'Clean proposal passes invariant solver');

// 3. Token-Locked Subagent Handshake & Round 1 Structural Protocol
console.log('\n3. Testing Token-Locked Subagent Handshake & Round Protocol...');

const initSuccess = runCmd('node scripts/grill-state.mjs init --machine autonomous --input "Mount SQLite over NFS for distributed workers"');
assert(initSuccess.code === 0, 'Valid autonomous proposal initializes session');
assert(fs.existsSync('.grill-logic/state.json'), '.grill-logic/state.json was created');

const stateData = JSON.parse(fs.readFileSync('.grill-logic/state.json', 'utf8'));
const validToken = stateData.dispatch_token;
assert(Boolean(validToken && validToken.startsWith('dmad_tok_')), `Session generated valid dispatch token: ${validToken}`);
assert(stateData.current_state === 'AWAITING_SUBAGENT_DISPATCH', 'State is locked in AWAITING_SUBAGENT_DISPATCH');

// Subagent token mismatch
const tokenMismatch = runCmd(`node scripts/grill-state.mjs record-subagent-audit --token invalid_token_123 --payload "{\\"conclusion_status\\":\\"CHALLENGED\\",\\"probe\\":{\\"tool\\":\\"grep_search\\",\\"finding\\":\\"test\\"}}"`);
assert(tokenMismatch.code !== 0, 'Subagent audit with invalid token fails closed');
assert(tokenMismatch.stderr.includes('DISPATCH_TOKEN_MISMATCH'), 'Mismatch emits DISPATCH_TOKEN_MISMATCH diagnostic');

// Subagent missing empirical probe
const missingProbe = runCmd(`node scripts/grill-state.mjs record-subagent-audit --token ${validToken} --payload "{\\"conclusion_status\\":\\"REJECTED\\"}"`);
assert(missingProbe.code !== 0, 'Subagent audit without empirical probe fails closed');
assert(missingProbe.stderr.includes('EMPIRICAL_PROBE_MISSING'), 'Missing probe emits EMPIRICAL_PROBE_MISSING diagnostic');

// Structural Round Gate: Subagent CANNOT log SUPPORTED in Round 1
const prematureSupported = runCmd(`node scripts/grill-state.mjs record-subagent-audit --token ${validToken} --payload "{\\"conclusion_status\\":\\"SUPPORTED\\",\\"probe\\":{\\"tool\\":\\"run_command\\",\\"finding\\":\\"valid\\"}}"`);
assert(prematureSupported.code !== 0, 'Subagent cannot log SUPPORTED in Round 1');
assert(prematureSupported.stderr.includes('ROUND_PROTOCOL_VIOLATION'), 'Round 1 SUPPORTED emits ROUND_PROTOCOL_VIOLATION diagnostic');

// Valid Round 1 Fatal Refutation (SQLite over NFS)
const fatalRefutation = runCmd(`node scripts/grill-state.mjs record-subagent-audit --token ${validToken} --payload "{\\"premise_status\\":\\"FALSIFIED\\",\\"inference_status\\":\\"INVALID_LEAP\\",\\"conclusion_status\\":\\"REJECTED\\",\\"probe\\":{\\"tool\\":\\"grep_search\\",\\"finding\\":\\"Official SQLite docs confirm POSIX fcntl byte-range locking fails over NFS\\"},\\"rule\\":\\"When designing concurrent microservices, DO NOT use SQLite over NFS because fcntl locking fails over network filesystems.\\"}"`);
assert(fatalRefutation.code === 0, 'Valid subagent fatal refutation recorded successfully');

const stateAfterAudit = JSON.parse(fs.readFileSync('.grill-logic/state.json', 'utf8'));
assert(stateAfterAudit.subagent_called === true, 'subagent_called flag set to true');
assert(stateAfterAudit.conclusion_status === 'REJECTED', 'Audit conclusion_status set to REJECTED');
assert(stateAfterAudit.premise_status === 'FALSIFIED', 'Audit premise_status set to FALSIFIED');
assert(stateAfterAudit.probes_executed.length === 1, 'Empirical probe logged in state');

// 4. Asymmetric Authority & Ledger Commit Format
console.log('\n4. Testing Asymmetric Override & Ledger Formatting...');

// Main LLM (W=0.2) tries to commit SUPPORTED over subagent (W=0.8) REJECTED
const illegalOverride = runCmd('node scripts/grill-state.mjs commit --status SUPPORTED');
assert(illegalOverride.code !== 0, 'LLM override of subagent rejection fails closed');
assert(illegalOverride.stderr.includes('ASYMMETRIC_OVERRIDE_FORBIDDEN'), 'Illegal override emits ASYMMETRIC_OVERRIDE_FORBIDDEN diagnostic');

// Commit REJECTED succeeds and writes Contrastive Rule to LOGICAL_LEDGER.md with precise status
const validRejectCommit = runCmd('node scripts/grill-state.mjs commit --status REJECTED');
assert(validRejectCommit.code === 0, 'Committing REJECTED audit succeeds');
assert(!fs.existsSync('.grill-logic/state.json'), 'Session state cleaned up after commit');

const ledgerContent = fs.readFileSync('LOGICAL_LEDGER.md', 'utf8');
assert(ledgerContent.includes('**ARG-01**'), 'LOGICAL_LEDGER.md contains ARG-01');
assert(ledgerContent.includes('**REJECTED**<br>*(False Axiom)*'), 'Status formatted with precise False Axiom tag');
assert(ledgerContent.includes('DO NOT use SQLite over NFS'), 'Contrastive Refutation Rule recorded in ledger');

// Pre-flight firewall detects committed active rule
const firewallHit = runCmd('node scripts/grill-state.mjs check-gate --proposal "Let us use sqlite over nfs for our microservice workers"');
assert(firewallHit.code !== 0, 'Colliding proposal fails closed against active ledger rule');
assert(firewallHit.stderr.includes('ARG-01'), 'Firewall diagnostic identifies blocking argument ID ARG-01');

// 5. Human Sequential Interview (Machine 2) Behavioral Stagnation Tests
console.log('\n5. Testing Human HITL Stagnation Alert & W_human Sovereignty...');

const initHuman = runCmd('node scripts/grill-state.mjs init --machine human --input "Microservices boundary decomposition"');
assert(initHuman.code === 0, 'Human HITL session initialized');

// Turns 1 and 2: no new propositions
runCmd('node scripts/grill-state.mjs record-user-turn --new-prop false --choice "Option A"');
runCmd('node scripts/grill-state.mjs record-user-turn --new-prop false --choice "Option A again"');

const humanState1 = JSON.parse(fs.readFileSync('.grill-logic/state.json', 'utf8'));
assert(humanState1.epistemic_context.s_human.consecutive_stagnant_turns === 2, 'Consecutive stagnant turns is 2');

// Turn 3: triggers stagnation alert
const turn3 = runCmd('node scripts/grill-state.mjs record-user-turn --new-prop false --choice "Option A third time"');
assert(turn3.code !== 0, 'Turn 3 emits HUMAN_STAGNATION_ALERT diagnostic');
assert(turn3.stderr.includes('HUMAN_STAGNATION_ALERT'), 'Diagnostic contains HUMAN_STAGNATION_ALERT code');

// Commit blocked while stagnation diagnostic is pending
const blockedCommit = runCmd('node scripts/grill-state.mjs commit --status SUPPORTED');
assert(blockedCommit.code !== 0, 'Commit blocked while human stagnation diagnostic is pending');

// Acknowledge diagnostic
const ack = runCmd('node scripts/grill-state.mjs record-diagnostic-ack');
assert(ack.code === 0, 'Diagnostic acknowledgment succeeds');

// Commit human confirmed decision
const humanCommit = runCmd('node scripts/grill-state.mjs commit --status SUPPORTED --rule "Human sovereign architecture confirmed"');
assert(humanCommit.code === 0, 'Human confirmed decision committed as SUPPORTED');

const ledgerAfterHuman = fs.readFileSync('LOGICAL_LEDGER.md', 'utf8');
assert(ledgerAfterHuman.includes('**ARG-02**'), 'ARG-02 committed to ledger');
assert(ledgerAfterHuman.includes('Human HITL (W_human=1.0)'), 'ARG-02 contains Human HITL metadata');

// 6. Multi-Round Epistemic Flow with Structured Payloads & Auto-Signoff
console.log('\n6. Testing Multi-Round Epistemic Flow with Structured Payloads & Auto-Signoff...');

const multiInit = runCmd('node scripts/grill-state.mjs init --machine autonomous --input "Offline-first React Native food delivery cart sync"');
assert(multiInit.code === 0, 'Multi-round autonomous proposal initialized');

const mState = JSON.parse(fs.readFileSync('.grill-logic/state.json', 'utf8'));
const mTok = mState.dispatch_token;

// Round 1: Subagent records challenge with structured payload
const subagentChallenge = runCmd(`node scripts/grill-state.mjs record-subagent-audit --token ${mTok} --payload "{\\"conclusion_status\\":\\"CHALLENGED\\",\\"premise_status\\":\\"CONFIRMED\\",\\"inference_status\\":\\"INVALID_LEAP\\",\\"probe\\":{\\"tool\\":\\"run_command\\",\\"finding\\":\\"120,000 items equals 118MB uncompressed JSON; mobile cold-start exceeds 15 seconds\\"},\\"rule\\":\\"DO NOT mirror entire catalogs to mobile devices; mobile inventory has high volatility.\\"}"`);
assert(subagentChallenge.code === 0, 'Subagent records CHALLENGED');

const multiState2 = JSON.parse(fs.readFileSync('.grill-logic/state.json', 'utf8'));
assert(multiState2.current_state === 'AWAITING_LLM_RESPONSE', 'State transitioned to AWAITING_LLM_RESPONSE');
assert(multiState2.conclusion_status === 'CHALLENGED', 'conclusion_status set to CHALLENGED');

// Round Protocol Guard: Subagent cannot record audit while awaiting LLM response
const subagentOutOfTurn = runCmd(`node scripts/grill-state.mjs record-subagent-audit --token ${mTok} --payload "{\\"conclusion_status\\":\\"SUPPORTED\\",\\"probe\\":{\\"tool\\":\\"run_command\\",\\"finding\\":\\"premature\\"}}"`);
assert(subagentOutOfTurn.code !== 0, 'Subagent cannot record audit during AWAITING_LLM_RESPONSE');
assert(subagentOutOfTurn.stderr.includes('ROUND_PROTOCOL_VIOLATION'), 'Emits ROUND_PROTOCOL_VIOLATION diagnostic');

// Guard: LLM cannot commit while challenge is unaddressed
const prematureCommit = runCmd('node scripts/grill-state.mjs commit --status SUPPORTED');
assert(prematureCommit.code !== 0, 'Commit fails closed when challenge is unaddressed');
assert(prematureCommit.stderr.includes('CHALLENGE_UNADDRESSED'), 'Emits CHALLENGE_UNADDRESSED diagnostic');

// Round 2: LLM records counter-hypothesis with structured payload
const llmCounter = runCmd(`node scripts/grill-state.mjs record-llm-response --token ${mTok} --payload "{\\"type\\":\\"counter\\",\\"response\\":\\"Persist draft cart locally and use idempotent HTTP retry queue with client UUID\\"}"`);
assert(llmCounter.code === 0, 'Target LLM records counter-hypothesis');

const multiState3 = JSON.parse(fs.readFileSync('.grill-logic/state.json', 'utf8'));
assert(multiState3.current_state === 'AWAITING_SUBAGENT_EVAL', 'State transitioned to AWAITING_SUBAGENT_EVAL');
assert(multiState3.llm_response.type === 'counter', 'LLM response type recorded as counter');

// Guard: LLM cannot commit while evaluation is pending
const pendingCommit = runCmd('node scripts/grill-state.mjs commit --status SUPPORTED');
assert(pendingCommit.code !== 0, 'Commit fails closed when evaluation is pending');
assert(pendingCommit.stderr.includes('EVALUATION_PENDING'), 'Emits EVALUATION_PENDING diagnostic');

// Round 2 Evaluation: Subagent records SUPPORTED on verified C' with AUTO-SIGNOFF
const subagentEval = runCmd(`node scripts/grill-state.mjs record-subagent-audit --token ${mTok} --payload "{\\"premise_status\\":\\"CONFIRMED\\",\\"inference_status\\":\\"VALID\\",\\"conclusion_status\\":\\"SUPPORTED\\",\\"probe\\":{\\"tool\\":\\"view_file\\",\\"finding\\":\\"AsyncStorage + Idempotency-Key header is sound and eliminates distributed database complexity\\"},\\"rule\\":\\"Verified via empirical probe view_file\\"}"`);
assert(subagentEval.code === 0, 'Subagent logs evaluated audit with SUPPORTED');

const multiState4 = JSON.parse(fs.readFileSync('.grill-logic/state.json', 'utf8'));
assert(multiState4.current_state === 'SUBAGENT_SIGNED_OFF', 'State transitioned to SUBAGENT_SIGNED_OFF');
assert(multiState4.conclusion_status === 'SUPPORTED', 'Conclusion status set to SUPPORTED');
assert(multiState4.subagent_signoff === true, 'subagent_signoff automatically set to true');

// Commit succeeds directly (no redundant signoff-subagent command required!)
const multiCommit = runCmd('node scripts/grill-state.mjs commit --status SUPPORTED --rule "Client draft cart persistence with Idempotency-Key retry queue verified"');
assert(multiCommit.code === 0, 'Commit succeeds as SUPPORTED with auto-signoff');

const multiLedger = fs.readFileSync('LOGICAL_LEDGER.md', 'utf8');
assert(multiLedger.includes('Client draft cart persistence'), 'Multi-round counter-hypothesis committed to ledger');

// 7. Testing Interpretation Gate (/add-logic), NeSy Solver Taxonomy & Procedural Advance
console.log('\n7. Testing Interpretation Gate, NeSy Solver Taxonomy & Procedural Advance...');

// 7.1 add-logic commits baseline as FORMULATED with tallies
const addLogicResult = runCmd('node scripts/grill-state.mjs add-logic --prompt "Deploy Redis cache for Postgres queries" --premises \'["High database read latency", "Redis offers sub-millisecond lookups"]\' --conclusion "Deploy Redis cache"');
assert(addLogicResult.code === 0, 'add-logic command succeeds');

const formulatedLedger = fs.readFileSync('LOGICAL_LEDGER.md', 'utf8');
assert(formulatedLedger.includes('**FORMULATED**'), 'LOGICAL_LEDGER.md records baseline as FORMULATED');
assert(formulatedLedger.includes('Interpretation Gate'), 'Records Interpretation Gate metadata');

const formulatedState = JSON.parse(fs.readFileSync('.grill-logic/state.json', 'utf8'));
assert(formulatedState.canonical_state === 'S_U0B_ADD_LOGIC', 'State initialized to S_U0B_ADD_LOGIC');
assert(formulatedState.tally.premises.agree === 0, 'Premise agree tally initialized unassessed to 0');
assert(formulatedState.tally.solution.agree === 0, 'Solution agree tally initialized unassessed to 0');
assert(formulatedState.tally.proposer === null, 'Proposer stance unassessed');
assert(formulatedState.tally.challenger === null, 'Challenger stance unassessed');

// 7.2 NeSy Solver: formally_invalid triggers auto-refutation
const nesyConflict = runCmd('node scripts/grill-state.mjs validate-nesy --payload "{\\"dependencies\\":[[\\"rule2\\",\\"rule1\\"]],\\"expressions\\":[{\\"left\\":\\"database_engine\\",\\"operator\\":\\"==\\",\\"right\\":\\"sqlite\\"},{\\"left\\":\\"storage_type\\",\\"operator\\":\\"!=\\",\\"right\\":\\"nfs\\"}]}" --facts "{\\"database_engine\\":\\"sqlite\\",\\"storage_type\\":\\"nfs\\"}"');
assert(nesyConflict.code !== 0, 'NeSy formally_invalid fails closed');
assert(nesyConflict.stderr.includes('FORMALLY_INVALID'), 'Emits FORMALLY_INVALID diagnostic');

// 7.3 NeSy Solver: inconsistent_premises (circular dependency)
const nesyCircular = runCmd('node scripts/grill-state.mjs validate-nesy --payload "{\\"dependencies\\":[[\\"P1\\",\\"P2\\"],[\\"P2\\",\\"P1\\"]],\\"expressions\\":[]}"');
assert(nesyCircular.code !== 0, 'NeSy circular dependency fails closed');
assert(nesyCircular.stderr.includes('INCONSISTENT_PREMISES'), 'Emits INCONSISTENT_PREMISES diagnostic');

// 7.4 NeSy Solver: malformed representation
const nesyMalformed = runCmd('node scripts/grill-state.mjs validate-nesy --payload "not-json"');
assert(nesyMalformed.code !== 0, 'Malformed payload fails closed');
assert(nesyMalformed.stderr.includes('MALFORMED_REPRESENTATION'), 'Emits MALFORMED_REPRESENTATION diagnostic');

// 7.5 NeSy Solver: valid passes and updates state
const nesyValid = runCmd('node scripts/grill-state.mjs validate-nesy --payload "{\\"dependencies\\":[[\\"P2\\",\\"P1\\"]],\\"expressions\\":[{\\"left\\":\\"database_engine\\",\\"operator\\":\\"==\\",\\"right\\":\\"postgres\\"}]}" --facts "{\\"database_engine\\":\\"postgres\\"}"');
assert(nesyValid.code === 0, 'NeSy valid expression passes');

const stateAfterValid = JSON.parse(fs.readFileSync('.grill-logic/state.json', 'utf8'));
assert(stateAfterValid.validation.result === 'valid', 'Validation result recorded as valid in state');

// 7.6 Procedural Advance (No Counter)
const advanceResult = runCmd('node scripts/grill-state.mjs record-procedural-advance');
assert(advanceResult.code === 0, 'Procedural advance succeeds when no counter on table');

const stateAfterAdvance = JSON.parse(fs.readFileSync('.grill-logic/state.json', 'utf8'));
assert(stateAfterAdvance.canonical_state === 'S_A7_CONCORDANCE_SIGN_OFF', 'Advanced to S_A7_CONCORDANCE_SIGN_OFF');
assert(stateAfterAdvance.tally.challenger === 'UNOBJECTED', 'Challenger recorded as UNOBJECTED');
assert(stateAfterAdvance.tally.solution.agree === 1, 'Solution agree tally reflects proposer only (1)');
assert(stateAfterAdvance.procedural_clearance === true, 'procedural_clearance set to true');
assert(stateAfterAdvance.subagent_signoff === true, 'Sign-off granted on procedural advance');

// 7.7 Commit ACCEPTED_SOLUTION updates formulated row in LOGICAL_LEDGER.md
const acceptCommit = runCmd('node scripts/grill-state.mjs commit --status ACCEPTED_SOLUTION --rule "Standard postgres with pgbouncer suffices"');
assert(acceptCommit.code === 0, 'Commit succeeds for ACCEPTED_SOLUTION');

const finalLedger = fs.readFileSync('LOGICAL_LEDGER.md', 'utf8');
assert(finalLedger.includes('**ACCEPTED_SOLUTION**'), 'LOGICAL_LEDGER.md updated to ACCEPTED_SOLUTION');

// 7.8 Human HITL user turn with empirical counter and choice
runCmd('node scripts/grill-state.mjs init --machine human --input "Microservices refactoring debate"');
const userTurnResult = runCmd('node scripts/grill-state.mjs record-user-turn --new-prop true --empirical-counter true --choice "Option 1 Minimal"');
assert(userTurnResult.code === 0, 'record-user-turn succeeds with empirical counter');

const humanState = JSON.parse(fs.readFileSync('.grill-logic/state.json', 'utf8'));
assert(humanState.canonical_state === 'S_U4_EVAL_COUNTER', 'Canonical state transitioned to S_U4_EVAL_COUNTER');
assert(humanState.empirical_counter === true, 'empirical_counter recorded in state');
assert(humanState.last_choice === 'Option 1 Minimal', 'last_choice recorded in state');

// 8. Testing Prior Audit Remediations (Whitepaper v2.2.0 & Spec v1.1.0 Parity)
console.log('\n8. Testing Prior Audit Remediations & Spec Parity...');

// 8.1 Human HITL REJECTED blocked without empirical counter (Spec §4.3)
runCmd('node scripts/clear-ledger.mjs --no-archive');
runCmd('node scripts/grill-state.mjs init --machine human --input "Deploy GraphQL federation gateway"');
runCmd('node scripts/grill-state.mjs record-user-turn --new-prop false --empirical-counter false');
const unbackedReject = runCmd('node scripts/grill-state.mjs commit --status REJECTED --rule "Do not use GraphQL without empirical counter"');
assert(unbackedReject.code !== 0, 'Human mode REJECTED without empirical counter fails closed');
assert(unbackedReject.stderr.includes('EMPIRICAL_COUNTER_REQUIRED'), 'Emits EMPIRICAL_COUNTER_REQUIRED diagnostic');

// 8.2 Human HITL REJECTED succeeds with empirical counter
runCmd('node scripts/grill-state.mjs record-user-turn --new-prop true --empirical-counter true');
const backedReject = runCmd('node scripts/grill-state.mjs commit --status REJECTED --rule "Do not infer GraphQL federation from microservices because N+1 query latency explodes. MANDATED ALTERNATIVE: REST gateway."');
assert(backedReject.code === 0, 'Human mode REJECTED with empirical counter succeeds');

const ledgerAfterBacked = fs.readFileSync('LOGICAL_LEDGER.md', 'utf8');
assert(ledgerAfterBacked.includes('**ARG-01**'), 'ARG-01 committed as REJECTED in ledger');

// 8.3 In-place update handoff: add-logic -> init preserves arg_id
runCmd('node scripts/clear-ledger.mjs --no-archive');
runCmd('node scripts/grill-state.mjs add-logic --prompt "Migrate from REST to gRPC for inter-service RPC" --premises \'["Latency SLA under 5ms", "Protobuf is more compact than JSON"]\' --conclusion "Adopt gRPC for all internal RPCs"');

const ledgerAfterAddLogic = fs.readFileSync('LOGICAL_LEDGER.md', 'utf8');
assert(ledgerAfterAddLogic.includes('**FORMULATED**'), 'Baseline registered as FORMULATED');
assert(ledgerAfterAddLogic.includes('**ARG-01**'), 'Registered as ARG-01');

// Now chain into init --machine autonomous
const chainedInit = runCmd('node scripts/grill-state.mjs init --machine autonomous --input "Migrate from REST to gRPC for inter-service RPC"');
assert(chainedInit.code === 0, 'Chained init succeeds');

const chainedState = JSON.parse(fs.readFileSync('.grill-logic/state.json', 'utf8'));
assert(chainedState.arg_id === 'ARG-01', 'Chained init successfully preserved arg_id ARG-01');
assert(chainedState.premises.length === 2, 'Chained init preserved formulated premises');

// 8.4 signoff-subagent CLI command works with token handshake
const chainedTok = chainedState.dispatch_token;

// Record subagent probe in Round 1 and LLM counter in Round 2
runCmd(`node scripts/grill-state.mjs record-subagent-audit --token ${chainedTok} --payload "{\\"conclusion_status\\":\\"CHALLENGED\\",\\"probe\\":{\\"tool\\":\\"run_command\\",\\"finding\\":\\"gRPC reduces serialization latency by 64%\\"}}"`);
runCmd(`node scripts/grill-state.mjs record-llm-response --token ${chainedTok} --payload "{\\"type\\":\\"counter\\",\\"response\\":\\"Implement client connection pooling with HTTP/2 multiplexing\\"}"`);

const badSignoff = runCmd('node scripts/grill-state.mjs signoff-subagent --token wrong_token');
assert(badSignoff.code !== 0, 'signoff-subagent with wrong token fails closed');
assert(badSignoff.stderr.includes('DISPATCH_TOKEN_MISMATCH'), 'Emits DISPATCH_TOKEN_MISMATCH diagnostic');

const goodSignoff = runCmd(`node scripts/grill-state.mjs signoff-subagent --token ${chainedTok}`);
assert(goodSignoff.code === 0, 'signoff-subagent with valid token succeeds');

const stateAfterSignoff = JSON.parse(fs.readFileSync('.grill-logic/state.json', 'utf8'));
assert(stateAfterSignoff.subagent_signoff === true, 'subagent_signoff set to true by signoff-subagent');
assert(stateAfterSignoff.current_state === 'SUBAGENT_SIGNED_OFF', 'State transitioned to SUBAGENT_SIGNED_OFF');

// Commit in-place update for ARG-01
const commitInPlace = runCmd('node scripts/grill-state.mjs commit --status ACCEPTED_SOLUTION --rule "gRPC adopted with HTTP/2 multiplexing"');
assert(commitInPlace.code === 0, 'Commit in-place succeeds');

const ledgerAfterInPlace = fs.readFileSync('LOGICAL_LEDGER.md', 'utf8');
assert(ledgerAfterInPlace.includes('**ARG-01**'), 'ARG-01 present in ledger');
assert(!ledgerAfterInPlace.includes('**ARG-02**'), 'No duplicate ARG-02 appended; row was updated in-place');
assert(ledgerAfterInPlace.includes('**ACCEPTED_SOLUTION**'), 'ARG-01 updated to ACCEPTED_SOLUTION');

// 8.5 Formally invalid auto-refutation exemption from empirical probe in autonomous mode
runCmd('node scripts/clear-ledger.mjs --no-archive');
runCmd('node scripts/grill-state.mjs add-logic --prompt "Deploy SQLite with multi-writer containers over NFS" --premises \'["High concurrent write load", "Mount NFS storage volume"]\' --conclusion "Use SQLite over NFS"');

// Validate with failing symbolic expression
runCmd('node scripts/grill-state.mjs validate-nesy --payload "{\\"dependencies\\":[],\\"expressions\\":[{\\"left\\":\\"storage\\",\\"operator\\":\\"!=\\",\\"right\\":\\"nfs\\"}]}" --facts "{\\"storage\\":\\"nfs\\"}"');

const stateInvalid = JSON.parse(fs.readFileSync('.grill-logic/state.json', 'utf8'));
assert(stateInvalid.validation.result === 'formally_invalid', 'Validation recorded formally_invalid');

// Commit REJECTED directly without probe execution
const autoRefuteCommit = runCmd('node scripts/grill-state.mjs commit --status REJECTED --rule "Do not infer SQLite over NFS from concurrent writes because POSIX fcntl byte-range locking fails. MANDATED ALTERNATIVE: PostgreSQL."');
assert(autoRefuteCommit.code === 0, 'formally_invalid auto-refutation commit succeeds without empirical tool probe');

const ledgerAfterRefute = fs.readFileSync('LOGICAL_LEDGER.md', 'utf8');
assert(ledgerAfterRefute.includes('Deterministic Solver**: Formally invalid'), 'Ledger records Deterministic Solver proof as evidence');

// 8.6 Structural S_LLM parameter parsing and metric calculation
runCmd('node scripts/clear-ledger.mjs --no-archive');
runCmd('node scripts/grill-state.mjs init --machine autonomous --input "Test S_LLM metrics"');
const sState = JSON.parse(fs.readFileSync('.grill-logic/state.json', 'utf8'));
const sTok = sState.dispatch_token;

// Round 1 challenge
runCmd(`node scripts/grill-state.mjs record-subagent-audit --token ${sTok} --payload "{\\"conclusion_status\\":\\"CHALLENGED\\",\\"probe\\":{\\"tool\\":\\"view_file\\",\\"finding\\":\\"Initial probe finding\\"}}"`);

// Round 2 LLM counter
runCmd(`node scripts/grill-state.mjs record-llm-response --token ${sTok} --payload "{\\"type\\":\\"counter\\",\\"response\\":\\"Refined counter-hypothesis C\'\\"}"`);

// Round 2 Subagent evaluation with structural S_LLM metrics
const evalWithS = runCmd(`node scripts/grill-state.mjs record-subagent-audit --token ${sTok} --unearned-concessions 1 --total-concessions 2 --unexamined-counter-evidence 0 --total-counter-evidence 3 --hypothesis-shifted true --payload "{\\"conclusion_status\\":\\"SUPPORTED\\",\\"probe\\":{\\"tool\\":\\"run_command\\",\\"finding\\":\\"Verified C\'\\"}}"`);
assert(evalWithS.code === 0, 'record-subagent-audit with structural S_LLM parameters succeeds');

const stateAfterEval = JSON.parse(fs.readFileSync('.grill-logic/state.json', 'utf8'));
assert(stateAfterEval.epistemic_context.s_llm !== null, 's_llm evaluated and populated in epistemic context');
assert(stateAfterEval.epistemic_context.s_llm.s_syco === 0.5, 'S_syco calculated as 0.5 (1/2)');
assert(stateAfterEval.epistemic_context.s_llm.s_conf === 0.0, 'S_conf calculated as 0.0 (0/3)');
assert(stateAfterEval.epistemic_context.s_llm.f_einstellung === 0, 'F_einstellung is 0 (hypothesis shifted)');
assert(stateAfterEval.epistemic_context.s_llm.risk_level === 'HIGH', 'Risk level is HIGH due to s_syco >= 0.5');

// Cleanup
runCmd('node scripts/clear-ledger.mjs --no-archive');

console.log('\n============================================================');
console.log(`📊 TEST RESULTS: ${passed} passed, ${failed} failed`);
console.log('============================================================\n');

if (failed > 0) {
  process.exit(1);
}
