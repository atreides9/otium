'use client'

import { createClient } from '@/lib/supabase/client'
import { Provider } from '@supabase/supabase-js'

const providers: { id: Provider; label: string; bg: string; text: string; border?: string }[] = [
  { id: 'kakao', label: '카카오로 계속하기', bg: '#FEE500', text: '#000000' },
  { id: 'azure', label: '네이버로 계속하기', bg: '#03C75A', text: '#FFFFFF' },
  { id: 'google', label: 'Google로 계속하기', bg: '#FFFFFF', text: '#1A1A1A', border: '#E5E1DC' },
  { id: 'apple', label: 'Apple로 계속하기', bg: '#000000', text: '#FFFFFF' },
]

export default function LoginPage() {
  const supabase = createClient()

  async function handleLogin(provider: Provider) {
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=/home`,
      },
    })
    if (error) console.error(error.message)
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-5" style={{ backgroundColor: '#F0EDE8' }}>
      <div className="w-full max-w-sm flex flex-col items-center gap-10">
        {/* Logo */}
        <div className="flex flex-col items-center gap-3">
          <h1 className="text-5xl font-bold tracking-tight" style={{ color: '#1A1A1A' }}>
            Otium
          </h1>
          <p className="text-sm text-center" style={{ color: '#666666' }}>
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
        </div>
      </div>
    </div>
  )
}
