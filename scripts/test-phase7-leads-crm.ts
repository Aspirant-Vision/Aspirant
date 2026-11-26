import {
  publicEnquirySchema,
  leadFormSchema,
  leadStatusUpdateSchema,
  leadPriorityUpdateSchema,
  leadAssignmentSchema,
  internalNoteSchema,
  followUpSchema,
  followUpCompletionSchema,
  followUpRescheduleSchema,
} from "../src/lib/validation/lead";

let passCount = 0;
let failCount = 0;

function assert(condition: boolean, testName: string, detail?: string) {
  if (condition) {
    console.log(`[PASS] ${testName}`);
    passCount++;
  } else {
    console.error(`[FAIL] ${testName} - ${detail || ""}`);
    failCount++;
  }
}

console.log("==================================================");
console.log("PHASE 07: LEAD MANAGEMENT CRM VALIDATION SUITE");
console.log("==================================================\n");

// 1. PUBLIC ENQUIRY TESTS
const validEnquiry = {
  fullName: "Amit Kumar Nayak",
  email: "amit.nayak@gmail.com",
  phone: "9876543210",
  preferredLocation: "Bhubaneswar",
  currentQualification: "12th Science (PCM)",
  passingYear: 2025,
  enquiryMessage: "Interested in B.Tech CSE with scholarship opportunities.",
  consentStatus: true,
  source: "website_modal",
  landingPage: "/colleges/kiit-university",
  referringPage: "https://google.com",
  utmSource: "google_search",
  utmMedium: "cpc",
  utmCampaign: "btech_admissions_2025",
  honeypot: "",
};
const enquiryParse = publicEnquirySchema.safeParse(validEnquiry);
assert(enquiryParse.success, "Valid public website enquiry passes validation");

// 2. CONSENT ENFORCEMENT
const noConsentEnquiry = { ...validEnquiry, consentStatus: false };
const noConsentParse = publicEnquirySchema.safeParse(noConsentEnquiry);
assert(!noConsentParse.success, "Enquiry without consent is strictly rejected");

// 3. HONEYPOT ANTI-SPAM
const spamEnquiry = { ...validEnquiry, honeypot: "I am a bot" };
const spamParse = publicEnquirySchema.safeParse(spamEnquiry);
assert(!spamParse.success, "Enquiry with filled honeypot is flagged as spam");

// 4. PHONE VALIDATION
const invalidPhone = { ...validEnquiry, phone: "123" };
const invalidPhoneParse = publicEnquirySchema.safeParse(invalidPhone);
assert(!invalidPhoneParse.success, "Enquiry with <10 digit phone is rejected");

// 5. INTERNAL LEAD FORM CREATION
const validLeadForm = {
  fullName: "Priyanka Sahoo",
  email: "priyanka.sahoo@yahoo.com",
  phone: "+919938362938",
  preferredLocation: "Cuttack",
  currentQualification: "12th Science",
  passingYear: 2024,
  source: "direct",
  status: "new",
  priority: "high",
  enquiryMessage: "Wants to know hostel fee.",
};
const leadFormParse = leadFormSchema.safeParse(validLeadForm);
assert(leadFormParse.success, "Valid internal CRM lead form parses successfully");
if (leadFormParse.success) {
  assert(typeof leadFormParse.data.passingYear === "number", "Passing year string transforms to number");
}

// 6. STATUS TRANSITION WITH REASON ENFORCEMENT
const lostWithoutReason = {
  leadId: "11111111-1111-4111-8111-111111111111",
  status: "lost",
  reason: "",
};
const lostWithoutReasonParse = leadStatusUpdateSchema.safeParse(lostWithoutReason);
assert(!lostWithoutReasonParse.success, "Transition to 'lost' without reason is rejected");

const lostWithReason = {
  leadId: "11111111-1111-4111-8111-111111111111",
  status: "lost",
  reason: "Admitted into government engineering college through state quota.",
};
const lostWithReasonParse = leadStatusUpdateSchema.safeParse(lostWithReason);
assert(lostWithReasonParse.success, "Transition to 'lost' with valid reason is accepted");

const normalStatusChange = {
  leadId: "11111111-1111-4111-8111-111111111111",
  status: "counselling_scheduled",
};
const normalStatusParse = leadStatusUpdateSchema.safeParse(normalStatusChange);
assert(normalStatusParse.success, "Normal transition to 'counselling_scheduled' passes without reason");

// 7. PRIORITY UPDATE
const priorityUpdate = {
  leadId: "11111111-1111-4111-8111-111111111111",
  priority: "urgent",
};
const priorityParse = leadPriorityUpdateSchema.safeParse(priorityUpdate);
assert(priorityParse.success, "Lead priority update to 'urgent' validates");

// 8. LEAD ASSIGNMENT
const assignment = {
  leadId: "11111111-1111-4111-8111-111111111111",
  counsellorId: "22222222-2222-4222-8222-222222222222",
  notes: "Follow up regarding Odisha domicile quota.",
};
const assignmentParse = leadAssignmentSchema.safeParse(assignment);
assert(assignmentParse.success, "Lead assignment schema validates");

// 9. INTERNAL NOTES
const internalNote = {
  leadId: "11111111-1111-4111-8111-111111111111",
  note: "Spoke with father. Budget is 2.5 LPA. Interested in AI specialization.",
};
const internalNoteParse = internalNoteSchema.safeParse(internalNote);
assert(internalNoteParse.success, "Internal note schema validates");

// 10. FOLLOW-UP SCHEDULING
const followUp = {
  leadId: "11111111-1111-4111-8111-111111111111",
  counsellorId: "22222222-2222-4222-8222-222222222222",
  followUpType: "video_meeting",
  title: "Online Counselling Video Session",
  scheduledAt: new Date(Date.now() + 86400000).toISOString(),
  notes: "Prepare comparison chart between KIIT and SOA University.",
  priority: "high",
};
const followUpParse = followUpSchema.safeParse(followUp);
assert(followUpParse.success, "Follow-up scheduling schema validates");

// 11. FOLLOW-UP COMPLETION
const completion = {
  followUpId: "33333333-3333-4333-8333-333333333333",
  completionNotes: "Completed 30 min video consultation. Sent brochure on WhatsApp.",
};
const completionParse = followUpCompletionSchema.safeParse(completion);
assert(completionParse.success, "Follow-up completion with remarks validates");

const emptyCompletion = {
  followUpId: "33333333-3333-4333-8333-333333333333",
  completionNotes: "",
};
const emptyCompletionParse = followUpCompletionSchema.safeParse(emptyCompletion);
assert(!emptyCompletionParse.success, "Follow-up completion without notes is rejected");

// 12. FOLLOW-UP RESCHEDULING
const reschedule = {
  followUpId: "33333333-3333-4333-8333-333333333333",
  newScheduledAt: new Date(Date.now() + 172800000).toISOString(),
  reason: "Candidate was travelling, requested call on Saturday morning.",
};
const rescheduleParse = followUpRescheduleSchema.safeParse(reschedule);
assert(rescheduleParse.success, "Follow-up reschedule schema validates");

console.log("\n==================================================");
console.log(`TOTAL TESTS: ${passCount + failCount}`);
console.log(`PASSED: ${passCount}`);
console.log(`FAILED: ${failCount}`);
console.log("==================================================");

if (failCount > 0) {
  process.exit(1);
}
