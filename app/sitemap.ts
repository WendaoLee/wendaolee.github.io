import type { MetadataRoute } from 'next'
import { rankedBlogs,rankedEssays,rankedTranslations,rankedNotes,rankedStory,rankedWritings } from '@/lib/filteredDatas'
 
export default function sitemap(): MetadataRoute.Sitemap {
  const blogs:MetadataRoute.Sitemap = rankedBlogs.map(ele => ({
    url: `https://leewendao.otterstack.cn${ele.slug}`,
    lastModified: ele.date,
    changeFrequency: 'weekly',
    priority: 0.5,
  }))

  const essays:MetadataRoute.Sitemap = rankedEssays.map(ele => ({
    url: `https://leewendao.otterstack.cn${ele.slug}`,
    lastModified: ele.date,
    changeFrequency: 'weekly',
    priority: 0.5,
  }))

  const translations:MetadataRoute.Sitemap = rankedTranslations.map(ele => ({
    url: `https://leewendao.otterstack.cn${ele.slug}`,
    lastModified: ele.date,
    changeFrequency: 'weekly',
    priority: 0.3,
  }))

  const notes:MetadataRoute.Sitemap = rankedNotes.map(ele => ({
    url: `https://leewendao.otterstack.cn${ele.slug}`,
    lastModified: ele.date,
    changeFrequency: 'weekly',
    priority: 0.3,
  }))

  const story:MetadataRoute.Sitemap = rankedStory.map(ele => ({
    url: `https://leewendao.otterstack.cn${ele.slug}`,
    lastModified: ele.date,
    changeFrequency: 'weekly',
    priority: 0.5,
  }))
  
  
  
  const allItems = [
    {
      url: 'https://leewendao.otterstack.cn/',
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: 'https://leewendao.otterstack.cn/writings',
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    ...blogs,
    ...essays,
    ...translations,
    ...notes,
    ...story,
  ]

  // @ts-ignore
  return allItems.sort((a, b) => {
    const dateA = new Date(a.lastModified ?? new Date())
    const dateB = new Date(b.lastModified ?? new Date())
    return dateB.getTime() - dateA.getTime()
  })
}