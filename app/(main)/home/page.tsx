import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Flame } from 'lucide-react'
import HomeTopBar from '@/components/home/HomeTopBar'
import SectionHeader from '@/components/shared/SectionHeader'

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

const SPINE_COLORS = [
  '#4A7C59', '#8CB89A', '#C47D2E', '#8B6F47', '#7B5EA7', '#2E7D6E', '#9D8C7A',
]

function formatDate(dateStr: string) {
  const d = new Date(dateStr)
  return `${d.getMonth() + 1}월 ${d.getDate()}일`
}

export default async function HomePage() {
  const supabase = await createClient()

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
    <div className="min-h-screen bg-canvas">
      {/* 1. TopBar */}
      <HomeTopBar greeting={greeting} nickname={profile.nickname} />

      {/* 2. Streak Row */}
      {profile.streak > 0 && (
        <div className="px-5 mb-8 h-[44px] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Flame size={20} fill="#FF6B35" color="#FF6B35" />
            <span className="text-[16px] font-semibold text-[#3D3530]">
              {profile.streak}일 연속 독서 중
            </span>
          </div>
          <span className="bg-[#4A7C59] text-white text-[13px] font-bold px-3 py-1.5 rounded-full">
            +{profile.xp} XP
          </span>
        </div>
      )}

      {/* 3. Book Stack Hero Card */}
      <div className="px-5 mb-8">
        <div className="bg-[#F0EBE1] rounded-2xl overflow-hidden relative h-[200px]">
          {done.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-[14px] text-[#6B5E57] text-center">첫 번째 책을 추가해보세요</p>
            </div>
          ) : (
            <div className="flex items-end justify-center gap-2 absolute bottom-5 inset-x-5">
              {done.slice(0, 15).map((book, index) => (
                <div
                  key={book.id}
                  className="flex-1 rounded-lg"
                  style={{
                    height: Math.min(80 + index * 16, 160),
                    backgroundColor: SPINE_COLORS[index % SPINE_COLORS.length],
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 4. 읽는 중 */}
      <section className="mb-8">
        <div className="px-5">
          <SectionHeader title="읽는 중" rightLabel={`${reading.length}권`} />
        </div>
        {reading.length === 0 ? (
          <div className="mx-5 rounded-2xl p-5 text-center bg-surface border border-border">
            <p className="text-sm text-text-3">읽고 있는 책이 없어요</p>
            <Link href="/record/add" className="inline-block mt-2 text-sm font-medium text-primary">
              + 책 추가하기
            </Link>
          </div>
        ) : (
          <div className="flex gap-3 overflow-x-auto px-5 pb-1 scrollbar-none">
            {reading.map((book) => (
              <div
                key={book.id}
                className="flex-shrink-0 w-[160px] rounded-2xl p-4 bg-surface border border-border"
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
                  <div className="w-14 h-20 rounded-lg mb-3 flex items-center justify-center bg-canvas">
                    <span className="text-2xl">📖</span>
                  </div>
                )}
                <p className="text-xs font-semibold line-clamp-2 mb-1 text-text-1">{book.title}</p>
                <p className="text-[11px] mb-3 text-text-3">{book.author}</p>
                <div className="w-full h-1.5 rounded-full bg-canvas">
                  <div className="h-1.5 rounded-full bg-primary" style={{ width: `${book.progress}%` }} />
                </div>
                <p className="text-[11px] mt-1 text-right text-primary">{book.progress}%</p>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 5. 최근 기록 */}
      <section className="px-5 mb-8">
        <SectionHeader title="최근 기록" rightLabel="전체보기" rightHref="/records" />
        {recentDone.length === 0 ? (
          <div className="rounded-2xl p-5 text-center bg-surface border border-border">
            <p className="text-sm text-text-3">완독한 책이 없어요</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {recentDone.map((book) => (
              <div
                key={book.id}
                className="flex items-center gap-3 p-4 rounded-2xl bg-surface border border-border"
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
                  <div className="w-12 h-[68px] rounded-lg flex-shrink-0 flex items-center justify-center bg-canvas">
                    <span className="text-xl">📚</span>
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate text-text-1">{book.title}</p>
                  <p className="text-xs mt-0.5 text-text-3">
                    {book.finished_at ? formatDate(book.finished_at) : ''}
                  </p>
                  {book.one_line && (
                    <p className="text-xs mt-1.5 line-clamp-2 text-text-2">
                      &ldquo;{book.one_line}&rdquo;
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 6. FAB */}
      <Link
        href="/record/add"
        className="fixed bottom-[76px] right-5 w-[60px] h-[60px] rounded-full flex items-center justify-center shadow-lg z-40 bg-[#3D3530]"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M12 5V19M5 12H19" stroke="#FFFFFF" strokeWidth="2.2" strokeLinecap="round" />
        </svg>
      </Link>
    </div>
  )
}
