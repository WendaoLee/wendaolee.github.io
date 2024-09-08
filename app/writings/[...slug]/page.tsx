import { notFound } from "next/navigation"
import { allWritings } from "contentlayer/generated"

import { Metadata } from "next"
import { Mdx } from "@/components/MdxComponents"
import { match } from "ts-pattern"

interface PostProps {
  params: {
    slug: string[]
  }
}

async function getPostFromParams(params: PostProps["params"]) {
  const slug = params?.slug?.join("/")
  const post = allWritings.find((post) => post.slugAsParams === slug)

  if (!post) {
    null
  }

  return post
}

export async function generateMetadata({
  params,
}: PostProps): Promise<Metadata> {
  const post = await getPostFromParams(params)

  if (!post) {
    return {}
  }

  const postSEOCategory = match(post.category)
                            .with("blog", () => "technology")
                            .otherwise(() => post.category)
  const postTags = post.tags ?? []

  return {
    title: `${post.title} - 李问道的博客 / Blog of Wendaolee`,
    description: post.description,
    category: postSEOCategory, 
    keywords: postTags,
    authors:[{name:"李问道",url:"https://leewendao.otterstack.cn"},{name:"Wendaolee",url:"https://leewendao.otterstack.cn"},{name:"Erika Lee",url:"https://leewendao.otterstack.cn"},{name:"leewendao",url:"https://leewendao.otterstack.cn"}],
  }
}

export async function generateStaticParams(): Promise<PostProps["params"][]> {
  return allWritings.map((post) => ({
    slug: post.slugAsParams.split("/"),
  }))
}

export default async function PostPage({ params }: PostProps) {
  const post = await getPostFromParams(params)

  if (!post) {
    notFound()
  }

  return (
    <article className="min-w-full py-6 prose dark:prose-invert">
      <h1 className="mb-2">{post.title}</h1>
      {/* <div className="flex justify-between h-fit">
        <p className="text-lg text-slate-600 dark:text-slate-400 my-0">
          {getReadableDate(post.date)}
        </p>
        <p className="text-lg text-slate-600 dark:text-slate-400 my-0">
          {`${post.body.raw.length}字`}
        </p>
      </div> */}
      {/* <p className="text-lg text-slate-600 dark:text-slate-400">
        {getReadableDate(post.date)}
      </p> */}
      <p className="text-base md:text-lg text-slate-600 dark:text-slate-400">
        {`"${post.description}"`}
      </p>
      {/* {post.description && (
        <p className="text-xl mt-0 text-slate-700 dark:text-slate-200">
          {post.description}
        </p>
      )} */}
      <hr className="my-4" />
      <Mdx code={post.body.code} />
    </article>
  )
}
