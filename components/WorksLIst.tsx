import Link from "next/link";
import { rankedWorks } from "@/lib/filteredDatas";
import { getReadableDate } from "@/lib/date";
import UpdatedSpan from "./UpdatedSpan";

export default function WorksLists() {
  return (
    <div>
      <nav id="works-list-nav" aria-label="works列表">
        <ul>
          {rankedWorks.map((post) => (
            <li key={post.slug}>
              <Link className="text-[16px] no-underline font-bold" href={post.slug}>
                {post.isDraft && (
                  <span className="mr-1.5 inline-block rounded bg-amber-100 px-1.5 py-0.5 text-xs font-semibold text-amber-800 dark:bg-amber-900/40 dark:text-amber-300">
                    DRAFT
                  </span>
                )}
                {post.title}
              </Link>
              <span>　</span>
              <UpdatedSpan text={`[最后更新于 ${getReadableDate(post.date)}]`} />
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
