import "katex/dist/katex.min.css";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Metadata } from "next";
import { Mdx } from "@/components/MdxComponents";
import { match } from "ts-pattern";
import Utterances from "@/components/Comments";
import { getReadableDate } from "@/lib/date";
import { rankedWritings, visibleWritings } from "@/lib/filteredDatas";

interface PostProps {
  params: {
    slug: string[];
  };
}

async function getPostFromParams(params: PostProps["params"]) {
  const slug = params?.slug?.join("/");
  const post = visibleWritings.find((post) => post.slugAsParams === slug);

  if (!post) {
    return null;
  }

  return post;
}

export async function generateMetadata({
  params,
}: PostProps): Promise<Metadata> {
  const post = await getPostFromParams(params);

  if (!post) {
    return {};
  }

  const postSEOCategory = match(post.category)
    .with("blog", () => "technology")
    .otherwise(() => post.category);
  const postTags = post.tags ?? [];
  const url = `https://leewendao.otterstack.cn${post.slug}`;

  return {
    title: `${post.title} - 李问道的博客 / Blog of Wendaolee`,
    description: post.description,
    category: postSEOCategory,
    keywords: postTags,
    authors: [
      { name: "李问道", url: "https://leewendao.otterstack.cn" },
      { name: "Wendaolee", url: "https://leewendao.otterstack.cn" },
      { name: "Erika Lee", url: "https://leewendao.otterstack.cn" },
      { name: "leewendao", url: "https://leewendao.otterstack.cn" },
    ],
    alternates: {
      canonical: url,
    },
    openGraph: {
      images: ["https://leewendao.otterstack.cn/wendaolee.jpeg"],
      type: "article",
      siteName: "李问道的博客 / Blog of Wendaolee",
      url,
      title: `${post.title} - 李问道的博客 / Blog of Wendaolee`,
      description: post.description,
      publishedTime: post.date,
    },
    twitter: {
      card: "summary_large_image",
      title: `${post.title} - 李问道的博客 / Blog of Wendaolee`,
      description: post.description,
      images: ["https://leewendao.otterstack.cn/wendaolee.jpeg"],
    },
  };
}

export async function generateStaticParams(): Promise<PostProps["params"][]> {
  return visibleWritings.map((post) => ({
    slug: post.slugAsParams.split("/"),
  }));
}

export default async function PostPage({ params }: PostProps) {
  const post = await getPostFromParams(params);

  if (!post) {
    notFound();
  }

  const currentIndex = rankedWritings.findIndex((item) => item.slug === post.slug);
  const newerPost = currentIndex > 0 ? rankedWritings[currentIndex - 1] : null;
  const olderPost =
    currentIndex >= 0 && currentIndex < rankedWritings.length - 1
      ? rankedWritings[currentIndex + 1]
      : null;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    dateModified: post.date,
    mainEntityOfPage: `https://leewendao.otterstack.cn${post.slug}`,
    image: "https://leewendao.otterstack.cn/wendaolee.jpeg",
    author: {
      "@type": "Person",
      name: "李问道",
      url: "https://leewendao.otterstack.cn",
    },
  };

  return (
    <>
      <article className="min-w-full py-6 prose dark:prose-invert" data-pagefind-body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <h1 className="text-xl mb-2 md:text-2xl" data-pagefind-meta="title">
          {post.isDraft && (
            <span
              data-pagefind-ignore
              className="mr-2 inline-block align-middle rounded bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-800 dark:bg-amber-900/40 dark:text-amber-300"
            >
              DRAFT
            </span>
          )}
          {post.title}
        </h1>
        {post.description && (
          <p
            className="text-base md:text-lg text-slate-600 dark:text-slate-400"
            id="post-description"
            aria-label="文章描述"
          >
            {`"${post.description}"`}
          </p>
        )}
        <hr className="my-4" />
        <Mdx code={post.body.code} headings={post.headings} />
        <p className="text-right" data-pagefind-ignore>
          【END】
        </p>
      </article>

      {(newerPost || olderPost) && (
        <nav
          aria-label="文章上下篇导航"
          data-pagefind-ignore
          className="not-prose grid grid-cols-1 sm:grid-cols-2 gap-4 my-8 pt-6 border-t border-slate-200 dark:border-slate-800"
        >
          <div>
            {newerPost && (
              <Link
                href={newerPost.slug}
                className="group block rounded-lg border border-slate-200 dark:border-slate-800 p-3.5 hover:border-slate-400 dark:hover:border-slate-600 transition-colors"
              >
                <span className="block text-xs text-slate-500 dark:text-slate-400 mb-1">
                  &larr; {getReadableDate(newerPost.date)}
                </span>
                <span className="block text-sm font-medium text-slate-800 dark:text-slate-100 group-hover:underline">
                  {newerPost.title}
                </span>
              </Link>
            )}
          </div>
          <div className="sm:text-right">
            {olderPost && (
              <Link
                href={olderPost.slug}
                className="group block rounded-lg border border-slate-200 dark:border-slate-800 p-3.5 hover:border-slate-400 dark:hover:border-slate-600 transition-colors"
              >
                <span className="block text-xs text-slate-500 dark:text-slate-400 mb-1">
                  {getReadableDate(olderPost.date)} &rarr;
                </span>
                <span className="block text-sm font-medium text-slate-800 dark:text-slate-100 group-hover:underline">
                  {olderPost.title}
                </span>
              </Link>
            )}
          </div>
        </nav>
      )}

      <Utterances />
    </>
  );
}
