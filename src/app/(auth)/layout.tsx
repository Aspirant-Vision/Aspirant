import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Logo } from "@/components/ui/logo";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="h-screen w-screen overflow-hidden bg-white flex flex-col lg:flex-row select-none">
      {/* =========================================================================
          LEFT PANEL: Full-Bleed Architectural Campus Photography & Minimalist Editorial
          ========================================================================= */}
      <div className="relative hidden lg:flex lg:w-1/2 h-full overflow-hidden">
        {/* Ultra-High-Resolution Architectural Campus Photograph */}
        <Image
          src="/images/auth/auth_campus_highres.jpg"
          alt="University Academic Campus"
          fill
          priority
          quality={90}
          sizes="50vw"
          className="object-cover object-center"
        />

        {/* Refined Photographic Scrim Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-950/50 to-slate-950/80" />

        {/* Left Panel Content */}
        <div className="relative z-10 w-full h-full p-10 xl:p-14 flex flex-col justify-between text-white">
          {/* Top: Brand Logo */}
          <div>
            <Logo inverted />
          </div>

          {/* Center: Minimalist Statement */}
          <div className="max-w-md space-y-3">
            <h1 className="text-3xl xl:text-4xl font-bold tracking-tight text-white leading-tight">
              Shape your future with the right university.
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed font-normal">
              Direct merit counselling, official cutoff analytics, and personalized guidance for
              India&apos;s premier institutions.
            </p>
          </div>

          {/* Bottom: Minimalist Quote */}
          <div className="border-t border-white/15 pt-4 text-xs text-slate-300 max-w-md">
            <p className="italic font-light leading-relaxed">
              &ldquo;Securing admission was direct, transparent, and completely stress-free.&rdquo;
            </p>
            <p className="mt-1 font-medium text-white/90">
              Priya Sengupta &mdash; B.Tech &apos;26
            </p>
          </div>
        </div>
      </div>

      {/* =========================================================================
          RIGHT PANEL: Clean, Minimalist Single-Window Form Canvas
          ========================================================================= */}
      <div className="w-full lg:w-1/2 h-full bg-white flex flex-col justify-between p-6 sm:p-10 xl:p-12 overflow-y-auto lg:overflow-hidden">
        {/* Top Navigation Row */}
        <div className="flex items-center justify-between w-full max-w-[380px] mx-auto">
          <div className="lg:hidden">
            <Logo />
          </div>
          <div className="ml-auto">
            <Link
              href="/"
              className="text-xs font-medium text-slate-500 hover:text-slate-900 transition-colors"
            >
              &larr; Back to Home
            </Link>
          </div>
        </div>

        {/* Center: The Minimal Form */}
        <div className="w-full max-w-[380px] mx-auto my-auto py-2">
          {children}
        </div>

        {/* Bottom: Subtle Copyright */}
        <div className="w-full max-w-[380px] mx-auto text-center text-[11px] text-slate-400">
          <p>© {new Date().getFullYear()} Aspirant Vision. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}
