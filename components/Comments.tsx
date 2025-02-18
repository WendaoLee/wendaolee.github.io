"use client";
import React, { useEffect, useRef, useState } from 'react';

const Utterances: React.FC = () => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const isLoaded = useRef(false);

  useEffect(() => {
    if (containerRef.current) {
      // 先清空容器，防止重复加载
      while (containerRef.current.firstChild) {
        containerRef.current.removeChild(containerRef.current.firstChild);
      }
      // 创建 script 标签
      const script = document.createElement('script');
      script.src = "https://utteranc.es/client.js";
      script.async = true;
      script.setAttribute("repo", "WendaoLee/wendaolee.github.io");
      script.setAttribute("issue-term", "pathname");
      script.setAttribute("label", "✨blog ");
      script.setAttribute("theme", "preferred-color-scheme");
      script.setAttribute("crossorigin", "anonymous");
      script.onload = () => {
        console.log("Comments loaded");
        isLoaded.current = true;
      }
      containerRef.current.appendChild(script);
    }
  }, []);

  return <div ref={containerRef} id="utterances-comments-container">
    {isLoaded.current === false && <p>Comments is loading... / 评论区正在加载中...</p>}
  </div>;
};

export default Utterances;
