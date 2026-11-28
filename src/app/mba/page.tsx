"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  GraduationCap,
  TrendingUp,
  Award,
  CheckCircle2,
  ArrowRight,
  Search,
  Building2,
  MapPin,
  Calendar,
  ChevronDown,
  ChevronUp,
  Star,
  Users,
  BookOpen,
  Briefcase,
  ShieldCheck,
  FileText,
  PhoneCall,
  MessageSquare,
  HelpCircle,
  Filter,
  Sparkles,
  Clock,
  ArrowUpRight,
  Send,
  Loader2,
  Check,
  Compass,
} from "lucide-react";
import { useCounselingModal } from "@/components/forms/counseling-modal-context";
import { submitPublicEnquiryAction } from "@/lib/crm/actions";
import { SubmissionSuccessView } from "@/components/ui/submission-success-view";
import { cn } from "@/lib/utils";

// --- DATA: TOP B-SCHOOLS ---
interface BSchool {
  id: string;
  name: string;
  location: string;
  tier: "Tier 1 Dream" | "Top Private" | "Direct Merit / High ROI";
  region: "Delhi NCR" | "Mumbai & West" | "Bangalore & South" | "East & Bhubaneswar" | "National";
  nirfRank?: string;
  accreditation: string;
  avgPackage: string;
  highestPackage: string;
  fees: string;
  exams: string[];
  directMeritEligible: boolean;
  scholarshipAvailable: boolean;
  image: string;
  specializations: string[];
}

const TOP_BSCHOOLS: BSchool[] = [
  {
    id: "iim-ahmedabad",
    name: "IIM Ahmedabad (Indian Institute of Management)",
    location: "Ahmedabad, Gujarat",
    tier: "Tier 1 Dream",
    region: "Mumbai & West",
    nirfRank: "#1 Management",
    accreditation: "EQUIS | AACSB | AMBA (Triple Crown)",
    avgPackage: "₹34.36 LPA",
    highestPackage: "₹1.15 CPA",
    fees: "₹25.0 Lakhs",
    exams: ["CAT", "GMAT"],
    directMeritEligible: false,
    scholarshipAvailable: true,
    image: "/images/campuses/iim.png",
    specializations: ["General Management", "Finance", "Strategy", "Consulting"],
  },
  {
    id: "iim-bangalore",
    name: "IIM Bangalore (Indian Institute of Management)",
    location: "Bengaluru, Karnataka",
    tier: "Tier 1 Dream",
    region: "Bangalore & South",
    nirfRank: "#2 Management",
    accreditation: "EQUIS | AACSB | AMBA",
    avgPackage: "₹35.31 LPA",
    highestPackage: "₹1.08 CPA",
    fees: "₹24.5 Lakhs",
    exams: ["CAT", "GMAT"],
    directMeritEligible: false,
    scholarshipAvailable: true,
    image: "/images/campuses/iim.png",
    specializations: ["Product Management", "Business Analytics", "Finance"],
  },
  {
    id: "isb-hyderabad",
    name: "Indian School of Business (ISB)",
    location: "Hyderabad & Mohali",
    tier: "Tier 1 Dream",
    region: "Bangalore & South",
    nirfRank: "FT Global #31",
    accreditation: "AACSB | EQUIS | AMBA",
    avgPackage: "₹34.21 LPA",
    highestPackage: "₹72.0 LPA",
    fees: "₹41.5 Lakhs",
    exams: ["GMAT", "GRE"],
    directMeritEligible: true,
    scholarshipAvailable: true,
    image: "/images/campuses/isb.png",
    specializations: ["Strategy & Leadership", "Fintech", "Technology Management"],
  },
  {
    id: "xlri-jamshedpur",
    name: "XLRI Xavier School of Management",
    location: "Jamshedpur & Delhi NCR",
    tier: "Tier 1 Dream",
    region: "East & Bhubaneswar",
    nirfRank: "#9 Management",
    accreditation: "AACSB | AMBA | NBA",
    avgPackage: "₹29.89 LPA",
    highestPackage: "₹78.2 LPA",
    fees: "₹28.0 Lakhs",
    exams: ["XAT", "GMAT"],
    directMeritEligible: false,
    scholarshipAvailable: true,
    image: "/images/feature_college.webp",
    specializations: ["Human Resource Management (HRM)", "Business Management (BM)"],
  },
  {
    id: "sibm-pune",
    name: "SIBM Pune (Symbiosis Institute of Business Management)",
    location: "Pune, Maharashtra",
    tier: "Top Private",
    region: "Mumbai & West",
    nirfRank: "#13 Management",
    accreditation: "NAAC A++ | AICTE",
    avgPackage: "₹28.16 LPA",
    highestPackage: "₹49.0 LPA",
    fees: "₹26.8 Lakhs",
    exams: ["SNAP"],
    directMeritEligible: false,
    scholarshipAvailable: true,
    image: "/images/campuses/sibm.png",
    specializations: ["Marketing", "HR", "Finance", "Operations"],
  },
  {
    id: "nmims-mumbai",
    name: "NMIMS School of Business Management (SBM)",
    location: "Mumbai, Maharashtra",
    tier: "Top Private",
    region: "Mumbai & West",
    nirfRank: "#21 Management",
    accreditation: "AACSB | NAAC A+",
    avgPackage: "₹26.63 LPA",
    highestPackage: "₹67.8 LPA",
    fees: "₹24.0 Lakhs",
    exams: ["NMAT"],
    directMeritEligible: false,
    scholarshipAvailable: true,
    image: "/images/featured_college.webp",
    specializations: ["Finance", "Marketing", "Business Analytics", "Digital Transformation"],
  },
  {
    id: "great-lakes-chennai",
    name: "Great Lakes Institute of Management",
    location: "Chennai & Gurgaon",
    tier: "Top Private",
    region: "Bangalore & South",
    nirfRank: "#34 Management",
    accreditation: "AMBA | SAQS | AICTE",
    avgPackage: "₹15.8 LPA",
    highestPackage: "₹46.0 LPA",
    fees: "₹21.0 Lakhs",
    exams: ["CAT", "XAT", "CMAT", "GMAT"],
    directMeritEligible: true,
    scholarshipAvailable: true,
    image: "/images/campuses/centurion.png",
    specializations: ["Analytics & AI", "Marketing", "Operations", "Finance"],
  },
  {
    id: "tapmi-manipal",
    name: "TAPMI (T.A. Pai Management Institute)",
    location: "Manipal & Bengaluru",
    tier: "Top Private",
    region: "Bangalore & South",
    nirfRank: "#42 Management",
    accreditation: "AACSB | AMBA | NBA",
    avgPackage: "₹14.8 LPA",
    highestPackage: "₹32.0 LPA",
    fees: "₹18.5 Lakhs",
    exams: ["CAT", "XAT", "NMAT", "GMAT"],
    directMeritEligible: true,
    scholarshipAvailable: true,
    image: "/images/campuses/rvce.png",
    specializations: ["Banking & Financial Services (BKFS)", "HRM", "Marketing"],
  },
  {
    id: "bimtech-noida",
    name: "BIMTECH (Birla Institute of Management Technology)",
    location: "Greater Noida, Delhi NCR",
    tier: "Direct Merit / High ROI",
    region: "Delhi NCR",
    nirfRank: "Top 50 India",
    accreditation: "AACSB Accredited | AICTE",
    avgPackage: "₹11.2 LPA",
    highestPackage: "₹24.4 LPA",
    fees: "₹14.0 Lakhs",
    exams: ["CAT", "XAT", "CMAT", "MAT", "Direct Merit"],
    directMeritEligible: true,
    scholarshipAvailable: true,
    image: "/images/featured_college.webp",
    specializations: ["International Business (IB)", "Insurance (IBM)", "Retail (RM)", "Marketing"],
  },
  {
    id: "welingkar-mumbai",
    name: "Prin. L.N. Welingkar Institute (WeSchool)",
    location: "Mumbai & Bengaluru",
    tier: "Direct Merit / High ROI",
    region: "Mumbai & West",
    nirfRank: "#68 Management",
    accreditation: "NBA | SAQS | AICTE",
    avgPackage: "₹12.5 LPA",
    highestPackage: "₹25.4 LPA",
    fees: "₹15.0 Lakhs",
    exams: ["CAT", "XAT", "CMAT", "ATMA", "Direct Merit"],
    directMeritEligible: true,
    scholarshipAvailable: true,
    image: "/images/campuses/cv-raman.png",
    specializations: ["E-Business", "Business Design", "Retail", "Healthcare"],
  },
  {
    id: "ksom-bhubaneswar",
    name: "KIIT School of Management (KSOM)",
    location: "Bhubaneswar, Odisha",
    tier: "Direct Merit / High ROI",
    region: "East & Bhubaneswar",
    nirfRank: "#59 Management",
    accreditation: "NAAC A++ | UGC | AICTE",
    avgPackage: "₹9.2 LPA",
    highestPackage: "₹22.75 LPA",
    fees: "₹10.5 Lakhs",
    exams: ["KIITEE-Mgmt", "CAT", "XAT", "MAT", "CMAT"],
    directMeritEligible: true,
    scholarshipAvailable: true,
    image: "/images/campuses/kiit.png",
    specializations: ["Business Analytics", "Marketing", "Finance", "HR", "Operations"],
  },
  {
    id: "bgu-bhubaneswar",
    name: "Birla Global University (BGU)",
    location: "Bhubaneswar, Odisha",
    tier: "Direct Merit / High ROI",
    region: "East & Bhubaneswar",
    nirfRank: "Top Private Odisha",
    accreditation: "UGC Recognised | State University",
    avgPackage: "₹8.5 LPA",
    highestPackage: "₹18.0 LPA",
    fees: "₹9.2 Lakhs",
    exams: ["CAT", "XAT", "MAT", "Direct Merit"],
    directMeritEligible: true,
    scholarshipAvailable: true,
    image: "/images/campuses/soa.png",
    specializations: ["Financial Technologies", "Digital Marketing", "Operations"],
  },
  {
    id: "fore-delhi",
    name: "FORE School of Management",
    location: "New Delhi, Delhi NCR",
    tier: "Top Private",
    region: "Delhi NCR",
    nirfRank: "#53 Management",
    accreditation: "SAQS | NBA | AICTE",
    avgPackage: "₹14.5 LPA",
    highestPackage: "₹30.0 LPA",
    fees: "₹17.5 Lakhs",
    exams: ["CAT", "XAT", "GMAT"],
    directMeritEligible: true,
    scholarshipAvailable: true,
    image: "/images/feature_college_iit delhi.webp",
    specializations: ["Big Data Analytics (BDA)", "Financial Management (FM)", "International Business"],
  },
  {
    id: "jaipuria-noida",
    name: "Jaipuria Institute of Management",
    location: "Noida / Lucknow / Jaipur",
    tier: "Direct Merit / High ROI",
    region: "Delhi NCR",
    nirfRank: "Top 75 Management",
    accreditation: "AACSB Member | NBA | AIU",
    avgPackage: "₹11.4 LPA",
    highestPackage: "₹22.0 LPA",
    fees: "₹12.5 Lakhs",
    exams: ["CAT", "XAT", "CMAT", "MAT", "Direct Merit"],
    directMeritEligible: true,
    scholarshipAvailable: true,
    image: "/images/auth/campus_modern.jpg",
    specializations: ["Marketing", "Service Management", "Retail & Analytics"],
  },
];

