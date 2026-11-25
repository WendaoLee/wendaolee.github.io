import "katex/dist/katex.min.css";
import { notFound } from "next/navigation";

import { Metadata } from "next";
import { Mdx } from "@/components/MdxComponents";
import { match } from "ts-pattern";
import Utterances from "@/components/Comments";
import { getReadableDate } from "@/lib/date";
import { visibleWorks } from "@/lib/filteredDatas";

interface PostProps {
  params: {
    slug: string[];
  };
}

async function getPostFromParams(params: PostProps["params"]) {
  const slug = params?.slug?.join("/");
  const post = visibleWorks.find((post) => post.slugAsParams === slug);

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
      siteName: "李问道的博客 / Works of Wendaolee",
      url,
      title: `${post.title} - 李问道的博客 / Works of Wendaolee`,
      description: post.description,
      publishedTime: post.date,
      modifiedTime: post.lastUpdateDate ?? post.date,
    },
    twitter: {
      card: "summary_large_image",
      title: `${post.title} - 李问道的博客 / Works of Wendaolee`,
      description: post.description,
      images: ["https://leewendao.otterstack.cn/wendaolee.jpeg"],
    },
  };
}

export function generateStaticParams(): PostProps["params"][] {
  return visibleWorks.map((post) => ({
    slug: post.slugAsParams.split("/"),
  }));
}

export default async function PostPage({ params }: PostProps) {
  const post = await getPostFromParams(params);

  if (!post) {
    notFound();
  }

  const lastModified = post.lastUpdateDate ?? post.date;
  const publishedDateText = getReadableDate(post.date);
  const updatedDateText = getReadableDate(lastModified);
  const hasUpdated = Boolean(post.lastUpdateDate && updatedDateText !== publishedDateText);

  return (
    <>
      <article className="min-w-full py-6 prose dark:prose-invert" data-pagefind-body>
        <h1 className="mb-2" data-pagefind-meta="title">
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
        <div
          className="not-prose text-xs md:text-sm text-slate-500 dark:text-slate-400 mb-3 flex flex-wrap items-center gap-x-2 gap-y-1"
          data-pagefind-ignore
        >
          <span>
            发布于 <time dateTime={post.date}>{publishedDateText}</time>
          </span>
          {hasUpdated && (
            <>
              <span aria-hidden="true">·</span>
              <span>
                更新于 <time dateTime={lastModified}>{updatedDateText}</time>
              </span>
            </>
          )}
        </div>
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
      <Utterances />
    </>
  );
}
