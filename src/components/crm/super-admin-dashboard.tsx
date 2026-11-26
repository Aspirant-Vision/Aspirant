"use client";

import React from "react";
import Link from "next/link";
import { SuperAdminDashboardData } from "@/lib/crm/dashboard-metrics";
import { StatusBadge } from "./status-badge";
import { Button } from "@/components/ui/button";
import {
  Building2,
  BookOpen,
  Inbox,
  Users,
  FileCheck2,
  UserCheck,
  UserPlus,
  Plus,
  ArrowRight,
  Sparkles,
  Award,
  TrendingUp,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Phone,
  Mail,
  GraduationCap,
  Activity,
  AlertCircle,
  BarChart3,
} from "lucide-react";

interface SuperAdminDashboardProps {
  data: SuperAdminDashboardData;
  displayName: string;
}

export function SuperAdminDashboard({ data, displayName }: SuperAdminDashboardProps) {
  const totalLeads = data.totalLeads || 0;
  const totalApps = data.totalApplications || 0;
  const confirmedAdmissions = data.confirmedAdmissionsCount || 0;
  const unassignedLeads = data.unassignedLeadsCount || 0;
  const pendingFollowUps = data.followUpsDueCount || 0;

  const appConversionPct = totalLeads > 0 ? Math.min(100, Math.round((totalApps / totalLeads) * 100)) : 0;
  const admissionConversionPct = totalApps > 0 ? Math.min(100, Math.round((confirmedAdmissions / totalApps) * 100)) : 0;

  return (
    <div className="space-y-6">
      {/* 1. EXECUTIVE COMMAND HERO BANNER */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white p-6 sm:p-8 shadow-xl border border-slate-700/80">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-12 w-64 h-64 bg-indigo-600/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-[11px] font-semibold text-slate-200">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Aspirant Vision Command Deck</span>
              <span className="text-white/40">•</span>
              <span className="text-emerald-300 font-bold">All Services Live</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Welcome back, {displayName}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Complete operational oversight across regional college admissions, counselling pipelines, student application throughput, and system audit logs.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <Link href="/admin/colleges">
              <button className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white text-slate-900 hover:bg-slate-100 text-xs font-bold transition-all shadow-sm cursor-pointer">
                <Plus className="w-4 h-4 text-red-600" />
                <span>Add College</span>
              </button>
            </Link>

            <Link href="/admin/leads">
              <button className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-all shadow-sm cursor-pointer">
                <Inbox className="w-4 h-4" />
                <span>Leads Pipeline</span>
              </button>
            </Link>
          </div>
        </div>
      </div>

      {/* 2. CORE METRICS BENTO GRID (4 Comprehensive Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Admissions Leads */}
        <Link
          href="/admin/leads"
          className="group bg-white border border-gray-200/90 rounded-2xl p-5 shadow-2xs hover:shadow-md hover:border-gray-300 transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
              Admissions Pipeline
            </span>
            <div className="w-8 h-8 rounded-xl bg-red-50 text-[#E31E2B] border border-red-100 flex items-center justify-center">
              <Inbox className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-gray-900 tracking-tight">
              {data.totalLeads}
            </span>
            <span className="text-xs text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-full flex items-center gap-0.5">
              <TrendingUp className="w-3 h-3" />
              Active
            </span>
          </div>
          <p className="mt-1 text-xs text-gray-500 font-medium">
            Prospective student inquiries
          </p>
          <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-400">
            <span>{unassignedLeads > 0 ? `${unassignedLeads} Unassigned` : "Pipeline Assigned"}</span>
            <span className="text-[#E31E2B] font-semibold group-hover:translate-x-0.5 transition-transform">
              Open CRM &rarr;
            </span>
          </div>
        </Link>

        {/* Metric 2: Applications */}
        <Link
          href="/admin/applications"
          className="group bg-white border border-gray-200/90 rounded-2xl p-5 shadow-2xs hover:shadow-md hover:border-gray-300 transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
              Applications
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 border border-amber-100 flex items-center justify-center">
              <FileCheck2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-gray-900 tracking-tight">
              {data.totalApplications}
            </span>
            <span className="text-xs text-gray-400 font-medium">Packets</span>
          </div>
          <p className="mt-1 text-xs text-gray-500 font-medium">
            Submitted student applications
          </p>
          <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-400">
            <span>{data.pendingApplicationsCount ? `${data.pendingApplicationsCount} in Review` : "Verification Queue"}</span>
            <span className="text-amber-600 font-semibold group-hover:translate-x-0.5 transition-transform">
              Review &rarr;
            </span>
          </div>
        </Link>

        {/* Metric 3: Partner Colleges */}
        <Link
          href="/admin/colleges"
          className="group bg-white border border-gray-200/90 rounded-2xl p-5 shadow-2xs hover:shadow-md hover:border-gray-300 transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
              Institutions
            </span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 border border-purple-100 flex items-center justify-center">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-gray-900 tracking-tight">
              {data.totalColleges}
            </span>
            <span className="text-xs text-gray-400 font-medium">
              {data.totalCourses} Programs
            </span>
          </div>
          <p className="mt-1 text-xs text-gray-500 font-medium">
            Verified universities & institutes
          </p>
          <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-400">
            <span>NIRF &amp; UGC Catalog</span>
            <span className="text-purple-600 font-semibold group-hover:translate-x-0.5 transition-transform">
              Manage &rarr;
            </span>
          </div>
        </Link>

        {/* Metric 4: Verified Students */}
        <Link
          href="/admin/students"
          className="group bg-white border border-gray-200/90 rounded-2xl p-5 shadow-2xs hover:shadow-md hover:border-gray-300 transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
              Registered Users
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-gray-900 tracking-tight">
              {data.totalStudents}
            </span>
            <span className="text-xs text-gray-400 font-medium">
              {data.totalCounsellors} Staff
            </span>
          </div>
          <p className="mt-1 text-xs text-gray-500 font-medium">
            Active student & counsellor accounts
          </p>
          <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-400">
            <span>Authentication &amp; Staff</span>
            <span className="text-emerald-600 font-semibold group-hover:translate-x-0.5 transition-transform">
              Directory &rarr;
            </span>
          </div>
        </Link>
      </div>

      {/* 3. MAIN DASHBOARD CONTENT: 2-COLUMN ASYMMETRIC BENTO */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Recent Admission Inquiries (8 cols) */}
        <div className="lg:col-span-8 bg-white border border-gray-200/90 rounded-2xl p-6 shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-gray-100">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                <h3 className="font-bold text-gray-900 text-sm sm:text-base">
                  Live Admission Inquiries
                </h3>
              </div>
              <p className="text-xs text-gray-500 mt-0.5">
                Prospective student consultation requests received across web discovery channels.
              </p>
            </div>
            <Link
              href="/admin/leads"
              className="text-xs font-semibold text-primary hover:text-red-700 inline-flex items-center self-start sm:self-auto"
            >
              <span>View All Pipeline Leads</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Link>
          </div>

          {data.recentLeads.length === 0 ? (
            <div className="py-12 text-center text-gray-400 text-xs">
              No inquiries captured yet. Inquiries from the website will appear here in real-time.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-gray-100 text-gray-400 text-[11px] font-bold uppercase tracking-wider">
                    <th className="py-3 px-2 font-bold">Aspirant Student</th>
                    <th className="py-3 px-2 font-bold">Contact Coordinates</th>
                    <th className="py-3 px-2 font-bold">Admission Query</th>
                    <th className="py-3 px-2 font-bold">Status</th>
                    <th className="py-3 px-2 font-bold text-right">Received</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {data.recentLeads.map((lead) => (
                    <tr
                      key={lead.id}
                      className="hover:bg-gray-50/80 transition-colors group cursor-pointer"
                    >
                      {/* Name & Initial */}
                      <td className="py-3.5 px-2">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-center shrink-0 border border-slate-200/80">
                            {lead.fullName.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <span className="font-bold text-gray-900 group-hover:text-primary transition-colors block">
                              {lead.fullName}
                            </span>
                            {lead.preferredLocation && (
                              <span className="text-[10px] text-gray-400 block">
                                📍 {lead.preferredLocation}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Contact Details */}
                      <td className="py-3.5 px-2 text-gray-600">
                        <div className="text-gray-900 font-medium truncate max-w-[160px]">
                          {lead.email}
                        </div>
                        <div className="text-[11px] text-gray-400 font-mono">
                          {lead.phone}
                        </div>
                      </td>

                      {/* Enquiry Message / Note */}
                      <td className="py-3.5 px-2 text-gray-600 max-w-[200px]">
                        <p className="text-xs truncate text-gray-700">
                          {lead.enquiryMessage || "Admission consultation request"}
                        </p>
                        <span className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">
                          Via {(lead.source || "web").replace(/_/g, " ")}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-2">
                        <StatusBadge status={lead.status} type="lead" />
                      </td>

                      {/* Date */}
                      <td className="py-3.5 px-2 text-gray-400 text-right whitespace-nowrap">
                        {new Date(lead.createdAt).toLocaleDateString("en-IN", {
                          month: "short",
                          day: "numeric",
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Right Column: Admissions Velocity, SLAs & Quick Actions (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Admissions Pipeline & SLA Velocity (Replaces Operational Readiness) */}
          <div className="bg-white border border-gray-200/90 rounded-2xl p-6 shadow-2xs space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <Activity className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-sm">
                    Admissions Velocity &amp; SLA
                  </h3>
                  <p className="text-[11px] text-gray-400">Live conversion funnel &amp; team response health</p>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                Healthy
              </span>
            </div>

            {/* Funnel Progress Bars */}
            <div className="space-y-3.5 text-xs">
              <div>
                <div className="flex items-center justify-between text-[11px] font-semibold text-gray-700 mb-1">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#E31E2B]" />
                    Leads Inquired
                  </span>
                  <span className="font-bold text-gray-900">{totalLeads}</span>
                </div>
                <div className="w-full h-2 rounded-full bg-gray-100 overflow-hidden">
                  <div className="h-full bg-[#E31E2B] rounded-full transition-all duration-500" style={{ width: totalLeads > 0 ? "100%" : "0%" }} />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between text-[11px] font-semibold text-gray-700 mb-1">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-500" />
                    Applications Lodged
                  </span>
                  <span className="font-bold text-gray-900">
                    {totalApps} <span className="text-[10px] text-gray-400">({appConversionPct}%)</span>
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-gray-100 overflow-hidden">
                  <div
                    className="h-full bg-amber-500 rounded-full transition-all duration-500"
                    style={{ width: `${Math.max(4, Math.min(100, appConversionPct))}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between text-[11px] font-semibold text-gray-700 mb-1">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    Confirmed Admissions
                  </span>
                  <span className="font-bold text-gray-900">
                    {confirmedAdmissions} <span className="text-[10px] text-gray-400">({admissionConversionPct}%)</span>
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-gray-100 overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                    style={{ width: `${Math.max(4, Math.min(100, admissionConversionPct))}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Team Operational Alerts */}
            <div className="space-y-2 pt-2 border-t border-gray-100 text-xs">
              {unassignedLeads > 0 ? (
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-red-50 border border-red-200 text-red-800">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-[#E31E2B] shrink-0" />
                    <span className="font-bold text-[11px]">{unassignedLeads} Unassigned Leads</span>
                  </div>
                  <Link
                    href="/admin/leads?status=new"
                    className="text-[11px] font-bold text-[#E31E2B] hover:underline"
                  >
                    Assign &rarr;
                  </Link>
                </div>
              ) : (
                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-gray-50 border border-gray-100 text-gray-700 text-[11px]">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>All incoming leads assigned to team</span>
                </div>
              )}

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-gray-50 border border-gray-100 text-gray-700 text-[11px]">
                <div className="flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                  <span>Pending follow-up actions</span>
                </div>
                <Link href="/admin/follow-ups" className="font-bold text-blue-600 hover:underline">
                  {pendingFollowUps} Due
                </Link>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-gray-50 border border-gray-100 text-gray-700 text-[11px]">
                <div className="flex items-center gap-2">
                  <UserCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Active counsellors on duty</span>
                </div>
                <Link href="/admin/counsellors" className="font-bold text-emerald-700 hover:underline">
                  {data.totalCounsellors} Active
                </Link>
              </div>
            </div>

            <div className="pt-1">
              <Link href="/admin/leads" className="block">
                <button className="w-full py-2.5 rounded-xl bg-[#15182D] hover:bg-black text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer">
                  <Inbox className="w-3.5 h-3.5 text-red-400" />
                  <span>Manage Lead Pipeline &amp; Seats</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </Link>
            </div>
          </div>

          {/* Quick Shortcuts */}
          <div className="bg-white border border-gray-200/90 rounded-2xl p-6 shadow-2xs space-y-3">
            <h4 className="font-bold text-sm text-gray-900 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-[#E31E2B]" />
              <span>Quick Operations</span>
            </h4>
            <p className="text-xs text-gray-500 leading-relaxed">
              Instant shortcuts to mission-critical administrative console modules.
            </p>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <Link href="/admin/analytics">
                <button className="w-full py-2.5 px-3 rounded-xl bg-gray-50 hover:bg-red-50/60 hover:text-[#E31E2B] hover:border-red-200 text-xs font-semibold text-gray-700 transition-all border border-gray-200/80 text-left flex items-center gap-2 cursor-pointer">
                  <BarChart3 className="w-3.5 h-3.5 text-red-500" />
                  <span>Analytics</span>
                </button>
              </Link>
              <Link href="/admin/leads/performance">
                <button className="w-full py-2.5 px-3 rounded-xl bg-gray-50 hover:bg-indigo-50/60 hover:text-indigo-600 hover:border-indigo-200 text-xs font-semibold text-gray-700 transition-all border border-gray-200/80 text-left flex items-center gap-2 cursor-pointer">
                  <TrendingUp className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Performance</span>
                </button>
              </Link>
              <Link href="/admin/applications">
                <button className="w-full py-2.5 px-3 rounded-xl bg-gray-50 hover:bg-amber-50/60 hover:text-amber-700 hover:border-amber-200 text-xs font-semibold text-gray-700 transition-all border border-gray-200/80 text-left flex items-center gap-2 cursor-pointer">
                  <FileCheck2 className="w-3.5 h-3.5 text-amber-500" />
                  <span>Applications</span>
                </button>
              </Link>
              <Link href="/admin/colleges">
                <button className="w-full py-2.5 px-3 rounded-xl bg-gray-50 hover:bg-purple-50/60 hover:text-purple-600 hover:border-purple-200 text-xs font-semibold text-gray-700 transition-all border border-gray-200/80 text-left flex items-center gap-2 cursor-pointer">
                  <Building2 className="w-3.5 h-3.5 text-purple-500" />
                  <span>Colleges</span>
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
