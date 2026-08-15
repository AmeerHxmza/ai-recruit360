import { createClient } from '@supabase/supabase-js';

const url = "https://hkybdnbrrdjkrotwftrn.supabase.co";
const key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhreWJkbmJycmRqa3JvdHdmdHJuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY3Njc1NjEsImV4cCI6MjEwMjM0MzU2MX0.n6CfsNz32OH-jPK0unDY9outlr0kFHRIlwKqN6pW4ss";

const supabase = createClient(url, key);
console.log("Supabase Client Created successfully!");
const { data, error } = await supabase.from('jobs').select('*');
console.log("Data fetched from Supabase jobs table:", data, "Error:", error);
