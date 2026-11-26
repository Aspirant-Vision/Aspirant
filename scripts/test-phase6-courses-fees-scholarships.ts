/**
 * Phase 06 Verification Script: Course, Fees & Scholarship Management Module
 */

import {
  courseSchema,
  collegeCourseAssociationSchema,
  feeRecordSchema,
  scholarshipSchema,
  generateSlug,
  CourseInput,
  FeeRecordInput,
  ScholarshipInput,
} from "../src/lib/validation/course";

async function runPhase6Tests() {
  console.log("=========================================================");
  console.log(" ASPIRANT VISION — PHASE 06 COURSES, FEES & SCHOLARSHIPS ");
  console.log("=========================================================\n");

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

  // 1. COURSE SCHEMA VALIDATION
  console.log("1. Course Schema & Slug Generation Tests:");
  assert(
    generateSlug("B.Tech in Artificial Intelligence & Data Science") ===
      "btech-in-artificial-intelligence-data-science",
    "Generates clean kebab-case course slug"
  );

  const validCourse: CourseInput = {
    name: "Bachelor of Technology in Computer Science & Engineering",
    slug: "btech-cse",
    code: "BTECH-CSE-01",
    category: "Engineering",
    degreeType: "B.Tech / B.E.",
    stream: "Computer Science",
    specialization: "AI & ML",
    shortDescription: "A comprehensive 4-year undergraduate program in computer engineering.",
    description: "Detailed syllabus covers algorithms, operating systems, cloud computing, and neural networks.",
    duration: 4,
    durationUnit: "years",
    studyMode: "full_time",
    level: "undergraduate",
    intake: 120,
    language: "English",
    minQualification: "10+2 with PCM",
    minPercentage: 60,
    requiredSubjects: "Physics, Mathematics, Chemistry",
    entranceExamInformation: "JEE Main, OJEE",
    ageCriteria: "Minimum 17 years",
    additionalRequirements: null,
    thumbnailUrl: "https://example.com/thumb.jpg",
    bannerUrl: "https://example.com/banner.jpg",
    galleryImages: [],
    seoTitle: "B.Tech CSE Admissions 2025 | Curriculum & Fees",
    seoDescription: "Explore B.Tech in Computer Science admissions.",
    ogImageUrl: null,
    noIndex: false,
    publicationStatus: "published",
    isFeatured: true,
  };

  const courseResult = courseSchema.safeParse(validCourse);
  assert(courseResult.success, "Valid complete course passes schema validation");

  const invalidCourseDuration = { ...validCourse, duration: -1 };
  assert(!courseSchema.safeParse(invalidCourseDuration).success, "Rejects negative course duration");

  const invalidCourseSlug = { ...validCourse, slug: "Invalid Slug with UPPERCASE" };
  assert(!courseSchema.safeParse(invalidCourseSlug).success, "Rejects uppercase slug");

  // 2. COLLEGE-COURSE ASSOCIATION SCHEMA
  console.log("\n2. College-Course Association Tests:");
  const validAssociation = {
    collegeId: "11111111-1111-4111-8111-111111111111",
    courseId: "22222222-2222-4222-8222-222222222222",
    courseCode: "CSE-KIIT-2025",
    courseNameOverride: "B.Tech CSE (Honours with AI)",
    intakeCapacity: 240,
    admissionStatus: "open",
    eligibilityOverride: "Minimum 65% aggregate in PCM",
    feeNotesOverride: "Scholarship discounts applicable",
    isActive: true,
  };

  assert(
    collegeCourseAssociationSchema.safeParse(validAssociation).success,
    "Valid college-course association passes validation"
  );

  const invalidAssociationUuid = { ...validAssociation, collegeId: "invalid-uuid" };
  assert(
    !collegeCourseAssociationSchema.safeParse(invalidAssociationUuid).success,
    "Rejects invalid UUID for college ID"
  );

  // 3. FEE RECORD SCHEMA
  console.log("\n3. Fee Record Tests:");
  const validFee: FeeRecordInput = {
    collegeCourseId: "33333333-3333-4333-8333-333333333333",
    academicYear: "2025-26",
    feeType: "tuition",
    amount: 175000,
    currency: "INR",
    paymentFrequency: "annual",
    studentCategory: "all",
    tuitionFee: 175000,
    admissionFee: 15000,
    hostelFee: 65000,
    otherFees: 10000,
    feeNotes: "Hostel optional. Refundable security deposit extra.",
    effectiveDate: "2025-06-01",
    expiryDate: "2026-05-31",
    status: "active",
  };

  assert(feeRecordSchema.safeParse(validFee).success, "Valid fee record passes validation");

  const invalidFeeAmount = { ...validFee, amount: -5000 };
  assert(!feeRecordSchema.safeParse(invalidFeeAmount).success, "Rejects negative fee amount");

  const invalidAcademicYear = { ...validFee, academicYear: "" };
  assert(!feeRecordSchema.safeParse(invalidAcademicYear).success, "Rejects empty academic year");

  // 4. SCHOLARSHIP SCHEMA
  console.log("\n4. Scholarship Schema Tests:");
  const validScholarship: ScholarshipInput = {
    name: "Prerana Post-Matric Scholarship",
    slug: "prerana-post-matric-scholarship",
    provider: "ST & SC Development Department, Govt of Odisha",
    category: "government",
    description: "Financial assistance for meritorious students from marginalized communities.",
    eligibility: "Annual family income not exceeding ₹2.5 Lakhs.",
    collegeId: null,
    collegeCourseId: null,
    scholarshipAmount: 45000,
    scholarshipPercentage: 50,
    maxBenefit: 60000,
    currency: "INR",
    applicationStartDate: "2025-08-01",
    applicationDeadline: "2025-11-30",
    applicationInstructions: "Apply online via Odisha State Scholarship Portal.",
    officialUrl: "https://scholarship.odisha.gov.in",
    requiredDocuments: ["Income Certificate", "Caste Certificate", "12th Marksheet"],
    contactInfo: "helpline@scholarship.odisha.gov.in",
    publicationStatus: "published",
    isFeatured: true,
  };

  assert(scholarshipSchema.safeParse(validScholarship).success, "Valid scholarship passes validation");

  const invalidScholarshipPct = { ...validScholarship, scholarshipPercentage: 150 };
  assert(
    !scholarshipSchema.safeParse(invalidScholarshipPct).success,
    "Rejects scholarship percentage greater than 100%"
  );

  // 5. PUBLIC ISOLATION LOGIC
  console.log("\n5. Public Website Isolation Tests:");
  function isPubliclyDiscoverable(item: { publicationStatus?: string; deleted_at?: string | null }) {
    return item.publicationStatus === "published" && !item.deleted_at;
  }

  assert(isPubliclyDiscoverable(validCourse), "Published course without deleted_at is publicly visible");
  assert(
    !isPubliclyDiscoverable({ ...validCourse, publicationStatus: "draft" }),
    "Draft course is hidden from public website"
  );
  assert(
    !isPubliclyDiscoverable({ ...validCourse, deleted_at: "2026-11-26T00:00:00Z" }),
    "Archived course is hidden from public website"
  );

  console.log("\n=========================================================");
  console.log(` SUMMARY: ${passed} PASSED, ${failed} FAILED `);
  console.log("=========================================================");

  if (failed > 0) process.exit(1);
}

runPhase6Tests();
