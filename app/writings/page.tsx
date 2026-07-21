import WritingsLists from "@/components/WritingsList";
import { Metadata } from "next";

export async function generateMetadata():Promise<Metadata>{
    return {
        title: "文章列表 - 李问道的博客 / Blog of Wendaolee",
        description: "李问道的文章索引列表。 // Here is WendaoLee(or Erika Lee)'s blogs' list.You can find something interesting here.",
        keywords:["李问道","李问道的文章","Wendaolee","Wendaolee's blog","Erika Lee","Erika Lee's blog","Blogs of Wendaolee"],
        authors: [{name:"李问道",url:"https://leewendao.otterstack.cn"},{name:"Wendao Lee",url:"https://leewendao.otterstack.cn"},{name:"Erika Lee",url:"https://leewendao.otterstack.cn"},{name:"Wendaolee",url:"https://leewendao.otterstack.cn"}],
        creator: "WendaoLee",
        alternates: {
            canonical: "https://leewendao.otterstack.cn/writings",
        },
        openGraph: {
            images: ["https://leewendao.otterstack.cn/wendaolee.jpeg"],
            type: "website",
            siteName: "文章列表 - 李问道的博客 / Blog of Wendaolee",
            url:"https://leewendao.otterstack.cn/writings",
            title:"文章列表 - 李问道的博客 / Blog of Wendaolee",
            description:"李问道的文章索引列表。 // Here is WendaoLee(or Erika Lee)'s blogs' list.You can find something interesting here.",
          },
    }
}

export default function WritingsPage(){
    return (
        <div className="mt-5">
            <header>
                <h1 className="mb-0">本站存放的文章列表</h1>
            </header>
            <h4 className="mt-0">Wrtings</h4>
            <p>是的，我还有很多文章没搬过来😴</p>
            <WritingsLists></WritingsLists>
        </div>
    )
}
