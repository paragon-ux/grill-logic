#!/usr/bin/env node

/**
 * grill-state.mjs: Epistemic State Engine & Fail-Closed Guard Runtime
 *
 * Implements persistent state tracking (.grill-logic/state.json),
 * mathematical W/S calculations, token-locked handshakes, and
 * fail-closed diagnostic gates for Grill-Logic and Self-Grill.
 */

import fs from 'node:fs';
import path from 'node:path';
import { randomBytes } from 'node:crypto';

const STATE_DIR = '.grill-logic';
const STATE_FILE = path.join(STATE_DIR, 'state.json');
const LEDGER_FILE = 'LOGICAL_LEDGER.md';

// Standardized Fail-Closed Diagnostic Block
export function emitDiagnostic({
  code,
  state = 'UNKNOWN',
  machine = 'UNKNOWN',
  targetW = 'N/A',
  challengerW = 'N/A',
  risk = 'N/A',
  sHuman = 'N/A',
  reason,
  remediation
}) {
  const border = '═'.repeat(78);
  const divider = '─'.repeat(78);
  const output = [
    `╔${border}╗`,
    `║ ⛔ EPISTEMIC GATE HALT: ${code.padEnd(52)} ║`,
    `╠${border}╣`,
    `║ State:          ${state.padEnd(59)} ║`,
    `║ Active Machine: ${machine.padEnd(59)} ║`,
    `║ Actor Context:  Target W=${String(targetW).padEnd(5)}, Challenger W=${String(challengerW).padEnd(33)} ║`,
    `║ Skepticism:     Risk=${String(risk).padEnd(6)}, S_human=${String(sHuman).padEnd(39)} ║`,
    `╟${divider}╢`,
    `║ Diagnostic:                                                                  ║`,
    ...wrapText(reason, 74).map(line => `║   ${line.padEnd(74)} ║`),
    `╟${divider}╢`,
    `║ Remediation:                                                                 ║`,
    ...wrapText(remediation, 74).map(line => `║   ${line.padEnd(74)} ║`),
    `╟${divider}╢`,
    `║ Execution Gate: BLOCKED (Fail-Closed: Code generation prohibited)            ║`,
    `╚${border}╝`
  ].join('\n');

  console.error(output);
}

function wrapText(text, maxWidth = 74) {
  if (!text) return [''];
  return text.match(new RegExp(`.{1,${maxWidth}}(?:\\s+|$)|.{1,${maxWidth}}`, 'g'))?.map(s => s.trim()).filter(Boolean) || [text];
}

export function loadState() {
  try {
    return JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'));
  } catch (err) {
    if (err.code === 'ENOENT') return null;
    emitDiagnostic({
      code: 'STATE_CORRUPT',
      reason: `Could not parse state file ${STATE_FILE}: ${err.message}`,
      remediation: 'Reset state via `node scripts/grill-state.mjs init` or inspect the JSON syntax.'
    });
    process.exit(1);
  }
}

export function saveState(state) {
  if (!fs.existsSync(STATE_DIR)) {
    fs.mkdirSync(STATE_DIR, { recursive: true });
  }
  fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2), 'utf8');
}

export function clearState() {
  if (fs.existsSync(STATE_FILE)) {
    fs.unlinkSync(STATE_FILE);
  }
}

// Generate random dispatch token
function generateToken(prefix = 'dmad_tok') {
  return `${prefix}_${randomBytes(4).toString('hex')}`;
}

function getArgStr(args, key, fallback = '') {
  const val = args[key];
  if (typeof val === 'string') return val.trim();
  return fallback;
}

