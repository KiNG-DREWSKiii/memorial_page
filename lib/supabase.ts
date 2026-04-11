import { createClient } from "@supabase/supabase-js";

import { supabaseServiceRoleKey, supabaseUrl } from "@/lib/config";

export function isSupabaseConfigured() {
  return Boolean(supabaseUrl && supabaseServiceRoleKey);
}

export function createSupabaseAdminClient() {
  if (!isSupabaseConfigured()) {
    throw new Error("Supabase is not configured.");
  }

  return createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
}
