"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { CommandDialog, CommandInput, CommandItem, CommandList, Command } from "@/components/ui/command"
import { Matrix, search } from "text-search-engine"

interface SearchDocument {
  title: string
  description?: string
  slug: string
  category?: string
  date: string
  tags?: string[]
  content: string
}

interface BlogSearchProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

interface SearchResult {
  document: SearchDocument
  bodyMatches?: Matrix
  score: number
}

function isSearchDocument(value: unknown): value is SearchDocument {
  if (typeof value !== "object" || value === null) return false

  const document = value as Partial<SearchDocument>
  return typeof document.title === "string"
    && typeof document.slug === "string"
    && typeof document.content === "string"
    && typeof document.date === "string"
}

function HighlightedText({ text, highlightRange }: { text: string, highlightRange?: [number, number] }) {
  if (!highlightRange) return null

  const [start, inclusiveEnd] = highlightRange
  const end = inclusiveEnd + 1
  const contextStart = Math.max(0, start - 20)
  const contextEnd = Math.min(text.length, end + 20)

  return (
    <p>
      {contextStart > 0 && "..."}
      {text.slice(contextStart, start)}
      <span className="bg-blue-400 font-bold dark:bg-blue-600">{text.slice(start, end)}</span>
      {text.slice(end, contextEnd)}
      {contextEnd < text.length && "..."}
    </p>
  )
}

function calculateMatrixPower(matrix: Matrix) {
  return matrix.reduce((total, [start, end]) => total + end - start, 0)
}

export default function BlogSearch({ open, onOpenChange }: BlogSearchProps) {
  const router = useRouter()
  const [documents, setDocuments] = useState<SearchDocument[] | null>(null)
  const [indexError, setIndexError] = useState<string | null>(null)
  const [isLoadingIndex, setIsLoadingIndex] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [isSearching, setIsSearching] = useState(false)
  const [results, setResults] = useState<SearchResult[]>([])
  const hasRequestedIndex = useRef(false)

  const loadIndex = useCallback(async () => {
    setIsLoadingIndex(true)
    setIndexError(null)

    try {
      const response = await fetch("/search-index.json")
      if (!response.ok) throw new Error(`Search index request failed: ${response.status}`)

      const payload: unknown = await response.json()
      if (!Array.isArray(payload) || !payload.every(isSearchDocument)) {
        throw new Error("Search index has an invalid format")
      }

      setDocuments(payload)
    } catch {
      setIndexError("搜索索引加载失败，请检查网络后重试。")
    } finally {
      setIsLoadingIndex(false)
    }
  }, [])

  useEffect(() => {
    if (!open || documents || hasRequestedIndex.current) return
    hasRequestedIndex.current = true
    void loadIndex()
  }, [documents, loadIndex, open])

  const retryIndex = useCallback(() => {
    hasRequestedIndex.current = true
    void loadIndex()
  }, [loadIndex])

  useEffect(() => {
    const query = searchQuery.trim()
    if (!documents || !query) {
      setResults([])
      setIsSearching(false)
      return
    }

    setIsSearching(true)
    const timer = window.setTimeout(() => {
      const nextResults = documents
        .map((document): SearchResult | null => {
          const bodyMatches = search(document.content, query)
          const titleMatches = search(document.title, query)
          if (bodyMatches === undefined && titleMatches === undefined) return null

          const score = (bodyMatches ? calculateMatrixPower(bodyMatches) : 0)
            + (titleMatches ? 10 * calculateMatrixPower(titleMatches) : 0)

          return { document, bodyMatches, score }
        })
        .filter((result): result is SearchResult => result !== null)
        .sort((a, b) => b.score - a.score)
        .slice(0, 20)

      setResults(nextResults)
      setIsSearching(false)
    }, 200)

    return () => window.clearTimeout(timer)
  }, [documents, searchQuery])

  const handleSelect = useCallback((slug: string) => {
    onOpenChange(false)
    router.push(slug)
  }, [onOpenChange, router])

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <Command shouldFilter={false}>
        <CommandInput
          placeholder="输入关键词搜索文章..."
          value={searchQuery}
          onValueChange={setSearchQuery}
          disabled={isLoadingIndex || Boolean(indexError)}
          className="p-4 text-base focus:outline-none bg-transparent text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
        />

        <CommandList className="max-h-[400px] overflow-y-auto">
          {isLoadingIndex && <p className="p-4 text-sm text-gray-500">正在加载搜索索引...</p>}
          {indexError && (
            <div className="p-4 text-sm text-gray-500" role="alert">
              <p>{indexError}</p>
              <button type="button" className="mt-2 underline" onClick={retryIndex}>重试</button>
            </div>
          )}
          {documents && !searchQuery.trim() && <p className="p-4 text-sm text-gray-500">输入关键词开始搜索。</p>}
          {isSearching && <p className="p-4 text-sm text-gray-500">正在搜索...</p>}
          {documents && searchQuery.trim() && !isSearching && results.length === 0 && (
            <p className="p-4 text-sm text-gray-500">没有找到相关文章。</p>
          )}
          {results.map(({ document, bodyMatches }) => (
            <CommandItem
              key={document.slug}
              onSelect={() => handleSelect(document.slug)}
              className="cursor-pointer px-4 py-2 hover:bg-gray-100 dark:data-[selected=true]:bg-accent-dark dark:hover:bg-gray-700"
            >
              <div>
                {document.title}
                <HighlightedText text={document.content} highlightRange={bodyMatches?.[0]} />
              </div>
            </CommandItem>
          ))}
        </CommandList>
      </Command>
    </CommandDialog>
  )
}
