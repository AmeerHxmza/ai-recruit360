import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  console.log("Testing Frontend Supabase Connection...");
  const { data, error } = await supabase.from('todos').select('*').limit(1);
  if (error) {
    if (error.code === '42P01') {
      console.log("✅ Frontend Connection Successful! (Note: 'todos' table does not exist, but we reached the database)");
    } else {
      console.error("❌ Frontend Connection Failed:", error);
    }
  } else {
    console.log("✅ Frontend Connection Successful! Fetched data:", data);
  }
}
testConnection();
