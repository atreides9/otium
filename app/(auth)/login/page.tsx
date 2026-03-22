'use client'

import { createClient } from '@/lib/supabase/client'
import { Provider } from '@supabase/supabase-js'

const providers: { id: Provider; label: string; bg: string; text: string; border?: string }[] = [
  { id: 'kakao', label: '카카오로 계속하기', bg: '#FEE500', text: '#000000' },
  { id: 'google', label: 'Google로 계속하기', bg: 'var(--color-surface)', text: 'var(--color-text-1)', border: 'var(--color-border)' },
  { id: 'apple', label: 'Apple로 계속하기', bg: '#000000', text: '#FFFFFF' },
]

export default function LoginPage() {
  const supabase = createClient()

  async function handleLogin(provider: Provider) {
    const options =
      provider === 'google'
        ? { redirectTo: `${location.origin}/auth/callback?next=/home` }
        : { scopes: 'profile_nickname profile_image', redirectTo: `${location.origin}/auth/callback?next=/home` }

    const { error } = await supabase.auth.signInWithOAuth({ provider, options })
    if (error) console.error(error.message)
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-5 bg-canvas">
      <div className="w-full max-w-sm flex flex-col items-center gap-10">
        {/* Logo */}
        <div className="flex flex-col items-center gap-3">
          <h1 className="text-5xl font-bold tracking-tight text-text-1">
            Otium
          </h1>
          <p className="text-sm text-center text-text-2">
            독서로 이어지는 나만의 소셜 서재
          </p>
        </div>

        {/* Social Login Buttons */}
        <div className="w-full flex flex-col gap-3">
          {providers.map(({ id, label, bg, text, border }) => (
            <button
              key={id}
              onClick={() => handleLogin(id)}
              className="w-full py-3.5 rounded-2xl text-sm font-medium transition-opacity active:opacity-70"
              style={{
                backgroundColor: bg,
                color: text,
                border: border ? `1px solid ${border}` : 'none',
              }}
            >
              {label}
            </button>
          ))}
          {/* 네이버: Supabase 기본 미지원 */}
          <button
            onClick={() => alert('준비 중입니다')}
            className="w-full py-3.5 rounded-2xl text-sm font-medium transition-opacity active:opacity-70"
            style={{ backgroundColor: '#03C75A', color: '#FFFFFF' }}
          >
            네이버로 계속하기
          </button>
        </div>
      </div>
    </div>
  )
}
