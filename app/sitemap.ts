import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://zyvoriq.up.railway.app";
  return [
    { url: `${base}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/create`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${base}/swarm`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${base}/my-reels`, changeFrequency: "daily", priority: 0.8 },
    { url: `${base}/assets`, changeFrequency: "daily", priority: 0.8 },
    { url: `${base}/privacy`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${base}/terms`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${base}/dmca`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${base}/contact`, changeFrequency: "monthly", priority: 0.4 },
  ];
}
