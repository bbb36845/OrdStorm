#!/usr/bin/env python3
"""
Import Danish words into Supabase database.
Run with: python3 scripts/import_words.py
"""

import os
import sys

# Check for required package
try:
    from supabase import create_client, Client
except ImportError:
    print("Installing supabase package...")
    os.system(f"{sys.executable} -m pip install supabase")
    from supabase import create_client, Client

# Supabase credentials
SUPABASE_URL = "https://ktglmdwhoqqpooekfbmg.supabase.co"
SUPABASE_SERVICE_KEY = os.environ.get("SUPABASE_SERVICE_KEY")

if not SUPABASE_SERVICE_KEY:
    print("Error: SUPABASE_SERVICE_KEY environment variable not set")
    print("Get it from: https://supabase.com/dashboard/project/ktglmdwhoqqpooekfbmg/settings/api")
    sys.exit(1)

def main():
    # Initialize Supabase client
    supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)

    # Read cleaned words file
    words_file = "/tmp/danish_words_clean.txt"
    if not os.path.exists(words_file):
        print(f"Error: {words_file} not found. Run the cleanup command first.")
        sys.exit(1)

    with open(words_file, 'r', encoding='utf-8') as f:
        words = [line.strip() for line in f if line.strip()]

    print(f"Loaded {len(words)} words")

    # Insert in batches of 1000
    batch_size = 1000
    total_inserted = 0

    for i in range(0, len(words), batch_size):
        batch = words[i:i+batch_size]
        data = [{"word": word} for word in batch]

        try:
            result = supabase.table("danish_words").upsert(data, on_conflict="word").execute()
            total_inserted += len(batch)
            print(f"Inserted batch {i//batch_size + 1}/{(len(words)-1)//batch_size + 1} ({total_inserted}/{len(words)} words)")
        except Exception as e:
            print(f"Error inserting batch: {e}")
            continue

    print(f"\nDone! Inserted {total_inserted} words into danish_words table.")

if __name__ == "__main__":
    main()
