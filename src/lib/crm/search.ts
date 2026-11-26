"use server";

import { createClient } from "@/lib/supabase/server";
import { getCurrentUser, getUserRoles } from "@/lib/auth/session";
import { hasPermission, isStaff } from "@/lib/auth/roles";
import { UserRole } from "@/types/auth.types";
import { ApiResponse } from "@/types/api.types";

export interface SearchResultItem {
  id: string;
  category: "Colleges" | "Courses" | "Leads" | "Students" | "Applications";
  title: string;
  subtitle: string;
  href: string;
}

export async function searchGlobalAction(
  query: string
): Promise<ApiResponse<SearchResultItem[]>> {
  try {
    const trimmed = query.trim();
    if (!trimmed || trimmed.length < 2) {
      return { success: true, data: [] };
    }

    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: { code: "UNAUTHORIZED", message: "User not authenticated" } };
    }

    const roles = await getUserRoles(user.id);
    const primaryRole: UserRole = roles[0] || "student";

    if (!isStaff(primaryRole)) {
      return { success: false, error: { code: "FORBIDDEN", message: "Only staff can use CRM search" } };
    }

    const supabase = await createClient();
    const results: SearchResultItem[] = [];

    // 1. Search Colleges (Public/Staff discovery)
    const { data: colleges } = await supabase
      .from("colleges")
      .select("id, name, city, state, slug")
      .or(`name.ilike.%${trimmed}%,city.ilike.%${trimmed}%`)
      .limit(4);

    if (colleges) {
      colleges.forEach((c) => {
        results.push({
          id: c.id,
          category: "Colleges",
          title: c.name,
          subtitle: c.city && c.state ? `${c.city}, ${c.state}` : "College Directory",
          href: `/admin/colleges?id=${c.id}`,
        });
      });
    }

    // 2. Search Courses (Programs)
    const { data: courses } = await supabase
      .from("courses")
      .select("id, name, degree_type, stream")
      .or(`name.ilike.%${trimmed}%,stream.ilike.%${trimmed}%`)
      .limit(4);

    if (courses) {
      courses.forEach((crs) => {
        results.push({
          id: crs.id,
          category: "Courses",
          title: crs.name,
          subtitle: crs.stream ? `${crs.stream} • ${crs.degree_type}` : crs.degree_type || "Academic Program",
          href: `/admin/courses?id=${crs.id}`,
        });
      });
    }

    // 3. Search Leads (Only if role has canManageLeads)
    if (hasPermission(primaryRole, "canManageLeads")) {
      const { data: leads } = await supabase
        .from("leads")
        .select("id, full_name, email, phone, status")
        .or(`full_name.ilike.%${trimmed}%,email.ilike.%${trimmed}%,phone.ilike.%${trimmed}%`)
        .limit(4);

      if (leads) {
        leads.forEach((l) => {
          results.push({
            id: l.id,
            category: "Leads",
            title: l.full_name,
            subtitle: `${l.email} • Status: ${l.status}`,
            href: `/admin/leads?id=${l.id}`,
          });
        });
      }
    }

    // 4. Search Students (Only for admin or super_admin)
    if (primaryRole === "admin" || primaryRole === "super_admin") {
      const { data: students } = await supabase
        .from("profiles")
        .select("id, full_name, email, phone")
        .eq("role", "student")
        .or(`full_name.ilike.%${trimmed}%,email.ilike.%${trimmed}%`)
        .limit(4);

      if (students) {
        students.forEach((s) => {
          results.push({
            id: s.id,
            category: "Students",
            title: s.full_name || "Registered Student",
            subtitle: s.email,
            href: `/admin/students?id=${s.id}`,
          });
        });
      }
    }

    return { success: true, data: results };
  } catch (err: unknown) {
    const msg = (err as Error).message || "Global search failed";
    return { success: false, error: { code: "INTERNAL_ERROR", message: msg } };
  }
}
