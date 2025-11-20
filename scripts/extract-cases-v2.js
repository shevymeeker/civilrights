/**
 * Extract case law from START HERE.html (v2 - handles escaped JSON)
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const htmlPath = path.join(__dirname, '..', 'START HERE.html');
const html = fs.readFileSync(htmlPath, 'utf8');

// Extract all title/content pairs manually since JSON is embedded in JS
const titleRegex = /"title":"((?:[^"\\]|\\.)*)"/g;
const contentRegex = /"content":"((?:[^"\\]|\\.)*)"/g;
const categoryRegex = /"category":"((?:[^"\\]|\\.)*)"/g;
const parentRegex = /"parent":"((?:[^"\\]|\\.)*)"/g;

const titles = [...html.matchAll(titleRegex)].map(m => unescapeJSON(m[1]));
const contents = [...html.matchAll(contentRegex)].map(m => unescapeJSON(m[1]));
const categories = [...html.matchAll(categoryRegex)].map(m => unescapeJSON(m[1]));
const parents = [...html.matchAll(parentRegex)].map(m => unescapeJSON(m[1]));

function unescapeJSON(str) {
  return str
    .replace(/\\n/g, '\n')
    .replace(/\\"/g, '"')
    .replace(/\\\\/g, '\\');
}

console.log(`Found ${titles.length} entries`);

// Build case law objects
const cases = [];
for (let i = 0; i < titles.length; i++) {
  // Skip "Table of Cases" and other non-case entries
  const title = titles[i];
  const content = contents[i] || '';
  const category = categories[i] || '';
  const parent = parents[i] || '';

  // Skip if this looks like a navigation item
  if (title === 'Table of Cases' || !content) {
    continue;
  }

  // Detect if this is a case citation
  const isCaseLaw = /v\.\s+\w+|U\.S\.|F\.\d+d/.test(title) || content.includes('HOLDING:') || content.includes('ISSUE:');

  cases.push({
    title,
    content,
    category,
    parent,
    isCaseLaw
  });
}

console.log(`Extracted ${cases.length} total entries`);
console.log(`Case law entries: ${cases.filter(c => c.isCaseLaw).length}`);

// Save to file
const outputPath = path.join(__dirname, '..', 'data', 'extracted-cases.json');
fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, JSON.stringify(cases, null, 2));

console.log(`\nSaved to: ${outputPath}`);

// Show sample cases
console.log('\n=== Sample Cases ===');
cases.filter(c => c.isCaseLaw).slice(0, 3).forEach((c, i) => {
  console.log(`\n${i + 1}. ${c.title}`);
  console.log(`   Category: ${c.category}`);
  console.log(`   Content (first 200 chars): ${c.content.substring(0, 200)}...`);
});

console.log('\n✅ Extraction complete!');
