'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Search } from 'lucide-react'
import { KakaoBook } from '@/lib/kakao'

export default function BookSearchPage() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [results, setResults] = useState<KakaoBook[]>([])
  const [loading, setLoading] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (!searchQuery.trim()) {
      setResults([])
      setLoading(false)
      return
    }
    setLoading(true)
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/books/search?q=${encodeURIComponent(searchQuery)}`)
        const data = await res.json()
        setResults(data.books ?? [])
      } catch {
        setResults([])
      } finally {
        setLoading(false)
      }
    }, 300)
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [searchQuery])

  function handleSelect(book: KakaoBook) {
    const selected = {
      title: book.title,
      author: book.authors.join(', '),
      cover_url: book.thumbnail,
      isbn: book.isbn,
      publisher: book.publisher,
    }
    sessionStorage.setItem('otium_selected_book', JSON.stringify(selected))
    router.push('/record/status')
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#F5F0E8]">
      {/* Header */}
      <div className="h-[44px] px-5 flex items-center justify-between border-b border-[#D4CAC2] bg-[#F5F0E8]">
        <button onClick={() => router.back()} className="w-6 h-6 flex items-center justify-center">
          <ArrowLeft size={24} className="text-[#3D2C24]" />
        </button>
        <span className="text-[17px] font-semibold text-[#3D2C24]">책 검색</span>
        <div className="w-6" />
      </div>

      {/* Search Bar */}
      <div className="px-5 py-4">
        <div className="relative h-[44px]">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8C7B6E]" />
          <input
            type="text"
            placeholder="책 제목이나 저자를 입력하세요"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-full rounded-xl border border-[#D4CAC2] bg-white pl-12 pr-10 text-[14px] text-[#3D2C24] placeholder:text-[#8C7B6E] outline-none focus:border-[#4A7C59]"
          />
          {loading && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-[#4A7C59] border-t-transparent rounded-full animate-spin" />
          )}
        </div>
      </div>

      {/* Results */}
      <div className="px-5 pb-8 flex flex-col gap-3">
        {!searchQuery.trim() && (
          <p className="text-center py-20 text-[14px] text-[#8C7B6E]">
            책 제목이나 저자를 검색해보세요
          </p>
        )}
        {searchQuery.trim() && !loading && results.length === 0 && (
          <p className="text-center py-20 text-[14px] text-[#8C7B6E]">
            검색 결과가 없어요
          </p>
        )}
        {results.map((book) => (
          <button
            key={book.isbn}
            onClick={() => handleSelect(book)}
            className="bg-white rounded-xl p-4 flex gap-4 shadow-sm text-left"
          >
            {book.thumbnail ? (
              <img
                src={book.thumbnail}
                alt={book.title}
                className="w-[60px] h-[90px] rounded-lg object-cover flex-shrink-0"
              />
            ) : (
              <div className="w-[60px] h-[90px] rounded-lg bg-[#EDE8E1] flex-shrink-0" />
            )}
            <div className="flex flex-col gap-1 min-w-0">
              <span className="text-[15px] font-semibold text-[#3D2C24] line-clamp-2 leading-snug">
                {book.title}
              </span>
              <span className="text-[13px] text-[#6B5E57]">{book.authors.join(', ')}</span>
              <span className="text-[12px] text-[#8C7B6E]">{book.publisher}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
