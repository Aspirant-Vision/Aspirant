import React from "react";

export default function AdminLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-gray-100">
        <div className="space-y-2">
          <div className="h-7 w-48 bg-gray-200 rounded-lg" />
          <div className="h-4 w-80 bg-gray-100 rounded-md" />
        </div>
        <div className="h-9 w-32 bg-gray-200 rounded-xl" />
      </div>

      {/* Metrics Row Skeleton */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-28 bg-white border border-gray-200/80 rounded-2xl p-4 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <div className="h-3 w-20 bg-gray-200 rounded" />
              <div className="w-8 h-8 rounded-xl bg-gray-100" />
            </div>
            <div className="space-y-1">
              <div className="h-7 w-16 bg-gray-200 rounded" />
              <div className="h-3 w-24 bg-gray-100 rounded" />
            </div>
          </div>
        ))}
      </div>

      {/* Table / Content Area Skeleton */}
      <div className="bg-white rounded-2xl border border-gray-200/80 p-6 space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div className="h-10 w-72 bg-gray-100 rounded-xl" />
          <div className="flex gap-2">
            <div className="h-10 w-24 bg-gray-100 rounded-xl" />
            <div className="h-10 w-28 bg-gray-100 rounded-xl" />
          </div>
        </div>

        <div className="space-y-3 pt-2">
          {[1, 2, 3, 4, 5].map((row) => (
            <div key={row} className="h-14 bg-gray-50/80 rounded-xl border border-gray-100 flex items-center px-4 justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gray-200" />
                <div className="space-y-1.5">
                  <div className="h-4 w-40 bg-gray-200 rounded" />
                  <div className="h-3 w-20 bg-gray-100 rounded" />
                </div>
              </div>
              <div className="h-6 w-20 bg-gray-100 rounded-full" />
              <div className="h-4 w-24 bg-gray-100 rounded" />
              <div className="h-8 w-20 bg-gray-200 rounded-lg" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
