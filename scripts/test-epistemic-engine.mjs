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

// Cleanup
runCmd('node scripts/clear-ledger.mjs --no-archive');

console.log('\n============================================================');
console.log(`📊 TEST RESULTS: ${passed} passed, ${failed} failed`);
console.log('============================================================\n');

if (failed > 0) {
  process.exit(1);
}
