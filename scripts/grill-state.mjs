#!/usr/bin/env node

/**
 * grill-state.mjs: Epistemic State Engine & Deterministic Invariant Solver
 *
 * Implements persistent state tracking (.grill-logic/state.json),
 * physical systems constraint solving, structured JSON payloads,
 * token-locked handshakes, and fail-closed diagnostic gates.
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

function generateToken(prefix = 'dmad_tok') {
  return `${prefix}_${randomBytes(4).toString('hex')}`;
}

function getArgStr(args, key, fallback = '') {
  const val = args[key];
  if (typeof val === 'string') return val.trim();
  return fallback;
}

// -----------------------------------------------------------------------------
// Zero-Dependency Neurosymbolic (NeSy) Solver
// AST Operator Mapping, DAG Cycle Detection, and Environment Invariants
// -----------------------------------------------------------------------------
export const OPERATORS = {
  '==': (a, b) => a === b,
  '!=': (a, b) => a !== b,
  '>':  (a, b) => a > b,
  '<':  (a, b) => a < b,
  '>=': (a, b) => a >= b,
  '<=': (a, b) => a <= b,
  'in': (a, b) => Array.isArray(b) ? b.includes(a) : (typeof b === 'string' ? b.includes(a) : false),
  'not_in': (a, b) => Array.isArray(b) ? !b.includes(a) : (typeof b === 'string' ? !b.includes(a) : true),
  'implies': (a, b) => (!a || Boolean(b))
};

export function hasCircularPremises(edges) {
  if (!Array.isArray(edges)) return false;
  const adj = new Map();
  const visited = new Map(); // 0 = unvisited, 1 = visiting, 2 = visited

  for (const [u, v] of edges) {
    if (!adj.has(u)) adj.set(u, []);
    adj.get(u).push(v);
  }

  function dfs(node) {
    visited.set(node, 1);
    for (const neighbor of adj.get(node) || []) {
      if (visited.get(neighbor) === 1) return true; // Cycle detected
      if (!visited.has(neighbor) && dfs(neighbor)) return true;
    }
    visited.set(node, 2);
    return false;
  }

  for (const node of adj.keys()) {
    if (!visited.has(node) && dfs(node)) return true;
  }
  return false;
}

export function evaluateNeSyState(rawJsonString, environmentFacts = {}) {
  let payload;

  // Outcome 1: malformed
  try {
    payload = typeof rawJsonString === 'string' ? JSON.parse(rawJsonString) : rawJsonString;
    if (!payload || !Array.isArray(payload.expressions) || !Array.isArray(payload.dependencies)) {
      return { 
        outcome: 'malformed', 
        diagnostic: 'Missing expressions array or dependency topology graph in payload.' 
      };
    }
  } catch (err) {
    return { 
      outcome: 'malformed', 
      diagnostic: `JSON parsing syntax failed: ${err.message}` 
    };
  }

  // Outcome 2: inconsistent_premises
  if (hasCircularPremises(payload.dependencies)) {
    return { 
      outcome: 'inconsistent_premises', 
      diagnostic: 'Circular dependency detected within the premise topology graph.' 
    };
  }

  // Evaluate structural expressions sequentially
  for (const expr of payload.expressions) {
    const { left, operator, right } = expr;

    // Outcome 3: unsupported_expression
    if (!OPERATORS.hasOwnProperty(operator)) {
      return { 
        outcome: 'unsupported_expression', 
        diagnostic: `Operator '${operator}' is unregistered in the dispatch ledger.` 
      };
    }

    // Outcome 4: undecidable
    if (!(left in environmentFacts)) {
      return { 
        outcome: 'undecidable', 
        diagnostic: `Variable '${left}' references unbounded runtime context missing from ground facts.` 
      };
    }

    // Execute logical evaluation
    const opFunction = OPERATORS[operator];
    const runtimeValue = environmentFacts[left];
    const resolution = opFunction(runtimeValue, right);

    // Outcome 5: formally_invalid (Auto-Refutation rule triggered)
    if (resolution === false) {
      return { 
        outcome: 'formally_invalid', 
        diagnostic: `Symbolic invariant evaluation strictly failed: [Factual state ${left} (${runtimeValue}) ${operator} Bound Constraint (${right})] evaluated to False.` 
      };
    }
  }

  // Outcome 6: valid
  return { 
    outcome: 'valid', 
    diagnostic: 'All topological dependencies verified and rule constraints successfully satisfied.' 
  };
}

// -----------------------------------------------------------------------------
// Deterministic Invariant Solver: Physical systems laws & active ledger rules
// -----------------------------------------------------------------------------
export function solveConstraints(inputText, ledgerPath = LEDGER_FILE) {
  const violations = [];
  const text = inputText.toLowerCase();

  // 1. Active Negative Constraint Rules in LOGICAL_LEDGER.md (Highest Precedence)
  if (fs.existsSync(ledgerPath)) {
    const content = fs.readFileSync(ledgerPath, 'utf8');
    const lines = content.split('\n');
    for (const line of lines) {
      if (line.includes('|') && line.includes('REJECTED')) {
        const parts = line.split('|').map(p => p.trim());
        if (parts.length >= 6) {
          const argId = parts[1].replace(/[*_]/g, '');
          const ruleCell = parts[6];
          const match = ruleCell.toLowerCase().match(/do not (?:infer|use|replace|deploy|build|implement|create|adopt|introduce) ([^.]+?)(?: because|\.|$)/i);
          if (match) {
            const blockedConcept = match[1].trim();
            const keywords = blockedConcept.split(/\s+/).filter(w => w.length > 3);
            const hits = keywords.filter(kw => text.includes(kw));
            if (hits.length >= 2 || (keywords.length === 1 && hits.length === 1)) {
              violations.push({
                rule_id: argId,
                boundary: `Active Contrastive Rule [${argId}]`,
                reason: ruleCell
              });
            }
          }
        }
      }
    }
  }

  // 2. Built-in Physical Systems Invariants
  // Invariant 1: SQLite WAL over network storage (NFS/SMB) with concurrent writers
  if ((text.includes('sqlite') || text.includes('sqlite3')) && 
      (text.includes('nfs') || text.includes('network file') || text.includes('smb') || text.includes('cifs')) &&
      (text.includes('concurrent') || text.includes('multi') || text.includes('cluster') || text.includes('workers') || text.includes('containers'))) {
    violations.push({
      rule_id: 'SYS-INV-01',
      boundary: 'POSIX fcntl byte-range locking over network storage',
      reason: 'SQLite WAL mode and multi-process write locks fail over NFS; network jitter silently leaks or corrupts database headers.'
    });
  }

  // Invariant 2: Linux io_uring on Windows NT kernel
  if ((text.includes('io_uring') || text.includes('iouring')) &&
      (text.includes('windows') || text.includes('win32') || text.includes('ntfs'))) {
    violations.push({
      rule_id: 'SYS-INV-02',
      boundary: 'OS Kernel Interface Compatibility',
      reason: 'io_uring is a Linux-specific kernel interface. Windows NT uses I/O Completion Ports (IOCP) for asynchronous I/O.'
    });
  }

  // Invariant 3: Mobile distributed two-way catalog sync
  if ((text.includes('offline-first') || text.includes('offline')) &&
      (text.includes('react native') || text.includes('mobile') || text.includes('ios') || text.includes('android')) &&
      (text.includes('mirror') || text.includes('sync engine') || text.includes('two-way reconciliation')) &&
      (text.includes('120,000') || text.includes('catalog') || text.includes('all items'))) {
    violations.push({
      rule_id: 'SYS-INV-03',
      boundary: 'Mobile Storage & Consistency Boundary',
      reason: 'Mirroring large volatile catalogs (100k+ items) to mobile clients causes payload bloat (100MB+) and high checkout failure. Requires client draft persistence with idempotent retry queues.'
    });
  }

  return {
    satisfied: violations.length === 0,
    violations
  };
}

// -----------------------------------------------------------------------------
// CLI Commands
// -----------------------------------------------------------------------------
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

  const existingState = loadState();
  const argId = getArgStr(args, 'arg-id') || existingState?.arg_id || null;
  const validation = existingState?.validation || null;
  const sourcePrompt = existingState?.source_prompt || input;
  const premises = existingState?.premises || null;
  const conclusion = existingState?.conclusion || null;

  const state = {
    version: '2.2.0',
    arg_id: argId,
    source_prompt: sourcePrompt,
    premises,
    conclusion,
    validation,
    active_machine: isAutonomous ? 'AUTONOMOUS_DMAD' : 'HUMAN_HITL',
    current_state: isAutonomous ? 'AWAITING_SUBAGENT_DISPATCH' : 'IDENTIFY_BRANCHES',
    canonical_state: isAutonomous ? 'S_A1_TOKEN_ISSUE' : 'S_U1_PREMISE_ISOLATION',
    input_text: input,
    tally: existingState?.tally || {
      proposer: null,
      challenger: null,
      premises: { agree: 0, disagree: 0, uncertain: 0 },
      solution: { agree: 0, disagree: 0, uncertain: 0 }
    },
    created_at: existingState?.created_at || new Date().toISOString(),
    updated_at: new Date().toISOString(),
    turn_count: 0,
    dispatch_token: dispatchToken,
    subagent_called: false,
    subagent_signoff: false,
    epistemic_context: {
      target_w: isAutonomous ? 0.2 : 1.0,
      challenger_w: isAutonomous ? 0.8 : 0.4,
      s_llm: null,
      s_human: {
        new_propositions_count: 0,
        reassertions_count: 0,
        consecutive_stagnant_turns: 0,
        diagnostic_required: false
      }
    },
    probes_executed: [],
    premise_status: null,
    inference_status: null,
    conclusion_status: null,
    contrastive_rule: null
  };

  saveState(state);

  console.log(`[GRILL-STATE] Initialized ${state.active_machine} session.`);
  if (argId) {
    console.log(`[GRILL-STATE] Preserved Baseline Argument ID: ${argId}`);
  }
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

  // Parse structured payload directly (no manual flag parsing)
  let payload = {};
  if (args.payload) {
    try {
      payload = JSON.parse(args.payload);
    } catch (err) {
      emitDiagnostic({
        code: 'INVALID_PAYLOAD_JSON',
        reason: `Could not parse --payload JSON: ${err.message}`,
        remediation: 'Provide valid structured JSON: `{"premise_status":"...","conclusion_status":"...","probe":{"tool":"...","finding":"..."}}`.'
      });
      process.exit(1);
    }
  }

  const premiseStatus = (payload.premise_status || getArgStr(args, 'premise-status')).toUpperCase();
  const inferenceStatus = (payload.inference_status || getArgStr(args, 'inference-status')).toUpperCase();
  const conclusionStatus = (payload.conclusion_status || getArgStr(args, 'conclusion-status')).toUpperCase();
  const rule = payload.rule || getArgStr(args, 'rule');

  const probeTool = payload.probe?.tool || getArgStr(args, 'probe-tool');
  const probeFinding = payload.probe?.finding || getArgStr(args, 'probe-finding');

  // Parse structural S_LLM metrics (Whitepaper §2.3)
  const unearnedConcessions = payload.unearned_concessions ?? (args['unearned-concessions'] !== undefined ? parseInt(args['unearned-concessions'], 10) : null);
  const totalConcessions = payload.total_concessions ?? (args['total-concessions'] !== undefined ? parseInt(args['total-concessions'], 10) : null);
  const unexaminedCounter = payload.unexamined_counter_evidence ?? (args['unexamined-counter-evidence'] !== undefined ? parseInt(args['unexamined-counter-evidence'], 10) : null);
  const totalCounter = payload.total_counter_evidence ?? (args['total-counter-evidence'] !== undefined ? parseInt(args['total-counter-evidence'], 10) : null);
  const hypothesisShiftedRaw = payload.hypothesis_shifted ?? args['hypothesis-shifted'];
  const hypothesisShifted = hypothesisShiftedRaw !== undefined ? String(hypothesisShiftedRaw).toLowerCase() === 'true' : null;

  // Enforce tool probe invariant: subagent must record a real tool execution
  if (!probeTool || !probeFinding) {
    emitDiagnostic({
      code: 'EMPIRICAL_PROBE_MISSING',
      machine: state.active_machine,
      state: state.current_state,
      targetW: state.epistemic_context.target_w,
      challengerW: state.epistemic_context.challenger_w,
      reason: 'Subagent audit submitted without an empirical tool probe. Simulated text monologues are forbidden.',
      remediation: 'Execute a real tool probe (grep_search, view_file, run_command) and provide probe tool and finding in payload.'
    });
    process.exit(1);
  }

  // ---------------------------------------------------------------------------
  // Structural Round Protocol Invariants
  // ---------------------------------------------------------------------------
  if (state.current_state === 'AWAITING_LLM_RESPONSE') {
    emitDiagnostic({
      code: 'ROUND_PROTOCOL_VIOLATION',
      machine: state.active_machine,
      state: state.current_state,
      reason: 'Subagent cannot record an audit while awaiting target LLM response in Round 2.',
      remediation: 'Target LLM must first respond via `record-llm-response`.'
    });
    process.exit(1);
  }

  if (state.current_state === 'AWAITING_SUBAGENT_DISPATCH') {
    // Round 1 (Initial Challenge / Refutation):
    // SUPPORTED is strictly prohibited in Round 1 before challenge confrontation and dialectic synthesis.
    if (conclusionStatus === 'SUPPORTED') {
      emitDiagnostic({
        code: 'ROUND_PROTOCOL_VIOLATION',
        machine: state.active_machine,
        state: state.current_state,
        reason: 'Subagent cannot declare conclusion SUPPORTED in Round 1 before challenge confrontation and dialectic synthesis.',
        remediation: 'In Round 1, challenger must issue challenge via `conclusion_status: "CHALLENGED"` or fatal refutation via `"REJECTED"`.'
      });
      process.exit(1);
    }

    if (conclusionStatus === 'CHALLENGED') {
      state.current_state = 'AWAITING_LLM_RESPONSE';
      state.canonical_state = 'S_A4_ROUND_2_PROPOSER_CONFRONTATION';
      state.conclusion_status = 'CHALLENGED';
      state.premise_status = premiseStatus || 'UNTESTED';
      state.inference_status = inferenceStatus || 'INVALID_LEAP';
      state.contrastive_rule = rule;
      state.tally = state.tally || { proposer: null, challenger: null, premises: { agree: 0, disagree: 0, uncertain: 0 }, solution: { agree: 0, disagree: 0, uncertain: 0 } };
      state.tally.challenger = 'UNCERTAIN';
      state.tally.premises = { agree: 0, disagree: 0, uncertain: 1 };
    } else if (conclusionStatus === 'REJECTED') {
      state.current_state = 'SUBAGENT_AUDIT_LOGGED';
      state.canonical_state = 'S_A6_REJECTION';
      state.conclusion_status = 'REJECTED';
      state.premise_status = premiseStatus || 'FALSIFIED';
      state.inference_status = inferenceStatus || 'INVALID_LEAP';
      state.contrastive_rule = rule;
      state.subagent_signoff = false;
      state.tally = state.tally || { proposer: null, challenger: null, premises: { agree: 0, disagree: 0, uncertain: 0 }, solution: { agree: 0, disagree: 0, uncertain: 0 } };
      state.tally.challenger = 'DISAGREE';
      state.tally.premises = { agree: 0, disagree: 1, uncertain: 0 };
    } else {
      emitDiagnostic({
        code: 'INVALID_STATUS',
        reason: `In Round 1, conclusion_status must be 'CHALLENGED' or 'REJECTED'. Received: '${conclusionStatus}'`,
        remediation: 'Specify `conclusion_status: "CHALLENGED"` (to prompt counter-hypothesis) or `"REJECTED"`.'
      });
      process.exit(1);
    }
  } else if (state.current_state === 'AWAITING_SUBAGENT_EVAL') {
    // Evaluate structural S_LLM if parameters provided (Round 2)
    if (unearnedConcessions !== null || totalConcessions !== null || unexaminedCounter !== null || totalCounter !== null || hypothesisShifted !== null) {
      const sSyco = (totalConcessions && totalConcessions > 0) ? (Number(unearnedConcessions || 0) / totalConcessions) : 0.0;
      const sConf = (totalCounter && totalCounter > 0) ? (Number(unexaminedCounter || 0) / totalCounter) : 0.0;
      const fEinstellung = hypothesisShifted === false ? 1 : 0;
      let risk = 'LOW';
      if (fEinstellung === 1 || sSyco >= 0.5 || sConf >= 0.5) {
        risk = 'HIGH';
      } else if (sSyco > 0 || sConf > 0) {
        risk = 'MODERATE';
      }

      state.epistemic_context.s_llm = {
        s_syco: sSyco,
        s_conf: sConf,
        f_einstellung: fEinstellung,
        risk_level: risk,
        unearned_concessions: unearnedConcessions,
        total_concessions: totalConcessions,
        unexamined_counter_evidence: unexaminedCounter,
        total_counter_evidence: totalCounter,
        hypothesis_shifted: hypothesisShifted,
        evaluated_at: new Date().toISOString()
      };
    }

    // Round 2 (Evaluation of Proposer's Synthesized C'):
    if (conclusionStatus === 'SUPPORTED') {
      state.current_state = 'SUBAGENT_SIGNED_OFF';
      state.canonical_state = 'S_A7_CONCORDANCE_SIGN_OFF';
      state.conclusion_status = 'SUPPORTED';
      state.premise_status = premiseStatus || 'CONFIRMED';
      state.inference_status = inferenceStatus || 'VALID';
      state.contrastive_rule = rule;
      state.subagent_signoff = true; // Auto-signoff on verified synthesis
      state.tally = state.tally || { proposer: null, challenger: null, premises: { agree: 0, disagree: 0, uncertain: 0 }, solution: { agree: 0, disagree: 0, uncertain: 0 } };
      state.tally.proposer = 'AGREE';
      state.tally.challenger = 'AGREE';
      state.tally.solution = { agree: 2, disagree: 0, uncertain: 0 };
    } else if (conclusionStatus === 'REJECTED') {
      state.current_state = 'SUBAGENT_AUDIT_LOGGED';
      state.canonical_state = 'S_A6_REJECTION';
      state.conclusion_status = 'REJECTED';
      state.premise_status = premiseStatus || 'FALSIFIED';
      state.inference_status = inferenceStatus || 'INVALID_LEAP';
      state.contrastive_rule = rule;
      state.subagent_signoff = false;
      state.tally = state.tally || { proposer: null, challenger: null, premises: { agree: 0, disagree: 0, uncertain: 0 }, solution: { agree: 0, disagree: 0, uncertain: 0 } };
      state.tally.proposer = 'AGREE';
      state.tally.challenger = 'DISAGREE';
      state.tally.solution = { agree: 1, disagree: 1, uncertain: 0 };
    } else {
      emitDiagnostic({
        code: 'INVALID_STATUS',
        reason: `In Round 2, conclusion_status must be 'SUPPORTED' or 'REJECTED'. Received: '${conclusionStatus}'`,
        remediation: 'Specify `conclusion_status: "SUPPORTED"` (if C\' resolves probe findings) or `"REJECTED"`.'
      });
      process.exit(1);
    }
  }

  state.subagent_called = true;
  state.updated_at = new Date().toISOString();
  state.probes_executed.push({
    round: state.probes_executed.length + 1,
    tool: probeTool,
    finding: probeFinding,
    timestamp: new Date().toISOString()
  });

  saveState(state);

  console.log(`[GRILL-STATE] Subagent audit recorded successfully.`);
  console.log(`[GRILL-STATE] State: ${state.current_state} | Conclusion: ${state.conclusion_status} | Premise: ${state.premise_status} | Inference: ${state.inference_status}`);
  console.log(`[GRILL-STATE] Empirical Probe: [${probeTool}] ${probeFinding}`);
  if (state.epistemic_context?.s_llm) {
    const s = state.epistemic_context.s_llm;
    console.log(`[GRILL-STATE] Evaluated S_LLM: Risk=${s.risk_level} | S_syco=${s.s_syco.toFixed(2)} | S_conf=${s.s_conf.toFixed(2)} | F_einstellung=${s.f_einstellung}`);
  }
}

export function cmdRecordLlmResponse(args) {
  const state = loadState();
  if (!state) {
    emitDiagnostic({
      code: 'NO_ACTIVE_SESSION',
      reason: 'Attempted to record LLM response without an active session.',
      remediation: 'Initialize session first via `node scripts/grill-state.mjs init --machine autonomous ...`'
    });
    process.exit(1);
  }

  if (state.active_machine !== 'AUTONOMOUS_DMAD') {
    emitDiagnostic({
      code: 'INVALID_MACHINE_OPERATION',
      machine: state.active_machine,
      reason: 'LLM responses can only be recorded on AUTONOMOUS_DMAD machine.',
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
      reason: `Submitted invalid or mismatched dispatch token: '${token}'. Expected: '${state.dispatch_token}'.`,
      remediation: 'Provide matching session dispatch token.'
    });
    process.exit(1);
  }

  if (state.current_state !== 'AWAITING_LLM_RESPONSE') {
    emitDiagnostic({
      code: 'UNEXPECTED_STATE_TRANSITION',
      machine: state.active_machine,
      state: state.current_state,
      reason: `Cannot record LLM response when current state is '${state.current_state}'. Expected: 'AWAITING_LLM_RESPONSE'.`,
      remediation: 'Subagent must issue a challenge before target LLM records response.'
    });
    process.exit(1);
  }

  let payload = {};
  if (args.payload) {
    try {
      payload = JSON.parse(args.payload);
    } catch (err) {
      emitDiagnostic({
        code: 'INVALID_PAYLOAD_JSON',
        reason: `Could not parse --payload JSON: ${err.message}`,
        remediation: 'Provide valid JSON: `{"type":"counter|concede","response":"..."}`.'
      });
      process.exit(1);
    }
  }

  const type = (payload.type || getArgStr(args, 'type')).toLowerCase();
  const response = payload.response || getArgStr(args, 'response');

  if (type !== 'counter' && type !== 'concede') {
    emitDiagnostic({
      code: 'INVALID_RESPONSE_TYPE',
      reason: `LLM response type must be 'counter' or 'concede'. Received: '${type}'`,
      remediation: 'Specify `type: "counter"` (with synthesized C\') or `type: "concede"`.'
    });
    process.exit(1);
  }

  if (!response) {
    emitDiagnostic({
      code: 'EMPTY_RESPONSE_PAYLOAD',
      reason: 'LLM response text cannot be empty.',
      remediation: 'Provide `response: "<explanation or synthesized C\'>"`.'
    });
    process.exit(1);
  }

  if (type === 'concede') {
    state.current_state = 'LLM_CONCEDED';
    state.canonical_state = 'S_A6_REJECTION';
    state.conclusion_status = 'REJECTED';
    state.premise_status = 'FALSIFIED';
    state.tally = state.tally || { proposer: null, challenger: null, premises: { agree: 0, disagree: 0, uncertain: 0 }, solution: { agree: 0, disagree: 0, uncertain: 0 } };
    state.tally.proposer = 'DISAGREE';
  } else {
    state.current_state = 'AWAITING_SUBAGENT_EVAL';
    state.canonical_state = 'S_A5_SUBAGENT_EVAL';
    state.tally = state.tally || { proposer: null, challenger: null, premises: { agree: 0, disagree: 0, uncertain: 0 }, solution: { agree: 0, disagree: 0, uncertain: 0 } };
    state.tally.proposer = 'AGREE';
  }

  state.turn_count += 1;
  state.llm_response = {
    type,
    response,
    timestamp: new Date().toISOString()
  };
  state.updated_at = new Date().toISOString();

  saveState(state);
  console.log(`[GRILL-STATE] Recorded LLM response (${type.toUpperCase()}). Next state: ${state.current_state}`);
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
  const empiricalCounter = args['empirical-counter'] !== undefined ? String(args['empirical-counter']).toLowerCase() === 'true' : false;
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

  sHuman.empirical_counter = empiricalCounter;
  state.empirical_counter = empiricalCounter;
  if (choice) state.last_choice = choice;
  state.canonical_state = 'S_U4_EVAL_COUNTER';

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
      reason: `Human user has held their position for ${sHuman.consecutive_stagnant_turns} consecutive rounds without introducing new empirical constraints or evidence.`,
      remediation: 'Model MUST emit diagnostic query. Run `record-diagnostic-ack` once user responds.'
    });
    process.exit(1);
  }

  state.current_state = 'USER_TURN_RECORDED';
  state.updated_at = new Date().toISOString();
  saveState(state);

  console.log(`[GRILL-STATE] Recorded user turn #${state.turn_count}. (New prop: ${hasNewProp}, Empirical counter: ${empiricalCounter}, Stagnant count: ${sHuman.consecutive_stagnant_turns})`);
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

export function cmdAddLogic(args) {
  const prompt = getArgStr(args, 'prompt') || getArgStr(args, 'input');
  const premisesStr = getArgStr(args, 'premises');
  const conclusion = getArgStr(args, 'conclusion');

  if (!prompt || prompt.length < 5) {
    emitDiagnostic({
      code: 'INPUT_GATE_HALT',
      reason: 'add-logic requires a non-empty `--prompt "<text>"` (>= 5 chars).',
      remediation: 'Provide the architectural prompt to formulate. Example: `node scripts/grill-state.mjs add-logic --prompt "Deploy redis for caching"`'
    });
    process.exit(1);
  }

  let premises = [];
  if (premisesStr) {
    let cleanPremisesStr = premisesStr.trim();
    if ((cleanPremisesStr.startsWith("'") && cleanPremisesStr.endsWith("'")) ||
        (cleanPremisesStr.startsWith('"') && cleanPremisesStr.endsWith('"') && cleanPremisesStr.includes('['))) {
      cleanPremisesStr = cleanPremisesStr.slice(1, -1).trim();
    }
    try {
      premises = JSON.parse(cleanPremisesStr);
      if (!Array.isArray(premises)) premises = [cleanPremisesStr];
    } catch {
      if (cleanPremisesStr.startsWith('[') && cleanPremisesStr.endsWith(']')) {
        const inner = cleanPremisesStr.slice(1, -1).trim();
        premises = inner.split(',').map(s => s.trim().replace(/^['"]|['"]$/g, '')).filter(Boolean);
      } else {
        premises = [premisesStr];
      }
    }
  } else {
    premises = [prompt];
  }

  // Deduplication check against LOGICAL_LEDGER.md
  if (fs.existsSync(LEDGER_FILE)) {
    const ledgerContent = fs.readFileSync(LEDGER_FILE, 'utf8');
    const promptLower = prompt.toLowerCase();
    const lines = ledgerContent.split('\n');
    for (const line of lines) {
      if (line.includes('|') && !line.includes('| :---')) {
        const parts = line.split('|').map(p => p.trim());
        if (parts.length >= 4) {
          const argId = parts[1].replace(/[*_]/g, '');
          const existingP = parts[2].toLowerCase();
          if (existingP.includes(promptLower) || promptLower.includes(existingP.replace(/\*\*p\*:\s*/i, ''))) {
            console.warn(`[GRILL-STATE] Warning: Possible duplicate of ${argId} already in ledger.`);
          }
        }
      }
    }
  }

  let nextIdNum = 1;
  let ledgerContent = '';
  if (fs.existsSync(LEDGER_FILE)) {
    ledgerContent = fs.readFileSync(LEDGER_FILE, 'utf8');
    const argMatches = [...ledgerContent.matchAll(/\*\*ARG-(\d+)\*\*/g)];
    if (argMatches.length > 0) {
      nextIdNum = Math.max(...argMatches.map(m => parseInt(m[1], 10))) + 1;
    }
  }
  const argId = `ARG-${String(nextIdNum).padStart(2, '0')}`;

  const cleanP = premises.map((p, idx) => typeof p === 'object' ? `**P${idx+1}**: ${p.statement || JSON.stringify(p)}` : `**P${idx+1}**: ${p}`).join('<br>');
  const cleanC = conclusion ? `**C**: ${conclusion}` : `**C**: ${prompt}`;

  const row = `| **${argId}** | ${cleanP} | ${cleanC} | **FORMULATED** | **Interpretation Gate** (Human ↔ LLM baseline confirmed) | Baseline registered. Awaiting validation & challenge. |`;

  // Append row right after active decision table header if table exists
  if (ledgerContent.includes('| :--- | :--- | :--- | :--- | :--- | :--- |')) {
    const tableHeaderIndex = ledgerContent.indexOf('| :--- | :--- | :--- | :--- | :--- | :--- |');
    const insertPos = tableHeaderIndex + '| :--- | :--- | :--- | :--- | :--- | :--- |'.length;
    const updatedLedger = ledgerContent.slice(0, insertPos) + '\n' + row + ledgerContent.slice(insertPos);
    fs.writeFileSync(LEDGER_FILE, updatedLedger, 'utf8');
  }

  const activeMachine = (getArgStr(args, 'machine') || '').toUpperCase() === 'AUTONOMOUS' ? 'AUTONOMOUS_DMAD' : 'HUMAN_HITL';
  const canonicalState = activeMachine === 'AUTONOMOUS_DMAD' ? 'S_A0B_ADD_LOGIC' : 'S_U0B_ADD_LOGIC';

  const state = {
    version: '2.2.0',
    arg_id: argId,
    active_machine: activeMachine,
    canonical_state: canonicalState,
    current_state: canonicalState,
    source_prompt: prompt,
    premises,
    conclusion: conclusion || prompt,
    tally: {
      proposer: null,
      challenger: null,
      premises: { agree: 0, disagree: 0, uncertain: 0 },
      solution: { agree: 0, disagree: 0, uncertain: 0 }
    },
    validation: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    turn_count: 0
  };

  saveState(state);
  console.log(`[GRILL-STATE] Baseline logic formulated: ${argId} committed as FORMULATED.`);
  console.log(`[GRILL-STATE] Canonical State: ${canonicalState}. Tally initialized unassessed (0 votes cast). Ready for validation.`);
}

