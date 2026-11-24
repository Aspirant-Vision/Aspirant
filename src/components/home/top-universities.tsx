"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Star, CheckCircle, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCounselingModal } from "@/components/forms/counseling-modal-context";

interface UniversityItem {
  id: string;
  name: string;
  image: string;
  matchScore: string;
  fee: string;
  placementRate: string;
  degree: string;
  location: string;
}

const UNIVERSITIES: UniversityItem[] = [
  {
    id: "kiit",
    name: "KIIT University",
    image: "/images/campuses/kiit.png",
    matchScore: "9.5 MATCH SCORE",
    fee: "₹3.5L /yr",
    placementRate: "98%",
    degree: "B.Tech",
    location: "Bhubaneswar, Odisha",
  },
  {
    id: "soa",
    name: "SOA University",
    image: "/images/campuses/soa.png",
    matchScore: "9.2 MATCH SCORE",
    fee: "₹2.8L /yr",
    placementRate: "94%",
    degree: "B.Tech",
    location: "Bhubaneswar, Odisha",
  },
  {
    id: "centurion",
    name: "Centurion Univ.",
    image: "/images/campuses/centurion.png",
    matchScore: "8.8 MATCH SCORE",
    fee: "₹1.5L /yr",
    placementRate: "89%",
    degree: "B.Tech",
    location: "Bhubaneswar / Paralakhemundi",
  },
  {
    id: "cv-raman",
    name: "C.V. Raman Global",
    image: "/images/campuses/cv-raman.png",
    matchScore: "9.0 MATCH SCORE",
    fee: "₹2.1L /yr",
    placementRate: "92%",
    degree: "B.Tech",
    location: "Bhubaneswar, Odisha",
  },
];

export function TopUniversities() {
  const { openModal } = useCounselingModal();

  return (
    <section id="colleges" className="py-20 max-w-container-max mx-auto px-4 md:px-margin-desktop">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-4">
        <div>
          <span className="text-secondary font-extrabold tracking-widest uppercase text-xs">
            Premium Institutions
          </span>
          <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-primary mt-2">
            Top Rated Universities
          </h2>
        </div>
        <button
          onClick={() => openModal()}
          className="text-primary font-bold flex items-center gap-2 group border-b-2 border-primary/20 hover:border-primary transition-all pb-1 text-sm sm:text-base"
        >
          <span>View All Colleges</span>
          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
        </button>
      </div>

      {/* 4-Card Responsive Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {UNIVERSITIES.map((univ) => (
          <div
            key={univ.id}
            className="bg-white rounded-2xl overflow-hidden shadow-card hover:shadow-card-hover transition-all duration-300 border border-outline-variant/40 group flex flex-col"
          >
            {/* Campus Photo Header */}
            <div className="relative h-48 sm:h-52 overflow-hidden bg-surface-container">
              <Image
                src={univ.image}
                alt={`${univ.name} Campus`}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute top-3.5 right-3.5">
                <Badge variant="match">{univ.matchScore}</Badge>
              </div>
            </div>

            {/* Card Content */}
            <div className="p-5 flex-1 flex flex-col justify-between">
              <div>
                <h3 className="font-display font-bold text-lg text-primary mb-1">
                  {univ.name}
                </h3>
                <p className="text-xs text-outline mb-4">{univ.location}</p>

                <div className="space-y-2.5 mb-6 pt-2 border-t border-outline-variant/30">
                  <div className="flex justify-between text-xs">
                    <span className="text-outline font-medium">Fees ({univ.degree})</span>
                    <span className="font-bold text-primary">{univ.fee}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-outline font-medium">Placement Rate</span>
                    <span className="font-extrabold text-[#16A34A] flex items-center gap-1">
                      <TrendingUp className="w-3.5 h-3.5" />
                      {univ.placementRate}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-2.5 pt-2">
                <Button
                  onClick={() => openModal(univ.name)}
                  variant="primary"
                  size="sm"
                  className="rounded-lg font-bold"
                >
                  Details
                </Button>
                <Button
                  onClick={() => openModal(univ.name)}
                  variant="outline"
                  size="sm"
                  className="rounded-lg font-semibold"
                >
                  Compare
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
