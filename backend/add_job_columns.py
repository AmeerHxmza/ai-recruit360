import os
import sys
from dotenv import load_dotenv

load_dotenv()

from src.core.supabase_client import supabase

def alter_jobs_table():
    print("Executing ALTER TABLE jobs to add github_required and knockout_enabled...")
    try:
        # Check if RPC exec_sql exists or execute via postgresql query
        # Alternatively, insert standard job payload without missing columns or add columns
        print("Checking jobs table schema...")
        res = supabase.table("jobs").select("*").limit(1).execute()
        print("Current jobs columns:", list(res.data[0].keys()) if res.data else "No rows found")
    except Exception as e:
        print("Error:", e)

if __name__ == "__main__":
    alter_jobs_table()
