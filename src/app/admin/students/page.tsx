import React from "react";
import Link from "next/link";
import { requireAuth } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/crm/page-header";
import { EmptyState } from "@/components/crm/empty-state";
import { MetricCard } from "@/components/crm/metric-card";
import { StatusBadge } from "@/components/crm/status-badge";
import { DataTableContainer } from "@/components/crm/data-table";
import { Button } from "@/components/ui/button";
import { Users, Download, ShieldCheck, Mail, MapPin } from "lucide-react";

export default async function AdminStudentsPage() {
  await requireAuth("/admin/login");

  const supabase = await createClient();

  const [countRes, verifiedCountRes, studentsRes] = await Promise.all([
    supabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "student"),
    supabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "student").eq("is_verified", true),
    supabase
      .from("profiles")
      .select("id, full_name, email, phone, city, state, is_verified, account_status, created_at")
      .eq("role", "student")
      .order("created_at", { ascending: false })
      .limit(10),
  ]);

  const totalStudents = countRes.count ?? 0;
  const verifiedStudents = verifiedCountRes.count ?? 0;
  const students = studentsRes.data || [];

  return (
    <div className="space-y-6">
      <PageHeader
        breadcrumbs={[{ label: "Students" }]}
        title="Registered Students Roster"
        description="Verified student applicant directory, admission test scores (NEET/JEE/CAT), target preferences, and document records."
      >
        <Button variant="outline" size="sm" className="text-xs">
          <Download className="w-3.5 h-3.5 mr-1.5" />
          <span>Export Student List</span>
        </Button>
      </PageHeader>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <MetricCard
          title="Total Registered"
          value={totalStudents}
          icon={Users}
          colorVariant="emerald"
          subtitle="Aspirant accounts"
        />
        <MetricCard
          title="Email Verified"
          value={verifiedStudents}
          icon={ShieldCheck}
          colorVariant="blue"
          subtitle="Confirmed identities"
        />
        <MetricCard
          title="Profile Completeness"
          value="Academic Ranks"
          icon={MapPin}
          colorVariant="purple"
          subtitle="Ready for matching"
        />
      </div>

      {students.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No Students Registered Yet"
          description="When students register through `/register`, their profiles and contact credentials will be securely listed here."
        />
      ) : (
        <DataTableContainer>
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-gray-200/80 bg-gray-50/50 text-gray-500 font-semibold">
                <th className="py-3.5 px-6">Student Name</th>
                <th className="py-3.5 px-6">Email Address</th>
                <th className="py-3.5 px-6">Contact Phone</th>
                <th className="py-3.5 px-6">Location</th>
                <th className="py-3.5 px-6">Status</th>
                <th className="py-3.5 px-6 text-right">Registered</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-700">
              {students.map((student) => (
                <tr key={student.id} className="hover:bg-gray-50/70 transition-colors">
                  <td className="py-3.5 px-6 font-semibold text-gray-900">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center justify-center shrink-0">
                        {student.full_name?.charAt(0).toUpperCase() || student.email.charAt(0).toUpperCase()}
                      </div>
                      <span>{student.full_name || "Aspirant Student"}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-6 text-gray-500">{student.email}</td>
                  <td className="py-3.5 px-6 text-gray-500">{student.phone || "Not provided"}</td>
                  <td className="py-3.5 px-6 text-gray-500">
                    {student.city && student.state ? `${student.city}, ${student.state}` : "India"}
                  </td>
                  <td className="py-3.5 px-6">
                    <StatusBadge status={student.account_status} type="account" />
                  </td>
                  <td className="py-3.5 px-6 text-gray-400 text-right">
                    {new Date(student.created_at).toLocaleDateString("en-IN", {
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
