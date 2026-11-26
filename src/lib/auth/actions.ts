"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  studentRegisterSchema,
  studentLoginSchema,
  staffLoginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  staffInviteSchema,
  acceptStaffInviteSchema,
  getSafeRedirectUrl,
  StudentRegisterInput,
  StudentLoginInput,
  StaffLoginInput,
  ForgotPasswordInput,
  ResetPasswordInput,
  StaffInviteInput,
  AcceptStaffInviteInput,
} from "@/lib/validation/auth";
import { sanitizeEmail, sanitizePhone, sanitizeString } from "@/lib/security/sanitize";
import { ApiResponse } from "@/types/api.types";
import { getUserRoles, requireAdmin } from "./session";
import { env } from "@/lib/validation/env";
import { UserRole } from "@/types/auth.types";
import { enforceRateLimit } from "@/lib/security/rate-limit";
import crypto from "crypto";

// ------------------------------------------------------------------------------
// 1. STUDENT REGISTRATION ACTION
// ------------------------------------------------------------------------------
export async function registerStudentAction(
  data: StudentRegisterInput
): Promise<ApiResponse<{ userId: string; requiresVerification: boolean }>> {
  try {
    const parsed = studentRegisterSchema.safeParse(data);
    if (!parsed.success) {
      return {
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: parsed.error.issues[0]?.message || "Invalid registration data",
          details: parsed.error.issues.map((i) => ({
            code: i.code,
            message: i.message,
            field: i.path.join("."),
          })),
        },
      };
    }

    const rateLimitError = await enforceRateLimit("registerStudentAction", "register");
    if (rateLimitError) {
      return {
        success: false,
        error: { code: "RATE_LIMIT_EXCEEDED", message: rateLimitError.error },
      };
    }

    const email = sanitizeEmail(parsed.data.email);
    const phone = sanitizePhone(parsed.data.phone);
    const fullName = sanitizeString(parsed.data.fullName);

    const supabase = await createClient();

    // Call Supabase Auth - Enforce student role assignment strictly
    const siteUrl = env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password: parsed.data.password,
      options: {
        data: {
          full_name: fullName,
          phone,
          role: "student" as UserRole, // Strictly enforced on server
        },
        emailRedirectTo: `${siteUrl}/auth/callback?next=/student/dashboard`,
      },
    });

    if (authError) {
      if (authError.message.includes("already registered")) {
        return {
          success: false,
          error: {
            code: "USER_ALREADY_EXISTS",
            message: "An account with this email address already exists. Please log in instead.",
          },
        };
      }

      return {
        success: false,
        error: {
          code: "AUTH_SIGNUP_FAILED",
          message: authError.message || "Failed to create student account.",
        },
      };
    }

    const userId = authData.user?.id || "";
    // If Supabase has email confirmations enabled, user.identities might be empty or session null
    const requiresVerification = !authData.session;

    return {
      success: true,
      data: {
        userId,
        requiresVerification,
      },
    };
  } catch (err) {
    console.error("[registerStudentAction Exception]:", err);
    return {
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message: "An unexpected error occurred during registration. Please try again.",
      },
    };
  }
}

