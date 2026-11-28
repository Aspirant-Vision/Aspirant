"use client";

import React from "react";
import Image from "next/image";
import { ArrowRight, Calendar, Clock } from "lucide-react";
import { useCounselingModal } from "@/components/forms/counseling-modal-context";

interface ArticleItem {
  id: string;
  title: string;
  category: string;
  categoryStyle: string;
  date: string;
  readTime: string;
  image: string;
}

const ARTICLES: ArticleItem[] = [
  {
    id: "choose-college",
    title: "How to Choose the Right College for Your Career Goals",
    category: "Admission Guide",
    categoryStyle: "bg-red-50 text-[#E31E2B] border border-red-100",
    date: "Nov 18, 2026",
    readTime: "5 min read",
    image: "/images/ss_crops/blog_1.png",
  },
  {
    id: "top-courses",
    title: "Top Courses After 12th: A Complete Guide",
    category: "Career",
    categoryStyle: "bg-amber-50 text-amber-700 border border-amber-200",
    date: "Nov 15, 2026",
    readTime: "6 min read",
    image: "/images/ss_crops/blog_2.png",
  },
  {
    id: "mistakes-admission",
    title: "Mistakes to Avoid During the Admission Process",
    category: "Counselling",
    categoryStyle: "bg-blue-50 text-[#171B52] border border-blue-100",
    date: "Nov 12, 2026",
    readTime: "4 min read",
    image: "/images/ss_crops/blog_3.png",
  },
];

export function BlogsMagazine() {
  const { openModal } = useCounselingModal();

  return (
    <section id="blog" className="py-8 sm:py-12 lg:py-14 max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-6 sm:mb-8 gap-4 border-b border-[#E7E9F0] pb-4 sm:pb-5">
        <div>
          <span className="text-[#E31E2B] font-bold text-xs uppercase tracking-wider block mb-1">
            — Latest Insights
          </span>
          <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-[#15182D] tracking-tight">
            Blogs &amp; Admission Guides
          </h2>
          <p className="text-xs sm:text-sm text-[#687086] mt-1">
            Get expert articles, admission updates, college reviews and career guidance.
          </p>
        </div>

        <button
          onClick={() => openModal("All Educational Articles")}
          className="tactile-pill inline-flex items-center gap-1.5 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full text-[#E31E2B] text-xs font-bold transition-all"
        >
          <span>View All Blogs</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* 3-Card Editorial Magazine Layout matching screenshot */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6">
        {ARTICLES.map((art) => (
          <article
            key={art.id}
            onClick={() => openModal(`Article: ${art.title}`)}
            className="tactile-card rounded-2xl sm:rounded-3xl overflow-hidden group cursor-pointer flex flex-col justify-between"
          >
            <div>
              {/* Cover Image */}
              <div className="relative h-44 w-full bg-gray-100 overflow-hidden">
                <Image
                  src={art.image}
                  alt={art.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover"
                />
                <div className="absolute top-3 left-3">
                  <span
                    className={`px-3 py-1 rounded-full text-[11px] font-bold shadow-xs ${art.categoryStyle}`}
                  >
                    {art.category}
                  </span>
                </div>
              </div>

              {/* Title Content */}
              <div className="p-4 space-y-2">
                <h3 className="font-display font-bold text-sm sm:text-base text-[#15182D] group-hover:text-[#E31E2B] transition-colors leading-snug line-clamp-2">
                  {art.title}
                </h3>
              </div>
            </div>

            {/* Bottom Meta */}
            <div className="px-4 pb-4 pt-1 flex items-center gap-3 text-xs text-[#687086]">
              <span className="flex items-center gap-1 text-[11px]">
                <Calendar className="w-3.5 h-3.5 text-gray-400" />
                {art.date}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1 text-[11px]">
                <Clock className="w-3.5 h-3.5 text-gray-400" />
                {art.readTime}
              </span>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
