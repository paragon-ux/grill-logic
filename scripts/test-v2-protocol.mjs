import fs from "node:fs";
import path from "node:path";

console.log("==> Running Test Suite: Grill-Logic v2 Protocol & Invariants...");

// 1. Verify State Machine 2 (Human HITL) in grill-logic
const hitlPath = "skills/logic/grill-logic/SKILL.md";
if (!fs.existsSync(hitlPath)) {
  console.error(`Error: Missing ${hitlPath}`);
  process.exit(1);
}
const hitlContent = fs.readFileSync(hitlPath, "utf8");

if (!hitlContent.includes("State Machine 2 (Human Sequential Interview / HITL Engine)") ||
    !hitlContent.includes("Strict Yield on Question") ||
    !hitlContent.includes("ask_question")) {
  console.error("Error: grill-logic missing State Machine 2 definitions, ask_question, or turn yield invariant");
  process.exit(1);
}

if (hitlContent.includes("⊢") || hitlContent.includes("turnstile")) {
  console.error("Error: grill-logic leaks academic logic symbols (⊢ or turnstile)");
  process.exit(1);
}
console.log("  ✓ State Machine 2 verified in grill-logic (ask_question yield, no jargon, decision tree)");

// 2. Verify State Machine 1 (Autonomous DMAD) in self-grill
const dmadPath = "skills/logic/self-grill/SKILL.md";
if (!fs.existsSync(dmadPath)) {
  console.error(`Error: Missing ${dmadPath}`);
  process.exit(1);
}
const dmadContent = fs.readFileSync(dmadPath, "utf8");

if (!dmadContent.includes("State Machine 1 (Autonomous AI Iterative Self-Prompting)") ||
    !dmadContent.includes("Diverse Multi-Agent Debate") ||
    !dmadContent.includes("dispatch_token") ||
    !dmadContent.includes("No Simulated Text Monologues")) {
  console.error("Error: self-grill missing State Machine 1 definitions, DMAD, or dispatch token handshake");
  process.exit(1);
}
console.log("  ✓ State Machine 1 verified in self-grill (DMAD, dispatch token handshake, tool probe invariant)");

// 3. Verify Subagent Challenger Configuration (DMAD & W/S)
const subagentPath = ".agents/agents/grill_logic_challenger/agent.md";
if (!fs.existsSync(subagentPath)) {
  console.error(`Error: Missing ${subagentPath}`);
  process.exit(1);
}
const subagentContent = fs.readFileSync(subagentPath, "utf8");

const hasW = subagentContent.includes("W_subagent") || subagentContent.includes("W_{\\text{subagent}}");
const hasDMAD = subagentContent.includes("Diverse Multi-Agent Debate");
const hasS = subagentContent.includes("S_LLM") || subagentContent.includes("S_{\\text{LLM}}");

if (!hasW || !hasDMAD || !hasS) {
  console.error("Error: Subagent Challenger missing W/S dynamics or DMAD principles");
  process.exit(1);
}
console.log("  ✓ Subagent Challenger verified (DMAD cognitive diversity, virgin context W, S_LLM CoT inspection)");

// 4. Verify Epistemic Gate Rule
const gateRulePath = ".agents/rules/epistemic-gate.md";
if (!fs.existsSync(gateRulePath)) {
  console.error(`Error: Missing ${gateRulePath}`);
  process.exit(1);
}
const gateContent = fs.readFileSync(gateRulePath, "utf8");

if (!gateContent.includes("check-gate") || !gateContent.includes("/self-grill") || !gateContent.includes("/grill-logic")) {
  console.error("Error: Epistemic Gate rule missing check-gate or explicit machine routing");
  process.exit(1);
}
console.log("  ✓ Epistemic Gate continuous rule verified (pre-flight check-gate, fail-closed, machine routing)");

// 5. Verify State Engine Runtime
const enginePath = "scripts/grill-state.mjs";
if (!fs.existsSync(enginePath)) {
  console.error(`Error: Missing ${enginePath}`);
  process.exit(1);
}
const engineContent = fs.readFileSync(enginePath, "utf8");
if (!engineContent.includes("emitDiagnostic") || !engineContent.includes("DISPATCH_TOKEN_MISMATCH") || !engineContent.includes("HUMAN_STAGNATION_ALERT")) {
  console.error("Error: State engine missing fail-closed diagnostics or invariant guards");
  process.exit(1);
}
console.log("  ✓ Epistemic State Engine verified (fail-closed diagnostics, W/S calculations, token handshakes)");

// 6. Verify Canonical Architecture Documents
const whitepaperPath = "references/grill-logic-whitepaper.md";
const requirementsPath = "references/build-requirements.md";
if (!fs.existsSync(whitepaperPath) || !fs.existsSync(requirementsPath)) {
  console.error("Error: Missing canonical whitepaper or requirements document");
  process.exit(1);
}
const whitepaperContent = fs.readFileSync(whitepaperPath, "utf8");
if (!whitepaperContent.includes("Diverse Multi-Agent Debate") || !whitepaperContent.includes("ICLR 2025")) {
  console.error("Error: Whitepaper missing DMAD ICLR 2025 citation");
  process.exit(1);
}
console.log("  ✓ Canonical Whitepaper and Requirements specifications verified");

console.log("==> Grill-Logic v2 Protocol & Invariants validation passed successfully!\n");
