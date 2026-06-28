import { createClient } from '@supabase/supabase-js';

let supabase = null;

function getSupabaseClient() {
  if (!supabase) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      throw new Error(
        'Missing Supabase environment variables. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY.'
      );
    }

    supabase = createClient(supabaseUrl, supabaseKey);
  }
  return supabase;
}

export const db = new Proxy({}, {
  get(_, prop) {
    return getSupabaseClient()[prop];
  },
});

export async function getDb() {
  return getSupabaseClient();
}

export default db;
