'use client'

import { useState } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from 'recharts'

// ─── 타입 ───────────────────────────────────────────────
type Genre = '소설' | '에세이' | '인문' | '경제' | '과학' | '자기계발'

interface Book {
  title: string
  author: string
  genre: Genre
  pages: number
}

interface Author {
  name: string
  genre: Genre
  count: number
}

// ─── 더미 데이터 ──────────────────────────────────────────
const GENRE_COLOR: Record<Genre, string> = {
  소설: '#D4C5A9',
  에세이: '#6B8FB5',
  인문: '#4A7C5F',
  경제: '#C4973A',
  과학: '#D4824A',
  자기계발: '#9B8BB4',
}

const MONTHLY_BOOKS: Record<number, Book[]> = {
  1: [
    { title: '채식주의자', author: '한강', genre: '소설', pages: 247 },
    { title: '82년생 김지영', author: '조남주', genre: '소설', pages: 190 },
    { title: '아주 작은 습관의 힘', author: '제임스 클리어', genre: '자기계발', pages: 320 },
  ],
  2: [
    { title: '파친코', author: '이민진', genre: '소설', pages: 490 },
    { title: '나는 나로 살기로 했다', author: '김수현', genre: '에세이', pages: 264 },
  ],
  3: [
    { title: '코스모스', author: '칼 세이건', genre: '과학', pages: 560 },
    { title: '사피엔스', author: '유발 하라리', genre: '인문', pages: 636 },
    { title: '부의 추월차선', author: '엠제이 드마코', genre: '경제', pages: 408 },
    { title: '달러구트 꿈 백화점', author: '이미예', genre: '소설', pages: 280 },
  ],
  4: [],
  5: [],
  6: [],
  7: [],
  8: [],
  9: [],
  10: [],
  11: [],
  12: [],
}

const GENRE_STATS: { genre: Genre; count: number; x: number; y: number; r: number }[] = [
  { genre: '소설', count: 14, x: 50, y: 48, r: 70 },
  { genre: '에세이', count: 8, x: 25, y: 35, r: 50 },
  { genre: '인문', count: 6, x: 72, y: 30, r: 42 },
  { genre: '경제', count: 4, x: 20, y: 65, r: 34 },
  { genre: '과학', count: 3, x: 75, y: 65, r: 30 },
  { genre: '자기계발', count: 2, x: 45, y: 78, r: 24 },
]

const AUTHORS: Author[] = [
  { name: '한강', genre: '소설', count: 7 },
  { name: '유발 하라리', genre: '인문', count: 5 },
  { name: '김수현', genre: '에세이', count: 4 },
  { name: '칼 세이건', genre: '과학', count: 3 },
  { name: '조남주', genre: '소설', count: 3 },
  { name: '엠제이 드마코', genre: '경제', count: 2 },
]

const RECOMMENDED_AUTHORS: { name: string; genre: Genre; reason: string }[] = [
  { name: '천명관', genre: '소설', reason: '한강을 좋아한다면' },
  { name: '정세랑', genre: '소설', reason: '국내 소설 애독자' },
  { name: '리처드 도킨스', genre: '과학', reason: '칼 세이건을 좋아한다면' },
  { name: '김영하', genre: '소설', reason: '소설 다독자' },
]

// ─── 서브 컴포넌트 ──────────────────────────────────────

function MonthChips({
  selected,
  onChange,
}: {
  selected: number
  onChange: (m: number) => void
}) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar px-5">
      {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
        <button
          key={m}
          onClick={() => onChange(m)}
          className={`flex-shrink-0 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
            selected === m
              ? 'bg-[#4A7C5F] text-white'
              : 'bg-white text-[#666666] border border-[#E5E1DC]'
          }`}
        >
          {m}월
        </button>
      ))}
    </div>
  )
}

interface CustomBarLabelProps {
  x?: number
  y?: number
  width?: number
  height?: number
  value?: string
}

function CustomBarLabel({ x = 0, y = 0, width = 0, height = 0, value = '' }: CustomBarLabelProps) {
  const cx = x + width / 2
  const cy = y + height / 2
  return (
    <text
      x={cx}
      y={cy}
      fill="#1A1A1A"
      fontSize={11}
      fontFamily="Pretendard, sans-serif"
      textAnchor="middle"
      dominantBaseline="middle"
      transform={`rotate(-90, ${cx}, ${cy})`}
    >
      {value.length > 8 ? value.slice(0, 7) + '…' : value}
    </text>
  )
}

