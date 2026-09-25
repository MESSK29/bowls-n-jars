import os
import psycopg2
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(__file__), ".env"))
DATABASE_URL = os.getenv("DATABASE_URL")

def run_migration():
    if not DATABASE_URL:
        print("DATABASE_URL not set in .env")
        return

    conn = psycopg2.connect(DATABASE_URL)
    cur = conn.cursor()
    
    try:
        print("Running migration for google sheets fields...")
        
        # We can drop the doc columns safely if there's no real data, or just add the new ones
        # Since this is a new feature and there were no Google Docs actually implemented 
        # (they were mock only), dropping is fine. But for safety, we'll just add new ones.
        
        cur.execute("""
            ALTER TABLE customer_call_batches 
            ADD COLUMN IF NOT EXISTS google_sheet_id VARCHAR,
            ADD COLUMN IF NOT EXISTS google_sheet_url VARCHAR,
            ADD COLUMN IF NOT EXISTS google_sheet_tab_name VARCHAR,
            ADD COLUMN IF NOT EXISTS google_sheet_tab_id VARCHAR;
        """)
        
        conn.commit()
        print("Migration successful.")
        
    except Exception as e:
        print(f"Error during migration: {e}")
        conn.rollback()
    finally:
        cur.close()
        conn.close()

if __name__ == "__main__":
    run_migration()
