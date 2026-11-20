import Link from "next/link";
import { allWorks } from "@/.contentlayer/generated";
import { getReadableDate } from "@/lib/date";
import UpdatedSpan from "./UpdatedSpan";

export default function WorksLists() {
  const sortedWorks = [...allWorks].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <div>
      <nav id="works-list-nav" aria-label="works列表">
        <ul>
          {sortedWorks.map((post) => (
            <li key={post.slug}>
              <Link className="text-[16px] no-underline font-bold" href={post.slug}>
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
