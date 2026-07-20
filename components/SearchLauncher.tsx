"use client"

import { useCallback, useState } from "react"
import { Search } from "lucide-react"

type SearchDialog = typeof import("./BlogSearch").default

/**
 * Keep the full-text search out of the root layout's initial JavaScript.
 * The dialog (and its index request) is only loaded after an explicit user action.
 */
export default function SearchLauncher() {
  const [Dialog, setDialog] = useState<SearchDialog | null>(null)
  const [open, setOpen] = useState(false)
  const [isLoadingDialog, setIsLoadingDialog] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)

  const openSearch = useCallback(async () => {
    if (Dialog) {
      setOpen(true)
      return
    }

    setIsLoadingDialog(true)
    setLoadError(null)

    try {
      const { default: SearchDialog } = await import("./BlogSearch")
      setDialog(() => SearchDialog)
      setOpen(true)
    } catch {
      setLoadError("搜索功能加载失败，请检查网络后重试。")
    } finally {
      setIsLoadingDialog(false)
    }
  }, [Dialog])

  return (
    <div className="relative">
      <button
        type="button"
        aria-label="搜索站内文章"
        aria-busy={isLoadingDialog}
        className="w-[24px] h-[24px] flex items-center justify-center rounded-full bg-white dark:bg-slate-950 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors disabled:opacity-60"
        disabled={isLoadingDialog}
        onClick={() => void openSearch()}
      >
        <Search className="w-[23px] h-[23px] text-gray-600 dark:text-gray-300" />
      </button>

      {loadError && (
        <div role="alert" className="absolute right-0 top-8 z-50 w-64 rounded-md border bg-white p-3 text-sm shadow-md dark:bg-slate-900">
          <p>{loadError}</p>
          <button type="button" className="mt-2 underline" onClick={() => void openSearch()}>
            重试
          </button>
        </div>
      )}

      {Dialog && <Dialog open={open} onOpenChange={setOpen} />}
    </div>
  )
}
