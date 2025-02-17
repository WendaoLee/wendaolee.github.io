import WorksLists from "@/components/WorksLIst";
import { Metadata } from "next";

export async function generateMetadata():Promise<Metadata>{
    return {
        title: "文章外的产出 - 李问道的博客 / Works of Wendaolee",
    }
}

export default function WorksPage(){
    return <div className="mt-5">
        <header>
            <h1 className="mb-0">文章外的产出 😼</h1>
            <h4 className="mt-0">Slides & Publications</h4>
            <p>此处存放的是一些可能能够帮助你的产出。</p>
        </header>
        <div>
            <h3>Slides</h3>
            <p className="mt-0">一些 PPT。</p>
            <ul>
                <li>
                    <a href="https://1drv.ms/p/c/21572062c88e2c1a/ERosjshiIFcggCGvBQAAAAABShUoIvLb-1X8JPc4roG2eQ?e=jW4193">RAG 懵懂指南</a>，去年夏天的公司内部分享内容
                </li>
                <li>
                    <a href="https://1drv.ms/p/c/21572062c88e2c1a/ERosjshiIFcggCG7BQAAAAABIx3gmY4BD6wF9sOuqKmisQ?e=SVjdyL">开源社区 Github 的使用以及如何评估一个开源项目</a>,去年夏天给实验室的同学分享的浅显内容
                </li>
            </ul>
        </div>
        <div>
            <h3>WIP(Work In Progress)</h3>
            <p>🚧 施工中的项目。</p>
            <WorksLists></WorksLists>
        </div>
    </div>
}
