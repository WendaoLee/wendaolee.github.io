import { allWorks, allWritings } from "@/.contentlayer/generated"

export const dynamic = "force-static"

function toPlainText(source: string) {
  return source
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/<[^>]+>/g, " ")
    .replace(/[#>*_`~|]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
}

export async function GET() {
  const documents = [...allWritings, ...allWorks].map((document) => ({
    title: document.title,
    description: document.description,
    slug: document.slug,
    category: document.category,
    date: document.date,
    tags: document.tags,
    content: toPlainText(document.body.raw),
  }))

  return new Response(JSON.stringify(documents), {
    headers: { "Content-Type": "application/json; charset=utf-8" },
  })
}
