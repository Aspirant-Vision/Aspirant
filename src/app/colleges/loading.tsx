import React from "react";

export default function CollegesLoading() {
  return (
    <div className="min-h-screen bg-[#F7F8FC] animate-pulse">
      {/* 1. HERO SKELETON */}
      <section className="relative pt-6 sm:pt-10 pb-10 sm:pb-14 border-b border-[#E7E9F0] bg-white">
        <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb & Live status pill */}
          <div className="flex items-center justify-between gap-3 mb-6">
            <div className="h-4 w-48 bg-gray-200 rounded-md" />
            <div className="h-7 w-64 bg-red-100/60 rounded-full" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left Column */}
            <div className="lg:col-span-7 space-y-4">
              <div className="h-6 w-52 bg-gray-200 rounded-full" />
              <div className="h-10 sm:h-12 w-3/4 bg-gray-200 rounded-xl" />
              <div className="h-4 w-full max-w-xl bg-gray-100 rounded" />
              <div className="h-4 w-2/3 max-w-lg bg-gray-100 rounded" />

              {/* Trust Badges */}
              <div className="flex gap-3 pt-2">
                <div className="h-7 w-36 bg-gray-100 rounded-full" />
                <div className="h-7 w-40 bg-gray-100 rounded-full" />
                <div className="h-7 w-32 bg-gray-100 rounded-full" />
              </div>

              {/* Metrics */}
              <div className="grid grid-cols-3 gap-3 pt-2 max-w-xl">
                <div className="h-16 bg-gray-50 border border-gray-100 rounded-xl" />
                <div className="h-16 bg-gray-50 border border-gray-100 rounded-xl" />
                <div className="h-16 bg-gray-50 border border-gray-100 rounded-xl" />
              </div>
            </div>

            {/* Right Column (Showcase Card) */}
            <div className="lg:col-span-5">
              <div className="rounded-2xl sm:rounded-3xl bg-gray-200 aspect-[16/11] sm:aspect-[4/3] lg:aspect-[16/12] border border-gray-200/90" />
            </div>
          </div>
        </div>
      </section>

      {/* 2. CATALOG SKELETON */}
      <section className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        <div className="flex flex-col lg:flex-row items-start gap-8">
          {/* Sidebar */}
          <div className="hidden lg:block w-72 xl:w-80 shrink-0">
            <div className="bg-white rounded-2xl border border-gray-200/90 p-5 space-y-4 h-96" />
          </div>

          {/* Cards Grid */}
          <div className="flex-1 min-w-0 space-y-5">
            <div className="h-14 bg-white rounded-2xl border border-gray-200/80" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-80 bg-white rounded-2xl border border-gray-200/80" />
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
