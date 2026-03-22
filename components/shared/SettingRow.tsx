import Link from 'next/link'
import { ChevronRight } from 'lucide-react'

interface SettingRowProps {
  label: string
  href?: string
  last?: boolean
  rightContent?: React.ReactNode
}

export default function SettingRow({ label, href, last, rightContent }: SettingRowProps) {
  const inner = (
    <>
      <span className="text-[15px] text-[#3D3530]">{label}</span>
      {rightContent ?? <ChevronRight size={20} color="#8C7B6E" />}
    </>
  )

  const cls = `h-[60px] flex items-center justify-between px-5 ${!last ? 'border-t border-[#EDE8E1]' : ''}`

  return href ? (
    <Link href={href} className={cls}>{inner}</Link>
  ) : (
    <div className={cls}>{inner}</div>
  )
}
