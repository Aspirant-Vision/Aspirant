"use client";

import React, { useState } from "react";
import { X, CheckCircle2, Send, GraduationCap, Phone, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SITE_CONFIG } from "@/lib/constants";

interface CounselingModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialCollege?: string;
}

export function CounselingModal({
  isOpen,
  onClose,
  initialCollege = "",
}: CounselingModalProps) {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    city: "",
    interestedCollege: initialCollege || "KIIT University",
    interestedCourse: "B.Tech Computer Science (CSE)",
    score: "",
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-primary-dark/70 backdrop-blur-sm animate-fade-in">
      <div
        className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-outline-variant/40 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Ribbon */}
        <div className="bg-primary px-6 py-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-secondary/20 flex items-center justify-center text-secondary">
              <GraduationCap className="w-6 h-6 text-secondary-fixed" />
            </div>
            <div>
              <h3 className="font-display font-bold text-lg leading-tight">
                Free Academic Counseling
              </h3>
              <p className="text-xs text-primary-fixed-dim">
                Personalized guidance from admission directors
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/10 text-white/80 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 md:p-8">
          {submitted ? (
            <div className="text-center py-8 space-y-4">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h4 className="font-display font-bold text-2xl text-primary">
                Application Received!
              </h4>
              <p className="text-sm text-on-surface-variant max-w-sm mx-auto">
                Thank you <strong className="text-primary">{formData.name}</strong>. Our senior counselor will connect with you via WhatsApp & call at{" "}
                <strong className="text-primary">{formData.phone}</strong> within 30 minutes.
              </p>
              <div className="pt-4">
                <Button
                  onClick={() => {
                    setSubmitted(false);
                    onClose();
                  }}
                  variant="primary"
                  className="rounded-xl px-8"
                >
                  Done
                </Button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-primary uppercase tracking-wider mb-1.5">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Pratush Singh"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-outline-variant focus:ring-2 focus:ring-primary focus:border-primary text-sm transition-all"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-primary uppercase tracking-wider mb-1.5">
                    WhatsApp Phone *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. 9938362938"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-outline-variant focus:ring-2 focus:ring-primary focus:border-primary text-sm transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-primary uppercase tracking-wider mb-1.5">
                    Your City / State *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Bhubaneswar / Patna"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-outline-variant focus:ring-2 focus:ring-primary focus:border-primary text-sm transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-primary uppercase tracking-wider mb-1.5">
                    Preferred College
                  </label>
                  <select
                    value={formData.interestedCollege}
                    onChange={(e) =>
                      setFormData({ ...formData, interestedCollege: e.target.value })
                    }
                    className="w-full px-4 py-3 rounded-xl border border-outline-variant focus:ring-2 focus:ring-primary focus:border-primary text-sm transition-all bg-white"
                  >
                    <option value="KIIT University">KIIT University</option>
                    <option value="SOA University">SOA University</option>
                    <option value="Centurion University">Centurion University</option>
                    <option value="CV Raman Global">CV Raman Global</option>
                    <option value="SRM Institute">SRM Institute</option>
                    <option value="Birla Global">Birla Global</option>
                    <option value="GIET University">GIET University</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-primary uppercase tracking-wider mb-1.5">
                    Target Course
                  </label>
                  <select
                    value={formData.interestedCourse}
                    onChange={(e) =>
                      setFormData({ ...formData, interestedCourse: e.target.value })
                    }
                    className="w-full px-4 py-3 rounded-xl border border-outline-variant focus:ring-2 focus:ring-primary focus:border-primary text-sm transition-all bg-white"
                  >
                    <option value="B.Tech Computer Science (CSE)">B.Tech CSE</option>
                    <option value="B.Tech AI & Data Science">B.Tech AI & ML</option>
                    <option value="MBA (Dual Specialization)">MBA</option>
                    <option value="BCA / MCA">BCA / MCA</option>
                    <option value="B.Tech Mechanical / Civil">B.Tech Core</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-primary uppercase tracking-wider mb-1.5">
                  12th % or JEE / Entrance Score (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. 84% in 12th PCM or 88 percentile"
                  value={formData.score}
                  onChange={(e) => setFormData({ ...formData, score: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-outline-variant focus:ring-2 focus:ring-primary focus:border-primary text-sm transition-all"
                />
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  className="w-full justify-center py-3.5 text-base shadow-lg hover:shadow-xl font-bold"
                >
                  <Send className="w-4 h-4" />
                  <span>Request Instant Counseling</span>
                </Button>
              </div>

              <div className="text-center pt-2">
                <a
                  href={SITE_CONFIG.whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-semibold text-[#16A34A] hover:underline inline-flex items-center gap-1"
                >
                  <Sparkles className="w-3.5 h-3.5 text-secondary" />
                  Prefer instant chat? Connect on WhatsApp directly
                </a>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
