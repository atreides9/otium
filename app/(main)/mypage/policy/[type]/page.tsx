import Link from 'next/link'
import { notFound } from 'next/navigation'

const POLICY_META: Record<string, { title: string; updatedAt: string }> = {
  terms: { title: '서비스 이용약관', updatedAt: '2025.01.15' },
  privacy: { title: '개인정보처리방침', updatedAt: '2025.01.15' },
  location: { title: '위치기반서비스 이용약관', updatedAt: '2025.01.15' },
  youth: { title: '청소년 보호정책', updatedAt: '2025.01.15' },
}

const POLICY_CONTENT: Record<string, string> = {
  terms: `제1조 (목적)
이 약관은 Otium(이하 "서비스")의 이용 조건 및 절차, 회사와 이용자의 권리·의무 및 책임사항을 규정함을 목적으로 합니다.

제2조 (정의)
① "서비스"란 회사가 제공하는 독서 기록 및 소셜 플랫폼 서비스를 의미합니다.
② "이용자"란 이 약관에 따라 회사가 제공하는 서비스를 받는 회원 및 비회원을 말합니다.

제3조 (약관의 게시와 개정)
① 회사는 이 약관의 내용을 이용자가 쉽게 알 수 있도록 서비스 초기 화면에 게시합니다.
② 회사는 필요한 경우 관련 법령을 위배하지 않는 범위에서 이 약관을 개정할 수 있습니다.

제4조 (서비스의 제공)
① 회사는 다음과 같은 서비스를 제공합니다.
  - 독서 기록 및 통계 서비스
  - 독서 소셜 네트워크 서비스
  - 책 검색 및 추천 서비스
② 서비스는 연중무휴, 1일 24시간 제공함을 원칙으로 합니다.`,

  privacy: `제1조 (개인정보 수집 항목)
회사는 서비스 제공을 위해 다음과 같은 개인정보를 수집합니다.

필수 항목: 이메일 주소, 닉네임, 프로필 사진(소셜 로그인 시)
선택 항목: 자기소개, 관심 장르

제2조 (개인정보 수집 및 이용 목적)
① 회원 가입 및 관리
② 서비스 제공 및 개선
③ 통계 분석 및 맞춤형 서비스 제공

제3조 (개인정보 보유 및 이용 기간)
회원 탈퇴 시 즉시 파기하며, 관련 법령에 따라 보존이 필요한 경우 해당 기간 동안 보관합니다.

제4조 (개인정보의 제3자 제공)
회사는 이용자의 동의 없이 개인정보를 제3자에게 제공하지 않습니다. 단, 법령에 의거하거나 수사 목적으로 법령에 정해진 절차와 방법에 따라 수사기관의 요구가 있는 경우는 예외로 합니다.`,

  location: `제1조 (목적)
이 약관은 Otium이 제공하는 위치기반서비스의 이용과 관련하여 회사와 이용자 간의 권리·의무 및 책임사항을 규정함을 목적으로 합니다.

제2조 (위치기반서비스 제공)
① 회사는 이용자의 위치정보를 활용하여 다음 서비스를 제공합니다.
  - 주변 독서 모임 안내
  - 근처 도서관 및 서점 정보 제공

제3조 (위치정보 보호)
① 회사는 위치정보를 다음의 목적 외에 사용하지 않습니다.
② 이용자는 언제든지 위치정보 이용에 대한 동의를 철회할 수 있습니다.

제4조 (손해배상)
회사가 위치정보의 보호 의무를 위반하여 이용자에게 손해가 발생한 경우, 회사는 그 손해를 배상하여야 합니다.`,

  youth: `제1조 (목적)
Otium은 청소년이 안전하게 서비스를 이용할 수 있도록 청소년 보호에 관한 정책을 수립하고 시행합니다.

제2조 (청소년 보호 책임자)
회사는 청소년 보호를 위해 청소년 보호 책임자를 지정하여 운영합니다.

제3조 (청소년 유해 정보 차단)
① 회사는 청소년에게 유해한 정보가 서비스에 게시되지 않도록 관리합니다.
② 청소년 유해 정보 발견 시 즉시 신고할 수 있는 시스템을 운영합니다.

제4조 (보호자 가이드)
① 보호자는 청소년의 서비스 이용 내역을 모니터링할 수 있습니다.
② 문제가 발생한 경우 고객센터(support@otiumcs.com)로 문의하시기 바랍니다.

제5조 (신고 및 처리)
유해 정보 신고는 앱 내 신고 기능 또는 고객센터를 통해 접수할 수 있으며, 확인 즉시 조치합니다.`,
}

interface Props {
  params: Promise<{ type: string }>
}

export default async function PolicyDetailPage({ params }: Props) {
  const { type } = await params
  const meta = POLICY_META[type]

  if (!meta) notFound()

  const content = POLICY_CONTENT[type] ?? ''

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F0EDE8' }}>
      {/* Header */}
      <div className="flex items-center gap-3 px-5 pt-14 pb-4">
        <Link href="/mypage/policy">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path
              d="M15 18L9 12L15 6"
              stroke="#1A1A1A"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </Link>
        <h1 className="text-xl font-bold" style={{ color: '#1A1A1A' }}>
          {meta.title}
        </h1>
      </div>

      {/* Content */}
      <div className="px-5 pb-10">
        <p className="text-xs mb-4" style={{ color: '#999999' }}>
          최종 업데이트: {meta.updatedAt}
        </p>
        <div
          className="rounded-2xl p-5"
          style={{ backgroundColor: '#FFFFFF', border: '1px solid #E5E1DC' }}
        >
          <pre
            className="text-sm whitespace-pre-wrap leading-relaxed font-sans"
            style={{ color: '#1A1A1A' }}
          >
            {content}
          </pre>
        </div>
      </div>
    </div>
  )
}
