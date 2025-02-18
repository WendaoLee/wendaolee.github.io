"use client"

import { useEffect, useState } from "react"

/**
 * 表示标题的数据结构
 */
interface Heading {
  id: string
  text: string
  level: number
}

/**
 * 固定在右侧的目录组件
 */
export function StickyToc() {
  const [headings, setHeadings] = useState<Heading[]>([])

  useEffect(() => {
    const headingElements = Array.from(
      document.querySelectorAll("article h1, article h2, article h3, article h4")
    ) as HTMLElement[]

    headingElements.shift()

    const headingsData = headingElements.map((heading) => ({
      id: heading.id,
      text: heading.innerText,
      level: Number(heading.tagName[1])
    }))

    setHeadings(headingsData)
  }, [])

  if (headings.length === 0) return null

  return (
    <div className="hidden 2xl:block fixed right-[8%] top-20 w-64 max-h-[calc(100vh-6rem)] overflow-y-auto" style={{scrollbarWidth:'none'}}>
      <nav className="space-y-1">
        <div className="mb-4">
          <span className="text-base font-semibold" style={{ letterSpacing: '1px' }}>目录</span>
        </div>
        <ul className="space-y-2">
          {headings.map((heading) => (
            <li 
              key={heading.id}
              className={`
                ${heading.level === 1 ? 'pl-0' : ''}
                ${heading.level === 2 ? 'pl-4' : ''}
                ${heading.level === 3 ? 'pl-8' : ''}
              `}
              style={{
                listStyle:'none'
              }}
            >
              <a 
                href={`#${heading.id}`}
                className="block text-sm no-underline text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
              >
                {heading.text}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  )
}