import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Client-side client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

let supabase: SupabaseClient | null = null;
if (supabaseUrl && supabaseAnonKey && !supabaseUrl.includes('YOUR_URL_HERE')) {
  supabase = createClient(supabaseUrl, supabaseAnonKey);
} else {
  console.warn('Supabase credentials for client are not configured. Profile features may be disabled.');
}

// Server-side (admin) client
let supabaseAdmin: SupabaseClient | null = null;
if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
    const adminUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const adminKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (adminUrl && adminKey) {
        supabaseAdmin = createClient(adminUrl, adminKey, {
            auth: {
                autoRefreshToken: false,
                persistSession: false
            }
        });
    }
} else {
    console.warn('Supabase service role key is not configured. Write profile features will be disabled.');
}


export { supabase, supabaseAdmin };
