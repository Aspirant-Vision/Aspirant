import React from "react";
import Image from "next/image";
import { Quote } from "lucide-react";

interface TestimonialItem {
  name: string;
  degreeYear: string;
  college: string;
  quote: string;
  company: string;
  packageLpa: string;
  initials: string;
}

const TESTIMONIALS: TestimonialItem[] = [
  {
    name: "Ankit Sharma",
    degreeYear: "B.Tech 2023",
    college: "KIIT University",
    quote:
      "Aspirant Vision didn't just find me a college; they found me a career. The counseling session was transformative and guided my entire roadmap.",
    company: "Microsoft",
    packageLpa: "₹44 LPA",
    initials: "AS",
  },
  {
    name: "Priya Das",
    degreeYear: "MBA 2022",
    college: "Birla Global",
    quote:
      "The comparison tool was a lifesaver. I could clearly see which campus offered the best ROI and corporate exposure for my specialization.",
    company: "Deloitte",
    packageLpa: "₹12 LPA",
    initials: "PD",
  },
  {
    name: "Rahul Mehta",
    degreeYear: "B.Tech 2024",
    college: "SOA University",
    quote:
      "Their support didn't end with admission. The pre-placement tips and technical interview readiness they shared were instrumental in my placement.",
    company: "Amazon",
    packageLpa: "₹32 LPA",
    initials: "RM",
  },
];

export function VoiceOfSuccess() {
  return (
    <section id="success" className="py-20 lg:py-24 max-w-container-max mx-auto px-4 md:px-margin-desktop">
      <div className="text-center max-w-xl mx-auto mb-16 space-y-3">
        <span className="text-secondary font-extrabold tracking-widest uppercase text-xs">
          Alumni Outcomes
        </span>
        <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-primary">
          Voice of Success
        </h2>
        <p className="text-on-surface-variant text-sm sm:text-base">
          Real stories from students who secured their dream campus and career breakthroughs with our counseling.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
        {TESTIMONIALS.map((t, idx) => (
          <div
            key={idx}
            className="bg-white p-7 rounded-3xl border border-outline-variant/40 shadow-card hover:shadow-card-hover transition-all duration-300 flex flex-col justify-between"
          >
            <div>
              {/* Student Header */}
              <div className="flex items-center gap-4 mb-5">
                <div className="w-14 h-14 rounded-full bg-primary text-white flex items-center justify-center font-bold text-base shadow-sm shrink-0">
                  {t.initials}
                </div>
                <div>
                  <h4 className="font-display font-bold text-primary text-base">
                    {t.name}
                  </h4>
                  <p className="text-xs text-outline font-medium">
                    {t.degreeYear} | {t.college}
                  </p>
                </div>
              </div>

              {/* Quote */}
              <p className="text-on-surface-variant text-sm leading-relaxed mb-6 italic">
                &ldquo;{t.quote}&rdquo;
              </p>
            </div>

            {/* Placed At Highlight Box */}
            <div className="bg-surface-container-low p-4 rounded-xl border border-outline-variant/30">
              <div className="text-[10px] uppercase font-bold text-outline tracking-wider mb-1">
                Placed At
              </div>
              <div className="flex justify-between items-center">
                <span className="font-display font-extrabold text-primary text-base">
                  {t.company}
                </span>
                <span className="text-[#16A34A] font-extrabold text-base">
                  {t.packageLpa}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
