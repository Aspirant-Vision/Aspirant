"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Logo } from "@/components/ui/logo";
import { useCounselingModal } from "@/components/forms/counseling-modal-context";
import { NavUserProfile } from "@/components/layout/nav-user-profile";
import {
  ChevronDown,
  ArrowUpRight,
  Menu,
  X,
  User,
  Sparkles,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils";

function TopNavBarContent() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const { openModal } = useCounselingModal();

  const isMbaActive = pathname === "/mba" || pathname === "/mba-pgdm";
  const isHomeActive = pathname === "/";
  const isCollegesActive = pathname.startsWith("/colleges");
  const isCoursesActive = pathname.startsWith("/courses");

  // Reset navigation indicator whenever route or query params change
  useEffect(() => {
    setIsNavigating(false);
  }, [pathname, searchParams]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLinkClick = (href: string) => {
    const currentFullUrl = searchParams.toString()
      ? `${pathname}?${searchParams.toString()}`
      : pathname;
    if (currentFullUrl !== href) {
      setIsNavigating(true);
      // Failsafe auto-reset so indicator never hangs if client router is instantaneous
      const timer = setTimeout(() => setIsNavigating(false), 700);
      return () => clearTimeout(timer);
    }
  };

  /**
   * Evaluates if a dropdown sub-item is active taking both pathname
   * and query parameters (such as ?type=... or ?category=...) into account.
   */
  const isSubItemActive = (subHref: string): boolean => {
    if (!pathname) return false;

    // Direct hash links
    if (subHref.startsWith("/#")) {
      return pathname === "/" && typeof window !== "undefined" && window.location.hash === subHref.slice(1);
    }

    // Pure path without query string (e.g. "/colleges", "/courses", "/mba")
    if (!subHref.includes("?")) {
      if (subHref === "/colleges") {
        const currentType = searchParams.get("type") || searchParams.get("category");
        return pathname === "/colleges" && !currentType;
      }
      if (subHref === "/courses") {
        const currentCategory = searchParams.get("category") || searchParams.get("stream");
        return pathname === "/courses" && !currentCategory;
      }
      return pathname === subHref;
    }

    // Subitem has query parameters
    const [subPath, subQueryString] = subHref.split("?");
    if (pathname !== subPath) return false;

    const subParams = new URLSearchParams(subQueryString);
    let allMatch = true;

    subParams.forEach((expectedValue, paramKey) => {
      const currentVal = searchParams.get(paramKey);
      if (!currentVal) {
        allMatch = false;
        return;
      }

      const decodedExpected = decodeURIComponent(expectedValue).toLowerCase().trim();
      const decodedCurrent = decodeURIComponent(currentVal).toLowerCase().trim();

      const matched =
        decodedCurrent === decodedExpected ||
        decodedCurrent.includes(decodedExpected) ||
        decodedExpected.includes(decodedCurrent);

      if (!matched) {
        allMatch = false;
      }
    });

    return allMatch;
  };

  const navItems = [
    { name: "Home", href: "/", active: isHomeActive },
    {
      name: "Colleges",
      href: "/colleges",
      active: isCollegesActive,
      hasDropdown: true,
      subItems: [
        { label: "All Colleges & Universities", href: "/colleges" },
        { label: "Engineering & Technology", href: "/colleges?type=Engineering" },
        { label: "Medical & Healthcare", href: "/colleges?type=Medical" },
        { label: "Management & Business", href: "/colleges?type=Management" },
        { label: "Law & Legal Studies", href: "/colleges?type=Law" },
        { label: "Arts, Science & Commerce", href: "/colleges?type=Arts+%26+Science" },
      ],
    },
    {
      name: "Courses",
      href: "/courses",
      active: isCoursesActive,
      hasDropdown: true,
      subItems: [
        { label: "Explore All Programs", href: "/courses" },
        { label: "Engineering (B.Tech / M.Tech)", href: "/courses?category=Engineering" },
        { label: "Medical & Allied Health (MBBS / BDS)", href: "/courses?category=Medical+%26+Allied+Health" },
        { label: "Management & Business (BBA / MBA)", href: "/courses?category=Management" },
        { label: "Computer Applications (BCA / MCA)", href: "/courses?category=Computer+Applications+%26+IT" },
        { label: "Design, Media & Architecture", href: "/courses?category=Design+%26+Architecture" },
      ],
    },
    {
      name: "MBA | PGDM",
      href: "/mba",
      active: isMbaActive,
      badge: "2026",
      special: true,
    },
    {
      name: "Exams",
      href: "/#exams",
      hasDropdown: true,
      subItems: [
        { label: "JEE Main 2026", href: "/#exams" },
        { label: "CAT 2025 / 2026", href: "/mba" },
        { label: "NEET UG", href: "/#exams" },
        { label: "OJEE / WBJEE", href: "/#exams" },
        { label: "BITSAT", href: "/#exams" },
      ],
    },
    {
      name: "Admissions",
      href: "/#journey",
      hasDropdown: true,
      subItems: [
        { label: "Admission Journey", href: "/#journey" },
        { label: "Eligibility Calculator", href: "/#finder" },
        { label: "Financial Aid & Concessions", href: "/#finder" },
        { label: "Direct Admissions", href: "/#journey" },
      ],
    },
  ];

  return (
    <header
      className={cn(
        "fixed top-0 left-0 w-full z-50 transition-all duration-200",
        isScrolled
          ? "bg-white/95 backdrop-blur-md shadow-sm border-b border-[#E7E9F0] py-2"
          : "bg-white/90 backdrop-blur-sm border-b border-white/50 py-3"
      )}
    >
      {/* Route & Query Parameter Transition Indicator */}
      {isNavigating && (
        <div className="absolute top-0 left-0 right-0 h-[2.5px] bg-[#E31E2B] animate-pulse z-50" />
      )}

      <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Brand Logo */}
        <Logo className="shrink-0" />

        {/* Center Navigation - Ultra-Snappy CSS Dropdowns (0ms JS delay) */}
        <nav className="hidden lg:flex items-center gap-4 xl:gap-6">
          {navItems.map((item) => (
            <div key={item.name} className="relative group py-1">
              {item.special ? (
                /* Specialized MBA | PGDM Feature Nav Button */
                <Link
                  href={item.href}
                  prefetch={true}
                  onClick={() => handleLinkClick(item.href)}
                  className={cn(
                    "group/mba relative inline-flex items-center gap-2 px-3 py-1.5 rounded-full transition-all duration-300",
                    item.active
                      ? "bg-red-50/90 border border-red-300 shadow-[0_2px_10px_rgba(227,30,43,0.18)]"
                      : "bg-gradient-to-r from-red-50/80 via-rose-50/50 to-white hover:from-red-100/90 hover:via-rose-100/60 hover:to-red-50/70 border border-red-200/90 hover:border-[#E31E2B]/60 shadow-[0_2px_8px_-2px_rgba(227,30,43,0.12)] hover:shadow-[0_4px_16px_rgba(227,30,43,0.25)] hover:-translate-y-0.5 active:translate-y-0"
                  )}
                >
                  {/* Ambient Glow Aura */}
                  <span className="absolute -inset-0.5 rounded-full bg-gradient-to-r from-red-500/25 via-rose-500/15 to-red-500/25 blur-xs opacity-0 group-hover/mba:opacity-100 transition-opacity duration-300 -z-10" />

                  <Sparkles className="w-3.5 h-3.5 text-[#E31E2B] transition-transform duration-300 group-hover/mba:rotate-12 group-hover/mba:scale-110 shrink-0" />

                  <span className="text-[13px] font-bold text-[#15182D] tracking-tight flex items-center">
                    <span>MBA</span>
                    <span className="text-gray-300 font-light mx-1">|</span>
                    {/* PGDM Highlight with smooth transition animation & micro-underline */}
                    <span className="relative inline-block font-black text-[#E31E2B] transition-all duration-300 group-hover/mba:text-[#B5121B] group-hover/mba:scale-105">
                      PGDM
                      <span className="absolute -bottom-0.5 left-0 right-0 h-[2px] bg-gradient-to-r from-[#E31E2B] to-[#FF4D5A] rounded-full scale-x-100 transition-transform duration-300 origin-left" />
                    </span>
                  </span>

                  {/* Pulsing Live 2026 Radar Badge */}
                  <span className="inline-flex items-center gap-1 pl-1.5 pr-2 py-0.5 rounded-full text-[9.5px] font-extrabold uppercase tracking-wider bg-gradient-to-r from-[#E31E2B] to-[#B5121B] text-white shadow-xs">
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-80" />
                      <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-white" />
                    </span>
                    <span>{item.badge || "2026"}</span>
                  </span>
                </Link>
              ) : (
                /* Standard Top Nav Item */
                <Link
                  href={item.href}
                  prefetch={true}
                  onClick={() => handleLinkClick(item.href)}
                  className={cn(
                    "inline-flex items-center gap-1.5 text-[13.5px] font-semibold tracking-tight transition-colors py-1 relative",
                    item.active
                      ? "text-[#E31E2B] font-bold"
                      : "text-[#15182D] group-hover:text-[#E31E2B] hover:text-[#E31E2B]"
                  )}
                >
                  <span>{item.name}</span>
                  {item.hasDropdown && (
                    <ChevronDown className="w-3.5 h-3.5 text-[#687086] group-hover:text-[#E31E2B] group-hover:rotate-180 transition-transform duration-150 mt-0.5" />
                  )}
                  {item.active && (
                    <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#E31E2B] rounded-full" />
                  )}
                </Link>
              )}

              {/* Submenu Dropdown - Instant pure CSS hover with zero delay */}
              {item.hasDropdown && (
                <div
                  className={cn(
                    "absolute top-full left-0 w-72 pt-1.5 z-50 transition-all duration-100 ease-out",
                    "invisible opacity-0 pointer-events-none -translate-y-1",
                    "group-hover:visible group-hover:opacity-100 group-hover:pointer-events-auto group-hover:translate-y-0"
                  )}
                >
                  <div className="bg-white/98 backdrop-blur-md rounded-2xl border border-gray-200/90 p-1.5 space-y-0.5 shadow-[0_12px_36px_-6px_rgba(0,0,0,0.12),0_4px_12px_-2px_rgba(0,0,0,0.06)]">
                    {item.subItems?.map((sub: any) => {
                      const active = isSubItemActive(sub.href);
                      return (
                        <Link
                          key={sub.label}
                          href={sub.href}
                          prefetch={true}
                          onClick={() => handleLinkClick(sub.href)}
                          className={cn(
                            "group/sub relative flex items-center justify-between px-3.5 py-2.5 text-xs rounded-xl transition-all duration-100",
                            active
                              ? "text-[#E31E2B] bg-red-50/90 font-bold shadow-xs border-l-[3px] border-[#E31E2B]"
                              : "text-[#15182D] font-semibold hover:text-[#E31E2B] hover:bg-red-50/60"
                          )}
                        >
                          <span className="truncate pr-2">{sub.label}</span>
                          {active ? (
                            <span className="shrink-0 flex items-center justify-center w-4 h-4 rounded-full bg-[#E31E2B] text-white shadow-xs">
                              <Check className="w-2.5 h-2.5 stroke-[3]" />
                            </span>
                          ) : (
                            <span className="shrink-0 w-1.5 h-1.5 rounded-full bg-transparent group-hover/sub:bg-red-300 transition-colors" />
                          )}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          ))}
        </nav>

        {/* Right Actions with Tactile Styling */}
        <div className="hidden sm:flex items-center gap-3 shrink-0">
          {/* Student Profile / Login State */}
          <NavUserProfile />

          {/* Apply Now CTA with Tactile Red Pill */}
          <button
            onClick={() => openModal("Apply Now")}
            className="tactile-btn-red inline-flex items-center gap-1.5 text-white px-5 py-2 rounded-full text-xs font-bold transition-all"
          >
            <span>Apply Now</span>
            <ArrowUpRight className="w-3.5 h-3.5 stroke-[2.5]" />
          </button>
        </div>

        {/* Mobile Hamburger */}
        <div className="flex items-center gap-2 lg:hidden">
          <button
            onClick={() => openModal("Apply Now")}
            className="tactile-btn-red text-white px-3.5 py-1.5 rounded-full text-xs font-bold inline-flex items-center gap-1 sm:hidden"
          >
            <span>Apply</span>
            <ArrowUpRight className="w-3 h-3" />
          </button>
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 text-[#15182D] hover:bg-gray-100 rounded-lg"
            aria-label="Toggle navigation menu"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-[#E7E9F0] px-6 py-6 shadow-2xl space-y-4 animate-in fade-in duration-100 max-h-[85vh] overflow-y-auto">
          {/* Featured Mobile MBA Special Shortcut */}
          <Link
            href="/mba"
            prefetch={true}
            onClick={() => {
              setIsMobileMenuOpen(false);
              handleLinkClick("/mba");
            }}
            className={cn(
              "block p-3.5 rounded-2xl border transition-all duration-200",
              isMbaActive
                ? "bg-red-50 border-[#E31E2B] shadow-sm"
                : "bg-gradient-to-r from-red-500/10 via-rose-500/5 to-[#171B52]/5 border-red-200 hover:border-[#E31E2B]"
            )}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-extrabold text-[#E31E2B] flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                Looking for MBA | <span className="underline decoration-2">PGDM</span>?
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#E31E2B] text-white text-[9px] font-extrabold uppercase tracking-wider">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-80" />
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-white" />
                </span>
                2026 Live
              </span>
            </div>
            <p className="text-[11px] text-[#475569] font-medium leading-tight">
              Direct merit counselling, IIM &amp; premier B-School cutoffs &amp; seat allocation.
            </p>
          </Link>

          <nav className="flex flex-col gap-2">
            {navItems.map((item) => (
              <div key={item.name} className="border-b border-gray-50 pb-1.5">
                <Link
                  href={item.href}
                  prefetch={true}
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    handleLinkClick(item.href);
                  }}
                  className={cn(
                    "block py-1.5 text-sm font-semibold transition-colors",
                    item.active ? "text-[#E31E2B] font-bold" : "text-[#15182D] hover:text-[#E31E2B]"
                  )}
                >
                  {item.name}
                </Link>
                {item.hasDropdown && (
                  <div className="pl-3 py-1 space-y-1">
                    {item.subItems?.map((sub) => {
                      const active = isSubItemActive(sub.href);
                      return (
                        <Link
                          key={sub.label}
                          href={sub.href}
                          prefetch={true}
                          onClick={() => {
                            setIsMobileMenuOpen(false);
                            handleLinkClick(sub.href);
                          }}
                          className={cn(
                            "flex items-center justify-between py-1.5 px-2 rounded-lg text-xs transition-colors",
                            active
                              ? "text-[#E31E2B] font-bold bg-red-50/80"
                              : "text-[#687086] hover:text-[#E31E2B] hover:bg-gray-50"
                          )}
                        >
                          <span>{sub.label}</span>
                          {active && (
                            <span className="w-1.5 h-1.5 rounded-full bg-[#E31E2B]" />
                          )}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}
          </nav>

          <div className="pt-2 flex flex-col gap-2.5">
            <Link
              href="/login"
              prefetch={true}
              onClick={() => {
                setIsMobileMenuOpen(false);
                handleLinkClick("/login");
              }}
              className="tactile-btn-white w-full py-2.5 rounded-xl text-xs font-bold text-[#15182D] flex items-center justify-center gap-2"
            >
              <User className="w-4 h-4 text-[#E31E2B]" />
              <span>Login</span>
            </Link>
            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                openModal("Apply Now");
              }}
              className="tactile-btn-red w-full py-2.5 rounded-xl text-white text-xs font-bold flex items-center justify-center gap-1.5"
            >
              <span>Get Free Guidance</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </header>
  );
}

function TopNavBarSkeleton() {
  return (
    <header className="fixed top-0 left-0 w-full z-50 bg-white/95 backdrop-blur-md shadow-sm border-b border-[#E7E9F0] py-3">
      <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        <Logo className="shrink-0" />
        <div className="hidden lg:flex items-center gap-6">
          <div className="h-4 w-12 bg-gray-100 rounded animate-pulse" />
          <div className="h-4 w-16 bg-gray-100 rounded animate-pulse" />
          <div className="h-4 w-16 bg-gray-100 rounded animate-pulse" />
          <div className="h-7 w-28 bg-red-50 rounded-full animate-pulse" />
          <div className="h-4 w-12 bg-gray-100 rounded animate-pulse" />
        </div>
        <div className="h-8 w-24 bg-red-100 rounded-full animate-pulse" />
      </div>
    </header>
  );
}

export function TopNavBar() {
  return (
    <Suspense fallback={<TopNavBarSkeleton />}>
      <TopNavBarContent />
    </Suspense>
  );
}
