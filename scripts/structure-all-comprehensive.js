/**
 * Structure ALL 518 entries - Case Law AND KRS Codes
 * This is a comprehensive Kentucky legal database, not just traffic stops
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read all entries
const inputPath = path.join(__dirname, '..', 'data', 'all-entries-unfiltered.json');
const allEntries = JSON.parse(fs.readFileSync(inputPath, 'utf8'));

console.log(`Processing ${allEntries.length} entries...`);

const caseLaw = [];
const krsCodes = [];
const other = [];

for (const entry of allEntries) {
  const { title, content, category } = entry;
  const combined = title + ' ' + content;

  // Detect if this is KRS code content
  const isKRSSection = /^KRS\s+(CHAPTER\s+)?\d+/i.test(title) ||
                       /Kentucky Revised Statute/i.test(title) ||
                       category.includes('Section') ||
                       /^KRS\s+[\d.]+/i.test(content.substring(0, 50));

  // Extract KRS code references
  const krsMatches = combined.match(/KRS\s+[\d.]+/gi) || [];
  const krsRefs = [...new Set(krsMatches.map(k => k.replace(/^KRS\s+/i, '')))];

  if (isKRSSection && content.length > 100) {
    // This is KRS code content
    const codeMatch = title.match(/KRS\s+(CHAPTER\s+)?(\d+[.\d]*)/i);
    const code = codeMatch ? codeMatch[2] : krsRefs[0] || 'Unknown';

    krsCodes.push({
      code: code,
      title: title.replace(/^KRS\s+(CHAPTER\s+)?\d+[.\d]*\s*[-–—]\s*/i, '').trim(),
      chapter: category || '',
      full_text: content,
      category: [category].filter(Boolean),
      tags: extractTags(combined),
      related_krs: krsRefs.filter(k => k !== code),
      source: 'START HERE.html'
    });
  } else if (isCaseLaw(title, content)) {
    // This is case law
    const caseData = parseCaseLaw(entry);
    caseData.related_krs = krsRefs;
    caseLaw.push(caseData);
  } else if (content.length > 50 && title !== 'Table of Cases') {
    // Other legal content
    other.push({
      title,
      content,
      category,
      type: 'legal-reference',
      related_krs: krsRefs,
      tags: extractTags(combined)
    });
  }
}

function isCaseLaw(title, content) {
  return /v\.\s+\w+|U\.S\.|F\.\d+d/.test(title) ||
         /HOLDING:|ISSUE:|FACTS:|DISCUSSION:/i.test(content) ||
         /The Court|Supreme Court|held that|ruled that/i.test(content);
}

function parseCaseLaw(entry) {
  const { title, content, category } = entry;

  // Try to identify case name from title
  const caseNameMatch = title.match(/^(.+?v\..+?),?\s+(\d+\s+U\.S\.\s+\d+|\d+\s+F\.\d+d\s+\d+)/i);

  let structured = {
    case_name: caseNameMatch ? caseNameMatch[1].trim() : null,
    citation: caseNameMatch ? caseNameMatch[2].trim() : null,
    full_title: title,
    category: category,

    // Parse content sections
    facts: null,
    issue: null,
    holding: null,
    discussion: null,
    full_text: content,

    // Metadata
    year: caseNameMatch ? parseInt(caseNameMatch[2].match(/\d{4}/)?.[0]) : null,
    court: determineCourt(title, content),
    importance: determineImportance(title, content),
    tags: extractTags(title + ' ' + content),
    related_krs: []
  };

  // Parse Facts section
  const factsMatch = content.match(/FACTS?:(.+?)(?=ISSUE:|HOLDING:|DISCUSSION:|$)/is);
  if (factsMatch) {
    structured.facts = cleanText(factsMatch[1]);
  }

  // Parse Issue section
  const issueMatch = content.match(/ISSUE:(.+?)(?=FACTS?:|HOLDING:|DISCUSSION:|$)/is);
  if (issueMatch) {
    structured.issue = cleanText(issueMatch[1]);
  } else if (!caseNameMatch && /\?/.test(title)) {
    // Title might be the issue
    structured.issue = title;
  }

  // Parse Holding section
  const holdingMatch = content.match(/HOLDING:(.+?)(?=FACTS?:|ISSUE:|DISCUSSION:|$)/is);
  if (holdingMatch) {
    structured.holding = cleanText(holdingMatch[1]);
  }

  // Parse Discussion section
  const discussionMatch = content.match(/DISCUSSION:(.+?)$/is);
  if (discussionMatch) {
    structured.discussion = cleanText(discussionMatch[1]);
  }

  return structured;
}

function determineCourt(title, content) {
  if (/U\.S\.|Supreme Court of the United States/i.test(title + content)) {
    return 'U.S. Supreme Court';
  } else if (/Kentucky Supreme Court|Ky\./i.test(title + content)) {
    return 'Kentucky Supreme Court';
  } else if (/Court of Appeals|Ky\. App\./i.test(title + content)) {
    return 'Kentucky Court of Appeals';
  } else if (/6th Circuit|Sixth Circuit/i.test(title + content)) {
    return '6th Circuit';
  }
  return null;
}

