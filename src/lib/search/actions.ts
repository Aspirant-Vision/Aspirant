"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { ApiResponse } from "@/types/api.types";

export interface LiveSearchSuggestion {
  id: string;
  type: "college" | "course" | "exam";
  title: string;
  subtitle: string;
  badge?: string;
  logoUrl?: string | null;
  city?: string;
  state?: string;
  href: string;
}

export interface LiveSearchResults {
  colleges: LiveSearchSuggestion[];
  courses: LiveSearchSuggestion[];
  exams: LiveSearchSuggestion[];
  totalResults: number;
}

const SYNONYMS: Record<string, string[]> = {
  mba: ["management", "business", "pgdm"],
  pgdm: ["management", "business", "mba"],
  btech: ["engineering", "technology", "cse", "computer science"],
  "b.tech": ["engineering", "technology"],
  engineering: ["btech", "mtech"],
  management: ["mba", "pgdm", "bba"],
  medical: ["mbbs", "bds", "healthcare"],
  mbbs: ["medical", "healthcare"],
  law: ["llb", "ba llb", "legal"],
  llb: ["law", "legal"],
  bca: ["computer applications", "it"],
  mca: ["computer applications", "it"],
  kiit: ["kalinga", "kiitee", "bhubaneswar"],
};

const POPULAR_EXAMS = [
  {
    id: "kiitee",
    name: "KIITEE",
    fullName: "KIIT Entrance Examination (B.Tech, MBA, Law, MCA)",
    category: "Engineering & University",
    keywords: ["kiit", "kiitee", "kalinga", "bhubaneswar", "odisha"],
    href: "/colleges/kiit-university-bhubaneswar",
  },
  {
    id: "cat",
    name: "CAT",
    fullName: "Common Admission Test (IIMs & Top Business Schools)",
    category: "Management",
    keywords: ["cat", "iim", "mba", "pgdm", "management"],
    href: "/mba",
  },
  {
    id: "jee-main",
    name: "JEE Main",
    fullName: "Joint Entrance Examination for B.Tech Admissions",
    category: "Engineering",
    keywords: ["jee", "jee main", "engineering", "btech", "b.tech", "iit", "nit"],
    href: "/colleges?type=Engineering",
  },
  {
    id: "neet-ug",
    name: "NEET UG",
    fullName: "National Eligibility cum Entrance Test (MBBS / BDS)",
    category: "Medical",
    keywords: ["neet", "neet ug", "mbbs", "bds", "medical", "doctor"],
    href: "/colleges?type=Medical",
  },
  {
    id: "ojee",
    name: "OJEE",
    fullName: "Odisha Joint Entrance Examination (B.Tech / MBA / MCA)",
    category: "State Entrance",
    keywords: ["ojee", "odisha", "centurion", "cgu", "bhubaneswar"],
    href: "/colleges?search=Odisha",
  },
  {
    id: "xat",
    name: "XAT",
    fullName: "Xavier Aptitude Test (XLRI & Premier MBA Institutes)",
    category: "Management",
    keywords: ["xat", "xlri", "mba", "pgdm", "management"],
    href: "/mba",
  },
  {
    id: "mat",
    name: "MAT",
    fullName: "Management Aptitude Test (AIMA Approved)",
    category: "Management",
    keywords: ["mat", "aima", "mba", "management"],
    href: "/mba",
  },
  {
    id: "cmat",
    name: "CMAT",
    fullName: "Common Management Admission Test (AICTE)",
    category: "Management",
    keywords: ["cmat", "aicte", "mba", "pgdm"],
    href: "/mba",
  },
  {
    id: "clat",
    name: "CLAT",
    fullName: "Common Law Admission Test (NLUs & Top Law Colleges)",
    category: "Law",
    keywords: ["clat", "law", "llb", "ba llb", "legal"],
    href: "/colleges?type=Law",
  },
  {
    id: "bitsat",
    name: "BITSAT",
    fullName: "Birla Institute of Technology and Science Admission Test",
    category: "Engineering",
    keywords: ["bitsat", "bits", "pilani", "engineering"],
    href: "/colleges?type=Engineering",
  },
];

