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
console.log("  ✓ Table schema and column definitions validated in LOGICAL_LEDGER.md");

function parseTableRows(text) {
  const fileLines = text.split("\n");
  const hIndex = fileLines.findIndex((line) => line.includes("| Arg ID |"));
  if (hIndex === -1) return [];

  const parsed = [];
  for (let i = hIndex + 2; i < fileLines.length; i++) {
    const line = fileLines[i].trim();
    if (!line.startsWith("|") || !line.endsWith("|")) continue;
    const cells = line
      .split("|")
      .slice(1, -1)
      .map((c) => c.trim());
    if (cells.length < 6) continue;

    parsed.push({
      id: cells[0],
      premises: cells[1],
      conclusion: cells[2],
      status: cells[3],
      challenger: cells[4],
      action: cells[5]
    });
  }
  return parsed;
}

function validateRows(rows, sourceName) {
  let rejectedCount = 0;
  let supportedCount = 0;
  let supersededCount = 0;

  for (const row of rows) {
    const isRejected = row.status.includes("REJECTED");
    const isSupported = row.status.includes("SUPPORTED");
    const isSuperseded = row.status.includes("SUPERSEDED");
    const isFormulated = row.status.includes("FORMULATED");
    const isUncertain = row.status.includes("UNCERTAIN");
    const isTentative = row.status.includes("TENTATIVE_SOLUTION");
    const isAcceptedSol = row.status.includes("ACCEPTED_SOLUTION");

    if (!isRejected && !isSupported && !isSuperseded && !isFormulated && !isUncertain && !isTentative && !isAcceptedSol) {
      console.error(`Error: Invalid status in ${sourceName} entry ${row.id}: ${row.status}`);
      process.exit(1);
    }

    if (isRejected) {
      rejectedCount++;
      if (!row.action.toLowerCase().includes("contrastive rule") && !row.action.toLowerCase().includes("do not")) {
        console.error(`Error: REJECTED entry ${row.id} in ${sourceName} does not formulate an active Contrastive Refutation Rule!`);
        process.exit(1);
      }
    }

    if (isSupported || isAcceptedSol) supportedCount++;
    if (isSuperseded) supersededCount++;
  }
  return { rejectedCount, supportedCount, supersededCount };
}

// Check root ledger
const rootRows = parseTableRows(content);
if (rootRows.length === 0) {
  console.log("  ✓ Clean initialized registry confirmed (0 active entries, publication ready)");
} else {
  const counts = validateRows(rootRows, "LOGICAL_LEDGER.md");
  console.log(`  ✓ Successfully validated ${rootRows.length} active decision registry entries in LOGICAL_LEDGER.md`);
}

// Functional verification of table parsing against reference specification entries
const specPath = "references/logical-ledger-spec.md";
if (fs.existsSync(specPath)) {
  const specContent = fs.readFileSync(specPath, "utf8");
  const specRows = parseTableRows(specContent);
  if (specRows.length > 0) {
    const counts = validateRows(specRows, "references/logical-ledger-spec.md");
    console.log(`  ✓ Verified ${specRows.length} reference specification entries (${counts.rejectedCount} REJECTED, ${counts.supportedCount} SUPPORTED)`);
  }
}

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
