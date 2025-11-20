/**
 * Structure case law data - parse Facts, Holdings, Issues, Discussion
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read extracted cases
const inputPath = path.join(__dirname, '..', 'data', 'extracted-cases.json');
const rawCases = JSON.parse(fs.readFileSync(inputPath, 'utf8'));

console.log(`Processing ${rawCases.length} entries...`);

const structuredCases = [];

for (const raw of rawCases) {
  const { title, content, category } = raw;

  // Try to identify case name from title
  const caseNameMatch = title.match(/^(.+?v\..+?),?\s+(\d+\s+U\.S\.\s+\d+|\d+\s+F\.\d+d\s+\d+)/i);

  let structured = {
    caseName: caseNameMatch ? caseNameMatch[1].trim() : null,
    citation: caseNameMatch ? caseNameMatch[2].trim() : null,
    fullTitle: title,
    category: category,

    // Parse content sections
    facts: null,
    issue: null,
    holding: null,
    discussion: null,
    fullText: content,

    // Metadata
    importance: 3, // Default medium importance
    tags: [],
    relatedKRS: []
  };

  // Parse Facts section
  const factsMatch = content.match(/FACTS?:(.+?)(?=ISSUE:|HOLDING:|DISCUSSION:|$)/is);
  if (factsMatch) {
    structured.facts = factsMatch[1].trim().replace(/\\n/g, '\n').replace(/\\/g, '');
  }

  // Parse Issue section
  const issueMatch = content.match(/ISSUE:(.+?)(?=FACTS?:|HOLDING:|DISCUSSION:|$)/is);
  if (issueMatch) {
    structured.issue = issueMatch[1].trim().replace(/\\n/g, '\n').replace(/\\/g, '');
  } else if (!caseNameMatch && content.includes('?')) {
    // Title might be the issue
    structured.issue = title;
  }

  // Parse Holding section
  const holdingMatch = content.match(/HOLDING:(.+?)(?=FACTS?:|ISSUE:|DISCUSSION:|$)/is);
  if (holdingMatch) {
    structured.holding = holdingMatch[1].trim().replace(/\\n/g, '\n').replace(/\\/g, '');
  }

  // Parse Discussion section
  const discussionMatch = content.match(/DISCUSSION:(.+?)$/is);
  if (discussionMatch) {
    structured.discussion = discussionMatch[1].trim().replace(/\\n/g, '\n').replace(/\\/g, '');
  }

  // Auto-tag based on content
  const tagKeywords = {
    'search': /search|warrant|probable cause/i,
    'seizure': /seizure|contraband/i,
    'arrest': /arrest/i,
    'traffic-stop': /traffic stop|pulled over/i,
    'consent': /consent/i,
    'plain-view': /plain view/i,
    'exigent-circumstances': /exigent circumstance/i,
    '4th-amendment': /fourth amendment|4th amendment/i,
    'miranda': /miranda/i,
    'terry': /terry|stop.*frisk|frisk/i
  };

  for (const [tag, regex] of Object.entries(tagKeywords)) {
    if (regex.test(content) || regex.test(title)) {
      structured.tags.push(tag);
    }
  }

  // Determine importance (landmark cases get 5)
  const landmarkCases = ['Payton', 'Terry', 'Miranda', 'Mapp', 'Whren', 'Rodriguez', 'Mimms', 'Riley'];
  if (landmarkCases.some(name => title.includes(name))) {
    structured.importance = 5;
  }

  structuredCases.push(structured);
}

// Filter to only actual cases with substance
const validCases = structuredCases.filter(c =>
  c.caseName || c.holding || c.issue || c.facts
);

console.log(`\nStructured ${validCases.length} valid cases`);

// Save structured data
const outputPath = path.join(__dirname, '..', 'data', 'case-law-structured.json');
fs.writeFileSync(outputPath, JSON.stringify(validCases, null, 2));

console.log(`Saved to: ${outputPath}`);

// Show sample
console.log('\n=== Sample Structured Case ===');
const sample = validCases.find(c => c.caseName) || validCases[0];
console.log(JSON.stringify(sample, null, 2));

// Stats
const withCitation = validCases.filter(c => c.citation).length;
const withFacts = validCases.filter(c => c.facts).length;
const withHolding = validCases.filter(c => c.holding).length;
const withIssue = validCases.filter(c => c.issue).length;

console.log('\n=== Statistics ===');
console.log(`Cases with citation: ${withCitation}`);
console.log(`Cases with facts: ${withFacts}`);
console.log(`Cases with holding: ${withHolding}`);
console.log(`Cases with issue: ${withIssue}`);

console.log('\n✅ Structuring complete!');
