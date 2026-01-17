import { createClient } from '@supabase/supabase-js';

// Support both env vars and hardcoded fallbacks for Netlify deployment
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://hgddilitfwtyqblttvso.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhnZGRpbGl0Znd0eXFibHR0dnNvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc5NzM5NjQsImV4cCI6MjA4MzU0OTk2NH0.OaplCMXCQtiwpLWAhgWVil6K3pmXSz2j-ptfXDYKp_E';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);