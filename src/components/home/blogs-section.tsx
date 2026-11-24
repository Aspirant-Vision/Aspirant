"use client";

import React from "react";
import Image from "next/image";
import { ArrowRight, Calendar, Clock } from "lucide-react";
import { useCounselingModal } from "@/components/forms/counseling-modal-context";

interface BlogPost {
  id: string;
  title: string;
  category: string;
  categoryColor: string;
  date: string;
  readTime: string;
  image: string;
}

const POSTS: BlogPost[] = [
  {
    id: "choose-college",
    title: "How to Choose the Right College for Your Career Goals",
    category: "Admission Guide",
    categoryColor: "bg-amber-100 text-amber-800",
    date: "Nov 18, 2026",
    readTime: "5 min read",
    image: "/images/ss_crops/blog_1.png",
  },
  {
    id: "top-courses",
    title: "Top Courses After 12th: A Complete Guide",
    category: "Career",
    categoryColor: "bg-orange-100 text-orange-800",
    date: "Nov 15, 2026",
    readTime: "6 min read",
    image: "/images/ss_crops/blog_2.png",
  },
  {
    id: "mistakes-admission",
    title: "Mistakes to Avoid During the Admission Process",
    category: "Counselling",
    categoryColor: "bg-red-100 text-red-800",
    date: "Nov 12, 2026",
    readTime: "4 min read",
    image: "/images/ss_crops/blog_3.png",
  },
];

export function BlogsSection() {
  const { openModal } = useCounselingModal();

  return (
    <section className="py-14 max-w-container-max mx-auto px-4 md:px-margin-desktop">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-8 gap-4">
        <div>
          <span className="text-[#DC2626] font-bold text-xs uppercase tracking-wider block mb-1">
            — Latest Insights
          </span>
          <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
            Blogs & Admission Guides
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Get expert articles, admission updates, college reviews and career guidance.
          </p>
        </div>

        <button
          onClick={() => openModal("Blogs")}
          className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full border border-[#DC2626] text-[#DC2626] hover:bg-red-50 text-xs font-bold transition-all"
        >
          <span>View All Blogs</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* 3 Blog Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {POSTS.map((post) => (
          <div
            key={post.id}
            onClick={() => openModal(post.title)}
            className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 group cursor-pointer flex flex-col"
          >
            {/* Blog Image */}
            <div className="relative h-44 w-full bg-gray-100 overflow-hidden">
              <Image
                src={post.image}
                alt={post.title}
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              />
              {/* Category Pill Tag */}
              <div className="absolute top-3.5 left-3.5">
                <span
                  className={`px-3 py-1 rounded-full text-[11px] font-extrabold shadow-sm ${post.categoryColor}`}
                >
                  {post.category}
                </span>
              </div>
            </div>

            {/* Content */}
            <div className="p-5 flex-1 flex flex-col justify-between">
              <h3 className="font-display font-bold text-base text-gray-900 group-hover:text-[#DC2626] transition-colors leading-snug mb-4">
                {post.title}
              </h3>

              <div className="flex items-center gap-4 text-xs text-gray-400 font-medium pt-3 border-t border-gray-100">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-gray-400" />
                  {post.date}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-gray-400" />
                  {post.readTime}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
