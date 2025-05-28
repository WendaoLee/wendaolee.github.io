import { defineDocumentType, makeSource } from "contentlayer2/source-files"
import rehypeKatex from "rehype-katex"
import remarkMath from "remark-math"
import remarkGfm from "remark-gfm"
import rehypeAutolinkHeadings from "rehype-autolink-headings"
import rehypeSlug from "rehype-slug"
// import rehypePrettyCode from "rehype-pretty-code"
import rehypeExpressiveCode from "rehype-expressive-code"
import ecTwoSlash from 'expressive-code-twoslash'

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
      rehypeExpressiveCode,
      rehypeSlug,
      rehypeKatex,
      [
        rehypeExpressiveCode,
        rehypeExpressiveCodeOptions
      ],
      [
        rehypeAutolinkHeadings,
        {
          properties: {
            className: ['anchor'],
          },
        },
      ],
      // [
      //   rehypePrettyCode,
      //           {
      //     theme: 'one-dark-pro',
      //     onVisitLine(node) {
      //       // Prevent lines from collapsing in `display: grid` mode, and allow empty
      //       // lines to be copy/pasted
      //       if (node.children.length === 0) {
      //         node.children = [{ type: 'text', value: ' ' }]
      //       }
      //     },
      //     onVisitHighlightedLine(node) {
      //       node.properties.className.push('line--highlighted')
      //     },
      //     onVisitHighlightedWord(node) {
      //       node.properties.className = ['word--highlighted']
      //     },
      //   }, 
      // ]
    ],
  }
})
