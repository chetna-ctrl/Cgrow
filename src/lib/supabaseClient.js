import { createClient } from '@supabase/supabase-js';

// Seedha details yahan paste kar dein
const supabaseUrl = 'https://hgddilitfwtyqblttvso.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhnZGRpbGl0Znd0eXFibHR0dnNvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc5NzM5NjQsImV4cCI6MjA4MzU0OTk2NH0.OaplCMXCQtiwpLWAhgWVil6K3pmXSz2j-ptfXDYKp_E'; // Poori key yahan daalein

export const supabase = createClient(supabaseUrl, supabaseAnonKey);