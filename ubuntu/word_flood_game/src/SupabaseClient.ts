import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ktglmdwhoqqpooekfbmg.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt0Z2xtZHdob3FxcG9vZWtmYm1nIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY3MTAxMjQsImV4cCI6MjA2MjI4NjEyNH0.9V5uyngPG2NPwHsu6toR56fAGcdiMDJtjG0KELrHRvs';

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Supabase URL and Anon Key are required. Check your .env file or environment variables.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey); 