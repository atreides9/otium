'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const tabs = [
  {
    href: '/',
    label: '홈',
    icon: (active: boolean) => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M3 9.5L12 3L21 9.5V20C21 20.5523 20.5523 21 20 21H15V15H9V21H4C3.44772 21 3 20.5523 3 20V9.5Z"
          stroke={active ? '#4A7C5F' : '#999999'}
          strokeWidth="1.8"
          strokeLinejoin="round"
          fill={active ? '#4A7C5F' : 'none'}
          fillOpacity={active ? 0.12 : 0}
        />
      </svg>
    ),
  },
  {
    href: '/explore',
    label: '탐색',
    icon: (active: boolean) => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle
          cx="11"
          cy="11"
          r="7"
          stroke={active ? '#4A7C5F' : '#999999'}
          strokeWidth="1.8"
        />
        <path
          d="M20 20L16.5 16.5"
          stroke={active ? '#4A7C5F' : '#999999'}
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    href: '/records',
    label: '기록',
    icon: (active: boolean) => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect
          x="3"
          y="3"
          width="18"
          height="18"
          rx="3"
          stroke={active ? '#4A7C5F' : '#999999'}
          strokeWidth="1.8"
          fill={active ? '#4A7C5F' : 'none'}
          fillOpacity={active ? 0.12 : 0}
        />
        <path
          d="M7 15L10 11L13 13L16 9"
          stroke={active ? '#4A7C5F' : '#999999'}
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    href: '/friend',
    label: '친구',
    icon: (active: boolean) => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle
          cx="9"
          cy="8"
          r="3.5"
          stroke={active ? '#4A7C5F' : '#999999'}
          strokeWidth="1.8"
        />
        <path
          d="M3 19C3 16.2386 5.68629 14 9 14C12.3137 14 15 16.2386 15 19"
          stroke={active ? '#4A7C5F' : '#999999'}
          strokeWidth="1.8"
          strokeLinecap="round"
        />
        <path
          d="M16 6C17.6569 6 19 7.34315 19 9C19 10.6569 17.6569 12 16 12"
          stroke={active ? '#4A7C5F' : '#999999'}
          strokeWidth="1.8"
          strokeLinecap="round"
        />
        <path
          d="M18 14C20.2091 14.5 22 16.5 22 19"
          stroke={active ? '#4A7C5F' : '#999999'}
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    href: '/library',
    label: '내서재',
    icon: (active: boolean) => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect
          x="4"
          y="3"
          width="5"
          height="18"
          rx="1"
          stroke={active ? '#4A7C5F' : '#999999'}
          strokeWidth="1.8"
          fill={active ? '#4A7C5F' : 'none'}
          fillOpacity={active ? 0.12 : 0}
        />
        <rect
          x="10"
          y="3"
          width="5"
          height="18"
          rx="1"
          stroke={active ? '#4A7C5F' : '#999999'}
          strokeWidth="1.8"
          fill={active ? '#4A7C5F' : 'none'}
          fillOpacity={active ? 0.12 : 0}
        />
        <path
          d="M16.5 4L20.5 5.5V20.5L16.5 19V4Z"
          stroke={active ? '#4A7C5F' : '#999999'}
          strokeWidth="1.8"
          strokeLinejoin="round"
          fill={active ? '#4A7C5F' : 'none'}
          fillOpacity={active ? 0.12 : 0}
        />
      </svg>
    ),
  },
]

export default function GNB() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50">
      <div className="flex items-center justify-around px-2 pb-safe">
        {tabs.map(({ href, label, icon }) => {
          const active = pathname === href
          return (
            <Link
              key={href}
              href={href}
              className="flex flex-col items-center gap-1 py-3 px-4 min-w-[60px]"
            >
              {icon(active)}
              <span
                className="text-[11px] font-medium leading-none"
                style={{ color: active ? '#4A7C5F' : '#999999' }}
              >
                {label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
