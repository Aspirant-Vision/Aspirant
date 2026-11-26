import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { UserProfile, UserRole } from "@/types/auth.types";
import { isAdmin, isCounsellor } from "./roles";
import { UnauthorizedError } from "@/lib/database/error";

/**
 * Retrieves the currently authenticated Supabase user on the server.
 */
export async function getCurrentUser() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) return null;
    return user;
  } catch (error) {
    return null;
  }
}

/**
 * Retrieves all assigned roles for a given user from public.user_roles.
 */
export async function getUserRoles(userId: string): Promise<UserRole[]> {
  try {
    const supabase = await createClient();
    const { data: roleRecords, error } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId);

    if (error || !roleRecords || roleRecords.length === 0) {
      return ["student"];
    }

    return roleRecords.map((r) => r.role as UserRole);
  } catch {
    return ["student"];
  }
}

/**
 * Retrieves the profile of the currently authenticated user from PostgreSQL.
 * Cross-references public.user_roles for authoritative RBAC.
 */
export async function getCurrentProfile(): Promise<UserProfile | null> {
  try {
    const user = await getCurrentUser();
    if (!user) return null;

    const supabase = await createClient();
    const [profileRes, rolesRes] = await Promise.all([
      supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle(),
      supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id),
    ]);

    const profileData = profileRes.data as (import("@/types/database.types").Database["public"]["Tables"]["profiles"]["Row"]) | null;
    const userRoles = rolesRes.data?.map((r) => r.role as UserRole) || [];

    // Highest precedence role
    let primaryRole: UserRole = "student";
    if (userRoles.includes("super_admin")) primaryRole = "super_admin";
    else if (userRoles.includes("admin")) primaryRole = "admin";
    else if (userRoles.includes("counsellor")) primaryRole = "counsellor";
    else if (profileData?.role) primaryRole = profileData.role;

    if (!profileData) {
      return {
        id: user.id,
        email: user.email || "",
        fullName: (user.user_metadata?.full_name as string) || null,
        phone: user.phone || null,
        avatarUrl: (user.user_metadata?.avatar_url as string) || null,
        role: primaryRole,
        accountStatus: "active",
        city: null,
        state: null,
        isVerified: Boolean(user.email_confirmed_at),
        createdAt: user.created_at,
        updatedAt: user.updated_at || user.created_at,
      };
    }

    return {
      id: profileData.id,
      email: profileData.email,
      fullName: profileData.full_name,
      phone: profileData.phone,
      avatarUrl: profileData.avatar_url,
      role: primaryRole,
      accountStatus: profileData.account_status,
      city: profileData.city,
      state: profileData.state,
      isVerified: profileData.is_verified,
      createdAt: profileData.created_at,
      updatedAt: profileData.updated_at,
    };
  } catch (error) {
    return null;
  }
}

/**
 * Requires an authenticated user session. Redirects to /login if unauthenticated.
 */
export async function requireAuth(returnTo?: string): Promise<UserProfile> {
  const profile = await getCurrentProfile();
  if (!profile) {
    const redirectParam = returnTo ? `?redirect=${encodeURIComponent(returnTo)}` : "";
    redirect(`/login${redirectParam}`);
  }

  if (profile.accountStatus !== "active") {
    redirect(`/login?error=${encodeURIComponent("Your account has been suspended or deactivated.")}`);
  }

  return profile;
}

/**
 * Requires one of the specified roles. Redirects or throws if unauthorized.
 */
export async function requireRole(
  allowedRoles: UserRole[],
  returnTo?: string
): Promise<UserProfile> {
  const profile = await requireAuth(returnTo);

  if (!allowedRoles.includes(profile.role)) {
    if (allowedRoles.includes("admin") || allowedRoles.includes("counsellor")) {
      redirect(`/admin/login?error=${encodeURIComponent("Access denied: Staff privileges required.")}`);
    }
    redirect(`/login?error=${encodeURIComponent("Access denied: You do not have permission for that area.")}`);
  }

  return profile;
}

/**
 * Enforces Administrator or Super Administrator access.
 */
export async function requireAdmin(returnTo = "/admin/dashboard"): Promise<UserProfile> {
  return requireRole(["admin", "super_admin"], returnTo);
}

/**
 * Enforces Super Administrator exclusive access.
 */
export async function requireSuperAdmin(returnTo = "/admin/dashboard"): Promise<UserProfile> {
  return requireRole(["super_admin"], returnTo);
}

/**
 * Enforces Counsellor or Administrator access.
 */
export async function requireCounsellor(returnTo = "/admin/leads"): Promise<UserProfile> {
  return requireRole(["counsellor", "admin", "super_admin"], returnTo);
}
