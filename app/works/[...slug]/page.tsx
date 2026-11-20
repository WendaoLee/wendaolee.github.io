import "katex/dist/katex.min.css";
import { notFound } from "next/navigation";
import { allWorks } from "contentlayer/generated";

import { Metadata } from "next";
import { Mdx } from "@/components/MdxComponents";
import { match } from "ts-pattern";
import Utterances from "@/components/Comments";

interface PostProps {
  params: {
    slug: string[];
  };
}

async function getPostFromParams(params: PostProps["params"]) {
  const slug = params?.slug?.join("/");
  const post = allWorks.find((post) => post.slugAsParams === slug);

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
  return allWorks.map((post) => ({
    slug: post.slugAsParams.split("/"),
  }));
}

export default async function PostPage({ params }: PostProps) {
  const post = await getPostFromParams(params);

  if (!post) {
    notFound();
  }

  return (
    <>
      <article className="min-w-full py-6 prose dark:prose-invert" data-pagefind-body>
        <h1 className="mb-2" data-pagefind-meta="title">
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
      <Utterances />
    </>
  );
}