// CLI Commands
export function cmdInit(args) {
  const machine = getArgStr(args, 'machine').toUpperCase();
  const input = getArgStr(args, 'input');

  if (machine !== 'AUTONOMOUS' && machine !== 'HUMAN') {
    emitDiagnostic({
      code: 'INVALID_MACHINE_TYPE',
      reason: `Machine must be 'autonomous' or 'human'. Received: '${args.machine}'`,
      remediation: 'Run with `--machine autonomous` (for /self-grill) or `--machine human` (for /grill-logic).'
    });
    process.exit(1);
  }

  // Input gate invariant: must have non-empty proposal/topic
  if (!input || input.length < 5) {
    emitDiagnostic({
      code: 'INPUT_GATE_HALT',
      machine: machine === 'AUTONOMOUS' ? 'AUTONOMOUS_DMAD' : 'HUMAN_HITL',
      state: 'VALIDATE_INPUT',
      reason: 'Proposal or design topic is empty, missing, or too vague (< 5 characters).',
      remediation: 'Provide a concrete architectural proposal or design area. Example: `/self-grill use Redis for session caching`.'
    });
    process.exit(2);
  }

  const isAutonomous = machine === 'AUTONOMOUS';
  const dispatchToken = isAutonomous ? generateToken('dmad_tok') : null;

  const state = {
    version: '2.0.0',
    active_machine: isAutonomous ? 'AUTONOMOUS_DMAD' : 'HUMAN_HITL',
    current_state: isAutonomous ? 'AWAITING_SUBAGENT_DISPATCH' : 'IDENTIFY_BRANCHES',
    input_text: input,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    turn_count: 0,
    dispatch_token: dispatchToken,
    subagent_called: false,
    subagent_signoff: false,
    epistemic_context: {
      target_w: isAutonomous ? 0.2 : 1.0,
      challenger_w: isAutonomous ? 0.8 : 0.4,
      s_human: {
        new_propositions_count: 0,
        reassertions_count: 0,
        consecutive_stagnant_turns: 0,
        reassertion_ratio: 0.0,
        diagnostic_required: false
      },
      s_llm: {
        risk_level: 'UNASSESSED',
        sycophancy_score: 0.0,
        confirmation_bias_score: 0.0,
        fixed_mental_set: false,
        subagent_signoff: false,
        suggested_skepticism: null
      }
    },
    probes_executed: [],
    verdict: null,
    contrastive_rule: null
  };

  saveState(state);

  console.log(`[GRILL-STATE] Initialized ${state.active_machine} session.`);
  console.log(`[GRILL-STATE] Current State: ${state.current_state}`);
  if (dispatchToken) {
    console.log(`[GRILL-STATE] Dispatch Token: ${dispatchToken}`);
    console.log(`[GRILL-STATE] Invariant: Locked until subagent records audit with token '${dispatchToken}'.`);
  }
}

export function cmdStatus() {
  const state = loadState();
  if (!state) {
    console.log('[GRILL-STATE] No active session. Run `grill-state init` to start.');
    return;
  }
  console.log(JSON.stringify(state, null, 2));
}

