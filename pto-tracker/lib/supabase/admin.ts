import { createClient as createSupabaseClient } from "@supabase/supabase-js";

// Service-role client for privileged server-side writes (route handlers
// only). Bypasses RLS, so every caller MUST verify the requester's session
// and role itself before using this.
//
// Untyped on purpose: the installed supabase-js/ssr versions resolve a
// hand-written Database generic to `never` (schema shape mismatch across
// their recent generic rework). Call sites cast rows to the interfaces in
// lib/types.ts instead.
export function createAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}
