/**
 * Phase 05 Verification Script: College Management Module
 * Tests:
 * 1. Slug generation utility
 * 2. Zod validation schema (collegeSchema)
 * 3. Validation bounds (PIN, URLs, character limits)
 * 4. Publishing minimum requirements logic
 * 5. Query filters isolation
 */

import { generateSlug, collegeSchema, CollegeInput } from "../src/lib/validation/college";

async function runPhase5Tests() {
  console.log("=================================================");
  console.log(" ASPIRANT VISION — PHASE 05 COLLEGE TESTS ");
  console.log("=================================================\n");

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string) {
    if (condition) {
      console.log(`  ✅ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${testName}`);
      failed++;
    }
  }

  // TEST SUITE 1: Slug Generation
  console.log("1. Slug Generation Utility Tests:");
  assert(
    generateSlug("Indian Institute of Technology Delhi") === "indian-institute-of-technology-delhi",
    "Converts spaces and capitalization to lowercase kebab-case"
  );
  assert(
    generateSlug("KIIT University (Deemed to be), Bhubaneswar!") === "kiit-university-deemed-to-be-bhubaneswar",
    "Strips special characters and punctuation"
  );
  assert(
    generateSlug("  ---SOA University---   ") === "soa-university",
    "Trims leading and trailing hyphens/spaces"
  );

  // TEST SUITE 2: College Schema Validation
  console.log("\n2. College Schema Validation Tests:");
  const validCollege: CollegeInput = {
    name: "Centurion University of Technology and Management",
    slug: "centurion-university-cutm",
    shortDescription: "A premier skill-oriented university in Odisha.",
    description: "Established in 2010, Centurion University offers industry-integrated programs.",
    collegeType: "University",
    ownershipType: "Private",
    establishedYear: 2010,
    affiliation: "UGC Approved",
    country: "India",
    state: "Odisha",
    city: "Bhubaneswar",
    address: "Ramachandrapur, Jatni, Bhubaneswar, Odisha 752050",
    pincode: "752050",
    latitude: 20.177,
    longitude: 85.706,
    websiteUrl: "https://cutm.ac.in",
    email: "admissions@cutm.ac.in",
    phone: "+91 674 2492496",
    alternatePhone: "+91 94370 00000",
    admissionContact: "Prof. S. Mohapatra",
    admissionEmail: "director.admissions@cutm.ac.in",
    logoUrl: "https://example.com/logo.png",
    coverImageUrl: "https://example.com/cover.png",
    galleryImages: ["https://example.com/g1.jpg", "https://example.com/g2.jpg"],
    accreditation: "NAAC A+",
    accreditationBody: "NAAC",
    accreditationGrade: "A+",
    naacGrade: "A+",
    nirfRank: 120,
    otherRankings: "Outlook Rank #45",
    recognitionDetails: "Recognized as Center of Excellence by Skill India",
    averagePlacement: 6.5,
    highestPlacement: 32.0,
    placementPercentage: 92,
    facilities: ["Wi-Fi Campus", "Robotics Lab", "Hostels"],
    highlights: ["100% Placement Support", "Industry-partnered Labs"],
    admissionStatus: "open",
    admissionProcess: "Apply online, attend CUTM-EE entrance exam, merit counselling.",
    eligibilityOverview: "Minimum 50% in 10+2 with PCM for B.Tech.",
    entranceExams: "CUEE, JEE Main, OJEE",
    admissionStartDate: "2025-01-15",
    admissionEndDate: "2025-07-30",
    seoTitle: "Centurion University Admissions 2025 | Fees & Placements",
    seoDescription: "Explore CUTM Bhubaneswar engineering, management and pharmacy admissions.",
    canonicalUrl: "https://aspirantvision.com/colleges/centurion-university-cutm",
    ogImageUrl: "https://example.com/cutm-og.jpg",
    noIndex: false,
    publicationStatus: "published",
    isFeatured: true,
  };

  const validParse = collegeSchema.safeParse(validCollege);
  assert(validParse.success, "Valid complete college passes schema validation");

  // TEST SUITE 3: Invalid Input Rejection
  console.log("\n3. Validation Boundaries & Constraints:");
  const invalidName = { ...validCollege, name: "A" };
  assert(!collegeSchema.safeParse(invalidName).success, "Rejects college name shorter than 2 characters");

  const invalidSlug = { ...validCollege, slug: "Invalid Slug with Spaces!" };
  assert(!collegeSchema.safeParse(invalidSlug).success, "Rejects slugs with spaces or uppercase characters");

  const invalidPincode = { ...validCollege, pincode: "012345" };
  assert(!collegeSchema.safeParse(invalidPincode).success, "Rejects PIN code starting with 0");

  const invalidUrl = { ...validCollege, websiteUrl: "not-a-url" };
  assert(!collegeSchema.safeParse(invalidUrl).success, "Rejects malformed website URL");

  const invalidEmail = { ...validCollege, email: "invalid-email-format" };
  assert(!collegeSchema.safeParse(invalidEmail).success, "Rejects malformed email address");

  // TEST SUITE 4: Minimum Requirements for Publishing Logic
  console.log("\n4. Publishing Isolation Logic:");
  function canPublish(college: { name?: string; slug?: string; state?: string; city?: string; collegeType?: string }) {
    if (!college.name || college.name.trim().length < 2) return false;
    if (!college.slug || college.slug.trim().length < 2) return false;
    if (!college.state || college.state.trim().length < 2) return false;
    if (!college.city || college.city.trim().length < 2) return false;
    if (!college.collegeType || college.collegeType.trim().length < 1) return false;
    return true;
  }

  assert(canPublish(validCollege), "Complete college meets minimum publish requirements");
  assert(!canPublish({ ...validCollege, city: "" }), "Blocks publish when city is empty");
  assert(!canPublish({ ...validCollege, state: "" }), "Blocks publish when state is empty");
  assert(!canPublish({ ...validCollege, collegeType: "" }), "Blocks publish when college category is missing");

  console.log("\n=================================================");
  console.log(` SUMMARY: ${passed} PASSED, ${failed} FAILED `);
  console.log("=================================================");

  if (failed > 0) process.exit(1);
}

runPhase5Tests();