export function cmdRecordSubagentAudit(args) {
  const state = loadState();
  if (!state) {
    emitDiagnostic({
      code: 'NO_ACTIVE_SESSION',
      reason: 'Attempted to record subagent audit without an active session.',
      remediation: 'Initialize session first via `node scripts/grill-state.mjs init --machine autonomous ...`'
    });
    process.exit(1);
  }

  if (state.active_machine !== 'AUTONOMOUS_DMAD') {
    emitDiagnostic({
      code: 'INVALID_MACHINE_OPERATION',
      machine: state.active_machine,
      state: state.current_state,
      reason: 'Subagent audit can only be recorded on AUTONOMOUS_DMAD machine.',
      remediation: 'Use user turn recording for HUMAN_HITL machine.'
    });
    process.exit(1);
  }

  const token = getArgStr(args, 'token');
  if (!token || token !== state.dispatch_token) {
    emitDiagnostic({
      code: 'DISPATCH_TOKEN_MISMATCH',
      machine: state.active_machine,
      state: state.current_state,
      targetW: state.epistemic_context.target_w,
      challengerW: state.epistemic_context.challenger_w,
      reason: `Subagent submitted invalid or mismatched dispatch token: '${token}'. Expected: '${state.dispatch_token}'.`,
      remediation: 'Subagent must be passed the exact dispatch token generated at session initialization.'
    });
    process.exit(1);
  }

  const riskLevel = getArgStr(args, 'risk', 'MODERATE').toUpperCase();
  const sycoScore = parseFloat(args.syco || '0.0');
  const confScore = parseFloat(args.conf || '0.0');
  const fixedSet = String(args['fixed-set']).toLowerCase() === 'true';
  const verdict = getArgStr(args, 'verdict', 'REJECTED').toUpperCase();
  const rule = getArgStr(args, 'rule');
  const probeTool = getArgStr(args, 'probe-tool');
  const probeFinding = getArgStr(args, 'probe-finding');

  // Enforce tool probe invariant: subagent must record a real tool execution
  if (!probeTool || !probeFinding) {
    emitDiagnostic({
      code: 'EMPIRICAL_PROBE_MISSING',
      machine: state.active_machine,
      state: state.current_state,
      targetW: state.epistemic_context.target_w,
      challengerW: state.epistemic_context.challenger_w,
      risk: riskLevel,
      reason: 'Subagent audit submitted without an empirical tool probe. Simulated text monologues are forbidden.',
      remediation: 'Execute a real tool probe (grep_search, view_file, run_command) and provide `--probe-tool` and `--probe-finding`.'
    });
    process.exit(1);
  }

  state.subagent_called = true;
  state.current_state = 'SUBAGENT_AUDIT_LOGGED';
  state.updated_at = new Date().toISOString();
  state.epistemic_context.s_llm = {
    risk_level: riskLevel,
    sycophancy_score: sycoScore,
    confirmation_bias_score: confScore,
    fixed_mental_set: fixedSet,
    subagent_signoff: verdict === 'SUPPORTED',
    suggested_skepticism: rule
  };
  state.probes_executed.push({
    round: state.probes_executed.length + 1,
    tool: probeTool,
    finding: probeFinding,
    timestamp: new Date().toISOString()
  });
  state.verdict = verdict;
  state.contrastive_rule = rule;

  saveState(state);

  console.log(`[GRILL-STATE] Subagent audit recorded successfully.`);
  console.log(`[GRILL-STATE] Verdict: ${verdict} | Risk Level: ${riskLevel} | Tool: ${probeTool}`);
}

export function cmdSignoffSubagent(args) {
  const state = loadState();
  if (!state) {
    emitDiagnostic({
      code: 'NO_ACTIVE_SESSION',
      reason: 'Attempted subagent signoff without active session.',
      remediation: 'Initialize session first.'
    });
    process.exit(1);
  }

  const token = getArgStr(args, 'token');
  if (token !== state.dispatch_token) {
    emitDiagnostic({
      code: 'DISPATCH_TOKEN_MISMATCH',
      machine: state.active_machine,
      state: state.current_state,
      reason: `Signoff token mismatch: '${token}'.`,
      remediation: 'Provide matching dispatch token.'
    });
    process.exit(1);
  }

  state.subagent_signoff = true;
  state.epistemic_context.s_llm.subagent_signoff = true;
  state.current_state = 'SUBAGENT_SIGNED_OFF';
  state.updated_at = new Date().toISOString();

  saveState(state);
  console.log('[GRILL-STATE] Subagent signoff recorded. Proposal unblocked for ledger commitment.');
}

