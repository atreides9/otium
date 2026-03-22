'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Compass, PenLine, Users, BookMarked, type LucideIcon } from 'lucide-react'

const tabs: { href: string; label: string; Icon: LucideIcon }[] = [
  { href: '/home',    label: '홈',    Icon: Home },
  { href: '/explore', label: '탐색',  Icon: Compass },
  { href: '/records', label: '기록',  Icon: PenLine },
  { href: '/friend',  label: '친구',  Icon: Users },
  { href: '/mypage',  label: '내서재', Icon: BookMarked },
]

export default function GNB() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 h-[56px] border-t border-[#D4CAC2] bg-[#F5F0E8] z-50">
      <div className="flex items-center justify-around h-full px-2">
        {tabs.map(({ href, label, Icon }) => {
          const active = pathname === href
          return (
            <Link
              key={href}
              href={href}
              className="min-w-[60px] h-full flex flex-col items-center justify-center gap-1"
            >
              <Icon
                size={24}
                color={active ? '#4A7C59' : '#8C7B6E'}
                strokeWidth={active ? 2.2 : 1.8}
              />
              <span
                className={`text-[10px] leading-none ${active ? 'font-semibold text-[#2D5A35]' : 'text-[#8C7B6E]'}`}
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
