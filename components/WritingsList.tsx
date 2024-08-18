"use client"
import { allWritings } from "@/.contentlayer/generated"
import { getReadableDate } from "@/lib/date"

export default function WritingsLists(){
    return (
        <div>
        <ul>
            {allWritings.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((post) => (
            <li key={post.slug}>
                <a className="text-[17px]" href={`${post.slug}`}>{post.title}</a> , {getReadableDate(post.date)}
            </li>
            ))}
        </ul>
        </div>
    )
}