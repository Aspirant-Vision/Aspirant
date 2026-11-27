import React from "react";

export default function MbaLoading() {
  return (
    <div className="min-h-screen bg-[#FAFBFD] animate-pulse">
      <section className="relative pt-6 sm:pt-10 pb-12 sm:pb-16 border-b border-[#E7E9F0] bg-white">
        <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-3 mb-6 sm:mb-8">
            <div className="h-4 w-48 bg-gray-200 rounded-md" />
            <div className="h-7 w-64 bg-red-100/60 rounded-full" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            <div className="lg:col-span-7 space-y-5">
              <div className="h-6 w-52 bg-gray-200 rounded-full" />
              <div className="h-12 w-4/5 bg-gray-200 rounded-xl" />
              <div className="h-4 w-full bg-gray-100 rounded" />
              <div className="h-4 w-3/4 bg-gray-100 rounded" />

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-16 bg-gray-50 border border-gray-100 rounded-xl" />
                ))}
              </div>

              <div className="flex gap-4 pt-2">
                <div className="h-11 w-48 bg-gray-100 rounded-full" />
                <div className="h-11 w-44 bg-gray-100 rounded-full" />
              </div>
            </div>

            <div className="lg:col-span-5">
              <div className="h-[420px] bg-white rounded-3xl border border-gray-200/90 p-6" />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
