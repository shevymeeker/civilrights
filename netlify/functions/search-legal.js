/**
 * Netlify Function: Search Legal Database
 * Direct database search - no AI analysis
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

export async function handler(event, context) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const { query } = JSON.parse(event.body);

    if (!query || query.trim().length < 3) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Search query must be at least 3 characters' })
      };
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    // Extract keywords from query
    const keywords = query.toLowerCase()
      .split(/\s+/)
      .filter(word => word.length >= 3)
      .slice(0, 10)
      .join(' ');

    // Search case law
    const { data: cases, error: casesError } = await supabase
      .rpc('search_case_law', {
        search_query: keywords,
        limit_count: 20
      });

    // Search KRS codes
    const { data: krsData, error: krsError } = await supabase
      .rpc('search_krs', {
        search_query: keywords,
        limit_count: 15
      });

    // Search federal statutes
    const { data: federalData, error: federalError } = await supabase
      .rpc('search_federal_statutes', {
        search_query: keywords,
        limit_count: 10
      });

    // Get full details for top results
    const caseIds = cases?.slice(0, 10).map(c => c.id) || [];
    let fullCases = [];

    if (caseIds.length > 0) {
      const { data } = await supabase
        .from('case_law')
        .select('*')
        .in('id', caseIds);
      fullCases = data || [];
    }

    const krsIds = krsData?.slice(0, 8).map(k => k.id) || [];
    let fullKRS = [];

    if (krsIds.length > 0) {
      const { data } = await supabase
        .from('krs_codes')
        .select('*')
        .in('id', krsIds);
      fullKRS = data || [];
    }

    const federalIds = federalData?.slice(0, 5).map(f => f.id) || [];
    let fullFederal = [];

    if (federalIds.length > 0) {
      const { data } = await supabase
        .from('federal_statutes')
        .select('*')
        .in('id', federalIds);
      fullFederal = data || [];
    }

    // Log search for analytics
    await supabase.from('scenarios').insert([{
      scenario_text: query.substring(0, 500),
      matched_krs: krsData?.map(k => k.code) || [],
      matched_usc: federalData?.map(f => f.code) || [],
      ip_address: (event.headers['client-ip'] || event.headers['x-forwarded-for'] || '').split(',')[0],
      user_agent: event.headers['user-agent']
    }]);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        query,
        results: {
          cases: fullCases,
          krs: fullKRS,
          federal: fullFederal
        },
        total: fullCases.length + fullKRS.length + fullFederal.length
      })
    };

  } catch (error) {
    console.error('Search error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Search failed',
        message: error.message
      })
    };
  }
}
