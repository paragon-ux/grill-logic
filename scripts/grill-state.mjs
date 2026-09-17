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
}, options = {}) {
  const border = '═'.repeat(78);
  const divider = '─'.repeat(78);
  const suppress = options.suppressSessionMetadata || (state === 'UNKNOWN' && machine === 'UNKNOWN' && targetW === 'N/A');

  const headerLines = suppress ? [] : [
    `║ State:          ${state.padEnd(59)} ║`,
    `║ Active Machine: ${machine.padEnd(59)} ║`,
    `║ Actor Context:  Target W=${String(targetW).padEnd(5)}, Challenger W=${String(challengerW).padEnd(33)} ║`,
    `║ Skepticism:     Risk=${String(risk).padEnd(6)}, S_human=${String(sHuman).padEnd(39)} ║`,
    `╟${divider}╢`
  ];

  const output = [
    `╔${border}╗`,
    `║ ⛔ EPISTEMIC GATE HALT: ${code.padEnd(52)} ║`,
    `╠${border}╣`,
    ...headerLines,
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

function getArgBool(args, key, fallback = false) {
  const val = args[key];
  if (val === true || val === 'true') return true;
  if (val === false || val === 'false') return false;
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
// Pure Node.js Standard Library Vectorizer & Dynamic Cosine Similarity Engine
// (Zero External Dependencies, Domain-Agnostic, User Sovereignty W_human = 1.0)
// -----------------------------------------------------------------------------

export function tokenize(text) {
  if (!text || typeof text !== 'string') return [];
  const cleaned = text
    .replace(/[*_#`~|\\\[\]{}()<>:;,?!=/.]/g, ' ')
    .replace(/['"]/g, '');
  return cleaned
    .toLowerCase()
    .split(/\s+/)
    .filter(w => w.length >= 2); // Invariant: retain all tokens >= 2 chars (preserves S3, DB, IP, OS, CI, NFS, RPC, SQL, AWS, TLS)
}

export function escapeRegExp(string) {
  return String(string).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function extractFeatures(tokens) {
  const features = [];
  for (let i = 0; i < tokens.length; i++) {
    features.push(tokens[i]);
    if (i + 1 < tokens.length) {
      features.push(`${tokens[i]}_${tokens[i + 1]}`);
    }
  }
  return features;
}

export function vectorize(text, allowlist = null) {
  const tokens = tokenize(text);
  const rawFeatures = extractFeatures(tokens);
  const al = allowlist !== null ? allowlist : loadUserAllowlist();
  const exemptSet = (al && Array.isArray(al.exempt_terms) && al.exempt_terms.length > 0)
    ? new Set(al.exempt_terms.map(t => String(t).toLowerCase()))
    : null;

  const features = exemptSet
    ? rawFeatures.filter(f => {
        if (exemptSet.has(f)) return false;
        if (f.includes('_')) {
          const parts = f.split('_');
          if (parts.some(p => exemptSet.has(p))) return false;
        }
        return true;
      })
    : rawFeatures;

  const freq = new Map();
  for (const f of features) {
    freq.set(f, (freq.get(f) || 0) + 1);
  }
  const vec = new Map();
  for (const [term, count] of freq.entries()) {
    const lengthWeight = Math.min(1.5, 1.0 + (term.length > 5 ? 0.2 : 0) + (term.includes('_') ? 0.3 : 0));
    const sublinearTf = 1 + Math.log(count);
    vec.set(term, sublinearTf * lengthWeight);
  }
  return vec;
}

export function computeCosineSimilarity(vecA, vecB) {
  if (!vecA || !vecB || vecA.size === 0 || vecB.size === 0) return 0.0;
  let dotProduct = 0.0;
  let normASq = 0.0;
  let normBSq = 0.0;

  for (const [term, valA] of vecA.entries()) {
    normASq += valA * valA;
    const valB = vecB.get(term);
    if (valB !== undefined) {
      dotProduct += valA * valB;
    }
  }
  for (const valB of vecB.values()) {
    normBSq += valB * valB;
  }
  if (normASq === 0 || normBSq === 0) return 0.0;
  const sim = dotProduct / (Math.sqrt(normASq) * Math.sqrt(normBSq));
  return Math.min(1.0, Math.max(0.0, sim));
}

export function computeContainment(vecQuery, vecTarget) {
  if (!vecQuery || !vecTarget || vecQuery.size === 0) return 0.0;
  let matchedWeight = 0.0;
  let totalQueryWeight = 0.0;
  for (const [term, val] of vecQuery.entries()) {
    totalQueryWeight += val;
    if (vecTarget.has(term)) {
      matchedWeight += val;
    }
  }
  return totalQueryWeight > 0 ? matchedWeight / totalQueryWeight : 0.0;
}

const ALLOWLIST_FILE = path.join(STATE_DIR, 'allowlist.json');

function normalizeThreshold(val, defaultVal) {
  if (val === undefined || val === null) return defaultVal;
  const num = Number(val);
  if (!Number.isFinite(num)) return defaultVal;
  const normalized = num > 1.0 ? num / 100.0 : num;
  return Math.min(1.0, Math.max(0.01, normalized));
}

export function loadUserAllowlist() {
  if (fs.existsSync(ALLOWLIST_FILE)) {
    try {
      const data = JSON.parse(fs.readFileSync(ALLOWLIST_FILE, 'utf8'));
      const rawThresholds = (data.threshold_overrides && typeof data.threshold_overrides === 'object') ? data.threshold_overrides : {};
      const threshold_overrides = {};
      if (rawThresholds.firewall !== undefined) {
        threshold_overrides.firewall = normalizeThreshold(rawThresholds.firewall, 0.30);
      }
      if (rawThresholds.duplicate !== undefined) {
        threshold_overrides.duplicate = normalizeThreshold(rawThresholds.duplicate, 0.50);
      }

      return {
        exempt_terms: Array.isArray(data.exempt_terms)
          ? data.exempt_terms.flatMap(t => tokenize(String(t)))
          : [],
        exempt_rules: Array.isArray(data.exempt_rules)
          ? data.exempt_rules.map(r => String(r).toUpperCase())
          : [],
        threshold_overrides
      };
    } catch (err) {
      console.warn(`[GRILL-STATE] Warning: Could not parse ${ALLOWLIST_FILE}: ${err.message}`);
    }
  }
  return { exempt_terms: [], exempt_rules: [], threshold_overrides: {} };
}

// Built-in genesis physical system laws fallback (if LOGICAL_LEDGER.md is missing or unseeded)
const GENESIS_SYSTEM_INVARIANTS = [
  {
    rule_id: 'SYS-INV-01',
    boundary: 'POSIX fcntl byte-range locking over network storage',
    conclusion: 'Use SQLite with WAL mode over NFS for multi-instance shared database.',
    refuted: 'Shared SQLite database mounted over network filesystem NFS SMB CIFS. Multiple concurrent container worker processes read and write database. DO NOT use SQLite WAL mode over NFS SMB for concurrent multi-writer services.',
    alternative: 'Use a client-server database PostgreSQL or single-writer local NVMe storage.'
  },
  {
    rule_id: 'SYS-INV-02',
    boundary: 'OS Kernel Interface Compatibility',
    conclusion: 'Re-architect Windows network stack using Linux io_uring interface.',
    refuted: 'Windows NT application requires high-performance asynchronous zero-copy network I/O. io_uring is a Linux-specific kernel interface; Windows NT kernel does not implement io_uring syscalls. DO NOT deploy Linux io_uring architectures on Windows runtimes.',
    alternative: 'Use Windows I/O Completion Ports (IOCP) or cross-platform libuv.'
  },
  {
    rule_id: 'SYS-INV-03',
    boundary: 'Mobile Storage & Consistency Boundary',
    conclusion: 'Build offline-first mobile app mirroring all 120,000 catalog items with custom two-way sync engine.',
    refuted: 'Mobile food delivery app subway network dropouts. Full restaurant catalog contains 120000 items. 120k item JSON payload exceeds 100MB; restaurant inventory is volatile stockouts specials causing high checkout conflict rates. DO NOT mirror large volatile catalogs to mobile clients or build custom multi-master two-way sync.',
    alternative: 'Persist client-side draft carts locally and use idempotent HTTP retry queues.'
  }
];

export function scanLedgerSimilarity(proposalText, ledgerPath = LEDGER_FILE, options = {}) {
  const allowlist = options.allowlist || loadUserAllowlist();
  const results = {
    duplicate_flags: [],
    collision_flags: [],
    highest_similarity: 0.0
  };

  const proposalVec = vectorize(proposalText, allowlist);
  const tauFirewall = options.firewallThreshold ?? allowlist.threshold_overrides.firewall ?? 0.30;
  const tauDup = options.duplicateThreshold ?? allowlist.threshold_overrides.duplicate ?? 0.50;

  let scannedRuleIds = new Set();

  if (fs.existsSync(ledgerPath)) {
    const content = fs.readFileSync(ledgerPath, 'utf8');
    const lines = content.split('\n');

    for (const line of lines) {
      if (!line.includes('|') || line.includes('| :---')) continue;
      const parts = line.split(/(?<!\\)\|/).map(p => p.trim());
      if (parts.length < 7) continue;

      const argId = parts[1].replace(/[*_]/g, '').trim();
      if (!argId || argId.toLowerCase() === 'arg id') continue;
      if (allowlist.exempt_rules.includes(argId)) continue;
      scannedRuleIds.add(argId);

      const premisesRaw = parts[2].replace(/<br>/gi, ' ').replace(/[*_]/g, '');
      const conclusionRaw = parts[3].replace(/<br>/gi, ' ').replace(/[*_]/g, '').replace(/^c\s*:\s*/i, '');
      const statusRaw = parts[4].toUpperCase();
      const ruleCellRaw = parts[6];

      if (statusRaw.includes('REJECTED')) {
        // Falsified Boundary Normalization (ADR-0003):
        // Target space is strictly Clean(C_rejected) + Clean(R_refute_boundary).
        // Strip out any advisory alternative or derived action to eliminate schema contamination.
        const cleanRuleBoundary = ruleCellRaw
          .replace(/(?:<br>|\n|\s+)(?:\*\*)?(?:mandated alternative|derived action|alternative)(?:\*\*)?:.+$/i, '')
          .replace(/<br>/gi, ' ')
          .replace(/[*_]/g, '')
          .replace(/^(?:\*\*)?(?:contrastive refutation rule|contrastive rule)(?:\*\*)?:\s*/gi, '')
          .trim();

        const targetText = `${conclusionRaw} ${cleanRuleBoundary}`.trim();
        const targetVec = vectorize(targetText, allowlist);
        const conclusionVec = vectorize(conclusionRaw, allowlist);

        const simConc = computeCosineSimilarity(proposalVec, conclusionVec);
        const simTarget = computeCosineSimilarity(proposalVec, targetVec);
        const maxSim = Math.max(simConc, simTarget);

        // Count matched unigram features to gate directional containment
        let matchedUnigrams = 0;
        for (const token of proposalVec.keys()) {
          if (!token.includes('_') && targetVec.has(token)) {
            matchedUnigrams++;
          }
        }

        const contRefute = (maxSim >= 0.15 && matchedUnigrams >= 2) ? computeContainment(proposalVec, targetVec) : 0.0;
        const scoreReject = Math.max(maxSim, contRefute);

        if (scoreReject >= tauFirewall) {
          results.collision_flags.push({
            rule_id: argId,
            similarity: Number(scoreReject.toFixed(3)),
            boundary: `Active Contrastive Rule [${argId}]`,
            rule: parts[6],
            refuted_concept: conclusionRaw
          });
        }
        results.highest_similarity = Math.max(results.highest_similarity, scoreReject);
      } else {
        const activeText = `${conclusionRaw} ${premisesRaw}`;
        const activeVec = vectorize(activeText, allowlist);
        const conclusionVec = vectorize(conclusionRaw, allowlist);
        const simActive = computeCosineSimilarity(proposalVec, activeVec);
        const simConc = computeCosineSimilarity(proposalVec, conclusionVec);
        const scoreActive = Math.max(simActive, simConc);

        if (scoreActive >= tauDup) {
          results.duplicate_flags.push({
            arg_id: argId,
            similarity: Number(scoreActive.toFixed(3)),
            status: parts[4].replace(/[*_]/g, ''),
            conclusion: conclusionRaw
          });
        }
        results.highest_similarity = Math.max(results.highest_similarity, scoreActive);
      }
    }
  }

  // Check built-in fallback genesis invariants if not already covered in ledger
  for (const sys of GENESIS_SYSTEM_INVARIANTS) {
    if (scannedRuleIds.has(sys.rule_id) || allowlist.exempt_rules.includes(sys.rule_id)) continue;

    const targetText = `${sys.conclusion} ${sys.refuted}`.trim();
    const targetVec = vectorize(targetText, allowlist);
    const conclusionVec = vectorize(sys.conclusion, allowlist);

    const simConc = computeCosineSimilarity(proposalVec, conclusionVec);
    const simTarget = computeCosineSimilarity(proposalVec, targetVec);
    const maxSim = Math.max(simConc, simTarget);

    let matchedUnigrams = 0;
    for (const token of proposalVec.keys()) {
      if (!token.includes('_') && targetVec.has(token)) {
        matchedUnigrams++;
      }
    }

    const contRefute = (maxSim >= 0.15 && matchedUnigrams >= 2) ? computeContainment(proposalVec, targetVec) : 0.0;
    const scoreReject = Math.max(maxSim, contRefute);

    if (scoreReject >= tauFirewall) {
      const cleanConclusion = sys.conclusion.replace(/^Use\s+/i, '').replace(/\.$/, '');
      results.collision_flags.push({
        rule_id: sys.rule_id,
        similarity: Number(scoreReject.toFixed(3)),
        boundary: sys.boundary,
        rule: `DO NOT deploy ${cleanConclusion}. Mandated Alternative: ${sys.alternative}`,
        refuted_concept: sys.conclusion
      });
    }
    results.highest_similarity = Math.max(results.highest_similarity, scoreReject);
  }

  return results;
}

export function solveConstraints(inputText, ledgerPath = LEDGER_FILE, options = {}) {
  const scan = scanLedgerSimilarity(inputText, ledgerPath, options);
  const violations = scan.collision_flags.map(c => ({
    rule_id: c.rule_id,
    boundary: c.boundary,
    reason: c.rule,
    similarity: c.similarity
  }));

  return {
    satisfied: violations.length === 0,
    violations,
    duplicate_flags: scan.duplicate_flags,
    highest_similarity: scan.highest_similarity
  };
}

// -----------------------------------------------------------------------------
// CLI Commands
// -----------------------------------------------------------------------------
export function cmdInit(args) {
  if (args.help || args.h) {
    console.log(`Grill-State init:
  Initialize epistemic session for autonomous or human state machines.
  Usage: node scripts/grill-state.mjs init --machine <autonomous|human> --input "<text>"
  Aliases: --input, --prompt, --proposal
`);
    process.exit(0);
  }

  const machine = getArgStr(args, 'machine').toUpperCase();
  const input = getArgStr(args, 'input') || getArgStr(args, 'prompt') || getArgStr(args, 'proposal');

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
  const explicitArgId = getArgStr(args, 'arg-id');
  const isMatchingSession = existingState && (
    (explicitArgId && explicitArgId.toUpperCase() === existingState.arg_id?.toUpperCase()) ||
    existingState.source_prompt === input ||
    existingState.input_text === input ||
    (existingState.conclusion && existingState.conclusion === input)
  );
  const argId = explicitArgId || (isMatchingSession ? existingState?.arg_id : null);
  const validation = isMatchingSession ? existingState?.validation : null;
  const sourcePrompt = isMatchingSession ? (existingState?.source_prompt || input) : input;
  const premises = isMatchingSession ? existingState?.premises : null;
  const conclusion = isMatchingSession ? existingState?.conclusion : null;

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
      const sSyco = (totalConcessions && totalConcessions > 0) ? Math.min(1.0, Math.max(0.0, Number(unearnedConcessions || 0) / totalConcessions)) : 0.0;
      const sConf = (totalCounter && totalCounter > 0) ? Math.min(1.0, Math.max(0.0, Number(unexaminedCounter || 0) / totalCounter)) : 0.0;
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
  if (args.help || args.h) {
    console.log(`Grill-State add-logic:
  Interpretation gate formulating baseline premises and conclusions.
  Usage: node scripts/grill-state.mjs add-logic --prompt "<text>" [--premises '<JSON>'] [--conclusion "<text>"] [--arg-id <ID>] [--allow-duplicate true]
  Aliases: --prompt, --proposal, --input
`);
    process.exit(0);
  }

  const prompt = getArgStr(args, 'prompt') || getArgStr(args, 'proposal') || getArgStr(args, 'input');
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
        const matches = [...cleanPremisesStr.slice(1, -1).matchAll(/(?:["'])(.*?)(?:["'])(?:\s*,\s*|$)/g)];
        premises = matches.length > 0 ? matches.map(m => m[1].trim()) : cleanPremisesStr.slice(1, -1).split(',').map(s => s.trim().replace(/^['"]|['"]$/g, '')).filter(Boolean);
      } else {
        premises = [premisesStr];
      }
    }
  } else {
    premises = [prompt];
  }

  // Deduplication check against LOGICAL_LEDGER.md using scanLedgerSimilarity
  const scan = scanLedgerSimilarity(prompt, LEDGER_FILE);
  const allowDup = getArgBool(args, 'allow-duplicate') || (args['allow-duplicate'] === 'true');
  let explicitArgId = getArgStr(args, 'arg-id');
  const activeMachine = (getArgStr(args, 'machine') || '').toUpperCase() === 'AUTONOMOUS' ? 'AUTONOMOUS_DMAD' : 'HUMAN_HITL';

  if (scan.duplicate_flags.length > 0 && !allowDup && !explicitArgId) {
    const dup = scan.duplicate_flags[0];
    if (activeMachine === 'AUTONOMOUS_DMAD') {
      if (dup.similarity > 0.85) {
        explicitArgId = dup.arg_id;
        console.log(`[AUTONOMOUS_DEDUP] Proposal matches [${dup.arg_id}] (${(dup.similarity * 100).toFixed(1)}% >= 85%). Auto-updating in-place.`);
      } else {
        console.log(`[AUTONOMOUS_DEDUP] Proposal resembles [${dup.arg_id}] (${(dup.similarity * 100).toFixed(1)}%). Auto-resolving as distinct proposal.`);
      }
    } else {
      emitDiagnostic({
        code: 'POTENTIAL_DUPLICATE_FLAG',
        reason: `Proposal semantically matches existing entry [${dup.arg_id}] (${(dup.similarity * 100).toFixed(1)}% >= threshold 50%): "${dup.conclusion}".`,
        remediation: `Review [${dup.arg_id}] in LOGICAL_LEDGER.md. State your preference in plain English: "Refine ${dup.arg_id}" to update in-place, or "Keep separate" to formulate as a new entry.`
      }, { suppressSessionMetadata: true });
      process.exit(1);
    }
  }

  let ledgerContent = '';
  if (fs.existsSync(LEDGER_FILE)) {
    ledgerContent = fs.readFileSync(LEDGER_FILE, 'utf8');
  }

  if (explicitArgId && ledgerContent) {
    const checkRegex = new RegExp(`\\|\\s*\\*\\*${escapeRegExp(explicitArgId)}\\*\\*\\s*\\|`, 'i');
    if (!checkRegex.test(ledgerContent)) {
      emitDiagnostic({
        code: 'ARGUMENT_NOT_FOUND',
        reason: `Specified argument ID '${explicitArgId}' was not found in active ledger for in-place update.`,
        remediation: 'Omit `--arg-id` to auto-allocate the next sequential ID, or supply an existing argument ID from LOGICAL_LEDGER.md.'
      }, { suppressSessionMetadata: true });
      process.exit(2);
    }
  }

  let nextIdNum = 1;
  if (ledgerContent) {
    const argMatches = [...ledgerContent.matchAll(/\*\*ARG-(\d+)\*\*/g)];
    if (argMatches.length > 0) {
      nextIdNum = Math.max(...argMatches.map(m => parseInt(m[1], 10))) + 1;
    }
  }
  const argId = explicitArgId || `ARG-${String(nextIdNum).padStart(2, '0')}`;

  const cleanP = premises.map((p, idx) => {
    const raw = typeof p === 'object' ? (p.statement || JSON.stringify(p)) : String(p);
    return `**P${idx+1}**: ${raw.replace(/\|/g, '\\|').replace(/\n/g, ' ')}`;
  }).join('<br>');
  const rawC = conclusion ? conclusion : prompt;
  const cleanC = `**C**: ${String(rawC).replace(/\|/g, '\\|').replace(/\n/g, ' ')}`;

  const row = `| **${argId}** | ${cleanP} | ${cleanC} | **FORMULATED** | **Interpretation Gate** (Human ↔ LLM baseline confirmed) | Baseline registered. Awaiting validation & challenge. |`;

  // Update existing row in-place if argId already exists in table, else append right after active decision table header
  if (ledgerContent.includes('| :--- | :--- | :--- | :--- | :--- | :--- |')) {
    let updatedLedger;
    let cleaned = ledgerContent.replace(/\*\s*\(No active decisions recorded yet.*?\)\s*\*\n?/i, '');
    const rowRegex = new RegExp(`\\|\\s*\\*\\*${escapeRegExp(argId)}\\*\\*\\s*\\|[^\\n]*`, 'gi');
    if (rowRegex.test(cleaned)) {
      updatedLedger = cleaned.replace(rowRegex, row);
    } else {
      const tableHeaderIndex = cleaned.indexOf('| :--- | :--- | :--- | :--- | :--- | :--- |');
      const insertPos = tableHeaderIndex + '| :--- | :--- | :--- | :--- | :--- | :--- |'.length;
      updatedLedger = cleaned.slice(0, insertPos) + '\n' + row + cleaned.slice(insertPos);
    }
    fs.writeFileSync(LEDGER_FILE, updatedLedger, 'utf8');
  }

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

  if (state.active_machine === 'HUMAN_HITL' && (state.turn_count > 0 || state.current_state === 'AWAIT_USER_SELECTION' || state.current_state === 'DIAGNOSTIC_REQUIRED')) {
    emitDiagnostic({
      code: 'MACHINE_MODE_MISMATCH',
      reason: 'Cannot procedurally advance an active Human HITL interactive interview.',
      remediation: 'Conclude human interview via decision tree progression or switch to autonomous mode.'
    });
    process.exit(1);
  }

  // Promote machine to AUTONOMOUS_DMAD upon procedural advance
  state.active_machine = 'AUTONOMOUS_DMAD';

  const token = getArgStr(args, 'token');
  if (state.dispatch_token && (!token || token !== state.dispatch_token)) {
    emitDiagnostic({
      code: 'DISPATCH_TOKEN_MISMATCH',
      reason: `Mismatched dispatch token: '${token}'. Expected: '${state.dispatch_token}'.`,
      remediation: 'Provide matching session dispatch token.'
    });
    process.exit(1);
  }

  // If an active challenge is pending, cannot procedurally advance
  if (state.conclusion_status === 'CHALLENGED') {
    emitDiagnostic({
      code: 'ACTIVE_CHALLENGE_PENDING',
      reason: 'Cannot procedurally advance while an active challenge (CHALLENGED) is pending response from proposer.',
      remediation: 'Proposer must respond with counter-hypothesis C-prime via record-llm-response before subagent evaluates.'
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
  if (args.help || args.h) {
    console.log(`Grill-State check-gate:
  Pre-flight epistemic firewall & deterministic invariant solver.
  Usage: node scripts/grill-state.mjs check-gate --proposal "<text>"
  Aliases: --proposal, --prompt, --input
`);
    process.exit(0);
  }

  const proposal = getArgStr(args, 'proposal') || getArgStr(args, 'prompt') || getArgStr(args, 'input');
  if (!proposal) {
    emitDiagnostic({
      code: 'INPUT_GATE_HALT',
      reason: 'check-gate requires `--proposal "<text>"` to audit.',
      remediation: 'Pass the architectural proposal to audit. Example: `node scripts/grill-state.mjs check-gate --proposal "Use Redis for caching"`'
    }, { suppressSessionMetadata: true });
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
    }, { suppressSessionMetadata: true });
    process.exit(1);
  }

  console.log('[GRILL-STATE] Pre-flight firewall & invariant check PASS. No violations found.');
}

export function cmdCommit(args) {
  if (args.help || args.h) {
    console.log(`Grill-State commit:
  Commit session verdict and contrastive rule to LOGICAL_LEDGER.md.
  Usage: node scripts/grill-state.mjs commit --status <SUPPORTED|REJECTED|ACCEPTED_SOLUTION> [--rule "<rule>"]
`);
    process.exit(0);
  }

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

  const isFormallyInvalid = state.validation?.result === 'formally_invalid';

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

    if ((!state.probes_executed || state.probes_executed.length === 0) && !(status === 'REJECTED' && isFormallyInvalid) && !state.procedural_clearance) {
      emitDiagnostic({
        code: 'EMPIRICAL_PROBE_MISSING',
        machine: state.active_machine,
        state: state.current_state,
        reason: 'Cannot commit autonomous audit without at least one empirical tool probe execution.',
        remediation: 'Run a real tool probe (grep_search, run_command, view_file) and record it before committing.'
      });
      process.exit(1);
    }

    const isPositive = status === 'SUPPORTED' || status === 'ACCEPTED_SOLUTION' || status === 'TENTATIVE_SOLUTION';

    // Formal Invalidity Guard: Formally invalid arguments can never commit positive status
    if (isPositive && isFormallyInvalid) {
      emitDiagnostic({
        code: 'FORMAL_INVALIDITY_UNRESOLVED',
        machine: state.active_machine,
        state: state.current_state,
        reason: 'Attempted to commit positive status on an argument evaluated as formally_invalid by deterministic validation.',
        remediation: 'Reformulate deductive structure or accept REJECTED status.'
      });
      process.exit(1);
    }

    // Asymmetric Override Guard: LLM (W=0.2) cannot commit positive status if subagent rejected
    if (isPositive && state.conclusion_status === 'REJECTED') {
      emitDiagnostic({
        code: 'ASYMMETRIC_OVERRIDE_FORBIDDEN',
        machine: state.active_machine,
        state: state.current_state,
        targetW: state.epistemic_context.target_w,
        challengerW: state.epistemic_context.challenger_w,
        reason: 'Target W_LLM (0.2) attempted to mark proposal positive over Challenger rejection without empirical counter-proof.',
        remediation: 'Either accept the subagent REJECTED verdict or provide a falsification counter-probe.'
      });
      process.exit(1);
    }

    // Subagent Signoff Guard: Cannot commit positive status without subagent signoff
    if (isPositive && !state.subagent_signoff) {
      emitDiagnostic({
        code: 'SIGNOFF_TOKEN_MISSING',
        machine: state.active_machine,
        state: state.current_state,
        reason: 'Cannot commit positive status without explicit subagent sign-off in state.',
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

  const auditEvidence = isFormallyInvalid && (!state.probes_executed || state.probes_executed.length === 0)
    ? `**Deterministic Solver**: Formally invalid (${state.validation?.notes || 'Invariant failed'})`
    : (state.procedural_clearance
        ? `**Procedural Clearance** (No counter on table; unobjected)`
        : (isAuto
            ? `**Subagent Challenger (W_subagent=0.8)**: ${probeSummary || 'Standard evaluation'}`
            : `**Human HITL (W_human=1.0)**: Decision tree aligned`));

  let statusDisplay = `**${status}**`;
  if (status === 'REJECTED') {
    if (state.premise_status === 'FALSIFIED') {
      statusDisplay = `**REJECTED**<br>*(False Axiom)*`;
    } else if (state.inference_status === 'INVALID_LEAP') {
      statusDisplay = `**REJECTED**<br>*(Invalid Leap)*`;
    }
  }

  const cleanPremises = state.premises && state.premises.length > 0
    ? state.premises.map((p, idx) => {
        const raw = typeof p === 'object' ? (p.statement || JSON.stringify(p)) : String(p);
        return `**P${idx+1}**: ${raw.replace(/\|/g, '\\|').replace(/\n/g, ' ')}`;
      }).join('<br>')
    : `**P**: ${cleanInput}`;

  const row = `| **${argId}** | ${cleanPremises} | **C**: ${cleanConclusion} | ${statusDisplay} | ${auditEvidence} | ${cleanRule || 'Verified'} |`;

  let updatedLedger;
  let cleaned = ledgerContent.replace(/\*\s*\(No active decisions recorded yet.*?\)\s*\*\n?/i, '');
  const rowRegex = new RegExp(`\\|\\s*\\*\\*${escapeRegExp(argId)}\\*\\*\\s*\\|[^\\n]*`, 'gi');
  if (rowRegex.test(cleaned)) {
    updatedLedger = cleaned.replace(rowRegex, row);
  } else {
    // Append row right after active decision table header
    const tableHeaderIndex = cleaned.indexOf('| :--- | :--- | :--- | :--- | :--- | :--- |');
    if (tableHeaderIndex === -1) {
      emitDiagnostic({
        code: 'LEDGER_MALFORMED',
        reason: 'Active Decision Registry table header not found in LOGICAL_LEDGER.md.',
        remediation: 'Check LOGICAL_LEDGER.md structure or run `/clear-ledger` to reset.'
      });
      process.exit(1);
    }
    const insertPos = tableHeaderIndex + '| :--- | :--- | :--- | :--- | :--- | :--- |'.length;
    updatedLedger = cleaned.slice(0, insertPos) + '\n' + row + cleaned.slice(insertPos);
  }

  fs.writeFileSync(LEDGER_FILE, updatedLedger, 'utf8');
  clearState();

  console.log(`[GRILL-STATE] Successfully committed ${argId} [${status}] to ${LEDGER_FILE}.`);
  console.log(`[GRILL-STATE] Session state cleared.`);
}

// CLI Arg Parser Dispatcher
export function parseArgs(args) {
  const parsed = {};
  for (let i = 0; i < args.length; i++) {
    const raw = args[i];
    if (raw === '-h' || raw === '--help') {
      parsed['help'] = true;
      continue;
    }
    if (raw.startsWith('--')) {
      const stripped = raw.slice(2);
      const eqIdx = stripped.indexOf('=');
      if (eqIdx !== -1) {
        const key = stripped.slice(0, eqIdx);
        let val = stripped.slice(eqIdx + 1);
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
          val = val.slice(1, -1);
        }
        parsed[key] = val;
        continue;
      }
      const key = stripped;
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
        if (typeof val === 'string' && val.startsWith("'") && val.endsWith("'") && val.length >= 2) {
          val = val.slice(1, -1).trim();
        }
        parsed[key] = val;
        if (key === 'payload-file' && fs.existsSync(val)) {
          parsed['payload'] = fs.readFileSync(val, 'utf8').trim();
        }
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
  if (!action || action === '--help' || action === '-h') {
    console.log(`Grill-State CLI (Epistemic State Engine & Deterministic Invariant Solver):
  init                       --machine <autonomous|human> --input "<text>"
  status                     Show current epistemic state
  add-logic                  --prompt "<text>" [--premises '<JSON>'] [--conclusion "<text>"] [--arg-id <ID>] [--allow-duplicate true]
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
    process.exit(0);
  }

  const parsedArgs = parseArgs(process.argv.slice(3));

  switch (action) {
  case 'init':
    cmdInit(parsedArgs);
    break;
  case 'status':
    cmdStatus(parsedArgs);
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
    cmdRecordDiagnosticAck(parsedArgs);
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
    console.log(`Unknown action '${action}'. Run \`node scripts/grill-state.mjs --help\` for usage.`);
    process.exit(1);
    break;
  }
}