export function cmdRecordUserTurn(args) {
  const state = loadState();
  if (!state) {
    emitDiagnostic({
      code: 'NO_ACTIVE_SESSION',
      reason: 'Attempted to record user turn without an active session.',
      remediation: 'Initialize session via `node scripts/grill-state.mjs init --machine human ...`'
    });
    process.exit(1);
  }

  if (state.active_machine !== 'HUMAN_HITL') {
    emitDiagnostic({
      code: 'INVALID_MACHINE_OPERATION',
      machine: state.active_machine,
      reason: 'User turns can only be recorded on HUMAN_HITL machine.',
      remediation: 'Use record-subagent-audit for AUTONOMOUS_DMAD machine.'
    });
    process.exit(1);
  }

  const hasNewProp = String(args['new-prop']).toLowerCase() === 'true';
  const choice = getArgStr(args, 'choice');

  state.turn_count += 1;
  const sHuman = state.epistemic_context.s_human;

  if (hasNewProp) {
    sHuman.new_propositions_count += 1;
    sHuman.consecutive_stagnant_turns = 0;
  } else {
    sHuman.reassertions_count += 1;
    sHuman.consecutive_stagnant_turns += 1;
  }

  // Calculate Reassertion Ratio
  sHuman.reassertion_ratio = parseFloat(
    (sHuman.reassertions_count / (sHuman.new_propositions_count + 1)).toFixed(2)
  );

  // Stagnation threshold: 3 consecutive turns without new propositions
  if (sHuman.consecutive_stagnant_turns >= 3) {
    sHuman.diagnostic_required = true;
    state.current_state = 'DIAGNOSTIC_REQUIRED';
    saveState(state);

    emitDiagnostic({
      code: 'HUMAN_STAGNATION_ALERT',
      machine: state.active_machine,
      state: state.current_state,
      targetW: state.epistemic_context.target_w,
      challengerW: state.epistemic_context.challenger_w,
      sHuman: `R_reassert=${sHuman.reassertion_ratio}, stagnant_turns=${sHuman.consecutive_stagnant_turns}`,
      reason: `Human user has held their position for ${sHuman.consecutive_stagnant_turns} consecutive rounds without introducing new empirical constraints or evidence.`,
      remediation: 'Model MUST emit the diagnostic query: "You have maintained this position across 3 rounds without introducing new constraints. Do you accept this operational trade-off or address counter-evidence [X]?" Run `record-diagnostic-ack` once user responds.'
    });
    process.exit(1); // Fail-closed: halts execution until diagnostic query is acknowledged
  }

  state.current_state = 'USER_TURN_RECORDED';
  state.updated_at = new Date().toISOString();
  saveState(state);

  console.log(`[GRILL-STATE] Recorded user turn #${state.turn_count}. (New prop: ${hasNewProp}, Stagnant count: ${sHuman.consecutive_stagnant_turns}, R_reassert: ${sHuman.reassertion_ratio})`);
}

export function cmdRecordDiagnosticAck() {
  const state = loadState();
  if (!state) process.exit(1);

  state.epistemic_context.s_human.consecutive_stagnant_turns = 0;
  state.epistemic_context.s_human.diagnostic_required = false;
  state.current_state = 'DIAGNOSTIC_ACKNOWLEDGED';
  state.updated_at = new Date().toISOString();

  saveState(state);
  console.log('[GRILL-STATE] Human stagnation diagnostic acknowledged. Progression unblocked per W_human sovereignty.');
}

export function cmdCheckGate(args) {
  const proposal = getArgStr(args, 'proposal').toLowerCase();
  if (!proposal) {
    emitDiagnostic({
      code: 'INPUT_GATE_HALT',
      reason: 'check-gate requires `--proposal "<text>"` to audit.',
      remediation: 'Pass the architectural proposal to audit.'
    });
    process.exit(1);
  }

  if (!fs.existsSync(LEDGER_FILE)) {
    console.log('[GRILL-STATE] LOGICAL_LEDGER.md not found. Gate PASS.');
    return;
  }

  const content = fs.readFileSync(LEDGER_FILE, 'utf8');
  const lines = content.split('\n');

  // Parse table rows for REJECTED arguments and Contrastive Rules
  const rejectedRules = [];
  for (const line of lines) {
    if (line.includes('|') && line.includes('REJECTED')) {
      const parts = line.split('|').map(p => p.trim());
      if (parts.length >= 6) {
        const argId = parts[1].replace(/[*_]/g, '');
        const ruleCell = parts[6];
        rejectedRules.push({ id: argId, raw: ruleCell });
      }
    }
  }

  // Check keyword collisions against contrastive refutations
  for (const r of rejectedRules) {
    const rawLower = r.raw.toLowerCase();
    // Extract negative constraints ("do not infer...", "do not use...", "do not build...")
    const match = rawLower.match(/do not (?:infer|use|replace|deploy|build|implement|create|adopt|introduce) ([^.]+?)(?: because|\.|$)/i);
    if (match) {
      const blockedConcept = match[1].trim();
      const keywords = blockedConcept.split(/\s+/).filter(w => w.length > 3);
      const hit = keywords.filter(kw => proposal.includes(kw));

      if (hit.length >= 2 || (keywords.length === 1 && hit.length === 1)) {
        emitDiagnostic({
          code: 'EPISTEMIC_FIREWALL_VIOLATION',
          reason: `Proposal collides with active REJECTED rule [${r.id}]: "${r.raw}". Blocked concept: "${blockedConcept}".`,
          remediation: `Halt execution immediately. Cite rule ${r.id} to user and adopt the supported alternative recorded in LOGICAL_LEDGER.md.`
        });
        process.exit(1);
      }
    }
  }

  console.log('[GRILL-STATE] Pre-flight firewall check PASS. No active REJECTED rule violations found.');
}

