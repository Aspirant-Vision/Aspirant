import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAuth } from "@/lib/auth/session";
import { getScholarshipByIdAction } from "@/lib/course/actions";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Award,
  Calendar,
  Building2,
  FileCheck,
  Edit,
  ExternalLink,
  CheckCircle2,
  Globe2,
} from "lucide-react";

interface ScholarshipDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function ScholarshipDetailPage({ params }: ScholarshipDetailPageProps) {
  await requireAuth("/admin/login");

  const { id } = await params;
  const res = await getScholarshipByIdAction(id);

  if (!res.success || !res.data) {
    notFound();
  }

  const scholarship = res.data;
  const docs = Array.isArray(scholarship.required_documents)
    ? (scholarship.required_documents as string[])
    : [];

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20">
      <div className="flex items-center justify-between pb-4 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/scholarships"
            className="p-2 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-gray-900">{scholarship.name}</h1>
            <p className="text-xs text-gray-500">
              Provider: <span className="font-semibold text-gray-800">{scholarship.provider}</span> • Category:{" "}
              <span className="uppercase font-semibold">{scholarship.category}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {scholarship.publication_status === "published" && scholarship.slug && (
            <Link href={`/scholarships/${scholarship.slug}`} target="_blank">
              <Button variant="outline" size="sm" className="text-xs">
                <ExternalLink className="w-3.5 h-3.5 mr-1.5" />
                <span>View Public Page</span>
              </Button>
            </Link>
          )}

          <Link href={`/admin/scholarships/${scholarship.id}/edit`}>
            <Button size="sm" className="text-xs bg-[#E31E2B] hover:bg-[#c91824] text-white">
              <Edit className="w-3.5 h-3.5 mr-1.5" />
              <span>Edit Scholarship</span>
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-white border border-gray-200 shadow-xs">
          <div className="text-xs font-semibold text-gray-500 mb-1">Benefit Grant</div>
          <div className="text-lg font-bold text-emerald-600">
            {scholarship.scholarship_amount > 0
              ? `₹${scholarship.scholarship_amount.toLocaleString("en-IN")}`
              : "Tuition Waiver"}
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-gray-200 shadow-xs">
          <div className="text-xs font-semibold text-gray-500 mb-1">Application Deadline</div>
          <div className="text-lg font-bold text-gray-900">
            {scholarship.application_deadline
              ? new Date(scholarship.application_deadline).toLocaleDateString("en-IN")
              : "Rolling / Open"}
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-gray-200 shadow-xs">
          <div className="text-xs font-semibold text-gray-500 mb-1">Target Scope</div>
          <div className="text-sm font-bold text-gray-900 truncate">
            {scholarship.colleges?.name || "National / All Colleges"}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-xs space-y-4 text-xs">
        <div>
          <h3 className="font-bold text-gray-900 text-sm mb-1">Scholarship Overview</h3>
          <p className="text-gray-600 leading-relaxed whitespace-pre-line">
            {scholarship.description || "No description provided."}
          </p>
        </div>

        <div className="pt-3 border-t border-gray-100">
          <h3 className="font-bold text-gray-900 text-sm mb-1">Eligibility Criteria</h3>
          <p className="text-gray-600 leading-relaxed whitespace-pre-line">
            {scholarship.eligibility || "Open to all eligible students as per guidelines."}
          </p>
        </div>

        {docs.length > 0 && (
          <div className="pt-3 border-t border-gray-100">
            <h3 className="font-bold text-gray-900 text-sm mb-2">Required Documents</h3>
            <div className="flex flex-wrap gap-2">
              {docs.map((doc, i) => (
                <span
                  key={i}
                  className="px-3 py-1 rounded-md bg-gray-100 text-gray-700 font-medium"
                >
                  ✓ {doc}
                </span>
              ))}
            </div>
          </div>
        )}

        {scholarship.official_url && (
          <div className="pt-3 border-t border-gray-100">
            <a
              href={scholarship.official_url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#E31E2B] hover:underline"
            >
              <Globe2 className="w-4 h-4" /> Visit Official Application Portal
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
