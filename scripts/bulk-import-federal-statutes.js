/**
 * Bulk Import Federal Statutes (USC Codes)
 *
 * JSON Format:
 * [
 *   {
 *     "code": "42 USC 1983",
 *     "title_number": 42,
 *     "section": "1983",
 *     "title_name": "The Public Health and Welfare",
 *     "heading": "Civil action for deprivation of rights",
 *     "full_text": "Every person who...",
 *     "summary": "Allows citizens to sue...",
 *     "category": ["Civil Rights"],
 *     "tags": ["civil-rights", "state-actors"]
 *   }
 * ]
 *
 * Common Federal Statutes to Add:
 * - 42 USC 1983 (Civil rights lawsuits)
 * - 18 USC 242 (Criminal civil rights violations)
 * - 18 USC 241 (Conspiracy against rights)
 * - 18 USC 2340A (Torture)
 * - 42 USC 1985 (Conspiracy to interfere with civil rights)
 * - 42 USC 1988 (Attorney fees in civil rights cases)
 *
 * You can download USC codes from:
 * - uscode.house.gov (official)
 * - www.law.cornell.edu/uscode (Cornell LII)
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

const filePath = process.argv[2];

if (!filePath) {
  console.error('Usage: node bulk-import-federal-statutes.js <file.json>');
  console.error('\nExample JSON:');
  console.error(`[
  {
    "code": "42 USC 1983",
    "title_number": 42,
    "section": "1983",
    "title_name": "The Public Health and Welfare",
    "heading": "Civil action for deprivation of rights",
    "full_text": "Every person who, under color of any statute...",
    "summary": "Allows citizens to sue state actors for constitutional violations",
    "category": ["Civil Rights", "Constitutional Law"],
    "tags": ["civil-rights", "police-misconduct", "state-actors"],
    "related_krs": ["431.005"],
    "related_usc": ["18 USC 242"]
  }
]`);
  process.exit(1);
}

const fullPath = path.resolve(filePath);

if (!fs.existsSync(fullPath)) {
  console.error(`File not found: ${fullPath}`);
  process.exit(1);
}

const data = JSON.parse(fs.readFileSync(fullPath, 'utf8'));

console.log(`\n⚖️  Importing ${data.length} federal statutes...`);

let successful = 0;
let failed = 0;
const errors = [];

for (const statute of data) {
  // Validate required fields
  if (!statute.code || !statute.heading || !statute.full_text) {
    errors.push({ statute, error: 'Missing required fields: code, heading, full_text' });
    failed++;
    continue;
  }

  const dbStatute = {
    code: statute.code,
    title_number: statute.title_number || null,
    section: statute.section || null,
    title_name: statute.title_name || null,
    heading: statute.heading,
    full_text: statute.full_text,
    summary: statute.summary || null,
    category: Array.isArray(statute.category) ? statute.category :
              (typeof statute.category === 'string' ? [statute.category] : []),
    tags: Array.isArray(statute.tags) ? statute.tags :
          (typeof statute.tags === 'string' ? statute.tags.split(',').map(t => t.trim()) : []),
    related_krs: statute.related_krs || [],
    related_usc: statute.related_usc || [],
    effective_date: statute.effective_date || null,
    amended_date: statute.amended_date || null,
    created_by: 'bulk-import'
  };

  const { data: result, error } = await supabase
    .from('federal_statutes')
    .insert([dbStatute])
    .select();

  if (error) {
    console.error(`   ❌ ${dbStatute.code}: ${dbStatute.heading.substring(0, 50)}`);
    console.error(`      Error: ${error.message}`);
    errors.push({ statute: dbStatute, error: error.message });
    failed++;
  } else {
    console.log(`   ✅ ${dbStatute.code}: ${dbStatute.heading.substring(0, 50)}`);
    successful++;
  }
}

console.log(`\n=== Import Complete ===`);
console.log(`Successful: ${successful}`);
console.log(`Failed: ${failed}`);

if (errors.length > 0) {
  const errorFile = path.join(__dirname, '..', 'data', 'federal-import-errors.json');
  fs.writeFileSync(errorFile, JSON.stringify(errors, null, 2));
  console.log(`\n❌ Errors saved to: ${errorFile}`);
}

console.log('\n✅ Done!');
