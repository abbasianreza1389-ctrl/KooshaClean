import type { MetadataRoute } from "next";
export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://example.com";
  const urls = ["/","/services","/doctors","/news","/appointment","/contact","/search"];
  return urls.map(u=>({ url: base+u, lastModified: new Date(), changeFrequency:"weekly", priority: u==="/" ? 1 : 0.7 }));
}
