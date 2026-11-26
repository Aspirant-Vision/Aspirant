import React from "react";
import { HeroSection } from "@/components/home/hero-section";
import { TrustStatisticsBar } from "@/components/home/trust-statistics-bar";
import { ExploreByGoal } from "@/components/home/explore-by-goal";
import { FeaturedColleges } from "@/components/home/featured-colleges";
import { EducationHubs } from "@/components/home/education-hubs";
import { CompareCollegesModule } from "@/components/home/compare-colleges-module";
import { PopularCourses } from "@/components/home/popular-courses";
import { AdmissionJourneyTimeline } from "@/components/home/admission-journey-timeline";
import { WhyAspirantVision } from "@/components/home/why-aspirant-vision";
import { UpcomingExams } from "@/components/home/upcoming-exams";
import { StudentSuccessStories } from "@/components/home/student-success-stories";
import { RecruitersPlacements } from "@/components/home/recruiters-placements";
import { FindIdealCollege } from "@/components/home/find-ideal-college";
import { BlogsMagazine } from "@/components/home/blogs-magazine";
import { FinalCounsellingCta } from "@/components/home/final-counselling-cta";

// High-converting inline inquiry & lead capture forms
import { CutoffEligibilityForm } from "@/components/home/cutoff-eligibility-form";
import { ScholarshipCalculatorForm } from "@/components/home/scholarship-calculator-form";
import { ExamStrategyForm } from "@/components/home/exam-strategy-form";

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

      {/* RELEVANT FORM 01: Instant Cutoff & Eligibility Predictor Form */}
      <CutoffEligibilityForm />

      {/* SECTION 06: NEW RELEVANT — Top Education Hubs Across India (Regional Discovery) */}
      <EducationHubs />

      {/* SECTION 07: Compare Colleges Interactive Multi-Column Matrix */}
      <CompareCollegesModule />

      {/* SECTION 08: Popular Degree Courses & Verified Career Paths */}
      <PopularCourses />

      {/* RELEVANT FORM 02: Merit Scholarship & Fee Structure Calculator */}
      <ScholarshipCalculatorForm />

      {/* SECTION 09: Admission Journey (Curved Road with Milestone Markers) */}
      <AdmissionJourneyTimeline />

      {/* SECTION 10: Why Aspirant Vision (Editorial Trust & Mentorship Ecosystem) */}
      <WhyAspirantVision />

      {/* SECTION 11: Upcoming Entrance Exams & Application Deadlines */}
      <UpcomingExams />

      {/* RELEVANT FORM 03: 1-on-1 Exam Cutoff Strategy & Backup Planning Form */}
      <ExamStrategyForm />

      {/* SECTION 12: Real Students. Real Journeys. Real Success. (Editorial Storytelling) */}
      <StudentSuccessStories />

      {/* SECTION 13: Top University Recruiters & Career Ecosystem */}
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