// ─── 탭1: 완독한 책 ──────────────────────────────────────
function FinishedBooksTab() {
  const [selectedMonth, setSelectedMonth] = useState(3)
  const books = MONTHLY_BOOKS[selectedMonth] ?? []
  const chartData = books.map((b) => ({ title: b.title, pages: b.pages, genre: b.genre }))

  return (
    <div className="flex flex-col gap-5 pb-24">
      <div className="px-5">
        <p className="text-[#666666] text-sm">
          {selectedMonth}월 완독 <span className="text-[#1A1A1A] font-semibold">{books.length}권</span>
        </p>
      </div>

      {books.length > 0 ? (
        <div className="px-5">
          <div className="bg-white rounded-2xl p-4" style={{ height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 16, right: 8, left: -28, bottom: 8 }}>
                <XAxis dataKey="title" hide />
                <YAxis
                  tick={{ fontSize: 10, fill: '#999999', fontFamily: 'Pretendard, sans-serif' }}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  cursor={{ fill: 'rgba(0,0,0,0.04)' }}
                  contentStyle={{
                    borderRadius: 12,
                    border: '1px solid #E5E1DC',
                    fontSize: 12,
                    fontFamily: 'Pretendard, sans-serif',
                  }}
                  formatter={(value, name) => [`${Number(value)}p`, '페이지'] as [string, string]}
                  labelFormatter={(label: string) => label}
                />
                <Bar dataKey="pages" radius={[6, 6, 0, 0]} minPointSize={40} label={<CustomBarLabel />}>
                  {chartData.map((entry, i) => (
                    <Cell key={i} fill={GENRE_COLOR[entry.genre]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      ) : (
        <div className="px-5">
          <div className="bg-white rounded-2xl p-8 flex flex-col items-center gap-2">
            <span className="text-3xl">📚</span>
            <p className="text-[#999999] text-sm">{selectedMonth}월에 완독한 책이 없어요</p>
          </div>
        </div>
      )}

      {/* 장르 범례 */}
      <div className="px-5 flex flex-wrap gap-2">
        {(Object.entries(GENRE_COLOR) as [Genre, string][]).map(([genre, color]) => (
          <div key={genre} className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
            <span className="text-xs text-[#666666]">{genre}</span>
          </div>
        ))}
      </div>

      {/* 월 선택 chips */}
      <MonthChips selected={selectedMonth} onChange={setSelectedMonth} />
    </div>
  )
}

// ─── 탭2: 독서 지도 ──────────────────────────────────────
function ReadingMapTab() {
  const totalBooks = GENRE_STATS.reduce((s, g) => s + g.count, 0)
  const level = totalBooks >= 30 ? 4 : totalBooks >= 20 ? 3 : totalBooks >= 10 ? 2 : 1
  const levelNames = ['새싹 독서가', '성장하는 독서가', '열독가', '책벌레']
  const levelDescs = [
    '독서의 씨앗을 심고 있어요',
    '꾸준히 독서 습관을 쌓고 있어요',
    '다양한 장르를 탐독하고 있어요',
    '독서로 세상을 넓히고 있어요',
  ]
  const nextLevelAt = [10, 20, 30, 50]
  const progress = Math.min((totalBooks / nextLevelAt[level - 1]) * 100, 100)

  return (
    <div className="flex flex-col gap-5 pb-24 px-5">
      {/* 버블 차트 */}
      <div className="bg-white rounded-2xl overflow-hidden" style={{ height: 300 }}>
        <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet">
          {GENRE_STATS.map((g) => (
            <g key={g.genre}>
              <circle
                cx={g.x}
                cy={g.y}
                r={g.r * 0.45}
                fill={GENRE_COLOR[g.genre]}
                fillOpacity={0.85}
              />
              <text
                x={g.x}
                y={g.y - 2}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize={g.r > 50 ? 5 : g.r > 35 ? 4 : 3.5}
                fill={g.genre === '에세이' || g.genre === '인문' ? '#ffffff' : '#1A1A1A'}
                fontFamily="Pretendard, sans-serif"
                fontWeight="600"
              >
                {g.genre}
              </text>
              <text
                x={g.x}
                y={g.y + (g.r > 50 ? 6 : 5)}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize={g.r > 50 ? 4 : 3}
                fill={g.genre === '에세이' || g.genre === '인문' ? '#ffffffcc' : '#1A1A1A99'}
                fontFamily="Pretendard, sans-serif"
              >
                {g.count}권
              </text>
            </g>
          ))}
        </svg>
      </div>

      {/* 레벨 카드 */}
      <div className="rounded-2xl p-5 flex flex-col gap-4" style={{ backgroundColor: '#3D3730' }}>
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-[#C4973A]/20 text-[#C4973A]">
                Lv.{level}
              </span>
            </div>
            <p className="text-white font-bold text-lg">{levelNames[level - 1]}</p>
            <p className="text-white/60 text-sm mt-0.5">{levelDescs[level - 1]}</p>
          </div>
          <div className="text-white/40 text-4xl font-black leading-none">{totalBooks}</div>
        </div>

        <div>
          <div className="flex justify-between text-xs mb-1.5">
            <span className="text-white/50">진행도</span>
            <span className="text-white/70">
              {totalBooks} / {nextLevelAt[level - 1]}권
            </span>
          </div>
          <div className="h-2 rounded-full bg-white/10">
            <div
              className="h-full rounded-full transition-all"
              style={{ width: `${progress}%`, backgroundColor: '#C4973A' }}
            />
          </div>
          {level < 4 && (
            <p className="text-white/40 text-xs mt-2">
              다음 단계까지 {nextLevelAt[level - 1] - totalBooks}권 남았어요
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── 탭3: 선호 작가 ──────────────────────────────────────
function FavoriteAuthorsTab() {
  const rankColor = (i: number) => {
    if (i === 0) return '#C4973A'
    if (i === 1 || i === 2) return '#D4824A'
    return '#999999'
  }

  const initials = (name: string) => name.slice(0, 1)

  return (
    <div className="flex flex-col gap-5 pb-24 px-5">
      {/* 랭킹 리스트 */}
      <div className="bg-white rounded-2xl overflow-hidden">
        {AUTHORS.map((author, i) => (
          <div
            key={author.name}
            className={`flex items-center gap-3 px-4 py-3.5 ${
              i < AUTHORS.length - 1 ? 'border-b border-[#F0EDE8]' : ''
            }`}
          >
            {/* 순위 */}
            <span
              className="w-6 text-center text-sm font-bold flex-shrink-0"
              style={{ color: rankColor(i) }}
            >
              {i + 1}
            </span>

            {/* 아바타 */}
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 text-white font-semibold text-sm"
              style={{ backgroundColor: GENRE_COLOR[author.genre] }}
            >
              {initials(author.name)}
            </div>

            {/* 정보 */}
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-[#1A1A1A] text-sm truncate">{author.name}</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span
                  className="text-[10px] px-1.5 py-0.5 rounded-full"
                  style={{
                    backgroundColor: GENRE_COLOR[author.genre] + '33',
                    color: GENRE_COLOR[author.genre],
                  }}
                >
                  {author.genre}
                </span>
              </div>
            </div>

            {/* 권수 */}
            <div className="text-right flex-shrink-0">
              <span className="text-sm font-bold" style={{ color: rankColor(i) }}>
                {author.count}
              </span>
              <span className="text-xs text-[#999999]">권</span>
            </div>
          </div>
        ))}
      </div>

      {/* 추천 작가 */}
      <div>
        <p className="text-[#1A1A1A] font-semibold text-sm mb-3">이 작가도 좋아할 것 같아요</p>
        <div className="grid grid-cols-2 gap-3">
          {RECOMMENDED_AUTHORS.map((a) => (
            <div key={a.name} className="bg-white rounded-2xl p-4 flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center text-white font-semibold text-sm flex-shrink-0"
                  style={{ backgroundColor: GENRE_COLOR[a.genre] }}
                >
                  {a.name.slice(0, 1)}
                </div>
                <div className="min-w-0">
                  <p className="text-[#1A1A1A] font-semibold text-sm truncate">{a.name}</p>
                  <span
                    className="text-[10px] px-1.5 py-0.5 rounded-full"
                    style={{
                      backgroundColor: GENRE_COLOR[a.genre] + '33',
                      color: GENRE_COLOR[a.genre],
                    }}
                  >
                    {a.genre}
                  </span>
                </div>
              </div>
              <p className="text-[#999999] text-xs">{a.reason}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── 메인 페이지 ──────────────────────────────────────────
const TABS = ['완독한 책', '독서지도', '선호작가'] as const
type TabKey = (typeof TABS)[number]

export default function RecordPage() {
  const [activeTab, setActiveTab] = useState<TabKey>('완독한 책')

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F0EDE8' }}>
      {/* 헤더 */}
      <div className="pt-14 pb-4 px-5">
        <h1 className="text-xl font-bold text-[#1A1A1A]">기록</h1>
      </div>

      {/* 탭 바 */}
      <div className="flex px-5 gap-1 mb-5">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2 rounded-xl text-sm font-medium transition-colors ${
              activeTab === tab
                ? 'bg-[#4A7C5F] text-white'
                : 'bg-white text-[#666666]'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* 탭 콘텐츠 */}
      {activeTab === '완독한 책' && <FinishedBooksTab />}
      {activeTab === '독서지도' && <ReadingMapTab />}
      {activeTab === '선호작가' && <FavoriteAuthorsTab />}
    </div>
  )
}
