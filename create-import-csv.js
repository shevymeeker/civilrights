import fs from 'fs';

// Read the case law data
const cases = JSON.parse(fs.readFileSync('data/case-law-complete.json', 'utf8'));
const krs = JSON.parse(fs.readFileSync('data/krs-codes-complete.json', 'utf8'));

// Take first 10 cases as a test
const testCases = cases.slice(0, 10);

// Create CSV with proper escaping
function escape(str) {
  if (!str) return '';
  return '"' + String(str).replace(/"/g, '""').replace(/\n/g, ' ') + '"';
}

// Case law CSV
const caseHeaders = 'case_name,citation,full_title,year,court,facts,issue,holding,discussion,category,importance';
const caseRows = testCases.map(c => {
  return [
    escape(c.case_name || ''),
    escape(c.citation || ''),
    escape(c.full_title || c.case_name || ''),
    c.year || '',
    escape(c.court || ''),
    escape(c.facts || ''),
    escape(c.issue || ''),
    escape(c.holding || ''),
    escape(c.discussion || ''),
    escape(c.category || ''),
    c.importance || 3
  ].join(',');
});

fs.writeFileSync('test-cases.csv', caseHeaders + '\n' + caseRows.join('\n'));
console.log('✅ Created test-cases.csv with 10 cases');

// KRS CSV - first 10
const testKRS = krs.slice(0, 10);
const krsHeaders = 'code,title,chapter,full_text,category';
const krsRows = testKRS.map(k => {
  return [
    escape(k.code || ''),
    escape(k.title || ''),
    escape(k.chapter || ''),
    escape(k.full_text || ''),
    escape(k.category || '')
  ].join(',');
});

fs.writeFileSync('test-krs.csv', krsHeaders + '\n' + krsRows.join('\n'));
console.log('✅ Created test-krs.csv with 10 KRS codes');

console.log('\n📁 Files ready for import!');