// --- DATA: SPECIALIZATIONS ---
const SPECIALIZATIONS = [
  {
    title: "Finance & Fintech",
    salary: "₹14L – ₹38L",
    demand: "Very High",
    roles: ["Investment Banker", "Wealth Manager", "Risk Analyst", "Equity Research Analyst"],
    recruiters: ["Goldman Sachs", "JP Morgan", "Morgan Stanley", "HDFC Bank", "Barclays"],
    desc: "Focuses on capital markets, portfolio management, fintech disruption, and corporate valuation. Prime choice for CFA aspirants and math-inclined graduates.",
  },
  {
    title: "Marketing & Digital Strategy",
    salary: "₹12L – ₹35L",
    demand: "Evergreen",
    roles: ["Brand Manager", "Growth Marketing Lead", "Product Marketing Specialist", "Category Head"],
    recruiters: ["Hindustan Unilever", "P&G", "Google", "ITC", "Amazon", "Nestlé"],
    desc: "Combines consumer psychology, omnichannel campaigns, performance marketing, and global brand management for high-growth consumer and tech industries.",
  },
  {
    title: "Business Analytics & AI",
    salary: "₹15L – ₹40L",
    demand: "Fastest Growing",
    roles: ["Data-driven Consultant", "Product Analytics Lead", "Business Intelligence Manager"],
    recruiters: ["McKinsey & Co.", "Bain & Company", "Accenture Strategy", "Fractal Analytics", "Microsoft"],
    desc: "Integrates Python, SQL, predictive modeling, machine learning, and executive dashboarding for strategic executive decision-making.",
  },
  {
    title: "Operations & Supply Chain",
    salary: "₹13L – ₹30L",
    demand: "High",
    roles: ["Supply Chain Strategist", "Procurement Head", "Operations Lead", "Logistics Architect"],
    recruiters: ["Amazon", "Flipkart", "Tata Motors", "DHL", "Reliance Retail", "Schneider Electric"],
    desc: "Mastery of Lean Six Sigma, warehouse automation, international logistics, and e-commerce fulfillment networks.",
  },
  {
    title: "Human Resources (HRM)",
    salary: "₹11L – ₹28L",
    demand: "Strategic",
    roles: ["HR Business Partner (HRBP)", "Talent Acquisition Head", "Total Rewards Specialist"],
    recruiters: ["Deloitte", "Tata Sons", "KPMG", "EY", "Aditya Birla Group", "Wipro"],
    desc: "Focuses on strategic talent acquisition, organizational culture, labor laws, performance appraisal architectures, and executive retention.",
  },
  {
    title: "International Business & Strategy",
    salary: "₹14L – ₹34L",
    demand: "High",
    roles: ["Global Strategy Manager", "Export-Import Director", "Cross-Border M&A Analyst"],
    recruiters: ["BCG", "Kearney", "L&T International", "Cognizant", "Standard Chartered"],
    desc: "Prepares executives for cross-border trade, geopolitical economic policies, foreign exchange hedges, and international expansion.",
  },
];

