import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import NotificationToggle from '@/components/mypage/NotificationToggle'
import SectionHeader from '@/components/shared/SectionHeader'
import SettingRow from '@/components/shared/SettingRow'

interface UserProfile {
  nickname: string
  avatar_url: string | null
  xp: number
  streak: number
}

interface UserBadge {
  id: string
  earned_at: string
  badge: {
    badge_name: string
    emoji: string
    description: string
  }
}

const BADGE_ICON_MAP: Record<string, string> = {
  첫완독: '📚',
  '7일연속': '🔥',
  장르탐험가: '✨',
}

const GENRE_COLORS: Record<string, string> = {
  소설: '#4A7C59',
  시: '#6B8CAE',
  에세이: '#C47D2E',
  자기계발: '#C45C44',
  과학: '#3D2C24',
  역사: '#8B6F47',
  철학: '#7B5EA7',
  경제: '#2E7D6E',
  기타: '#8C7B6E',
}

function getInitial(nickname: string) {
  return nickname.charAt(0).toUpperCase()
}

function formatBadgeDate(dateStr: string) {
  const d = new Date(dateStr)
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`
}

// XP 레벨 구간: 500 XP = 1레벨
function getXpSegments(xp: number) {
  const levelCap = 500
  const progress = Math.min((xp % levelCap) / levelCap, 1)
  const segments = [
    { color: 'var(--color-primary)', share: 0.4 },
    { color: 'var(--color-terracotta)', share: 0.25 },
    { color: 'var(--color-slate)', share: 0.25 },
    { color: 'var(--color-border)', share: 0.1 },
  ]
  let filled = 0
  return segments.map((seg) => {
    const start = filled
    const end = filled + seg.share
    const segProgress = Math.min(Math.max((progress - start) / seg.share, 0), 1)
    filled = end
    return { color: seg.color, width: seg.share * 100, fill: segProgress * 100 }
  })
}

export default async function MyPage() {
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()
  if (authError || !user) redirect('/login')

  const [profileResult, badgesResult, booksResult] = await Promise.all([
    supabase
      .from('profiles')
      .select('nickname, avatar_url, xp, streak')
      .eq('id', user.id)
      .single(),
    supabase
      .from('user_badges')
      .select('id, earned_at, badge:badges(badge_name, emoji, description)')
      .eq('user_id', user.id)
      .order('earned_at', { ascending: false })
      .limit(6),
    supabase
      .from('book_records')
      .select('genre')
      .eq('user_id', user.id)
      .eq('status', 'done'),
  ])

  const profile: UserProfile = profileResult.data ?? {
    nickname: user.email?.split('@')[0] ?? '독자',
    avatar_url: null,
    xp: 0,
    streak: 0,
  }

  const badges: UserBadge[] = (badgesResult.data as UserBadge[] | null) ?? []

  // Genre DNA
  const genreCounts: Record<string, number> = {}
  if (booksResult.data) {
    for (const b of booksResult.data as { genre: string | null }[]) {
      const g = b.genre ?? '기타'
      genreCounts[g] = (genreCounts[g] ?? 0) + 1
    }
  }
  const totalGenreBooks = Object.values(genreCounts).reduce((a, b) => a + b, 0) || 1
  const myDNA = Object.entries(genreCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([genre, count]) => ({ genre, count, color: GENRE_COLORS[genre] ?? '#8C7B6E' }))

  const level = Math.floor(profile.xp / 500) + 1
  const xpInLevel = profile.xp % 500
  const xpSegments = getXpSegments(profile.xp)

  const displayBadges =
    badges.length > 0
      ? badges
      : [
          { id: '1', earned_at: new Date().toISOString(), badge: { badge_name: '첫완독', emoji: '📚', description: '첫 번째 완독' } },
          { id: '2', earned_at: new Date().toISOString(), badge: { badge_name: '7일연속', emoji: '🔥', description: '7일 연속 독서' } },
          { id: '3', earned_at: new Date().toISOString(), badge: { badge_name: '장르탐험가', emoji: '✨', description: '3가지 장르 완독' } },
        ]

  return (
    <div className="min-h-screen bg-[#F5F0E8]">
      {/* TopBar */}
      <div className="px-5 pt-[60px] pb-4">
        <h1 className="text-[22px] font-bold text-[#1C1410]">내 서재</h1>
      </div>

      {/* 프로필 카드 */}
      <div className="mx-5 mb-2 bg-white rounded-2xl px-5 pt-5 pb-4 shadow-sm">
        <div className="flex items-start gap-4 mb-4">
          {/* 아바타 68px gradient */}
          <div className="w-[68px] h-[68px] rounded-full flex-shrink-0 bg-gradient-to-br from-[#8CB89A] to-[#4A7C59] flex items-center justify-center">
            <span className="text-2xl font-bold text-white">{getInitial(profile.nickname)}</span>
          </div>
          {/* 우측 블록 */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <p className="text-[18px] font-bold text-[#1C1410] truncate">{profile.nickname}</p>
              <Link
                href="/mypage/nickname"
                className="flex-shrink-0 px-3 py-1.5 rounded-lg text-[13px] font-medium border border-[#4A7C59] text-[#4A7C59]"
              >
                프로필 수정
              </Link>
            </div>
            <p className="text-[13px] text-[#6B5E57] mt-0.5">
              Lv.{level} · {profile.xp} XP
            </p>
            {/* Genre DNA 세그먼트 바 */}
            <div className="w-[128px] h-2 rounded-full flex overflow-hidden mt-2">
              {myDNA.length > 0 ? (
                myDNA.map(({ genre, count, color }) => (
                  <div
                    key={genre}
                    style={{ width: `${(count / totalGenreBooks) * 100}%`, backgroundColor: color }}
                  />
                ))
              ) : (
                <div className="w-full h-full bg-[#EDE8E1]" />
              )}
            </div>
          </div>
        </div>

        {/* XP progress bar */}
        <div className="mb-1.5">
          <div className="flex w-full h-2.5 rounded-full overflow-hidden bg-[#EDE8E1]">
            {xpSegments.map((seg, i) => (
              <div
                key={i}
                className="h-full relative overflow-hidden"
                style={{ width: `${seg.width}%`, backgroundColor: '#EDE8E1' }}
              >
                <div
                  className="h-full absolute left-0 top-0 transition-all duration-500"
                  style={{ width: `${seg.fill}%`, backgroundColor: seg.color }}
                />
              </div>
            ))}
          </div>
        </div>
        <div className="flex justify-between">
          <span className="text-[11px] text-[#8C7B6E]">Lv.{level}</span>
          <span className="text-[11px] text-[#8C7B6E]">{xpInLevel} / 500 XP</span>
        </div>
      </div>

      {/* 배지 섹션 */}
      <div className="mx-5 mb-2">
        <SectionHeader title="획득한 배지" rightLabel="전체" rightHref="/mypage/badges" />
        <div className="flex gap-3 overflow-x-auto pb-1">
          {displayBadges.map((ub) => (
            <div
              key={ub.id}
              className="flex-shrink-0 w-[88px] bg-[#3D2C24] rounded-2xl p-3 flex flex-col items-center gap-1"
            >
              <span className="text-[32px]">{ub.badge.emoji || BADGE_ICON_MAP[ub.badge.badge_name] || '🏅'}</span>
              <p className="text-[12px] font-semibold text-white text-center">{ub.badge.badge_name}</p>
              <p className="text-[10px] text-[#8C7B6E]">{formatBadgeDate(ub.earned_at)}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 설정 Groups */}
      <div className="px-5 space-y-2 mb-6">
        {/* 계정 */}
        <div className="bg-white rounded-2xl overflow-hidden shadow-sm">
          <div className="px-5 py-3 border-b border-[#EDE8E1]">
            <span className="text-[13px] font-semibold text-[#6B5E57]">계정</span>
          </div>
          <SettingRow label="닉네임 수정" href="/mypage/nickname" />
          <SettingRow label="소셜 로그인 관리" href="/mypage/social" last />
        </div>

        {/* 친구 & 채팅 */}
        <div className="bg-white rounded-2xl overflow-hidden shadow-sm">
          <div className="px-5 py-3 border-b border-[#EDE8E1]">
            <span className="text-[13px] font-semibold text-[#6B5E57]">친구 &amp; 채팅</span>
          </div>
          <SettingRow label="친구 관리" href="/friend/manage" />
          <SettingRow label="채팅 설정" href="/mypage/chat-settings" last />
        </div>

        {/* 알림 & 권한 */}
        <div className="bg-white rounded-2xl overflow-hidden shadow-sm">
          <div className="px-5 py-3 border-b border-[#EDE8E1]">
            <span className="text-[13px] font-semibold text-[#6B5E57]">알림 &amp; 권한</span>
          </div>
          <SettingRow label="알림 설정" rightContent={<NotificationToggle />} />
          <SettingRow label="권한 설정" href="/mypage/permissions" last />
        </div>

        {/* 정보 */}
        <div className="bg-white rounded-2xl overflow-hidden shadow-sm">
          <div className="px-5 py-3 border-b border-[#EDE8E1]">
            <span className="text-[13px] font-semibold text-[#6B5E57]">정보</span>
          </div>
          <SettingRow label="공지사항" href="/mypage/notices" />
          <SettingRow label="약관 및 정책" href="/mypage/policy" />
          <SettingRow
            label="앱 버전"
            rightContent={<span className="text-[14px] text-[#6B5E57]">1.0.0</span>}
            last
          />
        </div>
      </div>

      {/* 하단 액션 */}
      <div className="flex flex-col items-center gap-3 pb-10">
        <button className="text-sm font-medium text-[#4A7C59]">로그아웃</button>
        <button className="text-xs text-[#8C7B6E]">계정 삭제</button>
      </div>
    </div>
  )
}
