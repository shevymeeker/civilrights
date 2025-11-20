/**
 * Netlify Function: Analyze Scenario with Claude API
 *
 * Takes a user's scenario and returns relevant case law and KRS codes
 * using Claude AI for intelligent analysis
 */

import { createClient } from '@supabase/supabase-js';

const CLAUDE_API_KEY = process.env.CLAUDE_API_KEY;
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

// Rate limiting (simple in-memory, resets on cold start)
const requestCounts = new Map();
const RATE_LIMIT = 10; // requests per hour per IP
const RATE_WINDOW = 60 * 60 * 1000; // 1 hour

function checkRateLimit(ip) {
  const now = Date.now();
  const userRequests = requestCounts.get(ip) || [];

  // Filter out old requests
  const recentRequests = userRequests.filter(time => now - time < RATE_WINDOW);

  if (recentRequests.length >= RATE_LIMIT) {
    return false;
  }

  recentRequests.push(now);
  requestCounts.set(ip, recentRequests);
  return true;
}

export async function handler(event, context) {
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Handle preflight
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  // Only allow POST
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  // Rate limiting
  const clientIP = event.headers['client-ip'] || event.headers['x-forwarded-for'] || 'unknown';
  if (!checkRateLimit(clientIP)) {
    return {
      statusCode: 429,
      headers,
      body: JSON.stringify({
        error: 'Rate limit exceeded. Please try again later.',
        limit: RATE_LIMIT,
        window: '1 hour'
      })
    };
  }

  try {
    const { scenario } = JSON.parse(event.body);

    if (!scenario || scenario.trim().length < 10) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          error: 'Please provide a scenario with at least 10 characters'
        })
      };
    }

    // Initialize Supabase
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    // First, do a keyword search to get potentially relevant cases
    const keywords = scenario.toLowerCase().match(/\b\w{4,}\b/g) || [];
    const searchQuery = keywords.slice(0, 5).join(' ');

    const { data: cases, error: casesError } = await supabase
      .rpc('search_case_law', { search_query: searchQuery, limit_count: 20 });

    if (casesError) {
      console.error('Supabase error:', casesError);
    }

    const { data: krsData, error: krsError } = await supabase
      .rpc('search_krs', { search_query: searchQuery, limit_count: 10 });

    if (krsError) {
      console.error('KRS search error:', krsError);
    }

    // Build context for Claude
    const caseLawContext = cases?.slice(0, 10).map(c =>
      `Case: ${c.case_name || 'Untitled'} (${c.citation || 'N/A'})\nHolding: ${c.holding || 'N/A'}`
    ).join('\n\n') || 'No relevant cases found';

    const krsContext = krsData?.slice(0, 5).map(k =>
      `KRS ${k.code}: ${k.title}\n${k.summary || ''}`
    ).join('\n\n') || 'No relevant KRS codes found';

    // Call Claude API
    const claudeResponse = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': CLAUDE_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 2000,
        messages: [{
          role: 'user',
          content: `You are a Kentucky legal rights assistant. Analyze this traffic stop or police encounter scenario and provide guidance based on the case law and KRS codes provided.

SCENARIO:
${scenario}

RELEVANT CASE LAW:
${caseLawContext}

RELEVANT KRS CODES:
${krsContext}

Provide a structured response with:
1. **Your Rights in This Situation** - What constitutional/legal rights apply
2. **Relevant Case Law** - Which cases from above are most applicable and why
3. **Relevant KRS Codes** - Which Kentucky statutes apply
4. **Recommended Response** - What to say/do (include the "three sentences" if applicable)
5. **Legal Reasoning** - Why these rights and cases apply

Be specific, practical, and cite the actual cases and statutes provided above. If the scenario involves a search, seizure, or detention, emphasize 4th Amendment protections.`
        }]
      })
    });

    if (!claudeResponse.ok) {
      const errorText = await claudeResponse.text();
      console.error('Claude API error:', errorText);
      throw new Error(`Claude API error: ${claudeResponse.status}`);
    }

    const claudeData = await claudeResponse.json();
    const analysis = claudeData.content[0].text;

    // Log this search for analytics (without PII)
    await supabase.from('scenarios').insert([{
      scenario_text: scenario.substring(0, 500), // Limit length
      ai_response: { analysis },
      ip_address: clientIP.split(',')[0], // First IP only
      user_agent: event.headers['user-agent']
    }]);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        analysis,
        relatedCases: cases?.slice(0, 5) || [],
        relatedKRS: krsData?.slice(0, 3) || []
      })
    };

  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Failed to analyze scenario',
        message: error.message
      })
    };
  }
}
