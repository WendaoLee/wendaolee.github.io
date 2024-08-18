import Image from "next/image"
import { useMDXComponent } from "next-contentlayer2/hooks"
import WritingsLists from "./WritingsList"

const components = {
  Image,
  BlogLists: WritingsLists
}

interface MdxProps {
  code: string
}

export function Mdx({ code }: MdxProps) {
  const Component = useMDXComponent(code)

  return <Component components={components} />
}
