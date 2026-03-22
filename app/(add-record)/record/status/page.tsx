'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import type { SelectedBook } from '@/types/book'

const STATUS_OPTIONS = [
  { id: 'reading',       label: '읽는 중',    emoji: '📖', color: '#4A7C59' },
  { id: 'completed',     label: '완독',        emoji: '✅', color: '#2D5A35' },
  { id: 'want-to-read',  label: '읽고 싶은',   emoji: '💭', color: '#8CB89A' },
  { id: 'paused',        label: '잠시 중단',   emoji: '⏸️', color: '#C47D2E' },
  { id: 'dropped',       label: '하차',        emoji: '🚫', color: '#B94040' },
] as const

function hexWithAlpha(hex: string, alpha: number) {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgba(${r},${g},${b},${alpha})`
}

export default function StatusSelectPage() {
  const router = useRouter()
  const [book, setBook] = useState<SelectedBook | null>(null)

  useEffect(() => {
    const raw = sessionStorage.getItem('otium_selected_book')
    if (!raw) { router.replace('/record/add'); return }
    setBook(JSON.parse(raw))
  }, [router])

  function handleSelect(id: string) {
    sessionStorage.setItem('otium_record_status', id)
    router.push(`/record/${id}`)
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#F5F0E8]">
      {/* Header */}
      <div className="h-[44px] px-5 flex items-center justify-between border-b border-[#D4CAC2] bg-[#F5F0E8]">
        <button onClick={() => router.back()} className="w-6 h-6 flex items-center justify-center">
          <ArrowLeft size={24} className="text-[#3D2C24]" />
        </button>
        <span className="text-[17px] font-semibold text-[#3D2C24]">독서 상태 선택</span>
        <div className="w-6" />
      </div>

      {/* Book Info */}
      {book && (
        <div className="px-5 py-6 border-b border-[#D4CAC2] flex gap-4">
          {book.cover_url ? (
            <img src={book.cover_url} alt={book.title} className="w-[60px] h-[90px] rounded-lg object-cover flex-shrink-0" />
          ) : (
            <div className="w-[60px] h-[90px] rounded-lg bg-[#EDE8E1] flex-shrink-0" />
          )}
          <div className="flex flex-col gap-1 min-w-0 justify-center">
            <span className="text-[15px] font-semibold text-[#3D2C24] line-clamp-2 leading-snug">{book.title}</span>
            <span className="text-[13px] text-[#6B5E57]">{book.author}</span>
          </div>
        </div>
      )}

      {/* Status Buttons */}
      <div className="px-5 py-6 space-y-3">
        {STATUS_OPTIONS.map((opt) => (
          <button
            key={opt.id}
            onClick={() => handleSelect(opt.id)}
            className="w-full bg-white rounded-xl p-5 flex items-center gap-4 shadow-sm text-left"
          >
            <div
              className="w-[72px] h-[72px] rounded-full flex items-center justify-center flex-shrink-0 text-[28px]"
              style={{ backgroundColor: hexWithAlpha(opt.color, 0.15) }}
            >
              {opt.emoji}
            </div>
            <span className="text-[17px] font-semibold" style={{ color: opt.color }}>
              {opt.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}
