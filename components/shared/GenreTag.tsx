interface GenreTagProps {
  label: string
  color?: string
}

export default function GenreTag({ label, color }: GenreTagProps) {
  if (color) {
    return (
      <span
        className="text-[12px] font-medium px-2.5 py-1 rounded-full text-white"
        style={{ backgroundColor: color }}
      >
        {label}
      </span>
    )
  }

  return (
    <span className="text-[12px] font-medium px-2.5 py-1 rounded-full bg-[#EDE8E1] text-[#3D3530]">
      {label}
    </span>
  )
}
