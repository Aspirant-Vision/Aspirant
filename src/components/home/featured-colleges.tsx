"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  ChevronLeft,
  ChevronRight,
  Heart,
  Star,
  MapPin,
  TrendingUp,
  ArrowUpRight,
} from "lucide-react";
import { useCounselingModal } from "@/components/forms/counseling-modal-context";
import { CollegeRow } from "@/lib/college/actions";
import Link from "next/link";

export interface CollegeShowcase {
  id: string;
  slug?: string;
  name: string;
  location: string;
  type: string;
  image: string;
  rating: string;
  reviewCount: string;
  fees: string;
  avgCtc: string;
  nirfRank: string;
}

export const FEATURED_COLLEGES: CollegeShowcase[] = [
  {
    id: "iit-delhi",
    name: "IIT Delhi - Indian Institute of Technology",
    location: "New Delhi, Delhi",
    type: "Public / Autonomous Institute",
    image: "/images/feature_college_iit delhi.webp",
    rating: "4.8",
    reviewCount: "12.6K",
    fees: "₹2.2L /yr",
    avgCtc: "₹21.5 LPA",
    nirfRank: "#2 Engineering",
  },
  {
    id: "iim-ahmedabad",
    name: "IIM Ahmedabad - Indian Institute of Management",
    location: "Ahmedabad, Gujarat",
    type: "Premier Management Institute",
    image: "/images/featured_college.webp",
    rating: "4.9",
    reviewCount: "9.8K",
    fees: "₹12.5L /yr",
    avgCtc: "₹34.4 LPA",
    nirfRank: "#1 Management",
  },
  {
    id: "bits-pilani",
    name: "BITS Pilani - Birla Institute of Tech & Science",
    location: "Pilani, Rajasthan",
    type: "Deemed to be University",
    image: "/images/feature_college.webp",
    rating: "4.7",
    reviewCount: "7.1K",
    fees: "₹4.8L /yr",
    avgCtc: "₹19.2 LPA",
    nirfRank: "#20 Engineering",
  },
  {
    id: "kiit-university",
    slug: "kiit-university-bhubaneswar",
    name: "KIIT University - Kalinga Institute of Industrial Tech",
    location: "Bhubaneswar, Odisha",
    type: "Institute of Eminence / NAAC A++",
    image: "/images/campuses/kiit.png",
    rating: "4.6",
    reviewCount: "8.4K",
    fees: "₹3.5L /yr",
    avgCtc: "₹8.5 LPA",
    nirfRank: "#16 University",
  },
  {
    id: "soa-university",
    name: "SOA University - Siksha 'O' Anusandhan",
    location: "Bhubaneswar, Odisha",
    type: "Deemed University / NAAC A++",
    image: "/images/campuses/soa.png",
    rating: "4.5",
    reviewCount: "6.2K",
    fees: "₹2.8L /yr",
    avgCtc: "₹7.2 LPA",
    nirfRank: "#15 University",
  },
];

interface FeaturedCollegesProps {
  dbColleges?: CollegeRow[];
}

