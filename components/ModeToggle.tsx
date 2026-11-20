"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

export function ModeToggle() {
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted && resolvedTheme === "dark";

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label="切换深色/亮色模式"
      className="w-6 h-6 flex items-center justify-center"
    >
      <span className="sr-only">Toggle mode</span>
      {!mounted ? (
        <span className="w-6 h-6 block" aria-hidden="true" />
      ) : isDark ? (
        <Sun />
      ) : (
        <Moon />
      )}
    </button>
  );
}
