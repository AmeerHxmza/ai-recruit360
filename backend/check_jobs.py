import os
from dotenv import load_dotenv
from supabase import create_client, Client

load_dotenv()
supabase_url = os.environ.get("SUPABASE_URL")
supabase_key = os.environ.get("SUPABASE_KEY")

try:
    supabase: Client = create_client(supabase_url, supabase_key)
    response = supabase.table('jobs').select('title').execute()
    
    if len(response.data) == 0:
        print("The 'jobs' table exists, but it is currently empty.")
    else:
        titles = [job['title'] for job in response.data if 'title' in job]
        print(f"The 'jobs' table exists! Here are the titles: {titles}")
        
except Exception as e:
    print(f"Failed to query the 'jobs' table. Error: {e}")