function determineImportance(title, content) {
  const landmarkCases = [
    'Terry', 'Miranda', 'Mapp', 'Payton', 'Whren', 'Rodriguez',
    'Mimms', 'Riley', 'Kyllo', 'Katz', 'Olmstead', 'Weeks'
  ];

  if (landmarkCases.some(name => title.includes(name))) {
    return 5; // Landmark case
  } else if (/U\.S\. Supreme Court|Supreme Court held/i.test(content)) {
    return 4; // Supreme Court case
  } else if (/Kentucky Supreme Court/i.test(content)) {
    return 3; // State supreme court
  }
  return 3; // Default
}

function extractTags(text) {
  const tags = [];
  const tagPatterns = {
    'search': /\b(search|warrant|probable cause|reasonable suspicion)\b/i,
    'seizure': /\b(seizure|contraband|confiscate)\b/i,
    'arrest': /\b(arrest|custody|detained)\b/i,
    'traffic-stop': /\b(traffic stop|pulled over|speeding|taillight)\b/i,
    'consent': /\b(consent|permission|voluntary)\b/i,
    'plain-view': /\b(plain view|plain sight)\b/i,
    'exigent-circumstances': /\b(exigent circumstanc|emergency|hot pursuit)\b/i,
    '4th-amendment': /\b(fourth amendment|4th amendment|unreasonable search)\b/i,
    '5th-amendment': /\b(fifth amendment|5th amendment|remain silent)\b/i,
    'miranda': /\b(miranda|right to remain silent)\b/i,
    'terry-stop': /\b(terry|stop.{0,10}frisk|pat.{0,5}down)\b/i,
    'drugs': /\b(drug|narcotics|controlled substance|marijuana|cocaine)\b/i,
    'dui-dwi': /\b(DUI|DWI|drunk driv|impaired driv|intoxicat)\b/i,
    'vehicle': /\b(vehicle|automobile|car|truck)\b/i,
    'computer-crime': /\b(computer|electronic|digital|cyber)\b/i,
    'juvenile': /\b(juvenile|minor|youth)\b/i,
    'weapons': /\b(weapon|firearm|gun)\b/i
  };

  for (const [tag, pattern] of Object.entries(tagPatterns)) {
    if (pattern.test(text)) {
      tags.push(tag);
    }
  }

  return tags;
}

function cleanText(text) {
  return text
    .replace(/\\n/g, '\n')
    .replace(/\\f/g, '')
    .replace(/\\/g, '')
    .trim();
}

// Save all structured data
const outputBase = path.join(__dirname, '..', 'data');

fs.writeFileSync(
  path.join(outputBase, 'case-law-complete.json'),
  JSON.stringify(caseLaw, null, 2)
);

fs.writeFileSync(
  path.join(outputBase, 'krs-codes-complete.json'),
  JSON.stringify(krsCodes, null, 2)
);

fs.writeFileSync(
  path.join(outputBase, 'legal-reference-other.json'),
  JSON.stringify(other, null, 2)
);

console.log('\n=== COMPLETE EXTRACTION ===');
console.log(`Case Law Entries: ${caseLaw.length}`);
console.log(`KRS Code Entries: ${krsCodes.length}`);
console.log(`Other Legal Content: ${other.length}`);
console.log(`Total: ${caseLaw.length + krsCodes.length + other.length}`);

// Show samples
console.log('\n=== Sample Case Law ===');
const sampleCase = caseLaw.find(c => c.case_name) || caseLaw[0];
if (sampleCase) {
  console.log(JSON.stringify(sampleCase, null, 2).substring(0, 800));
}

console.log('\n=== Sample KRS Code ===');
if (krsCodes.length > 0) {
  console.log(JSON.stringify(krsCodes[0], null, 2).substring(0, 800));
}

// Statistics
const casesByCategory = {};
caseLaw.forEach(c => {
  casesByCategory[c.category] = (casesByCategory[c.category] || 0) + 1;
});

const krsByChapter = {};
krsCodes.forEach(k => {
  krsByChapter[k.chapter] = (krsByChapter[k.chapter] || 0) + 1;
});

console.log('\n=== Case Law by Category ===');
Object.entries(casesByCategory)
  .sort((a, b) => b[1] - a[1])
  .slice(0, 10)
  .forEach(([cat, count]) => console.log(`  ${cat}: ${count}`));

console.log('\n=== KRS by Chapter ===');
Object.entries(krsByChapter)
  .sort((a, b) => b[1] - a[1])
  .slice(0, 10)
  .forEach(([chap, count]) => console.log(`  ${chap}: ${count}`));

console.log('\n✅ Complete structuring done!');
console.log(`\nFiles created:`);
console.log(`  - data/case-law-complete.json (${caseLaw.length} entries)`);
console.log(`  - data/krs-codes-complete.json (${krsCodes.length} entries)`);
console.log(`  - data/legal-reference-other.json (${other.length} entries)`);
