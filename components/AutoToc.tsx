"use client";
import { ArrowBigDown, ArrowDown, ArrowDownIcon, ArrowDownWideNarrow, ArrowUpIcon, Triangle } from "lucide-react";
import { useEffect, useState } from "react";

interface Heading {
  id: string;
  text: string;
  level: number;
}

export function AutoToc() {
  const [headings, setHeadings] = useState<Heading[]>([]);
  const [isCollapsed, setIsCollapsed] = useState(true);

  useEffect(() => {
    const headingElements = Array.from(
      document.querySelectorAll("article h1, article h2, article h3, article h4")
    ) as HTMLElement[];

    headingElements.shift()

    const headingsData = headingElements.map((heading) => ({
      id: heading.id,
      text: heading.innerText,
      level: Number(heading.tagName[1]),
    }));

    setHeadings(headingsData);
  }, []);

  if (headings.length === 0) return null;

  const renderHeadingLevel1 = (heading: Heading) => {
    return <a href={`#${heading.id}`} className="block no-underline text-gray-700 hover:text-gray-900 dark:text-white">{heading.text}</a>
  }

  return (
    <div className="mb-8 px-8 py-2 rounded-lg bg-[#f5f5f5] dark:bg-[#2e2e33]">
      <div
        className="flex justify-between items-center cursor-pointer"
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        <div className="flex flex-row items-center gap-2">
          <Triangle className={`w-3 h-3 ${isCollapsed ? 'rotate-180' : ''}`} fill="currentColor" />
          <span className="text-base font-semibold md:text-base" style={{letterSpacing: '1px'}}>目录</span>
        </div>
      </div>
      {!isCollapsed && (
        <nav className="space-y-1 mt-2">
          <ul>
            {headings.map((heading) => (
              <>
                {heading.level === 1 && (
                  <li key={heading.id} style={{color:'black'}}>
                    {renderHeadingLevel1(heading)}
                  </li>
                )}
                {heading.level === 2 && (
                    <ul className="pl-4">
                      <li style={{listStyle:'circle'}}>
                        <a href={`#${heading.id}`} className="block no-underline text-gray-700 hover:text-gray-900 dark:text-white">
                          {heading.text}
                        </a>
                      </li>
                    </ul>
                )}
              </>
            ))}
          </ul>
        </nav>
      )}
    </div>
  );
}