export async function getLiveSearchSuggestionsAction(
  rawQuery: string,
  options?: {
    location?: string;
    tab?: "colleges" | "courses" | "exams";
  }
): Promise<ApiResponse<LiveSearchResults>> {
  try {
    const supabase = createAdminClient();
    const clean = (rawQuery || "").replace(/[%_,()]/g, " ").trim();
    const cleanLower = clean.toLowerCase();
    const location = options?.location?.trim();

    const result: LiveSearchResults = {
      colleges: [],
      courses: [],
      exams: [],
      totalResults: 0,
    };

    // If query is empty, return top featured suggestions
    if (!clean) {
      let colQuery = supabase
        .from("colleges")
        .select("id, name, slug, city, state, college_type, nirf_rank, naac_grade, logo_url")
        .eq("publication_status", "published")
        .order("is_featured", { ascending: false })
        .order("nirf_rank", { ascending: true, nullsFirst: false })
        .limit(4);

      if (location && location !== "All India") {
        colQuery = colQuery.or(`city.ilike.%${location}%,state.ilike.%${location}%`);
      }

      const crsQuery = supabase
        .from("courses")
        .select("id, name, slug, degree_type, stream, category")
        .eq("publication_status", "published")
        .limit(3);

      const [colRes, crsRes] = await Promise.all([colQuery, crsQuery]);

      if (colRes.data) {
        result.colleges = colRes.data.map((c) => ({
          id: c.id,
          type: "college" as const,
          title: c.name,
          subtitle: `${c.city}, ${c.state}${c.college_type ? ` • ${c.college_type}` : ""}`,
          badge: c.nirf_rank ? `NIRF #${c.nirf_rank}` : c.naac_grade ? `NAAC ${c.naac_grade}` : undefined,
          logoUrl: c.logo_url,
          city: c.city,
          state: c.state,
          href: `/colleges/${c.slug}`,
        }));
      }

      if (crsRes.data) {
        result.courses = crsRes.data.map((c) => ({
          id: c.id,
          type: "course" as const,
          title: c.name,
          subtitle: `${c.degree_type} • ${c.stream || c.category}`,
          badge: c.category,
          href: `/courses/${c.slug}`,
        }));
      }

      result.exams = POPULAR_EXAMS.slice(0, 3).map((e) => ({
        id: e.id,
        type: "exam" as const,
        title: e.name,
        subtitle: e.fullName,
        badge: e.category,
        href: e.href,
      }));

      result.totalResults = result.colleges.length + result.courses.length + result.exams.length;
      return { success: true, data: result };
    }

    // Build intelligent query terms with synonym expansion
    const termsToMatch = [clean];
    if (SYNONYMS[cleanLower]) {
      termsToMatch.push(...SYNONYMS[cleanLower]);
    }

    // 1. Query Colleges
    let colQuery = supabase
      .from("colleges")
      .select("id, name, slug, city, state, college_type, nirf_rank, naac_grade, logo_url, entrance_exams")
      .eq("publication_status", "published");

    if (location && location !== "All India") {
      colQuery = colQuery.or(`city.ilike.%${location}%,state.ilike.%${location}%`);
    }

    const colFilterString = termsToMatch
      .flatMap((t) => [
        `name.ilike.%${t}%`,
        `slug.ilike.%${t}%`,
        `city.ilike.%${t}%`,
        `state.ilike.%${t}%`,
        `college_type.ilike.%${t}%`,
        `entrance_exams.ilike.%${t}%`,
      ])
      .join(",");

    colQuery = colQuery
      .or(colFilterString)
      .order("is_featured", { ascending: false })
      .order("name", { ascending: true })
      .limit(6);

    // 2. Query Courses
    const crsFilterString = termsToMatch
      .flatMap((t) => [
        `name.ilike.%${t}%`,
        `slug.ilike.%${t}%`,
        `degree_type.ilike.%${t}%`,
        `stream.ilike.%${t}%`,
        `category.ilike.%${t}%`,
        `specialization.ilike.%${t}%`,
      ])
      .join(",");

    const crsQuery = supabase
      .from("courses")
      .select("id, name, slug, degree_type, stream, category, specialization")
      .eq("publication_status", "published")
      .or(crsFilterString)
      .order("name", { ascending: true })
      .limit(5);

    const [colRes, crsRes] = await Promise.all([colQuery, crsQuery]);

    if (colRes.data) {
      result.colleges = colRes.data.map((c) => ({
        id: c.id,
        type: "college" as const,
        title: c.name,
        subtitle: `${c.city}, ${c.state}${c.college_type ? ` • ${c.college_type}` : ""}`,
        badge: c.nirf_rank ? `NIRF #${c.nirf_rank}` : c.naac_grade ? `NAAC ${c.naac_grade}` : undefined,
        logoUrl: c.logo_url,
        city: c.city,
        state: c.state,
        href: `/colleges/${c.slug}`,
      }));
    }

    if (crsRes.data) {
      result.courses = crsRes.data.map((c) => ({
        id: c.id,
        type: "course" as const,
        title: c.name,
        subtitle: `${c.degree_type} • ${c.stream || c.category}`,
        badge: c.category,
        href: `/courses/${c.slug}`,
      }));
    }

    // 3. Match Exams
    const matchedExams = POPULAR_EXAMS.filter((exam) => {
      const matchInSelf =
        exam.name.toLowerCase().includes(cleanLower) ||
        exam.fullName.toLowerCase().includes(cleanLower) ||
        exam.category.toLowerCase().includes(cleanLower) ||
        exam.keywords.some((k) => k.includes(cleanLower) || cleanLower.includes(k));

      if (matchInSelf) return true;

      return termsToMatch.some((term) => {
        const tLower = term.toLowerCase();
        return (
          exam.name.toLowerCase().includes(tLower) ||
          exam.fullName.toLowerCase().includes(tLower) ||
          exam.keywords.some((k) => k.includes(tLower) || tLower.includes(k))
        );
      });
    });

    result.exams = matchedExams.slice(0, 4).map((e) => ({
      id: e.id,
      type: "exam" as const,
      title: e.name,
      subtitle: e.fullName,
      badge: e.category,
      href: e.href,
    }));

    result.totalResults = result.colleges.length + result.courses.length + result.exams.length;
    return { success: true, data: result };
  } catch (err: unknown) {
    return {
      success: false,
      error: {
        code: "SEARCH_FAILED",
        message: (err as Error).message || "Failed to fetch live search suggestions",
      },
    };
  }
}
