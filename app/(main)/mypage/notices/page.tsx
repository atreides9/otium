import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

type NoticeCategory = '업데이트' | '이벤트' | '점검' | '공지'

interface Notice {
  id: string
  title: string
  category: NoticeCategory
  is_new: boolean
  created_at: string
}

const CATEGORY_STYLE: Record<NoticeCategory, { bg: string; color: string }> = {
  업데이트: { bg: '#EEF2F7', color: '#6B8FB5' },
  이벤트: { bg: '#EDFAF3', color: '#4A7C5F' },
  점검: { bg: '#F5F5F5', color: '#888888' },
  공지: { bg: '#EFEFEF', color: '#555555' },
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr)
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`
}

export default async function NoticesPage() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('notices')
    .select('id, title, category, is_new, created_at')
    .order('created_at', { ascending: false })

  const notices: Notice[] = error || !data ? [] : (data as Notice[])

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F0EDE8' }}>
      {/* Header */}
      <div className="flex items-center gap-3 px-5 pt-14 pb-4">
        <Link href="/mypage">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path
              d="M15 18L9 12L15 6"
              stroke="#1A1A1A"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </Link>
        <h1 className="text-xl font-bold" style={{ color: '#1A1A1A' }}>
          공지사항
        </h1>
      </div>

      {/* Notice List */}
      <div className="px-5 flex flex-col gap-3 pb-10">
        {notices.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-sm" style={{ color: '#999999' }}>
              공지사항이 없습니다.
            </p>
          </div>
        ) : (
          notices.map((notice) => {
            const chipStyle = CATEGORY_STYLE[notice.category] ?? CATEGORY_STYLE['공지']
            return (
              <Link
                key={notice.id}
                href={`/mypage/notices/${notice.id}`}
                className="rounded-2xl p-4 flex items-center justify-between gap-3"
                style={{ backgroundColor: '#FFFFFF', border: '1px solid #E5E1DC' }}
              >
                <div className="flex flex-col gap-1.5 flex-1 min-w-0">
                  {/* Chips */}
                  <div className="flex items-center gap-1.5">
                    <span
                      className="px-2 py-0.5 rounded-full text-[11px] font-semibold"
                      style={{ backgroundColor: chipStyle.bg, color: chipStyle.color }}
                    >
                      {notice.category}
                    </span>
                    {notice.is_new && (
                      <span
                        className="px-2 py-0.5 rounded-full text-[11px] font-semibold text-white"
                        style={{ backgroundColor: '#E53E3E' }}
                      >
                        NEW
                      </span>
                    )}
                  </div>
                  {/* Title */}
                  <p className="text-sm font-bold truncate" style={{ color: '#1A1A1A' }}>
                    {notice.title}
                  </p>
                  {/* Date */}
                  <p className="text-xs" style={{ color: '#999999' }}>
                    {formatDate(notice.created_at)}
                  </p>
                </div>
                {/* Chevron */}
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="flex-shrink-0">
                  <path
                    d="M9 18L15 12L9 6"
                    stroke="#999999"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </Link>
            )
          })
        )}
      </div>
    </div>
  )
}
