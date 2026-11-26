import React from "react";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { requireAuth } from "@/lib/auth/session";
import { getCollegeByIdAction } from "@/lib/college/actions";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Building2,
  MapPin,
  Globe,
  Phone,
  Mail,
  Award,
  Calendar,
  Sparkles,
  FileCheck,
  Edit,
  ExternalLink,
  Star,
  CheckCircle2,
  Clock,
  Layers,
  ShieldCheck,
  TrendingUp,
} from "lucide-react";

interface CollegeDetailPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: CollegeDetailPageProps) {
  const { id } = await params;
  const res = await getCollegeByIdAction(id);
  return {
    title: res.success ? `${res.data.name} | Aspirant Vision Admin` : "College Details",
  };
}

export default async function CollegeDetailPage({ params }: CollegeDetailPageProps) {
  await requireAuth("/admin/login");

  const { id } = await params;
  const res = await getCollegeByIdAction(id);

  if (!res.success || !res.data) {
    notFound();
  }

  const college = res.data;
  const isPublished = college.publication_status === "published";
  const facilities = Array.isArray(college.facilities) ? (college.facilities as string[]) : [];
  const highlights = Array.isArray(college.highlights) ? (college.highlights as string[]) : [];
  const gallery = Array.isArray(college.gallery_images) ? (college.gallery_images as string[]) : [];

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-20">
      {/* 1. TOP HEADER & ACTIONS */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/colleges"
            className="p-2 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">{college.name}</h1>
              {college.is_featured && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                  <Star className="w-3 h-3 fill-amber-400 text-amber-500" /> Featured
                </span>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500 mt-1">
              <span className="font-semibold text-gray-700">{college.college_type}</span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-gray-400" />
                {college.city}, {college.state}
              </span>
              <span>•</span>
              <span className="font-mono text-gray-400">/{college.slug}</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {isPublished && (
            <Link href={`/colleges/${college.slug}`} target="_blank">
              <Button variant="outline" size="sm" className="text-xs">
                <ExternalLink className="w-3.5 h-3.5 mr-1.5" />
                <span>View Public Page</span>
              </Button>
            </Link>
          )}

          <Link href={`/admin/colleges/${college.id}/edit`}>
            <Button size="sm" className="text-xs bg-[#E31E2B] hover:bg-[#c91824] text-white">
              <Edit className="w-3.5 h-3.5 mr-1.5" />
              <span>Edit College</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* 2. COVER BANNER & EMBLEM */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-xs">
        {/* Cover Image */}
        <div className="relative w-full h-48 sm:h-64 bg-linear-to-r from-slate-900 to-slate-800">
          {college.cover_image_url ? (
            <Image
              src={college.cover_image_url}
              alt={college.name}
              fill
              priority
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-500 text-sm font-medium">
              No Cover Banner Uploaded
            </div>
          )}

          {/* Publication Status Pill */}
          <div className="absolute top-4 right-4">
            {college.publication_status === "published" && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-white/95 backdrop-blur-sm text-emerald-700 shadow-md">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                Live on Public Portal
              </span>
            )}
            {college.publication_status === "draft" && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-white/95 backdrop-blur-sm text-amber-700 shadow-md">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                Draft Mode
              </span>
            )}
            {college.publication_status === "archived" && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-white/95 backdrop-blur-sm text-gray-700 shadow-md">
                <span className="w-2 h-2 rounded-full bg-gray-400" />
                Archived
              </span>
            )}
          </div>
        </div>

        {/* Profile Info Row */}
        <div className="px-6 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 -mt-10 relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-2xl bg-white border-2 border-white shadow-md overflow-hidden relative shrink-0">
              {college.logo_url ? (
                <Image
                  src={college.logo_url}
                  alt={college.name}
                  fill
                  className="object-contain p-2"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-red-50 text-[#E31E2B] font-bold text-2xl">
                  {college.name.charAt(0)}
                </div>
              )}
            </div>

            <div className="pt-8 sm:pt-0">
              <h2 className="text-lg font-bold text-gray-900">{college.name}</h2>
              <p className="text-xs text-gray-500">
                {college.ownership_type || "Institution"} • Estd. {college.established_year || "N/A"}{" "}
                • {college.affiliation || "Affiliated"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2 sm:pt-0">
            {college.nirf_rank && (
              <div className="px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-center">
                <span className="block text-[10px] text-amber-600 font-bold uppercase">NIRF Rank</span>
                <span className="text-sm font-extrabold text-amber-900">#{college.nirf_rank}</span>
              </div>
            )}
            {college.naac_grade && (
              <div className="px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-center">
                <span className="block text-[10px] text-emerald-600 font-bold uppercase">NAAC</span>
                <span className="text-sm font-extrabold text-emerald-900">{college.naac_grade}</span>
              </div>
            )}
            {college.admission_status && (
              <div className="px-3 py-1.5 rounded-xl bg-blue-50 border border-blue-200 text-center">
                <span className="block text-[10px] text-blue-600 font-bold uppercase">Admissions</span>
                <span className="text-sm font-extrabold text-blue-900 uppercase">
                  {college.admission_status.replace("_", " ")}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 3. KEY METRICS CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-white border border-gray-200 shadow-xs">
          <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 mb-1">
            <TrendingUp className="w-3.5 h-3.5 text-blue-500" />
            <span>Average Package</span>
          </div>
          <div className="text-lg font-bold text-gray-900">
            {college.average_placement ? `₹${college.average_placement} LPA` : "Not specified"}
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-gray-200 shadow-xs">
          <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 mb-1">
            <Award className="w-3.5 h-3.5 text-emerald-500" />
            <span>Highest Package</span>
          </div>
          <div className="text-lg font-bold text-gray-900">
            {college.highest_placement ? `₹${college.highest_placement} LPA` : "Not specified"}
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-gray-200 shadow-xs">
          <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 mb-1">
            <ShieldCheck className="w-3.5 h-3.5 text-purple-500" />
            <span>Placement Rate</span>
          </div>
          <div className="text-lg font-bold text-gray-900">
            {college.placement_percentage ? `${college.placement_percentage}%` : "Not specified"}
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-gray-200 shadow-xs">
          <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 mb-1">
            <Calendar className="w-3.5 h-3.5 text-amber-500" />
            <span>Established</span>
          </div>
          <div className="text-lg font-bold text-gray-900">
            {college.established_year || "N/A"}
          </div>
        </div>
      </div>

      {/* 4. OVERVIEW & HIGHLIGHTS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* About College */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-xs space-y-3">
            <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-[#E31E2B]" /> About Institution
            </h3>
            {college.short_description && (
              <p className="text-xs text-gray-700 font-medium leading-relaxed bg-gray-50 p-3 rounded-lg border border-gray-200">
                {college.short_description}
              </p>
            )}
            <div className="text-xs text-gray-600 leading-relaxed whitespace-pre-line">
              {college.description || "No full description provided."}
            </div>
          </div>

          {/* Key Highlights */}
          {highlights.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-xs space-y-3">
              <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#E31E2B]" /> Key Highlights
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {highlights.map((hl, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-2 p-2.5 rounded-lg bg-gray-50 border border-gray-200 text-xs text-gray-800"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{hl}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Campus Facilities */}
          {facilities.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-xs space-y-3">
              <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#E31E2B]" /> Campus Facilities
              </h3>
              <div className="flex flex-wrap gap-2">
                {facilities.map((fac, i) => (
                  <span
                    key={i}
                    className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700 border border-gray-200"
                  >
                    {fac}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Admission Overview */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-xs space-y-3">
            <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-[#E31E2B]" /> Admission Overview
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <span className="font-semibold text-gray-500 block mb-0.5">Status</span>
                <span className="font-bold text-gray-800 uppercase">
                  {college.admission_status?.replace("_", " ")}
                </span>
              </div>
              <div>
                <span className="font-semibold text-gray-500 block mb-0.5">Accepted Entrance Exams</span>
                <span className="text-gray-800 font-medium">
                  {college.entrance_exams || "Not specified"}
                </span>
              </div>
              <div>
                <span className="font-semibold text-gray-500 block mb-0.5">Cycle Dates</span>
                <span className="text-gray-800">
                  {college.admission_start_date || "TBA"} to {college.admission_end_date || "TBA"}
                </span>
              </div>
              <div>
                <span className="font-semibold text-gray-500 block mb-0.5">Admission Contact</span>
                <span className="text-gray-800 font-medium">
                  {college.admission_contact || "Main Office"}
                </span>
              </div>
            </div>

            {college.eligibility_overview && (
              <div className="pt-2 border-t border-gray-100">
                <span className="font-semibold text-xs text-gray-700 block mb-1">Eligibility Criteria</span>
                <p className="text-xs text-gray-600 leading-relaxed whitespace-pre-line">
                  {college.eligibility_overview}
                </p>
              </div>
            )}
          </div>

          {/* Gallery Images */}
          {gallery.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-xs space-y-3">
              <h3 className="text-sm font-bold text-gray-900">Campus Gallery ({gallery.length})</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {gallery.map((img, i) => (
                  <div
                    key={i}
                    className="relative aspect-video rounded-lg overflow-hidden border border-gray-200 bg-gray-100"
                  >
                    <Image
                      src={img}
                      alt={`Campus photo ${i + 1}`}
                      fill
                      sizes="(max-width: 768px) 50vw, 25vw"
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right column (1 col) */}
        <div className="space-y-6">
          {/* Location Details */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-xs space-y-3">
            <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#E31E2B]" /> Campus Address
            </h3>
            <p className="text-xs text-gray-700 leading-relaxed">
              {college.address || `${college.city}, ${college.state}`}
            </p>
            <div className="pt-2 border-t border-gray-100 text-xs space-y-1 text-gray-500">
              <div>
                <span className="font-semibold text-gray-700">City / State:</span> {college.city},{" "}
                {college.state}
              </div>
              {college.pincode && (
                <div>
                  <span className="font-semibold text-gray-700">PIN Code:</span> {college.pincode}
                </div>
              )}
              {college.latitude && college.longitude && (
                <div>
                  <span className="font-semibold text-gray-700">Coordinates:</span>{" "}
                  {college.latitude}, {college.longitude}
                </div>
              )}
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-xs space-y-3">
            <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
              <Phone className="w-4 h-4 text-[#E31E2B]" /> Contact Channels
            </h3>
            <div className="space-y-2 text-xs">
              {college.phone && (
                <div className="flex items-center gap-2 text-gray-700">
                  <Phone className="w-3.5 h-3.5 text-gray-400" />
                  <span>{college.phone}</span>
                </div>
              )}
              {college.alternate_phone && (
                <div className="flex items-center gap-2 text-gray-700">
                  <Phone className="w-3.5 h-3.5 text-gray-400" />
                  <span>{college.alternate_phone}</span>
                </div>
              )}
              {college.email && (
                <div className="flex items-center gap-2 text-gray-700">
                  <Mail className="w-3.5 h-3.5 text-gray-400" />
                  <span>{college.email}</span>
                </div>
              )}
              {college.admission_email && (
                <div className="flex items-center gap-2 text-gray-700">
                  <Mail className="w-3.5 h-3.5 text-gray-400" />
                  <span>{college.admission_email} (Admissions)</span>
                </div>
              )}
              {college.website_url && (
                <div className="pt-2 border-t border-gray-100">
                  <a
                    href={college.website_url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#E31E2B] hover:underline"
                  >
                    <Globe className="w-3.5 h-3.5" /> Visit Official Website
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* System & SEO Audit */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-xs space-y-2 text-xs text-gray-500">
            <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-2">
              Audit & SEO Settings
            </h3>
            <div>
              <span className="font-semibold text-gray-700">Slug:</span> /{college.slug}
            </div>
            <div>
              <span className="font-semibold text-gray-700">Created:</span>{" "}
              {new Date(college.created_at).toLocaleDateString()}
            </div>
            <div>
              <span className="font-semibold text-gray-700">Last Modified:</span>{" "}
              {new Date(college.updated_at).toLocaleDateString()}
            </div>
            <div>
              <span className="font-semibold text-gray-700">SEO Indexing:</span>{" "}
              {college.no_index ? "Hidden from Search (noindex)" : "Indexed by Search Engines"}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
