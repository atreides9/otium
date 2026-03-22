import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

interface UserSuggestion {
  id: string
  nickname: string
  avatar_url: string | null
  tags: string[]
  matchRate: number
  bookCount: number
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
        backgroundColor: url ? undefined : 'var(--color-border)',
        backgroundImage: url ? `url(${url})` : undefined,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        color: 'var(--color-text-2)',
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
      <div className="min-h-screen bg-canvas px-5 pt-14">
        <h1 className="text-xl font-bold text-text-1 mb-4">탐색</h1>
        <p className="text-sm text-text-3">오류가 발생했어요</p>
      </div>
    )
  }

  const myTags: string[] = myProfile?.tags ?? []

  // 이미 친구인 유저 ID 목록
  const { data: myFriendships } = await supabase
    .from('friendships')
    .select('friend_id')
    .eq('user_id', user.id)

  const friendIds = new Set((myFriendships ?? []).map((f: { friend_id: string }) => f.friend_id))
  friendIds.add(user.id)

  // 다른 유저 프로필 + 완독 수
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

  const topMatch = suggestions[0]
  const hasMyTags = myTags.length > 0

  return (
    <div className="min-h-screen bg-canvas">
      {/* Header */}
      <div className="px-5 pt-14 pb-4">
        <h1 className="text-xl font-bold text-text-1">탐색</h1>
        <p className="text-xs mt-1 text-text-3">취향이 비슷한 독자를 만나보세요</p>
      </div>

      {/* 내 취향 태그 */}
      <section className="px-5 mb-6">
        <p className="text-xs font-semibold mb-2 text-text-2">내 관심 장르</p>
        <div className="rounded-2xl p-4 bg-surface border border-border">
          {!hasMyTags ? (
            <p className="text-sm text-center text-text-3">
              아직 관심 장르가 없어요{' '}
              <span className="text-primary">내서재</span>에서 설정해보세요
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {myTags.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 rounded-full text-xs font-medium text-white"
                  style={{ backgroundColor: GENRE_COLORS[tag] ?? 'var(--color-text-3)' }}
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 이번 주 추천 */}
      {topMatch && topMatch.matchRate > 0 && (
        <section className="px-5 mb-6">
          <p className="text-xs font-semibold mb-2 text-text-2">이번 주 베스트 매치</p>
          <div
            className="rounded-2xl p-4 bg-surface border border-border flex items-center gap-4"
            style={{ borderColor: 'var(--color-primary)', borderWidth: 1.5 }}
          >
            <div className="relative">
              <Avatar url={topMatch.avatar_url} nickname={topMatch.nickname} size={56} />
              <span
                className="absolute -top-1 -right-1 text-[10px] font-bold px-1.5 py-0.5 rounded-full text-white"
                style={{ backgroundColor: 'var(--color-primary)' }}
              >
                {topMatch.matchRate}%
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-text-1">{topMatch.nickname}</p>
              <p className="text-xs mt-0.5 text-text-3">완독 {topMatch.bookCount}권</p>
              <div className="flex flex-wrap gap-1 mt-2">
                {topMatch.tags.slice(0, 3).map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-0.5 rounded-full text-[11px] font-medium text-white"
                    style={{ backgroundColor: GENRE_COLORS[tag] ?? 'var(--color-text-3)' }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
            <div className="flex flex-col items-end gap-2">
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, var(--color-primary), var(--color-amber))' }}
              >
                <span className="text-white text-xs font-bold">{topMatch.matchRate}%</span>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 추천 목록 */}
      <section className="px-5 mb-6">
        <p className="text-xs font-semibold mb-2 text-text-2">
          취향 맞는 독자 {suggestions.length}명
        </p>
        {suggestions.length === 0 ? (
          <div className="rounded-2xl p-8 text-center bg-surface border border-border">
            <p className="text-3xl mb-3">🔍</p>
            <p className="text-sm font-medium text-text-1">아직 추천할 독자가 없어요</p>
            <p className="text-xs mt-1 text-text-3">더 많은 책을 기록하면 매칭이 정확해져요</p>
          </div>
        ) : (
          <div className="rounded-2xl overflow-hidden bg-surface border border-border">
            {suggestions.map((u, i) => (
              <div
                key={u.id}
                className="flex items-center gap-3 px-4 py-3.5"
                style={i < suggestions.length - 1 ? { borderBottom: '1px solid var(--color-canvas)' } : {}}
              >
                <Avatar url={u.avatar_url} nickname={u.nickname} size={44} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-text-1">{u.nickname}</p>
                  <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                    {u.tags.slice(0, 2).map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-0.5 rounded-full text-[10px] font-medium text-white"
                        style={{ backgroundColor: GENRE_COLORS[tag] ?? 'var(--color-text-3)' }}
                      >
                        {tag}
                      </span>
                    ))}
                    <span className="text-[11px] text-text-3">완독 {u.bookCount}권</span>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1 flex-shrink-0">
                  {u.matchRate > 0 ? (
                    <>
                      <span className="text-sm font-bold text-primary">{u.matchRate}%</span>
                      <span className="text-[10px] text-text-3">일치</span>
                    </>
                  ) : (
                    <span className="text-[11px] text-text-3">새로운 취향</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <div className="h-6" />
    </div>
  )
}
