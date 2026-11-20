"use client";

import { Fragment, useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Command,
  CommandDialog,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

interface PagefindSearchResultItem {
  id: string;
  data: () => Promise<PagefindDocumentData>;
}

interface PagefindDocumentData {
  url: string;
  excerpt: string;
  meta?: {
    title?: string;
  };
}

interface PagefindModule {
  init?: () => Promise<void>;
  search: (query: string) => Promise<{
    results: PagefindSearchResultItem[];
  }>;
}

interface SearchHit {
  id: string;
  url: string;
  title: string;
  excerpt: string;
}

interface BlogSearchProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function decodeHtmlEntities(input: string): string {
  return input
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&#x27;/g, "'")
    .replace(/&nbsp;/g, " ");
}

function normalizeResultUrl(url: string): string {
  if (url === "/index.html") return "/";
  return url.replace(/\/index\.html$/, "").replace(/\.html$/, "") || "/";
}

function ExcerptText({ excerpt }: { excerpt: string }) {
  if (!excerpt) return null;

  const parts = excerpt.split(/(<mark>[\s\S]*?<\/mark>)/gi);

  return (
    <p className="mt-1 text-xs leading-relaxed text-gray-600 dark:text-gray-300 line-clamp-2">
      {parts.map((part, index) => {
        const markMatch = part.match(/^<mark>([\s\S]*?)<\/mark>$/i);
        if (markMatch) {
          return (
            <mark
              key={index}
              className="rounded px-0.5 bg-blue-200 text-slate-950 font-semibold dark:bg-blue-600 dark:text-white"
            >
              {decodeHtmlEntities(markMatch[1])}
            </mark>
          );
        }
        return (
          <Fragment key={index}>
            {decodeHtmlEntities(part.replace(/<[^>]+>/g, ""))}
          </Fragment>
        );
      })}
    </p>
  );
}

async function importPagefind(): Promise<PagefindModule> {
  const dynamicImport = new Function("url", "return import(url)") as (
    url: string
  ) => Promise<PagefindModule>;
  const mod = await dynamicImport("/pagefind/pagefind.js");
  if (typeof mod.init === "function") {
    await mod.init();
  }
  return mod;
}

export default function BlogSearch({ open, onOpenChange }: BlogSearchProps) {
  const router = useRouter();
  const pagefindRef = useRef<PagefindModule | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [indexError, setIndexError] = useState<string | null>(null);
  const [isLoadingIndex, setIsLoadingIndex] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<SearchHit[]>([]);
  const hasRequestedIndex = useRef(false);

  const loadIndex = useCallback(async () => {
    setIsLoadingIndex(true);
    setIndexError(null);

    try {
      const pagefind = await importPagefind();
      pagefindRef.current = pagefind;
      setIsReady(true);
    } catch {
      const isDev = process.env.NODE_ENV === "development";
      setIndexError(
        isDev
          ? "开发模式下尚未生成 Pagefind 静态索引，请运行 pnpm run build 后预览静态产物。"
          : "搜索索引加载失败，请检查网络后重试。"
      );
    } finally {
      setIsLoadingIndex(false);
    }
  }, []);

  useEffect(() => {
    if (!open || isReady || hasRequestedIndex.current) return;
    hasRequestedIndex.current = true;
    void loadIndex();
  }, [isReady, loadIndex, open]);

  const retryIndex = useCallback(() => {
    hasRequestedIndex.current = true;
    void loadIndex();
  }, [loadIndex]);

  useEffect(() => {
    const query = searchQuery.trim();
    const pagefind = pagefindRef.current;

    if (!isReady || !pagefind || !query) {
      setResults([]);
      setIsSearching(false);
      return;
    }

    let cancelled = false;
    setIsSearching(true);

    const timer = window.setTimeout(async () => {
      try {
        const searchResponse = await pagefind.search(query);
        if (cancelled) return;

        const topItems = searchResponse.results.slice(0, 15);
        const loaded = await Promise.all(
          topItems.map(async (item): Promise<SearchHit> => {
            const data = await item.data();
            return {
              id: item.id,
              url: normalizeResultUrl(data.url),
              title: data.meta?.title || normalizeResultUrl(data.url),
              excerpt: data.excerpt || "",
            };
          })
        );

        if (!cancelled) {
          setResults(loaded);
        }
      } catch {
        if (!cancelled) {
          setResults([]);
        }
      } finally {
        if (!cancelled) {
          setIsSearching(false);
        }
      }
    }, 150);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [isReady, searchQuery]);

  const handleSelect = useCallback(
    (url: string) => {
      onOpenChange(false);
      router.push(url);
    },
    [onOpenChange, router]
  );

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
          {isLoadingIndex && (
            <p className="p-4 text-sm text-gray-500">正在加载搜索索引...</p>
          )}
          {indexError && (
            <div className="p-4 text-sm text-gray-500" role="alert">
              <p>{indexError}</p>
              <button
                type="button"
                className="mt-2 underline"
                onClick={retryIndex}
              >
                重试
              </button>
            </div>
          )}
          {isReady && !searchQuery.trim() && (
            <p className="p-4 text-sm text-gray-500">输入关键词开始搜索。</p>
          )}
          {isSearching && (
            <p className="p-4 text-sm text-gray-500">正在搜索...</p>
          )}
          {isReady && searchQuery.trim() && !isSearching && results.length === 0 && (
            <p className="p-4 text-sm text-gray-500">没有找到相关文章。</p>
          )}
          {results.map((hit) => (
            <CommandItem
              key={hit.id}
              value={`${hit.title}-${hit.id}`}
              onSelect={() => handleSelect(hit.url)}
              className="cursor-pointer px-4 py-2.5 hover:bg-gray-100 dark:data-[selected=true]:bg-accent-dark dark:hover:bg-gray-700"
            >
              <div className="w-full">
                <div className="font-medium text-sm text-slate-900 dark:text-slate-100">
                  {hit.title}
                </div>
                <ExcerptText excerpt={hit.excerpt} />
              </div>
            </CommandItem>
          ))}
        </CommandList>
      </Command>
    </CommandDialog>
  );
}
