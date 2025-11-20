/**
 * Bulk Import Case Law from CSV or JSON
 *
 * CSV Format:
 * case_name,citation,year,court,facts,issue,holding,discussion,category,tags,related_krs,importance
 *
 * JSON Format:
 * [
 *   {
 *     "case_name": "Example v. State",
 *     "citation": "123 U.S. 456",
 *     "year": 2020,
 *     ...
 *   }
 * ]
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Error: SUPABASE_URL and SUPABASE_SERVICE_KEY must be set');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Get file path from command line argument
const filePath = process.argv[2];

if (!filePath) {
  console.error('Usage: node bulk-import-cases.js <file.json|file.csv>');
  console.error('\nSupported formats: JSON, CSV');
  console.error('\nJSON Example:');
  console.error(`[
  {
    "case_name": "Miranda v. Arizona",
    "citation": "384 U.S. 436",
    "year": 1966,
    "court": "U.S. Supreme Court",
    "facts": "Ernesto Miranda was arrested...",
    "issue": "Must police inform suspects of their rights?",
    "holding": "Yes, suspects must be informed of their rights.",
    "discussion": "The Court held that...",
    "category": "CRIMINAL PROCEDURE",
    "tags": ["miranda", "5th-amendment", "self-incrimination"],
    "related_krs": ["431.015"],
    "importance": 5
  }
]`);
  process.exit(1);
}

const fullPath = path.resolve(filePath);

if (!fs.existsSync(fullPath)) {
  console.error(`File not found: ${fullPath}`);
  process.exit(1);
}

async function importJSON(data) {
  console.log(`\n📚 Importing ${data.length} cases from JSON...`);

  let successful = 0;
  let failed = 0;
  const errors = [];

  for (const caseData of data) {
    // Validate required fields
    if (!caseData.full_title && !caseData.case_name) {
      errors.push({ case: caseData, error: 'Missing case_name or full_title' });
      failed++;
      continue;
    }

    // Prepare data
    const dbCase = {
      case_name: caseData.case_name || null,
      citation: caseData.citation || null,
      full_title: caseData.full_title || `${caseData.case_name}, ${caseData.citation}`,
      year: caseData.year || null,
      court: caseData.court || null,
      facts: caseData.facts || null,
      issue: caseData.issue || null,
      holding: caseData.holding || null,
      discussion: caseData.discussion || null,
      full_text: caseData.full_text || null,
      category: caseData.category || null,
      tags: Array.isArray(caseData.tags) ? caseData.tags :
            (typeof caseData.tags === 'string' ? caseData.tags.split(',').map(t => t.trim()) : []),
      related_krs: Array.isArray(caseData.related_krs) ? caseData.related_krs :
                   (typeof caseData.related_krs === 'string' ? caseData.related_krs.split(',').map(k => k.trim()) : []),
      importance: caseData.importance || 3,
      created_by: 'bulk-import'
    };

    const { data: result, error } = await supabase
      .from('case_law')
      .insert([dbCase])
      .select();

    if (error) {
      console.error(`   ❌ ${dbCase.full_title.substring(0, 60)}`);
      console.error(`      Error: ${error.message}`);
      errors.push({ case: dbCase, error: error.message });
      failed++;
    } else {
      console.log(`   ✅ ${dbCase.full_title.substring(0, 60)}`);
      successful++;
    }
  }

  console.log(`\n=== Import Complete ===`);
  console.log(`Successful: ${successful}`);
  console.log(`Failed: ${failed}`);

  if (errors.length > 0) {
    const errorFile = path.join(__dirname, '..', 'data', 'import-errors.json');
    fs.writeFileSync(errorFile, JSON.stringify(errors, null, 2));
    console.log(`\n❌ Errors saved to: ${errorFile}`);
  }
}

async function importCSV(csvText) {
  const lines = csvText.split('\n').filter(line => line.trim());
  const headers = lines[0].split(',').map(h => h.trim());

  console.log(`\n📚 Importing ${lines.length - 1} cases from CSV...`);
  console.log(`Headers: ${headers.join(', ')}`);

  const data = [];
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim().replace(/^"|"$/g, ''));
    const obj = {};
    headers.forEach((header, index) => {
      obj[header] = values[index] || null;
    });
    data.push(obj);
  }

  await importJSON(data);
}

// Main
const fileContent = fs.readFileSync(fullPath, 'utf8');

if (filePath.endsWith('.json')) {
  const data = JSON.parse(fileContent);
  await importJSON(data);
} else if (filePath.endsWith('.csv')) {
  await importCSV(fileContent);
} else {
  console.error('Unsupported file format. Use .json or .csv');
  process.exit(1);
}

console.log('\n✅ Done!');
