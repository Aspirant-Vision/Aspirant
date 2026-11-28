export interface DisciplineMeta {
  typeKey: string;
  badge: string;
  titlePrefix: string;
  highlightedText: string;
  titleSuffix: string;
  description: string;
  image: string;
  showcaseTag1: string;
  showcaseTag2: string;
  captionTitle: string;
  captionSubtitle: string;
  trustBadge1: string;
  trustBadge2: string;
  trustBadge3: string;
  metric1Value: string;
  metric1Label: string;
  metric2Value: string;
  metric2Label: string;
  metric3Value: string;
  metric3Label: string;
}

export const COLLEGE_DISCIPLINES: Record<string, DisciplineMeta> = {
  medical: {
    typeKey: "Medical",
    badge: "NMC & DCI ACCREDITED DIRECTORY",
    titlePrefix: "Discover Top",
    highlightedText: "Medical & Dental Colleges",
    titleSuffix: "in India",
    description:
      "Explore premier NMC & DCI accredited MBBS, BDS, and Allied Health institutions with verified teaching hospital beds, clinical patient footfall, and official NEET UG counselling support.",
    image: "/images/disciplines/medical.jpg",
    showcaseTag1: "🩺 Medical & Healthcare",
    showcaseTag2: "NMC & DCI Approved",
    captionTitle: "AIIMS, Government & Premier Medical Colleges",
    captionSubtitle: "MBBS, BDS, Super-Speciality Hospitals & Clinical Intakes",
    trustBadge1: "NMC & DCI Recognized",
    trustBadge2: "1,000+ Bed Teaching Hospitals",
    trustBadge3: "Zero Hidden Donation",
    metric1Value: "340+",
    metric1Label: "Verified Medical Colleges",
    metric2Value: "100%",
    metric2Label: "Affiliated Teaching Hospitals",
    metric3Value: "NEET UG",
    metric3Label: "Cutoff Analytics & Support",
  },
  engineering: {
    typeKey: "Engineering",
    badge: "AICTE & NBA ACCREDITED DIRECTORY",
    titlePrefix: "Discover Top",
    highlightedText: "Engineering & B.Tech Colleges",
    titleSuffix: "in India",
    description:
      "Explore premier IITs, NITs, and top autonomous engineering institutes with verified placement packages, cutting-edge robotics/AI labs, and JEE / State CET cutoffs.",
    image: "/images/disciplines/engineering.jpg",
    showcaseTag1: "⚙️ Engineering & Technology",
    showcaseTag2: "AICTE & NBA Approved",
    captionTitle: "IITs, NITs, BITS & Top Autonomous Tech Campuses",
    captionSubtitle: "B.Tech Computer Science, AI, Robotics & Core Engineering",
    trustBadge1: "Govt & AICTE Approved",
    trustBadge2: "₹1.15 Cr Highest Tech CTC",
    trustBadge3: "NBA Accredited Labs",
    metric1Value: "1,200+",
    metric1Label: "Verified Tech Campuses",
    metric2Value: "₹1.15 Cr",
    metric2Label: "Highest CTC Placement",
    metric3Value: "94%",
    metric3Label: "Avg Tech Placement Rate",
  },
  management: {
    typeKey: "Management",
    badge: "AICTE & AACSB ACCREDITED DIRECTORY",
    titlePrefix: "Discover Top",
    highlightedText: "Management & B-Schools",
    titleSuffix: "in India",
    description:
      "Explore premier IIMs, XLRI, and top AICTE & AACSB approved business schools with verified average CTC packages and CAT / XAT / CMAT merit seat allocations.",
    image: "/images/disciplines/management.jpg",
    showcaseTag1: "💼 Management & Business",
    showcaseTag2: "AACSB & AICTE Approved",
    captionTitle: "IIMs, ISB, SIBM & Top Autonomous B-Schools",
    captionSubtitle: "MBA, PGDM, Executive Management & Global Business Intakes",
    trustBadge1: "AICTE & AACSB Approved",
    trustBadge2: "Audited Placement Records",
    trustBadge3: "Merit Profile Evaluation",
    metric1Value: "450+",
    metric1Label: "Verified B-Schools Pan-India",
    metric2Value: "₹34.8 LPA",
    metric2Label: "Avg Tier-1 Management CTC",
    metric3Value: "100%",
    metric3Label: "Summer & Final Placements",
  },
  law: {
    typeKey: "Law",
    badge: "BCI ACCREDITED DIRECTORY",
    titlePrefix: "Discover Top",
    highlightedText: "Law Universities & NLUs",
    titleSuffix: "in India",
    description:
      "Explore Bar Council of India (BCI) approved National Law Universities and premier law faculties with verified moot court chambers and judicial placement records.",
    image: "/images/disciplines/law.jpg",
    showcaseTag1: "⚖️ Law & Legal Studies",
    showcaseTag2: "BCI Approved",
    captionTitle: "NLUs & Premier Constitutional Law Faculties",
    captionSubtitle: "BA LLB, BBA LLB, LLM & Corporate Legal Specializations",
    trustBadge1: "BCI Approved Institutions",
    trustBadge2: "Moot Courts & Legal Clinics",
    trustBadge3: "CLAT & AILET Guidance",
    metric1Value: "180+",
    metric1Label: "Approved Law Universities",
    metric2Value: "100%",
    metric2Label: "BCI Regulated Curricula",
    metric3Value: "Top NLUs",
    metric3Label: "Judicial & Corporate Law",
  },
  pharmacy: {
    typeKey: "Pharmacy",
    badge: "PCI ACCREDITED DIRECTORY",
    titlePrefix: "Discover Top",
    highlightedText: "Pharmacy & Pharma Colleges",
    titleSuffix: "in India",
    description:
      "Explore Pharmacy Council of India (PCI) approved institutions with advanced formulation research labs, industrial drug design training, and GPAT counselling.",
    image: "/images/disciplines/pharmacy.jpg",
    showcaseTag1: "💊 Pharmacy & Research",
    showcaseTag2: "PCI Approved",
    captionTitle: "Top Pharmaceutical Science Institutes",
    captionSubtitle: "B.Pharm, M.Pharm, Pharm.D & Clinical Pharmacy Intakes",
    trustBadge1: "PCI Recognized Labs",
    trustBadge2: "Industrial R&D Tie-Ups",
    trustBadge3: "GPAT Merit Advisory",
    metric1Value: "260+",
    metric1Label: "Approved Pharmacy Colleges",
    metric2Value: "100%",
    metric2Label: "PCI Regulated Standards",
    metric3Value: "R&D Intakes",
    metric3Label: "Formulation & Clinical Trial",
  },
  design: {
    typeKey: "Design & Media",
    badge: "CREATIVE & DESIGN DIRECTORY",
    titlePrefix: "Discover Top",
    highlightedText: "Design & Media Institutes",
    titleSuffix: "in India",
    description:
      "Explore premier design studios, architecture colleges, and mass media academies with verified portfolio requirements, design labs, and creative industry internships.",
    image: "/images/disciplines/design.jpg",
    showcaseTag1: "🎨 Design & Creative Arts",
    showcaseTag2: "CoA & UGC Approved",
    captionTitle: "Premier Design, Fashion & Architecture Academies",
    captionSubtitle: "B.Des, B.Arch, UI/UX, Animation & Media Communications",
    trustBadge1: "CoA & UGC Approved",
    trustBadge2: "State-of-the-Art Studios",
    trustBadge3: "Portfolio Review Advisory",
    metric1Value: "150+",
    metric1Label: "Design & Media Campuses",
    metric2Value: "100%",
    metric2Label: "Studio-Based Training",
    metric3Value: "UCEED / NATA",
    metric3Label: "Cutoff & Portfolio Support",
  },
};

