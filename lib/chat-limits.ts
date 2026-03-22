// 채팅 단계별 제한 설정
// 주간 리셋: DB cron 또는 서버에서 매주 리셋 필요 (message_count_today, quote_count_today 컬럼)

export const CHAT_LIMITS = {
  sprout: {
    quotesPerDay: 3,          // 하루 구절 공유 3개
    weeklyReset: true,        // 주간 리셋 적용
  },
  tree: {
    maxChars: 30,             // 메시지 30자 제한
    messagesPerDay: 30,       // 하루 30개 제한
    chatWindowHours: 2,       // 2시간 채팅 시간 제한 (첫 메시지 기준)
    weeklyReset: true,        // 주간 리셋 적용
  },
  forest: {
    // 제한 없음
  },
} as const

export function getLevelFromDays(days: number): 'sprout' | 'tree' | 'forest' {
  if (days <= 7) return 'sprout'
  if (days <= 30) return 'tree'
  return 'forest'
}

export function isChatWindowOpen(firstMessageAt: string | null, windowHours: number): boolean {
  if (!firstMessageAt) return true
  const elapsed = (Date.now() - new Date(firstMessageAt).getTime()) / 3600000
  return elapsed < windowHours
}

export function isToday(isoString: string): boolean {
  const d = new Date(isoString)
  const now = new Date()
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  )
}
