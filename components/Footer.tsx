"use client"
import { Rss } from "lucide-react";
import { useTheme } from "next-themes";
import { SiDouban, SiGithub, SiWechat } from "react-icons/si";

export default function Footer() {
    const {theme,setTheme} = useTheme()

  return (
    <footer className="flex flex-col mt-6 gap-5 justify-center items-center w-full h-24 border-t bg-white dark:bg-slate-950 dark:border-slate-900">
        <div className="flex gap-3">
            <a href="/rss">
                <Rss></Rss>
            </a>
            {/* <a href="https://github.com/WendaoLee">
                <SiGithub size={24}></SiGithub>
            </a>
            <a className="w-[24px]" href="https://www.douban.com/people/leewendao">
                <SiDouban size={24}></SiDouban>
            </a>
            <a className="w-[24px]" href="/page/wechat">
                <SiWechat size={24}></SiWechat>
            </a> */}
        </div>
      <p className="text-sm text-center underline">
        <a href="/">
            © 2024 李问道 - Blog of Wendaolee
        </a>
      </p>
    </footer>
  )
}