import "./globals.css"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/ThemeProvider"
import Header from "@/components/Header"
import Footer from "@/components/Footer"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "李问道 - Blog of Wendaolee",
  description: "这里是李问道的个人博客站点👏存放了李问道个人的创作产出。 // Here is Wendaolee(or Erika Lee)'s blogs.Lucky to see you.",
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
