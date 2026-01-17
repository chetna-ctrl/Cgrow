import { createClient } from '@supabase/supabase-js';

// 1. Try to get from Environment Variables (Netlify/Local .env)
// 2. Fallback to hardcoded credentials (Matching src/lib/supabase.js)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://hgddilitfwtyqblttvso.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhnZGRpbGl0Znd0eXFibHR0dnNvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc5NzM5NjQsImV4cCI6MjA4MzU0OTk2NH0.OaplCMXCQtiwpLWAhgWVil6K3pmXSz2j-ptfXDYKp_E';

if (!import.meta.env.VITE_SUPABASE_URL) {
    console.warn("Agri-OS: Using hardcoded Supabase credentials. For production, set VITE_SUPABASE_URL in your deployment settings.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
