/**
 * Seed database with COMPLETE legal data:
 * - 178 case law entries
 * - 280 KRS code entries
 * Run this after setting up Supabase
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
  console.log('  SUPABASE_URL=https://xxx.supabase.co SUPABASE_SERVICE_KEY=xxx node scripts/seed-complete-database.js');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Read data files
const casesPath = path.join(__dirname, '..', 'data', 'case-law-complete.json');
const krsPath = path.join(__dirname, '..', 'data', 'krs-codes-complete.json');

const cases = JSON.parse(fs.readFileSync(casesPath, 'utf8'));
const krsCodes = JSON.parse(fs.readFileSync(krsPath, 'utf8'));

console.log(`\n🚀 Seeding Kentucky Legal Research Platform`);
console.log(`   Case Law: ${cases.length} entries`);
console.log(`   KRS Codes: ${krsCodes.length} entries`);
console.log(`   Total: ${cases.length + krsCodes.length} entries\n`);

async function seedCases() {
  console.log('📚 Seeding Case Law...');
  let successful = 0;
  let failed = 0;

  for (const caseData of cases) {
    // Transform to match database schema
    const dbCase = {
      case_name: caseData.case_name,
      citation: caseData.citation,
      full_title: caseData.full_title,
      year: caseData.year,
      court: caseData.court,
      facts: caseData.facts,
      issue: caseData.issue,
      holding: caseData.holding,
      discussion: caseData.discussion,
      full_text: caseData.full_text,
      category: caseData.category,
      tags: caseData.tags || [],
      related_krs: caseData.related_krs || [],
      importance: caseData.importance || 3,
      created_by: 'seed-script'
    };

    const { data, error } = await supabase
      .from('case_law')
      .insert([dbCase])
      .select();

    if (error) {
      console.error(`   ❌ ${caseData.full_title?.substring(0, 60) || 'Untitled'}`);
      console.error(`      Error: ${error.message}`);
      failed++;
    } else {
      console.log(`   ✅ ${caseData.full_title?.substring(0, 60) || caseData.case_name || 'Untitled'}`);
      successful++;
    }
  }

  console.log(`\n   Case Law: ${successful} successful, ${failed} failed\n`);
  return { successful, failed };
}

async function seedKRS() {
  console.log('⚖️  Seeding KRS Codes...');
  let successful = 0;
  let failed = 0;

  for (const krsData of krsCodes) {
    const dbKRS = {
      code: krsData.code,
      title: krsData.title,
      chapter: krsData.chapter,
      full_text: krsData.full_text,
      category: krsData.category || [],
      tags: krsData.tags || [],
      related_krs: krsData.related_krs || [],
      created_by: 'seed-script'
    };

    const { data, error } = await supabase
      .from('krs_codes')
      .insert([dbKRS])
      .select();

    if (error) {
      console.error(`   ❌ KRS ${krsData.code}: ${krsData.title?.substring(0, 50)}`);
      console.error(`      Error: ${error.message}`);
      failed++;
    } else {
      console.log(`   ✅ KRS ${krsData.code}: ${krsData.title?.substring(0, 50)}`);
      successful++;
    }
  }

  console.log(`\n   KRS Codes: ${successful} successful, ${failed} failed\n`);
  return { successful, failed };
}

async function main() {
  const caseResults = await seedCases();
  const krsResults = await seedKRS();

  console.log('═══════════════════════════════════════════');
  console.log('   🎉 SEEDING COMPLETE!');
  console.log('═══════════════════════════════════════════');
  console.log(`   Case Law: ${caseResults.successful}/${cases.length} imported`);
  console.log(`   KRS Codes: ${krsResults.successful}/${krsCodes.length} imported`);
  console.log(`   Total: ${caseResults.successful + krsResults.successful} entries`);
  console.log('═══════════════════════════════════════════\n');

  if (caseResults.failed + krsResults.failed > 0) {
    console.log(`   ⚠️  ${caseResults.failed + krsResults.failed} entries failed`);
    console.log(`   Review errors above and retry if needed.\n`);
  } else {
    console.log('   ✨ All entries imported successfully!');
    console.log('   Your Kentucky Legal Research Platform is ready!\n');
  }
}

main().catch(console.error);