export function cmdCommit(args) {
  const state = loadState();
  if (!state) {
    emitDiagnostic({
      code: 'NO_ACTIVE_SESSION',
      reason: 'Attempted to commit ledger without active session.',
      remediation: 'Initialize session and execute state protocol first.'
    });
    process.exit(1);
  }

  const status = getArgStr(args, 'status').toUpperCase();
  const rule = getArgStr(args, 'rule', state.contrastive_rule || '');

  if (status !== 'SUPPORTED' && status !== 'REJECTED' && status !== 'SUPERSEDED') {
    emitDiagnostic({
      code: 'INVALID_STATUS',
      reason: `Status must be SUPPORTED, REJECTED, or SUPERSEDED. Received: '${status}'`,
      remediation: 'Provide `--status SUPPORTED` or `--status REJECTED`.'
    });
    process.exit(1);
  }

  // Fail-Closed Epistemic Guards:
  if (state.active_machine === 'AUTONOMOUS_DMAD') {
    // 1. Must have executed an actual probe
    if (!state.probes_executed || state.probes_executed.length === 0) {
      emitDiagnostic({
        code: 'EMPIRICAL_PROBE_MISSING',
        machine: state.active_machine,
        state: state.current_state,
        targetW: state.epistemic_context.target_w,
        challengerW: state.epistemic_context.challenger_w,
        reason: 'Cannot commit autonomous audit without at least one empirical tool probe execution.',
        remediation: 'Run a real tool probe (grep_search, run_command, view_file) and record it before committing.'
      });
      process.exit(1);
    }

    // 2. Asymmetric Override Guard: LLM (W=0.2) cannot commit SUPPORTED if subagent (W=0.8) rejected
    if (status === 'SUPPORTED' && state.verdict === 'REJECTED') {
      emitDiagnostic({
        code: 'ASYMMETRIC_OVERRIDE_FORBIDDEN',
        machine: state.active_machine,
        state: state.current_state,
        targetW: state.epistemic_context.target_w,
        challengerW: state.epistemic_context.challenger_w,
        reason: 'Target W_LLM (0.2) attempted to mark proposal SUPPORTED over Challenger W_subagent (0.8) rejection without empirical counter-proof.',
        remediation: 'Either accept the subagent REJECTED verdict or provide a falsification counter-probe disproving the subagent findings.'
      });
      process.exit(1);
    }

    // 3. Subagent Signoff Guard: Cannot commit SUPPORTED without subagent signoff
    if (status === 'SUPPORTED' && !state.subagent_signoff) {
      emitDiagnostic({
        code: 'SIGNOFF_TOKEN_MISSING',
        machine: state.active_machine,
        state: state.current_state,
        reason: 'Cannot commit SUPPORTED status without explicit subagent sign-off in state.',
        remediation: 'Obtain subagent sign-off via `signoff-subagent`.'
      });
      process.exit(1);
    }
  } else if (state.active_machine === 'HUMAN_HITL') {
    // Stagnation lock: cannot commit if diagnostic is pending
    if (state.epistemic_context.s_human.diagnostic_required) {
      emitDiagnostic({
        code: 'HUMAN_STAGNATION_ALERT',
        machine: state.active_machine,
        state: state.current_state,
        reason: 'Cannot commit while a human stagnation diagnostic is pending acknowledgment.',
        remediation: 'Surface diagnostic alert to user and call `record-diagnostic-ack` once answered.'
      });
      process.exit(1);
    }
  }

  // Ledger Formatting & Commitment
  if (!fs.existsSync(LEDGER_FILE)) {
    emitDiagnostic({
      code: 'LEDGER_NOT_FOUND',
      reason: `${LEDGER_FILE} not found in workspace.`,
      remediation: 'Run `setup-grill-logic` to scaffold initial ledger.'
    });
    process.exit(1);
  }

  const ledgerContent = fs.readFileSync(LEDGER_FILE, 'utf8');
  const argMatches = [...ledgerContent.matchAll(/\*\*ARG-(\d+)\*\*/g)];
  const nextIdNum = argMatches.length > 0 ? Math.max(...argMatches.map(m => parseInt(m[1], 10))) + 1 : 1;
  const argId = `ARG-${String(nextIdNum).padStart(2, '0')}`;

  const cleanInput = state.input_text.replace(/\|/g, '\\|').replace(/\n/g, ' ');
  const cleanRule = rule.replace(/\|/g, '\\|').replace(/\n/g, '<br>');
  const probeSummary = state.probes_executed.map(p => `[${p.tool}]: ${p.finding}`).join('; ') || 'Standard evaluation';

  const isAuto = state.active_machine === 'AUTONOMOUS_DMAD';
  const conclusion = isAuto ? 'Implement proposal' : 'Aligned architecture';
  const auditEvidence = isAuto
    ? `**Subagent Challenger (W_subagent=0.8, S_LLM=${state.epistemic_context.s_llm.risk_level})**: ${probeSummary}`
    : `**Human HITL (W_human=1.0, R_reassert=${state.epistemic_context.s_human.reassertion_ratio})**: Decision tree aligned`;

  const row = `| **${argId}** | **P**: ${cleanInput} | **C**: ${conclusion} | **${status}** | ${auditEvidence} | ${cleanRule || 'Verified'} |`;

  // Append row right after active decision table header
  const tableHeaderIndex = ledgerContent.indexOf('| :--- | :--- | :--- | :--- | :--- | :--- |');
  if (tableHeaderIndex === -1) {
    emitDiagnostic({
      code: 'LEDGER_MALFORMED',
      reason: 'Active Decision Registry table header not found in LOGICAL_LEDGER.md.',
      remediation: 'Check LOGICAL_LEDGER.md structure or run `/clear-ledger` to reset.'
    });
    process.exit(1);
  }

  const insertPos = tableHeaderIndex + '| :--- | :--- | :--- | :--- | :--- | :--- |'.length;
  const updatedLedger = ledgerContent.slice(0, insertPos) + '\n' + row + ledgerContent.slice(insertPos);

  fs.writeFileSync(LEDGER_FILE, updatedLedger, 'utf8');
  clearState();

  console.log(`[GRILL-STATE] Successfully committed ${argId} [${status}] to ${LEDGER_FILE}.`);
  console.log(`[GRILL-STATE] Session state cleared.`);
}

