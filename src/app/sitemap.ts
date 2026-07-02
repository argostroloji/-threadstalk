import type { MetadataRoute } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

/**
 * Static pages + example result pages.
 * Result pages are dynamic; search engines discover them organically through
 * shared links (every result has its own canonical URL).
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages = ["", "/about", "/contact", "/privacy"].map(
    (path) => ({
      url: `${siteUrl}${path}`,
      changeFrequency: "weekly" as const,
      priority: path === "" ? 1 : 0.5,
    }),
  );

  const examples = ["zuck", "mosseri", "netflix", "nasa", "spotify"].flatMap(
    (h) => [
      {
        url: `${siteUrl}/stalkers/${h}`,
        changeFrequency: "daily" as const,
        priority: 0.7,
      },
      {
        url: `${siteUrl}/personality/${h}`,
        changeFrequency: "daily" as const,
        priority: 0.7,
      },
    ],
  );

  return [...staticPages, ...examples];
}
