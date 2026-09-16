#!/usr/bin/env node

/**
 * test-epistemic-engine.mjs: Rigorous Automated Verification of
 * Epistemic State Engine & Fail-Closed Invariants.
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
console.log('🧪 GRILL-LOGIC TEST SUITE: Epistemic Engine & Fail-Closed Guards');
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

// 2. Token-Locked Subagent Handshake Tests
console.log('\n2. Testing Token-Locked Subagent Handshake...');

const initSuccess = runCmd('node scripts/grill-state.mjs init --machine autonomous --input "Use SQLite WAL over NFS for distributed workers"');
assert(initSuccess.code === 0, 'Valid autonomous proposal initializes session');
assert(fs.existsSync('.grill-logic/state.json'), '.grill-logic/state.json was created');

const stateData = JSON.parse(fs.readFileSync('.grill-logic/state.json', 'utf8'));
const validToken = stateData.dispatch_token;
assert(Boolean(validToken && validToken.startsWith('dmad_tok_')), `Session generated valid dispatch token: ${validToken}`);
assert(stateData.current_state === 'AWAITING_SUBAGENT_DISPATCH', 'State is locked in AWAITING_SUBAGENT_DISPATCH');

// Subagent token mismatch
const tokenMismatch = runCmd('node scripts/grill-state.mjs record-subagent-audit --token invalid_token_123 --risk HIGH --probe-tool grep_search --probe-finding "test"');
assert(tokenMismatch.code !== 0, 'Subagent audit with invalid token fails closed');
assert(tokenMismatch.stderr.includes('DISPATCH_TOKEN_MISMATCH'), 'Mismatch emits DISPATCH_TOKEN_MISMATCH diagnostic');

// Subagent missing empirical probe
const missingProbe = runCmd(`node scripts/grill-state.mjs record-subagent-audit --token ${validToken} --risk HIGH --verdict REJECTED`);
assert(missingProbe.code !== 0, 'Subagent audit without empirical probe fails closed');
assert(missingProbe.stderr.includes('EMPIRICAL_PROBE_MISSING'), 'Missing probe emits EMPIRICAL_PROBE_MISSING diagnostic');

// Valid subagent audit
const validAudit = runCmd(`node scripts/grill-state.mjs record-subagent-audit --token ${validToken} --risk HIGH --syco 0.1 --conf 0.9 --fixed-set false --probe-tool grep_search --probe-finding "Official docs confirm POSIX fcntl byte-range locking fails over NFS" --verdict REJECTED --rule "When designing concurrent microservices, DO NOT use SQLite over NFS because fcntl locking fails over network filesystems."`);
assert(validAudit.code === 0, 'Valid subagent audit recorded successfully');

const stateAfterAudit = JSON.parse(fs.readFileSync('.grill-logic/state.json', 'utf8'));
assert(stateAfterAudit.subagent_called === true, 'subagent_called flag set to true');
assert(stateAfterAudit.verdict === 'REJECTED', 'Audit verdict set to REJECTED');
assert(stateAfterAudit.probes_executed.length === 1, 'Empirical probe logged in state');

// 3. Asymmetric Authority Guard Tests (W_subagent > W_LLM)
console.log('\n3. Testing Asymmetric Override & Sign-Off Guards...');

// Main LLM (W=0.2) tries to commit SUPPORTED over subagent (W=0.8) REJECTED
const illegalOverride = runCmd('node scripts/grill-state.mjs commit --status SUPPORTED');
assert(illegalOverride.code !== 0, 'LLM override of subagent rejection fails closed');
assert(illegalOverride.stderr.includes('ASYMMETRIC_OVERRIDE_FORBIDDEN'), 'Illegal override emits ASYMMETRIC_OVERRIDE_FORBIDDEN diagnostic');

// Commit REJECTED succeeds and writes Contrastive Rule to LOGICAL_LEDGER.md
const validRejectCommit = runCmd('node scripts/grill-state.mjs commit --status REJECTED');
assert(validRejectCommit.code === 0, 'Committing REJECTED audit succeeds');
assert(!fs.existsSync('.grill-logic/state.json'), 'Session state cleaned up after commit');

const ledgerContent = fs.readFileSync('LOGICAL_LEDGER.md', 'utf8');
assert(ledgerContent.includes('**ARG-01**'), 'LOGICAL_LEDGER.md contains ARG-01');
assert(ledgerContent.includes('REJECTED'), 'Status is REJECTED in ledger');
assert(ledgerContent.includes('DO NOT use SQLite over NFS'), 'Contrastive Refutation Rule recorded in ledger');

// 4. Pre-Flight Firewall (Fail-Closed Negative Constraint Check)
console.log('\n4. Testing Pre-Flight Negative Constraint Firewall...');

// Colliding proposal
const firewallHit = runCmd('node scripts/grill-state.mjs check-gate --proposal "Let us mount sqlite over nfs for container concurrency"');
assert(firewallHit.code !== 0, 'Colliding proposal fails closed against active REJECTED rule');
assert(firewallHit.stderr.includes('EPISTEMIC_FIREWALL_VIOLATION'), 'Firewall emits EPISTEMIC_FIREWALL_VIOLATION diagnostic');
assert(firewallHit.stderr.includes('ARG-01'), 'Firewall diagnostic identifies blocking argument ID ARG-01');

// Non-colliding proposal
const firewallPass = runCmd('node scripts/grill-state.mjs check-gate --proposal "Use PostgreSQL on Amazon RDS with connection pooling"');
assert(firewallPass.code === 0, 'Non-colliding proposal passes pre-flight firewall');

// 5. Human Sequential Interview (Machine 2) Behavioral S_human Tests
console.log('\n5. Testing Human HITL Stagnation Alert & W_human Sovereignty...');

// Initialize Human Machine
const initHuman = runCmd('node scripts/grill-state.mjs init --machine human --input "Microservices boundary decomposition"');
assert(initHuman.code === 0, 'Human HITL session initialized');

// Turns 1 and 2: no new propositions
runCmd('node scripts/grill-state.mjs record-user-turn --new-prop false --choice "Option A"');
runCmd('node scripts/grill-state.mjs record-user-turn --new-prop false --choice "Option A again"');

const humanStateBeforeAlert = JSON.parse(fs.readFileSync('.grill-logic/state.json', 'utf8'));
assert(humanStateBeforeAlert.epistemic_context.s_human.consecutive_stagnant_turns === 2, 'Consecutive stagnant turns is 2');

// Turn 3: triggers stagnation alert
const stagnantTurn3 = runCmd('node scripts/grill-state.mjs record-user-turn --new-prop false --choice "Still Option A"');
assert(stagnantTurn3.stderr.includes('HUMAN_STAGNATION_ALERT'), 'Turn 3 emits HUMAN_STAGNATION_ALERT diagnostic');

// Commit blocked while diagnostic required
const commitBlocked = runCmd('node scripts/grill-state.mjs commit --status SUPPORTED');
assert(commitBlocked.code !== 0, 'Commit blocked while human stagnation diagnostic is pending');

// Acknowledge diagnostic query per W_human sovereignty
const ackDiagnostic = runCmd('node scripts/grill-state.mjs record-diagnostic-ack');
assert(ackDiagnostic.code === 0, 'Diagnostic acknowledgment succeeds');

// Commit unblocked
const humanCommit = runCmd('node scripts/grill-state.mjs commit --status SUPPORTED --rule "Human acknowledged small team operational trade-offs"');
assert(humanCommit.code === 0, 'Human confirmed decision committed as SUPPORTED');

const finalLedger = fs.readFileSync('LOGICAL_LEDGER.md', 'utf8');
assert(finalLedger.includes('**ARG-02**'), 'ARG-02 committed to ledger');
assert(finalLedger.includes('Human HITL (W_human=1.0'), 'ARG-02 contains Human HITL metadata');

// 6. Multi-Round Epistemic Flow Tests (CHALLENGE_ISSUED -> record-llm-response -> Evaluation -> Sign-off)
console.log('\n6. Testing Multi-Round Epistemic Flow & Transition Guards...');

// Initialize session
const initMulti = runCmd('node scripts/grill-state.mjs init --machine autonomous --input "Client SQLite offline sync for 120k menu items"');
assert(initMulti.code === 0, 'Multi-round autonomous proposal initialized');
const multiState1 = JSON.parse(fs.readFileSync('.grill-logic/state.json', 'utf8'));
const mTok = multiState1.dispatch_token;

// Round 1: Subagent records CHALLENGE_ISSUED
const round1Challenge = runCmd(`node scripts/grill-state.mjs record-subagent-audit --token ${mTok} --risk HIGH --probe-tool run_command --probe-finding "Catalog size is 174MB, unfeasible for subway offline sync" --verdict CHALLENGE_ISSUED --rule "DO NOT sync 120k items locally"`);
assert(round1Challenge.code === 0, 'Subagent records CHALLENGE_ISSUED');

const multiState2 = JSON.parse(fs.readFileSync('.grill-logic/state.json', 'utf8'));
assert(multiState2.current_state === 'AWAITING_LLM_RESPONSE', 'State transitioned to AWAITING_LLM_RESPONSE');
assert(multiState2.epistemic_context.s_llm.sycophancy_score === null, 'S_LLM sycophancy is unassessed (null) at Round 1');

// Guard: LLM cannot commit while challenge unaddressed
const unaddressedCommit = runCmd('node scripts/grill-state.mjs commit --status SUPPORTED');
assert(unaddressedCommit.code !== 0, 'Commit fails closed when challenge is unaddressed');
assert(unaddressedCommit.stderr.includes('CHALLENGE_UNADDRESSED'), 'Emits CHALLENGE_UNADDRESSED diagnostic');

// Round 2: LLM records counter-hypothesis
const llmCounter = runCmd(`node scripts/grill-state.mjs record-llm-response --token ${mTok} --type counter --response "Persist draft cart locally and use idempotent HTTP retry queue with client UUID"`);
assert(llmCounter.code === 0, 'Target LLM records counter-hypothesis');

const multiState3 = JSON.parse(fs.readFileSync('.grill-logic/state.json', 'utf8'));
assert(multiState3.current_state === 'AWAITING_SUBAGENT_EVAL', 'State transitioned to AWAITING_SUBAGENT_EVAL');
assert(multiState3.llm_response.type === 'counter', 'LLM response type recorded as counter');

// Guard: LLM cannot commit while evaluation is pending
const pendingCommit = runCmd('node scripts/grill-state.mjs commit --status SUPPORTED');
assert(pendingCommit.code !== 0, 'Commit fails closed when evaluation is pending');
assert(pendingCommit.stderr.includes('EVALUATION_PENDING'), 'Emits EVALUATION_PENDING diagnostic');

// Round 2 Evaluation: Subagent evaluates LLM counter-hypothesis, scores S_LLM, and signs off
const subagentEval = runCmd(`node scripts/grill-state.mjs record-subagent-audit --token ${mTok} --risk LOW --syco 0.1 --conf 0.1 --fixed-set false --probe-tool view_file --probe-finding "AsyncStorage + Idempotency-Key header is sound and eliminates distributed database complexity" --verdict SUPPORTED --rule "Verified via empirical probe view_file"`);
assert(subagentEval.code === 0, 'Subagent logs evaluated audit with low sycophancy and breaks fixed set');

const subagentSignoff = runCmd(`node scripts/grill-state.mjs signoff-subagent --token ${mTok}`);
assert(subagentSignoff.code === 0, 'Subagent executes signoff');

const multiCommit = runCmd('node scripts/grill-state.mjs commit --status SUPPORTED --rule "Client draft cart persistence with Idempotency-Key retry queue verified"');
assert(multiCommit.code === 0, 'Commit succeeds as SUPPORTED after subagent sign-off');

const multiLedger = fs.readFileSync('LOGICAL_LEDGER.md', 'utf8');
assert(multiLedger.includes('Client draft cart persistence'), 'Multi-round counter-hypothesis committed to ledger');

// Cleanup
runCmd('node scripts/clear-ledger.mjs --no-archive');

console.log('\n============================================================');
console.log(`📊 TEST RESULTS: ${passed} passed, ${failed} failed`);
console.log('============================================================\n');

if (failed > 0) {
  process.exit(1);
}
