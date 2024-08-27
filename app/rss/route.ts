import RSS from 'rss'
import { rankedWritings } from '@/lib/filteredDatas'
import { NextResponse } from 'next/server'

export async function GET() {
    const feed = new RSS({
        title: "李问道博客最新文章 / Wendaole's new writings",
        description: "该 seed 用于获取李问道个人最新十条文章 / This feed is used to get the latest ten articles of Wendaolee",
        site_url: 'https://leewendao.otterstack.cn',
        feed_url: 'https://leewendao.otterstack.cn/rss',
        image_url: 'https://leewendao.otterstack.cn/wendaolee.jpg',
    })

    rankedWritings.slice(0, 10).forEach(post => {
        feed.item({
            title: post.title,
            description: post.description as string,
            url: `https://leewendao.otterstack.cn/writings/${post.slug}`,
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