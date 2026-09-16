import fs from "node:fs";
import path from "node:path";

console.log("==> Running Test Suite: Grill-Logic v2 Protocol & Invariants...");

// 1. Verify 90/10 Invariant & Dual State Machine in Verifier
const verifierPath = "skills/logic/epistemic-verifier/SKILL.md";
if (!fs.existsSync(verifierPath)) {
  console.error(`Error: Missing ${verifierPath}`);
  process.exit(1);
}
const verifierContent = fs.readFileSync(verifierPath, "utf8");

if (!verifierContent.includes("90/10 Invariant") || !verifierContent.includes("Mode A: User Grill-Logic") || !verifierContent.includes("Mode B: Self-Grill")) {
  console.error("Error: Epistemic Verifier missing 90/10 Invariant or Dual State Machine definitions");
  process.exit(1);
}
console.log("  ✓ 90/10 Invariant and Dual State Machine verified in epistemic-verifier");

// 2. Verify Subagent Challenger Configuration (DMAD & W/S)
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

// 3. Verify Epistemic Gate Rule
const gateRulePath = ".agents/rules/epistemic-gate.md";
if (!fs.existsSync(gateRulePath)) {
  console.error(`Error: Missing ${gateRulePath}`);
  process.exit(1);
}
const gateContent = fs.readFileSync(gateRulePath, "utf8");

if (!gateContent.includes("Contrastive Refutation Rules") || !gateContent.includes("Autonomous Adversarial Audit (Self-Grill)")) {
  console.error("Error: Epistemic Gate rule missing contrastive check or Self-Grill gate");
  process.exit(1);
}
console.log("  ✓ Epistemic Gate continuous rule verified (pre-flight check, contrastive firewall, Self-Grill)");

// 4. Verify Jargon Filtering in User-Facing Entrypoint
const routerPath = "skills/logic/grill-logic/SKILL.md";
if (!fs.existsSync(routerPath)) {
  console.error(`Error: Missing ${routerPath}`);
  process.exit(1);
}
const routerContent = fs.readFileSync(routerPath, "utf8");

if (routerContent.includes("⊢") || routerContent.includes("turnstile")) {
  console.error("Error: User-facing router leaks academic logic symbols (⊢ or turnstile)");
  process.exit(1);
}
console.log("  ✓ User-facing router verified free of academic logic jargon");

// 5. Verify Canonical Architecture Documents
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
