"use client";

import { useEffect } from "react";

export interface CatalogProps {
  catalogs: {
    href: string;
    title: string;
  }[];
}

/**
 * 仅在大屏下在右侧显示的目录
 * @returns
 */
export function Catalog({ catalogs }: CatalogProps) {
  useEffect(() => {
    window.addEventListener("DOMContentLoaded", () => {
        // 定义视口观察者
      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          const id = entry.target.getAttribute("id");
          const targetIdNav = document.getElementById(`catalog-${id}`);
          if (!targetIdNav) return;

          if (entry.intersectionRatio > 0) {
            targetIdNav.classList.add("text-[#111]");
            targetIdNav.classList.remove("text-[#aaa]");
          } else {
            targetIdNav.classList.remove("text-[#111]");
            targetIdNav.classList.add("text-[#aaa]");
          }
        });
      });

      // 传递所有的 h2 标题
      document.querySelectorAll("h2[id]").forEach((section) => {
        observer.observe(section);
      });
    });
  }, []);

  const catalogsProducer = catalogs.map((catalog) => {
    return (
      <li key={catalog.href} id={`catalog-${catalog.href}`}>
        <a
          className="inline-block transition-all duration-300 ease-out delay-0 text-[#aaa]"
          style={{ textDecoration: "none initial inital inital" }}
          href={catalog.href}
        >
          {catalog.title}
        </a>
      </li>
    );
  });

  return (
    <nav className="fixed hidden mid:block">
      <ul style={{ listStyle: "none", padding: "0 0 0 0", margin: "0 0 0 0" }}>
        {catalogsProducer}
      </ul>
    </nav>
  );
}
