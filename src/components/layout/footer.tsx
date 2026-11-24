"use client";

import React from "react";
import Link from "next/link";
import { Logo } from "@/components/ui/logo";
import {
  MapPin,
  Phone,
  Mail,
  Linkedin,
  Instagram,
  Youtube,
  Facebook,
  Twitter,
  ArrowRight,
  ShieldCheck,
  Award,
  Lock,
} from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-[#0C102C] text-gray-300 w-full pt-16 pb-8 border-t border-white/10">
      <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top 5-Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-10 pb-12 border-b border-white/10">
          {/* Col 1: Brand & Credentials (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            <Logo inverted={true} />
            <p className="text-xs sm:text-sm text-gray-300 leading-relaxed max-w-sm font-normal">
              A trusted college admissions counselling platform helping students discover the right colleges, get expert guidance and achieve their career goals.
            </p>

            {/* Social Channels Strip */}
            <div className="pt-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block mb-2.5">
                Connect With Us
              </span>
              <div className="flex items-center gap-2.5">
                <a
                  href="https://linkedin.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full bg-white/10 hover:bg-[#E31E2B] text-white flex items-center justify-center transition-all hover:scale-110 shadow-sm"
                  aria-label="LinkedIn"
                >
                  <Linkedin className="w-4 h-4" />
                </a>
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full bg-white/10 hover:bg-[#E31E2B] text-white flex items-center justify-center transition-all hover:scale-110 shadow-sm"
                  aria-label="Instagram"
                >
                  <Instagram className="w-4 h-4" />
                </a>
                <a
                  href="https://youtube.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full bg-white/10 hover:bg-[#E31E2B] text-white flex items-center justify-center transition-all hover:scale-110 shadow-sm"
                  aria-label="YouTube"
                >
                  <Youtube className="w-4 h-4" />
                </a>
                <a
                  href="https://facebook.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full bg-white/10 hover:bg-[#E31E2B] text-white flex items-center justify-center transition-all hover:scale-110 shadow-sm"
                  aria-label="Facebook"
                >
                  <Facebook className="w-4 h-4" />
                </a>
                <a
                  href="https://twitter.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full bg-white/10 hover:bg-[#E31E2B] text-white flex items-center justify-center transition-all hover:scale-110 shadow-sm"
                  aria-label="Twitter / X"
                >
                  <Twitter className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>

          {/* Col 2: Top Institutions (2 cols) */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="font-bold text-white text-xs uppercase tracking-wider">
              Top Colleges
            </h4>
            <nav className="flex flex-col gap-2 text-xs">
              <Link href="#colleges" className="text-gray-300 hover:text-white transition-colors">
                IIT Delhi
              </Link>
              <Link href="#colleges" className="text-gray-300 hover:text-white transition-colors">
                IIM Ahmedabad
              </Link>
              <Link href="#colleges" className="text-gray-300 hover:text-white transition-colors">
                BITS Pilani
              </Link>
              <Link href="#colleges" className="text-gray-300 hover:text-white transition-colors">
                KIIT University
              </Link>
              <Link href="#colleges" className="text-gray-300 hover:text-white transition-colors">
                SOA University
              </Link>
              <Link href="#compare" className="text-[#E31E2B] font-bold hover:underline transition-colors mt-1 block">
                Compare All Colleges →
              </Link>
            </nav>
          </div>

          {/* Col 3: Programs & Streams (2 cols) */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="font-bold text-white text-xs uppercase tracking-wider">
              Popular Courses
            </h4>
            <nav className="flex flex-col gap-2 text-xs">
              <Link href="#courses" className="text-gray-300 hover:text-white transition-colors">
                B.Tech Computer Science
              </Link>
              <Link href="#courses" className="text-gray-300 hover:text-white transition-colors">
                B.Tech AI & Data Science
              </Link>
              <Link href="#courses" className="text-gray-300 hover:text-white transition-colors">
                MBA & PGDM
              </Link>
              <Link href="#courses" className="text-gray-300 hover:text-white transition-colors">
                MBBS / Medical
              </Link>
              <Link href="#courses" className="text-gray-300 hover:text-white transition-colors">
                Integrated Law (LLB)
              </Link>
              <Link href="#courses" className="text-gray-300 hover:text-white transition-colors">
                BCA / MCA
              </Link>
            </nav>
          </div>

          {/* Col 4: Quick Links & Resources (2 cols) */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="font-bold text-white text-xs uppercase tracking-wider">
              Student Resources
            </h4>
            <nav className="flex flex-col gap-2 text-xs">
              <Link href="#exams" className="text-gray-300 hover:text-white transition-colors">
                Admission Calendar
              </Link>
              <Link href="#journey" className="text-gray-300 hover:text-white transition-colors">
                4-Step Journey Roadmap
              </Link>
              <Link href="#placements" className="text-gray-300 hover:text-white transition-colors">
                Top Recruiters & CTC
              </Link>
              <Link href="#finder" className="text-gray-300 hover:text-white transition-colors">
                College Finder Tool
              </Link>
              <Link href="#blog" className="text-gray-300 hover:text-white transition-colors">
                Blogs & Guides
              </Link>
              <Link href="#why" className="text-gray-300 hover:text-white transition-colors">
                Why Aspirant Vision
              </Link>
            </nav>
          </div>

          {/* Col 5: Head Office & Direct Contact (2 cols) */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="font-bold text-white text-xs uppercase tracking-wider">
              Get in Touch
            </h4>
            <div className="space-y-3 text-xs text-gray-300">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-[#E31E2B] shrink-0 mt-0.5" />
                <span className="leading-relaxed">
                  Bhubaneswar, Odisha, India
                </span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-[#E31E2B] shrink-0" />
                <a href="tel:+919876543210" className="hover:text-white transition-colors font-semibold">
                  +91 98765 43210
                </a>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-[#E31E2B] shrink-0" />
                <a href="mailto:hello@aspirantvision.com" className="hover:text-white transition-colors">
                  hello@aspirantvision.com
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Accreditation & Trust Bar */}
        <div className="py-6 border-b border-white/10 flex flex-wrap items-center justify-between gap-4 text-xs text-gray-400">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#E31E2B]" />
            <span>AICTE & UGC Recognized College Partnerships</span>
          </div>
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-amber-400" />
            <span>ISO 9001:2015 Certified Educational Consultancy</span>
          </div>
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-emerald-400" />
            <span>100% Student Data Privacy Guaranteed</span>
          </div>
        </div>

        {/* Bottom Copyright & Legal Links */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-400 gap-4">
          <p>© 2026 Aspirant Vision. All rights reserved.</p>

          <div className="flex items-center gap-4 text-xs">
            <Link href="/privacy" className="hover:text-white transition-colors">
              Privacy Policy
            </Link>
            <span>•</span>
            <Link href="/terms" className="hover:text-white transition-colors">
              Terms of Service
            </Link>
            <span>•</span>
            <Link href="/refund" className="hover:text-white transition-colors">
              Refund Policy
            </Link>
          </div>

          <div className="flex items-center gap-2">
            <span>Designed for Students</span>
            <span>•</span>
            <span className="text-[#FF6B6B] font-bold">Empowering Success</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
