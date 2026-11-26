import {
  studentProfileSchema,
  studentAcademicSchema,
  studentPreferencesSchema,
  studentEnquirySchema,
} from "../src/lib/validation/student";

let passed = 0;
let failed = 0;

function assert(condition: boolean, testName: string) {
  if (condition) {
    console.log(`✅ PASS: ${testName}`);
    passed++;
  } else {
    console.error(`❌ FAIL: ${testName}`);
    failed++;
  }
}

console.log("\n=======================================================");
console.log("PHASE 08 — STUDENT PORTAL SUITE TESTING");
console.log("=======================================================\n");

// 1. Student Profile Schema Tests
console.log("--- 1. Student Profile Schema Tests ---");
const validProfile = {
  fullName: "Aarav Sharma",
  phone: "9876543210",
  alternatePhone: "9812345678",
  dateOfBirth: "2005-08-14",
  gender: "male" as const,
  city: "Lucknow",
  state: "Uttar Pradesh",
  country: "India",
  pinCode: "226001",
  avatarUrl: "https://example.com/avatar.png",
};
assert(studentProfileSchema.safeParse(validProfile).success, "Valid profile parses successfully");

const invalidShortName = { ...validProfile, fullName: "A" };
assert(!studentProfileSchema.safeParse(invalidShortName).success, "Rejects full name < 2 characters");

const invalidDobFormat = { ...validProfile, dateOfBirth: "14-08-2005" };
assert(!studentProfileSchema.safeParse(invalidDobFormat).success, "Rejects dateOfBirth not matching YYYY-MM-DD");

const invalidPinCode = { ...validProfile, pinCode: "2260" };
assert(!studentProfileSchema.safeParse(invalidPinCode).success, "Rejects non-6-digit PIN code");

const profileNullables = {
  fullName: "Priya Patel",
  phone: "",
  alternatePhone: null,
  dateOfBirth: null,
  gender: null,
  city: "",
  state: "",
  country: "India",
  pinCode: "",
  avatarUrl: "",
};
assert(studentProfileSchema.safeParse(profileNullables).success, "Permits optional nullables/empty strings");

// 2. Student Academic Schema Tests
console.log("\n--- 2. Student Academic Schema Tests ---");
const validAcademics = {
  educationLevel: "12th" as const,
  highestQualification: "Senior Secondary School Certificate",
  institutionName: "St. Xavier's High School",
  boardOrUniversity: "CBSE",
  passingYear: 2024,
  percentageOrCgpa: 94.6,
  stream: "Science (PCM)",
  entranceExamName: "JEE Main",
  entranceExamScore: "98.7 Percentile",
  additionalDetails: "National Science Olympiad Silver Medalist",
};
assert(studentAcademicSchema.safeParse(validAcademics).success, "Valid academic qualifications parse successfully");

const invalidScore = { ...validAcademics, percentageOrCgpa: 105 };
assert(!studentAcademicSchema.safeParse(invalidScore).success, "Rejects percentage > 100%");

const invalidYear = { ...validAcademics, passingYear: 1950 };
assert(!studentAcademicSchema.safeParse(invalidYear).success, "Rejects unrealistic passing year < 1980");

// 3. Student Preferences Schema Tests
console.log("\n--- 3. Student Admission Preferences Schema Tests ---");
const validPreferences = {
  preferredStudyLevel: "Undergraduate",
  preferredStream: "Engineering",
  preferredSpecialization: "Computer Science & Engineering",
  preferredCollegeType: "Private",
  preferredStudyMode: "Full-Time",
  preferredState: "Karnataka",
  preferredCity: "Bangalore",
  budgetMin: 150000,
  budgetMax: 350000,
  preferredAdmissionYear: 2026,
  entranceExamPreference: "JEE Main / COMEDK",
};
assert(studentPreferencesSchema.safeParse(validPreferences).success, "Valid admission preferences parse successfully");

const invalidNegativeBudget = { ...validPreferences, budgetMin: -500 };
assert(!studentPreferencesSchema.safeParse(invalidNegativeBudget).success, "Rejects negative tuition budget");

// 4. Student Enquiry Submission Schema Tests
console.log("\n--- 4. Student Enquiry Submission Schema Tests ---");
const validEnquiry = {
  collegeId: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  courseId: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
  message: "Can you provide the 2025 cutoff and fee details for B.Tech AI?",
};
assert(studentEnquirySchema.safeParse(validEnquiry).success, "Valid student portal enquiry parses successfully");

const tooShortMessage = {
  collegeId: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  message: "Hi",
};
assert(!studentEnquirySchema.safeParse(tooShortMessage).success, "Rejects enquiry message shorter than 5 characters");

const generalEnquiryNoIds = {
  collegeId: "",
  courseId: "",
  message: "I need guidance on choosing between B.Tech CSE and BCA.",
};
assert(studentEnquirySchema.safeParse(generalEnquiryNoIds).success, "Permits general enquiry without specific college/course IDs");

// 5. Profile Completion Algorithm Test
console.log("\n--- 5. Deterministic Profile Completion Calculation Verification ---");
function calculateCompletion(
  p: any,
  hasAcademics: boolean,
  hasPreferences: boolean
): number {
  let score = 0;
  if (p.full_name && p.full_name.trim().length >= 2) score += 10;
  if (p.phone && p.phone.trim().length >= 10) score += 10;
  if (p.date_of_birth) score += 10;
  if (p.gender) score += 10;
  if (p.city && p.state) score += 10;
  if (p.avatar_url) score += 10;
  if (hasAcademics) score += 20;
  if (hasPreferences) score += 20;
  return score;
}

const mockMinimalProfile = { full_name: "Rahul", phone: null, date_of_birth: null, gender: null, city: null, state: null, avatar_url: null };
assert(calculateCompletion(mockMinimalProfile, false, false) === 10, "Minimal profile with name only yields 10%");

const mockCompleteProfile = {
  full_name: "Rahul Sharma",
  phone: "9876543210",
  date_of_birth: "2004-05-10",
  gender: "male",
  city: "Lucknow",
  state: "Uttar Pradesh",
  avatar_url: "https://example.com/avatar.jpg",
};
assert(calculateCompletion(mockCompleteProfile, true, true) === 100, "Fully completed profile with academics and preferences yields exactly 100%");

console.log("\n=======================================================");
console.log(`TOTAL TESTS: ${passed + failed} | PASSED: ${passed} | FAILED: ${failed}`);
console.log("=======================================================\n");

if (failed > 0) {
  process.exit(1);
}
