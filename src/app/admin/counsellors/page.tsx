import React from "react";
import Link from "next/link";
import { requireAdmin } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/crm/page-header";
import { DataTableContainer } from "@/components/crm/data-table";
import { StatusBadge } from "@/components/crm/status-badge";
import { EmptyState } from "@/components/crm/empty-state";
import { Button } from "@/components/ui/button";
import { UserCheck, UserPlus, Mail, Calendar, ShieldCheck } from "lucide-react";

export default async function AdminCounsellorsPage() {
  await requireAdmin("/admin/login");

  const supabase = await createClient();

  // Query actual staff records from profiles where role is not student
  const { data: staffProfiles, error } = await supabase
    .from("profiles")
    .select("id, full_name, email, phone, role, account_status, created_at")
    .in("role", ["counsellor", "admin", "super_admin"])
    .order("created_at", { ascending: false });

  const staff = staffProfiles || [];

  return (
    <div className="space-y-6">
      <PageHeader
        breadcrumbs={[{ label: "Counsellors & Staff" }]}
        title="Staff & Counsellor Directory"
        description="Authorized admission counsellors, regional academic advisors, and platform administrators."
      >
        <Link href="/admin/settings">
          <Button variant="primary" size="sm" className="text-xs">
            <UserPlus className="w-3.5 h-3.5 mr-1.5" />
            <span>Invite Staff Member</span>
          </Button>
        </Link>
      </PageHeader>

      {staff.length === 0 ? (
        <EmptyState
          icon={UserCheck}
          title="No Counsellors Registered Yet"
          description="No counsellor or staff accounts have completed registration. Send an invitation to onboard your first admission counsellor."
          action={
            <Link href="/admin/settings">
              <Button variant="primary" size="sm" className="text-xs">
                Send Staff Invitation
              </Button>
            </Link>
          }
        />
      ) : (
        <DataTableContainer>
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-gray-200/80 bg-gray-50/50 text-gray-500 font-semibold">
                <th className="py-3.5 px-6">Staff Member</th>
                <th className="py-3.5 px-6">Assigned Role</th>
                <th className="py-3.5 px-6">Account Status</th>
                <th className="py-3.5 px-6">Contact Details</th>
                <th className="py-3.5 px-6 text-right">Joined Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-700">
              {staff.map((member) => (
                <tr key={member.id} className="hover:bg-gray-50/70 transition-colors">
                  <td className="py-3.5 px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-red-100 text-primary font-bold text-xs flex items-center justify-center shrink-0">
                        {member.full_name?.charAt(0).toUpperCase() || member.email.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">
                          {member.full_name || "Unnamed Staff"}
                        </div>
                        <div className="text-[11px] text-gray-500">{member.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-6">
                    <StatusBadge status={member.role} type="role" />
                  </td>
                  <td className="py-3.5 px-6">
                    <StatusBadge status={member.account_status} type="account" />
                  </td>
                  <td className="py-3.5 px-6 text-gray-500">
                    <div>{member.phone || "No phone listed"}</div>
                  </td>
                  <td className="py-3.5 px-6 text-gray-500 text-right">
                    {new Date(member.created_at).toLocaleDateString("en-IN", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </DataTableContainer>
      )}
    </div>
  );
}
