import { defineDocumentType, makeSource } from "contentlayer2/source-files"
import rehypeKatex from "rehype-katex"
import remarkMath from "remark-math"
import remarkGfm from "remark-gfm"
import rehypeAutolinkHeadings from "rehype-autolink-headings"
import rehypeSlug from "rehype-slug"
import rehypeExpressiveCode from "rehype-expressive-code"
import ecTwoSlash from 'expressive-code-twoslash'
import { extractHeadings } from "./lib/extractHeadings.js"
import rehypeLocalImageSize from "./lib/rehypeLocalImageSize.js"

const rehypeExpressiveCodeOptions = {
  plugins: [ecTwoSlash()]
}

/** @type {import('contentlayer2/source-files').ComputedFields} */
const computedFields = {
  slug: {
    type: "string",
    resolve: (doc) => `/${doc._raw.flattenedPath}`,
  },
  slugAsParams: {
    type: "string",
    resolve: (doc) => doc._raw.flattenedPath.split("/").slice(1).join("/"),
  },
  headings: {
    type: "json",
    resolve: (doc) => extractHeadings(doc.body.raw),
  },
}

export const Page = defineDocumentType(() => ({
  name: "Page",
  filePathPattern: `pages/**/*.mdx`,
  contentType: "mdx",
  fields: {
    title: {
      type: "string",
      required: true,
    },
    description: {
      type: "string",
    },
  },
  computedFields,
}))

export const Post = defineDocumentType(() => ({
  name: "Writings",
  filePathPattern: `writings/**/*.mdx`,
  contentType: "mdx",
  fields: {
    title: {
      type: "string",
      required: true,
    },
    description: {
      type: "string",
    },
    date: {
      type: "date",
      required: true,
    },
    category:{
      type:"string",
      required:false
    },
    tags:{
      type:"list",
      of:{
        type:"string"
      },
      required:false
    }
  },
  computedFields,
}))

export const Work = defineDocumentType(() => ({
  name: "Work",
  filePathPattern: `works/**/*.mdx`,
  contentType: "mdx",
  fields: {
    title: {
      type: "string",
      required: true,
    },
    description: {
      type: "string",
    },
    date: {
      type: "date",
      required: true,
    },
    category:{
      type:"string",
      required:false
    },
    tags:{
      type:"list",
      of:{
        type:"string"
      },
      required:false
    }
  },
  computedFields,
}))

export default makeSource({
  contentDirPath: "./content",
  documentTypes: [Post, Page, Work],
  mdx: {
    remarkPlugins: [remarkMath, remarkGfm],
    rehypePlugins: [
      rehypeSlug,
      rehypeKatex,
      [
        rehypeExpressiveCode,
        rehypeExpressiveCodeOptions
      ],
      rehypeLocalImageSize,
      [
        rehypeAutolinkHeadings,
        {
          properties: {
            className: ['anchor'],
          },
        },
      ],
    ],
  }
})
