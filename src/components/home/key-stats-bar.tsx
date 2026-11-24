import React from "react";
import { Landmark, Users, Award, CalendarCheck } from "lucide-react";

export function KeyStatsBar() {
  const stats = [
    {
      icon: Landmark,
      value: "2,500+",
      label: "Colleges",
    },
    {
      icon: Users,
      value: "50,000+",
      label: "Students Guided",
    },
    {
      icon: Award,
      value: "95%",
      label: "Admission Success Rate",
    },
    {
      icon: CalendarCheck,
      value: "20+",
      label: "Years of Counselling",
    },
  ];

  return (
    <div className="max-w-container-max mx-auto px-4 md:px-margin-desktop -mt-4 mb-16 relative z-30">
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 md:py-6 md:px-10 grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 divide-y md:divide-y-0 md:divide-x divide-gray-100">
        {stats.map((s, idx) => {
          const Icon = s.icon;
          return (
            <div
              key={idx}
              className={`flex items-center gap-4 ${
                idx !== 0 ? "pt-4 md:pt-0 md:pl-8" : ""
              }`}
            >
              <div className="w-12 h-12 rounded-2xl bg-red-50 text-[#DC2626] flex items-center justify-center shrink-0 border border-red-100/60 shadow-sm">
                <Icon className="w-6 h-6 stroke-[2]" />
              </div>
              <div>
                <div className="font-display font-extrabold text-2xl text-gray-900 leading-none">
                  {s.value}
                </div>
                <div className="text-gray-500 text-xs font-semibold mt-1">
                  {s.label}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
