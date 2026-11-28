import React from "react";
import Link from "next/link";
import { MessageCircle, PhoneCall, Check } from "lucide-react";
import { SITE_CONFIG } from "@/lib/constants";

export function FinalCtaBanner() {
  return (
    <section className="py-16 lg:py-20 max-w-container-max mx-auto px-4 md:px-margin-desktop">
      <div className="bg-gradient-to-br from-[#FFE088] via-[#FED65B] to-[#E9C349] rounded-[36px] p-8 sm:p-14 md:p-20 text-center relative overflow-hidden shadow-2xl border border-secondary/40">
        {/* Subtle Decorative Dot Matrix Pattern */}
        <div className="absolute inset-0 pointer-events-none opacity-10">
          <svg height="100%" width="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="dot-pattern" width="30" height="30" patternUnits="userSpaceOnUse">
                <circle cx="2" cy="2" r="2" fill="#0B2240" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#dot-pattern)" />
          </svg>
        </div>

        <div className="relative z-10 max-w-3xl mx-auto space-y-6">
          <span className="inline-block bg-primary text-white px-4 py-1.5 rounded-full text-xs font-extrabold uppercase tracking-widest shadow-sm">
            Get Started Today
          </span>

          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-black text-primary leading-tight">
            Your future is too important to leave to chance.
          </h2>

          <p className="font-body text-base sm:text-lg text-[#3E3000] max-w-2xl mx-auto leading-relaxed font-medium">
            Talk to our expert counselors today and map out your journey to excellence. Professional advice and scholarship guidance is just a click away.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              href={SITE_CONFIG.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto bg-[#25D366] hover:bg-[#20ba59] text-white px-8 py-4 rounded-2xl flex items-center justify-center gap-3 font-bold text-base sm:text-lg transition-colors shadow-md"
            >
              <MessageCircle className="w-6 h-6 fill-current" />
              <span>WhatsApp Now</span>
            </Link>

            <Link
              href={SITE_CONFIG.phoneTel}
              className="w-full sm:w-auto bg-primary hover:bg-primary-light text-white px-8 py-4 rounded-2xl flex items-center justify-center gap-3 font-bold text-base sm:text-lg transition-colors shadow-md"
            >
              <PhoneCall className="w-5 h-5 text-secondary" />
              <span>Call Expert</span>
            </Link>
          </div>

          <div className="pt-2 flex items-center justify-center gap-2 text-xs font-semibold text-[#574500]">
            <Check className="w-4 h-4 text-emerald-800" />
            <span>No hidden fees. 100% transparent counseling.</span>
          </div>
        </div>
      </div>
    </section>
  );
}
