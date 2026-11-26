"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  startApplicationDraftAction,
  updateApplicationDraftAction,
  submitApplicationAction,
  uploadApplicationDocumentAction,
  deleteApplicationDocumentDraftAction,
  getSignedDocumentUrlAction,
} from "@/lib/applications/actions";
import { DOCUMENT_TYPES, DOCUMENT_TYPE_LABELS, DocumentType } from "@/lib/validation/application";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import {
  Building2,
  BookOpen,
  User,
  GraduationCap,
  FileText,
  Upload,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowRight,
  ArrowLeft,
  Loader2,
  Save,
  Check,
  ShieldCheck,
  MapPin,
  ExternalLink,
  Trash2,
  FileCheck,
} from "lucide-react";

interface ApplicationWizardProps {
  colleges: any[];
  collegeCourses: any[];
  initialProfile: any;
  initialAcademics: any;
  existingDraft?: any;
}

export function ApplicationWizard({
  colleges,
  collegeCourses,
  initialProfile,
  initialAcademics,
  existingDraft,
}: ApplicationWizardProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<number>(existingDraft ? 3 : 1);
  const [applicationId, setApplicationId] = useState<string>(existingDraft?.id || "");
  const [appNumber, setAppNumber] = useState<string>(existingDraft?.application_number || "");
  const [selectedCollegeId, setSelectedCollegeId] = useState<string>(existingDraft?.college_id || "");
  const [selectedCourseId, setSelectedCourseId] = useState<string>(existingDraft?.college_course_id || "");

  // Personal Details State
  const [personalDetails, setPersonalDetails] = useState({
    fullName: existingDraft?.personal_details?.fullName || initialProfile?.full_name || "",
    email: existingDraft?.personal_details?.email || initialProfile?.email || "",
    phone: existingDraft?.personal_details?.phone || initialProfile?.phone || "",
    alternatePhone: existingDraft?.personal_details?.alternatePhone || initialProfile?.alternate_phone || "",
    dateOfBirth: existingDraft?.personal_details?.dateOfBirth || initialProfile?.date_of_birth || "",
    gender: existingDraft?.personal_details?.gender || initialProfile?.gender || "male",
    address: existingDraft?.personal_details?.address || "",
    city: existingDraft?.personal_details?.city || initialProfile?.city || "",
    state: existingDraft?.personal_details?.state || initialProfile?.state || "",
    country: existingDraft?.personal_details?.country || initialProfile?.country || "India",
    pinCode: existingDraft?.personal_details?.pinCode || initialProfile?.pin_code || "",
  });

  // Academic Details State
  const [academicDetails, setAcademicDetails] = useState({
    highestQualification:
      existingDraft?.academic_details?.highestQualification ||
      initialAcademics?.highest_qualification ||
      initialAcademics?.education_level ||
      "12th",
    institutionName:
      existingDraft?.academic_details?.institutionName || initialAcademics?.institution_name || "",
    boardOrUniversity:
      existingDraft?.academic_details?.boardOrUniversity || initialAcademics?.board_or_university || "",
    passingYear:
      existingDraft?.academic_details?.passingYear || initialAcademics?.passing_year || 2025,
    percentageOrCgpa:
      existingDraft?.academic_details?.percentageOrCgpa || (initialAcademics?.percentage_or_cgpa ? Number(initialAcademics.percentage_or_cgpa) : 85),
    stream: existingDraft?.academic_details?.stream || initialAcademics?.stream || "",
    entranceExamName:
      existingDraft?.academic_details?.entranceExamName || initialAcademics?.entrance_exam_name || "",
    entranceExamScore:
      existingDraft?.academic_details?.entranceExamScore || initialAcademics?.entrance_exam_score || "",
  });

  // Additional Info State
  const [additionalInfo, setAdditionalInfo] = useState({
    category: existingDraft?.additional_info?.category || "General",
    hostelRequired: existingDraft?.additional_info?.hostelRequired || false,
    statementOfPurpose: existingDraft?.additional_info?.statementOfPurpose || "",
    remarks: existingDraft?.additional_info?.remarks || "",
  });

  // Documents state
  const [uploadedDocs, setUploadedDocs] = useState<any[]>(existingDraft?.documents || []);
  const [declarationAccepted, setDeclarationAccepted] = useState(false);

  // Status and loading
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [uploadingDocType, setUploadingDocType] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Filter courses for currently selected college
  const availableCourses = collegeCourses.filter((cc) => cc.college_id === selectedCollegeId);
  const selectedCollege = colleges.find((c) => c.id === selectedCollegeId);
  const selectedCollegeCourse = collegeCourses.find((cc) => cc.id === selectedCourseId);

  const steps = [
    { num: 1, title: "Select College" },
    { num: 2, title: "Select Course" },
    { num: 3, title: "Personal Details" },
    { num: 4, title: "Academic Credentials" },
    { num: 5, title: "Additional Info" },
    { num: 6, title: "Upload Documents" },
    { num: 7, title: "Review & Submit" },
  ];

  // Helper to ensure draft exists on server
  const ensureDraftInitialized = async (): Promise<string | null> => {
    if (applicationId) return applicationId;
    if (!selectedCollegeId || !selectedCourseId) {
      setErrorMessage("Please select both a college and a course before proceeding.");
      return null;
    }

    try {
      setIsSavingDraft(true);
      const res = await startApplicationDraftAction(selectedCollegeId, selectedCourseId);
      if (!res.success) {
        setErrorMessage(res.error.message || "Failed to initialize draft");
        return null;
      }
      setApplicationId(res.data.applicationId);
      return res.data.applicationId;
    } catch (e: any) {
      setErrorMessage(e.message || "Failed to initialize application draft");
      return null;
    } finally {
      setIsSavingDraft(false);
    }
  };

  // Save current step progress as draft
  const handleSaveDraft = async () => {
    setErrorMessage(null);
    setSuccessMessage(null);

    const appId = await ensureDraftInitialized();
    if (!appId) return;

    try {
      setIsSavingDraft(true);
      const res = await updateApplicationDraftAction({
        applicationId: appId,
        collegeId: selectedCollegeId,
        collegeCourseId: selectedCourseId,
        personalDetails,
        academicDetails,
        additionalInfo,
      });

      if (res.success) {
        setSuccessMessage("Draft saved successfully. You can return and complete this application anytime.");
      } else {
        setErrorMessage(res.error?.message || "Failed to save draft");
      }
    } catch (e: any) {
      setErrorMessage(e.message || "Failed to save draft");
    } finally {
      setIsSavingDraft(false);
    }
  };

  // Next step transition handler with validation
  const handleNextStep = async () => {
    setErrorMessage(null);
    setSuccessMessage(null);

    if (currentStep === 1) {
      if (!selectedCollegeId) {
        setErrorMessage("Please select a target college to proceed.");
        return;
      }
      setCurrentStep(2);
      return;
    }

    if (currentStep === 2) {
      if (!selectedCourseId) {
        setErrorMessage("Please select a course to proceed.");
        return;
      }
      const appId = await ensureDraftInitialized();
      if (!appId) return;
      setCurrentStep(3);
      return;
    }

    if (currentStep === 3) {
      if (!personalDetails.fullName || !personalDetails.phone || !personalDetails.city || !personalDetails.pinCode) {
        setErrorMessage("Please fill all required personal contact coordinates.");
        return;
      }
      await handleSaveDraft();
      setCurrentStep(4);
      return;
    }

    if (currentStep === 4) {
      if (!academicDetails.highestQualification || !academicDetails.institutionName || !academicDetails.boardOrUniversity) {
        setErrorMessage("Please fill all primary academic qualification fields.");
        return;
      }
      await handleSaveDraft();
      setCurrentStep(5);
      return;
    }

    if (currentStep === 5) {
      await handleSaveDraft();
      setCurrentStep(6);
      return;
    }

    if (currentStep === 6) {
      setCurrentStep(7);
      return;
    }
  };

  // Document Upload Handler (Direct to Private Supabase Storage bucket)
  const handleDocumentUpload = async (docType: DocumentType, file: File) => {
    setErrorMessage(null);
    const appId = await ensureDraftInitialized();
    if (!appId) return;

    if (file.size > 10 * 1024 * 1024) {
      setErrorMessage("File exceeds 10MB limit. Please upload a smaller PDF or image.");
      return;
    }

    try {
      setUploadingDocType(docType);
      const supabase = createClient();
      const { data: userData } = await supabase.auth.getUser();
      if (!userData?.user) throw new Error("Authentication required");

      const fileExt = file.name.split(".").pop();
      const storagePath = `${userData.user.id}/${appId}/${docType}-${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("application-documents")
        .upload(storagePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const recordRes = await uploadApplicationDocumentAction({
        applicationId: appId,
        documentType: docType,
        storagePath,
        originalFilename: file.name,
        fileSizeBytes: file.size,
        mimeType: file.type || "application/octet-stream",
      });

      if (recordRes.success) {
        setUploadedDocs((prev) => [
          ...prev.filter((d) => d.document_type !== docType),
          {
            id: recordRes.data?.documentId,
            document_type: docType,
            original_filename: file.name,
            storage_path: storagePath,
            verification_status: "pending",
          },
        ]);
        setSuccessMessage(`${DOCUMENT_TYPE_LABELS[docType]} uploaded successfully.`);
      } else {
        setErrorMessage(recordRes.error?.message || "Failed to record document in application dossier");
      }
    } catch (e: any) {
      setErrorMessage(e.message || "Failed to upload document");
    } finally {
      setUploadingDocType(null);
    }
  };

  // Final Review & Submission Handler
  const handleSubmitApplication = async () => {
    setErrorMessage(null);
    if (!declarationAccepted) {
      setErrorMessage("Please accept the authentic information declaration to submit your application.");
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await submitApplicationAction({
        applicationId,
        personalDetails: personalDetails as any,
        academicDetails: {
          ...academicDetails,
          passingYear: Number(academicDetails.passingYear),
          percentageOrCgpa: Number(academicDetails.percentageOrCgpa),
        },
        additionalInfo: additionalInfo as any,
        declarationAccepted: true,
      });

      if (!res.success) {
        setErrorMessage(res.error.message || "Failed to submit application");
        return;
      }

      router.push(`/student/applications/${applicationId}`);
    } catch (e: any) {
      setErrorMessage(e.message || "Failed to submit application");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Stepper Track */}
      <div className="bg-white rounded-2xl border border-gray-200/80 p-4 sm:p-6 shadow-xs overflow-x-auto">
        <div className="flex items-center justify-between min-w-[650px] relative">
          <div className="absolute top-4 left-6 right-6 h-0.5 bg-gray-200 -z-0" />
          <div
            className="absolute top-4 left-6 h-0.5 bg-primary transition-all duration-300 -z-0"
            style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 95}%` }}
          />

          {steps.map((st) => {
            const isCompleted = currentStep > st.num;
            const isCurrent = currentStep === st.num;

            return (
              <div key={st.num} className="flex flex-col items-center relative z-10 space-y-1.5">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all shadow-xs ${
                    isCurrent
                      ? "bg-red-600 text-white ring-4 ring-red-100"
                      : isCompleted
                      ? "bg-emerald-600 text-white"
                      : "bg-white text-gray-400 border-2 border-gray-200"
                  }`}
                >
                  {isCompleted ? <Check className="w-4 h-4" /> : st.num}
                </div>
                <span
                  className={`text-[11px] font-semibold tracking-tight whitespace-nowrap ${
                    isCurrent ? "text-primary font-bold" : isCompleted ? "text-gray-800" : "text-gray-400"
                  }`}
                >
                  {st.title}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Error & Success Feedback Alerts */}
      {errorMessage && (
        <div className="p-4 rounded-xl bg-red-50 text-red-800 border border-red-200 text-xs font-semibold flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}
      {successMessage && (
        <div className="p-4 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold flex items-center gap-2.5">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* STEP 1: Select College */}
      {currentStep === 1 && (
        <div className="bg-white rounded-2xl border border-gray-200/80 p-6 shadow-xs space-y-5">
          <div>
            <h2 className="text-base font-bold text-gray-900">Step 1 — Choose Target University or College</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Select from accredited universities partnered for verified admission rounds.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {colleges.map((col) => {
              const isSelected = selectedCollegeId === col.id;
              return (
                <div
                  key={col.id}
                  onClick={() => {
                    setSelectedCollegeId(col.id);
                    setSelectedCourseId(""); // reset course when college changes
                  }}
                  className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between space-y-3 ${
                    isSelected
                      ? "border-primary bg-red-50/20 shadow-md ring-2 ring-red-100"
                      : "border-gray-200/80 hover:border-gray-300 hover:shadow-xs"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {col.logo_url ? (
                      <img
                        src={col.logo_url}
                        alt={col.name}
                        className="w-12 h-12 rounded-xl object-contain border border-gray-100 p-1 shrink-0 bg-white"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-xl bg-red-100 text-primary font-bold text-lg flex items-center justify-center shrink-0">
                        {col.name.charAt(0)}
                      </div>
                    )}
                    <div className="min-w-0">
                      <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                        {col.college_type || "Institution"}
                      </span>
                      <h3 className="text-xs sm:text-sm font-bold text-gray-900 truncate">{col.name}</h3>
                      <p className="text-[11px] text-gray-500 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-gray-400" />
                        <span>
                          {col.city}, {col.state}
                        </span>
                      </p>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-xs">
                    {col.average_placement && (
                      <span className="text-[11px] font-semibold text-emerald-700">
                        Avg: ₹{(col.average_placement / 100000).toFixed(1)} LPA
                      </span>
                    )}
                    <span
                      className={`text-xs font-bold ${
                        isSelected ? "text-primary" : "text-gray-400"
                      }`}
                    >
                      {isSelected ? "Selected ✓" : "Click to select"}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* STEP 2: Select Course */}
      {currentStep === 2 && (
        <div className="bg-white rounded-2xl border border-gray-200/80 p-6 shadow-xs space-y-5">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <div>
              <h2 className="text-base font-bold text-gray-900">
                Step 2 — Select Course at {selectedCollege?.name}
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Choose the undergraduate, postgraduate, or professional degree you are applying for.
              </p>
            </div>
            <button
              onClick={() => setCurrentStep(1)}
              className="text-xs font-semibold text-primary hover:underline"
            >
              Change College
            </button>
          </div>

          {availableCourses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {availableCourses.map((cc) => {
                const isSelected = selectedCourseId === cc.id;
                const courseName = cc.course_name_override || cc.course?.name;

                return (
                  <div
                    key={cc.id}
                    onClick={() => setSelectedCourseId(cc.id)}
                    className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between space-y-3 ${
                      isSelected
                        ? "border-primary bg-red-50/20 shadow-md ring-2 ring-red-100"
                        : "border-gray-200/80 hover:border-gray-300 hover:shadow-xs"
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[10px] font-bold">
                          {cc.course?.degree_type || "Degree"}
                        </span>
                        {cc.course?.duration_years && (
                          <span className="text-[11px] text-gray-500 font-medium">
                            {cc.course.duration_years} Years
                          </span>
                        )}
                      </div>
                      <h3 className="text-sm font-bold text-gray-900">{courseName}</h3>
                      {cc.course?.stream && (
                        <p className="text-xs text-gray-500">Stream: {cc.course.stream}</p>
                      )}
                    </div>

                    <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-xs">
                      <span className="text-[11px] text-gray-400">
                        {cc.course?.eligibility_criteria || "Direct / Entrance eligibility"}
                      </span>
                      <span
                        className={`font-bold ${isSelected ? "text-primary" : "text-gray-400"}`}
                      >
                        {isSelected ? "Selected ✓" : "Select Program"}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 space-y-2">
              <p className="text-xs text-gray-500">
                No active courses mapped to this college yet. Please select another college.
              </p>
              <Button onClick={() => setCurrentStep(1)} variant="outline" size="sm" className="text-xs">
                Back to Colleges
              </Button>
            </div>
          )}
        </div>
      )}

      {/* STEP 3: Personal Details */}
      {currentStep === 3 && (
        <div className="bg-white rounded-2xl border border-gray-200/80 p-6 shadow-xs space-y-6">
          <div>
            <h2 className="text-base font-bold text-gray-900">Step 3 — Applicant Personal Coordinates</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Verify your personal information. These details will be officially recorded on your application packet.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-700">Full Name *</label>
              <input
                type="text"
                value={personalDetails.fullName}
                onChange={(e) => setPersonalDetails({ ...personalDetails, fullName: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-red-500 focus:outline-none"
                placeholder="Applicant Full Name"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-700">Email Address *</label>
              <input
                type="email"
                value={personalDetails.email}
                disabled
                className="w-full px-3.5 py-2 rounded-xl border border-gray-200 bg-gray-50 text-xs text-gray-500 cursor-not-allowed"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-700">Mobile Phone *</label>
              <input
                type="tel"
                value={personalDetails.phone}
                onChange={(e) => setPersonalDetails({ ...personalDetails, phone: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-red-500 focus:outline-none"
                placeholder="10-digit mobile number"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-700">Parent / Alternate Phone</label>
              <input
                type="tel"
                value={personalDetails.alternatePhone}
                onChange={(e) => setPersonalDetails({ ...personalDetails, alternatePhone: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-red-500 focus:outline-none"
                placeholder="Alternate contact"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-700">Date of Birth *</label>
              <input
                type="date"
                value={personalDetails.dateOfBirth}
                onChange={(e) => setPersonalDetails({ ...personalDetails, dateOfBirth: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-red-500 focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-700">Gender *</label>
              <select
                value={personalDetails.gender}
                onChange={(e) => setPersonalDetails({ ...personalDetails, gender: e.target.value as any })}
                className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-red-500 focus:outline-none bg-white"
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
                <option value="prefer_not_to_say">Prefer not to say</option>
              </select>
            </div>

            <div className="sm:col-span-2 space-y-1.5">
              <label className="text-xs font-semibold text-gray-700">Permanent Street Address</label>
              <input
                type="text"
                value={personalDetails.address}
                onChange={(e) => setPersonalDetails({ ...personalDetails, address: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-red-500 focus:outline-none"
                placeholder="House No., Street, Landmark"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-700">City *</label>
              <input
                type="text"
                value={personalDetails.city}
                onChange={(e) => setPersonalDetails({ ...personalDetails, city: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-red-500 focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-700">State *</label>
              <input
                type="text"
                value={personalDetails.state}
                onChange={(e) => setPersonalDetails({ ...personalDetails, state: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-red-500 focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-700">PIN Code *</label>
              <input
                type="text"
                maxLength={6}
                value={personalDetails.pinCode}
                onChange={(e) => setPersonalDetails({ ...personalDetails, pinCode: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-red-500 focus:outline-none"
                placeholder="6-digit PIN"
              />
            </div>
          </div>
        </div>
      )}

      {/* STEP 4: Academic Details */}
      {currentStep === 4 && (
        <div className="bg-white rounded-2xl border border-gray-200/80 p-6 shadow-xs space-y-6">
          <div>
            <h2 className="text-base font-bold text-gray-900">Step 4 — Academic Qualifications</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Provide previous qualifying scores and entrance exam credentials for eligibility evaluation.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-700">Highest Qualification *</label>
              <select
                value={academicDetails.highestQualification}
                onChange={(e) => setAcademicDetails({ ...academicDetails, highestQualification: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-red-500 focus:outline-none bg-white"
              >
                <option value="12th">12th Standard / Intermediate</option>
                <option value="10th">10th Standard / Matriculation</option>
                <option value="Diploma">Polytechnic Diploma</option>
                <option value="Undergraduate">Undergraduate Degree</option>
                <option value="Postgraduate">Postgraduate Degree</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-700">School / College Name *</label>
              <input
                type="text"
                value={academicDetails.institutionName}
                onChange={(e) => setAcademicDetails({ ...academicDetails, institutionName: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-red-500 focus:outline-none"
                placeholder="Institution Name"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-700">Board / University *</label>
              <input
                type="text"
                value={academicDetails.boardOrUniversity}
                onChange={(e) => setAcademicDetails({ ...academicDetails, boardOrUniversity: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-red-500 focus:outline-none"
                placeholder="CBSE, ICSE, State Board, etc."
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-700">Passing / Appearing Year *</label>
              <input
                type="number"
                value={academicDetails.passingYear}
                onChange={(e) => setAcademicDetails({ ...academicDetails, passingYear: Number(e.target.value) })}
                className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-red-500 focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-700">Percentage / CGPA (%) *</label>
              <input
                type="number"
                step="0.01"
                value={academicDetails.percentageOrCgpa}
                onChange={(e) => setAcademicDetails({ ...academicDetails, percentageOrCgpa: Number(e.target.value) })}
                className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-red-500 focus:outline-none"
                placeholder="e.g. 88.5"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-700">Stream / Specialization</label>
              <input
                type="text"
                value={academicDetails.stream}
                onChange={(e) => setAcademicDetails({ ...academicDetails, stream: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-red-500 focus:outline-none"
                placeholder="PCM, PCB, Commerce, Arts, CS"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-700">Entrance Exam Name</label>
              <input
                type="text"
                value={academicDetails.entranceExamName}
                onChange={(e) => setAcademicDetails({ ...academicDetails, entranceExamName: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-red-500 focus:outline-none"
                placeholder="e.g. JEE Main, NEET, CUET"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-700">Score / Percentile / AIR</label>
              <input
                type="text"
                value={academicDetails.entranceExamScore}
                onChange={(e) => setAcademicDetails({ ...academicDetails, entranceExamScore: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-red-500 focus:outline-none"
                placeholder="e.g. 96.5 Percentile"
              />
            </div>
          </div>
        </div>
      )}

      {/* STEP 5: Additional Info */}
      {currentStep === 5 && (
        <div className="bg-white rounded-2xl border border-gray-200/80 p-6 shadow-xs space-y-6">
          <div>
            <h2 className="text-base font-bold text-gray-900">Step 5 — Additional Preferences & Information</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Optional preferences regarding category quota, accommodation, and personal statement.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-700">Admission Category</label>
              <select
                value={additionalInfo.category}
                onChange={(e) => setAdditionalInfo({ ...additionalInfo, category: e.target.value as any })}
                className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-red-500 focus:outline-none bg-white"
              >
                <option value="General">General / Open</option>
                <option value="OBC">Other Backward Class (OBC)</option>
                <option value="SC">Scheduled Caste (SC)</option>
                <option value="ST">Scheduled Tribe (ST)</option>
                <option value="EWS">Economically Weaker Section (EWS)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-700">Campus Accommodation</label>
              <div className="flex items-center gap-4 pt-2">
                <label className="flex items-center gap-2 text-xs text-gray-700 cursor-pointer">
                  <input
                    type="radio"
                    name="hostel"
                    checked={additionalInfo.hostelRequired === true}
                    onChange={() => setAdditionalInfo({ ...additionalInfo, hostelRequired: true })}
                    className="text-primary focus:ring-red-500"
                  />
                  <span>Hostel Accommodation Needed</span>
                </label>
                <label className="flex items-center gap-2 text-xs text-gray-700 cursor-pointer">
                  <input
                    type="radio"
                    name="hostel"
                    checked={additionalInfo.hostelRequired === false}
                    onChange={() => setAdditionalInfo({ ...additionalInfo, hostelRequired: false })}
                    className="text-primary focus:ring-red-500"
                  />
                  <span>Day Scholar / Not Required</span>
                </label>
              </div>
            </div>

            <div className="sm:col-span-2 space-y-1.5">
              <label className="text-xs font-semibold text-gray-700">
                Statement of Purpose / Why This College?
              </label>
              <textarea
                rows={3}
                value={additionalInfo.statementOfPurpose}
                onChange={(e) => setAdditionalInfo({ ...additionalInfo, statementOfPurpose: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-red-500 focus:outline-none"
                placeholder="Describe your academic passion, career aims, or motivation for this program..."
              />
            </div>
          </div>
        </div>
      )}

      {/* STEP 6: Document Upload */}
      {currentStep === 6 && (
        <div className="bg-white rounded-2xl border border-gray-200/80 p-6 shadow-xs space-y-6">
          <div>
            <h2 className="text-base font-bold text-gray-900">Step 6 — Secure Document Upload</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Upload clear PDF or image copies (Max: 10MB per file). Files are securely stored in private storage.
            </p>
          </div>

          <div className="space-y-3">
            {DOCUMENT_TYPES.slice(0, 6).map((docType) => {
              const existingDoc = uploadedDocs.find((d) => d.document_type === docType);
              const isUploading = uploadingDocType === docType;

              return (
                <div
                  key={docType}
                  className="p-4 rounded-xl border border-gray-200/80 bg-gray-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-gray-900 block">
                      {DOCUMENT_TYPE_LABELS[docType]}
                    </span>
                    {existingDoc ? (
                      <p className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Uploaded: {existingDoc.original_filename}</span>
                      </p>
                    ) : (
                      <p className="text-[11px] text-gray-400">PDF, JPG, PNG (Max 10MB)</p>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="file"
                      accept=".pdf,image/png,image/jpeg,image/webp"
                      id={`file-${docType}`}
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleDocumentUpload(docType, file);
                      }}
                    />
                    <label htmlFor={`file-${docType}`}>
                      <Button
                        type="button"
                        variant={existingDoc ? "outline" : "secondary"}
                        size="sm"
                        disabled={isUploading}
                        className="text-xs cursor-pointer"
                        onClick={() => document.getElementById(`file-${docType}`)?.click()}
                      >
                        {isUploading ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                            <span>Uploading...</span>
                          </>
                        ) : existingDoc ? (
                          <>
                            <Upload className="w-3.5 h-3.5 mr-1.5" />
                            <span>Replace File</span>
                          </>
                        ) : (
                          <>
                            <Upload className="w-3.5 h-3.5 mr-1.5" />
                            <span>Upload File</span>
                          </>
                        )}
                      </Button>
                    </label>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* STEP 7: Review and Submit */}
      {currentStep === 7 && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-gray-200/80 p-6 shadow-xs space-y-4">
            <h2 className="text-base font-bold text-gray-900 border-b border-gray-100 pb-3">
              Step 7 — Review Application Dossier
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-gray-50 space-y-1">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                  Target Program
                </span>
                <p className="text-xs font-bold text-gray-900">{selectedCollege?.name}</p>
                <p className="text-xs text-primary font-semibold">
                  {selectedCollegeCourse?.course_name_override || selectedCollegeCourse?.course?.name}
                </p>
                <p className="text-[11px] text-gray-500">
                  {selectedCollege?.city}, {selectedCollege?.state}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-gray-50 space-y-1">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                  Applicant Details
                </span>
                <p className="text-xs font-bold text-gray-900">{personalDetails.fullName}</p>
                <p className="text-xs text-gray-600">{personalDetails.email}</p>
                <p className="text-xs text-gray-600">{personalDetails.phone}</p>
                <p className="text-[11px] text-gray-500">
                  {personalDetails.city}, {personalDetails.state} - {personalDetails.pinCode}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-gray-50 space-y-1">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                  Academic Record
                </span>
                <p className="text-xs font-bold text-gray-900">
                  {academicDetails.highestQualification} ({academicDetails.passingYear})
                </p>
                <p className="text-xs text-gray-600">
                  {academicDetails.institutionName} • {academicDetails.boardOrUniversity}
                </p>
                <p className="text-xs text-emerald-700 font-bold">
                  Score: {academicDetails.percentageOrCgpa}%
                </p>
              </div>

              <div className="p-4 rounded-xl bg-gray-50 space-y-1">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                  Uploaded Documents
                </span>
                <p className="text-xs font-bold text-gray-900">
                  {uploadedDocs.length} Documents Attached
                </p>
                <div className="flex flex-wrap gap-1 pt-1">
                  {uploadedDocs.map((doc) => (
                    <span
                      key={doc.id}
                      className="px-2 py-0.5 rounded-md bg-white border border-gray-200 text-[10px] text-gray-600 font-semibold"
                    >
                      {DOCUMENT_TYPE_LABELS[doc.document_type as DocumentType] || doc.document_type}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Declaration Consent Checkbox */}
            <div className="pt-4 border-t border-gray-100">
              <label className="flex items-start gap-3 cursor-pointer p-4 rounded-xl bg-red-50/30 border border-red-100">
                <input
                  type="checkbox"
                  checked={declarationAccepted}
                  onChange={(e) => setDeclarationAccepted(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded text-primary focus:ring-red-500"
                />
                <span className="text-xs text-gray-700 leading-relaxed font-medium">
                  I hereby declare that all the information provided in this application is authentic, accurate, and complete to the best of my knowledge. I understand that any fraudulent statement may lead to immediate cancellation of admission and forfeiture of seats.
                </span>
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Buttons Strip */}
      <div className="flex items-center justify-between pt-2">
        <div>
          {currentStep > 1 && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setCurrentStep((prev) => prev - 1)}
              className="text-xs"
            >
              <ArrowLeft className="w-3.5 h-3.5 mr-1.5" />
              <span>Previous Step</span>
            </Button>
          )}
        </div>

        <div className="flex items-center gap-2">
          {currentStep >= 3 && currentStep < 7 && (
            <Button
              type="button"
              variant="secondary"
              size="sm"
              disabled={isSavingDraft}
              onClick={handleSaveDraft}
              className="text-xs"
            >
              {isSavingDraft ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5 mr-1.5" />
                  <span>Save Draft</span>
                </>
              )}
            </Button>
          )}

          {currentStep < 7 ? (
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={handleNextStep}
              className="text-xs"
            >
              <span>Continue</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
            </Button>
          ) : (
            <Button
              type="button"
              variant="primary"
              size="md"
              disabled={isSubmitting || !declarationAccepted}
              onClick={handleSubmitApplication}
              className="text-xs min-w-44 bg-red-600 hover:bg-red-700 shadow-md"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  <span>Submitting Application...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4 mr-2" />
                  <span>Submit Application</span>
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
