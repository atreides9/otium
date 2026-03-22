import Link from 'next/link'

const POLICIES = [
  {
    type: 'terms',
    title: '서비스 이용약관',
    updatedAt: '2025.01.15',
  },
  {
    type: 'privacy',
    title: '개인정보처리방침',
    updatedAt: '2025.01.15',
  },
  {
    type: 'location',
    title: '위치기반서비스 이용약관',
    updatedAt: '2025.01.15',
  },
  {
    type: 'youth',
    title: '청소년 보호정책',
    updatedAt: '2025.01.15',
  },
]

function DocumentIcon() {
  return (
    <div
      className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 bg-primary-tint"
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <path
          d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z"
          stroke="var(--color-primary)"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path d="M14 2V8H20" stroke="var(--color-primary)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M16 13H8" stroke="var(--color-primary)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M16 17H8" stroke="var(--color-primary)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M10 9H9H8" stroke="var(--color-primary)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  )
}

export default function PolicyPage() {
  return (
    <div className="min-h-screen bg-canvas">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 pt-14 pb-4">
        <Link href="/mypage">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path
              d="M15 18L9 12L15 6"
              stroke="var(--color-text-1)"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </Link>
        <h1 className="text-xl font-bold text-text-1">
          약관 및 정책
        </h1>
      </div>

      <div className="px-5 flex flex-col gap-3 pb-10">
        {/* Policy Cards */}
        {POLICIES.map((policy) => (
          <Link
            key={policy.type}
            href={`/mypage/policy/${policy.type}`}
            className="rounded-2xl p-4 flex items-center gap-3"
            style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
          >
            <DocumentIcon />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-text-1">
                {policy.title}
              </p>
              <p className="text-xs mt-0.5 text-text-3">
                최종 업데이트: {policy.updatedAt}
              </p>
            </div>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="flex-shrink-0">
              <path
                d="M9 18L15 12L9 6"
                stroke="var(--color-text-3)"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </Link>
        ))}

        {/* Contact Card */}
        <div className="rounded-2xl p-5 mt-1 bg-primary-tint">
          <p className="text-base font-bold mb-3 text-amber">
            문의하기
          </p>
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="flex-shrink-0">
                <path
                  d="M4 4H20C21.1 4 22 4.9 22 6V18C22 19.1 21.1 20 20 20H4C2.9 20 2 19.1 2 18V6C2 4.9 2.9 4 4 4Z"
                  stroke="var(--color-primary)"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M22 6L12 13L2 6"
                  stroke="var(--color-primary)"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <p className="text-sm text-text-1">
                support@otiumcs.com
              </p>
            </div>
            <div className="flex items-center gap-2">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="flex-shrink-0">
                <path
                  d="M22 16.92V19.92C22.0011 20.4813 21.7677 21.0175 21.3552 21.4044C20.9428 21.7912 20.3891 21.9971 19.82 21.97C16.7428 21.6286 13.787 20.5742 11.19 18.9C8.77383 17.3644 6.72534 15.3159 5.19 12.9C3.49998 10.2911 2.44536 7.32097 2.11 4.23C2.08379 3.66245 2.28849 3.10989 2.67351 2.69839C3.05854 2.28689 3.59213 2.08064 4.15 2.08H7.15C8.14145 2.07002 8.97978 2.77049 9.12 3.75C9.25082 4.72022 9.49178 5.67293 9.84 6.59C10.0944 7.23584 9.93314 7.96654 9.43 8.45L8.09 9.79C9.51356 12.2763 11.5237 14.2864 14.01 15.71L15.35 14.37C15.8394 13.8669 16.5702 13.7057 17.216 13.96C18.1323 14.3062 19.0838 14.5457 20.05 14.675C21.0391 14.8158 21.7464 15.6671 21.73 16.67L22 16.92Z"
                  stroke="var(--color-primary)"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <div>
                <p className="text-sm text-text-1">
                  02-0000-0000
                </p>
                <p className="text-xs text-text-2">
                  평일 09:00 - 18:00
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
