import { notFound } from "next/navigation";
import { Metadata } from "next";
import { visiblePages } from "@/lib/filteredDatas";
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
  const page = visiblePages.find((page) => page.slugAsParams === slug);

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

  const url = `https://leewendao.otterstack.cn/page/${page.slugAsParams}`;

  return {
    title: page.title,
    description: page.description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      type: "website",
      url,
      title: page.title,
      description: page.description,
    },
  };
}

export const dynamicParams = false;
export const dynamic = "force-static";

export async function generateStaticParams(): Promise<{ slug: string[] }[]> {
  return visiblePages.map((page) => ({
    slug: page.slugAsParams.split("/"),
  }));
}

export default async function PagePage({ params }: PageProps) {
  const page = await getPageFromParams(params);

  if (!page) {
    notFound();
  }

  return (
    <article className="py-6 prose dark:prose-invert" data-pagefind-body>
      <span className="sr-only" data-pagefind-meta="title">
        {page.title}
      </span>
      <div data-pagefind-ignore>
        {match(page.title)
          .with("About", () => <WritingsLists />)
          .otherwise(() => null)}
      </div>

      <hr />
      <Mdx code={page.body.code} />
    </article>
  );
}
