'use client'

import { useState } from 'react'

export default function NotificationToggle() {
  const [enabled, setEnabled] = useState(true)

  return (
    <button
      onClick={() => setEnabled((v) => !v)}
      className="relative inline-flex h-6 w-11 flex-shrink-0 rounded-full transition-colors duration-200"
      style={{ backgroundColor: enabled ? 'var(--color-primary)' : 'var(--color-border)' }}
      aria-pressed={enabled}
    >
      <span
        className="inline-block h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-200 mt-0.5"
        style={{ transform: enabled ? 'translateX(22px)' : 'translateX(2px)' }}
      />
    </button>
  )
}
