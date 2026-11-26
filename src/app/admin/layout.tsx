import React from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getCurrentProfile, getUserRoles } from "@/lib/auth/session";
import { isStaff } from "@/lib/auth/roles";
import { UserRole } from "@/types/auth.types";
import { CrmShell } from "@/components/crm/crm-shell";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Check if current request is for the public /admin/login endpoint
  const headerList = await headers();
  const pathname = headerList.get("x-pathname") || "";

  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  // Authoritative staff authentication and RBAC check
  const profile = await getCurrentProfile();
  if (!profile) {
    redirect("/admin/login");
  }

  const roles = await getUserRoles(profile.id);
  const primaryRole: UserRole = profile.role || roles[0] || "student";

  if (!isStaff(primaryRole)) {
    redirect("/admin/login?error=Access+denied.+Administrative+credentials+required.");
  }

  return (
    <CrmShell profile={profile} primaryRole={primaryRole}>
      {children}
    </CrmShell>
  );
}