// --- DATA: ENTRANCE EXAMS ---
const EXAMS_DATA = [
  {
    exam: "CAT 2025 / 2026",
    conductor: "IIMs (Rotational)",
    period: "Last Sunday of Nov",
    colleges: "All 21 IIMs, FMS, SPJIMR, MDI, IIT DoMS (150+ Top Schools)",
    difficulty: "High (Quantitative, VARC, DILR)",
    targetCutoff: "95 – 99.8%ile (Tier 1) | 80 – 90%ile (Tier 2)",
  },
  {
    exam: "XAT 2026",
    conductor: "XLRI Jamshedpur",
    period: "First Sunday of Jan",
    colleges: "XLRI, IMT Ghaziabad, XIMB, TAPMI, GIM (160+ Schools)",
    difficulty: "High (Decision Making, Verbal, QA)",
    targetCutoff: "90 – 96%ile (XLRI) | 75 – 85%ile (Others)",
  },
  {
    exam: "NMAT by GMAC",
    conductor: "GMAC (Global)",
    period: "Oct to Dec (75-day window)",
    colleges: "NMIMS Mumbai & Bengaluru, K J Somaiya, TAPMI, SDA Bocconi",
    difficulty: "Moderate (Adaptive Speed Exam)",
    targetCutoff: "235+ Score (NMIMS Mumbai) | 200–220+ (Others)",
  },
  {
    exam: "SNAP 2025 / 2026",
    conductor: "Symbiosis University",
    period: "Dec (3 Sessions)",
    colleges: "SIBM Pune, SCMHRD, SIIB, SIBM Bengaluru (16 SIU Schools)",
    difficulty: "Moderate (Speed 60 Questions in 60 Mins)",
    targetCutoff: "97.5 – 98.5%ile (SIBM/SCMHRD) | 85–92%ile (Others)",
  },
  {
    exam: "CMAT / MAT / ATMA",
    conductor: "NTA / AIMA",
    period: "Multiple Windows (Feb, May, Sept, Dec)",
    colleges: "1,000+ AICTE Approved PGDM & MBA Institutions across India",
    difficulty: "Moderate to Easy",
    targetCutoff: "80 – 95%ile (Top PGDM Merit) | Direct Counselling Available",
  },
  {
    exam: "Direct Merit / Profile-Based",
    conductor: "Institutional Partner Admission",
    period: "Rolling Admissions (Session 2026–28)",
    colleges: "350+ Partner AICTE & UGC Recognized B-Schools",
    difficulty: "Personal Interview & Profile Audit",
    targetCutoff: "50%+ in Graduation + Consistent 10th/12th Academics",
  },
];

// --- DATA: FAQS ---
const FAQS = [
  {
    q: "What is the key difference between MBA and PGDM in India?",
    a: "An MBA (Master of Business Administration) is an academic degree awarded by universities or colleges affiliated with universities. A PGDM (Post Graduate Diploma in Management) is a diploma awarded by autonomous institutes approved by AICTE. When accredited by AIU (Association of Indian Universities) and NBA, a PGDM is 100% equivalent to an MBA degree in terms of global standing, government jobs, and higher studies (Ph.D). In fact, premier institutes like IIMs (historically), XLRI, SPJIMR, and MDI offer PGDM programs whose industry curricula update much faster than university MBAs.",
  },
  {
    q: "Can I get admission into a top B-School if my CAT score is below 85%ile?",
    a: "Yes, absolutely! Top institutions like Great Lakes, TAPMI, BIMTECH, Welingkar, FORE, and KSOM evaluate candidates on a holistic profile basis. They look at your 10th/12th/Graduation consistency, extra-curricular accomplishments, work experience, and performance in personal interview (GD-PI-WAT). Furthermore, Aspirant Vision provides official institutional direct counselling guidance for pre-qualified merit seats in leading accredited B-Schools.",
  },
  {
    q: "What is the expected ROI (Return on Investment) of a 2-Year MBA/PGDM?",
    a: "For top private and university B-Schools with fees between ₹10L and ₹18L, average campus placements range from ₹12L to ₹18L per annum. This means students typically recover their entire tuition investment within 12 to 18 months of graduation. With Aspirant Vision's verified scholarship assistance of up to ₹5 Lakhs, the net cost is further reduced.",
  },
  {
    q: "Does Aspirant Vision charge any advance donation or hidden fees?",
    a: "No! Aspirant Vision strictly operates with zero donation, zero capitation, and complete institutional transparency. We are official outreach and academic counselling partners with verified institutions. All tuition fees are deposited directly to the college account with institutional receipts and verified fee structures.",
  },
  {
    q: "How does Aspirant Vision assist with MBA Education Loans?",
    a: "We have dedicated tie-ups with leading banking partners including SBI, HDFC Credila, Axis Bank, and Bank of Baroda. Through our partner network, students can secure up to 100% collateral-free education loans covering tuition, hostel, and laptop expenses with preferential interest rates and fast-track 48-hour approvals.",
  },
  {
    q: "What is the minimum eligibility for MBA / PGDM 2026–2028 admissions?",
    a: "A candidate must hold a recognized Bachelor's degree (any discipline such as B.Tech, BBA, B.Com, B.Sc, BA) with a minimum of 50% aggregate marks (45% for reserved categories). Final year graduation students whose results will be announced by August/September 2026 are also fully eligible to apply.",
  },
];

