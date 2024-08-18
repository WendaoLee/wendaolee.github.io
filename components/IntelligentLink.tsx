"use client"
import Link from "next/link";
import { usePathname } from "next/navigation";
import { match } from "ts-pattern";

/**
 * 聪明的 Link 可以知道现在的页面是否是它所期望的
 * @param param0 
 * @returns 
 */
export function IntelligentLink({ href,className,children }:{href: string,className?: string,children: React.ReactNode}) {
  const path = usePathname();
  const isActive = match(path)
                    .with('/',(e) => href === '/')
                    .with(href,(e) => href.includes(path.split('/')[1]))
                    .otherwise(() => href.includes(path.split('/')[1]))
  return (
    <Link href={href} className={(className ?? '') + (isActive?' underline':'')}>{children}</Link>
  )
}