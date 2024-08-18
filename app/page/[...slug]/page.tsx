import { notFound } from "next/navigation";
import { Metadata } from "next";
import { allPages } from "@/.contentlayer/generated";
import { match } from "ts-pattern";

import { Mdx } from "@/components/MdxComponents";
import WritingsLists from "@/components/WritingsList";

interface PageProps {
  params: {
    slug: string[];
  };
}

async function getPageFromParams(params: PageProps["params"]) {
  const slug = params?.slug?.join("/");
  const page = allPages.find((page) => page.slugAsParams === slug);

  if (!page) {
    return null;
  }

  return page;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const page = await getPageFromParams(params);

  if (!page) {
    return {};
  }

  return {
    title: page.title,
    description: page.description,
  };
}

export const dynamicParams = false 
export const dynamic = 'force-static'

export async function generateStaticParams(): Promise<{slug:string[]}[]> {
  console.log(
    allPages.map((page) => ({
      slug: page.slugAsParams.split("/"),
    }))
  )
  console.log('--end---')
  return allPages.map((page) => ({
    slug: page.slugAsParams.split("/"),
  }));
}

export default async function PagePage({ params }: PageProps) {
  console.log({params})
  const page = await getPageFromParams(params);

  if (!page) {
    notFound();
  }

  console.log(page.title)

  return (
    <article className="py-6 prose dark:prose-invert">
      {match(page.title)
        .with("About", () => <WritingsLists></WritingsLists>)
        .otherwise(() => <></>)}

      <hr />
      <Mdx code={page.body.code} />
    </article>
  );
}
