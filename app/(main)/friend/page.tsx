import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Search, UserPlus, ChevronRight } from 'lucide-react'
import SectionHeader from '@/components/shared/SectionHeader'

interface Friend {
  id: string
  nickname: string
  avatar_url: string | null
  is_online: boolean
  friendship_level: 'sprout' | 'tree' | 'forest'
  days_together: number
  last_message: string | null
  genre_dna: Record<string, number>
}

interface MyDNA {
  genre: string
  count: number
  color: string
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

const LEVEL_MAP: Record<Friend['friendship_level'], { label: string; color: string }> = {
  sprout: { label: '연결 중', color: '#C47D2E' },
  tree: { label: '대화 가능', color: '#4A6FA5' },
  forest: { label: '무제한', color: '#8C7B6E' },
}

function Avatar({ url, nickname, size = 44, online = false }: {
  url: string | null
  nickname: string
  size?: number
  online?: boolean
}) {
  return (
    <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
      <div
        className="w-full h-full rounded-full flex items-center justify-center font-semibold"
        style={{
          width: size,
          height: size,
          backgroundColor: url ? undefined : 'var(--color-border)',
          backgroundImage: url ? `url(${url})` : undefined,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          color: 'var(--color-text-2)',
          fontSize: size * 0.4,
        }}
      >
        {!url && nickname[0]}
      </div>
      {online && (
        <span
          className="absolute bottom-0 right-0 rounded-full border-2 border-white"
          style={{ width: 10, height: 10, backgroundColor: 'var(--color-primary)' }}
        />
      )}
    </div>
  )
}

export default async function FriendPage() {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) redirect('/login')

  // 내 프로필
  const { data: profileData } = await supabase
    .from('profiles')
    .select('nickname, avatar_url')
    .eq('id', user.id)
    .single()
  const myProfile = profileData ?? { nickname: user.email?.split('@')[0] ?? '나', avatar_url: null }

  // 내 독서 DNA
  const { data: myBooks } = await supabase
    .from('book_records')
    .select('genre')
    .eq('user_id', user.id)
    .eq('status', 'done')

  const genreCounts: Record<string, number> = {}
  if (myBooks) {
    for (const b of myBooks) {
      const g = (b.genre as string) || '기타'
      genreCounts[g] = (genreCounts[g] ?? 0) + 1
    }
  }
  const totalBooks = Object.values(genreCounts).reduce((a, b) => a + b, 0) || 1
  const myDNA: MyDNA[] = Object.entries(genreCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([genre, count]) => ({ genre, count, color: GENRE_COLORS[genre] ?? 'var(--color-text-3)' }))

  // 친구 목록 (mock — 실제 friends 테이블 연동 시 교체)
  const { data: friendsRaw } = await supabase
    .from('friendships')
    .select(`
      id,
      created_at,
      level,
      last_message,
      friend:profiles!friendships_friend_id_fkey(id, nickname, avatar_url, is_online)
    `)
    .eq('user_id', user.id)
    .order('last_message_at', { ascending: false })

  type RawFriendship = {
    id: string
    created_at: string
    level: string
    last_message: string | null
    friend: { id: string; nickname: string; avatar_url: string | null; is_online: boolean } | null
  }

  const friends: Friend[] = ((friendsRaw as RawFriendship[] | null) ?? [])
    .filter((f) => f.friend !== null)
    .map((f) => {
      const createdAt = new Date(f.created_at)
      const days = Math.floor((Date.now() - createdAt.getTime()) / 86400000)
      return {
        id: f.friend!.id,
        nickname: f.friend!.nickname,
        avatar_url: f.friend!.avatar_url,
        is_online: f.friend!.is_online ?? false,
        friendship_level: (f.level as Friend['friendship_level']) ?? 'sprout',
        days_together: days,
        last_message: f.last_message,
        genre_dna: {},
      }
    })

  const sprouts = friends.filter((f) => f.friendship_level === 'sprout')
  const trees = friends.filter((f) => f.friendship_level === 'tree')
  const forests = friends.filter((f) => f.friendship_level === 'forest')

  const onlineFriends = friends.filter((f) => f.is_online)

