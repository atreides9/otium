import { createServerSupabaseClient } from '@/lib/supabase'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'

interface BookRecord {
  id: string
  title: string
  author: string
  cover_url: string | null
  status: 'reading' | 'done'
  progress: number
  finished_at: string | null
  one_line: string | null
}

interface UserProfile {
  nickname: string
  avatar_url: string | null
  streak: number
  xp: number
  tags: string[]
}

const GENRE_COLORS: Record<string, { bg: string; text: string }> = {
  소설: { bg: '#4A7C5F', text: '#FFFFFF' },
  시: { bg: '#6B8FB5', text: '#FFFFFF' },
  에세이: { bg: '#C4973A', text: '#FFFFFF' },
  자기계발: { bg: '#D4824A', text: '#FFFFFF' },
  과학: { bg: '#3D3730', text: '#FFFFFF' },
  역사: { bg: '#8B6F47', text: '#FFFFFF' },
  철학: { bg: '#7B5EA7', text: '#FFFFFF' },
  경제: { bg: '#2E7D6E', text: '#FFFFFF' },
  기타: { bg: '#999999', text: '#FFFFFF' },
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr)
  return `${d.getMonth() + 1}월 ${d.getDate()}일`
}

export default async function HomePage() {
  const supabase = await createServerSupabaseClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) redirect('/login')

  const [profileResult, recordsResult] = await Promise.all([
    supabase
      .from('profiles')
      .select('nickname, avatar_url, streak, xp, tags')
      .eq('id', user.id)
      .single(),
    supabase
      .from('book_records')
      .select('id, title, author, cover_url, status, progress, finished_at, one_line')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false })
      .limit(20),
  ])

  const profile: UserProfile = profileResult.data ?? {
    nickname: user.email?.split('@')[0] ?? '독자',
    avatar_url: null,
    streak: 0,
    xp: 0,
    tags: [],
  }

  const records: BookRecord[] = recordsResult.data ?? []
  const reading = records.filter((r) => r.status === 'reading')
  const done = records.filter((r) => r.status === 'done')
  const recentDone = done.slice(0, 5)

  const now = new Date()
  const hour = now.getHours()
  const greeting =
    hour < 12 ? '좋은 아침이에요' : hour < 18 ? '안녕하세요' : '좋은 저녁이에요'

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F0EDE8' }}>
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-14 pb-4">
        <div>
          <p className="text-sm" style={{ color: '#999999' }}>{greeting} 👋</p>
          <h1 className="text-xl font-bold mt-0.5" style={{ color: '#1A1A1A' }}>
            {profile.nickname}님
          </h1>
        </div>
        <div className="flex items-center gap-3">
          {/* Streak + XP */}
          <div
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
            style={{ backgroundColor: '#FFFFFF', border: '1px solid #E5E1DC' }}
          >
            <span className="text-base">🔥</span>
            <span className="text-sm font-semibold" style={{ color: '#D4824A' }}>
              {profile.streak}일
            </span>
          </div>
          <div
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
            style={{ backgroundColor: '#FFFFFF', border: '1px solid #E5E1DC' }}
          >
            <span className="text-base">⭐</span>
            <span className="text-sm font-semibold" style={{ color: '#C4973A' }}>
              {profile.xp} XP
            </span>
          </div>
          {/* Notification */}
          <button
            className="w-10 h-10 flex items-center justify-center rounded-full"
            style={{ backgroundColor: '#FFFFFF', border: '1px solid #E5E1DC' }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 22C13.1046 22 14 21.1046 14 20H10C10 21.1046 10.8954 22 12 22Z"
                fill="#666666"
              />
              <path
                d="M19 17H5V10C5 6.68629 7.68629 4 11 4H13C16.3137 4 19 6.68629 19 10V17Z"
                stroke="#666666"
                strokeWidth="1.8"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Genre Tag Bar */}
      {profile.tags.length > 0 && (
        <div className="px-5 mb-5">
          <div className="grid grid-cols-2 gap-2">
            {profile.tags.map((tag) => {
              const color = GENRE_COLORS[tag] ?? GENRE_COLORS['기타']
              return (
                <div
                  key={tag}
                  className="flex items-center justify-center py-2 rounded-2xl text-sm font-medium"
                  style={{ backgroundColor: color.bg, color: color.text }}
                >
                  {tag}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Reading Cards */}
      <section className="mb-6">
        <div className="flex items-center justify-between px-5 mb-3">
          <h2 className="text-base font-bold" style={{ color: '#1A1A1A' }}>
            읽는 중
          </h2>
          <span className="text-sm" style={{ color: '#999999' }}>
            {reading.length}권
          </span>
        </div>
        {reading.length === 0 ? (
          <div
            className="mx-5 rounded-2xl p-5 text-center"
            style={{ backgroundColor: '#FFFFFF', border: '1px solid #E5E1DC' }}
          >
            <p className="text-sm" style={{ color: '#999999' }}>
              읽고 있는 책이 없어요
            </p>
            <Link
              href="/record/add"
              className="inline-block mt-2 text-sm font-medium"
              style={{ color: '#4A7C5F' }}
            >
              + 책 추가하기
            </Link>
          </div>
        ) : (
          <div className="flex gap-3 overflow-x-auto px-5 pb-1 scrollbar-none">
            {reading.map((book) => (
              <div
                key={book.id}
                className="flex-shrink-0 w-[160px] rounded-2xl p-4"
                style={{ backgroundColor: '#FFFFFF', border: '1px solid #E5E1DC' }}
              >
                {book.cover_url ? (
                  <Image
                    src={book.cover_url}
                    alt={book.title}
                    width={56}
                    height={80}
                    className="rounded-lg object-cover mb-3"
                    style={{ width: 56, height: 80 }}
                  />
                ) : (
                  <div
                    className="w-14 h-20 rounded-lg mb-3 flex items-center justify-center"
                    style={{ backgroundColor: '#F0EDE8' }}
                  >
                    <span className="text-2xl">📖</span>
                  </div>
                )}
                <p
                  className="text-xs font-semibold line-clamp-2 mb-1"
                  style={{ color: '#1A1A1A' }}
                >
                  {book.title}
                </p>
                <p className="text-[11px] mb-3" style={{ color: '#999999' }}>
                  {book.author}
                </p>
                {/* Progress bar */}
                <div
                  className="w-full h-1.5 rounded-full"
                  style={{ backgroundColor: '#F0EDE8' }}
                >
                  <div
                    className="h-1.5 rounded-full"
                    style={{
                      backgroundColor: '#4A7C5F',
                      width: `${book.progress}%`,
                    }}
                  />
                </div>
                <p className="text-[11px] mt-1 text-right" style={{ color: '#4A7C5F' }}>
                  {book.progress}%
                </p>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Completed Cards */}
      {done.length > 0 && (
        <section className="mb-6">
          <div className="flex items-center justify-between px-5 mb-3">
            <h2 className="text-base font-bold" style={{ color: '#1A1A1A' }}>
              완독
            </h2>
            <span className="text-sm" style={{ color: '#999999' }}>
              {done.length}권
            </span>
          </div>
          <div className="flex gap-3 overflow-x-auto px-5 pb-1 scrollbar-none">
            {done.slice(0, 10).map((book) => (
              <div
                key={book.id}
                className="flex-shrink-0 w-[120px] rounded-2xl p-3"
                style={{ backgroundColor: '#FFFFFF', border: '1px solid #E5E1DC' }}
              >
                {book.cover_url ? (
                  <Image
                    src={book.cover_url}
                    alt={book.title}
                    width={48}
                    height={68}
                    className="rounded-lg object-cover mb-2"
                    style={{ width: 48, height: 68 }}
                  />
                ) : (
                  <div
                    className="w-12 h-[68px] rounded-lg mb-2 flex items-center justify-center"
                    style={{ backgroundColor: '#F0EDE8' }}
                  >
                    <span className="text-xl">✅</span>
                  </div>
                )}
                <p
                  className="text-[11px] font-semibold line-clamp-2"
                  style={{ color: '#1A1A1A' }}
                >
                  {book.title}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Recent Done List */}
      {recentDone.length > 0 && (
        <section className="px-5 mb-6">
          <h2 className="text-base font-bold mb-3" style={{ color: '#1A1A1A' }}>
            최근 완독 기록
          </h2>
          <div className="flex flex-col gap-3">
            {recentDone.map((book) => (
              <div
                key={book.id}
                className="flex items-center gap-3 p-4 rounded-2xl"
                style={{ backgroundColor: '#FFFFFF', border: '1px solid #E5E1DC' }}
              >
                {book.cover_url ? (
                  <Image
                    src={book.cover_url}
                    alt={book.title}
                    width={48}
                    height={68}
                    className="rounded-lg object-cover flex-shrink-0"
                    style={{ width: 48, height: 68 }}
                  />
                ) : (
                  <div
                    className="w-12 h-[68px] rounded-lg flex-shrink-0 flex items-center justify-center"
                    style={{ backgroundColor: '#F0EDE8' }}
                  >
                    <span className="text-xl">📚</span>
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p
                    className="text-sm font-semibold truncate"
                    style={{ color: '#1A1A1A' }}
                  >
                    {book.title}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: '#999999' }}>
                    {book.finished_at ? formatDate(book.finished_at) : ''}
                  </p>
                  {book.one_line && (
                    <p
                      className="text-xs mt-1.5 line-clamp-2"
                      style={{ color: '#666666' }}
                    >
                      &ldquo;{book.one_line}&rdquo;
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* FAB */}
      <Link
        href="/record/add"
        className="fixed bottom-24 right-5 w-14 h-14 rounded-full flex items-center justify-center shadow-lg z-40"
        style={{ backgroundColor: '#4A7C5F' }}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path
            d="M12 5V19M5 12H19"
            stroke="#FFFFFF"
            strokeWidth="2.2"
            strokeLinecap="round"
          />
        </svg>
      </Link>
    </div>
  )
}
