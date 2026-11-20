"use client";

import React, { useEffect, useRef, useState } from "react";
import { useTheme } from "next-themes";

const UTTERANCES_ORIGIN = "https://utteranc.es";

const Utterances: React.FC = () => {
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const { resolvedTheme } = useTheme();
  const [shouldLoad, setShouldLoad] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  const utterancesTheme = resolvedTheme === "dark" ? "github-dark" : "github-light";

  // Lazy load comments when the container scrolls near the viewport
  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper || shouldLoad) return;

    if (typeof IntersectionObserver === "undefined") {
      setShouldLoad(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setShouldLoad(true);
          observer.disconnect();
        }
      },
      { rootMargin: "200px 0px" }
    );

    observer.observe(wrapper);
    return () => observer.disconnect();
  }, [shouldLoad]);

  // Mount Utterances script once when triggered
  useEffect(() => {
    if (!shouldLoad || !containerRef.current) return;
    const container = containerRef.current;
    container.replaceChildren();

    const script = document.createElement("script");
    script.src = `${UTTERANCES_ORIGIN}/client.js`;
    script.async = true;
    script.setAttribute("repo", "WendaoLee/wendaolee.github.io");
    script.setAttribute("issue-term", "pathname");
    script.setAttribute("label", "✨blog ");
    script.setAttribute("theme", utterancesTheme);
    script.setAttribute("crossorigin", "anonymous");
    script.onload = () => {
      setIsLoaded(true);
    };
    container.appendChild(script);

    return () => {
      container.replaceChildren();
    };
    // Only run script insertion once when shouldLoad becomes true;
    // subsequent theme changes are synced via postMessage below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shouldLoad]);

  // Sync site theme changes to the loaded Utterances iframe
  useEffect(() => {
    if (!containerRef.current) return;
    const iframe = containerRef.current.querySelector<HTMLIFrameElement>(
      "iframe.utterances-frame"
    );
    if (!iframe?.contentWindow) return;

    iframe.contentWindow.postMessage(
      { type: "set-theme", theme: utterancesTheme },
      UTTERANCES_ORIGIN
    );
  }, [utterancesTheme, isLoaded]);

  return (
    <section
      ref={wrapperRef}
      aria-label="评论区"
      data-pagefind-ignore
      className="mt-8 min-h-[120px]"
    >
      {!isLoaded && (
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {shouldLoad
            ? "Comments is loading... / 评论区正在加载中..."
            : "向下滚动加载评论区..."}
        </p>
      )}
      <div ref={containerRef} id="utterances-comments-container" />
    </section>
  );
};

export default Utterances;