// CLI Arg Parser Dispatcher
function parseArgs(args) {
  const parsed = {};
  for (let i = 0; i < args.length; i++) {
    if (args[i].startsWith('--')) {
      const key = args[i].slice(2);
      parsed[key] = (i + 1 < args.length && !args[i + 1].startsWith('--')) ? String(args[++i]) : true;
    }
  }
  return parsed;
}

const action = process.argv[2];
const parsedArgs = parseArgs(process.argv.slice(3));

switch (action) {
  case 'init':
    cmdInit(parsedArgs);
    break;
  case 'status':
    cmdStatus();
    break;
  case 'record-subagent-audit':
    cmdRecordSubagentAudit(parsedArgs);
    break;
  case 'signoff-subagent':
    cmdSignoffSubagent(parsedArgs);
    break;
  case 'record-user-turn':
    cmdRecordUserTurn(parsedArgs);
    break;
  case 'record-diagnostic-ack':
    cmdRecordDiagnosticAck();
    break;
  case 'check-gate':
    cmdCheckGate(parsedArgs);
    break;
  case 'commit':
    cmdCommit(parsedArgs);
    break;
  default:
    console.log(`Grill-State CLI:
  init                     --machine <autonomous|human> --input "<text>"
  status
  record-subagent-audit    --token <tok> --risk <LOW|MOD|HIGH> --syco <0-1> --conf <0-1> --fixed-set <bool> --probe-tool <tool> --probe-finding "<text>" --verdict <SUPPORTED|REJECTED> --rule "<rule>"
  signoff-subagent         --token <tok>
  record-user-turn         --new-prop <true|false> [--choice "<text>"]
  record-diagnostic-ack
  check-gate               --proposal "<text>"
  commit                   --status <SUPPORTED|REJECTED> [--rule "<rule>"]
`);
    break;
}
