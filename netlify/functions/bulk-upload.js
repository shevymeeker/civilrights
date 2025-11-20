/**
 * Netlify Function: Bulk Upload Data
 * Securely uploads case law and KRS codes using service role key
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;
const ADMIN_SECRET = process.env.ADMIN_SECRET;

export async function handler(event, context) {
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
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

  // Check admin authorization
  const authHeader = event.headers.authorization;
  if (!authHeader || authHeader !== `Bearer ${ADMIN_SECRET}`) {
    return {
      statusCode: 401,
      headers,
      body: JSON.stringify({ error: 'Unauthorized' })
    };
  }

  try {
    const { cases, krsCodes } = JSON.parse(event.body);

    if (!cases || !krsCodes) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Missing cases or krsCodes in request body' })
      };
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

    let successCases = 0;
    let failedCases = 0;
    let successKRS = 0;
    let failedKRS = 0;

    // Upload cases
    for (const c of cases) {
      const caseData = {
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
        importance: c.importance || 3,
        created_by: 'web-uploader'
      };

      const { error } = await supabase
        .from('case_law')
        .insert([caseData]);

      if (error) {
        console.error('Case insert error:', error);
        failedCases++;
      } else {
        successCases++;
      }
    }

    // Upload KRS codes
    for (const k of krsCodes) {
      const krsData = {
        code: k.code || 'Unknown',
        title: k.title || 'Untitled',
        chapter: k.chapter || null,
        full_text: k.full_text || '',
        summary: k.summary || null,
        category: k.category || [],
        tags: k.tags || [],
        related_krs: k.related_krs || [],
        effective_date: k.effective_date || null,
        created_by: 'web-uploader'
      };

      const { error } = await supabase
        .from('krs_codes')
        .insert([krsData]);

      if (error) {
        console.error('KRS insert error:', error);
        failedKRS++;
      } else {
        successKRS++;
      }
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        cases: { success: successCases, failed: failedCases, total: cases.length },
        krs: { success: successKRS, failed: failedKRS, total: krsCodes.length }
      })
    };

  } catch (error) {
    console.error('Upload error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Upload failed',
        message: error.message
      })
    };
  }
}
