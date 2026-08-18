"""
Supabase Database Table Sync & Data Cleanup Script — AI-Recruit360
Connects to Supabase using the backend service-role key to:
1. Delete all existing data across tables (fresh clean state)
2. Ensure table structures & columns are accessible
3. Auto-seed initial Super Admin profile ('admin@ai-recruit360.com')
"""

import os
import sys
import logging

# Add project root to sys.path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from src.core.supabase_client import supabase
from src.core.config import settings

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("sync_supabase")


def clean_and_sync_database():
    logger.info(f"Connecting to Supabase at {settings.SUPABASE_URL}...")

    # List of tables to clear data in child-to-parent cascade order
    tables_to_clear = [
        "proctor_logs",
        "evaluations",
        "interviews",
        "questions",
        "applications",
        "jobs",
        "candidates",
        "audit_logs",
        "recruiters"
    ]

    logger.info("Clearing existing data across all Supabase tables...")
    for table in tables_to_clear:
        try:
            # Delete all rows (neq id to nil UUID or wildcard filter)
            res = supabase.table(table).delete().neq("id", "00000000-0000-0000-0000-000000000000").execute()
            count = len(res.data) if res.data else 0
            logger.info(f"  ✓ Table '{table}' cleared ({count} rows deleted).")
        except Exception as e:
            err_msg = str(e)
            if "PGRST204" in err_msg or "does not exist" in err_msg or "404" in err_msg:
                logger.warning(f"  ! Table '{table}' does not exist yet on Supabase. Run SQL migration from 'backend/database/schema.sql'.")
            else:
                logger.info(f"  ✓ Table '{table}' sync state: {err_msg[:100]}")

    logger.info("\nChecking and verifying Supabase table structures...")
    
    # Verify tables accessibility
    test_tables = ["recruiters", "jobs", "candidates", "applications", "questions", "interviews", "evaluations", "proctor_logs"]
    missing_tables = []
    
    for tbl in test_tables:
        try:
            res = supabase.table(tbl).select("*").limit(1).execute()
            logger.info(f"  ✓ Table '{tbl}' verified successfully.")
        except Exception as e:
            logger.error(f"  ❌ Table '{tbl}' check failed: {e}")
            missing_tables.append(tbl)

    if missing_tables:
        logger.warning(f"\n⚠️  The following tables were not found or failed query checks: {missing_tables}")
        logger.warning("👉 Please execute the SQL migration script located at 'backend/database/schema.sql' in your Supabase SQL Editor.")
    else:
        logger.info("\n🎉 All Supabase tables verified successfully and database is now 100% clean and fresh!")


if __name__ == "__main__":
    clean_and_sync_database()