export function FeaturedColleges({ dbColleges = [] }: FeaturedCollegesProps) {
  const { openModal } = useCounselingModal();
  const [shortlisted, setShortlisted] = useState<Record<string, boolean>>({});
  const [currentIndex, setCurrentIndex] = useState(0);

  // Map dynamic DB colleges into showcase cards
  const dynamicCards: CollegeShowcase[] = dbColleges.map((c) => ({
    id: c.id,
    slug: c.slug,
    name: c.name,
    location: c.city && c.state ? `${c.city}, ${c.state}` : c.state || c.country || "India",
    type: `${c.college_type}${c.ownership_type ? ` • ${c.ownership_type}` : ""}`,
    image: c.cover_image_url || "/images/campuses/kiit.png",
    rating: "4.8",
    reviewCount: "Verified",
    fees: c.admission_status === "open" ? "Admission Open" : "Direct Advisory",
    avgCtc: c.average_placement ? `₹${c.average_placement} LPA` : "₹6.5 - 12 LPA",
    nirfRank: c.nirf_rank ? `#${c.nirf_rank} NIRF` : (c.naac_grade ? `NAAC ${c.naac_grade}` : "AICTE Approved"),
  }));

  // Merge dynamic colleges first, followed by static showcases (avoiding duplicate names)
  const allColleges: CollegeShowcase[] = [
    ...dynamicCards,
    ...FEATURED_COLLEGES.filter(
      (fc) => !dynamicCards.some((dc) => dc.name.toLowerCase().includes(fc.name.toLowerCase().split(" ")[0]))
    ),
  ];

  const maxIndex = Math.max(0, allColleges.length - 3);

  const toggleShortlist = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setShortlisted((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev <= 0 ? maxIndex : prev - 1));
  };

  return (
    <section id="colleges" className="py-8 sm:py-14 lg:py-16 max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8">
      {/* Editorial Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-6 sm:mb-8 gap-4 border-b border-[#E7E9F0] pb-4 sm:pb-5">
        <div>
          <span className="text-[#E31E2B] font-bold text-xs uppercase tracking-wider block mb-1">
            — Top Institutions
          </span>
          <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-[#15182D] tracking-tight">
            Explore India&apos;s Top Institutions
          </h2>
          <p className="text-xs sm:text-sm text-[#687086] mt-1">
            Discover leading colleges known for academic excellence, placements and student development.
          </p>
        </div>

        {/* Action Button & Carousel Controls */}
        <div className="flex items-center gap-3">
          <Link
            href="/colleges"
            className="tactile-pill inline-flex items-center gap-1.5 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full text-[#E31E2B] text-xs font-bold transition-all"
          >
            <span>Explore All Colleges</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
          <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-[#E7E9F0]">
            <button
              onClick={handlePrev}
              className="tactile-pill w-8 h-8 rounded-full flex items-center justify-center text-[#15182D]"
              aria-label="Previous"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleNext}
              className="tactile-pill w-8 h-8 rounded-full flex items-center justify-center text-[#15182D]"
              aria-label="Next"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 3 Rich Institutional Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
        {allColleges.slice(currentIndex, currentIndex + 3).map((college) => (
          <div
            key={college.id}
            onClick={() => openModal(college.name)}
            className="tactile-card rounded-2xl sm:rounded-3xl overflow-hidden group cursor-pointer flex flex-col justify-between"
          >
            <div>
              {/* Campus Photography (Dominant & Crisp) */}
              <div className="relative h-40 sm:h-48 w-full bg-gray-100 overflow-hidden">
                <Image
                  src={college.image}
                  alt={college.name}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />

                {/* Shortlist Heart Button */}
                <button
                  onClick={(e) => toggleShortlist(college.id, e)}
                  className="tactile-pill absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center text-[#E31E2B] transition-colors cursor-pointer"
                  aria-label="Shortlist college"
                >
                  <Heart
                    className={`w-4 h-4 ${
                      shortlisted[college.id] ? "fill-[#E31E2B]" : ""
                    }`}
                  />
                </button>

                {/* Ranking Tag on Image */}
                <div className="absolute bottom-3 left-3 bg-[#171B52]/90 backdrop-blur-sm text-white px-2.5 py-1 rounded-md text-[11px] font-bold flex items-center gap-1 shadow-sm">
                  <span>{college.nirfRank}</span>
                </div>
              </div>

              {/* Card Meta Content */}
              <div className="p-3.5 sm:p-5 space-y-2.5 sm:space-y-3">
                <div>
                  <span className="text-[11px] font-bold text-[#E31E2B] uppercase tracking-wider block">
                    {college.type}
                  </span>
                  <h3 className="font-display font-bold text-base text-[#15182D] group-hover:text-[#E31E2B] transition-colors leading-snug mt-0.5 line-clamp-1">
                    {college.name}
                  </h3>
                  <div className="flex items-center gap-1.5 text-xs text-[#687086] mt-1">
                    <MapPin className="w-3.5 h-3.5 text-[#E31E2B]" />
                    <span>{college.location}</span>
                  </div>
                </div>

                {/* Fees and Placement Metrics Grid */}
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#E7E9F0] text-xs">
                  <div>
                    <div className="text-[11px] text-[#687086]">Starting Fees</div>
                    <div className="font-bold text-[#15182D] mt-0.5">{college.fees}</div>
                  </div>
                  <div>
                    <div className="text-[11px] text-[#687086]">Average CTC</div>
                    <div className="font-bold text-[#16A34A] flex items-center gap-1 mt-0.5">
                      <TrendingUp className="w-3.5 h-3.5" />
                      <span>{college.avgCtc}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="px-5 pb-5 pt-1 grid grid-cols-2 gap-2 border-t border-gray-100">
              {college.slug ? (
                <Link
                  href={`/colleges/${college.slug}`}
                  onClick={(e) => e.stopPropagation()}
                  className="py-2.5 px-3 rounded-xl bg-[#171B52] hover:bg-[#0E1238] text-white text-xs font-bold transition-all text-center shadow-xs block"
                >
                  View College
                </Link>
              ) : (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    openModal(`View College: ${college.name}`);
                  }}
                  className="py-2.5 px-3 rounded-xl bg-[#171B52] hover:bg-[#0E1238] text-white text-xs font-bold transition-all text-center shadow-xs"
                >
                  View College
                </button>
              )}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  openModal(`Compare: ${college.name}`);
                }}
                className="tactile-btn-white py-2.5 px-3 rounded-xl text-[#15182D] text-xs font-bold transition-all text-center"
              >
                Compare
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
