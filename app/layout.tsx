import "./globals.css"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/ThemeProvider"
import Header from "@/components/Header"
import Footer from "@/components/Footer"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "戒酒多年的李问道👏 - Blog of Wendaolee - 李问道的博客站点/李问道的个人主页",
  description: "这里是李问道的个人博客站点👏存放了李问道个人的创作产出。对于李问道是谁的问题，你可以认为李问道是一个技术人与作家，平常喜欢随便写写东西。'求取知识是贯穿人一生的主题'——这个站点便是李问道存放自己对知识的求取的地方。 // Here is WendaoLee(or Erika Lee)'s blogs.Lucky to see you.WendaoLee is a programmer and a writer.He likes writing something like code and articles.You can find something interesting here.",
  keyword:["李问道","李问道的博客","Wendaolee","Wendaolee's blog","Erika Lee","Erika Lee's blog"],
  authors: ["李问道","Wendao Lee","Erika Lee","Wendaolee"],
  creator: "WendaoLee",
  language: "zh-CN",
}

interface RootLayoutProps {
  children: React.ReactNode
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en">
      <head>
        <meta name="msvalidate.01" content="57E0CBA3CFE186ABC92C0F15F03951DF" />
      </head>
      <body
        className={`font-serif antialiased min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-50 ${inter.className}`}
      >
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <div className="max-w-4xl mx-auto py-10 px-4">
            <Header></Header>
            <main className="w-full prose dark:prose-invert">{children}</main>
            <Footer></Footer>
          </div>
        </ThemeProvider>
      </body>
    </html>
  )
}
