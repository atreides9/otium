# Otium — Component Patterns

## 공용 컴포넌트 위치
Avatar          → /components/shared/Avatar.tsx
GenreTag        → /components/shared/GenreTag.tsx
MatchBadge      → /components/shared/MatchBadge.tsx
SectionHeader   → /components/shared/SectionHeader.tsx
SettingRow      → /components/shared/SettingRow.tsx
FAB             → /components/shared/FAB.tsx
ReadingDNACard  → /components/friend/ReadingDNACard.tsx

## TopBar 패턴 (전 탭 공통)
pt-[60px] pb-4 px-5 · 제목 text-[22px] font-bold · 우측 아이콘 24px Gray-700 터치타겟 44px

## Section 패턴
섹션 간격 mb-8 · 헤더 flex justify-between items-center mb-3
제목 text-[17px] font-semibold text-gray-700 · 부제/액션 text-[13px] text-gray-400

## List Card 패턴
단일 bg-white rounded-2xl shadow-sm overflow-hidden 컨테이너
row 사이 border-t border-gray-100 · row 높이 h-[72px](1줄) / h-[80px](2줄) · padding px-4

## MatchBadge
≥80%  bg-[#EBF3ED] text-[#2D5A35] border border-[#8CB89A]
50-79% bg-[#FDF0E2] text-[#7A3B1E] border border-[#E0A96D]
<50%  bg-[#EDE8E1] text-[#6B5E57] border border-[#D4CAC2]
공통: text-[12px] font-medium px-2.5 py-0.5 rounded-full

## FAB
fixed bottom-[76px] right-5 · w-[60px] h-[60px] rounded-full bg-[#3D3530] text-white z-40 shadow-lg

## Supabase 에러 핸들링
const { data, error } = await supabase.from('table').select(...)
if (error) return <p className="text-sm text-center py-8 text-gray-400">오류가 발생했어요</p>
if (!data?.length) return <EmptyState />
