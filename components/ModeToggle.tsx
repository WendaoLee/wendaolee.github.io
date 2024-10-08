"use client"

import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

export function ModeToggle() {
  const { setTheme, theme } = useTheme()

  return (
    <button
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
      aria-label="切换深色/亮色模式"
      // className="border rounded-md w-6 h-6 flex items-center justify-center"
      >
      <span className="sr-only">Toggle mode</span>
      {theme !== "dark" ? (
        <Moon />
      ) : (
        <Sun />
      )}
    </button>
  )
}
