"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  Star,
  Quote,
  Award,
  CheckCircle2,
  Building,
  Briefcase,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { useCounselingModal } from "@/components/forms/counseling-modal-context";
import { cn } from "@/lib/utils";

interface StudentStory {
  id: string;
  name: string;
  stream: "engineering" | "management" | "medical";
  course: string;
  college: string;
  rankBadge: string;
  companyBadge: string;
  image: string;
  quote: string;
  rating: number;
}

const SUCCESS_STORIES: StudentStory[] = [
  {
    id: "priya-sharma",
    name: "Priya Sharma",
    stream: "engineering",
    course: "B.Tech Computer Science",
    college: "IIT Delhi",
    rankBadge: "JEE Advanced AIR 412",
    companyBadge: "Placed @ Microsoft (₹44 LPA)",
    image: "/images/ss_crops/student_1_highres.jpg",
    quote:
      "Aspirant Vision's cutoff predictor was 100% accurate. My mentor mapped out branch options I hadn't even considered. From choice filling to campus verification, the entire process was seamless.",
    rating: 5,
  },
  {
    id: "rahul-mehta",
    name: "Rahul Mehta",
    stream: "management",
    course: "MBA in Strategy & Finance",
    college: "IIM Ahmedabad",
    rankBadge: "CAT 99.4 Percentile",
    companyBadge: "Placed @ McKinsey & Co (₹34 LPA)",
    image: "/images/ss_crops/student_2_highres.jpg",
    quote:
      "The mentor guidance for my WAT & Personal Interview rounds made all the difference. Aspirant Vision gave me authentic clarity on faculty and curriculum that generic forums simply lacked.",
    rating: 5,
  },
  {
    id: "ankita-patra",
    name: "Ankita Patra",
    stream: "engineering",
    course: "B.Tech AI & Data Science",
    college: "KIIT University",
    rankBadge: "Merit Scholarship Winner",
    companyBadge: "Placed @ Deloitte (₹12 LPA)",
    image: "/images/ss_crops/student_3_highres.jpg",
    quote:
      "Coming from Odisha, having Aspirant Vision's counsellors walk my parents through the fee breakdown, hostel safety, and 50% merit scholarship cutoffs gave our whole family immense confidence.",
    rating: 5,
  },
];

