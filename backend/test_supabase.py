import os
from dotenv import load_dotenv
from supabase import create_client, Client

load_dotenv()
supabase_url = os.environ.get("SUPABASE_URL")
supabase_key = os.environ.get("SUPABASE_KEY")

try:
    supabase: Client = create_client(supabase_url, supabase_key)
    print("Testing Backend Supabase Connection...")
    response = supabase.table('todos').select("*").limit(1).execute()
    print("✅ Backend Connection Successful! Fetched data:", response.data)
except Exception as e:
    if 'relation "public.todos" does not exist' in str(e) or '42P01' in str(e):
        print("✅ Backend Connection Successful! (Note: 'todos' table does not exist, but we reached the database)")
    else:
        print("❌ Backend Connection Failed:", e)
