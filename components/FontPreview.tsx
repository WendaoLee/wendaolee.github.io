"use client"
import { useState, useEffect, useRef } from 'react'

export interface FontFace {
  fontFamily: string
  src: string
  fontStyle?: string
  fontWeight?: string | number
  fontDisplay?: string
}

export interface FontPreviewProps {
  /**
   * 字体定义数组
   */
  fontFaces: FontFace[]
  /**
   * 预览文字
   */
  previewText?: string
  /**
   * 字体大小
   */
  fontSize?: string
  /**
   * 字体颜色
   */
  color?: string
  /**
   * 背景颜色
   */
  backgroundColor?: string
  /**
   * 是否显示加载状态
   */
  showLoadingState?: boolean
  /**
   * 自定义样式
   */
  className?: string
}

export const FontPreview: React.FC<FontPreviewProps> = ({
  fontFaces = [],
  previewText = "The quick brown fox jumps over the lazy dog. 0123456789 你好世界！",
  fontSize = "24px",
  color = "#333",
  backgroundColor = "#fff",
  showLoadingState = true,
  className = ""
}) => {
  const [fontsLoaded, setFontsLoaded] = useState<Set<string>>(new Set())
  const [isLoading, setIsLoading] = useState(true)
  const [loadErrors, setLoadErrors] = useState<string[]>([])
  const containerRef = useRef<HTMLDivElement>(null)


  // 动态加载字体
  useEffect(() => {
    const loadFonts = async () => {
      setIsLoading(true)
      setLoadErrors([])
      const loadedFonts = new Set<string>()
      if(typeof window === 'undefined' || window.document === undefined){
        return
      }

      try {
        // 为每个字体定义创建 FontFace 对象
        const fontPromises = fontFaces.map(async (fontFace) => {
          try {
            const font = new FontFace(
              fontFace.fontFamily,
              fontFace.src,
              {
                style: fontFace.fontStyle || 'normal',
              }
            )

            const loadedFont = await font.load()
            window.document.fonts.add(loadedFont)
            loadedFonts.add(fontFace.fontFamily)
            
            return { success: true, fontFamily: fontFace.fontFamily }
          } catch (error) {
            console.error(`字体加载失败: ${fontFace.fontFamily}`, error)
            setLoadErrors(prev => [...prev, fontFace.fontFamily])
            return { success: false, fontFamily: fontFace.fontFamily, error }
          }
        })

        await Promise.allSettled(fontPromises)
        setFontsLoaded(loadedFonts)
      } catch (error) {
        console.error('字体加载过程中发生错误:', error)
      } finally {
        setIsLoading(false)
      }
    }

    if (fontFaces.length > 0) {
      loadFonts()
    } else {
      setIsLoading(false)
    }
  }, [fontFaces])


  if(window === undefined){
    return <div></div>
  }

  // 检查字体是否可用
  const isFontAvailable = (fontFamily: string) => {
    if(window === undefined || window.document === undefined){
      return false
    }
    return window.document.fonts.check(`12px "${fontFamily}"`)
  }

  // 生成 CSS 样式
  const generateFontCSS = () => {
    return fontFaces.map(fontFace => `
      @font-face {
        font-family: '${fontFace.fontFamily}';
        src: ${fontFace.src};
        font-style: ${fontFace.fontStyle || 'normal'};
        font-weight: ${fontFace.fontWeight || 'normal'};
        font-display: ${fontFace.fontDisplay || 'swap'};
      }
    `).join('\n')
  }

  return (
    <div 
      ref={containerRef}
      className={`font-preview-container ${className}`}
      style={{ backgroundColor, padding: '20px', borderRadius: '8px' }}
    >
      {/* 动态注入字体 CSS */}
      <style dangerouslySetInnerHTML={{ __html: generateFontCSS() }} />
      
      {/* 加载状态 */}
      {showLoadingState && isLoading && (
        <div className="loading-state" style={{ marginBottom: '16px' }}>
          <div className="text-sm text-gray-500">正在加载字体...</div>
          <div className="flex space-x-2 mt-2">
            {fontFaces.map((fontFace, index) => (
              <div key={index} className="text-xs text-gray-400">
                {fontFace.fontFamily}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 加载错误 */}
      {loadErrors.length > 0 && (
        <div className="error-state" style={{ marginBottom: '16px' }}>
          <div className="text-sm text-red-500">以下字体加载失败:</div>
          <div className="flex flex-wrap gap-2 mt-2">
            {loadErrors.map((fontFamily, index) => (
              <span key={index} className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded">
                {fontFamily}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* 字体预览 */}
      <div className="font-previews space-y-4">
        {fontFaces.map((fontFace, index) => (
          <div key={index} className="font-preview-item">
            <div className="font-info mb-2">
              <h3 className="text-sm font-medium text-gray-700">
                {fontFace.fontFamily}
              </h3>
              <div className="text-xs text-gray-500">
                样式: {fontFace.fontStyle || 'normal'} | 
                粗细: {fontFace.fontWeight || 'normal'} | 
                状态: {isFontAvailable(fontFace.fontFamily) ? '✅ 可用' : '❌ 不可用'}
              </div>
            </div>
            
            <div 
              className="preview-text"
              style={{
                fontFamily: `"${fontFace.fontFamily}"`,
                fontSize,
                color,
                lineHeight: '1.5',
                minHeight: '60px',
                border: '1px solid #e5e7eb',
                borderRadius: '4px',
                padding: '12px',
                backgroundColor: '#fafafa'
              }}
            >
              {previewText}
            </div>
          </div>
        ))}
      </div>

      {/* 字体统计 */}
      <div className="font-stats mt-4 pt-4 border-t border-gray-200">
        <div className="text-xs text-gray-500">
          总计: {fontFaces.length} 个字体 | 
          成功加载: {fontsLoaded.size} 个 | 
          加载失败: {loadErrors.length} 个
        </div>
      </div>
    </div>
  )
}