export function StudentSuccessStories() {
  const { openModal } = useCounselingModal();
  const [activeStream, setActiveStream] = useState<"all" | "engineering" | "management">("all");

  const filteredStories = SUCCESS_STORIES.filter(
    (s) => activeStream === "all" || s.stream === activeStream
  );

  return (
    <section id="testimonials" className="py-20 max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8">
      {/* Editorial Section Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-4 border-b border-[#E7E9F0] pb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 border border-red-100 text-[#E31E2B] text-xs font-bold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Verified Student Outcomes</span>
          </div>
          <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-[#15182D] tracking-tight">
            Real Students. Real Journeys.{" "}
            <span className="text-[#E31E2B]">Real Success.</span>
          </h2>
          <p className="text-xs sm:text-sm text-[#687086] mt-1.5 max-w-xl leading-relaxed">
            Discover how candidates turned ambitious career goals into confirmed admissions at India&apos;s leading universities.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveStream("all")}
            className={cn(
              "px-4 py-2 rounded-xl text-xs font-bold transition-all",
              activeStream === "all"
                ? "tactile-btn-red text-white"
                : "tactile-pill text-[#687086] hover:text-[#15182D]"
            )}
          >
            All Stories ({SUCCESS_STORIES.length})
          </button>
          <button
            onClick={() => setActiveStream("engineering")}
            className={cn(
              "px-4 py-2 rounded-xl text-xs font-bold transition-all",
              activeStream === "engineering"
                ? "tactile-btn-red text-white"
                : "tactile-pill text-[#687086] hover:text-[#15182D]"
            )}
          >
            Engineering
          </button>
          <button
            onClick={() => setActiveStream("management")}
            className={cn(
              "px-4 py-2 rounded-xl text-xs font-bold transition-all",
              activeStream === "management"
                ? "tactile-btn-red text-white"
                : "tactile-pill text-[#687086] hover:text-[#15182D]"
            )}
          >
            Management
          </button>
        </div>
      </div>

      {/* 3 Rich High-Impact Testimonial Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        {filteredStories.map((story) => (
          <div
            key={story.id}
            onClick={() => openModal(`Success Story: ${story.name}`)}
            className="tactile-card rounded-3xl p-6 sm:p-7 border border-[#E7E9F0] hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col justify-between group bg-white"
          >
            <div>
              {/* Top Header: Student Avatar & Verified Badge */}
              <div className="flex items-center justify-between gap-3 mb-4">
                <div className="flex items-center gap-3.5">
                  {/* High-Resolution Crisp Student Portrait (400x400 source) */}
                  <div className="relative w-14 h-14 rounded-2xl overflow-hidden border-2 border-[#E7E9F0] shadow-sm shrink-0 bg-gray-100">
                    <Image
                      src={story.image}
                      alt={story.name}
                      fill
                      sizes="56px"
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div>
                    <h3 className="font-display font-black text-base text-[#15182D] group-hover:text-[#E31E2B] transition-colors leading-tight">
                      {story.name}
                    </h3>
                    <div className="flex items-center gap-1 text-[11px] font-semibold text-[#687086] mt-0.5">
                      <Building className="w-3 h-3 text-[#E31E2B]" />
                      <span>{story.college}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-0.5">
                  {[...Array(story.rating)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  ))}
                </div>
              </div>

              {/* Badges Row: Exam Rank & Placement CTC */}
              <div className="space-y-1.5 mb-4">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-red-50 text-[#E31E2B] text-[11px] font-black tracking-wide border border-red-100">
                  <Award className="w-3.5 h-3.5" />
                  <span>{story.rankBadge}</span>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-100">
                  <Briefcase className="w-3 h-3 text-emerald-600" />
                  <span>{story.companyBadge}</span>
                </div>
              </div>

              {/* Quotation with Red Left Border */}
              <p className="text-xs sm:text-[13px] text-[#15182D] font-normal leading-relaxed italic border-l-2 border-[#E31E2B] pl-3 py-0.5">
                &ldquo;{story.quote}&rdquo;
              </p>
            </div>

            {/* Bottom Card Footer */}
            <div className="pt-4 mt-4 border-t border-gray-100 flex items-center justify-between text-xs">
              <div className="flex items-center gap-1 text-[11px] text-[#687086] font-medium">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Verified Admission</span>
              </div>
              <span className="font-bold text-[#E31E2B] group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
                <span>Read Story</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Trust & Outcome Verification Strip */}
      <div className="tactile-card rounded-2xl p-5 bg-[#F7F8FC] border border-[#E7E9F0] grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
        <div>
          <div className="font-display font-black text-xl sm:text-2xl text-[#15182D]">50,000+</div>
          <div className="text-xs text-[#687086] font-medium mt-0.5">Students Guided</div>
        </div>
        <div>
          <div className="font-display font-black text-xl sm:text-2xl text-[#16A34A]">4.9 / 5</div>
          <div className="text-xs text-[#687086] font-medium mt-0.5">Verified Student Rating</div>
        </div>
        <div>
          <div className="font-display font-black text-xl sm:text-2xl text-[#15182D]">95%</div>
          <div className="text-xs text-[#687086] font-medium mt-0.5">Top Choice Allotments</div>
        </div>
        <div>
          <div className="font-display font-black text-xl sm:text-2xl text-[#E31E2B]">₹0</div>
          <div className="text-xs text-[#687086] font-medium mt-0.5">Admission Fee Charged</div>
        </div>
      </div>
    </section>
  );
}
