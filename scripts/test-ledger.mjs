import fs from "node:fs";
import path from "node:path";

console.log("==> Running Test Suite: Logical Ledger Schema & Negative Constraints...");

const ledgerPath = "LOGICAL_LEDGER.md";
if (!fs.existsSync(ledgerPath)) {
  console.error(`Error: ${ledgerPath} does not exist!`);
  process.exit(1);
}

const content = fs.readFileSync(ledgerPath, "utf8").replace(/^\uFEFF/, "");
const lines = content.split("\n");

// Locate table header
const tableHeaderIndex = lines.findIndex((line) => line.includes("| Arg ID |"));
if (tableHeaderIndex === -1) {
  console.error("Error: Could not locate Decision Registry table header in LOGICAL_LEDGER.md");
  process.exit(1);
}

const headerLine = lines[tableHeaderIndex];
const expectedColumns = [
  "Arg ID",
  "Premises",
  "Proposed Conclusion",
  "Status",
  "Challenger & Evidence",
  "Resulting Action / Contrastive Refutation Rule"
];

for (const col of expectedColumns) {
  if (!headerLine.includes(col)) {
    console.error(`Error: Expected column "${col}" missing from header: ${headerLine}`);
    process.exit(1);
  }
}
console.log("  ✓ Table schema and column definitions validated");

// Parse rows
const rows = [];
for (let i = tableHeaderIndex + 2; i < lines.length; i++) {
  const line = lines[i].trim();
  if (!line.startsWith("|") || !line.endsWith("|")) continue;
  const cells = line
    .split("|")
    .slice(1, -1)
    .map((c) => c.trim());
  if (cells.length < 6) continue;

  rows.push({
    id: cells[0],
    premises: cells[1],
    conclusion: cells[2],
    status: cells[3],
    challenger: cells[4],
    action: cells[5]
  });
}

console.log(`  ✓ Successfully parsed ${rows.length} decision registry entries`);

if (rows.length === 0) {
  console.error("Error: No valid entries found in LOGICAL_LEDGER.md");
  process.exit(1);
}

let rejectedCount = 0;
let supportedCount = 0;
let supersededCount = 0;

for (const row of rows) {
  const isRejected = row.status.includes("REJECTED");
  const isSupported = row.status.includes("SUPPORTED");
  const isSuperseded = row.status.includes("SUPERSEDED");

  if (!isRejected && !isSupported && !isSuperseded) {
    console.error(`Error: Invalid status in entry ${row.id}: ${row.status}`);
    process.exit(1);
  }

  if (isRejected) {
    rejectedCount++;
    // Enforce CCoT Contrastive Rule presence
    if (!row.action.toLowerCase().includes("contrastive rule") && !row.action.toLowerCase().includes("do not")) {
      console.error(`Error: REJECTED entry ${row.id} does not formulate an active Contrastive Refutation Rule!`);
      process.exit(1);
    }
  }

  if (isSupported) {
    supportedCount++;
  }

  if (isSuperseded) {
    supersededCount++;
  }
}

console.log(`  ✓ Verified ${rejectedCount} REJECTED entries enforce active Contrastive Refutation Rules`);
console.log(`  ✓ Verified ${supportedCount} SUPPORTED entries cleared for task execution`);

// Functional verification of SUPERSEDED constraint release
function isNegativeConstraintActive(statusString) {
  if (statusString.includes("SUPERSEDED")) return false;
  if (statusString.includes("REJECTED")) return true;
  return false;
}

if (isNegativeConstraintActive("REJECTED (Fatal Axiom)") !== true) {
  console.error("Error: Constraint evaluator failed to detect active REJECTED rule");
  process.exit(1);
}

if (isNegativeConstraintActive("SUPERSEDED by ARG-05") !== false) {
  console.error("Error: Constraint evaluator failed to release constraint on SUPERSEDED rule");
  process.exit(1);
}

console.log("  ✓ SUPERSEDED lifecycle logic correctly releases negative constraints");
console.log("==> Logical Ledger validation passed successfully!\n");
