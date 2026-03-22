import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Search } from 'lucide-react'
import SectionHeader from '@/components/shared/SectionHeader'
import MatchBadge from '@/components/shared/MatchBadge'
import GenreTag from '@/components/shared/GenreTag'

interface UserSuggestion {
  id: string
  nickname: string
  avatar_url: string | null
  tags: string[]
  matchRate: number
  bookCount: number
  lastBook?: string
}

const GENRE_COLORS: Record<string, string> = {
  소설: 'var(--color-primary)',
  시: 'var(--color-slate)',
  에세이: 'var(--color-amber)',
  자기계발: 'var(--color-terracotta)',
  과학: 'var(--color-surface-dark)',
  역사: '#8B6F47',
  철학: '#7B5EA7',
  경제: '#2E7D6E',
  기타: 'var(--color-text-3)',
}

const BOOK_RECS = [
  { recommender: '지수', title: '달러구트 꿈 백화점', genre: '소설' },
  { recommender: '민준', title: '사피엔스', genre: '인문' },
  { recommender: '서연', title: '코스모스', genre: '과학' },
  { recommender: '현우', title: '채식주의자', genre: '소설' },
]

function calcMatchRate(a: string[], b: string[]): number {
  if (a.length === 0 || b.length === 0) return 0
  const setA = new Set(a)
  const setB = new Set(b)
  const intersection = [...setA].filter((x) => setB.has(x)).length
  const union = new Set([...setA, ...setB]).size
  return Math.round((intersection / union) * 100)
}

function Avatar({ url, nickname, size = 52 }: { url: string | null; nickname: string; size?: number }) {
  return (
    <div
      className="rounded-full flex items-center justify-center font-semibold flex-shrink-0"
      style={{
        width: size,
        height: size,
        backgroundColor: url ? undefined : '#D4CAC2',
        backgroundImage: url ? `url(${url})` : undefined,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        color: '#6B5E57',
        fontSize: size * 0.38,
      }}
    >
      {!url && nickname[0]}
    </div>
  )
}

