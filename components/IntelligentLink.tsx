"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

/**
 * 聪明的 Link 可以知道现在的页面是否是它所期望的
 */
export function IntelligentLink({
  href,
  className,
  children,
}: {
  href: string;
  className?: string;
  children: React.ReactNode;
}) {
  const path = usePathname();
  const isActive =
    href === "/"
      ? path === "/"
      : path === href || path.startsWith(`${href}/`);

  return (
    <Link href={href} className={(className ?? "") + (isActive ? " underline" : "")}>
      {children}
    </Link>
  );
}
