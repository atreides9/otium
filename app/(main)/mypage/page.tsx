import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import NotificationToggle from '@/components/mypage/NotificationToggle'

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
    name: string
    emoji: string
    description: string
  }
}

const BADGE_ICON_MAP: Record<string, string> = {
  첫완독: '📚',
  '7일연속': '🔥',
  장르탐험가: '✨',
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
  // 멀티컬러 세그먼트: green 40% / orange 25% / blue 25% / gray 나머지
  const segments = [
    { color: '#4A7C5F', share: 0.4 },
    { color: '#D4824A', share: 0.25 },
    { color: '#6B8FB5', share: 0.25 },
    { color: '#E5E1DC', share: 0.1 },
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

  const [profileResult, badgesResult] = await Promise.all([
    supabase
      .from('profiles')
      .select('nickname, avatar_url, xp, streak')
      .eq('id', user.id)
      .single(),
    supabase
      .from('user_badges')
      .select('id, earned_at, badge:badges(name, emoji, description)')
      .eq('user_id', user.id)
      .order('earned_at', { ascending: false })
      .limit(6),
  ])

  const profile: UserProfile = profileResult.data ?? {
    nickname: user.email?.split('@')[0] ?? '독자',
    avatar_url: null,
    xp: 0,
    streak: 0,
  }

  const badges: UserBadge[] = (badgesResult.data as UserBadge[] | null) ?? []

  const level = Math.floor(profile.xp / 500) + 1
  const xpInLevel = profile.xp % 500
  const xpSegments = getXpSegments(profile.xp)

  // 배지가 없으면 더미 표시
  const displayBadges =
    badges.length > 0
      ? badges
      : [
          { id: '1', earned_at: new Date().toISOString(), badge: { name: '첫완독', emoji: '📚', description: '첫 번째 완독' } },
          { id: '2', earned_at: new Date().toISOString(), badge: { name: '7일연속', emoji: '🔥', description: '7일 연속 독서' } },
          { id: '3', earned_at: new Date().toISOString(), badge: { name: '장르탐험가', emoji: '✨', description: '3가지 장르 완독' } },
        ]

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F0EDE8' }}>
      {/* Header */}
      <div className="px-5 pt-14 pb-4">
        <h1 className="text-xl font-bold" style={{ color: '#1A1A1A' }}>
          마이페이지
        </h1>
      </div>

      {/* Profile Card */}
      <div className="mx-5 mb-4 rounded-2xl p-5" style={{ backgroundColor: '#FFFFFF', border: '1px solid #E5E1DC' }}>
        <div className="flex items-center gap-4 mb-4">
          {/* Avatar */}
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: '#4A7C5F' }}
          >
            <span className="text-2xl font-bold text-white">{getInitial(profile.nickname)}</span>
          </div>
          {/* Info */}
          <div className="flex-1 min-w-0">
            <p className="text-base font-bold" style={{ color: '#1A1A1A' }}>
              {profile.nickname}
            </p>
            <p className="text-xs mt-0.5" style={{ color: '#999999' }}>
              Lv.{level} · {profile.xp} XP
            </p>
          </div>
          {/* Edit button */}
          <Link
            href="/mypage/nickname"
            className="px-3 py-1.5 rounded-lg text-xs font-medium"
            style={{ border: '1px solid #4A7C5F', color: '#4A7C5F' }}
          >
            프로필 수정
          </Link>
        </div>

        {/* XP gauge bar */}
        <div className="mb-1.5">
          <div className="flex w-full h-2.5 rounded-full overflow-hidden" style={{ backgroundColor: '#F0EDE8' }}>
            {xpSegments.map((seg, i) => (
              <div
                key={i}
                className="h-full"
                style={{ width: `${seg.width}%`, backgroundColor: '#F0EDE8', position: 'relative', overflow: 'hidden' }}
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
          <span className="text-[11px]" style={{ color: '#999999' }}>
            Lv.{level}
          </span>
          <span className="text-[11px]" style={{ color: '#999999' }}>
            {xpInLevel} / 500 XP
          </span>
        </div>
      </div>

      {/* Badges Section */}
      <div className="mx-5 mb-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-bold" style={{ color: '#1A1A1A' }}>
            획득한 배지
          </h2>
          <Link href="/mypage/badges" className="text-sm" style={{ color: '#4A7C5F' }}>
            전체
          </Link>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {displayBadges.slice(0, 3).map((ub) => (
            <div
              key={ub.id}
              className="rounded-2xl p-3 flex flex-col items-center gap-1"
              style={{ backgroundColor: '#3D3730' }}
            >
              <span className="text-3xl mt-1">{ub.badge.emoji || BADGE_ICON_MAP[ub.badge.name] || '🏅'}</span>
              <p className="text-xs font-semibold text-center" style={{ color: '#FFFFFF' }}>
                {ub.badge.name}
              </p>
              <p className="text-[10px]" style={{ color: '#999999' }}>
                {formatBadgeDate(ub.earned_at)}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Settings Groups */}
      <div className="px-5 flex flex-col gap-3 mb-6">
        {/* 계정 */}
        <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: '#FFFFFF', border: '1px solid #E5E1DC' }}>
          <p className="px-4 pt-3 pb-1 text-xs font-semibold" style={{ color: '#999999' }}>
            계정
          </p>
          <SettingRow label="닉네임 수정" href="/mypage/nickname" />
          <SettingRow label="소셜 로그인 관리" href="/mypage/social" last />
        </div>

        {/* 친구 & 채팅 */}
        <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: '#FFFFFF', border: '1px solid #E5E1DC' }}>
          <p className="px-4 pt-3 pb-1 text-xs font-semibold" style={{ color: '#999999' }}>
            친구 &amp; 채팅
          </p>
          <SettingRow label="친구 관리" href="/friend/manage" />
          <SettingRow label="채팅 설정" href="/mypage/chat-settings" last />
        </div>

        {/* 알림 & 권한 */}
        <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: '#FFFFFF', border: '1px solid #E5E1DC' }}>
          <p className="px-4 pt-3 pb-1 text-xs font-semibold" style={{ color: '#999999' }}>
            알림 &amp; 권한
          </p>
          <div
            className="flex items-center justify-between px-4 py-3.5"
            style={{ borderBottom: '1px solid #F0EDE8' }}
          >
            <span className="text-sm" style={{ color: '#1A1A1A' }}>
              알림 설정
            </span>
            <NotificationToggle />
          </div>
          <SettingRow label="권한 설정" href="/mypage/permissions" last />
        </div>

        {/* 정보 */}
        <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: '#FFFFFF', border: '1px solid #E5E1DC' }}>
          <p className="px-4 pt-3 pb-1 text-xs font-semibold" style={{ color: '#999999' }}>
            정보
          </p>
          <SettingRow label="공지사항" href="/mypage/notices" />
          <SettingRow label="약관 및 정책" href="/mypage/policy" />
          <div className="flex items-center justify-between px-4 py-3.5">
            <span className="text-sm" style={{ color: '#1A1A1A' }}>
              앱 버전
            </span>
            <span className="text-sm" style={{ color: '#999999' }}>
              1.0.0
            </span>
          </div>
        </div>
      </div>

      {/* Bottom Actions */}
      <div className="flex flex-col items-center gap-3 pb-10">
        <button className="text-sm font-medium" style={{ color: '#4A7C5F' }}>
          로그아웃
        </button>
        <button className="text-xs" style={{ color: '#999999' }}>
          계정 삭제
        </button>
      </div>
    </div>
  )
}

function SettingRow({ label, href, last = false }: { label: string; href: string; last?: boolean }) {
  return (
    <Link
      href={href}
      className="flex items-center justify-between px-4 py-3.5"
      style={last ? undefined : { borderBottom: '1px solid #F0EDE8' }}
    >
      <span className="text-sm" style={{ color: '#1A1A1A' }}>
        {label}
      </span>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
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
}