export const DEFAULT_COLLEGE_DISCIPLINE: DisciplineMeta = {
  typeKey: "All",
  badge: "VERIFIED INSTITUTIONAL DIRECTORY",
  titlePrefix: "Discover India's",
  highlightedText: "Premier Colleges",
  titleSuffix: "& Universities",
  description:
    "Explore accredited institutions with verified NIRF rankings, NAAC A++ grades, verified placement packages, and ethical direct merit counselling assistance.",
  image: "/images/auth/auth_campus_highres.jpg",
  showcaseTag1: "🏛️ Verified Campuses",
  showcaseTag2: "NIRF & NAAC A++",
  captionTitle: "IITs, IIMs, BITS, AIIMS & Top Autonomous Campuses",
  captionSubtitle: "Audited cutoffs, genuine placement packages & direct counselling",
  trustBadge1: "Govt & AICTE Approved",
  trustBadge2: "Audited Placement Records",
  trustBadge3: "Zero Hidden Fees",
  metric1Value: "2,500+",
  metric1Label: "Verified Colleges Pan-India",
  metric2Value: "₹1.15 Cr",
  metric2Label: "Highest CTC Top Placement",
  metric3Value: "100%",
  metric3Label: "Direct Merit Assistance",
};

export function getCollegeDisciplineMeta(type?: string | null): DisciplineMeta {
  if (!type || type.toLowerCase() === "all") {
    return DEFAULT_COLLEGE_DISCIPLINE;
  }
  const clean = type.toLowerCase().trim();
  if (clean.includes("medic") || clean.includes("dental") || clean.includes("health") || clean.includes("nurs")) {
    return COLLEGE_DISCIPLINES.medical;
  }
  if (clean.includes("engine") || clean.includes("tech") || clean.includes("polytechnic")) {
    return COLLEGE_DISCIPLINES.engineering;
  }
  if (clean.includes("manage") || clean.includes("mba") || clean.includes("bba") || clean.includes("business")) {
    return COLLEGE_DISCIPLINES.management;
  }
  if (clean.includes("law") || clean.includes("legal")) {
    return COLLEGE_DISCIPLINES.law;
  }
  if (clean.includes("pharm")) {
    return COLLEGE_DISCIPLINES.pharmacy;
  }
  if (clean.includes("design") || clean.includes("media") || clean.includes("art")) {
    return COLLEGE_DISCIPLINES.design;
  }
  return DEFAULT_COLLEGE_DISCIPLINE;
}

