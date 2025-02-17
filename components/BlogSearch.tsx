"use client"
import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { CommandDialog, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem, Command } from "@/components/ui/command"
import { Search } from "lucide-react"
import { allWritings, type Writings } from '@/.contentlayer/generated'
import { Matrix, search } from 'text-search-engine'
import { HighlightWithTarget } from 'text-search-engine/react'
import { CommandLoading } from 'cmdk'
import { debounce } from 'radash'

interface HighlightedTextProps {
  text: string
  highlightRange: [number, number]
  contextRange: number  // 高亮文本前后要显示的字符数
}

export const HighlightedText: React.FC<HighlightedTextProps> = ({ text, highlightRange, contextRange }) => {
  let [start, end] = highlightRange
  end +=1
  
  
  // 计算上下文的起始和结束位置
  const contextStart = Math.max(0, start - contextRange)
  const contextEnd = Math.min(text.length, end + contextRange)
  
  // 提取上下文文本
  const beforeContext = text.slice(contextStart, start)
  const highlightedText = text.slice(start, end)
  const afterContext = text.slice(end, contextEnd)
  
  // 如果上下文不是从文本开头或结尾开始，添加省略号
  const prefix = contextStart > 0 ? '...' : ''
  const suffix = contextEnd < text.length ? '...' : ''

  return (
    <p>
      {prefix}
      {beforeContext}
      <span className="bg-blue-400 dark:bg-blue-600 font-bold">{highlightedText}</span>
      {afterContext}
      {suffix}
    </p>
  )
}


// 新增的搜索结果组件

export default function BlogSearch() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [filteredPosts, setFilteredPosts] = useState<Writings[]>([])

  const [loading, setLoading] = useState(false)
  const matrixContentMappingRef = useRef<Record<string,Matrix>>({})

  const caculateMatrixPower = (matrix:Matrix) => {
    return matrix.reduce(
      (acc,[start,end]) => acc + (end - start),0
    )
  }


  const handleSearch = useCallback((query: string) => {
    const result = allWritings.filter(post => {
      return search(post.title, query) !== undefined
    }).slice(0, 5)
    setFilteredPosts(result)
    setLoading(false)
  }, [])

  const handleSearchAsync = async (query: string) => {

    const mapping:Record<string,number> = {}
    const result = allWritings.filter(post => {
      const searchBodyPower = search(post.body.raw, query) 
      const searchTitlePower = search(post.title,query)
      if(searchBodyPower === undefined && searchTitlePower === undefined){
        return false
      }
      const resultPower = (searchBodyPower !== undefined? caculateMatrixPower(searchBodyPower):0) + 10*(searchTitlePower != undefined? caculateMatrixPower(searchTitlePower) : 0)
      mapping[post.title] = resultPower
      if(searchBodyPower != undefined){
        matrixContentMappingRef.current[post.title] = searchBodyPower
      }
      return searchBodyPower != undefined || searchTitlePower != undefined
    }).sort((pre,next) => {
      return mapping[next.title] - mapping[pre.title]
    }).slice(0, 20)
    // console.log(result,mapping)
    setFilteredPosts(result)
    setLoading(false)
  }

  const debouncedSearch = debounce({ delay: 1000 }, handleSearchAsync)

  useEffect(() => {

    // setLoading(true)
    if(searchQuery != ''){
      debouncedSearch(searchQuery)
    }
  }, [searchQuery])

  const handleSelect = useCallback((slug: string) => {
    setOpen(false)
    router.push(slug)
  }, [router])

  return (
    <>
      <button
        className="w-[24px] h-[24px] flex items-center justify-center rounded-full bg-white dark:bg-slate-950 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
        onClick={() => setOpen(true)}
      >
        <Search className="w-[23px] h-[23px] text-gray-600 dark:text-gray-300" />
      </button>
      <CommandDialog
        open={open}
        onOpenChange={setOpen}
      // key={searchQuery}
      // className='fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0'
      >
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="输入关键词搜索文章，仅支持 Wrtings 相关的内容搜索。"
            value={searchQuery}
            onValueChange={setSearchQuery}
            className="p-4 text-base focus:outline-none bg-transparent text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
          />

          <CommandList className="max-h-[400px] overflow-y-auto">
            {loading && <CommandLoading className='w-full'>正在搜索中...</CommandLoading>}
            <CommandEmpty className="py-6 text-center text-sm text-gray-500 dark:text-gray-400">
              没有找到相关文章
            </CommandEmpty>
            {/* <CommandGroup key={searchQuery}> */}
              {filteredPosts.map((post) => (
                <CommandItem
                  key={post._raw.sourceFileName}
                  // value={post.title}
                  onSelect={()=>handleSelect(post.slug)}
                  className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer dark:data-[selected=true]:bg-accent-dark"
                >
                  <div>
                    {post.title}
                    {/* <HighlightWithTarget target={searchQuery} source={post.title} /> */}
                    <HighlightedText text={post.body.raw} highlightRange={matrixContentMappingRef.current[post.title] === undefined ? [0,0] : matrixContentMappingRef.current[post.title][0]} contextRange={20}></HighlightedText>
                  </div>
                </CommandItem>
              ))}
            {/* </CommandGroup> */}
          </CommandList>
        </Command>
        {/* <SearchResults 
          key={searchQuery}
          searchQuery={searchQuery}
          filteredPosts={filteredPosts}
          onSelect={handleSelect}
        /> */}
      </CommandDialog>
    </>
  )
}
