import { createClient } from '@supabase/supabase-js';

// TODO: Replace with your Supabase project URL and anon key
const supabaseUrl = 'PASTE_YOUR_SUPABASE_URL_HERE';
const supabaseAnonKey = 'PASTE_YOUR_SUPABASE_ANON_KEY_HERE';

if (supabaseUrl === 'PASTE_YOUR_SUPABASE_URL_HERE' || supabaseAnonKey === 'PASTE_YOUR_SUPABASE_ANON_KEY_HERE') {
    console.warn('Supabase credentials are not configured. Please update src/lib/supabase.ts');
}


export const supabase = createClient(supabaseUrl, supabaseAnonKey);
