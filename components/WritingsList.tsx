"use client";
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
      <ul>
        {sortedWritings
          .filter((post) => post.category === "blog")
          .map((post) => (
            <li key={post.slug}>
              <a className="text-[17px]" href={`${post.slug}`}>
                {post.title}
              </a>{" "}
              , {getReadableDate(post.date)}
            </li>
          ))}
      </ul>

      <h3>Essay</h3>
      <p className="mt-0">Essay 为我自己的随笔、杂文、评论等内容。</p>
      <ul>
        {sortedWritings
          .filter((post) => post.category === "essay")
          .map((post) => (
            <li key={post.slug}>
              <a className="text-[17px]" href={`${post.slug}`}>
                {post.title}
              </a>{" "}
              , {getReadableDate(post.date)}
            </li>
          ))}
      </ul>

      <h3>Translation</h3>
      <p className="mt-0">Translation 为我的翻译内容。</p>
      <ul>
        {sortedWritings
          .filter((post) => post.category === "translation")
          .map((post) => (
            <li key={post.slug}>
              <a className="text-[17px]" href={`${post.slug}`}>
                {post.title}
              </a>{" "}
              , {getReadableDate(post.date)}
            </li>
          ))}
      </ul>

      <h3>Note</h3>
      <p className="mt-0">Note 为我自己的学习笔记。</p>
      <ul>
        {sortedWritings
          .filter((post) => post.category === "note")
          .map((post) => (
            <li key={post.slug}>
              <a className="text-[17px]" href={`${post.slug}`}>
                {post.title}
              </a>{" "}
              , {getReadableDate(post.date)}
            </li>
          ))}
      </ul>

      <h3>Story</h3>
      <p className="mt-0">Story 为我自己的小说。</p>
      <ul>
        {sortedWritings
          .filter((post) => post.category === "story")
          .map((post) => (
            <li key={post.slug}>
              <a className="text-[17px]" href={`${post.slug}`}>
                {post.title}
              </a>{" "}
              , {getReadableDate(post.date)}
            </li>
          ))}
      </ul>
    </div>
  );
}
