"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/ui/logo";
import { useCounselingModal } from "@/components/forms/counseling-modal-context";
import { NavUserProfile } from "@/components/layout/nav-user-profile";
import {
  ChevronDown,
  ArrowUpRight,
  Menu,
  X,
  User,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

export function TopNavBar() {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const { openModal } = useCounselingModal();

  const isMbaActive = pathname === "/mba" || pathname === "/mba-pgdm";
  const isHomeActive = pathname === "/";
  const isCollegesActive = pathname.startsWith("/colleges");
  const isCoursesActive = pathname.startsWith("/courses");

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navItems = [
    { name: "Home", href: "/", active: isHomeActive },
    {
      name: "Colleges",
      href: "/colleges",
      active: isCollegesActive,
      hasDropdown: true,
      subItems: [
        { label: "Engineering Colleges", href: "/colleges?type=Engineering" },
        { label: "Management (MBA) Colleges", href: "/colleges?type=Management" },
        { label: "Medical & Dental Colleges", href: "/colleges?type=Medical" },
        { label: "Law Universities", href: "/colleges?type=Law" },
        { label: "Compare Colleges", href: "/colleges" },
      ],
    },
    {
      name: "Courses",
      href: "/courses",
      active: isCoursesActive,
      hasDropdown: true,
      subItems: [
        { label: "B.Tech / B.E.", href: "/courses?category=Engineering&degree=B.Tech+%2F+B.E." },
        { label: "MBA / PGDM Special Portal", href: "/mba" },
        { label: "MBBS / BDS", href: "/courses?category=Medical+%26+Allied+Health" },
        { label: "BBA / BCA", href: "/courses?category=Management" },
        { label: "All Career Paths", href: "/courses" },
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
        { label: "Scholarship Guidance", href: "/#finder" },
        { label: "Direct Admissions", href: "/#journey" },
      ],
    },
  ];

  return (
    <header
      className={cn(
        "fixed top-0 left-0 w-full z-50 transition-all duration-300",
        isScrolled
          ? "bg-white/95 backdrop-blur-md shadow-sm border-b border-[#E7E9F0] py-2.5"
          : "bg-white/85 backdrop-blur-sm border-b border-white/50 py-3.5"
      )}
    >
      <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Brand Logo */}
        <Logo className="shrink-0" />

        {/* Center Navigation matching screenshot */}
        <nav className="hidden lg:flex items-center gap-6 xl:gap-8">
          {navItems.map((item) => (
            <div
              key={item.name}
              className="relative"
              onMouseEnter={() => item.hasDropdown && setActiveDropdown(item.name)}
              onMouseLeave={() => setActiveDropdown(null)}
            >
              <Link
                href={item.href}
                className={cn(
                  "inline-flex items-center gap-1.5 text-[13.5px] font-semibold tracking-tight transition-colors py-1 relative",
                  item.active
                    ? "text-[#E31E2B] font-bold"
                    : item.special
                    ? "text-[#E31E2B] font-bold hover:text-[#B5121B]"
                    : "text-[#15182D] hover:text-[#E31E2B]"
                )}
              >
                <span>{item.name}</span>
                {item.badge && (
                  <span className="px-1.5 py-0.5 rounded-full text-[9px] font-extrabold bg-[#E31E2B] text-white uppercase tracking-wider shadow-xs">
                    {item.badge}
                  </span>
                )}
                {item.hasDropdown && (
                  <ChevronDown className="w-3.5 h-3.5 text-[#687086] transition-transform duration-200 mt-0.5" />
                )}
                {item.active && (
                  <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#E31E2B] rounded-full" />
                )}
              </Link>

              {/* Submenu Dropdown */}
              {item.hasDropdown && activeDropdown === item.name && (
                <div className="absolute top-full left-0 w-60 pt-2 z-50 animate-fade-in">
                  <div className="tactile-card rounded-2xl p-2 space-y-1">
                    {item.subItems?.map((sub: any) => (
                      <Link
                        key={sub.label}
                        href={sub.href}
                        onClick={() => setActiveDropdown(null)}
                        className={cn(
                          "block px-3 py-2 text-xs font-semibold rounded-xl transition-colors",
                          sub.highlight
                            ? "text-[#E31E2B] bg-red-50 font-bold hover:bg-red-100/80"
                            : "text-[#15182D] hover:text-[#E31E2B] hover:bg-red-50/70"
                        )}
                      >
                        {sub.label}
                      </Link>
                    ))}
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
        <div className="lg:hidden bg-white border-b border-[#E7E9F0] px-6 py-6 shadow-2xl space-y-4 animate-fade-in max-h-[85vh] overflow-y-auto">
          {/* Featured Mobile MBA Special Shortcut */}
          <Link
            href="/mba"
            onClick={() => setIsMobileMenuOpen(false)}
            className="block p-3.5 rounded-2xl bg-gradient-to-r from-red-500/10 via-red-500/5 to-[#171B52]/10 border border-red-200 shadow-xs"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-extrabold text-[#E31E2B] flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                Looking for MBA | PGDM?
              </span>
              <span className="px-2 py-0.5 rounded-full bg-[#E31E2B] text-white text-[9px] font-extrabold uppercase tracking-wider">
                Special Hub
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
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={cn(
                    "block py-1.5 text-sm font-semibold transition-colors",
                    item.active ? "text-[#E31E2B] font-bold" : "text-[#15182D] hover:text-[#E31E2B]"
                  )}
                >
                  {item.name}
                </Link>
                {item.hasDropdown && (
                  <div className="pl-3 py-1 space-y-1">
                    {item.subItems?.map((sub) => (
                      <Link
                        key={sub.label}
                        href={sub.href}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="block py-1 text-xs text-[#687086] hover:text-[#E31E2B]"
                      >
                        {sub.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>

          <div className="pt-2 flex flex-col gap-2.5">
            <Link
              href="/login"
              onClick={() => setIsMobileMenuOpen(false)}
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
