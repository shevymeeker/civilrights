import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://tihxzsfgkukvwduhsbpa.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRpaHh6c2Zna3VrdndkdWhzYnBhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzYxMTkzMCwiZXhwIjoyMDc5MTg3OTMwfQ.OMgFA7gKG-d7678OJwryT_O3A6m0EuP13YlJWcTz7ps";

const supabase = createClient(supabaseUrl, supabaseKey);

console.log('Testing Supabase connection...');

// Test query
const { data, error } = await supabase.from('case_law').select('count');

if (error) {
  console.error('Error:', error);
} else {
  console.log('Success! Connected to database.');
  console.log('Data:', data);
}
