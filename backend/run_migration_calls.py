import os
from sqlalchemy import create_engine, text
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
print(f"Connecting to {DATABASE_URL[:30]}...")

engine = create_engine(DATABASE_URL)
with engine.begin() as conn:
    print("Running migration for calls...")
    with open("migrations/002_create_calls_tables.sql", "r") as f:
        sql = f.read()
    
    conn.execute(text(sql))
    print("Migration successful.")
