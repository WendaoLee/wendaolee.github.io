"use client"
import Image from "next/image"
import { useMDXComponent } from "next-contentlayer2/hooks"
import WritingsLists from "./WritingsList"
import { useEffect } from "react"

const components = {
  Image,
  BlogLists: WritingsLists
}

interface MdxProps {
  code: string
}


export function Mdx({ code }: MdxProps) {

  useEffect(()=>{
    const chapterTitles = document.querySelectorAll("h2[id]")
  },[])
  
  const Component = useMDXComponent(code)

  return <>
  <Component components={{...components,
    p: (props) => <p {...props} className="text-base md:text-lg leading-7" />,
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
    )
  }}>
  </Component>
  </>
}
