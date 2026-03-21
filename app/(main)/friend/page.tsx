import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

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
  소설: '#4A7C5F',
  시: '#6B8FB5',
  에세이: '#C4973A',
  자기계발: '#D4824A',
  과학: '#3D3730',
  역사: '#8B6F47',
  철학: '#7B5EA7',
  경제: '#2E7D6E',
  기타: '#999999',
}

const LEVEL_CONFIG = {
  sprout: { label: '새싹', icon: '🌱', bg: '#FFF3E8', text: '#D4824A' },
  tree: { label: '나무', icon: '🌳', bg: '#E8F0F8', text: '#6B8FB5' },
  forest: { label: '숲', icon: '🌲', bg: '#E8F4EE', text: '#4A7C5F' },
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
          backgroundColor: url ? undefined : '#E5E1DC',
          backgroundImage: url ? `url(${url})` : undefined,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          color: '#666666',
          fontSize: size * 0.4,
        }}
      >
        {!url && nickname[0]}
      </div>
      {online && (
        <span
          className="absolute bottom-0 right-0 rounded-full border-2 border-white"
          style={{ width: 10, height: 10, backgroundColor: '#4A7C5F' }}
        />
      )}
    </div>
  )
}

export default async function FriendPage() {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) redirect('/login')

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
    .map(([genre, count]) => ({ genre, count, color: GENRE_COLORS[genre] ?? '#999999' }))

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
    <div className="min-h-screen" style={{ backgroundColor: '#F0EDE8' }}>
      {/* Header */}
      <div className="px-5 pt-14 pb-4">
        <h1 className="text-xl font-bold" style={{ color: '#1A1A1A' }}>친구</h1>
      </div>

      {/* 나의 독서 DNA */}
      <section className="px-5 mb-6">
        <p className="text-xs font-semibold mb-2" style={{ color: '#666666' }}>나의 독서 DNA</p>
        <div
          className="rounded-2xl p-4"
          style={{ backgroundColor: '#FFFFFF', border: '1px solid #E5E1DC' }}
        >
          {myDNA.length === 0 ? (
            <p className="text-sm text-center" style={{ color: '#999999' }}>완독한 책이 없어요</p>
          ) : (
            <>
              {/* 세그먼트 바 */}
              <div className="flex w-full h-3 rounded-full overflow-hidden mb-3">
                {myDNA.map(({ genre, count, color }) => (
                  <div
                    key={genre}
                    style={{ backgroundColor: color, width: `${(count / totalBooks) * 100}%` }}
                  />
                ))}
              </div>
              {/* 범례 */}
              <div className="flex flex-wrap gap-x-3 gap-y-1">
                {myDNA.map(({ genre, count, color }) => (
                  <div key={genre} className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
                    <span className="text-[11px]" style={{ color: '#666666' }}>
                      {genre} {Math.round((count / totalBooks) * 100)}%
                    </span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </section>

      {/* 온라인 친구 스토리 */}
      {onlineFriends.length > 0 && (
        <section className="mb-6">
          <p className="text-xs font-semibold px-5 mb-3" style={{ color: '#666666' }}>
            지금 온라인
          </p>
          <div className="flex gap-4 overflow-x-auto px-5 pb-1 scrollbar-none">
            {onlineFriends.map((f) => (
              <Link key={f.id} href={`/chat/${f.id}`} className="flex flex-col items-center gap-1.5 flex-shrink-0">
                <div
                  className="p-0.5 rounded-full"
                  style={{ background: 'linear-gradient(135deg, #4A7C5F, #C4973A)' }}
                >
                  <div className="p-0.5 rounded-full bg-white">
                    <Avatar url={f.avatar_url} nickname={f.nickname} size={52} online />
                  </div>
                </div>
                <span className="text-[11px]" style={{ color: '#666666' }}>{f.nickname}</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* 친구 목록 그룹 */}
      {friends.length === 0 ? (
        <div className="px-5">
          <div
            className="rounded-2xl p-8 text-center"
            style={{ backgroundColor: '#FFFFFF', border: '1px solid #E5E1DC' }}
          >
            <p className="text-3xl mb-3">🌱</p>
            <p className="text-sm font-medium" style={{ color: '#1A1A1A' }}>아직 친구가 없어요</p>
            <p className="text-xs mt-1" style={{ color: '#999999' }}>친구를 추가해 독서를 함께해요</p>
          </div>
        </div>
      ) : (
        <div className="px-5 flex flex-col gap-5">
          {([
            { key: 'forest', list: forests },
            { key: 'tree', list: trees },
            { key: 'sprout', list: sprouts },
          ] as { key: Friend['friendship_level']; list: Friend[] }[])
            .filter(({ list }) => list.length > 0)
            .map(({ key, list }) => {
              const cfg = LEVEL_CONFIG[key]
              return (
                <div key={key}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-base">{cfg.icon}</span>
                    <span className="text-sm font-semibold" style={{ color: '#1A1A1A' }}>{cfg.label}</span>
                    <span
                      className="text-xs px-2 py-0.5 rounded-full font-medium"
                      style={{ backgroundColor: cfg.bg, color: cfg.text }}
                    >
                      {list.length}명
                    </span>
                  </div>
                  <div
                    className="rounded-2xl overflow-hidden"
                    style={{ backgroundColor: '#FFFFFF', border: '1px solid #E5E1DC' }}
                  >
                    {list.map((f, i) => (
                      <Link
                        key={f.id}
                        href={`/chat/${f.id}`}
                        className="flex items-center gap-3 px-4 py-3.5 active:bg-gray-50"
                        style={i < list.length - 1 ? { borderBottom: '1px solid #F0EDE8' } : {}}
                      >
                        <Avatar url={f.avatar_url} nickname={f.nickname} online={f.is_online} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="text-sm font-semibold" style={{ color: '#1A1A1A' }}>
                              {f.nickname}
                            </span>
                            <span
                              className="text-[10px] px-1.5 py-0.5 rounded-full font-medium"
                              style={{ backgroundColor: cfg.bg, color: cfg.text }}
                            >
                              {cfg.icon} {cfg.label}
                            </span>
                          </div>
                          {f.last_message && (
                            <p className="text-xs truncate" style={{ color: '#999999' }}>
                              {f.last_message}
                            </p>
                          )}
                        </div>
                        <div className="flex-shrink-0 text-right">
                          <span className="text-[11px] font-medium" style={{ color: '#C4973A' }}>
                            D+{f.days_together}
                          </span>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )
            })}
        </div>
      )}

      {/* 친구 추가 FAB */}
      <button
        className="fixed bottom-24 right-5 w-14 h-14 rounded-full flex items-center justify-center shadow-lg z-40"
        style={{ backgroundColor: '#4A7C5F' }}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M16 11C17.6569 11 19 9.65685 19 8C19 6.34315 17.6569 5 16 5" stroke="white" strokeWidth="2" strokeLinecap="round"/>
          <path d="M21 17C21 14.7909 18.7614 13 16 13" stroke="white" strokeWidth="2" strokeLinecap="round"/>
          <circle cx="9" cy="8" r="3" stroke="white" strokeWidth="2"/>
          <path d="M3 19C3 16.2386 5.68629 14 9 14C12.3137 14 15 16.2386 15 19" stroke="white" strokeWidth="2" strokeLinecap="round"/>
          <path d="M9 19V21M8 20H10" stroke="white" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      </button>

      <div className="h-6" />
    </div>
  )
}
