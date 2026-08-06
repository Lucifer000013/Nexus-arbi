import { createClient } from "@/lib/supabase/server";
import type { AppUser } from "@/lib/types";

export interface CurrentUser {
  authId: string;
  email: string;
  profile: AppUser | null;
}

/**
 * Resolves the signed-in auth user and, if onboarding has completed for
 * them, their matching row in public.users (joined by email - see
 * auth_user_row() in the migration for why).
 */
export async function getCurrentUser(): Promise<CurrentUser | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !user.email) return null;

  const { data: profile } = await supabase
    .from("users")
    .select("*")
    .eq("email", user.email)
    .eq("archived", false)
    .maybeSingle();

  return { authId: user.id, email: user.email, profile: profile ?? null };
}
