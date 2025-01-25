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
        </div>
        <div>
            <h3>WIP(Work In Progress)</h3>
            <p>🚧 施工中的项目。</p>
        </div>
    </div>
}