// ------------------------------------------------------------------------------
// 2. STUDENT LOGIN ACTION
// ------------------------------------------------------------------------------
export async function loginAction(
  data: StudentLoginInput
): Promise<ApiResponse<{ redirectTo: string }>> {
  try {
    const parsed = studentLoginSchema.safeParse(data);
    if (!parsed.success) {
      return {
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: parsed.error.issues[0]?.message || "Invalid login credentials",
        },
      };
    }

    const rateLimitError = await enforceRateLimit("loginAction", "auth");
    if (rateLimitError) {
      return {
        success: false,
        error: { code: "RATE_LIMIT_EXCEEDED", message: rateLimitError.error },
      };
    }

    const email = sanitizeEmail(parsed.data.email);
    const supabase = await createClient();

    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password: parsed.data.password,
    });

    if (authError) {
      if (authError.message.includes("Email not confirmed")) {
        return {
          success: false,
          error: {
            code: "EMAIL_NOT_CONFIRMED",
            message: "Your email has not been verified yet. Please check your inbox or request a new verification link.",
          },
        };
      }

      return {
        success: false,
        error: {
          code: "INVALID_CREDENTIALS",
          message: "Invalid email or password. Please check your credentials and try again.",
        },
      };
    }

    if (!authData.user) {
      return {
        success: false,
        error: {
          code: "AUTH_FAILED",
          message: "Unable to establish authenticated session.",
        },
      };
    }

    // Verify account status from PostgreSQL
    const { data: profile } = await supabase
      .from("profiles")
      .select("account_status")
      .eq("id", authData.user.id)
      .maybeSingle();

    if (profile && profile.account_status !== "active") {
      await supabase.auth.signOut();
      return {
        success: false,
        error: {
          code: "ACCOUNT_SUSPENDED",
          message: `Your account status is ${profile.account_status}. Please contact Aspirant Vision support.`,
        },
      };
    }

    // Determine safe redirect
    const safeDestination = getSafeRedirectUrl(
      parsed.data.redirectUrl,
      "/student/dashboard"
    );

    return {
      success: true,
      data: {
        redirectTo: safeDestination,
      },
    };
  } catch (err) {
    console.error("[loginAction Exception]:", err);
    return {
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message: "An unexpected error occurred during login. Please try again.",
      },
    };
  }
}

// ------------------------------------------------------------------------------
// 3. STAFF LOGIN ACTION (Admins & Counsellors ONLY)
// ------------------------------------------------------------------------------
export async function staffLoginAction(
  data: StaffLoginInput
): Promise<ApiResponse<{ redirectTo: string; role: UserRole }>> {
  try {
    const parsed = staffLoginSchema.safeParse(data);
    if (!parsed.success) {
      return {
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: parsed.error.issues[0]?.message || "Invalid staff credentials",
        },
      };
    }

    const rateLimitError = await enforceRateLimit("staffLoginAction", "auth");
    if (rateLimitError) {
      return {
        success: false,
        error: { code: "RATE_LIMIT_EXCEEDED", message: rateLimitError.error },
      };
    }

    const email = sanitizeEmail(parsed.data.email);
    const supabase = await createClient();

    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password: parsed.data.password,
    });

    if (authError || !authData.user) {
      return {
        success: false,
        error: {
          code: "INVALID_CREDENTIALS",
          message: "Invalid staff email or password.",
        },
      };
    }

    // Authoritative RBAC check via public.user_roles
    const roles = await getUserRoles(authData.user.id);
    const hasStaffPrivileges = roles.some((r) =>
      ["admin", "super_admin", "counsellor"].includes(r)
    );

    if (!hasStaffPrivileges) {
      // User is a student attempting to log into staff portal
      await supabase.auth.signOut();
      return {
        success: false,
        error: {
          code: "UNAUTHORIZED_STAFF_ACCESS",
          message: "Access Denied: You do not hold staff privileges to access this enterprise administration portal.",
        },
      };
    }

    // Determine staff primary role
    let primaryRole: UserRole = "counsellor";
    if (roles.includes("super_admin")) primaryRole = "super_admin";
    else if (roles.includes("admin")) primaryRole = "admin";

    // Staff default destinations
    const defaultDestination = primaryRole === "counsellor" ? "/admin/leads" : "/admin/dashboard";
    const redirectTo = getSafeRedirectUrl(parsed.data.redirectUrl, defaultDestination);

    return {
      success: true,
      data: {
        redirectTo,
        role: primaryRole,
      },
    };
  } catch (err) {
    console.error("[staffLoginAction Exception]:", err);
    return {
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message: "An unexpected error occurred during staff login. Please try again.",
      },
    };
  }
}

