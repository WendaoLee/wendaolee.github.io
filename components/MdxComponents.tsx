/**
 * @mention 该组件永远不应该作为客户端组件使用
 */
"use client"
import Image from "next/image"
import { useMDXComponent } from "next-contentlayer2/hooks"
import WritingsLists from "./WritingsList"
import { AutoToc } from "./AutoToc"
import { StickyToc } from "./StickyToc"
import { EN_Merriweather } from "./Font"
import dynamic from "next/dynamic"

const FontPreviewExample = dynamic(() => import("./FontPreviewExample"), { ssr: false })

const components = {
  Image,
  BlogLists: WritingsLists,
  FontPreviewExample:FontPreviewExample
}

interface MdxProps {
  code: string
}


export function Mdx({ code }: MdxProps) {
  
  const Component = useMDXComponent(code)

  return <>
  <AutoToc></AutoToc>
  <StickyToc></StickyToc>
  <Component components={{...components,
    p: (props) => <p {...props} className={"text-base leading-7 " + `${EN_Merriweather}`} />,
    li: (props) => <li {...props} className="not-prose marker:text-black dark:marker:text-gray-500" />,
    // h2: (props) => <h2 {...props} className="text-2xl md:text-3xl font-bold mt-8 mb-4" />,
    img: (props) => (
      <figure className="flex flex-col items-center mb-4">
         {/* eslint-disable-next-line @next/next/no-img-element */}
        <img {...props} className="max-w-full h-auto" alt={props.alt} />
        {props.alt && (
          <figcaption className="text-center text-sm text-gray-600 mt-2">
            {props.alt}
          </figcaption>
        )}
      </figure>
    ),
    table: (props) => <table {...props} className="w-full border-collapse border border-gray-300 dark:border-gray-700" />,
    thead: (props) => <thead {...props} className="bg-gray-100 dark:bg-gray-800" />,
    tbody: (props) => <tbody {...props} />,
    tr: (props) => <tr {...props} className="border-b border-gray-200 dark:border-gray-700" />,
    th: (props) => <th {...props} className="px-4 py-2 font-bold text-left border border-gray-300 dark:border-gray-700" />,
    td: (props) => <td {...props} className="px-4 py-2 border border-gray-300 dark:border-gray-700" />,
    h1: (props) => <h1 {...props} className="my-8 font-bold" style={{fontSize:"1.5rem"}} id={typeof props.children === 'string' ? props.children.toLowerCase().replace(/\s+/g, '-') : undefined}/>,
    // h2: (props) => <h2 {...props}  id={typeof props.children === 'string' ? props.children.toLowerCase().replace(/\s+/g, '-') : undefined}/>,
    // h3: (props) => <h3 {...props}  id={typeof props.children === 'string' ? props.children.toLowerCase().replace(/\s+/g, '-') : undefined}/>,
    // h4: (props) => <h4 {...props}  id={typeof props.children === 'string' ? props.children.toLowerCase().replace(/\s+/g, '-') : undefined}/>,
  }}>
  </Component>
  </>
}
