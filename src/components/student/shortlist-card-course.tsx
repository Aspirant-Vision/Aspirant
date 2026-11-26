"use client";

import React, { useState } from "react";
import Link from "next/link";
import { toggleCourseShortlistAction } from "@/lib/student/actions";
import { Button } from "@/components/ui/button";
import {
  BookOpen,
  GraduationCap,
  Clock,
  Trash2,
  ExternalLink,
  Loader2,
} from "lucide-react";

interface CourseShortlistCardProps {
  item: {
    id: string;
    created_at: string;
    course: {
      id: string;
      name: string;
      slug: string;
      code?: string | null;
      duration_years?: number | null;
      degree_type?: string | null;
      stream?: string | null;
    };
  };
}

export function CourseShortlistCard({ item }: CourseShortlistCardProps) {
  const [isRemoving, setIsRemoving] = useState(false);
  const [isRemoved, setIsRemoved] = useState(false);
  const { course } = item;

  const handleRemove = async () => {
    try {
      setIsRemoving(true);
      const res = await toggleCourseShortlistAction(course.id);
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
    <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs hover:shadow-md transition-all p-5 flex flex-col justify-between space-y-4 group">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[11px] font-bold">
            {course.degree_type || "Degree"}
          </span>
          {course.duration_years && (
            <span className="inline-flex items-center gap-1 text-[11px] text-gray-500 font-medium">
              <Clock className="w-3.5 h-3.5 text-gray-400" />
              <span>{course.duration_years} Years</span>
            </span>
          )}
        </div>

        <h3 className="text-sm font-bold text-gray-900 group-hover:text-primary transition-colors">
          {course.name}
        </h3>

        {course.stream && (
          <p className="text-xs text-gray-500 flex items-center gap-1">
            <GraduationCap className="w-3.5 h-3.5 text-gray-400 shrink-0" />
            <span>{course.stream}</span>
          </p>
        )}
      </div>

      <div className="pt-3 border-t border-gray-100 flex items-center justify-between gap-2">
        <Link
          href={`/courses/${course.slug || course.id}`}
          target="_blank"
          className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
        >
          <span>Course Details</span>
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
  );
}
