/**
 * Netlify Function: Add Case Law
 * Admin only - requires authentication
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

export async function handler(event, context) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
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
    // TODO: Add authentication check here
    // For now, using simple auth header check
    const authHeader = event.headers.authorization;
    if (!authHeader || authHeader !== `Bearer ${process.env.ADMIN_SECRET}`) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ error: 'Unauthorized' })
      };
    }

    const caseData = JSON.parse(event.body);

    // Validate required fields
    if (!caseData.full_title) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'full_title is required' })
      };
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

    const { data, error } = await supabase
      .from('case_law')
      .insert([{
        ...caseData,
        created_by: 'admin'
      }])
      .select()
      .single();

    if (error) {
      throw error;
    }

    return {
      statusCode: 201,
      headers,
      body: JSON.stringify({
        success: true,
        data
      })
    };

  } catch (error) {
    console.error('Error adding case:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Failed to add case',
        message: error.message
      })
    };
  }
}
