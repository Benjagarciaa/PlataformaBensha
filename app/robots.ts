import type { MetadataRoute } from "next";
import { content } from "@/content/data";

/**
 * robots.txt generado por Next. Deja indexar todo y le dice a Google donde
 * esta el sitemap. Se sirve en /robots.txt.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: `${content.seo.url}/sitemap.xml`,
    host: content.seo.url,
  };
}
