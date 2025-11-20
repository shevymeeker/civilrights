/**
 * Extract case law from START HERE.html
 * This script parses the compiled HTML and extracts the embedded case law data
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read the HTML file
const htmlPath = path.join(__dirname, '..', 'START HERE.html');
const html = fs.readFileSync(htmlPath, 'utf8');

// The file appears to be a compiled React app with embedded JSON data
// Let's search for case law patterns

// Extract all case titles and content
const titleMatches = [...html.matchAll(/"title":"([^"]+)"/g)];
const contentMatches = [...html.matchAll(/"content":"([^"]+)"/g)];
const categoryMatches = [...html.matchAll(/"category":"([^"]+)"/g)];

console.log(`Found ${titleMatches.length} title entries`);
console.log(`Found ${contentMatches.length} content entries`);
console.log(`Found ${categoryMatches.length} category entries`);

// Sample of what we found
console.log('\n=== Sample Titles ===');
titleMatches.slice(0, 10).forEach((match, i) => {
  console.log(`${i + 1}. ${match[1]}`);
});

// Try to find the actual JSON array
const jsonMatch = html.match(/\[\s*\{\s*"title"[\s\S]*?\}\s*\]/);
if (jsonMatch) {
  console.log('\n=== Found JSON array ===');
  console.log('Length:', jsonMatch[0].length);

  try {
    // Try to parse it
    const data = JSON.parse(jsonMatch[0]);
    console.log(`Parsed ${data.length} cases`);

    // Save to file
    const outputPath = path.join(__dirname, '..', 'data', 'extracted-cases.json');
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    fs.writeFileSync(outputPath, JSON.stringify(data, null, 2));
    console.log(`\nSaved to: ${outputPath}`);

    // Show sample
    if (data.length > 0) {
      console.log('\n=== Sample Case ===');
      console.log(JSON.stringify(data[0], null, 2));
    }
  } catch (e) {
    console.error('Failed to parse JSON:', e.message);
  }
}

console.log('\n=== Extraction Complete ===');
