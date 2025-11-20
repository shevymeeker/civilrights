/**
 * Test function to check environment variables
 */

export async function handler(event, context) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json'
  };

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({
      message: 'Environment check',
      hasSupabaseURL: !!process.env.SUPABASE_URL,
      hasSupabaseServiceKey: !!process.env.SUPABASE_SERVICE_KEY,
      hasAdminSecret: !!process.env.ADMIN_SECRET,
      adminSecretLength: process.env.ADMIN_SECRET?.length || 0
    })
  };
}
