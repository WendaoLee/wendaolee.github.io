import RSS from 'rss'
import { rankedWritings } from '@/lib/filteredDatas'
import { NextResponse } from 'next/server'

export async function GET() {
    const feed = new RSS({
        title: "李问道博客最新文章 / Wendaole's new writings",
        description: "苔痕深院雨，人影小窗灯——李问道的个人博客。",
        site_url: 'https://leewendao.otterstack.cn',
        feed_url: 'https://leewendao.otterstack.cn/rss.xml',
        image_url: 'https://leewendao.otterstack.cn/wendaolee.jpeg',
    })

    rankedWritings.slice(0, 10).forEach(post => {
        feed.item({
            title: post.title,
            description: post.description as string,
            url: `https://leewendao.otterstack.cn${post.slug}`,
            date: post.date,
        })
    })

    return new NextResponse(feed.xml(), {
        headers: {
            'Content-Type': 'application/xml',
            'Content-Disposition': 'inline; filename="rss.xml"'
        }
    })
}