export function getCourseDisciplineMeta(category?: string | null): DisciplineMeta {
  if (!category || category.toLowerCase() === "all") {
    return {
      ...DEFAULT_COLLEGE_DISCIPLINE,
      badge: "VERIFIED DEGREE & SPECIALIZATION CATALOG",
      titlePrefix: "Explore India's",
      highlightedText: "Flagship Programs",
      titleSuffix: "& Specializations",
      description:
        "Discover accredited degree programs with verified UGC & AICTE compliant syllabi, entrance exam requirements, duration benchmarks, and participating campus intakes.",
      image: "/images/auth/campus_library.jpg",
      showcaseTag1: "📚 Degree Catalog",
      showcaseTag2: "UGC & AICTE Approved",
      captionTitle: "Engineering, Medical, Management, Law & Tech",
      captionSubtitle: "Verified duration, eligibility requirements & direct intake counselling",
      trustBadge1: "AICTE & UGC Compliant Curricula",
      trustBadge2: "Multi-Campus Verified Intakes",
      trustBadge3: "Free Academic Advisory",
      metric1Value: "150+",
      metric1Label: "Accredited Curricula",
      metric2Value: "10,000+",
      metric2Label: "Course Specializations",
      metric3Value: "100%",
      metric3Label: "Verified Admission Paths",
    };
  }

  const clean = category.toLowerCase().trim();

  if (clean.includes("medic") || clean.includes("dental") || clean.includes("health") || clean.includes("nurs") || clean.includes("mbbs")) {
    return {
      ...COLLEGE_DISCIPLINES.medical,
      badge: "HEALTHCARE & CLINICAL DEGREE CATALOG",
      titlePrefix: "Explore Flagship",
      highlightedText: "Medical & Clinical Curricula",
      titleSuffix: "in India",
      description:
        "Discover accredited MBBS, BDS, B.Sc Nursing, and Allied Health programs with verified clinical rotations, hospital affiliations, and NEET admission roadmaps.",
      showcaseTag1: "🩺 Healthcare & Medicine",
      showcaseTag2: "NMC & DCI Approved",
      captionTitle: "MBBS, BDS, MD & Allied Healthcare Degrees",
      captionSubtitle: "Affiliated hospital clinical training & NEET seat counselling",
      trustBadge1: "NMC & DCI Compliant Curricula",
      trustBadge2: "Direct Hospital Clinical Exposure",
      trustBadge3: "Free NEET Advisory",
      metric1Value: "40+",
      metric1Label: "Medical & Dental Degrees",
      metric2Value: "100%",
      metric2Label: "Approved Hospital Rotations",
      metric3Value: "NEET",
      metric3Label: "UG & PG Entrance Mapping",
    };
  }

  if (clean.includes("engine") || clean.includes("tech") || clean.includes("b.tech")) {
    return {
      ...COLLEGE_DISCIPLINES.engineering,
      badge: "ENGINEERING & TECH DEGREE CATALOG",
      titlePrefix: "Explore Flagship",
      highlightedText: "Engineering & Technology Degrees",
      titleSuffix: "in India",
      description:
        "Discover cutting-edge B.Tech, M.Tech, and diploma programs across AI, Computer Science, Robotics, VLSI, and Core Engineering with verified industry curricula.",
      showcaseTag1: "⚙️ Engineering & Tech Curricula",
      showcaseTag2: "AICTE & NBA Compliant",
      captionTitle: "B.Tech, M.Tech, AI & Data Science Specializations",
      captionSubtitle: "High-tech lab access, software engineering & core placement tracks",
      trustBadge1: "AICTE & NBA Compliant",
      trustBadge2: "Modern Computing & Robotics Labs",
      trustBadge3: "Free Choice Filling Advisory",
      metric1Value: "80+",
      metric1Label: "Engineering Specializations",
      metric2Value: "₹1.15 Cr",
      metric2Label: "Highest Tech Placement Package",
      metric3Value: "100%",
      metric3Label: "Industry Aligned Curricula",
    };
  }

  if (clean.includes("manage") || clean.includes("mba") || clean.includes("bba") || clean.includes("business")) {
    return {
      ...COLLEGE_DISCIPLINES.management,
      badge: "MANAGEMENT & BUSINESS CATALOG",
      titlePrefix: "Explore Flagship",
      highlightedText: "Management & MBA Curricula",
      titleSuffix: "in India",
      description:
        "Discover premier MBA, PGDM, and BBA specializations in Finance, Marketing, Business Analytics, Human Resources, and Global Supply Chain with audited ROI.",
      showcaseTag1: "💼 Management & MBA",
      showcaseTag2: "AACSB & AICTE Aligned",
      captionTitle: "MBA, PGDM, BBA & Executive Management",
      captionSubtitle: "Corporate case studies, summer internships & executive placement tracks",
      trustBadge1: "AICTE & AACSB Benchmark",
      trustBadge2: "Corporate Internship Tie-Ups",
      trustBadge3: "Free Profile Evaluation",
      metric1Value: "50+",
      metric1Label: "MBA & BBA Specializations",
      metric2Value: "₹34.8 LPA",
      metric2Label: "Highest Management CTC",
      metric3Value: "100%",
      metric3Label: "Corporate Placement Record",
    };
  }

  if (clean.includes("law") || clean.includes("legal")) {
    return {
      ...COLLEGE_DISCIPLINES.law,
      badge: "LAW & JURISPRUDENCE CATALOG",
      titlePrefix: "Explore Flagship",
      highlightedText: "Law & Jurisprudence Curricula",
      titleSuffix: "in India",
      description:
        "Discover Bar Council of India compliant 5-year integrated BA LLB, BBA LLB, and LLM curricula with moot court competitions and judicial internship paths.",
      showcaseTag1: "⚖️ Legal Studies",
      showcaseTag2: "BCI Compliant",
      captionTitle: "BA LLB, BBA LLB, LLM & Cyber Law Degrees",
      captionSubtitle: "Moot court chambers, judicial clerkships & corporate legal practice",
      trustBadge1: "Bar Council of India Approved",
      trustBadge2: "Moot Court & Arbitration Labs",
      trustBadge3: "CLAT & AILET Advisory",
      metric1Value: "25+",
      metric1Label: "Law & Specialization Degrees",
      metric2Value: "100%",
      metric2Label: "BCI Regulated Curricula",
      metric3Value: "High Courts",
      metric3Label: "Internship & Placement Tie-ups",
    };
  }

  if (
    clean.includes("comput") ||
    clean.includes("application") ||
    clean.includes("bca") ||
    clean.includes("mca") ||
    clean.includes("software") ||
    clean.includes("information tech")
  ) {
    return {
      ...COLLEGE_DISCIPLINES.engineering,
      badge: "IT & COMPUTING DEGREE CATALOG",
      titlePrefix: "Explore Flagship",
      highlightedText: "Computer Applications & IT Programs",
      titleSuffix: "in India",
      description:
        "Discover premier BCA, MCA, and Software Engineering programs with industry-aligned syllabi in Cloud Computing, AI/ML, Full-Stack Development, and audited campus placements.",
      image: "/images/disciplines/engineering.jpg",
      showcaseTag1: "💻 Computer Applications & IT",
      showcaseTag2: "AICTE & UGC Aligned",
      captionTitle: "BCA, MCA, Cloud & Software Engineering Programs",
      captionSubtitle: "Coding labs, tech corporate tie-ups & high-growth IT placement tracks",
      trustBadge1: "AICTE & UGC Recognized",
      trustBadge2: "Coding & AI Sandbox Labs",
      trustBadge3: "Free IT Career Mapping",
      metric1Value: "40+",
      metric1Label: "IT Specializations",
      metric2Value: "₹24 LPA",
      metric2Label: "Top BCA/MCA Package",
      metric3Value: "96%",
      metric3Label: "IT Placement Rate",
    };
  }

  if (clean.includes("design") || clean.includes("arch") || clean.includes("media") || clean.includes("art")) {
    return {
      ...COLLEGE_DISCIPLINES.design,
      badge: "CREATIVE & DESIGN DEGREE CATALOG",
      titlePrefix: "Explore Flagship",
      highlightedText: "Design & Creative Arts Curricula",
      titleSuffix: "in India",
      description:
        "Discover accredited B.Des, B.Arch, and Visual Communication curricula with studio-based portfolios, industry mentors, and premier campus recruitments.",
      showcaseTag1: "🎨 Design & Media Studies",
      showcaseTag2: "CoA & UGC Aligned",
      captionTitle: "B.Des, B.Arch, Animation & UI/UX Design Curricula",
      captionSubtitle: "Design studios, creative workshops & creative agency placements",
      trustBadge1: "CoA & UGC Approved",
      trustBadge2: "Design Studio Infrastructure",
      trustBadge3: "Portfolio Advisory",
      metric1Value: "35+",
      metric1Label: "Creative Specializations",
      metric2Value: "₹18 LPA",
      metric2Label: "Top Design Package",
      metric3Value: "100%",
      metric3Label: "Studio-Based Training",
    };
  }

  return getCollegeDisciplineMeta(category);
}

