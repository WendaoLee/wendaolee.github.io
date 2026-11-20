import type { MetadataRoute } from "next";
import { allPages, allWorks, allWritings } from "@/.contentlayer/generated";

const SITE_URL = "https://leewendao.otterstack.cn";

export default function sitemap(): MetadataRoute.Sitemap {
  const writings: MetadataRoute.Sitemap = allWritings.map((ele) => ({
    url: `${SITE_URL}${ele.slug}`,
    lastModified: new Date(ele.date),
    changeFrequency: "weekly",
    priority: ele.category === "blog" ? 0.9 : 0.6,
  }));

  const works: MetadataRoute.Sitemap = allWorks.map((ele) => ({
    url: `${SITE_URL}${ele.slug}`,
    lastModified: new Date(ele.date),
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  const pages: MetadataRoute.Sitemap = allPages.map((ele) => ({
    url: `${SITE_URL}/page/${ele.slugAsParams}`,
    changeFrequency: "monthly",
    priority: 0.5,
  }));

  const now = new Date();
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: `${SITE_URL}/`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${SITE_URL}/writings`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${SITE_URL}/works`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
  ];

  const allItems: MetadataRoute.Sitemap = [
    ...staticPages,
    ...writings,
    ...works,
    ...pages,
  ];

  return allItems.sort((a, b) => {
    const dateA = a.lastModified ? new Date(a.lastModified).getTime() : 0;
    const dateB = b.lastModified ? new Date(b.lastModified).getTime() : 0;
    return dateB - dateA;
  });
}