export default function MbaLandingPage() {
  const { openModal } = useCounselingModal();

  // Filters state
  const [selectedTier, setSelectedTier] = useState<string>("All");
  const [selectedRegion, setSelectedRegion] = useState<string>("All");
  const [searchFilter, setSearchFilter] = useState<string>("");

  // Quick Matcher state
  const [matcherGrad, setMatcherGrad] = useState("60% - 75%");
  const [matcherExam, setMatcherExam] = useState("CAT / XAT / CMAT");
  const [matcherSpec, setMatcherSpec] = useState("Finance & Fintech");
  const [matcherBudget, setMatcherBudget] = useState("₹10L - ₹18L");

  // Inline Lead Form state
  const [leadForm, setLeadForm] = useState({
    name: "",
    phone: "",
    email: "",
    city: "",
    targetExam: "CAT / XAT / CMAT",
    preferredSpecialization: "Finance & Fintech",
    targetYear: "2026–2028",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // FAQ open toggle
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  // Filtered colleges logic
  const filteredColleges = TOP_BSCHOOLS.filter((college) => {
    const matchesTier = selectedTier === "All" || college.tier === selectedTier;
    const matchesRegion = selectedRegion === "All" || college.region === selectedRegion;
    const matchesSearch =
      college.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
      college.location.toLowerCase().includes(searchFilter.toLowerCase()) ||
      college.exams.some((e) => e.toLowerCase().includes(searchFilter.toLowerCase())) ||
      college.specializations.some((s) => s.toLowerCase().includes(searchFilter.toLowerCase()));
    return matchesTier && matchesRegion && matchesSearch;
  });

  const handleLeadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setIsSubmitting(true);

    try {
      const email =
        leadForm.email && leadForm.email.includes("@")
          ? leadForm.email
          : `student_${leadForm.phone.replace(/[^0-9]/g, "")}@aspirant-lead.com`;

      const res = await submitPublicEnquiryAction({
        fullName: leadForm.name,
        phone: leadForm.phone,
        email: email,
        preferredLocation: leadForm.city || "Direct MBA Portal",
        currentQualification: matcherGrad,
        enquiryMessage: `Target Exam: ${leadForm.targetExam} | Specialization: ${leadForm.preferredSpecialization} (${leadForm.targetYear}) | Target Budget: ${matcherBudget}`,
        source: "Dedicated MBA Landing Page",
        landingPage: "/mba",
        consentStatus: true,
      });

      if (res.success) {
        setIsSubmitted(true);
      } else {
        setFormError(res.error?.message || "Unable to submit enquiry. Please try again or WhatsApp our counsellor.");
      }
    } catch (err: any) {
      setFormError(err?.message || "An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-[#FAFBFD] min-h-screen text-[#15182D]">
      {/* ======================================================== */}
      {/* 1. HERO SECTION: LOOKING FOR MBA | PGDM INTO TOP COLLEGES */}
      {/* ======================================================== */}
      <section className="relative pt-6 sm:pt-10 pb-12 sm:pb-16 overflow-hidden border-b border-[#E7E9F0] bg-white">
        <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Breadcrumb & Live Admission Status */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-6 sm:mb-8">
            <div className="flex items-center gap-2 text-xs font-semibold text-gray-500">
              <Link href="/" className="hover:text-[#E31E2B] transition-colors">
                Home
              </Link>
              <span className="text-gray-300">/</span>
              <span className="text-gray-600">Management Admissions</span>
              <span className="text-gray-300">/</span>
              <span className="text-[#E31E2B] font-bold">MBA &amp; PGDM Portal</span>
            </div>

            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-red-50 border border-red-200 text-[#E31E2B] text-xs font-bold">
              <span className="w-2 h-2 rounded-full bg-[#E31E2B] animate-pulse" />
              <span>Admissions Open for Session 2026–2028</span>
            </div>
          </div>

          {/* Hero Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left Column: Headline, Narrative & Key Highlights */}
            <div className="lg:col-span-7 space-y-5 sm:space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gray-100 text-gray-700 text-xs font-bold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5 text-[#E31E2B]" />
                <span>Premier B-School Fast-Track Hub</span>
              </div>

              <h1 className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-[52px] font-extrabold text-[#15182D] leading-[1.12] tracking-tight">
                Looking for <span className="text-[#E31E2B]">MBA | PGDM</span> into Top Colleges?
              </h1>

              <p className="text-sm sm:text-base md:text-lg text-gray-600 leading-relaxed max-w-2xl font-normal">
                Direct merit counselling, profile-based admissions, CAT / XAT / CMAT / MAT cutoff analytics, and verified seat allocation across <strong className="text-gray-900 font-bold">350+ premier AICTE &amp; AACSB approved B-Schools</strong> in India and abroad.
              </p>

              {/* 4 Trust Feature Badges (Flat, Clean, No Shadow) */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
                <div className="p-3.5 rounded-xl bg-gray-50/80 border border-gray-200 transition-colors">
                  <div className="text-[#15182D] font-extrabold text-lg sm:text-xl">350+</div>
                  <div className="text-[11px] font-semibold text-gray-500 leading-tight mt-0.5">Partner B-Schools</div>
                </div>
                <div className="p-3.5 rounded-xl bg-gray-50/80 border border-gray-200 transition-colors">
                  <div className="text-emerald-600 font-extrabold text-lg sm:text-xl">₹34.8 LPA</div>
                  <div className="text-[11px] font-semibold text-gray-500 leading-tight mt-0.5">Highest Placement</div>
                </div>
                <div className="p-3.5 rounded-xl bg-gray-50/80 border border-gray-200 transition-colors">
                  <div className="text-amber-600 font-extrabold text-lg sm:text-xl">Up to ₹5L</div>
                  <div className="text-[11px] font-semibold text-gray-500 leading-tight mt-0.5">Merit Fee Concession</div>
                </div>
                <div className="p-3.5 rounded-xl bg-gray-50/80 border border-gray-200 transition-colors">
                  <div className="text-[#E31E2B] font-extrabold text-lg sm:text-xl">100%</div>
                  <div className="text-[11px] font-semibold text-gray-500 leading-tight mt-0.5">Zero-Donation Policy</div>
                </div>
              </div>

              {/* CTAs (Flat, Clean, No Shadow) */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  onClick={() => openModal("MBA / PGDM Comprehensive Profile Evaluation")}
                  className="bg-[#E31E2B] hover:bg-[#c91824] text-white px-7 py-3 rounded-full font-bold text-sm flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <GraduationCap className="w-4 h-4" />
                  <span>Evaluate My MBA Profile (Free)</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <a
                  href="#colleges-directory"
                  className="px-6 py-3 rounded-full text-xs sm:text-sm font-bold text-gray-800 hover:text-[#E31E2B] transition-colors border border-gray-200 bg-white hover:bg-gray-50 flex items-center gap-2"
                >
                  <Building2 className="w-4 h-4 text-[#E31E2B]" />
                  <span>Browse Top B-Schools</span>
                </a>
              </div>
            </div>

            {/* Right Column: Quick Interactive Matcher & Lead Capture Box (Flat, Clean, No Shadow) */}
            <div className="lg:col-span-5">
              <div className="rounded-2xl sm:rounded-3xl p-6 sm:p-8 bg-white border border-gray-200 relative overflow-hidden text-[#15182D]">
                <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/5 rounded-bl-full pointer-events-none" />

                <div className="mb-4">
                  <span className="text-[11px] font-extrabold text-[#E31E2B] uppercase tracking-wider block">
                    Instant Recommendation
                  </span>
                  <h3 className="font-display text-xl sm:text-2xl font-black text-[#15182D] mt-0.5">
                    Find Your Ideal B-School in 60s
                  </h3>
                  <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                    Personalized match based on your graduation marks, exams, and target budget.
                  </p>
                </div>

                <div className="space-y-3.5">
                  <div>
                    <label className="text-[11px] font-bold text-gray-800 block mb-1">
                      Expected / Appeared Entrance Exam
                    </label>
                    <select
                      value={matcherExam}
                      onChange={(e) => setMatcherExam(e.target.value)}
                      className="w-full text-xs font-semibold px-3 py-2.5 rounded-xl bg-gray-50 border border-gray-200 outline-none focus:border-[#E31E2B] focus:bg-white transition-colors cursor-pointer"
                    >
                      <option value="CAT (IIMs & Premier Tier 1)">CAT (IIMs &amp; Premier Tier 1)</option>
                      <option value="XAT (XLRI & Top Private)">XAT (XLRI &amp; Top Private)</option>
                      <option value="NMAT by GMAC (NMIMS)">NMAT by GMAC (NMIMS)</option>
                      <option value="SNAP (Symbiosis International)">SNAP (Symbiosis International)</option>
                      <option value="CMAT / MAT / ATMA">CMAT / MAT / ATMA</option>
                      <option value="Non-CAT / Direct Merit Profile">Non-CAT / Direct Merit Profile</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="text-[11px] font-bold text-gray-800 block mb-1">
                        Graduation Score %
                      </label>
                      <select
                        value={matcherGrad}
                        onChange={(e) => setMatcherGrad(e.target.value)}
                        className="w-full text-xs font-semibold px-3 py-2.5 rounded-xl bg-gray-50 border border-gray-200 outline-none focus:border-[#E31E2B] focus:bg-white transition-colors cursor-pointer"
                      >
                        <option value="75%+ (First Class Distinction)">75%+ (Distinction)</option>
                        <option value="60% - 75% (First Class)">60% - 75% (1st Class)</option>
                        <option value="50% - 60% (Eligible Minimum)">50% - 60% (Eligible)</option>
                        <option value="Final Year Appearing">Final Year Appearing</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-gray-800 block mb-1">
                        Target Total Budget
                      </label>
                      <select
                        value={matcherBudget}
                        onChange={(e) => setMatcherBudget(e.target.value)}
                        className="w-full text-xs font-semibold px-3 py-2.5 rounded-xl bg-gray-50 border border-gray-200 outline-none focus:border-[#E31E2B] focus:bg-white transition-colors cursor-pointer"
                      >
                        <option value="Under ₹10 Lakhs (High ROI)">Under ₹10 Lakhs</option>
                        <option value="₹10L - ₹18L (Top Private)">₹10L - ₹18L</option>
                        <option value="₹18L - ₹28L (Tier 1 B-Schools)">₹18L - ₹28L</option>
                        <option value="₹28L+ (IIMs / ISB / XLRI)">₹28L+ (Premier)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-gray-800 block mb-1">
                      Preferred Specialization
                    </label>
                    <select
                      value={matcherSpec}
                      onChange={(e) => setMatcherSpec(e.target.value)}
                      className="w-full text-xs font-semibold px-3 py-2.5 rounded-xl bg-gray-50 border border-gray-200 outline-none focus:border-[#E31E2B] focus:bg-white transition-colors cursor-pointer"
                    >
                      <option value="Finance & Fintech">Finance &amp; Fintech</option>
                      <option value="Marketing & Digital Strategy">Marketing &amp; Digital Strategy</option>
                      <option value="Business Analytics & AI">Business Analytics &amp; AI</option>
                      <option value="Operations & Supply Chain">Operations &amp; Supply Chain</option>
                      <option value="Human Resources (HR)">Human Resources (HR)</option>
                      <option value="International Business">International Business</option>
                    </select>
                  </div>

                  <button
                    onClick={() =>
                      openModal(
                        `MBA Matcher: ${matcherExam} | Budget: ${matcherBudget} | Spec: ${matcherSpec}`
                      )
                    }
                    className="w-full mt-2 bg-[#E31E2B] hover:bg-[#c91824] text-white py-3 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer"
                  >
                    <Compass className="w-4 h-4" />
                    <span>Get Shortlist for {matcherBudget}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <div className="flex items-center justify-center gap-1.5 text-[10px] font-semibold text-gray-500 pt-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>100% Free Consultation • Verified Cutoffs &amp; Fee Structures</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 2. MBA VS PGDM: CLARITY & DECISION MATRIX */}
      {/* ======================================================== */}
      <section className="py-10 sm:py-16 bg-white border-b border-[#E7E9F0]">
        <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-12">
            <span className="text-[#E31E2B] font-bold text-xs uppercase tracking-wider block mb-1">
              — Critical Clarity for Aspirants
            </span>
            <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#15182D] tracking-tight">
              MBA vs PGDM: What is the Real Difference?
            </h2>
            <p className="text-xs sm:text-sm text-[#687086] mt-2">
              Demystifying the degree vs diploma confusion so you can choose the optimal career accelerator.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {/* MBA Card */}
            <div className="tactile-card rounded-2xl p-5 sm:p-7 bg-[#F7F8FC] border border-[#E7E9F0]">
              <div className="flex items-center justify-between mb-4">
                <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-bold">
                  University Degree
                </span>
                <span className="text-xs font-bold text-[#687086]">UGC Recognized</span>
              </div>
              <h3 className="font-display text-xl font-extrabold text-[#15182D] mb-2">
                MBA (Master of Business Administration)
              </h3>
              <p className="text-xs sm:text-sm text-[#687086] leading-relaxed mb-4">
                Conferred directly by recognized universities (e.g. FMS Delhi, NMIMS, KIIT, Symbiosis). Follows a formal university exam syllabus and structured credit semester framework.
              </p>
              <ul className="space-y-2.5 text-xs text-[#15182D] font-medium border-t border-gray-200/80 pt-4">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>Accreditation:</strong> Conferred by UGC approved universities.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>Curriculum:</strong> High theoretical depth with structured semester exams.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>Academic Value:</strong> Direct eligibility for government posts and Ph.D abroad.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>Fees Range:</strong> ₹2.5 Lakhs (FMS) to ₹26.8 Lakhs (SIBM Pune).</span>
                </li>
              </ul>
            </div>

            {/* PGDM Card */}
            <div className="tactile-card rounded-2xl p-5 sm:p-7 bg-red-50/30 border border-red-200">
              <div className="flex items-center justify-between mb-4">
                <span className="px-3 py-1 rounded-full bg-red-100 text-[#E31E2B] text-xs font-bold">
                  Autonomous Industry Diploma
                </span>
                <span className="text-xs font-bold text-[#E31E2B]">AICTE + AIU Equivalence</span>
              </div>
              <h3 className="font-display text-xl font-extrabold text-[#15182D] mb-2">
                PGDM (Post Graduate Diploma in Management)
              </h3>
              <p className="text-xs sm:text-sm text-[#687086] leading-relaxed mb-4">
                Offered by autonomous premier institutes (e.g. XLRI, IIMs historically, SPJIMR, Great Lakes, BIMTECH). Dynamic curriculum updated annually by corporate board members.
              </p>
              <ul className="space-y-2.5 text-xs text-[#15182D] font-medium border-t border-red-200/60 pt-4">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#E31E2B] shrink-0 mt-0.5" />
                  <span><strong>Accreditation:</strong> Approved by AICTE, with AIU granting full MBA degree status.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#E31E2B] shrink-0 mt-0.5" />
                  <span><strong>Curriculum:</strong> Harvard business case studies, live simulations, industry immersion.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#E31E2B] shrink-0 mt-0.5" />
                  <span><strong>Corporate Standing:</strong> McKinsey, BCG, Amazon, and Unilever treat MBA & PGDM identically.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#E31E2B] shrink-0 mt-0.5" />
                  <span><strong>Placement Impact:</strong> Often commands equal or higher median compensation.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 3. B-SCHOOL DIRECTORY & INTERACTIVE FILTERABLE CATALOG */}
      {/* ======================================================== */}
      <section id="colleges-directory" className="py-10 sm:py-16 lg:py-20 max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4 border-b border-[#E7E9F0] pb-5">
          <div>
            <span className="text-[#E31E2B] font-bold text-xs uppercase tracking-wider block mb-1">
              — Verified B-School Catalog 2026–2028
            </span>
            <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#15182D] tracking-tight">
              Top MBA & PGDM Colleges in India
            </h2>
            <p className="text-xs sm:text-sm text-[#687086] mt-1.5 max-w-2xl">
              Compare institutional rankings, real audited median CTCs, total academic fees, and direct merit counselling options.
            </p>
          </div>

          <button
            onClick={() => openModal("MBA Colleges Shortlisting Assistance")}
            className="tactile-pill inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold text-[#E31E2B] hover:bg-red-50 transition-colors"
          >
            <span>Need Personalised Shortlist?</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Filter Toolbar */}
        <div className="tactile-card rounded-2xl p-3 sm:p-4 bg-white border border-[#E7E9F0] mb-8 space-y-3">
          {/* Top Row: Search and Tier Tabs */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                placeholder="Search by college name, exam (CAT, XAT, NMAT), or specialization..."
                className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-[#F7F8FC] rounded-xl border border-[#E7E9F0] outline-none focus:border-[#E31E2B]"
              />
            </div>

            {/* Region Selector */}
            <div className="flex items-center gap-2">
              <Filter className="w-3.5 h-3.5 text-[#E31E2B]" />
              <span className="text-xs font-bold text-[#15182D] shrink-0">Region:</span>
              <select
                value={selectedRegion}
                onChange={(e) => setSelectedRegion(e.target.value)}
                className="text-xs font-semibold px-2.5 py-2 rounded-xl bg-[#F7F8FC] border border-[#E7E9F0] outline-none"
              >
                <option value="All">All India</option>
                <option value="Delhi NCR">Delhi NCR</option>
                <option value="Mumbai & West">Mumbai & West</option>
                <option value="Bangalore & South">Bangalore & South</option>
                <option value="East & Bhubaneswar">East & Bhubaneswar</option>
              </select>
            </div>
          </div>

          {/* Tier Pills */}
          <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-gray-100">
            <span className="text-[11px] font-bold text-[#687086] mr-1">Category:</span>
            {["All", "Tier 1 Dream", "Top Private", "Direct Merit / High ROI"].map((tier) => (
              <button
                key={tier}
                onClick={() => setSelectedTier(tier)}
                className={cn(
                  "px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer",
                  selectedTier === tier
                    ? "bg-[#171B52] text-white"
                    : "bg-[#F7F8FC] text-[#687086] hover:text-[#15182D] border border-gray-200"
                )}
              >
                {tier} {tier === "All" ? `(${TOP_BSCHOOLS.length})` : ""}
              </button>
            ))}
          </div>
        </div>

        {/* Colleges Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {filteredColleges.map((college) => (
            <div
              key={college.id}
              className="rounded-2xl sm:rounded-3xl overflow-hidden bg-white border border-[#E7E9F0] hover:border-gray-400 transition-colors flex flex-col justify-between group"
            >
              <div>
                {/* College Card Image */}
                <div className="relative h-44 w-full bg-slate-900 overflow-hidden">
                  <Image
                    src={college.image}
                    alt={college.name}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover opacity-90"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-black/20" />

                  {/* Badges on Image */}
                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wide bg-white/90 backdrop-blur-xs text-[#15182D]">
                      {college.tier}
                    </span>

                    {college.directMeritEligible && (
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-emerald-600 text-white flex items-center gap-1">
                        <Check className="w-3 h-3 stroke-[3]" />
                        Direct Merit Available
                      </span>
                    )}
                  </div>

                  <div className="absolute bottom-3 left-3 right-3 text-white">
                    <div className="flex items-center gap-1.5 text-xs text-slate-200 mb-0.5">
                      <MapPin className="w-3.5 h-3.5 text-[#E31E2B] shrink-0" />
                      <span className="truncate">{college.location}</span>
                    </div>
                  </div>
                </div>

                {/* College Info Body */}
                <div className="p-4 sm:p-5 space-y-3">
                  <div>
                    <div className="flex items-center gap-2 text-[11px] font-bold text-[#E31E2B] mb-1">
                      <span>{college.nirfRank || "Top Ranked"}</span>
                      <span>•</span>
                      <span className="text-[#687086] truncate">{college.accreditation}</span>
                    </div>

                    <h3 className="font-display text-base sm:text-lg font-extrabold text-[#15182D] leading-snug line-clamp-2">
                      {college.name}
                    </h3>
                  </div>

                  {/* 2 Stats Box: Average CTC & Total Fees */}
                  <div className="grid grid-cols-2 gap-2 p-2.5 rounded-xl bg-[#F7F8FC] border border-[#E7E9F0]">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-[#687086] block">
                        Average Package
                      </span>
                      <span className="text-xs sm:text-sm font-extrabold text-emerald-700">
                        {college.avgPackage}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-[#687086] block">
                        Total Course Fees
                      </span>
                      <span className="text-xs sm:text-sm font-extrabold text-[#15182D]">
                        {college.fees}
                      </span>
                    </div>
                  </div>

                  {/* Exams Accepted */}
                  <div>
                    <span className="text-[11px] font-bold text-[#687086] block mb-1">
                      Exams Accepted:
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {college.exams.map((exam) => (
                        <span
                          key={exam}
                          className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-gray-100 text-[#15182D]"
                        >
                          {exam}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Specializations Pills */}
                  <div>
                    <span className="text-[11px] font-bold text-[#687086] block mb-1">
                      Key Streams:
                    </span>
                    <p className="text-xs text-[#475569] line-clamp-1">
                      {college.specializations.join(" • ")}
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="p-4 sm:p-5 pt-0 grid grid-cols-2 gap-2">
                <button
                  onClick={() => openModal(`MBA Cutoff Inquiry: ${college.name}`)}
                  className="tactile-pill py-2.5 rounded-xl text-xs font-bold text-[#15182D] hover:text-[#E31E2B] transition-colors flex items-center justify-center gap-1 border border-[#E7E9F0]"
                >
                  <span>Check Cutoff</span>
                </button>

                <button
                  onClick={() => openModal(`Apply for MBA / PGDM: ${college.name}`)}
                  className="tactile-btn-red py-2.5 rounded-xl text-xs font-bold text-white flex items-center justify-center gap-1"
                >
                  <span>Apply Now</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {filteredColleges.length === 0 && (
          <div className="text-center py-12 bg-white rounded-2xl border border-gray-200">
            <p className="text-sm font-bold text-gray-700">No B-Schools match your selected filters.</p>
            <button
              onClick={() => {
                setSelectedTier("All");
                setSelectedRegion("All");
                setSearchFilter("");
              }}
              className="mt-2 text-xs font-bold text-[#E31E2B] hover:underline"
            >
              Reset all filters
            </button>
          </div>
        )}
      </section>

      {/* ======================================================== */}
      {/* 4. IN-DEMAND MBA SPECIALIZATIONS IN 2026–2028 */}
      {/* ======================================================== */}
      <section className="py-10 sm:py-16 bg-white border-y border-[#E7E9F0]">
        <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-12">
            <span className="text-[#E31E2B] font-bold text-xs uppercase tracking-wider block mb-1">
              — Career Trajectory Insights
            </span>
            <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#15182D] tracking-tight">
              Top In-Demand MBA / PGDM Specializations
            </h2>
            <p className="text-xs sm:text-sm text-[#687086] mt-2">
              Choose the specialization aligned with your strengths, future salary potential, and dream recruiters.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {SPECIALIZATIONS.map((spec) => (
              <div
                key={spec.title}
                className="rounded-2xl p-5 sm:p-6 bg-[#F7F8FC] border border-[#E7E9F0] hover:border-[#E31E2B]/40 hover:bg-white transition-colors flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-red-100 text-[#E31E2B]">
                      {spec.demand} Demand
                    </span>
                    <span className="text-xs font-black text-emerald-700">{spec.salary}</span>
                  </div>

                  <h3 className="font-display text-lg font-extrabold text-[#15182D] mb-2">
                    {spec.title}
                  </h3>

                  <p className="text-xs text-[#687086] leading-relaxed mb-4">{spec.desc}</p>

                  <div className="space-y-2 border-t border-gray-200/80 pt-3">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-[#15182D] block">
                        Popular Roles:
                      </span>
                      <p className="text-xs text-[#475569] font-medium">
                        {spec.roles.slice(0, 3).join(" • ")}
                      </p>
                    </div>

                    <div>
                      <span className="text-[10px] uppercase font-bold text-[#15182D] block">
                        Top Recruiters:
                      </span>
                      <p className="text-xs text-[#475569] font-medium">
                        {spec.recruiters.slice(0, 4).join(", ")}
                      </p>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => openModal(`MBA Specialization Counselling: ${spec.title}`)}
                  className="mt-4 pt-3 border-t border-gray-200/60 w-full text-xs font-bold text-[#E31E2B] flex items-center justify-between group cursor-pointer"
                >
                  <span>Explore B-Schools for {spec.title.split(" ")[0]}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 5. ENTRANCE EXAMS & CUTOFFS CALENDAR */}
      {/* ======================================================== */}
      <section className="py-10 sm:py-16 max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4 border-b border-[#E7E9F0] pb-5">
          <div>
            <span className="text-[#E31E2B] font-bold text-xs uppercase tracking-wider block mb-1">
              — National Entrance Exams Tracker
            </span>
            <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#15182D] tracking-tight">
              MBA Entrance Exams & Target Cutoffs
            </h2>
            <p className="text-xs sm:text-sm text-[#687086] mt-1.5 max-w-2xl">
              Track deadlines, exam conducting bodies, and expected cutoff scores for premier B-School admissions.
            </p>
          </div>

          <button
            onClick={() => openModal("MBA Entrance Exam Guidance")}
            className="tactile-pill inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold text-[#15182D] hover:text-[#E31E2B]"
          >
            <span>Download Exam Cutoff PDF</span>
            <ArrowDownToLineIcon className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Exams Table */}
        <div className="rounded-2xl sm:rounded-3xl overflow-hidden border border-[#E7E9F0] bg-white overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#171B52] text-white">
                <th className="p-3.5 sm:p-4 font-bold text-xs">Entrance Exam</th>
                <th className="p-3.5 sm:p-4 font-bold text-xs">Conducting Body</th>
                <th className="p-3.5 sm:p-4 font-bold text-xs">Timeline</th>
                <th className="p-3.5 sm:p-4 font-bold text-xs">Target Cutoff Percentile</th>
                <th className="p-3.5 sm:p-4 font-bold text-xs">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-medium">
              {EXAMS_DATA.map((item, idx) => (
                <tr key={idx} className="hover:bg-red-50/20 transition-colors">
                  <td className="p-3.5 sm:p-4 font-extrabold text-[#15182D]">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-[#E31E2B] shrink-0" />
                      <span>{item.exam}</span>
                    </div>
                  </td>
                  <td className="p-3.5 sm:p-4 text-[#475569]">{item.conductor}</td>
                  <td className="p-3.5 sm:p-4 text-[#15182D] font-bold">{item.period}</td>
                  <td className="p-3.5 sm:p-4 font-semibold text-emerald-800">
                    {item.targetCutoff}
                  </td>
                  <td className="p-3.5 sm:p-4">
                    <button
                      onClick={() => openModal(`Exam Advisory: ${item.exam}`)}
                      className="text-[#E31E2B] font-bold hover:underline flex items-center gap-1"
                    >
                      <span>Check Colleges</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 6. PROFILE-BASED & DIRECT MERIT BLUEPRINT */}
      {/* ======================================================== */}
      <section className="py-10 sm:py-16 bg-[#171B52] text-white">
        <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-4">
              <span className="inline-block px-3 py-1 rounded-full bg-red-600/30 text-red-300 text-xs font-bold uppercase tracking-wider">
                Direct Merit & Profile Evaluation
              </span>
              <h2 className="font-display text-2xl sm:text-4xl font-extrabold leading-tight">
                Didn&apos;t Score 95+ in CAT? Don&apos;t Lose an Academic Year.
              </h2>
              <p className="text-xs sm:text-base text-slate-300 leading-relaxed max-w-2xl">
                Premier private & state universities reserve 15% to 30% seats for academic diversity, exceptional non-engineers, work-experience professionals, and direct institutional merit.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="p-3.5 rounded-xl bg-white/10 border border-white/15">
                  <div className="font-extrabold text-sm text-red-400 mb-1">
                    Profile-Based Shortlisting
                  </div>
                  <p className="text-xs text-slate-300">
                    Heavy weightage given to 10th, 12th, graduation consistency & corporate internships.
                  </p>
                </div>
                <div className="p-3.5 rounded-xl bg-white/10 border border-white/15">
                  <div className="font-extrabold text-sm text-red-400 mb-1">
                    Free GD-PI Mentoring
                  </div>
                  <p className="text-xs text-slate-300">
                    Mock interviews and resume grooming conducted by senior IIM and XLRI alumni.
                  </p>
                </div>
                <div className="p-3.5 rounded-xl bg-white/10 border border-white/15">
                  <div className="font-extrabold text-sm text-red-400 mb-1">
                    Scholarship Access
                  </div>
                  <p className="text-xs text-slate-300">
                    Direct qualification for institutional tuition fee waivers up to ₹5,00,000.
                  </p>
                </div>
                <div className="p-3.5 rounded-xl bg-white/10 border border-white/15">
                  <div className="font-extrabold text-sm text-red-400 mb-1">
                    100% Zero-Donation Guarantee
                  </div>
                  <p className="text-xs text-slate-300">
                    Official sanctioned allotment with transparent fee receipts directly in college accounts.
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Consultation Trigger on Navy Background */}
            <div className="lg:col-span-5">
              <div className="p-6 sm:p-8 rounded-3xl bg-white text-[#15182D] border border-gray-200 space-y-4">
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#E31E2B] block">
                    Fast-Track Advisory
                  </span>
                  <h3 className="font-display text-xl font-black">
                    Book 1-on-1 MBA Mentor Call
                  </h3>
                  <p className="text-xs text-[#687086] mt-0.5">
                    Speak directly with our senior management admissions counselor today.
                  </p>
                </div>

                <div className="space-y-2.5 text-xs">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Personalized college shortlist within your budget</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>GD-PI &amp; WAT prep tips for upcoming interview calls</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Instant loan pre-approval assistance</span>
                  </div>
                </div>

                <button
                  onClick={() => openModal("1-on-1 MBA Direct Admission Call")}
                  className="w-full bg-[#E31E2B] hover:bg-[#c91824] text-white py-3 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <PhoneCall className="w-4 h-4" />
                  <span>Connect with MBA Counselor Now</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 7. DEDICATED INLINE ADMISSION ENQUIRY FORM */}
      {/* ======================================================== */}
      <section className="py-10 sm:py-16 bg-[#F8FAFC] border-b border-[#E7E9F0]">
        <div className="max-w-[800px] mx-auto px-4 sm:px-6">
          <div className="rounded-2xl sm:rounded-3xl p-6 sm:p-10 bg-white border border-[#E7E9F0]">
            <div className="text-center mb-6">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#E31E2B] block mb-1">
                Official Admission Desk
              </span>
              <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-[#15182D]">
                Apply for MBA / PGDM Counselling 2026–28
              </h2>
              <p className="text-xs sm:text-sm text-[#687086] mt-1.5">
                Submit your profile for instant seat allotment checks and verified cutoff guidance.
              </p>
            </div>

            {isSubmitted ? (
              <SubmissionSuccessView
                title="Thank You!"
                quote="Your MBA profile has been received. Our senior admissions mentor will reach out to you shortly."
                onReset={() => setIsSubmitted(false)}
                whatsappMessage={`Hello Aspirant Vision, I just submitted my MBA profile evaluation inquiry.`}
              />
            ) : (
              <form onSubmit={handleLeadSubmit} className="space-y-4">
                {formError && (
                  <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 font-semibold">
                    {formError}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="text-xs font-bold text-[#15182D] block mb-1">
                      Full Name <span className="text-[#E31E2B]">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Rahul Sharma"
                      value={leadForm.name}
                      onChange={(e) => setLeadForm({ ...leadForm, name: e.target.value })}
                      className="w-full text-xs font-semibold px-3.5 py-2.5 rounded-xl bg-[#F7F8FC] border border-[#E7E9F0] outline-none focus:border-[#E31E2B]"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-[#15182D] block mb-1">
                      Mobile Number (WhatsApp) <span className="text-[#E31E2B]">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      pattern="[0-9]{10}"
                      placeholder="10-digit mobile number"
                      value={leadForm.phone}
                      onChange={(e) => setLeadForm({ ...leadForm, phone: e.target.value })}
                      className="w-full text-xs font-semibold px-3.5 py-2.5 rounded-xl bg-[#F7F8FC] border border-[#E7E9F0] outline-none focus:border-[#E31E2B]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="text-xs font-bold text-[#15182D] block mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      placeholder="name@example.com"
                      value={leadForm.email}
                      onChange={(e) => setLeadForm({ ...leadForm, email: e.target.value })}
                      className="w-full text-xs font-semibold px-3.5 py-2.5 rounded-xl bg-[#F7F8FC] border border-[#E7E9F0] outline-none focus:border-[#E31E2B]"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-[#15182D] block mb-1">
                      Current City / State <span className="text-[#E31E2B]">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Bhubaneswar, Odisha"
                      value={leadForm.city}
                      onChange={(e) => setLeadForm({ ...leadForm, city: e.target.value })}
                      className="w-full text-xs font-semibold px-3.5 py-2.5 rounded-xl bg-[#F7F8FC] border border-[#E7E9F0] outline-none focus:border-[#E31E2B]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="text-xs font-bold text-[#15182D] block mb-1">
                      Target Exam
                    </label>
                    <select
                      value={leadForm.targetExam}
                      onChange={(e) => setLeadForm({ ...leadForm, targetExam: e.target.value })}
                      className="w-full text-xs font-semibold px-3.5 py-2.5 rounded-xl bg-[#F7F8FC] border border-[#E7E9F0] outline-none"
                    >
                      <option value="CAT / XAT / CMAT">CAT / XAT / CMAT</option>
                      <option value="NMAT / SNAP">NMAT / SNAP</option>
                      <option value="MAT / ATMA">MAT / ATMA</option>
                      <option value="Direct Merit / Non-CAT">Direct Merit / Non-CAT</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-[#15182D] block mb-1">
                      Target Specialization
                    </label>
                    <select
                      value={leadForm.preferredSpecialization}
                      onChange={(e) =>
                        setLeadForm({ ...leadForm, preferredSpecialization: e.target.value })
                      }
                      className="w-full text-xs font-semibold px-3.5 py-2.5 rounded-xl bg-[#F7F8FC] border border-[#E7E9F0] outline-none"
                    >
                      <option value="Finance & Fintech">Finance & Fintech</option>
                      <option value="Marketing & Digital Strategy">Marketing & Digital Strategy</option>
                      <option value="Business Analytics & AI">Business Analytics & AI</option>
                      <option value="Operations & Supply Chain">Operations & Supply Chain</option>
                      <option value="Human Resources (HR)">Human Resources (HR)</option>
                      <option value="General Management">General Management</option>
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-[#E31E2B] hover:bg-[#c91824] text-white py-3 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-colors mt-2 cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Submitting Admission Request...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Submit Profile for Instant Evaluation</span>
                    </>
                  )}
                </button>

                <p className="text-[10px] text-center text-[#687086] pt-1">
                  By clicking submit, you agree to receive personalized MBA admission updates and cutoff insights. No spam, ever.
                </p>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 8. FREQUENTLY ASKED QUESTIONS (ACCORDION) */}
      {/* ======================================================== */}
      <section className="py-10 sm:py-16 max-w-[1000px] mx-auto px-4 sm:px-6">
        <div className="text-center mb-8 sm:mb-12">
          <span className="text-[#E31E2B] font-bold text-xs uppercase tracking-wider block mb-1">
            — Got Questions?
          </span>
          <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-[#15182D]">
            Frequently Asked Questions
          </h2>
          <p className="text-xs sm:text-sm text-[#687086] mt-1.5">
            Everything you need to know about MBA &amp; PGDM admissions, fees, and eligibility.
          </p>
        </div>

        <div className="space-y-3">
          {FAQS.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div
                key={idx}
                className="rounded-2xl border border-[#E7E9F0] bg-white overflow-hidden transition-all"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 font-display font-extrabold text-xs sm:text-base text-[#15182D] hover:text-[#E31E2B] transition-colors"
                >
                  <span>{faq.q}</span>
                  {isOpen ? (
                    <ChevronUp className="w-4 h-4 text-[#E31E2B] shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-[#687086] shrink-0" />
                  )}
                </button>

                {isOpen && (
                  <div className="px-4 sm:px-5 pb-4 sm:pb-5 text-xs sm:text-sm text-[#475569] leading-relaxed border-t border-gray-100 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* ======================================================== */}
      {/* 9. BOTTOM CONVERSION FOOTER BANNER */}
      {/* ======================================================== */}
      <section className="bg-gradient-to-r from-[#171B52] to-[#0A0D2C] text-white py-12 sm:py-16">
        <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <span className="px-3 py-1 rounded-full bg-red-600/30 text-red-300 text-xs font-bold uppercase tracking-wider">
            2,500+ Students Successfully Placed
          </span>
          <h2 className="font-display text-2xl sm:text-4xl font-black max-w-2xl mx-auto leading-tight">
            Take the First Confident Step Towards Your Dream B-School
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto">
            Book a complimentary session with certified senior academic counselors and get your tailored cutoff and fee structure report today.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-3">
            <button
              onClick={() => openModal("MBA Fast-Track Application 2026")}
              className="bg-[#E31E2B] hover:bg-[#c91824] text-white px-8 py-3 rounded-full font-bold text-xs sm:text-sm flex items-center gap-2 transition-colors cursor-pointer"
            >
              <GraduationCap className="w-4 h-4" />
              <span>Apply for 2026–28 Batch Now</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <a
              href="https://wa.me/919876543210?text=Hello%20Aspirant%20Vision,%20I%20am%20looking%20for%20MBA%20PGDM%20admissions%20in%20top%20colleges."
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 rounded-full font-bold text-xs sm:text-sm text-white bg-emerald-600 hover:bg-emerald-700 transition-colors flex items-center gap-2"
            >
              <MessageSquare className="w-4 h-4" />
              <span>WhatsApp an MBA Mentor</span>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}

function ArrowDownToLineIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
      />
    </svg>
  );
}
