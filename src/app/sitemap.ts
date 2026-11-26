import { MetadataRoute } from "next";
import { createClient } from "@/lib/supabase/server";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://aspirantvision.com").replace(/\/$/, "");

  // 1. Core Static Public Pages
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${siteUrl}`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${siteUrl}/colleges`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${siteUrl}/courses`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${siteUrl}/scholarships`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${siteUrl}/login`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.4,
    },
    {
      url: `${siteUrl}/register`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
  ];

  // 2. Dynamic College Pages
  let collegeRoutes: MetadataRoute.Sitemap = [];
  try {
    const supabase = await createClient();
    const { data: colleges } = await supabase
      .from("colleges")
      .select("slug, updated_at")
      .eq("publication_status", "published")
      .limit(1000);

    if (colleges) {
      collegeRoutes = colleges.map((c) => ({
        url: `${siteUrl}/colleges/${c.slug}`,
        lastModified: c.updated_at ? new Date(c.updated_at) : new Date(),
        changeFrequency: "weekly" as const,
        priority: 0.85,
      }));
    }
  } catch (err) {
    console.warn("[Sitemap Warning]: Could not fetch dynamic colleges:", err);
  }

  // 3. Dynamic Course Pages
  let courseRoutes: MetadataRoute.Sitemap = [];
  try {
    const supabase = await createClient();
    const { data: courses } = await supabase
      .from("courses")
      .select("slug, updated_at")
      .eq("publication_status", "published")
      .limit(1000);

    if (courses) {
      courseRoutes = courses.map((c) => ({
        url: `${siteUrl}/courses/${c.slug}`,
        lastModified: c.updated_at ? new Date(c.updated_at) : new Date(),
        changeFrequency: "weekly" as const,
        priority: 0.8,
      }));
    }
  } catch (err) {
    console.warn("[Sitemap Warning]: Could not fetch dynamic courses:", err);
  }

  return [...staticRoutes, ...collegeRoutes, ...courseRoutes];
}
