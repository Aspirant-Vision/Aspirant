import React from "react";
import Link from "next/link";
import { Sparkles } from "lucide-react";

export function TopAnnouncementBar() {
  return (
    <div className="bg-primary text-on-primary py-2 px-4 md:px-margin-desktop text-xs border-b border-primary-light/40 fixed top-0 w-full z-50">
      <div className="max-w-container-max mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2 overflow-hidden text-ellipsis whitespace-nowrap">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-secondary"></span>
          </span>
          <span className="font-semibold text-secondary-fixed">Admissions 2025 Open:</span>
          <span className="text-white/85 text-[11px] md:text-xs">
            Direct & Merit Seats available at KIIT, SOA, Centurion & C.V. Raman.
          </span>
        </div>

        <div className="hidden sm:flex items-center gap-4 text-[11px] text-white/70">
          <Link
            href="https://wa.me/919938362938"
            target="_blank"
            className="hover:text-secondary-fixed transition-colors flex items-center gap-1 font-medium"
          >
            <Sparkles className="w-3 h-3 text-secondary" />
            Scholarship Assistance
          </Link>
          <span className="text-white/30">|</span>
          <span className="text-white/90 font-medium">Bhubaneswar Tech Park HQ</span>
        </div>
      </div>
    </div>
  );
}
