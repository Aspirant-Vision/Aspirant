import React from "react";
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: string;
  type?: "role" | "lead" | "application" | "account" | "admission" | "general";
  className?: string;
}

export function StatusBadge({ status, type = "general", className }: StatusBadgeProps) {
  const normalized = status.toLowerCase().trim();

  let colorClasses = "bg-gray-100 text-gray-700 border-gray-200";

  if (type === "role") {
    switch (normalized) {
      case "super_admin":
        colorClasses = "bg-purple-50 text-purple-700 border-purple-200";
        break;
      case "admin":
        colorClasses = "bg-red-50 text-red-700 border-red-200";
        break;
      case "counsellor":
        colorClasses = "bg-emerald-50 text-emerald-700 border-emerald-200";
        break;
      case "student":
        colorClasses = "bg-blue-50 text-blue-700 border-blue-200";
        break;
    }
  } else if (type === "lead") {
    switch (normalized) {
      case "new":
        colorClasses = "bg-blue-50 text-blue-700 border-blue-200";
        break;
      case "contacted":
      case "counselling_scheduled":
        colorClasses = "bg-amber-50 text-amber-700 border-amber-200";
        break;
      case "documents_pending":
        colorClasses = "bg-orange-50 text-orange-700 border-orange-200";
        break;
      case "interested":
      case "application_started":
        colorClasses = "bg-purple-50 text-purple-700 border-purple-200";
        break;
      case "admitted":
        colorClasses = "bg-emerald-50 text-emerald-700 border-emerald-200";
        break;
      case "lost":
      case "not_interested":
        colorClasses = "bg-gray-100 text-gray-600 border-gray-200";
        break;
    }
  } else if (type === "account") {
    switch (normalized) {
      case "active":
        colorClasses = "bg-emerald-50 text-emerald-700 border-emerald-200";
        break;
      case "suspended":
        colorClasses = "bg-red-50 text-red-700 border-red-200";
        break;
      case "pending_verification":
        colorClasses = "bg-amber-50 text-amber-700 border-amber-200";
        break;
      default:
        colorClasses = "bg-gray-100 text-gray-700 border-gray-200";
    }
  } else if (type === "application" || type === "admission") {
    switch (normalized) {
      case "admitted":
      case "accepted":
      case "verified":
        colorClasses = "bg-emerald-50 text-emerald-700 border-emerald-200";
        break;
      case "submitted":
      case "under_review":
      case "forwarded":
        colorClasses = "bg-blue-50 text-blue-700 border-blue-200";
        break;
      case "documents_required":
      case "waitlisted":
        colorClasses = "bg-amber-50 text-amber-700 border-amber-200";
        break;
      case "rejected":
      case "withdrawn":
        colorClasses = "bg-red-50 text-red-700 border-red-200";
        break;
      default:
        colorClasses = "bg-gray-100 text-gray-700 border-gray-200";
    }
  }

  // Format label: replaces underscores with spaces and capitalizes
  const formattedLabel = normalized
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border tracking-wide select-none whitespace-nowrap",
        colorClasses,
        className
      )}
    >
      {formattedLabel}
    </span>
  );
}
