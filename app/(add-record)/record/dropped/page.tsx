'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { saveBookRecord } from '@/app/actions/book-record'
import type { SelectedBook } from '@/types/book'

export default function DroppedPage() {
  const router = useRouter()
  const [book, setBook] = useState<SelectedBook | null>(null)
  const [reason, setReason] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const raw = sessionStorage.getItem('otium_selected_book')
    const status = sessionStorage.getItem('otium_record_status')
    if (!raw || status !== 'dropped') { router.replace('/record/add'); return }
    setBook(JSON.parse(raw))
  }, [router])

  async function handleSave() {
    if (!book) return
    setSaving(true)
    const { error } = await saveBookRecord({ book, status: 'dropped', review: reason || undefined })
    setSaving(false)
    if (!error) {
      sessionStorage.removeItem('otium_selected_book')
      sessionStorage.removeItem('otium_record_status')
      router.replace('/home')
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#F5F0E8] pb-[52px]">
      {/* Header */}
      <div className="h-[44px] px-5 flex items-center justify-between border-b border-[#D4CAC2] bg-[#F5F0E8]">
        <button onClick={() => router.back()} className="w-6 h-6 flex items-center justify-center">
          <ArrowLeft size={24} className="text-[#3D2C24]" />
        </button>
        <span className="text-[17px] font-semibold text-[#3D2C24]">하차</span>
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

      {/* Form */}
      <div className="px-5 py-6 space-y-6">
        <div className="flex flex-col gap-2">
          <label className="text-[14px] font-semibold text-[#3D2C24]">하차 이유</label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="읽기를 그만두게 된 이유를 적어보세요 (선택)"
            className="h-[120px] resize-none rounded-xl border border-[#D4CAC2] bg-white px-4 py-3 text-[14px] text-[#3D2C24] placeholder:text-[#8C7B6E] outline-none focus:border-[#4A7C59]"
          />
        </div>
      </div>

      {/* Save Button */}
      <button
        onClick={handleSave}
        disabled={saving}
        className="fixed bottom-0 left-0 right-0 h-[52px] bg-[#4A7C59] text-white text-[16px] font-semibold"
      >
        {saving ? '저장 중…' : '저장'}
      </button>
    </div>
  )
}
