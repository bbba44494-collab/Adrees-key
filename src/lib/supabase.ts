import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Browser client (uses anon key)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Helper to create an admin client using the service role key (for server scripts only)
export function createAdminClient(serviceRoleKey: string): SupabaseClient {
  return createClient(supabaseUrl, serviceRoleKey);
}

export default supabase;
