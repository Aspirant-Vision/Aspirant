"use client";

import React, { useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";
import { useCounselingModal } from "@/components/forms/counseling-modal-context";

export function StatsAndTestimonial() {
  const { openModal } = useCounselingModal();

  const testimonials = [
    {
      name: "Priya Sharma",
      course: "B.Tech, IIT Delhi",
      image: "/images/ss_crops/priya_sharma.png",
      quote:
        "Aspirant Vision helped me choose the right college and guided me throughout the admission process. The counselling was truly personalized and effective.",
      rating: 5,
    },
    {
      name: "Ankit Verma",
      course: "MBA, IIM Ahmedabad",
      image: "/images/ss_crops/priya_sharma.png",
      quote:
        "The comparison insights and percentile cutoff guidance gave me absolute clarity during seat allotment. Highly recommended to every serious aspirant!",
      rating: 5,
    },
  ];

  const [currentIndex, setCurrentIndex] = useState(0);

  const prev = () => {
    setCurrentIndex((prevIdx) =>
      prevIdx === 0 ? testimonials.length - 1 : prevIdx - 1
    );
  };

  const next = () => {
    setCurrentIndex((prevIdx) =>
      prevIdx === testimonials.length - 1 ? 0 : prevIdx + 1
    );
  };

  const current = testimonials[currentIndex] ?? testimonials[0];

  return (
    <section className="py-10 max-w-container-max mx-auto px-4 md:px-margin-desktop">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left: Building Image with Floating Stat Capsule */}
        <div className="lg:col-span-6 relative">
          <div className="relative aspect-[16/10] w-full rounded-3xl overflow-hidden shadow-lg border border-gray-100">
            <Image
              src="/images/ss_crops/stats_building.png"
              alt="Premier University Campus"
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
          </div>

          {/* Floating Pill with 3 stats */}
          <div className="absolute -bottom-5 left-4 right-4 sm:left-8 sm:right-8 bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-gray-100 py-3.5 px-4 grid grid-cols-3 divide-x divide-gray-100 text-center">
            <div>
              <div className="font-display font-black text-base sm:text-lg text-gray-900 leading-tight">
                50K+
              </div>
              <div className="text-[11px] text-gray-500 font-semibold mt-0.5">
                Students Guided
              </div>
            </div>
            <div>
              <div className="font-display font-black text-base sm:text-lg text-gray-900 leading-tight">
                2,500+
              </div>
              <div className="text-[11px] text-gray-500 font-semibold mt-0.5">
                Colleges Listed
              </div>
            </div>
            <div>
              <div className="font-display font-black text-base sm:text-lg text-gray-900 leading-tight">
                4.8/5
              </div>
              <div className="text-[11px] text-gray-500 font-semibold mt-0.5">
                Student Rating
              </div>
            </div>
          </div>
        </div>

        {/* Right: Testimonial Card */}
        <div className="lg:col-span-6 bg-white p-7 sm:p-9 rounded-3xl border border-gray-100 shadow-md relative mt-6 lg:mt-0 flex flex-col justify-between">
          {/* Carousel Arrows */}
          <div className="absolute top-6 right-6 flex items-center gap-1.5">
            <button
              onClick={prev}
              className="w-8 h-8 rounded-full border border-gray-200 bg-white hover:bg-gray-50 flex items-center justify-center text-gray-600 transition-colors"
              aria-label="Previous testimonial"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={next}
              className="w-8 h-8 rounded-full border border-gray-200 bg-white hover:bg-gray-50 flex items-center justify-center text-gray-600 transition-colors"
              aria-label="Next testimonial"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div>
            {/* Red Quotation Mark */}
            <div className="text-[#DC2626] font-serif text-5xl leading-none select-none mb-2">
              &ldquo;
            </div>

            {/* Testimonial Quote */}
            <p className="font-body text-sm sm:text-base text-gray-700 leading-relaxed italic mb-6">
              {current?.quote}
            </p>
          </div>

          {/* Author Details */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
            <div className="flex items-center gap-3">
              <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-red-100 shrink-0 shadow-sm">
                <Image
                  src={current?.image || "/images/ss_crops/priya_sharma.png"}
                  alt={current?.name || "Student"}
                  fill
                  className="object-cover"
                />
              </div>
              <div>
                <h4 className="font-display font-bold text-sm sm:text-base text-gray-900 leading-tight">
                  {current?.name}
                </h4>
                <p className="text-xs text-gray-500">{current?.course}</p>
              </div>
            </div>

            {/* 5 Gold Stars */}
            <div className="flex items-center gap-0.5">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className="w-4 h-4 text-amber-400 fill-amber-400"
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
