import React from "react";
import Link from "next/link";
import { ArrowLeft, Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center bg-[#F7F8FC]">
      <span className="text-[#E31E2B] font-display font-black text-6xl sm:text-8xl mb-2">
        404
      </span>
      <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-[#15182D] mb-3">
        Page Not Found
      </h1>
      <p className="text-sm text-[#687086] max-w-md mb-8 leading-relaxed">
        The admission guide, course or college page you are looking for might have been moved or is currently being updated.
      </p>
      <Link
        href="/"
        className="tactile-btn-red text-white px-6 py-3 rounded-full text-xs sm:text-sm font-bold inline-flex items-center gap-2 shadow-md cursor-pointer"
      >
        <Home className="w-4 h-4" />
        <span>Return to Homepage</span>
      </Link>
    </div>
  );
}
