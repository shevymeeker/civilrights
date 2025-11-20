/**
 * Seed database with extracted case law
 * Run this after setting up Supabase to populate initial data
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// You'll need to set these environment variables
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Error: SUPABASE_URL and SUPABASE_SERVICE_KEY must be set');
  console.log('\nUsage:');
  console.log('  SUPABASE_URL=https://xxx.supabase.co SUPABASE_SERVICE_KEY=xxx node scripts/seed-database.js');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Read structured cases
const casesPath = path.join(__dirname, '..', 'data', 'case-law-structured.json');
const cases = JSON.parse(fs.readFileSync(casesPath, 'utf8'));

console.log(`Seeding ${cases.length} cases into Supabase...\n`);

async function seedCases() {
  let successful = 0;
  let failed = 0;

  for (const caseData of cases) {
    // Transform to match database schema
    const dbCase = {
      case_name: caseData.caseName,
      citation: caseData.citation,
      full_title: caseData.fullTitle,
      year: caseData.citation ? parseInt(caseData.citation.match(/\d{4}/)?.[0]) : null,
      court: caseData.citation?.includes('U.S.') ? 'U.S. Supreme Court' : 'Unknown',
      facts: caseData.facts,
      issue: caseData.issue,
      holding: caseData.holding,
      discussion: caseData.discussion,
      full_text: caseData.fullText,
      category: caseData.category,
      tags: caseData.tags,
      related_krs: caseData.relatedKRS,
      importance: caseData.importance,
      created_by: 'seed-script'
    };

    const { data, error } = await supabase
      .from('case_law')
      .insert([dbCase])
      .select();

    if (error) {
      console.error(`❌ Failed to insert: ${caseData.fullTitle}`);
      console.error(`   Error: ${error.message}`);
      failed++;
    } else {
      console.log(`✅ Inserted: ${caseData.fullTitle || caseData.caseName || 'Untitled'}`);
      successful++;
    }
  }

  console.log(`\n=== Seeding Complete ===`);
  console.log(`Successful: ${successful}`);
  console.log(`Failed: ${failed}`);
  console.log(`Total: ${cases.length}`);
}

seedCases().catch(console.error);
