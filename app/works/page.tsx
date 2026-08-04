import WorksLists from "@/components/WorksLIst";
import { Metadata } from "next";

export async function generateMetadata():Promise<Metadata>{
    return {
        title: "文章外的产出 - 李问道的博客 / Works of Wendaolee",
        description: "李问道的作品、演示文稿和进行中的项目。",
        alternates: {
            canonical: "https://leewendao.otterstack.cn/works",
        },
        openGraph: {
            type: "website",
            url: "https://leewendao.otterstack.cn/works",
            title: "文章外的产出 - 李问道的博客 / Works of Wendaolee",
            description: "李问道的作品、演示文稿和进行中的项目。",
            images: ["https://leewendao.otterstack.cn/wendaolee.jpeg"],
        },
    }
}

const slides = [
    {
        title: "RAG 懵懂指南",
        link: "https://1drv.ms/p/c/21572062c88e2c1a/ERosjshiIFcggCGvBQAAAAABShUoIvLb-1X8JPc4roG2eQ?e=jW4193",
        additional: "2024年夏天在公司内部分享的内容",
    },
    {
        title: "开源社区 Github 的使用以及如何评估一个开源项目",
        link: "https://1drv.ms/p/c/21572062c88e2c1a/ERosjshiIFcggCG7BQAAAAABIx3gmY4BD6wF9sOuqKmisQ?e=SVjdyL",
        additional: "2024年夏天给实验室的同学分享的浅显内容",
    }
]

export default function WorksPage(){
    return <div className="mt-5">
        <header>
            <h1 className="mb-0">文章外的产出 😼</h1>
            <h4 className="mt-0">Slides & Publications</h4>
            <p>此处存放的是一些可能能够帮助你的产出。</p>
        </header>
        <div className="mt-5">
            <h3>Websites</h3>
            <ul>
                <li>
                    <a href="https://leewendao.otterstack.cn/AxRythem/">
                    【MIDI】
                    </a>

                        <p>
                            基于 <a href="https://github.com/Acgnu/AxRythem">https://github.com/Acgnu/AxRythem</a>这个项目进行一定更改的MIDI Website，放在这里主要是我个人导航用。
                        </p>
                </li>
            </ul>
        </div>
        <div>
            <h3>Slides</h3>
            <p className="mt-0">一些 PPT。</p>
            <ul>
                {slides.map((slide,index)=>{
                    return <li key={index}>
                        <a href={slide.link}>{slide.title}</a>, 
                        <span>{slide.additional}</span>
                    </li>
                })}
            </ul>
        </div>
        <div>
            <h3>WIP(Work In Progress)</h3>
            <p>🚧 施工中的项目。</p>
            <WorksLists></WorksLists>
        </div>
    </div>
}
