import type { MetadataRoute } from "next";
import { content } from "@/content/data";

/**
 * sitemap.xml generado por Next. El sitio es una sola pagina, asi que lista
 * la home. Se sirve en /sitemap.xml y es lo que se carga en Search Console.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: content.seo.url,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 1,
    },
  ];
}
