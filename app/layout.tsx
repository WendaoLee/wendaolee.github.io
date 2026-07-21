import "./globals.css"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/ThemeProvider"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import { Metadata } from "next"

const inter = Inter({ subsets: ["latin"] })

export const metadata:Metadata = {
  metadataBase: new URL("https://leewendao.otterstack.cn"),
  title: "戒酒多年的李问道👏 - Blog of Wendaolee - 李问道的博客站点/李问道的个人主页",
  description: "这里是李问道的个人博客站点👏存放了李问道个人的创作产出。对于李问道是谁的问题，你可以认为李问道是一个写东西的人，他的主业是开发，但是他认为代码的本质是一种写作。'求取知识是贯穿人一生的主题'——这个站点便是李问道存放自己对知识的求取的地方。 // Here is WendaoLee(or Erika Lee)'s blogs.Lucky to see you.WendaoLee is a programmer and a writer.He likes writing something like code and articles.You can find something interesting here.",
  keywords:["李问道","李问道的博客","Wendaolee","Wendaolee's blog","Erika Lee","Erika Lee's blog"],
  authors: [{name:"李问道",url:"https://leewendao.otterstack.cn"},{name:"Wendao Lee",url:"https://leewendao.otterstack.cn"},{name:"Erika Lee",url:"https://leewendao.otterstack.cn"},{name:"Wendaolee",url:"https://leewendao.otterstack.cn"}],
  creator: "WendaoLee",
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    images: ["https://leewendao.otterstack.cn/wendaolee.jpeg"],
    type: "website",
    siteName: "李问道的博客 / Blog of Wendaolee||Erika Lee",
    url:"https://leewendao.otterstack.cn",
    title:"李问道的博客 / Blog of Wendaolee||Erika Lee",
    description:"这里是李问道的个人博客站点👏存放了李问道个人的创作产出。'求取知识是贯穿人一生的主题'——这个站点便是李问道存放自己对知识的求取的地方。",
  },
}

interface RootLayoutProps {
  children: React.ReactNode
}

export default function RootLayout({ children }: RootLayoutProps) {

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "李问道的博客 / Blog of Wendaolee||Erika Lee",
    url: "https://leewendao.otterstack.cn",
    description: "这里是李问道的个人博客站点👏存放了李问道个人的创作产出。'求取知识是贯穿人一生的主题'——这个站点便是李问道存放自己对知识的求取的地方。",
    image: "https://leewendao.otterstack.cn/wendaolee.jpeg",
    author: {
      "@type": "Person",
      name: "李问道",
      url: "https://leewendao.otterstack.cn",
    },
    mainEntityOfPage: [
      {
        "@type": "WebPage",
        "@id": "https://leewendao.otterstack.cn/writings",
        name: "文章列表",
        description: "李问道的文章索引列表。"
      },
    ],
    sitemap: "https://leewendao.otterstack.cn/sitemap.xml",
  };

  return (
    <html lang="zh-CN">
      <head>
        <meta name="msvalidate.01" content="57E0CBA3CFE186ABC92C0F15F03951DF" />
         <meta name="shenma-site-verification" content="d1e7d0f64af9cc04a9afdacec2718144_1755497879"/>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      </head>
      <body
        className={`antialiased min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-50`}
        style={{
          fontFamily:"'OPPO Sans 4.0', 'Source Han Sans'"
        }}
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
