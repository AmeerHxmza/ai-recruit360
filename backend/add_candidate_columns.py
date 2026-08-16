import os
from dotenv import load_dotenv

load_dotenv()

from src.core.supabase_client import supabase

def update_candidate_columns():
    print("Checking candidates table schema...")
    try:
        res = supabase.table("candidates").select("*").limit(1).execute()
        if res.data:
            print("Current candidates columns in database:", list(res.data[0].keys()))
        else:
            print("Candidates table exists but has 0 rows.")
    except Exception as e:
        print("Error checking table:", e)

    print("\n--- SQL Migration Commands for Supabase SQL Editor ---")
    print("""
ALTER TABLE public.candidates 
ADD COLUMN IF NOT EXISTS gender TEXT,
ADD COLUMN IF NOT EXISTS city TEXT,
ADD COLUMN IF NOT EXISTS mcq_data JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS mcq_score INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS hr_questions JSONB DEFAULT '[]'::jsonb;
    """)

if __name__ == "__main__":
    update_candidate_columns()
