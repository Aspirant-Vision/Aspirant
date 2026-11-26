"use client";

import React, { useState } from "react";
import Link from "next/link";
import { toggleCollegeShortlistAction } from "@/lib/student/actions";
import { Button } from "@/components/ui/button";
import {
  BookmarkCheck,
  Building2,
  MapPin,
  TrendingUp,
  Trash2,
  ExternalLink,
  Loader2,
} from "lucide-react";

interface CollegeShortlistCardProps {
  item: {
    id: string;
    created_at: string;
    college: {
      id: string;
      name: string;
      slug: string;
      logo_url?: string | null;
      cover_image_url?: string | null;
      city?: string | null;
      state?: string | null;
      college_type?: string | null;
      average_placement?: number | null;
      highest_placement?: number | null;
    };
  };
}

export function CollegeShortlistCard({ item }: CollegeShortlistCardProps) {
  const [isRemoving, setIsRemoving] = useState(false);
  const [isRemoved, setIsRemoved] = useState(false);
  const { college } = item;

  const handleRemove = async () => {
    try {
      setIsRemoving(true);
      const res = await toggleCollegeShortlistAction(college.id);
      if (res.success && !res.data?.shortlisted) {
        setIsRemoved(true);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsRemoving(false);
    }
  };

  if (isRemoved) return null;

  return (
    <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs hover:shadow-md transition-all overflow-hidden flex flex-col justify-between group">
      {/* Cover / Visual Banner */}
      <div className="h-28 bg-gradient-to-r from-red-600/10 to-red-900/20 relative">
        {college.cover_image_url ? (
          <img
            src={college.cover_image_url}
            alt={college.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-red-200 text-3xl font-black">
            {college.name.charAt(0)}
          </div>
        )}

        {college.college_type && (
          <span className="absolute top-3 right-3 px-2 py-0.5 rounded-md bg-white/90 backdrop-blur-xs text-[10px] font-bold text-gray-800 shadow-xs">
            {college.college_type}
          </span>
        )}
      </div>

      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-2">
          <div className="flex items-center gap-3 -mt-9 mb-2">
            <div className="w-12 h-12 rounded-xl bg-white p-1 shadow-md border border-gray-100 shrink-0">
              {college.logo_url ? (
                <img
                  src={college.logo_url}
                  alt={college.name}
                  className="w-full h-full object-contain rounded-lg"
                />
              ) : (
                <div className="w-full h-full bg-red-100 text-primary font-bold text-base flex items-center justify-center rounded-lg">
                  {college.name.charAt(0)}
                </div>
              )}
            </div>
          </div>

          <h3 className="text-sm font-bold text-gray-900 group-hover:text-primary transition-colors line-clamp-2">
            {college.name}
          </h3>

          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
            <span className="truncate">
              {college.city ? `${college.city}, ${college.state || ""}` : "All India"}
            </span>
          </div>

          {/* Placement Highlight */}
          {college.average_placement && (
            <div className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-emerald-50 text-emerald-700 text-[11px] font-semibold">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Avg Package: ₹{(college.average_placement / 100000).toFixed(1)} LPA</span>
            </div>
          )}
        </div>

        {/* Action Row */}
        <div className="pt-3 border-t border-gray-100 flex items-center justify-between gap-2">
          <Link
            href={`/colleges/${college.slug || college.id}`}
            target="_blank"
            className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
          >
            <span>View College</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={isRemoving}
            onClick={handleRemove}
            className="text-xs text-red-600 hover:text-red-700 hover:bg-red-50 p-1.5"
            title="Remove from shortlist"
          >
            {isRemoving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Trash2 className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
