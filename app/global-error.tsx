"use client"

export default function GlobalError({ reset }: { error: Error & { digest?: string }, reset: () => void }) {
  return (
    <html lang="zh-CN">
      <body style={{ margin: 0, fontFamily: "system-ui, sans-serif", background: "#f8fafc", color: "#334155" }}>
        <main style={{ maxWidth: 640, margin: "12vh auto", padding: "0 24px" }}>
          <h1>页面暂时无法正常加载</h1>
          <p>这通常是网络中断或页面资源更新造成的。文章内容不会因此丢失。</p>
          <button type="button" onClick={reset} style={{ marginRight: 12 }}>重试</button>
          <button type="button" onClick={() => window.location.reload()}>刷新页面</button>
        </main>
      </body>
    </html>
  )
}
