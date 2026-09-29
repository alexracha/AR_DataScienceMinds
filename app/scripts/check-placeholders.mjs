import { readFileSync } from "node:fs";

const raw = readFileSync(new URL("../content/copy.json", import.meta.url), "utf8");
const count = (raw.match(/\[REPLACE/g) ?? []).length;

if (count > 0 && process.env.ALLOW_PLACEHOLDERS !== "1") {
  console.error(`\n✖ ${count} [REPLACE: …] placeholder(s) remain in content/copy.json.`);
  console.error("  Fill them with real content, or set ALLOW_PLACEHOLDERS=1 to build anyway.\n");
  process.exit(1);
}
if (count > 0) console.warn(`⚠ Building with ${count} placeholder(s) (ALLOW_PLACEHOLDERS=1).`);
