"use client";

import { useEffect, useMemo, useState } from "react";
import type { TocHeading } from "./AutoToc";

const indentClassByLevel: Record<number, string> = {
  1: "pl-0",
  2: "pl-4",
  3: "pl-8",
};

/**
 * 固定在右侧的目录组件（大屏展示，含当前章节高亮）
 */
export function StickyToc({ headings }: { headings: TocHeading[] }) {
  const visibleHeadings = useMemo(
    () => (headings ?? []).filter((heading) => heading.level < 4),
    [headings]
  );
  const [activeId, setActiveId] = useState<string>(visibleHeadings[0]?.id ?? "");

  useEffect(() => {
    if (visibleHeadings.length === 0) return;

    const elements = visibleHeadings
      .map((heading) => document.getElementById(heading.id))
      .filter((el): el is HTMLElement => el !== null);

    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntry = entries.find((entry) => entry.isIntersecting);
        if (visibleEntry?.target.id) {
          setActiveId(visibleEntry.target.id);
        }
      },
      {
        rootMargin: "-80px 0px -70% 0px",
        threshold: 0,
      }
    );

    elements.forEach((el) => observer.observe(el));

    return () => {
      observer.disconnect();
    };
  }, [visibleHeadings]);

  if (visibleHeadings.length === 0) return null;

  return (
    <aside
      aria-label="侧边文章目录"
      data-pagefind-ignore
      className="hidden 2xl:block fixed right-[8%] top-20 w-64 max-h-[calc(100vh-6rem)] overflow-y-auto not-prose"
      style={{ scrollbarWidth: "none" }}
    >
      <nav className="space-y-1">
        <div className="mb-4">
          <span className="text-base font-semibold tracking-wide text-slate-800 dark:text-slate-100">
            目录
          </span>
        </div>
        <ul className="space-y-2 list-none m-0 p-0">
          {visibleHeadings.map((heading, index) => {
            const isActive = activeId === heading.id;
            return (
              <li
                key={`${heading.id}-${index}`}
                className={indentClassByLevel[heading.level] ?? "pl-8"}
              >
                <a
                  href={`#${heading.id}`}
                  aria-current={isActive ? "location" : undefined}
                  className={`block text-sm no-underline transition-colors ${
                    isActive
                      ? "font-semibold text-slate-950 dark:text-white"
                      : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                  }`}
                >
                  {heading.text}
                </a>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
