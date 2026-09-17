import fs from "node:fs";
import path from "node:path";

function findSkills(dir) {
  const results = [];
  if (!fs.existsSync(dir)) return results;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      const skillPath = path.join(full, "SKILL.md");
      if (fs.existsSync(skillPath)) {
        results.push(full);
      } else {
        results.push(...findSkills(full));
      }
    }
  }
  return results;
}

console.log("==> Running Test Suite: Skills Architecture & Harness Metadata...");

const skills = findSkills("skills");
console.log(`Found ${skills.length} skills in skills/`);

if (skills.length === 0) {
  console.error("Error: No skills found in skills/");
  process.exit(1);
}

for (const skillDir of skills) {
  const skillFile = path.join(skillDir, "SKILL.md");
  const yamlFile = path.join(skillDir, "agents", "openai.yaml");

  if (!fs.existsSync(skillFile)) {
    console.error(`Missing SKILL.md in ${skillDir}`);
    process.exit(1);
  }
  const content = fs.readFileSync(skillFile, "utf8").replace(/^\uFEFF/, "");
  if (!content.startsWith("---") || !content.includes("name:") || !content.includes("description:")) {
    console.error(`Invalid frontmatter in ${skillFile}`);
    process.exit(1);
  }

  if (!fs.existsSync(yamlFile)) {
    console.error(`Missing openai.yaml in ${yamlFile}`);
    process.exit(1);
  }
  const yamlContent = fs.readFileSync(yamlFile, "utf8").replace(/^\uFEFF/, "");
  if (!yamlContent.includes("display_name:") || !yamlContent.includes("allow_implicit_invocation:")) {
    console.error(`Invalid openai.yaml manifest in ${yamlFile}`);
    process.exit(1);
  }

  console.log(`  ✓ ${skillDir} validated (SKILL.md + openai.yaml)`);
}

// Verify byte-for-byte symmetry with .agents/skills
function getAllFiles(dir) {
  let results = [];
  if (!fs.existsSync(dir)) return results;
  const list = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of list) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results = results.concat(getAllFiles(full));
    } else {
      results.push(full);
    }
  }
  return results;
}

const skillFiles = getAllFiles("skills");
const agentFiles = getAllFiles(".agents/skills");

for (const f of skillFiles) {
  const rel = path.relative("skills", f);
  const mirroredFile = path.join(".agents", "skills", rel);
  if (!fs.existsSync(mirroredFile)) {
    console.error(`Missing mirrored skill file: ${mirroredFile}`);
    process.exit(1);
  }
  const contentA = fs.readFileSync(f, "utf8").replace(/\r\n/g, "\n");
  const contentB = fs.readFileSync(mirroredFile, "utf8").replace(/\r\n/g, "\n");
  if (contentA !== contentB) {
    console.error(`Content parity mismatch in mirrored skill file: ${mirroredFile}`);
    process.exit(1);
  }
}

if (skillFiles.length !== agentFiles.length) {
  console.error(`File count mismatch: skills/ has ${skillFiles.length} files but .agents/skills has ${agentFiles.length}`);
  process.exit(1);
}
console.log(`  ✓ .agents/skills mirrored cleanly with byte-for-byte content parity (${skillFiles.length} files)`);

// Verify required specifications and guidance
const requiredFiles = [
  "LOGICAL_LEDGER.md",
  ".agents/rules/epistemic-gate.md",
  "references/hooks-setup-guide.md",
  "references/logical-ledger-spec.md",
  "references/examples.md",
  "AGENTS.md",
  "CLAUDE.md"
];

for (const file of requiredFiles) {
  if (!fs.existsSync(file)) {
    console.error(`Missing required file: ${file}`);
    process.exit(1);
  }
  console.log(`  ✓ ${file} verified`);
}

console.log("==> Skills architecture and harness metadata passed successfully!\n");
