import { allWorks } from "@/.contentlayer/generated";
import { getReadableDate } from "@/lib/date";

export default function WorksLists(){
    return <div>
        <nav id='works-list-nav' aria-label="works列表">
            {allWorks.map((post)=>{
                return <li key={post.slug}>
                    <a className="text-[16px] no-underline font-bold" href={`${post.slug}`}>
                        {post.title}
                    </a>
                    <span>　</span>[最后更新时间: {getReadableDate(post.date)}]
                </li>
            })}
        </nav>
    </div>
}
