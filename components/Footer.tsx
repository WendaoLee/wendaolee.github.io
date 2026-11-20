import Link from "next/link";
import { Rss } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer
      data-pagefind-ignore
      className="flex flex-col mt-6 gap-5 justify-center items-center w-full h-24 border-t bg-slate-50 dark:bg-slate-950 dark:border-slate-900"
    >
      <div className="flex gap-3">
        <a href="/rss.xml" aria-label="RSS 订阅">
          <Rss />
        </a>
      </div>
      <p className="text-sm text-center underline">
        <Link href="/" aria-label="点击此处返回李问道的博客">
          © 2024–{currentYear} 李问道 - Blog of Wendaolee
        </Link>
      </p>
    </footer>
  );
}
