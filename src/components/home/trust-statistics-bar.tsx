"use client";

import React, { useState, useEffect } from "react";
import { Landmark, Users, Award, Calendar } from "lucide-react";

interface StatItem {
  icon: React.ElementType;
  targetValue: number;
  suffix: string;
  label: string;
  detail: string;
}

function AnimatedNumber({ target, suffix }: { target: number; suffix: string }) {
  const [count, setCount] = useState(target);

  useEffect(() => {
    let startTimestamp: number | null = null;
    let animationFrameId: number;
    const duration = 2200; // 2.2 seconds smooth ease-out

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      // smooth easeOutExpo
      const ease = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      setCount(Math.floor(ease * target));
      if (progress < 1) {
        animationFrameId = requestAnimationFrame(step);
      } else {
        setCount(target);
      }
    };

    setCount(0);
    animationFrameId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animationFrameId);
  }, [target]);

  return (
    <span suppressHydrationWarning>
      {count.toLocaleString()}
      {suffix}
    </span>
  );
}

export function TrustStatisticsBar() {
  const stats: StatItem[] = [
    {
      icon: Landmark,
      targetValue: 2500,
      suffix: "+",
      label: "Colleges",
      detail: "Verified across India",
    },
    {
      icon: Users,
      targetValue: 50000,
      suffix: "+",
      label: "Students Guided",
      detail: "Direct admissions secured",
    },
    {
      icon: Award,
      targetValue: 95,
      suffix: "%",
      label: "Admission Success Rate",
      detail: "Top choice allotments",
    },
    {
      icon: Calendar,
      targetValue: 20,
      suffix: "+",
      label: "Years of Counselling",
      detail: "Senior academic advisory",
    },
  ];

  return (
    <div className="w-full relative z-20 -mt-4 sm:-mt-8 px-3 sm:px-6 lg:px-8">
      <div className="max-w-[1240px] mx-auto tactile-card rounded-2xl lg:rounded-full py-3.5 px-4 sm:py-4 sm:px-6 lg:px-10 shadow-lg">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 lg:divide-x divide-gray-100">
          {stats.map((s, idx) => {
            const Icon = s.icon;
            return (
              <div
                key={idx}
                className={`flex items-center gap-2.5 sm:gap-3.5 group cursor-pointer ${
                  idx !== 0 ? "lg:pl-6 xl:pl-8" : ""
                }`}
              >
                <div className="tactile-icon-box w-9 h-9 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl flex items-center justify-center text-[#E31E2B] shrink-0">
                  <Icon className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.2]" />
                </div>
                <div>
                  <div className="font-display font-extrabold text-lg sm:text-2xl text-[#15182D] leading-tight group-hover:text-[#E31E2B] transition-colors">
                    <AnimatedNumber target={s.targetValue} suffix={s.suffix} />
                  </div>
                  <div className="text-[11px] sm:text-xs font-bold text-[#15182D] mt-0.5 whitespace-nowrap">
                    {s.label}
                  </div>
                  <div className="text-[10px] text-[#687086] font-medium hidden sm:block">
                    {s.detail}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
