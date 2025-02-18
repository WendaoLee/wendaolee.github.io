import { allWritings } from "@/.contentlayer/generated";
import { getReadableDate } from "@/lib/date";

export default function WritingsLists() {
  const sortedWritings = allWritings.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  return (
    <div>
      <h3>Blog</h3>
      <p className="mt-0">Blog 多为技术与学术相关的文章。</p>
      <nav id='blog-list-nav' aria-label="blog列表">
        <ul>
          {sortedWritings
            .filter((post) => post.category === "blog")
          .map((post) => (
            <li key={post.slug}>
              <a className="text-[16px] no-underline font-bold" aria-label={post.title} href={`${post.slug}`}>
                {post.title}
              </a>{" "}
              , {getReadableDate(post.date)}
            </li>
          ))}
      </ul>
      </nav>

      <h3>Essay</h3>
      <p className="mt-0">Essay 为我自己的随笔、杂文、评论等内容。</p>
      <nav id='essay-list-nav' aria-label="essay列表">
        <ul>
          {sortedWritings
            .filter((post) => post.category === "essay")
          .map((post) => (
            <li key={post.slug}>
              <a className="text-[16px] no-underline font-bold" href={`${post.slug}`}>
                {post.title}
              </a>{" "}
              , {getReadableDate(post.date)}
            </li>
          ))}
      </ul>
      </nav>

      <h3>Translation</h3>
      <p className="mt-0">Translation 为我的翻译内容。</p>
      <nav id='translation-list-nav' aria-label="translation列表">
        <ul>
        {sortedWritings
          .filter((post) => post.category === "translation")
          .map((post) => (
            <li key={post.slug}>
              <a className="text-[16px] no-underline font-bold" href={`${post.slug}`}>
                {post.title}
              </a>{" "}
              , {getReadableDate(post.date)}
            </li>
          ))}
      </ul>
      </nav>

      <h3>Note</h3>
      <p className="mt-0">Note 为我自己的学习笔记。同样的，我会把一些随手记的、或者是内容比较杂乱的文章放在这里。希望它能够帮到你。</p>
      <nav id='note-list-nav' aria-label="note列表">
        <ul>
        {sortedWritings
          .filter((post) => post.category === "note")
          .map((post) => (
            <li key={post.slug}>
              <a className="text-[16px] no-underline font-bold" href={`${post.slug}`}>
                {post.title}
              </a>{" "}
              , {getReadableDate(post.date)}
            </li>
          ))}
      </ul>
      </nav>

      <h3>Story</h3>
      <p className="mt-0">Story 为我自己写的小说。</p>
      <nav id='story-list-nav' aria-label="story列表">
        <ul>
        {sortedWritings
          .filter((post) => post.category === "story")
          .map((post) => (
            <li key={post.slug}>
              <a className="text-[16px] no-underline font-bold" href={`${post.slug}`}>
                {post.title}
              </a>{" "}
              , {getReadableDate(post.date)}
            </li>
          ))}
      </ul>
      </nav>
    </div>
  );
}