export function cmdValidateNeSy(args) {
  let payloadStr = args.payload;
  if (!payloadStr) {
    emitDiagnostic({
      code: 'MALFORMED_VALIDATION_INPUT',
      reason: 'validate-nesy requires `--payload \'<JSON>\'`.',
      remediation: 'Provide JSON payload containing expressions and dependencies.'
    });
    process.exit(1);
  }

  let facts = {};
  if (args.facts) {
    try {
      facts = JSON.parse(args.facts);
    } catch {
      facts = {};
    }
  } else {
    // Default baseline facts from active ledger or environment
    facts = {
      os_platform: process.platform,
      arch: process.arch
    };
  }

  const result = evaluateNeSyState(payloadStr, facts);

  const state = loadState();
  if (state) {
    state.validation = {
      result: result.outcome,
      notes: result.diagnostic,
      timestamp: new Date().toISOString()
    };
    if (result.outcome === 'valid') {
      state.canonical_state = state.active_machine === 'AUTONOMOUS_DMAD' ? 'S_A1_TOKEN_ISSUE' : 'S_U2_CHALLENGE';
    }
    saveState(state);
  }

  if (result.outcome === 'formally_invalid') {
    emitDiagnostic({
      code: 'FORMALLY_INVALID',
      reason: result.diagnostic,
      remediation: 'Argument is formally invalid. Triggering immediate auto-refutation.'
    });
    process.exit(1);
  }

  if (result.outcome === 'inconsistent_premises') {
    emitDiagnostic({
      code: 'INCONSISTENT_PREMISES',
      reason: result.diagnostic,
      remediation: 'Circular premise dependency detected. Return to /add-logic to repair.'
    });
    process.exit(1);
  }

  if (result.outcome === 'malformed') {
    emitDiagnostic({
      code: 'MALFORMED_REPRESENTATION',
      reason: result.diagnostic,
      remediation: 'JSON / expression syntax is malformed. Reformulate and re-run.'
    });
    process.exit(1);
  }

  if (result.outcome === 'unsupported_expression') {
    console.warn(`[GRILL-STATE] Validation warning (unsupported_expression): ${result.diagnostic}`);
    console.log(JSON.stringify(result, null, 2));
    return;
  }

  if (result.outcome === 'undecidable') {
    console.log(`[GRILL-STATE] Validation result: UNDECIDABLE (marked UNCERTAIN for empirical probe).`);
    console.log(JSON.stringify(result, null, 2));
    return;
  }

  console.log(`[GRILL-STATE] NeSy Validation PASS: ${result.diagnostic}`);
  console.log(JSON.stringify(result, null, 2));
}

