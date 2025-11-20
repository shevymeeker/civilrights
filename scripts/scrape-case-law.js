/**
 * Scrape Case Law from Public Sources
 *
 * Sources:
 * - CourtListener.com API (free, requires API key)
 * - Google Scholar (web scraping)
 * - Justia (web scraping)
 *
 * Example usage:
 * COURTLISTENER_API_KEY=xxx node scripts/scrape-case-law.js --query "kentucky search warrant"
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;
const courtListenerKey = process.env.COURTLISTENER_API_KEY;

// Example: CourtListener API
async function scrapeCourtListener(query) {
  console.log(`🔍 Searching CourtListener for: "${query}"`);

  const response = await fetch(
    `https://www.courtlistener.com/api/rest/v3/search/?q=${encodeURIComponent(query)}&type=o`,
    {
      headers: {
        'Authorization': `Token ${courtListenerKey}`
      }
    }
  );

  const data = await response.json();

  console.log(`Found ${data.count} results`);

  const cases = [];
  for (const result of data.results.slice(0, 10)) {
    // Fetch full opinion
    const opinionResponse = await fetch(result.absolute_url, {
      headers: { 'Authorization': `Token ${courtListenerKey}` }
    });

    const opinion = await opinionResponse.json();

    cases.push({
      case_name: result.caseName,
      citation: result.citation?.[0] || null,
      year: new Date(result.dateFiled).getFullYear(),
      court: result.court,
      facts: null, // Would need to parse from opinion text
      issue: null,
      holding: null,
      discussion: opinion.plain_text || opinion.html,
      full_text: opinion.plain_text || opinion.html,
      category: 'IMPORTED',
      tags: ['courtlistener'],
      importance: 3
    });
  }

  return cases;
}

// Usage example
if (process.argv[2] === '--query') {
  const query = process.argv[3];

  if (!courtListenerKey) {
    console.error('Set COURTLISTENER_API_KEY environment variable');
    console.error('Get free key at: https://www.courtlistener.com/api/rest-info/');
    process.exit(1);
  }

  const cases = await scrapeCourtListener(query);

  // Save to file for review before importing
  const fs = await import('fs');
  fs.writeFileSync('scraped-cases.json', JSON.stringify(cases, null, 2));

  console.log(`\n✅ Saved ${cases.length} cases to scraped-cases.json`);
  console.log('Review the file, then import with:');
  console.log('node scripts/bulk-import-cases.js scraped-cases.json');
}

console.log('\nUsage: node scripts/scrape-case-law.js --query "your search query"');
console.log('Get free API key: https://www.courtlistener.com/api/rest-info/');
