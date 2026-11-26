import React from "react";
import { HeroSection } from "@/components/home/hero-section";
import { TrustStatisticsBar } from "@/components/home/trust-statistics-bar";
import { ExploreByGoal } from "@/components/home/explore-by-goal";
import { FeaturedColleges } from "@/components/home/featured-colleges";
import { EducationHubs } from "@/components/home/education-hubs";
import { CompareCollegesModule } from "@/components/home/compare-colleges-module";
import { AdmissionJourneyTimeline } from "@/components/home/admission-journey-timeline";
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
        badge="Instant Cutoff & Eligibility Predictor"
        title="Find Your Eligible College & 2026 Cutoff"
        subtitle="Official admission cutoffs, fee structures, and verified seat allotments across 2,500+ campuses."
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
        title="Apply for Up to ₹5 Lakhs Merit Fee Concession"
        subtitle="Verify institutional tuition fee concessions, early applicant aid, and 0% advance loans."
        buttonLabel="Check Fee Concession"
        source="home_fee_concession_desk"
        defaultCourse="Management (MBA / PGDM)"
      />

      {/* SECTION 08: Admission Journey (Curved Road with Milestone Markers) */}
      <AdmissionJourneyTimeline />

      {/* SECTION 09: Why Aspirant Vision (Editorial Trust & Mentorship Ecosystem) */}
      <WhyAspirantVision />

      {/* SECTION 10: Upcoming Entrance Exams & Application Deadlines */}
      <UpcomingExams />

      {/* MINIMALIST FORM 03: 1-on-1 Exam Strategy & Backup Admission */}
      <MinimalLeadForm
        badge="1-on-1 Academic Mentorship"
        title="Worried About Exam Cutoffs? Secure Safety Backup"
        subtitle="Free 15-minute 1-on-1 strategic consultation with senior advisors to lock in accredited safety colleges."
        buttonLabel="Schedule Free Call"
        source="home_exam_strategy"
        defaultCourse="Engineering (B.Tech / B.E.)"
      />

      {/* SECTION 11: Real Students. Real Journeys. Real Success. (Editorial Storytelling) */}
      <StudentSuccessStories />

      {/* MINIMALIST FORM 04: Fast-Track Direct Admission Allotment Desk */}
      <MinimalLeadForm
        badge="Direct Admission Advisory Desk"
        title="Ready to Secure Your Campus Seat for 2026?"
        subtitle="1-on-1 official allotment guidance, course selection, and guaranteed zero hidden fees."
        buttonLabel="Get Direct Admission Guidance"
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