export function cmdRecordProceduralAdvance(args) {
  const state = loadState();
  if (!state) {
    emitDiagnostic({
      code: 'NO_ACTIVE_SESSION',
      reason: 'Attempted procedural advance without an active session.',
      remediation: 'Initialize session first via `grill-state init` or `add-logic`.'
    });
    process.exit(1);
  }

  const token = getArgStr(args, 'token');
  if (state.dispatch_token && (!token || token !== state.dispatch_token)) {
    emitDiagnostic({
      code: 'DISPATCH_TOKEN_MISMATCH',
      reason: `Mismatched dispatch token: '${token}'. Expected: '${state.dispatch_token}'.`,
      remediation: 'Provide matching session dispatch token.'
    });
    process.exit(1);
  }

  // If a fatal refutation is active, cannot procedurally advance without counter-proof
  if (state.conclusion_status === 'REJECTED' && state.premise_status === 'FALSIFIED') {
    emitDiagnostic({
      code: 'EMPIRICAL_COUNTER_ACTIVE',
      reason: 'Cannot procedurally advance while an empirical refutation (REJECTED) remains active.',
      remediation: 'Address the open empirical probe finding or concede.'
    });
    process.exit(1);
  }

  state.tally = state.tally || {
    proposer: 'AGREE',
    challenger: 'UNOBJECTED',
    premises: { agree: 1, disagree: 0, uncertain: 0 },
    solution: { agree: 1, disagree: 0, uncertain: 0 }
  };
  state.tally.proposer = 'AGREE';
  state.tally.challenger = 'UNOBJECTED';
  state.tally.solution = { agree: 1, disagree: 0, uncertain: 0 };
  state.procedural_clearance = true;

  state.canonical_state = 'S_A7_CONCORDANCE_SIGN_OFF';
  state.current_state = 'SUBAGENT_SIGNED_OFF';
  state.conclusion_status = 'SUPPORTED';
  state.subagent_signoff = true;
  state.updated_at = new Date().toISOString();

  saveState(state);
  console.log('[GRILL-STATE] Procedural advance recorded: No empirical counter on table.');
  console.log(`[GRILL-STATE] Canonical State: S_A7_CONCORDANCE_SIGN_OFF. Challenger: UNOBJECTED (procedural clearance).`);
}

