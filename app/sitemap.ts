import type { MetadataRoute } from 'next'
import { allPages, allWritings } from '@/.contentlayer/generated'
 
export default function sitemap(): MetadataRoute.Sitemap {
  const writings:MetadataRoute.Sitemap = allWritings.map(ele => ({
    url: `https://leewendao.otterstack.cn${ele.slug}`,
    lastModified: ele.date,
    changeFrequency: 'weekly',
    priority: ele.category === 'blog' ? 0.9 : 0.5,
  }))

  const pages: MetadataRoute.Sitemap = allPages.map(ele => ({
    url: `https://leewendao.otterstack.cn/page/${ele.slugAsParams}`,
    changeFrequency: 'monthly',
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
    ...writings,
    ...pages,
  ]

  // @ts-ignore
  return allItems.sort((a, b) => {
    const dateA = new Date(a.lastModified ?? new Date())
    const dateB = new Date(b.lastModified ?? new Date())
    return dateB.getTime() - dateA.getTime()
  })
}
