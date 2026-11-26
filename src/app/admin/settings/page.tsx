import React from "react";
import { requireAuth, getUserRoles } from "@/lib/auth/session";
import { PageHeader } from "@/components/crm/page-header";
import { InviteStaffForm } from "./invite-staff-form";
import { ShieldCheck, Lock, UserCheck, ShieldAlert, Key } from "lucide-react";

export default async function AdminSettingsPage() {
  const user = await requireAuth("/admin/login");
  const roles = await getUserRoles(user.id);

  return (
    <div className="max-w-5xl space-y-8">
      <PageHeader
        breadcrumbs={[{ label: "Staff & Settings" }]}
        title="Staff Governance & Access Control"
        description="Manage authorized staff invitations, cryptographic access policies, and role-based permissions."
      />

      {/* Staff Invitation Component */}
      <InviteStaffForm />

      {/* RBAC Matrix Explainer Card */}
      <div className="bg-white border border-gray-200/90 rounded-2xl p-6 sm:p-8 space-y-4 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center border border-purple-100">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900 text-sm sm:text-base">
              Active Role-Based Security Policies (RLS)
            </h3>
            <p className="text-xs text-gray-500">
              PostgreSQL Row Level Security enforcement rules active on the production database.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto pt-2">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-gray-100 text-gray-400 font-semibold">
                <th className="py-2.5">Role</th>
                <th className="py-2.5">Leads CRM</th>
                <th className="py-2.5">Colleges & Fees</th>
                <th className="py-2.5">Staff Invitations</th>
                <th className="py-2.5">Database Scope</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-gray-700">
              <tr>
                <td className="py-3 font-bold text-purple-700">Super Admin</td>
                <td className="py-3 text-emerald-700 font-medium">Full Access</td>
                <td className="py-3 text-emerald-700 font-medium">Full Access</td>
                <td className="py-3 text-emerald-700 font-medium">Allowed</td>
                <td className="py-3 text-gray-500">Unrestricted Tenant</td>
              </tr>
              <tr>
                <td className="py-3 font-bold text-red-700">Admin</td>
                <td className="py-3 text-emerald-700 font-medium">Full Access</td>
                <td className="py-3 text-emerald-700 font-medium">Full Access</td>
                <td className="py-3 text-emerald-700 font-medium">Allowed</td>
                <td className="py-3 text-gray-500">Global Operational</td>
              </tr>
              <tr>
                <td className="py-3 font-bold text-emerald-700">Counsellor</td>
                <td className="py-3 text-emerald-700 font-medium">Assigned / Shared</td>
                <td className="py-3 text-gray-400 font-medium">Read Only</td>
                <td className="py-3 text-red-600 font-medium">Restricted</td>
                <td className="py-3 text-gray-500">Leads & Enquiries</td>
              </tr>
              <tr>
                <td className="py-3 font-bold text-blue-700">Student</td>
                <td className="py-3 text-red-600 font-medium">Restricted</td>
                <td className="py-3 text-gray-400 font-medium">Public Discovery</td>
                <td className="py-3 text-red-600 font-medium">Restricted</td>
                <td className="py-3 text-gray-500">Own Profile & Shortlists</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
