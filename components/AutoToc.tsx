"use client";

import { Triangle } from "lucide-react";
import { useState } from "react";

export interface TocHeading {
  id: string;
  text: string;
  level: number;
}

const itemClassByLevel: Record<number, string> = {
  1: "list-disc",
  2: "ml-6 list-[circle]",
  3: "ml-12 list-[square]",
};

export function AutoToc({ headings }: { headings: TocHeading[] }) {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const visibleHeadings = (headings ?? []).filter((heading) => heading.level <= 3);

  if (visibleHeadings.length === 0) return null;

  return (
    <div
      data-pagefind-ignore
      className="mb-8 px-8 py-2 rounded-lg bg-[#f5f5f5] dark:bg-[#2e2e33]"
    >
      <button
        type="button"
        aria-expanded={!isCollapsed}
        className="w-full flex justify-between items-center cursor-pointer text-left"
        onClick={() => setIsCollapsed((prev) => !prev)}
      >
        <div className="flex flex-row items-center gap-2">
          <Triangle
            className={`w-3 h-3 ${isCollapsed ? "rotate-180" : ""}`}
            fill="currentColor"
          />
          <span
            className="text-base font-semibold md:text-base"
            style={{ letterSpacing: "1px" }}
          >
            目录
          </span>
        </div>
      </button>
      {!isCollapsed && (
        <nav aria-label="文章目录" className="space-y-1 mt-2">
          <ul>
            {visibleHeadings.map((heading, index) => (
              <li
                key={`${heading.id}-${index}`}
                className={itemClassByLevel[heading.level] ?? "ml-12 list-[square]"}
              >
                <a
                  href={`#${heading.id}`}
                  className="block no-underline text-gray-700 hover:text-gray-900 dark:text-white"
                >
                  {heading.text}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </div>
  );
}
