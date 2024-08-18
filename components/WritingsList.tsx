"use client"
import { allWritings } from "@/.contentlayer/generated"
import { getReadableDate } from "@/lib/date"
import { useState } from "react"

export default function WritingsLists(){
    return (
        <div>
        <ul>
            {allWritings.map((post) => (
            <li key={post.slug}>
                <a href={`${post.slug}`}>{post.title}</a> , {getReadableDate(post.date)}
            </li>
            ))}
        </ul>
        </div>
    )
}