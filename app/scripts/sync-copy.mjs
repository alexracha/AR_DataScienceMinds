// Regenerates workspace/03-copy.md from content/copy.json.
// Run `npm run sync:copy` after editing copy.json. A test fails if they drift.
import { readFileSync, writeFileSync } from "node:fs";

const copy = JSON.parse(readFileSync(new URL("../content/copy.json", import.meta.url), "utf8"));
const target = new URL("../../workspace/03-copy.md", import.meta.url);

const sections = [
  ["Meta", "meta"], ["Brand", "brand"], ["Labels (interface text)", "labels"],
  ["1. Nav", "nav"], ["2. Hero", "hero"], ["3. Social proof", "socialProof"], ["4. Problem", "problem"],
  ["5. Cost of inaction", "costOfInaction"], ["6. Solution", "solution"], ["7. Services", "services"],
  ["8. Process", "process"], ["9. Case studies", "caseStudies"], ["10. Testimonials", "testimonials"],
  ["11. About", "about"], ["12. FAQ", "faq"], ["13. Final CTA", "finalCta"], ["Form", "form"], ["Footer", "footer"],
];

let out = "# Landing Page Copy\n\nGenerated from `app/content/copy.json` by `npm run sync:copy`. Edit the JSON, not this file.\n\n";
for (const [title, key] of sections) {
  out += `## ${title}\n\n\`\`\`json\n${JSON.stringify(copy[key], null, 2)}\n\`\`\`\n\n`;
}
out += "## Handoff\n- Every `[REPLACE: …]` is missing proof, or a promise the owner must confirm (`[REPLACE: confirm]`).\n- Stats used are only those approved in `02-brief.md`.\n";

writeFileSync(target, out);
console.log("Wrote workspace/03-copy.md");
