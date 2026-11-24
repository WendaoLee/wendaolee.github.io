import Link from "next/link";
import { rankedWritings } from "@/lib/filteredDatas";
import { getReadableDate } from "@/lib/date";

const CATEGORIES = [
  {
    key: "blog",
    title: "Blog",
    description: "Blog 多为技术与学术相关的文章。",
    navId: "blog-list-nav",
    ariaLabel: "blog列表",
  },
  {
    key: "essay",
    title: "Essay",
    description: "Essay 为我自己的随笔、杂文、评论等内容。",
    navId: "essay-list-nav",
    ariaLabel: "essay列表",
  },
  {
    key: "translation",
    title: "Translation",
    description: "Translation 为我的翻译内容。",
    navId: "translation-list-nav",
    ariaLabel: "translation列表",
  },
  {
    key: "note",
    title: "Note",
    description:
      "Note 为我自己的学习笔记。同样的，我会把一些随手记的、或者是内容比较杂乱的文章放在这里。希望它能够帮到你。",
    navId: "note-list-nav",
    ariaLabel: "note列表",
  },
  {
    key: "story",
    title: "Story",
    description: "Story 为我自己写的小说。",
    navId: "story-list-nav",
    ariaLabel: "story列表",
  },
] as const;

export default function WritingsLists() {
  return (
    <div>
      {CATEGORIES.map(({ key, title, description, navId, ariaLabel }) => (
        <section key={key}>
          <h3>{title}</h3>
          <p className="mt-0">{description}</p>
          <nav id={navId} aria-label={ariaLabel}>
            <ul>
              {rankedWritings
                .filter((post) => post.category === key)
                .map((post) => (
                  <li key={post.slug}>
                    <Link
                      className="text-[16px] no-underline font-bold"
                      aria-label={post.title}
                      href={post.slug}
                    >
                      {post.isDraft && (
                        <span className="mr-1.5 inline-block rounded bg-amber-100 px-1.5 py-0.5 text-xs font-semibold text-amber-800 dark:bg-amber-900/40 dark:text-amber-300">
                          DRAFT
                        </span>
                      )}
                      {post.title}
                    </Link>{" "}
                    , {getReadableDate(post.date)}
                  </li>
                ))}
            </ul>
          </nav>
        </section>
      ))}
    </div>
  );
}
