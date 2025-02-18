import { allWorks } from "@/.contentlayer/generated";
import { getReadableDate } from "@/lib/date";
import UpdatedSpan from "./UpdatedSpan";

export default function WorksLists(){
    return <div>
        <nav id='works-list-nav' aria-label="works列表">
            {allWorks.sort((a,b)=>new Date(b.date).getTime()-new Date(a.date).getTime()).map((post)=>{
                return <li key={post.slug}>
                    <a className="text-[16px] no-underline font-bold" href={`${post.slug}`}>
                        {post.title}
                    </a>
                    <span>　</span><UpdatedSpan text={`[最后更新于 ${getReadableDate(post.date)}]`} />
                </li>
            })}
        </nav>
    </div>
}
