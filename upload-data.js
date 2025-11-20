/**
 * Simple script to upload all data directly to Supabase
 * Run this on your computer: node upload-data.js
 */

import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

// YOUR CREDENTIALS (fill these in)
const SUPABASE_URL = 'https://tihxzsfgkukvwduhsbpa.supabase.co';
const SUPABASE_SERVICE_KEY = 'YOUR_NEW_SERVICE_KEY_HERE'; // Get this from Supabase Settings > API

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function upload() {
  console.log('🚀 Starting upload...\n');

  // Load data
  const cases = JSON.parse(fs.readFileSync('data/case-law-complete.json', 'utf8'));
  const krs = JSON.parse(fs.readFileSync('data/krs-codes-complete.json', 'utf8'));

  console.log(`📚 Loaded ${cases.length} cases and ${krs.length} KRS codes\n`);

  // Upload cases
  let successCases = 0;
  for (const c of cases) {
    const { error } = await supabase.from('case_law').insert([{
      case_name: c.case_name || null,
      citation: c.citation || null,
      full_title: c.full_title || c.case_name || 'Untitled',
      year: c.year || null,
      court: c.court || null,
      facts: c.facts || null,
      issue: c.issue || null,
      holding: c.holding || null,
      discussion: c.discussion || null,
      full_text: c.full_text || null,
      category: c.category || null,
      tags: c.tags || [],
      related_krs: c.related_krs || [],
      importance: c.importance || 3
    }]);

    if (!error) successCases++;
    if ((successCases + 1) % 20 === 0) console.log(`   ${successCases} cases uploaded...`);
  }

  console.log(`✅ Cases: ${successCases}/${cases.length}\n`);

  // Upload KRS
  let successKRS = 0;
  for (const k of krs) {
    const { error } = await supabase.from('krs_codes').insert([{
      code: k.code || 'Unknown',
      title: k.title || 'Untitled',
      chapter: k.chapter || null,
      full_text: k.full_text || '',
      summary: k.summary || null,
      category: k.category || [],
      tags: k.tags || [],
      related_krs: k.related_krs || []
    }]);

    if (!error) successKRS++;
    if ((successKRS + 1) % 30 === 0) console.log(`   ${successKRS} KRS codes uploaded...`);
  }

  console.log(`✅ KRS: ${successKRS}/${krs.length}\n`);
  console.log(`🎉 DONE! ${successCases + successKRS} total entries uploaded`);
}

upload().catch(console.error);