export function cmdSignoffSubagent(args) {
  const state = loadState();
  if (!state) {
    emitDiagnostic({
      code: 'NO_ACTIVE_SESSION',
      reason: 'Attempted to sign off subagent without an active session.',
      remediation: 'Initialize session first via `node scripts/grill-state.mjs init --machine autonomous ...`'
    });
    process.exit(1);
  }

  if (state.active_machine !== 'AUTONOMOUS_DMAD') {
    emitDiagnostic({
      code: 'INVALID_MACHINE_OPERATION',
      machine: state.active_machine,
      state: state.current_state,
      reason: 'Subagent sign-off can only be recorded on AUTONOMOUS_DMAD machine.',
      remediation: 'Subagent sign-off is only applicable in autonomous DMAD mode.'
    });
    process.exit(1);
  }

  const token = getArgStr(args, 'token');
  if (state.dispatch_token && (!token || token !== state.dispatch_token)) {
    emitDiagnostic({
      code: 'DISPATCH_TOKEN_MISMATCH',
      machine: state.active_machine,
      state: state.current_state,
      targetW: state.epistemic_context.target_w,
      challengerW: state.epistemic_context.challenger_w,
      reason: `Subagent sign-off submitted with invalid or mismatched dispatch token: '${token}'. Expected: '${state.dispatch_token}'.`,
      remediation: 'Provide matching session dispatch token.'
    });
    process.exit(1);
  }

  if (state.conclusion_status === 'REJECTED') {
    emitDiagnostic({
      code: 'EMPIRICAL_COUNTER_ACTIVE',
      machine: state.active_machine,
      state: state.current_state,
      reason: 'Cannot sign off subagent while an active REJECTED status remains in state.',
      remediation: 'Subagent must evaluate synthesized C\' as SUPPORTED before signing off.'
    });
    process.exit(1);
  }

  state.subagent_signoff = true;
  state.current_state = 'SUBAGENT_SIGNED_OFF';
  state.canonical_state = 'S_A7_CONCORDANCE_SIGN_OFF';
  state.conclusion_status = 'SUPPORTED';
  state.tally = state.tally || { proposer: null, challenger: null, premises: { agree: 0, disagree: 0, uncertain: 0 }, solution: { agree: 0, disagree: 0, uncertain: 0 } };
  state.tally.proposer = 'AGREE';
  state.tally.challenger = 'AGREE';
  state.tally.solution = { agree: 2, disagree: 0, uncertain: 0 };
  state.updated_at = new Date().toISOString();

  saveState(state);
  console.log('[GRILL-STATE] Subagent sign-off recorded successfully.');
  console.log('[GRILL-STATE] State: SUBAGENT_SIGNED_OFF | Canonical State: S_A7_CONCORDANCE_SIGN_OFF');
}

