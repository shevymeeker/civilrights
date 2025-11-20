/**
 * Extract ALL entries from START HERE.html (no filtering)
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const htmlPath = path.join(__dirname, '..', 'START HERE.html');
const html = fs.readFileSync(htmlPath, 'utf8');

// Extract all fields
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
    .replace(/\\\\/g, '\\')
    .replace(/\\f/g, '\f')
    .replace(/\\t/g, '\t');
}

console.log(`Found ${titles.length} total entries`);

// Build ALL entries - NO FILTERING
const allEntries = [];
for (let i = 0; i < titles.length; i++) {
  allEntries.push({
    title: titles[i] || '',
    content: contents[i] || '',
    category: categories[i] || '',
    parent: parents[i] || ''
  });
}

// Save ALL entries
const outputPath = path.join(__dirname, '..', 'data', 'all-entries-unfiltered.json');
fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, JSON.stringify(allEntries, null, 2));

console.log(`\nSaved ${allEntries.length} entries to: ${outputPath}`);

// Analyze content
const withCaseLaw = allEntries.filter(e =>
  /v\.\s+\w+|U\.S\.|F\.\d+d|HOLDING:|ISSUE:|FACTS:/i.test(e.title + e.content)
);

const withKRS = allEntries.filter(e =>
  /KRS\s+\d+|\bkentucky\s+revised\s+statute/i.test(e.title + e.content)
);

const uniqueCategories = [...new Set(allEntries.map(e => e.category).filter(Boolean))];

console.log('\n=== Analysis ===');
console.log(`Total entries: ${allEntries.length}`);
console.log(`Entries with case law indicators: ${withCaseLaw.length}`);
console.log(`Entries mentioning KRS: ${withKRS.length}`);
console.log(`\nCategories found: ${uniqueCategories.join(', ')}`);

// Sample KRS mentions
if (withKRS.length > 0) {
  console.log('\n=== Sample KRS Mentions ===');
  withKRS.slice(0, 5).forEach((e, i) => {
    console.log(`\n${i + 1}. ${e.title.substring(0, 80)}`);
    const krsMatch = (e.title + ' ' + e.content).match(/KRS\s+[\d.]+/gi);
    if (krsMatch) {
      console.log(`   KRS codes: ${krsMatch.slice(0, 5).join(', ')}`);
    }
  });
}

// Show some excluded entries to see what we have
console.log('\n=== Sample Entries ===');
allEntries.slice(0, 10).forEach((e, i) => {
  console.log(`\n${i + 1}. Title: ${e.title.substring(0, 100)}`);
  console.log(`   Category: ${e.category}`);
  console.log(`   Content length: ${e.content.length} chars`);
});

console.log('\n✅ Complete extraction done!');