export function getCollegeCoverImage(collegeType?: string | null, currentCoverUrl?: string | null): string {
  if (currentCoverUrl && currentCoverUrl.trim().length > 0) {
    return currentCoverUrl;
  }
  return getCollegeDisciplineMeta(collegeType).image;
}

export function getCollegeTypeFromCourseCategory(category?: string | null): string {
  if (!category) return "Engineering";
  const clean = category.toLowerCase().trim();
  if (clean.includes("medic") || clean.includes("dental") || clean.includes("health") || clean.includes("nurs") || clean.includes("mbbs")) {
    return "Medical";
  }
  if (clean.includes("engine") || clean.includes("tech") || clean.includes("b.tech") || clean.includes("computer")) {
    return "Engineering";
  }
  if (clean.includes("manage") || clean.includes("mba") || clean.includes("bba") || clean.includes("business") || clean.includes("commerce")) {
    return "Management";
  }
  if (clean.includes("law") || clean.includes("legal")) {
    return "Law";
  }
  if (clean.includes("pharm")) {
    return "Pharmacy";
  }
  if (clean.includes("design") || clean.includes("media") || clean.includes("art")) {
    return "Design & Media";
  }
  return "Engineering";
}

export interface CollegeRecommendation {
  name: string;
  slug: string;
  location: string;
  highlight: string;
  nirf?: string;
  package?: string;
}

