import {
  applicationPersonalDetailsSchema,
  applicationAcademicDetailsSchema,
  applicationSubmitSchema,
  documentUploadSchema,
  applicationReviewActionSchema,
  documentVerificationSchema,
  admissionConfirmSchema,
  DOCUMENT_TYPES,
} from "../src/lib/validation/application";

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
console.log("PHASE 09 — APPLICATIONS & ADMISSIONS TEST SUITE");
console.log("=======================================================\n");

// 1. Reference Number Format Tests
console.log("--- 1. Application & Admission Reference Format Tests ---");
const sampleAppRef = `AV-APP-${new Date().getFullYear()}-A1B2C3`;
const sampleAdmRef = `AV-ADM-${new Date().getFullYear()}-X9Y8Z7`;

const appRefRegex = /^AV-APP-\d{4}-[A-Z0-9]{6}$/;
const admRefRegex = /^AV-ADM-\d{4}-[A-Z0-9]{6}$/;

assert(appRefRegex.test(sampleAppRef), "Application number adheres to AV-APP-YYYY-XXXXXX format");
assert(admRefRegex.test(sampleAdmRef), "Admission reference adheres to AV-ADM-YYYY-XXXXXX format");
assert(!appRefRegex.test("AV-APP-2026-12345"), "Rejects invalid reference with fewer than 6 random characters");
assert(!appRefRegex.test("APP-2026-ABCDEF"), "Rejects reference missing AV- prefix");

// 2. Application Personal Details Schema Tests
console.log("\n--- 2. Personal Details Schema Tests ---");
const validPersonal = {
  fullName: "Ananya Verma",
  email: "ananya.verma@example.com",
  phone: "9876543210",
  alternatePhone: "9812345678",
  dateOfBirth: "2005-11-20",
  gender: "female" as const,
  address: "42 Gomti Nagar",
  city: "Lucknow",
  state: "Uttar Pradesh",
  country: "India",
  pinCode: "226010",
};

assert(applicationPersonalDetailsSchema.safeParse(validPersonal).success, "Valid personal details parse successfully");

const invalidDob = { ...validPersonal, dateOfBirth: "20-11-2005" };
assert(!applicationPersonalDetailsSchema.safeParse(invalidDob).success, "Rejects dateOfBirth not matching YYYY-MM-DD");

const invalidPin = { ...validPersonal, pinCode: "2260" };
assert(!applicationPersonalDetailsSchema.safeParse(invalidPin).success, "Rejects non-6-digit PIN code");

const invalidPhone = { ...validPersonal, phone: "1234" };
assert(!applicationPersonalDetailsSchema.safeParse(invalidPhone).success, "Rejects phone number shorter than 10 digits");

// 3. Application Academic Details Schema Tests
console.log("\n--- 3. Academic Details Schema Tests ---");
const validAcademic = {
  highestQualification: "12th Standard (Senior Secondary)",
  institutionName: "City Montessori School",
  boardOrUniversity: "ISC",
  passingYear: 2024,
  percentageOrCgpa: 95.2,
  stream: "PCM with Computer Science",
  entranceExamName: "JEE Main",
  entranceExamScore: "99.1 Percentile",
};

assert(applicationAcademicDetailsSchema.safeParse(validAcademic).success, "Valid academic details parse successfully");

const invalidScoreNegative = { ...validAcademic, percentageOrCgpa: -5 };
assert(!applicationAcademicDetailsSchema.safeParse(invalidScoreNegative).success, "Rejects negative score");

const invalidScoreOverHundred = { ...validAcademic, percentageOrCgpa: 105 };
assert(!applicationAcademicDetailsSchema.safeParse(invalidScoreOverHundred).success, "Rejects score > 100%");

const invalidYear = { ...validAcademic, passingYear: 1960 };
assert(!applicationAcademicDetailsSchema.safeParse(invalidYear).success, "Rejects passing year < 1980");

// 4. Application Submission Schema & Mandatory Declaration
console.log("\n--- 4. Application Submit Schema & Declaration Tests ---");
const validSubmit = {
  applicationId: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
  personalDetails: validPersonal,
  academicDetails: validAcademic,
  declarationAccepted: true as const,
};

assert(applicationSubmitSchema.safeParse(validSubmit).success, "Valid submission with declaration succeeds");

const rejectedWithoutDeclaration = {
  ...validSubmit,
  declarationAccepted: false,
};
assert(!applicationSubmitSchema.safeParse(rejectedWithoutDeclaration).success, "Strictly rejects submission when declaration is false");

// 5. Document Upload Schema Tests
console.log("\n--- 5. Document Upload Schema Tests ---");
const validDocUpload = {
  applicationId: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
  documentType: "class_12_marksheet" as const,
  storagePath: "student-123/app-456/class_12_marksheet.pdf",
  originalFilename: "marksheet_12.pdf",
  fileSizeBytes: 2048576, // 2MB
  mimeType: "application/pdf",
};

assert(documentUploadSchema.safeParse(validDocUpload).success, "Valid document upload parses successfully");

const oversizedFile = {
  ...validDocUpload,
  fileSizeBytes: 15728640, // 15MB > 10MB limit
};
assert(!documentUploadSchema.safeParse(oversizedFile).success, "Rejects document file exceeding 10MB limit");

const invalidDocType = {
  ...validDocUpload,
  documentType: "unknown_document_type",
};
assert(!documentUploadSchema.safeParse(invalidDocType).success, "Rejects unsupported document type");

// 6. Application Review Action Workflow Tests
console.log("\n--- 6. Review Action Workflow Validation Tests ---");
const validStartReview = { action: "start_review" as const };
assert(applicationReviewActionSchema.safeParse(validStartReview).success, "Accepts valid start_review action");

const validRejectWithReason = {
  action: "reject" as const,
  decisionReason: "Candidate does not satisfy minimum 60% criteria in Mathematics",
};
assert(applicationReviewActionSchema.safeParse(validRejectWithReason).success, "Accepts reject action with decisionReason");

const validForwardWithTarget = {
  action: "forward" as const,
  forwardedTo: "Central University Admission Committee",
};
assert(applicationReviewActionSchema.safeParse(validForwardWithTarget).success, "Accepts forward action with destination");

// 7. Document Verification Schema Tests
console.log("\n--- 7. Document Verification Schema Tests ---");
const validDocVerify = {
  documentId: "d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22",
  verificationStatus: "verified" as const,
};
assert(documentVerificationSchema.safeParse(validDocVerify).success, "Valid document verification parses");

const validDocReject = {
  documentId: "d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22",
  verificationStatus: "rejected" as const,
  rejectionReason: "Scan is blurry and certificate serial number is unreadable",
};
assert(documentVerificationSchema.safeParse(validDocReject).success, "Valid document rejection with reason parses");

// 8. Admission Confirmation Schema Tests
console.log("\n--- 8. Admission Confirmation Schema Tests ---");
const validAdmissionConfirm = {
  applicationId: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
  academicYear: "2026-27",
  admissionDate: "2026-06-15",
  remarks: "First list merit allocation approved under General Quota",
};
assert(admissionConfirmSchema.safeParse(validAdmissionConfirm).success, "Valid admission confirmation payload parses");

const invalidShortYear = {
  ...validAdmissionConfirm,
  academicYear: "26",
};
assert(!admissionConfirmSchema.safeParse(invalidShortYear).success, "Rejects incomplete academic year");

console.log("\n=======================================================");
console.log(`TOTAL TESTS: ${passed + failed} | PASSED: ${passed} | FAILED: ${failed}`);
console.log("=======================================================\n");

if (failed > 0) {
  process.exit(1);
}
