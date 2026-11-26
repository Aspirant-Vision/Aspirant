import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://aspirantvision.com";

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin",
          "/admin/",
          "/admin/*",
          "/student",
          "/student/",
          "/student/*",
          "/api",
          "/api/",
          "/api/*",
          "/auth",
          "/auth/",
          "/auth/*",
          "/(auth)",
          "/(auth)/*",
        ],
      },
    ],
    sitemap: `${siteUrl.replace(/\/$/, "")}/sitemap.xml`,
  };
}
