import os
from sqlalchemy import create_engine, text
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
print(f"Connecting to {DATABASE_URL[:30]}...")

engine = create_engine(DATABASE_URL)
with engine.begin() as conn:
    print("Running migration...")
    # Make email nullable
    conn.execute(text("ALTER TABLE users ALTER COLUMN email DROP NOT NULL;"))
    print("Dropped NOT NULL constraint on email.")
    
    # Check if unique constraint on phone exists
    try:
        conn.execute(text("ALTER TABLE users ADD CONSTRAINT uq_users_phone UNIQUE (phone);"))
        print("Added UNIQUE constraint on phone.")
    except Exception as e:
        print(f"Unique constraint might already exist or failed: {e}")
        
    print("Migration completed.")