export function cmdCheckGate(args) {
  const proposal = getArgStr(args, 'proposal');
  if (!proposal) {
    emitDiagnostic({
      code: 'INPUT_GATE_HALT',
      reason: 'check-gate requires `--proposal "<text>"` to audit.',
      remediation: 'Pass the architectural proposal to audit.'
    });
    process.exit(1);
  }

  // Run Deterministic Invariant Solver
  const solverResult = solveConstraints(proposal);
  if (!solverResult.satisfied) {
    const v = solverResult.violations[0];
    emitDiagnostic({
      code: v.rule_id.startsWith('SYS-') ? 'INVARIANT_SOLVER_VIOLATION' : 'EPISTEMIC_FIREWALL_VIOLATION',
      reason: `Deterministic Invariant Solver detected violation [${v.rule_id}]: "${v.reason}". Boundary: "${v.boundary}".`,
      remediation: `Halt execution immediately. Reject proposal or cite rule ${v.rule_id} to user and adopt supported alternative.`
    });
    process.exit(1);
  }

  console.log('[GRILL-STATE] Pre-flight firewall & invariant check PASS. No violations found.');
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

  const VALID_STATUSES = [
    'FORMULATED',
    'SUPPORTED',
    'REJECTED',
    'UNCERTAIN',
    'TENTATIVE_SOLUTION',
    'ACCEPTED_SOLUTION',
    'SUPERSEDED'
  ];

  if (!VALID_STATUSES.includes(status)) {
    emitDiagnostic({
      code: 'INVALID_STATUS',
      reason: `Status must be one of [${VALID_STATUSES.join(', ')}]. Received: '${status}'`,
      remediation: `Provide --status with a valid status: ${VALID_STATUSES.join('|')}.`
    });
    process.exit(1);
  }

  // Fail-Closed Epistemic Guards:
  if (state.active_machine === 'AUTONOMOUS_DMAD') {
    if (state.current_state === 'AWAITING_LLM_RESPONSE') {
      emitDiagnostic({
        code: 'CHALLENGE_UNADDRESSED',
        machine: state.active_machine,
        state: state.current_state,
        reason: 'Cannot commit ledger while a subagent challenge is awaiting target LLM response.',
        remediation: 'Target LLM must respond via `record-llm-response`.'
      });
      process.exit(1);
    }
    if (state.current_state === 'AWAITING_SUBAGENT_EVAL') {
      emitDiagnostic({
        code: 'EVALUATION_PENDING',
        machine: state.active_machine,
        state: state.current_state,
        reason: 'Cannot commit ledger while subagent evaluation of LLM response is pending.',
        remediation: 'Subagent must evaluate LLM response via `record-subagent-audit`.'
      });
      process.exit(1);
    }

    const isFormallyInvalid = state.validation?.result === 'formally_invalid';
    if ((!state.probes_executed || state.probes_executed.length === 0) && !(status === 'REJECTED' && isFormallyInvalid)) {
      emitDiagnostic({
        code: 'EMPIRICAL_PROBE_MISSING',
        machine: state.active_machine,
        state: state.current_state,
        reason: 'Cannot commit autonomous audit without at least one empirical tool probe execution.',
        remediation: 'Run a real tool probe (grep_search, run_command, view_file) and record it before committing.'
      });
      process.exit(1);
    }

    // Asymmetric Override Guard: LLM (W=0.2) cannot commit SUPPORTED / ACCEPTED_SOLUTION if subagent rejected
    if ((status === 'SUPPORTED' || status === 'ACCEPTED_SOLUTION') && state.conclusion_status === 'REJECTED') {
      emitDiagnostic({
        code: 'ASYMMETRIC_OVERRIDE_FORBIDDEN',
        machine: state.active_machine,
        state: state.current_state,
        targetW: state.epistemic_context.target_w,
        challengerW: state.epistemic_context.challenger_w,
        reason: 'Target W_LLM (0.2) attempted to mark proposal SUPPORTED over Challenger rejection without empirical counter-proof.',
        remediation: 'Either accept the subagent REJECTED verdict or provide a falsification counter-probe.'
      });
      process.exit(1);
    }

    // Subagent Signoff Guard: Cannot commit SUPPORTED / ACCEPTED_SOLUTION without subagent signoff
    if ((status === 'SUPPORTED' || status === 'ACCEPTED_SOLUTION') && !state.subagent_signoff) {
      emitDiagnostic({
        code: 'SIGNOFF_TOKEN_MISSING',
        machine: state.active_machine,
        state: state.current_state,
        reason: 'Cannot commit SUPPORTED or ACCEPTED_SOLUTION status without explicit subagent sign-off in state.',
        remediation: 'Subagent must submit conclusion_status: "SUPPORTED" in Round 2.'
      });
      process.exit(1);
    }
  } else if (state.active_machine === 'HUMAN_HITL') {
    if (state.epistemic_context && state.epistemic_context.s_human && state.epistemic_context.s_human.diagnostic_required) {
      emitDiagnostic({
        code: 'HUMAN_STAGNATION_ALERT',
        machine: state.active_machine,
        state: state.current_state,
        reason: 'Cannot commit while a human stagnation diagnostic is pending acknowledgment.',
        remediation: 'Surface diagnostic alert to user and call `record-diagnostic-ack` once answered.'
      });
      process.exit(1);
    }

    // Empirical-Counter Guard: Human mode REJECTED requires an empirical counter or formal solver proof (Spec §4.3)
    if (status === 'REJECTED' && !state.empirical_counter && state.validation?.result !== 'formally_invalid') {
      emitDiagnostic({
        code: 'EMPIRICAL_COUNTER_REQUIRED',
        machine: state.active_machine,
        state: state.current_state,
        targetW: state.epistemic_context?.target_w,
        challengerW: state.epistemic_context?.challenger_w,
        reason: 'Cannot commit REJECTED in Human HITL mode without an empirical counter or formal invalidity proof (Spec §4.3).',
        remediation: 'Record an empirical counter via `record-user-turn --empirical-counter true` or run formal validation.'
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
  let argId = state.arg_id;
  if (!argId) {
    const argMatches = [...ledgerContent.matchAll(/\*\*ARG-(\d+)\*\*/g)];
    const nextIdNum = argMatches.length > 0 ? Math.max(...argMatches.map(m => parseInt(m[1], 10))) + 1 : 1;
    argId = `ARG-${String(nextIdNum).padStart(2, '0')}`;
  }

  const inputPrompt = state.source_prompt || state.input_text || '';
  const cleanInput = inputPrompt.replace(/\|/g, '\\|').replace(/\n/g, ' ');
  const cleanRule = rule.replace(/\|/g, '\\|').replace(/\n/g, '<br>');
  const probeSummary = state.probes_executed ? state.probes_executed.map(p => `[${p.tool}]: ${p.finding}`).join('; ') : '';

  const isAuto = state.active_machine === 'AUTONOMOUS_DMAD';
  const conclusionText = state.conclusion || (isAuto ? 'Implement proposal' : 'Aligned architecture');
  const cleanConclusion = conclusionText.replace(/\|/g, '\\|').replace(/\n/g, ' ');

  const isFormallyInvalid = state.validation?.result === 'formally_invalid';
  const auditEvidence = isFormallyInvalid && (!state.probes_executed || state.probes_executed.length === 0)
    ? `**Deterministic Solver**: Formally invalid (${state.validation?.notes || 'Invariant failed'})`
    : (isAuto
        ? `**Subagent Challenger (W_subagent=0.8)**: ${probeSummary || 'Standard evaluation'}`
        : `**Human HITL (W_human=1.0)**: Decision tree aligned`);

  let statusDisplay = `**${status}**`;
  if (status === 'REJECTED') {
    if (state.premise_status === 'FALSIFIED') {
      statusDisplay = `**REJECTED**<br>*(False Axiom)*`;
    } else if (state.inference_status === 'INVALID_LEAP') {
      statusDisplay = `**REJECTED**<br>*(Invalid Leap)*`;
    }
  }

  const cleanPremises = state.premises && state.premises.length > 0
    ? state.premises.map((p, idx) => typeof p === 'object' ? `**P${idx+1}**: ${p.statement || JSON.stringify(p)}` : `**P${idx+1}**: ${p}`).join('<br>')
    : `**P**: ${cleanInput}`;

  const row = `| **${argId}** | ${cleanPremises} | **C**: ${cleanConclusion} | ${statusDisplay} | ${auditEvidence} | ${cleanRule || 'Verified'} |`;

  let updatedLedger;
  const rowRegex = new RegExp(`\\|\\s*\\*\\*${argId}\\*\\*\\s*\\|[^\\n]*`, 'g');
  if (rowRegex.test(ledgerContent)) {
    updatedLedger = ledgerContent.replace(rowRegex, row);
  } else {
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
    updatedLedger = ledgerContent.slice(0, insertPos) + '\n' + row + ledgerContent.slice(insertPos);
  }

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
      if (i + 1 < args.length && !args[i + 1].startsWith('--')) {
        let val = String(args[++i]);
        // Handle shells (like Windows cmd.exe) that do not preserve single quotes or split JSON on spaces
        const needsJoin = (
          (val.startsWith("'") && !val.endsWith("'")) ||
          (val.startsWith('"') && !val.endsWith('"')) ||
          (val.startsWith('[') && !val.endsWith(']')) ||
          (val.startsWith('{') && !val.endsWith('}')) ||
          (val.startsWith("'[") && !val.endsWith("]'")) ||
          (val.startsWith("'{") && !val.endsWith("}'")) ||
          (val.startsWith('"[') && !val.endsWith(']"')) ||
          (val.startsWith('"{') && !val.endsWith('}"'))
        );
        if (needsJoin) {
          while (i + 1 < args.length && !args[i + 1].startsWith('--')) {
            val += ' ' + args[++i];
            if (
              (val.startsWith("'") && val.endsWith("'")) ||
              (val.startsWith('"') && val.endsWith('"')) ||
              (val.startsWith('[') && val.endsWith(']')) ||
              (val.startsWith('{') && val.endsWith('}')) ||
              (val.startsWith("'[") && val.endsWith("]'")) ||
              (val.startsWith("'{") && val.endsWith("}'")) ||
              (val.startsWith('"[') && val.endsWith(']"')) ||
              (val.startsWith('"{') && val.endsWith('}"'))
            ) {
              break;
            }
          }
        }
        parsed[key] = val;
      } else {
        parsed[key] = true;
      }
    }
  }
  return parsed;
}


const isMain = process.argv[1] && (
  process.argv[1].endsWith('grill-state.mjs') || 
  process.argv[1].endsWith('grill-state')
);

if (isMain) {
  const action = process.argv[2];
  const parsedArgs = parseArgs(process.argv.slice(3));

  switch (action) {
  case 'init':
    cmdInit(parsedArgs);
    break;
  case 'status':
    cmdStatus();
    break;
  case 'add-logic':
    cmdAddLogic(parsedArgs);
    break;
  case 'validate-nesy':
    cmdValidateNeSy(parsedArgs);
    break;
  case 'record-procedural-advance':
    cmdRecordProceduralAdvance(parsedArgs);
    break;
  case 'record-subagent-audit':
    cmdRecordSubagentAudit(parsedArgs);
    break;
  case 'record-llm-response':
    cmdRecordLlmResponse(parsedArgs);
    break;
  case 'record-user-turn':
    cmdRecordUserTurn(parsedArgs);
    break;
  case 'record-diagnostic-ack':
    cmdRecordDiagnosticAck();
    break;
  case 'signoff-subagent':
    cmdSignoffSubagent(parsedArgs);
    break;
  case 'check-gate':
  case 'solve-bounds':
    cmdCheckGate(parsedArgs);
    break;
  case 'commit':
    cmdCommit(parsedArgs);
    break;
  default:
    console.log(`Grill-State CLI:
  init                       --machine <autonomous|human> --input "<text>"
  status
  add-logic                  --prompt "<text>" [--premises '<JSON>'] [--conclusion "<text>"]
  validate-nesy              --payload '<JSON>' [--facts '<JSON>']
  record-procedural-advance  --token <tok>
  record-subagent-audit      --token <tok> --payload '<JSON>'
  record-llm-response        --token <tok> --payload '<JSON>'
  record-user-turn           --new-prop <true|false> [--choice "<text>"]
  record-diagnostic-ack
  signoff-subagent           --token <tok>
  check-gate                 --proposal "<text>"
  commit                     --status <SUPPORTED|REJECTED|ACCEPTED_SOLUTION> [--rule "<rule>"]
`);
    break;
  }
}

