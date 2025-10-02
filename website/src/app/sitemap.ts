import type { MetadataRoute } from "next"
export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
  const routes = ["", "/fa", "/en", "/fa/services", "/fa/doctors", "/fa/book", "/fa/posts"]
  return routes.map(p => ({ url: `${base}${p}`, changeFrequency: "daily", priority: (p===""||p==="/fa")?1.0:0.8 }))
}
