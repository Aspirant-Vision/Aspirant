import { UserRole, RolePermissions } from "@/types/auth.types";

/**
 * Role Permission Matrices for Role-Based Access Control (RBAC).
 */
export const ROLE_PERMISSIONS: Record<UserRole, RolePermissions> = {
  super_admin: {
    canAccessAdmin: true,
    canManageColleges: true,
    canManageLeads: true,
    canManageUsers: true,
    canAccessCounseling: true,
  },
  admin: {
    canAccessAdmin: true,
    canManageColleges: true,
    canManageLeads: true,
    canManageUsers: false,
    canAccessCounseling: true,
  },
  counsellor: {
    canAccessAdmin: true, // Has access to staff portal for CRM and lead assignment
    canManageColleges: false,
    canManageLeads: true,
    canManageUsers: false,
    canAccessCounseling: true,
  },
  student: {
    canAccessAdmin: false,
    canManageColleges: false,
    canManageLeads: false,
    canManageUsers: false,
    canAccessCounseling: false,
  },
};

export function hasPermission(
  role: UserRole | null | undefined,
  permission: keyof RolePermissions
): boolean {
  if (!role) return false;
  return Boolean(ROLE_PERMISSIONS[role]?.[permission]);
}

export function isSuperAdmin(role: UserRole | null | undefined): boolean {
  return role === "super_admin";
}

export function isAdmin(role: UserRole | null | undefined): boolean {
  return role === "admin" || role === "super_admin";
}

export function isCounsellor(role: UserRole | null | undefined): boolean {
  return role === "counsellor";
}

export function isStaff(role: UserRole | null | undefined): boolean {
  return role === "super_admin" || role === "admin" || role === "counsellor";
}

export function isStudent(role: UserRole | null | undefined): boolean {
  return role === "student";
}
