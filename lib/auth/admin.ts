import "server-only";
import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export type AdminProfile = {
  id: string;
  auth_user_id: string;
  display_name: string;
  role: "admin";
};

/**
 * Re-verifies both authentication AND authorization on the server for
 * every admin page/action, independent of the middleware redirect. This
 * is intentional defense-in-depth: middleware alone is never trusted.
 * A logged-in Supabase user who is NOT present in admin_profiles is
 * redirected exactly like an unauthenticated user — no distinguishing
 * error is shown, so the login/authorization boundary can't be probed.
 */
export async function requireAdmin(): Promise<{
  supabase: Awaited<ReturnType<typeof createServerSupabaseClient>>;
  profile: AdminProfile;
}> {
  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin/login");
  }

  // MFA step-up: once a user has a verified factor, a password-only (aal1)
  // session is not enough. `user.factors` comes from the server-verified
  // getUser() above; the AAL call reads the aal claim of that same token.
  // Users without a factor are not forced into MFA yet — enforcement becomes
  // total once MFA is mandated for every admin in the Supabase dashboard.
  const hasVerifiedFactor = (user.factors ?? []).some((factor) => factor.status === "verified");
  const { data: aal, error: aalError } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
  const requiresAal2 = hasVerifiedFactor || aal?.nextLevel === "aal2";
  if (aalError || (requiresAal2 && aal?.currentLevel !== "aal2")) {
    await supabase.auth.signOut();
    redirect("/admin/login");
  }

  const { data: profile } = await supabase
    .from("admin_profiles")
    .select("id, auth_user_id, display_name, role")
    .eq("auth_user_id", user.id)
    .maybeSingle();

  if (!profile) {
    await supabase.auth.signOut();
    redirect("/admin/login");
  }

  return { supabase, profile: profile as AdminProfile };
}
