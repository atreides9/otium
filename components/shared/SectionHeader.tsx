import Link from 'next/link'
import { ChevronRight } from 'lucide-react'

interface SectionHeaderProps {
  title: string
  rightLabel?: string
  rightHref?: string
  onRightClick?: () => void
}

export default function SectionHeader({ title, rightLabel, rightHref, onRightClick }: SectionHeaderProps) {
  return (
    <div className="flex justify-between items-center mb-3">
      <span className="text-[17px] font-semibold text-[#3D3530]">{title}</span>
      {rightLabel && (
        rightHref ? (
          <Link href={rightHref} className="text-[13px] text-[#8C7B6E] flex items-center gap-0.5">
            {rightLabel}
            <ChevronRight size={16} color="#8C7B6E" />
          </Link>
        ) : (
          <button onClick={onRightClick} className="text-[13px] text-[#8C7B6E] flex items-center gap-0.5">
            {rightLabel}
            <ChevronRight size={16} color="#8C7B6E" />
          </button>
        )
      )}
    </div>
  )
}
