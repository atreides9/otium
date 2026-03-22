interface MatchBadgeProps {
  percentage: number
}

export default function MatchBadge({ percentage }: MatchBadgeProps) {
  const style =
    percentage >= 80
      ? 'bg-[#EBF3ED] text-[#2D5A35] border border-[#8CB89A]'
      : percentage >= 50
      ? 'bg-[#FDF0E2] text-[#7A3B1E] border border-[#E0A96D]'
      : 'bg-[#EDE8E1] text-[#6B5E57] border border-[#D4CAC2]'

  return (
    <span className={`text-[12px] font-medium px-2.5 py-0.5 rounded-full ${style}`}>
      {percentage}% 일치
    </span>
  )
}
