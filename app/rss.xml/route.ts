import RSS from "rss";
import { rankedWritings } from "@/lib/filteredDatas";
import { NextResponse } from "next/server";

export const dynamic = "force-static";

const SITE_URL = "https://leewendao.otterstack.cn";

export async function GET() {
  const feed = new RSS({
    title: "李问道博客最新文章 / Wendaolee's new writings",
    description: "苔痕深院雨，人影小窗灯——李问道的个人博客。",
    site_url: SITE_URL,
    feed_url: `${SITE_URL}/rss.xml`,
    image_url: `${SITE_URL}/wendaolee.jpeg`,
    language: "zh-CN",
    custom_elements: [
      {
        follow_challenge: [
          { feedId: "66483857348895744" },
          { userId: "66482764915559424" },
        ],
      },
    ],
  });

  rankedWritings.slice(0, 20).forEach((post) => {
    const categories = [post.category, ...(post.tags ?? [])].filter(
      (item): item is string => Boolean(item)
    );

    feed.item({
      title: post.title,
      description: post.description ?? post.title,
      url: `${SITE_URL}${post.slug}`,
      date: post.date,
      author: "李问道",
      categories,
    });
  });

  return new NextResponse(feed.xml({ indent: true }), {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Content-Disposition": 'inline; filename="rss.xml"',
    },
  });
}