export const DISCIPLINE_RECOMMENDED_COLLEGES: Record<string, CollegeRecommendation[]> = {
  Engineering: [
    { name: "KIIT University", slug: "kiit-university", location: "Bhubaneswar, Odisha", highlight: "NIRF #16 • NAAC A++", nirf: "#16", package: "₹63 LPA" },
    { name: "SOA (Siksha 'O' Anusandhan)", slug: "siksha-o-anusandhan", location: "Bhubaneswar, Odisha", highlight: "NIRF #15 • NAAC A++", nirf: "#15", package: "₹46 LPA" },
    { name: "Centurion University", slug: "centurion-university", location: "Bhubaneswar, Odisha", highlight: "AICTE Approved • Skill Labs", nirf: "Top 100", package: "₹13.8 LPA" },
    { name: "C.V. Raman Global University", slug: "cv-raman-global-university", location: "Bhubaneswar, Odisha", highlight: "Center of Excellence in Robotics", nirf: "Top 100", package: "₹24 LPA" },
    { name: "BITS Pilani", slug: "bits-pilani", location: "Pilani, Rajasthan", highlight: "Tier-1 Autonomous Engineering", nirf: "#20", package: "₹60 LPA" },
    { name: "RV College of Engineering", slug: "rv-college-of-engineering", location: "Bengaluru, Karnataka", highlight: "Top Karnataka Tech Campus", nirf: "#96", package: "₹62 LPA" },
  ],
  Medical: [
    { name: "IMS & SUM Hospital (SOA)", slug: "ims-and-sum-hospital", location: "Bhubaneswar, Odisha", highlight: "1,750+ Bed Super Speciality Hospital", nirf: "#16", package: "NMC Approved" },
    { name: "Kalinga Institute of Medical Sciences (KIMS)", slug: "kims-bhubaneswar", location: "Bhubaneswar, Odisha", highlight: "NMC Recognized • 2,600+ Beds", nirf: "#26", package: "NEET UG Cutoff" },
    { name: "Hi-Tech Medical College & Hospital", slug: "hi-tech-medical-college", location: "Bhubaneswar, Odisha", highlight: "NMC Approved • Clinical Rotations", nirf: "Accredited", package: "Verified Intake" },
    { name: "SCB Medical College & Hospital", slug: "scb-medical-college", location: "Cuttack, Odisha", highlight: "Premier Government Medical Institute", nirf: "Top 50", package: "NEET Merit" },
  ],
  Management: [
    { name: "IIM Sambalpur", slug: "iim-sambalpur", location: "Sambalpur, Odisha", highlight: "Premier National IIM Campus", nirf: "Top 50", package: "₹64.6 LPA" },
    { name: "KSOM (KIIT School of Management)", slug: "ksom-kiit", location: "Bhubaneswar, Odisha", highlight: "AACSB Aligned • Top 30 B-School", nirf: "#32", package: "₹22.7 LPA" },
    { name: "SIBM (Symbiosis Institute of Business Management)", slug: "sibm", location: "Pune, Maharashtra", highlight: "Flagship Corporate MBA", nirf: "#17", package: "₹35 LPA" },
    { name: "XIM University", slug: "xim-university", location: "Bhubaneswar, Odisha", highlight: "Premier MBA Business Management", nirf: "#46", package: "₹20 LPA" },
    { name: "Indian School of Business (ISB)", slug: "isb", location: "Hyderabad, Telangana", highlight: "Global Triple Crown Accredited", nirf: "Top Tier", package: "₹34 LPA" },
  ],
  Law: [
    { name: "National Law University Odisha (NLUO)", slug: "nlu-odisha", location: "Cuttack, Odisha", highlight: "Tier-1 National Law University", nirf: "#25", package: "BCI Approved" },
    { name: "KIIT School of Law", slug: "kiit-school-of-law", location: "Bhubaneswar, Odisha", highlight: "Top Ranked Law Faculty in East India", nirf: "#12", package: "Moot Court Champion" },
    { name: "SOA National Institute of Law", slug: "soa-law", location: "Bhubaneswar, Odisha", highlight: "BCI Approved • Dual Integrated Degrees", nirf: "Accredited", package: "Corporate Law" },
  ],
  Pharmacy: [
    { name: "School of Pharmaceutical Sciences (SOA)", slug: "soa-pharmacy", location: "Bhubaneswar, Odisha", highlight: "PCI & AICTE Approved R&D Labs", nirf: "#30", package: "GPAT Accredited" },
    { name: "Centurion School of Pharmacy", slug: "centurion-pharmacy", location: "Bhubaneswar, Odisha", highlight: "Industrial Formulation & Drug Design", nirf: "Accredited", package: "Pharma Placement" },
  ],
  "Design & Media": [
    { name: "KIIT School of Fashion Technology", slug: "kiit-fashion", location: "Bhubaneswar, Odisha", highlight: "Creative Studio & Portfolio Labs", nirf: "Accredited", package: "Design Career" },
    { name: "Centurion School of Media & Communication", slug: "centurion-media", location: "Bhubaneswar, Odisha", highlight: "Digital Media, Animation & UI/UX", nirf: "Accredited", package: "Media Placement" },
  ],
};

export function getRecommendedCollegesForDiscipline(disciplineOrCourse?: string | null): CollegeRecommendation[] {
  const collegeType = getCollegeTypeFromCourseCategory(disciplineOrCourse);
  return DISCIPLINE_RECOMMENDED_COLLEGES[collegeType] || DISCIPLINE_RECOMMENDED_COLLEGES.Engineering;
}
