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
} from "lucide-react";

interface SuperAdminDashboardProps {
  data: SuperAdminDashboardData;
  displayName: string;
}

export function SuperAdminDashboard({ data, displayName }: SuperAdminDashboardProps) {
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
            <span>Stage: New & Scheduled</span>
            <span className="text-primary font-semibold group-hover:translate-x-0.5 transition-transform">
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
            <span>Eligibility & Verification</span>
            <span className="text-primary font-semibold group-hover:translate-x-0.5 transition-transform">
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
            <span>NIRF & UGC Catalog</span>
            <span className="text-primary font-semibold group-hover:translate-x-0.5 transition-transform">
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
            <span>Authentication & RBAC</span>
            <span className="text-primary font-semibold group-hover:translate-x-0.5 transition-transform">
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

        {/* Right Column: Platform Readiness & Quick Actions (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Platform Setup Checklist */}
          <div className="bg-white border border-gray-200/90 rounded-2xl p-6 shadow-2xs space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <h3 className="font-bold text-gray-900 text-sm">
                Operational Readiness
              </h3>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-start gap-2.5 text-gray-700">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-gray-900 block">
                    Supabase PostgreSQL Engine
                  </span>
                  <span className="text-[11px] text-gray-500">
                    Database schema & security RLS policies active.
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-2.5 text-gray-700">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-gray-900 block">
                    Public Lead Capture Forms
                  </span>
                  <span className="text-[11px] text-gray-500">
                    Homepage modals & course inquiries live.
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-2.5 text-gray-700">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-gray-900 block">
                    Super Admin Authentication
                  </span>
                  <span className="text-[11px] text-gray-500">
                    Master credentials active and verified.
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-2.5 text-gray-700">
                <div className="w-4 h-4 rounded-full border-2 border-amber-400 shrink-0 mt-0.5 flex items-center justify-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                </div>
                <div>
                  <span className="font-bold text-gray-900 block">
                    Institutional Catalog
                  </span>
                  <span className="text-[11px] text-gray-500">
                    Add NIRF ranked universities & cutoff tables.
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-gray-100">
              <Link href="/admin/colleges" className="block">
                <button className="w-full py-2 rounded-xl bg-gray-50 hover:bg-gray-100 border border-gray-200 text-xs font-bold text-gray-800 transition-colors cursor-pointer flex items-center justify-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-primary" />
                  <span>Configure Universities</span>
                </button>
              </Link>
            </div>
          </div>

          {/* Quick Shortcuts */}
          <div className="bg-white border border-gray-200/90 rounded-2xl p-6 shadow-2xs space-y-3">
            <h4 className="font-bold text-sm text-gray-900 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-primary" />
              <span>Quick Operations</span>
            </h4>
            <p className="text-xs text-gray-500 leading-relaxed">
              Fast shortcuts to export reports, configure staff permissions, or view live analytics.
            </p>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <Link href="/admin/analytics">
                <button className="w-full py-2 px-3 rounded-xl bg-gray-50 hover:bg-gray-100 text-xs font-semibold text-gray-700 transition-colors border border-gray-100 text-left truncate">
                  📊 Analytics
                </button>
              </Link>
              <Link href="/admin/settings">
                <button className="w-full py-2 px-3 rounded-xl bg-gray-50 hover:bg-gray-100 text-xs font-semibold text-gray-700 transition-colors border border-gray-100 text-left truncate">
                  ⚙️ Settings
                </button>
              </Link>
              <Link href="/admin/applications">
                <button className="w-full py-2 px-3 rounded-xl bg-gray-50 hover:bg-gray-100 text-xs font-semibold text-gray-700 transition-colors border border-gray-100 text-left truncate">
                  📄 Applications
                </button>
              </Link>
              <Link href="/admin/counsellors">
                <button className="w-full py-2 px-3 rounded-xl bg-gray-50 hover:bg-gray-100 text-xs font-semibold text-gray-700 transition-colors border border-gray-100 text-left truncate">
                  👥 Counsellors
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
