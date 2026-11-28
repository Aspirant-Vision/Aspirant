import React from "react";
import { HeroSection } from "@/components/home/hero-section";
import { TrustStatisticsBar } from "@/components/home/trust-statistics-bar";
import { ExploreByGoal } from "@/components/home/explore-by-goal";
import { FeaturedColleges } from "@/components/home/featured-colleges";
import { EducationHubs } from "@/components/home/education-hubs";
import { CompareCollegesModule } from "@/components/home/compare-colleges-module";
import { AdmissionJourneyTimeline } from "@/components/home/admission-journey-timeline";
import { CareerAccelerationCta } from "@/components/home/career-acceleration-cta";
import { WhyAspirantVision } from "@/components/home/why-aspirant-vision";
import { UpcomingExams } from "@/components/home/upcoming-exams";
import { StudentSuccessStories } from "@/components/home/student-success-stories";
import { RecruitersPlacements } from "@/components/home/recruiters-placements";
import { FindIdealCollege } from "@/components/home/find-ideal-college";
import { BlogsMagazine } from "@/components/home/blogs-magazine";
import { FinalCounsellingCta } from "@/components/home/final-counselling-cta";

// High-converting minimalist lead capture form
import { MinimalLeadForm } from "@/components/home/minimal-lead-form";

import { getPublicCollegesAction } from "@/lib/college/actions";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function HomePage() {
  const featuredRes = await getPublicCollegesAction({ isFeatured: true, pageSize: 8 });
  const liveFeaturedColleges = featuredRes.success ? featuredRes.data.colleges : [];

  return (
    <div className="flex flex-col min-h-screen bg-[#F7F8FC] overflow-x-hidden w-full">
      {/* SECTION 01: Sticky Navigation Bar rendered in RootLayout */}

      {/* SECTION 02: Full-Background Hero with herobg.png & Tactile Search Engine */}
      <HeroSection />

      {/* SECTION 03: Tactile Trust and Statistics Pill Bar */}
      <TrustStatisticsBar />

      {/* SECTION 04: Explore by Your Goal (Interactive Tactile Stream Tiles) */}
      <ExploreByGoal />

      {/* SECTION 05: Explore India's Top Institutions (Featured Colleges) */}
      <FeaturedColleges dbColleges={liveFeaturedColleges} />

      {/* MINIMALIST FORM 01: Instant Cutoff & Eligibility Predictor */}
      <MinimalLeadForm
        badge="Cutoff & Eligibility Predictor"
        title="Find Your Eligible College & 2026 Cutoff"
        subtitle="Instant cutoff matcher across 2,500+ premier institutions with verified seat intakes."
        buttonLabel="Check Eligibility"
        source="home_cutoff_predictor"
        defaultCourse="Engineering (B.Tech / B.E.)"
      />

      {/* SECTION 06: NEW RELEVANT — Top Education Hubs Across India (Regional Discovery) */}
      <EducationHubs />

      {/* SECTION 07: Compare Colleges Interactive Multi-Column Matrix */}
      <CompareCollegesModule />

      {/* MINIMALIST FORM 02: Merit Fee Concession & Aid Desk */}
      <MinimalLeadForm
        badge="Tuition Aid & Fee Concession Desk"
        title="Apply for Merit Fee Concessions & Aid"
        subtitle="Verify institutional tuition waivers up to 100% and pre-approved 0% advance student financing."
        buttonLabel="Claim Fee Concession"
        source="home_fee_concession_desk"
        defaultCourse="Management (MBA / PGDM)"
      />

      {/* SECTION 08: Admission Journey (Curved Road with Milestone Markers) */}
      <AdmissionJourneyTimeline />

      {/* Career Acceleration Desk CTA Card */}
      <CareerAccelerationCta />

      {/* SECTION 09: Why Aspirant Vision (Editorial Trust & Mentorship Ecosystem) */}
      <WhyAspirantVision />

      {/* SECTION 10: Upcoming Entrance Exams & Application Deadlines */}
      <UpcomingExams />

      {/* MINIMALIST FORM 03: 1-on-1 Exam Strategy & Backup Admission */}
      <MinimalLeadForm
        badge="1-on-1 Academic Mentorship"
        title="Worried About Exam Cutoffs? Secure Your Safety Seat"
        subtitle="15-minute strategic roadmap with senior advisors to guarantee confirmed seat allocation."
        buttonLabel="Schedule Free Call"
        source="home_exam_strategy"
        defaultCourse="Engineering (B.Tech / B.E.)"
      />

      {/* SECTION 11: Real Students. Real Journeys. Real Success. (Editorial Storytelling) */}
      <StudentSuccessStories />

      {/* MINIMALIST FORM 04: Fast-Track Direct Admission Allotment Desk */}
      <MinimalLeadForm
        badge="Direct Admission Advisory Desk"
        title="Fast-Track Direct Admission Allotment 2026"
        subtitle="Confirmed seat allotment support, institutional quota access, and zero hidden fees."
        buttonLabel="Secure My Seat Now"
        source="home_campus_admission_desk"
        defaultCourse="Engineering (B.Tech / B.E.)"
      />

      {/* SECTION 12: Top University Recruiters & Career Ecosystem */}
      <RecruitersPlacements />

      {/* SECTION 14: Find Your Ideal College (Interactive Multi-Criteria Finder Tool) */}
      <FindIdealCollege />

      {/* SECTION 15: Blogs & Admission Guides (Editorial Magazine Layout) */}
      <BlogsMagazine />

      {/* SECTION 16: Ready to Start Your Admission Journey? (Final Tactile CTA Banner) */}
      <FinalCounsellingCta />
    </div>
  );
}
