#!/usr/bin/env python3
"""
Fast import of Danish words into Supabase using REST API.
Uses service role key for bulk inserts.
"""

import os
import sys
import json
import urllib.request
import urllib.error

SUPABASE_URL = "https://ktglmdwhoqqpooekfbmg.supabase.co"
SUPABASE_SERVICE_KEY = os.environ.get("SUPABASE_SERVICE_KEY")

if not SUPABASE_SERVICE_KEY:
    print("Error: SUPABASE_SERVICE_KEY environment variable not set")
    print("Get it from: https://supabase.com/dashboard/project/ktglmdwhoqqpooekfbmg/settings/api")
    sys.exit(1)

def insert_batch(words):
    """Insert a batch of words using Supabase REST API."""
    url = f"{SUPABASE_URL}/rest/v1/danish_words"
    headers = {
        "apikey": SUPABASE_SERVICE_KEY,
        "Authorization": f"Bearer {SUPABASE_SERVICE_KEY}",
        "Content-Type": "application/json",
        "Prefer": "resolution=ignore-duplicates"
    }
    data = json.dumps([{"word": w} for w in words]).encode('utf-8')

    req = urllib.request.Request(url, data=data, headers=headers, method='POST')
    try:
        with urllib.request.urlopen(req) as response:
            return True
    except urllib.error.HTTPError as e:
        print(f"  Error: {e.code} - {e.read().decode()}")
        return False

def main():
    words_file = "/tmp/stavekontrol_words.txt"
    if not os.path.exists(words_file):
        print(f"Error: {words_file} not found")
        sys.exit(1)

    with open(words_file, 'r', encoding='utf-8') as f:
        words = [line.strip() for line in f if line.strip()]

    print(f"Loaded {len(words)} words")

    batch_size = 1000
    total = 0
    failed = 0

    for i in range(0, len(words), batch_size):
        batch = words[i:i+batch_size]
        success = insert_batch(batch)
        if success:
            total += len(batch)
        else:
            failed += len(batch)

        pct = (i + len(batch)) / len(words) * 100
        print(f"Progress: {pct:.1f}% ({total} inserted, {failed} failed)")

    print(f"\nDone! Inserted {total} words, {failed} failed.")

if __name__ == "__main__":
    main()
