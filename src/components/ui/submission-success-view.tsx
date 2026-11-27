"use client";

import React from "react";
import { MessageCircle, Check } from "lucide-react";

interface SubmissionSuccessViewProps {
  title?: string;
  quote?: string;
  onClose?: () => void;
  onReset?: () => void;
  whatsappMessage?: string;
  compact?: boolean;
}

export function SubmissionSuccessView({
  title = "Thank You!",
  quote = "Your request has been received. Our senior advisor will reach out to you shortly.",
  onClose,
  onReset,
  whatsappMessage,
  compact = false,
}: SubmissionSuccessViewProps) {
  if (compact) {
    return (
      <div className="py-4 px-4 sm:px-6 rounded-2xl bg-gradient-to-r from-emerald-50/90 via-white to-emerald-50/50 border border-emerald-200/90 flex flex-col sm:flex-row items-center justify-between gap-4 animate-fade-in shadow-xs">
        <div className="flex items-center gap-4 text-left">
          {/* Compact 3D Glass Bouncing Ball */}
          <div className="relative inline-flex flex-col items-center justify-center shrink-0">
            <div className="animate-glass-bounce animate-glass-pop relative w-12 h-12 rounded-full flex items-center justify-center select-none">
              {/* Ambient Glow */}
              <div className="absolute inset-0 rounded-full bg-emerald-400/35 blur-md scale-110 pointer-events-none" />

              {/* 3D Glass Sphere Body */}
              <div
                className="relative w-full h-full rounded-full flex items-center justify-center overflow-hidden border border-white/80 ring-2 ring-emerald-400/25 ring-offset-1 ring-offset-white/80 shadow-[0_12px_24px_-4px_rgba(16,185,129,0.45),inset_0_-5px_10px_rgba(5,150,105,0.7),inset_0_3px_6px_rgba(255,255,255,0.9)]"
                style={{
                  background:
                    "radial-gradient(circle at 35% 28%, #6ee7b7 0%, #34d399 24%, #10b981 52%, #059669 80%, #047857 100%)",
                }}
              >
                {/* Curved Specular Glare (3D glass reflection) */}
                <div className="absolute -top-1 left-1.5 w-7 h-4 rounded-full bg-gradient-to-b from-white/95 via-white/40 to-transparent -rotate-12 blur-[0.4px] pointer-events-none" />

                {/* Bottom Caustic Reflection */}
                <div className="absolute -bottom-1 right-2 w-6 h-2.5 rounded-full bg-gradient-to-t from-emerald-200/50 to-transparent blur-[0.8px] pointer-events-none" />

                {/* White Checkmark */}
                <Check
                  className="w-6 h-6 text-white relative z-10 drop-shadow-[0_1.5px_2.5px_rgba(0,0,0,0.3)] stroke-[3.2]"
                />
              </div>
            </div>

            {/* Dynamic Physical Contact Shadow */}
            <div className="w-9 h-2 bg-emerald-950/25 rounded-full blur-[2px] mt-1.5 animate-glass-shadow" />
          </div>

          {/* Minimal Text */}
          <div className="space-y-0.5">
            <h4 className="font-display font-extrabold text-base sm:text-lg text-[#15182D] tracking-tight">
              {title}
            </h4>
            <p className="text-xs text-gray-600 font-medium leading-relaxed">
              &ldquo;{quote}&rdquo;
            </p>
          </div>
        </div>

        {/* Minimal Action Buttons */}
        <div className="flex items-center gap-3 shrink-0">
          {whatsappMessage && (
            <a
              href={`https://wa.me/919876543210?text=${encodeURIComponent(whatsappMessage)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-2xs"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>Chat on WhatsApp</span>
            </a>
          )}
          {onReset && (
            <button
              type="button"
              onClick={onReset}
              className="text-xs text-gray-500 hover:text-gray-900 underline font-semibold cursor-pointer"
            >
              Reset
            </button>
          )}
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-xl border border-gray-200 hover:bg-gray-100 text-xs font-bold text-gray-700 transition-colors cursor-pointer"
            >
              Close
            </button>
          )}
        </div>
      </div>
    );
  }

  // Full Modal / Card Display
  return (
    <div className="text-center py-8 sm:py-10 space-y-5 animate-fade-in">
      {/* 3D Glass Bouncing Ball */}
      <div className="relative inline-flex flex-col items-center justify-center">
        <div className="animate-glass-bounce animate-glass-pop relative w-20 h-20 sm:w-24 sm:h-24 rounded-full flex items-center justify-center select-none">
          {/* Ambient Glow */}
          <div className="absolute inset-0 rounded-full bg-emerald-400/35 blur-xl scale-110 pointer-events-none" />

          {/* 3D Glass Sphere Body */}
          <div
            className="relative w-full h-full rounded-full flex items-center justify-center overflow-hidden border border-white/80 ring-4 ring-emerald-400/25 ring-offset-2 ring-offset-white/80 shadow-[0_20px_40px_-6px_rgba(16,185,129,0.5),inset_0_-8px_16px_rgba(5,150,105,0.7),inset_0_4px_8px_rgba(255,255,255,0.9)]"
            style={{
              background:
                "radial-gradient(circle at 35% 28%, #6ee7b7 0%, #34d399 24%, #10b981 52%, #059669 80%, #047857 100%)",
            }}
          >
            {/* Curved Specular Glare (3D glass reflection) */}
            <div className="absolute -top-1 left-2.5 w-12 h-7 rounded-full bg-gradient-to-b from-white/95 via-white/40 to-transparent -rotate-15 blur-[0.6px] pointer-events-none" />

            {/* Bottom Caustic Reflection */}
            <div className="absolute -bottom-1.5 right-3 w-10 h-4 rounded-full bg-gradient-to-t from-emerald-200/50 to-transparent blur-[1px] pointer-events-none" />

            {/* White Checkmark */}
            <Check
              className="w-10 h-10 sm:w-12 sm:h-12 text-white relative z-10 drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)] stroke-[3.2]"
            />
          </div>
        </div>

        {/* Dynamic Physical Contact Shadow below the bouncing ball */}
        <div className="w-16 h-3 bg-emerald-950/25 rounded-full blur-[3px] mt-2.5 animate-glass-shadow" />
      </div>

      {/* Minimal Thank You Quote */}
      <div className="space-y-1.5 max-w-sm mx-auto">
        <h3 className="font-display font-extrabold text-2xl sm:text-3xl text-[#15182D] tracking-tight">
          {title}
        </h3>
        <p className="text-xs sm:text-sm text-gray-500 font-medium leading-relaxed italic">
          &ldquo;{quote}&rdquo;
        </p>
      </div>

      {/* Minimal Actions */}
      <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
        {whatsappMessage && (
          <a
            href={`https://wa.me/919876543210?text=${encodeURIComponent(whatsappMessage)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Chat on WhatsApp</span>
          </a>
        )}

        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl border border-gray-200 hover:bg-gray-100 text-xs font-bold text-gray-700 transition-colors cursor-pointer"
          >
            Done
          </button>
        )}

        {onReset && (
          <button
            type="button"
            onClick={onReset}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl border border-gray-200 hover:bg-gray-100 text-xs font-bold text-gray-700 transition-colors cursor-pointer"
          >
            Submit Another Request
          </button>
        )}
      </div>
    </div>
  );
}
