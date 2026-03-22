'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const NICKNAME_REGEX = /^[가-힣a-zA-Z0-9]{2,10}$/

function getInitial(nickname: string) {
  return nickname.charAt(0).toUpperCase()
}

export default function NicknamePage() {
  const router = useRouter()
  const supabase = createClient()

  const [currentNickname, setCurrentNickname] = useState('')
  const [lastChangedAt, setLastChangedAt] = useState<string | null>(null)
  const [userId, setUserId] = useState<string | null>(null)

  const [input, setInput] = useState('')
  const [isValid, setIsValid] = useState(false)
  const [isDuplicateChecked, setIsDuplicateChecked] = useState(false)
  const [isDuplicate, setIsDuplicate] = useState(false)
  const [isChecking, setIsChecking] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      const { data: { user }, error: authErr } = await supabase.auth.getUser()
      if (authErr || !user) { router.replace('/login'); return }
      setUserId(user.id)

      const { data, error: profileErr } = await supabase
        .from('profiles')
        .select('nickname, last_nickname_changed_at')
        .eq('id', user.id)
        .single()

      if (profileErr) { setError('프로필을 불러올 수 없습니다.'); return }
      setCurrentNickname(data.nickname ?? '')
      setLastChangedAt(data.last_nickname_changed_at ?? null)
    }
    load()
  }, [])

  function handleInputChange(value: string) {
    setInput(value)
    setIsDuplicateChecked(false)
    setIsDuplicate(false)
    setIsValid(NICKNAME_REGEX.test(value) && value !== currentNickname)
  }

  async function handleDuplicateCheck() {
    if (!isValid) return
    setIsChecking(true)
    const { data, error: dbErr } = await supabase
      .from('profiles')
      .select('id')
      .eq('nickname', input.trim())
      .maybeSingle()
    setIsChecking(false)
    if (dbErr) { setError('중복 확인 중 오류가 발생했습니다.'); return }
    setIsDuplicateChecked(true)
    setIsDuplicate(!!data)
  }

  async function handleSave() {
    if (!userId || !isDuplicateChecked || isDuplicate || !isValid) return

    if (lastChangedAt) {
      const daysSince = (Date.now() - new Date(lastChangedAt).getTime()) / (1000 * 60 * 60 * 24)
      if (daysSince < 30) {
        const remaining = Math.ceil(30 - daysSince)
        setError(`닉네임은 30일에 한 번만 변경할 수 있습니다. (${remaining}일 후 가능)`)
        return
      }
    }

    setIsSaving(true)
    const { error: updateErr } = await supabase
      .from('profiles')
      .update({ nickname: input.trim(), last_nickname_changed_at: new Date().toISOString() })
      .eq('id', userId)
    setIsSaving(false)

    if (updateErr) { setError('저장 중 오류가 발생했습니다.'); return }
    router.back()
  }

  const canSave = isValid && isDuplicateChecked && !isDuplicate

  return (
    <div className="min-h-screen bg-canvas">
      {/* Header */}
      <div
        className="flex items-center justify-between px-5 pt-14 pb-4 bg-canvas"
      >
        <button onClick={() => router.back()} className="p-1 -ml-1">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M15 18L9 12L15 6" stroke="var(--color-text-1)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <h1 className="text-base font-bold text-text-1">닉네임 수정</h1>
        <button
          onClick={handleSave}
          disabled={!canSave || isSaving}
          className="text-sm font-semibold transition-opacity"
          style={{ color: canSave ? 'var(--color-primary)' : 'var(--color-text-4)' }}
        >
          {isSaving ? '저장 중…' : '완료'}
        </button>
      </div>

      <div className="px-5 flex flex-col gap-4">
        {/* 에러 */}
        {error && (
          <div className="rounded-xl px-4 py-3 text-sm bg-danger-tint" style={{ color: '#C0392B' }}>
            {error}
          </div>
        )}

        {/* 현재 닉네임 카드 */}
        <div className="rounded-2xl p-5 bg-surface border border-border">
          <p className="text-xs font-semibold mb-3 text-text-3">현재 닉네임</p>
          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 bg-primary"
            >
              <span className="text-lg font-bold text-white">
                {currentNickname ? getInitial(currentNickname) : '?'}
              </span>
            </div>
            <span className="text-base font-bold text-text-1">
              {currentNickname || '불러오는 중…'}
            </span>
          </div>
        </div>

        {/* 새 닉네임 입력 카드 */}
        <div className="rounded-2xl p-5 bg-surface border border-border">
          <p className="text-xs font-semibold mb-3 text-text-3">새 닉네임</p>
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => handleInputChange(e.target.value)}
              placeholder="새 닉네임 입력"
              maxLength={10}
              className="flex-1 rounded-xl px-4 py-3 text-sm outline-none"
              style={{
                backgroundColor: 'var(--color-canvas)',
                color: 'var(--color-text-1)',
                border: input && !isValid ? '1px solid #E74C3C' : '1px solid transparent',
              }}
            />
            <button
              onClick={handleDuplicateCheck}
              disabled={!isValid || isChecking}
              className="rounded-xl px-4 py-3 text-sm font-semibold flex-shrink-0 transition-opacity"
              style={{
                backgroundColor: isValid ? 'var(--color-primary)' : 'var(--color-border)',
                color: isValid ? '#FFFFFF' : 'var(--color-text-3)',
              }}
            >
              {isChecking ? '확인 중…' : '중복 확인'}
            </button>
          </div>

          {/* 인라인 피드백 */}
          {input && !isValid && (
            <p className="mt-2 text-xs" style={{ color: '#E74C3C' }}>
              {input === currentNickname ? '현재 닉네임과 동일합니다.' : '2~10자, 한글·영문·숫자만 사용 가능합니다.'}
            </p>
          )}
          {isDuplicateChecked && (
            <p className="mt-2 text-xs" style={{ color: isDuplicate ? '#E74C3C' : 'var(--color-primary)' }}>
              {isDuplicate ? '이미 사용 중인 닉네임입니다.' : '사용 가능한 닉네임입니다.'}
            </p>
          )}
        </div>

        {/* 안내 카드 */}
        <div
          className="rounded-2xl p-5 bg-warning-tint border border-warning-border"
        >
          <p className="text-sm font-bold mb-2 text-amber">닉네임 안내</p>
          <ul className="flex flex-col gap-1.5">
            {[
              '2자 이상 10자 이하',
              '한글, 영문, 숫자 사용 가능',
              '특수문자 사용 불가',
              '30일에 한 번만 변경 가능',
            ].map((item) => (
              <li key={item} className="flex items-start gap-2 text-sm text-text-2">
                <span className="mt-0.5 flex-shrink-0 text-amber">·</span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
