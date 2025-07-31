"use client"
import { FontPreview, FontFace } from "./FontPreview"

export const FontPreviewExample = () => {
  const sampleFonts: FontFace[] = [
    {
        fontFamily:"Merriweather",
        src:'url("/fonts/Merriweather-Light.woff2") format("woff2")',
    },
    {
        fontFamily:"OPPO Sans3.0",
        src:'url("https://openfs.oppomobile.com/ssi/font/OPlusSans3-Regular.woff2") format("woff2")',
    },
    {
        fontFamily:"Optiker-K:OPTICIAN SANS",
        src:'url("/fonts/Optiker-K.woff2") format("truetype")',
    }
  ]

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">字体预览</h2>
      
      <FontPreview 
        fontFaces={sampleFonts}
        previewText="The quick brown fox jumps over the lazy dog. 0123456789. Do you know 2992. 你好Helloworld233世界233！这是 one 一个字体预览测试。"
        fontSize="20px"
        backgroundColor="#f8f9fa"
        showLoadingState={true}
      />
    </div>
  )
}

export default FontPreviewExample