// ------------------------------------------------------------------------------
// 4. FORGOT PASSWORD ACTION
// ------------------------------------------------------------------------------
export async function forgotPasswordAction(
  data: ForgotPasswordInput
): Promise<ApiResponse<{ message: string }>> {
  try {
    const parsed = forgotPasswordSchema.safeParse(data);
    if (!parsed.success) {
      return {
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "Please provide a valid email address.",
        },
      };
    }

    const rateLimitError = await enforceRateLimit("forgotPasswordAction", "auth");
    if (rateLimitError) {
      return {
        success: false,
        error: { code: "RATE_LIMIT_EXCEEDED", message: rateLimitError.error },
      };
    }

    const email = sanitizeEmail(parsed.data.email);
    const supabase = await createClient();
    const siteUrl = env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

    await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${siteUrl}/auth/callback?next=/reset-password`,
    });

    // Security best practice: Always return generic success to prevent email enumeration
    return {
      success: true,
      data: {
        message: "If an account with that email exists, a password reset link has been dispatched to your inbox.",
      },
    };
  } catch (err) {
    return {
      success: true,
      data: {
        message: "If an account with that email exists, a password reset link has been dispatched to your inbox.",
      },
    };
  }
}

// ------------------------------------------------------------------------------
// 5. RESET PASSWORD ACTION
// ------------------------------------------------------------------------------
export async function resetPasswordAction(
  data: ResetPasswordInput
): Promise<ApiResponse<{ message: string }>> {
  try {
    const parsed = resetPasswordSchema.safeParse(data);
    if (!parsed.success) {
      return {
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: parsed.error.issues[0]?.message || "Invalid password format.",
        },
      };
    }

    const supabase = await createClient();
    const { error } = await supabase.auth.updateUser({
      password: parsed.data.password,
    });

    if (error) {
      return {
        success: false,
        error: {
          code: "PASSWORD_UPDATE_FAILED",
          message: error.message || "Failed to update your password.",
        },
      };
    }

    return {
      success: true,
      data: {
        message: "Your password has been successfully updated. You may now log in.",
      },
    };
  } catch (err) {
    return {
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message: "An unexpected error occurred while resetting your password.",
      },
    };
  }
}

// ------------------------------------------------------------------------------
// 6. LOGOUT ACTION
// ------------------------------------------------------------------------------
export async function logoutAction(): Promise<ApiResponse<{ success: true }>> {
  try {
    const supabase = await createClient();
    await supabase.auth.signOut();
    return {
      success: true,
      data: { success: true },
    };
  } catch {
    return {
      success: true,
      data: { success: true },
    };
  }
}

// ------------------------------------------------------------------------------
// 7. SEND STAFF INVITATION ACTION (Admins & Super Admins Only)
// ------------------------------------------------------------------------------
export async function sendStaffInviteAction(
  data: StaffInviteInput
): Promise<
  ApiResponse<{
    email: string;
    expiresAt: string;
    invitationToken: string;
    invitationUrl: string;
  }>
> {
  try {
    // 1. Authorize: Inviting user must be an administrator
    const adminProfile = await requireAdmin();

    const parsed = staffInviteSchema.safeParse(data);
    if (!parsed.success) {
      return {
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: parsed.error.issues[0]?.message || "Invalid invitation payload.",
        },
      };
    }

    const email = sanitizeEmail(parsed.data.email);
    const role = parsed.data.role as UserRole;

    // Generate cryptographic token
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(); // 48h expiration

    const supabase = await createClient();

    // Insert invitation
    const { error: inviteError } = await supabase
      .from("staff_invitations")
      .insert({
        email,
        role,
        token,
        invited_by: adminProfile.id,
        expires_at: expiresAt,
      });

    if (inviteError) {
      return {
        success: false,
        error: {
          code: "INVITATION_CREATION_FAILED",
          message: inviteError.message || "Failed to create staff invitation.",
        },
      };
    }

    // Log in audit log
    await supabase.from("audit_logs").insert({
      actor_id: adminProfile.id,
      action: "STAFF_INVITATION_DISPATCHED",
      entity_type: "staff_invitations",
      entity_id: email,
      new_values: { email, role, expiresAt },
    });

    const siteUrl = env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
    const invitationUrl = `${siteUrl}/accept-invite?token=${token}`;

    return {
      success: true,
      data: {
        email,
        expiresAt,
        invitationToken: token,
        invitationUrl,
      },
    };
  } catch (err: unknown) {
    const error = err as { message?: string };
    return {
      success: false,
      error: {
        code: "UNAUTHORIZED",
        message: error.message || "Failed to issue staff invitation.",
      },
    };
  }
}

// ------------------------------------------------------------------------------
// 8. ACCEPT STAFF INVITATION ACTION
// ------------------------------------------------------------------------------
export async function acceptStaffInviteAction(
  data: AcceptStaffInviteInput
): Promise<ApiResponse<{ email: string; role: UserRole }>> {
  try {
    const parsed = acceptStaffInviteSchema.safeParse(data);
    if (!parsed.success) {
      return {
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: parsed.error.issues[0]?.message || "Invalid invitation acceptance details.",
        },
      };
    }

    const token = sanitizeString(parsed.data.token);
    const fullName = sanitizeString(parsed.data.fullName);
    const phone = parsed.data.phone ? sanitizePhone(parsed.data.phone) : null;

    // Use admin client to query and execute privileged account creation
    const adminClient = createAdminClient();

    // Verify token validity
    const { data: invite, error: fetchError } = await adminClient
      .from("staff_invitations")
      .select("*")
      .eq("token", token)
      .is("accepted_at", null)
      .gt("expires_at", new Date().toISOString())
      .single();

    if (fetchError || !invite) {
      return {
        success: false,
        error: {
          code: "INVALID_OR_EXPIRED_TOKEN",
          message: "This staff invitation link is invalid, has expired, or has already been accepted.",
        },
      };
    }

    // Create identity via Supabase Auth Admin API (pre-confirmed email)
    const { data: authData, error: authCreateError } = await adminClient.auth.admin.createUser({
      email: invite.email,
      password: parsed.data.password,
      email_confirm: true,
      user_metadata: {
        full_name: fullName,
        phone,
        role: invite.role,
      },
    });

    if (authCreateError) {
      return {
        success: false,
        error: {
          code: "ACCOUNT_CREATION_FAILED",
          message: authCreateError.message || "Failed to establish staff account.",
        },
      };
    }

    const newUserId = authData.user.id;

    // Ensure profile and authorized staff role in user_roles
    await Promise.all([
      adminClient
        .from("profiles")
        .upsert({
          id: newUserId,
          email: invite.email,
          full_name: fullName,
          phone,
          role: invite.role,
          account_status: "active",
          is_verified: true,
        }),
      adminClient
        .from("user_roles")
        .upsert(
          {
            user_id: newUserId,
            role: invite.role,
          },
          { onConflict: "user_id, role" }
        ),
      adminClient
        .from("staff_invitations")
        .update({ accepted_at: new Date().toISOString() })
        .eq("id", invite.id),
      adminClient.from("audit_logs").insert({
        actor_id: newUserId,
        action: "STAFF_INVITATION_ACCEPTED",
        entity_type: "staff_invitations",
        entity_id: invite.id,
        new_values: { email: invite.email, role: invite.role },
      }),
    ]);

    return {
      success: true,
      data: {
        email: invite.email,
        role: invite.role,
      },
    };
  } catch (err) {
    console.error("[acceptStaffInviteAction Exception]:", err);
    return {
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message: "An unexpected error occurred while accepting staff invitation.",
      },
    };
  }
}