export default async function ExplorePage() {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) redirect('/login')

  const { data: myProfile, error: profileError } = await supabase
    .from('profiles')
    .select('tags')
    .eq('id', user.id)
    .single()

  if (profileError) {
    return (
      <div className="min-h-screen bg-[#F5F0E8] px-5 pt-14">
        <h1 className="text-[22px] font-bold text-[#1C1410] mb-4">탐색</h1>
        <p className="text-sm text-[#8C7B6E]">오류가 발생했어요</p>
      </div>
    )
  }

  const myTags: string[] = myProfile?.tags ?? []

  const { data: myFriendships } = await supabase
    .from('friendships')
    .select('friend_id')
    .eq('user_id', user.id)

  const friendIds = new Set((myFriendships ?? []).map((f: { friend_id: string }) => f.friend_id))
  friendIds.add(user.id)

  const { data: others } = await supabase
    .from('profiles')
    .select('id, nickname, avatar_url, tags')
    .neq('id', user.id)
    .limit(100)

  const { data: bookCounts } = await supabase
    .from('book_records')
    .select('user_id')
    .eq('status', 'done')

  const countMap: Record<string, number> = {}
  if (bookCounts) {
    for (const row of bookCounts as { user_id: string }[]) {
      countMap[row.user_id] = (countMap[row.user_id] ?? 0) + 1
    }
  }

  const suggestions: UserSuggestion[] = ((others ?? []) as {
    id: string
    nickname: string
    avatar_url: string | null
    tags: string[] | null
  }[])
    .filter((u) => !friendIds.has(u.id))
    .map((u) => ({
      id: u.id,
      nickname: u.nickname,
      avatar_url: u.avatar_url,
      tags: u.tags ?? [],
      matchRate: calcMatchRate(myTags, u.tags ?? []),
      bookCount: countMap[u.id] ?? 0,
    }))
    .sort((a, b) => b.matchRate - a.matchRate)
    .slice(0, 20)

  // 상위 유저 최근 완독 책 조회
  const topIds = suggestions.slice(0, 8).map((s) => s.id)
  const lastBookMap: Record<string, string> = {}
  if (topIds.length > 0) {
    const { data: lastBooks } = await supabase
      .from('book_records')
      .select('user_id, title')
      .in('user_id', topIds)
      .eq('status', 'done')
      .order('updated_at', { ascending: false })
    if (lastBooks) {
      for (const b of lastBooks as { user_id: string; title: string }[]) {
        if (!lastBookMap[b.user_id]) lastBookMap[b.user_id] = b.title
      }
    }
  }

  const enriched = suggestions.map((s) => ({ ...s, lastBook: lastBookMap[s.id] }))
  const weeklyTop3 = enriched.slice(0, 3)
  const matchList = enriched.slice(0, 8)

  return (
    <div className="min-h-screen bg-[#F5F0E8]">
      {/* TopBar */}
      <div className="flex items-center justify-between px-5 pt-[60px] pb-4">
        <h1 className="text-[22px] font-bold text-[#1C1410]">탐색</h1>
        <button className="w-[44px] h-[44px] flex items-center justify-center">
          <Search size={24} color="#3D3530" />
        </button>
      </div>

      {/* 1. 이번 주 독서 친구 추천 */}
      <section className="px-5 mb-8">
        <SectionHeader title="이번 주 독서 친구 추천" rightLabel="매주 금요일 갱신" />
        {weeklyTop3.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm p-8 text-center">
            <p className="text-sm text-[#8C7B6E]">추천할 독자가 없어요</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {weeklyTop3.map((u) => (
              <div key={u.id} className="bg-white rounded-2xl shadow-sm p-4">
                <div className="flex items-center gap-3">
                  <Avatar url={u.avatar_url} nickname={u.nickname} size={40} />
                  <span className="text-[15px] font-semibold text-[#1C1410]">{u.nickname}</span>
                  <MatchBadge percentage={u.matchRate} />
                  <button className="ml-auto border border-[#D4CAC2] rounded-lg h-[36px] px-4 text-[13px] text-[#3D3530]">
                    추가
                  </button>
                </div>
                {u.lastBook && (
                  <p className="text-[13px] text-[#6B5E57] ml-[48px] mt-1">
                    최근 읽은 책: {u.lastBook}
                  </p>
                )}
                {u.tags.length > 0 && (
                  <div className="flex gap-1.5 ml-[48px] mt-1.5">
                    {u.tags.slice(0, 3).map((tag) => (
                      <GenreTag key={tag} label={tag} color={GENRE_COLORS[tag]} />
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 2. 취향이 잘 맞는 독서가 */}
      <section className="px-5 mb-8">
        <SectionHeader title="취향이 잘 맞는 독서가" />
        {matchList.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm p-8 text-center">
            <p className="text-sm text-[#8C7B6E]">매칭되는 독자가 없어요</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            {matchList.slice(0, 4).map((u, i) => (
              <div
                key={u.id}
                className="h-[72px] px-4 flex items-center gap-3"
                style={i > 0 ? { borderTop: '1px solid #EDE8E1' } : {}}
              >
                <Avatar url={u.avatar_url} nickname={u.nickname} size={48} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[15px] font-semibold text-[#1C1410] truncate">{u.nickname}</span>
                    <MatchBadge percentage={u.matchRate} />
                  </div>
                  {u.lastBook && (
                    <p className="text-[13px] text-[#6B5E57] truncate">{u.lastBook}</p>
                  )}
                  {u.tags.length > 0 && (
                    <div className="flex gap-1 mt-0.5">
                      {u.tags.slice(0, 2).map((tag) => (
                        <GenreTag key={tag} label={tag} color={GENRE_COLORS[tag]} />
                      ))}
                    </div>
                  )}
                </div>
                <button className="flex-shrink-0 border border-[#D4CAC2] rounded-lg h-[36px] px-4 text-[13px] text-[#3D3530]">
                  추가
                </button>
              </div>
            ))}
            {matchList.length > 4 && (
              <button className="text-[14px] text-[#6B5E57] text-center w-full py-3 border-t border-[#EDE8E1]">
                더 보기
              </button>
            )}
          </div>
        )}
      </section>

      {/* 3. 서로 책 추천하기 */}
      <section className="px-5 mb-8">
        <div className="flex justify-between items-center mb-3">
          <span className="text-[17px] font-semibold text-[#3D3530]">서로 책 추천하기</span>
          <button className="text-[13px] font-medium text-[#4A7C59]">+ 책 추천하기</button>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {BOOK_RECS.map((rec, i) => (
            <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-sm">
              <div className="h-[100px] bg-[#EDE8E1]" />
              <div className="p-3">
                <span className="inline-block text-[12px] font-medium px-2 py-0.5 rounded-full bg-[#EBF3ED] text-[#2D5A35]">
                  {rec.recommender}님 추천
                </span>
                <p className="text-[14px] font-semibold text-[#1C1410] mt-1.5 truncate">{rec.title}</p>
                <div className="mt-1">
                  <GenreTag label={rec.genre} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="h-6" />
    </div>
  )
}
