import fs from "node:fs";
import path from "node:path";

const LEDGER_PATH = "LOGICAL_LEDGER.md";
const ARCHIVE_PATH = "LOGICAL_LEDGER.archive.md";

const CLEAN_TEMPLATE = `# Project Epistemic Registry: Logical Ledger

This ledger acts as a persistent truth-maintenance registry and runtime **negative constraint firewall**. Any proposal relying on an entry marked \`REJECTED\` is automatically gated from execution.

---

## Active Decision Registry

| Arg ID | Premises ($P$) | Proposed Conclusion ($C$) | Status | Challenger & Evidence | Resulting Action / Contrastive Refutation Rule |
| :--- | :--- | :--- | :--- | :--- | :--- |

*(No active decisions recorded yet. Run \`/grill-logic [proposal]\` or let the continuous epistemic gate record verified premises and contrastive refutation rules here.)*
`;

function parseTableRows(text) {
  const lines = text.split("\n");
  const hIndex = lines.findIndex((line) => line.includes("| Arg ID |"));
  if (hIndex === -1) return [];

  const rows = [];
  for (let i = hIndex + 2; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line.startsWith("|") || !line.endsWith("|")) continue;
    const cells = line
      .split("|")
      .slice(1, -1)
      .map((c) => c.trim());
    if (cells.length >= 6) {
      rows.push(line);
    }
  }
  return rows;
}

function clearLedger() {
  const args = process.argv.slice(2);
  const noArchive = args.includes("--no-archive") || args.includes("--force");

  console.log("==> Grill-Logic: Clearing Logical Ledger...");

  if (!fs.existsSync(LEDGER_PATH)) {
    fs.writeFileSync(LEDGER_PATH, CLEAN_TEMPLATE, "utf8");
    console.log(`  ✓ Created clean ${LEDGER_PATH}`);
    return;
  }

  const currentContent = fs.readFileSync(LEDGER_PATH, "utf8").replace(/^\uFEFF/, "");
  const rows = parseTableRows(currentContent);

  if (rows.length === 0) {
    fs.writeFileSync(LEDGER_PATH, CLEAN_TEMPLATE, "utf8");
    console.log(`  ✓ ${LEDGER_PATH} was already clean. Template normalized.`);
    return;
  }

  if (!noArchive) {
    const timestamp = new Date().toISOString();
    const archiveHeader = `\n\n## Archived Entries (${timestamp})\n\n| Arg ID | Premises ($P$) | Proposed Conclusion ($C$) | Status | Challenger & Evidence | Resulting Action / Contrastive Refutation Rule |\n| :--- | :--- | :--- | :--- | :--- | :--- |\n`;
    const archiveBody = rows.join("\n") + "\n";

    if (!fs.existsSync(ARCHIVE_PATH)) {
      const initialArchive = `# Logical Ledger Archive\n\nHistorical audited architectural decisions archived by \`clear-ledger\`.\n` + archiveHeader + archiveBody;
      fs.writeFileSync(ARCHIVE_PATH, initialArchive, "utf8");
    } else {
      fs.appendFileSync(ARCHIVE_PATH, archiveHeader + archiveBody, "utf8");
    }
    console.log(`  ✓ Archived ${rows.length} entries to ${ARCHIVE_PATH}`);
  } else {
    console.log(`  ⚠ Skipping archive (--no-archive specified). ${rows.length} entries wiped.`);
  }

  fs.writeFileSync(LEDGER_PATH, CLEAN_TEMPLATE, "utf8");
  console.log(`  ✓ ${LEDGER_PATH} has been cleared to a fresh, publication-ready state.`);
}

clearLedger();
