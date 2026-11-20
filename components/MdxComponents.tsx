import * as React from "react";
import * as _jsx_runtime from "react/jsx-runtime";
import Image from "next/image";
import dynamic from "next/dynamic";
import { AutoToc, type TocHeading } from "./AutoToc";
import { StickyToc } from "./StickyToc";

const FontPreviewExample = dynamic(() => import("./FontPreviewExample"));

type MdxComponentProps = {
  components?: Record<string, React.ComponentType<any>>;
};

function getServerMDXComponent(code: string): React.ComponentType<MdxComponentProps> {
  const scope = { React, _jsx_runtime };
  const fn = new Function(...Object.keys(scope), code);
  return fn(...Object.values(scope)).default;
}

const mdxComponents: Record<string, React.ComponentType<any>> = {
  Image,
  FontPreviewExample,
  p: (props: React.HTMLAttributes<HTMLParagraphElement>) => (
    <p {...props} className="text-base leading-7" />
  ),
  li: (props: React.LiHTMLAttributes<HTMLLIElement>) => (
    <li {...props} className="not-prose marker:text-black dark:marker:text-gray-500" />
  ),
  img: ({
    loading = "lazy",
    decoding = "async",
    className,
    alt,
    ...props
  }: React.ImgHTMLAttributes<HTMLImageElement>) => (
    <span className="flex flex-col items-center mb-4">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        {...props}
        alt={alt ?? ""}
        loading={loading}
        decoding={decoding}
        className={className ? `max-w-full h-auto my-0 ${className}` : "max-w-full h-auto my-0"}
      />
      {alt && (
        <span className="block text-center text-sm text-gray-600 dark:text-gray-400 mt-2">
          {alt}
        </span>
      )}
    </span>
  ),
  table: (props: React.TableHTMLAttributes<HTMLTableElement>) => (
    <table
      {...props}
      className="w-full border-collapse border border-gray-300 dark:border-gray-700"
    />
  ),
  thead: (props: React.HTMLAttributes<HTMLTableSectionElement>) => (
    <thead {...props} className="bg-gray-100 dark:bg-gray-800" />
  ),
  tbody: (props: React.HTMLAttributes<HTMLTableSectionElement>) => <tbody {...props} />,
  tr: (props: React.HTMLAttributes<HTMLTableRowElement>) => (
    <tr {...props} className="border-b border-gray-200 dark:border-gray-700" />
  ),
  th: (props: React.ThHTMLAttributes<HTMLTableCellElement>) => (
    <th
      {...props}
      className="px-4 py-2 font-bold text-left border border-gray-300 dark:border-gray-700"
    />
  ),
  td: (props: React.TdHTMLAttributes<HTMLTableCellElement>) => (
    <td {...props} className="px-4 py-2 border border-gray-300 dark:border-gray-700" />
  ),
  h1: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h1 {...props} className="my-8 font-bold text-2xl" />
  ),
};

interface MdxProps {
  code: string;
  headings?: TocHeading[];
}

export function Mdx({ code, headings }: MdxProps) {
  const Component = getServerMDXComponent(code);
  const tocHeadings = Array.isArray(headings) ? headings : [];

  return (
    <>
      {tocHeadings.length > 0 && (
        <>
          <AutoToc headings={tocHeadings} />
          <StickyToc headings={tocHeadings} />
        </>
      )}
      <Component components={mdxComponents} />
    </>
  );
}
