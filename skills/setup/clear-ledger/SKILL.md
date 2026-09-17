---
name: clear-ledger
description: Clear and reset the project Logical Ledger (LOGICAL_LEDGER.md) to a fresh initialized state, archiving prior decision entries to LOGICAL_LEDGER.archive.md.
disable-model-invocation: true
argument-hint: "[archive (default) | reset-only]"
---

# Clear Ledger

Clear and reset the project epistemic registry (`LOGICAL_LEDGER.md`) back to a clean, publication-ready initialized state.

By default, any active decision entries currently in the ledger are archived to `LOGICAL_LEDGER.archive.md` with a timestamp before the main ledger is reset, ensuring historical audit trails are preserved.

---

## Usage

Run via slash command or conversational request:

```bash
# Default: Archives existing entries and resets LOGICAL_LEDGER.md
/clear-ledger

# Reset without archiving:
/clear-ledger reset-only
```

Or execute directly from the terminal:
```bash
npm run clear-ledger
# or
node scripts/clear-ledger.mjs
```

---

## What Happens

1. **Inspection**: The script inspects `LOGICAL_LEDGER.md` for active decision rows.
2. **Archiving (Default)**: If entries are found, they are appended to `LOGICAL_LEDGER.archive.md` under a timestamped header.
3. **Reset**: `LOGICAL_LEDGER.md` is reset to the clean template with an empty Decision Registry table ready for new audits.