  return (
    <div className="min-h-screen bg-canvas">
      {/* 1. TopBar */}
      <div className="flex items-center justify-between px-5 pt-[60px] pb-4">
        <h1 className="text-[22px] font-bold text-[#1C1410]">독서 친구</h1>
        <div className="flex items-center gap-4">
          <button className="w-[44px] h-[44px] flex items-center justify-center">
            <Search size={24} color="#3D3530" />
          </button>
          <button className="w-[44px] h-[44px] flex items-center justify-center">
            <UserPlus size={24} color="#3D3530" />
          </button>
        </div>
      </div>

      {/* 2. 나의 독서 DNA 카드 */}
      <div className="mx-5 mb-8">
        <div className="bg-[#3D2C24] rounded-2xl p-5 relative">
          <p className="text-[13px] text-white/55 mb-3">나의 독서 DNA</p>
          {myDNA.length === 0 ? (
            <p className="text-[14px] text-white/55">완독한 책이 없어요</p>
          ) : (
            <>
              <div className="h-2 rounded-full flex overflow-hidden">
                {myDNA.map(({ genre, count, color }) => (
                  <div
                    key={genre}
                    style={{ backgroundColor: color, width: `${(count / totalBooks) * 100}%` }}
                  />
                ))}
              </div>
              <div className="mt-2 flex flex-wrap gap-3">
                {myDNA.map(({ genre, color }) => (
                  <div key={genre} className="flex items-center gap-1.5">
                    <span
                      className="rounded-full flex-shrink-0"
                      style={{ width: 6, height: 6, backgroundColor: color }}
                    />
                    <span className="text-[11px] text-white/70">{genre}</span>
                  </div>
                ))}
              </div>
            </>
          )}
          {/* 우측 아바타 */}
          <div className="absolute right-5 top-1/2 -translate-y-1/2">
            <Avatar url={myProfile.avatar_url} nickname={myProfile.nickname} size={48} />
          </div>
        </div>
      </div>

      {/* 3. 친구들의 최근 기록 */}
      <section className="mb-8">
        <div className="px-5">
          <SectionHeader title="친구들의 최근 기록" />
        </div>
        <div className="flex items-start gap-5 px-5 overflow-x-auto scrollbar-none pb-1">
          {/* 친구 추가 버튼 */}
          <div className="flex flex-col items-center gap-1.5 flex-shrink-0">
            <div className="w-8 h-8 rounded-full border border-dashed border-[#8C7B6E] flex items-center justify-center">
              <span className="text-[14px] text-[#8C7B6E]">+</span>
            </div>
            <span className="text-[12px] text-[#8C7B6E]">추가</span>
          </div>
          {/* 온라인 친구 */}
          {onlineFriends.map((f) => (
            <Link key={f.id} href={`/chat/${f.id}`} className="flex flex-col items-center gap-1.5 flex-shrink-0">
              <Avatar url={f.avatar_url} nickname={f.nickname} size={32} online />
              <span className="text-[12px] text-[#3D3530]">{f.nickname}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* 4. 친구 목록 */}
      <section className="px-5 mb-8">
        <SectionHeader title={`친구 목록 (${friends.length}명)`} />
        {friends.length === 0 ? (
          <div className="rounded-2xl p-8 text-center bg-surface border border-border">
            <p className="text-3xl mb-3">🌱</p>
            <p className="text-sm font-medium text-text-1">아직 친구가 없어요</p>
            <p className="text-xs mt-1 text-text-3">친구를 추가해 독서를 함께해요</p>
          </div>
        ) : (
          <div className="flex flex-col">
            {(
              [
                { key: 'sprout' as const, list: sprouts },
                { key: 'tree' as const, list: trees },
                { key: 'forest' as const, list: forests },
              ] as { key: Friend['friendship_level']; list: Friend[] }[]
            )
              .filter(({ list }) => list.length > 0)
              .map(({ key, list }, groupIndex) => {
                const cfg = LEVEL_MAP[key]
                return (
                  <div key={key} className={groupIndex > 0 ? 'mt-4' : ''}>
                    <p
                      className="text-[13px] font-semibold mb-2"
                      style={{ color: cfg.color }}
                    >
                      {cfg.label}
                    </p>
                    <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                      {list.map((f, i) => (
                        <Link
                          key={f.id}
                          href={`/chat/${f.id}`}
                          className="h-[80px] px-4 flex items-center gap-3 active:bg-gray-50"
                          style={i < list.length - 1 ? { borderBottom: '1px solid #EDE8E1' } : {}}
                        >
                          <Avatar url={f.avatar_url} nickname={f.nickname} size={48} online={f.is_online} />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-0.5">
                              <span className="text-[15px] font-semibold text-[#1C1410]">
                                {f.nickname}
                              </span>
                              <span
                                className="text-[11px] px-1.5 py-0.5 rounded-full font-medium"
                                style={{ color: cfg.color, backgroundColor: `${cfg.color}18` }}
                              >
                                {cfg.label}
                              </span>
                            </div>
                            {f.last_message && (
                              <p className="text-[13px] truncate text-[#6B5E57]">
                                {f.last_message}
                              </p>
                            )}
                          </div>
                          <ChevronRight size={16} color="#8C7B6E" className="flex-shrink-0" />
                        </Link>
                      ))}
                    </div>
                  </div>
                )
              })}
          </div>
        )}
      </section>
    </div>
  )
}
