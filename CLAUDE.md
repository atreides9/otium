# Otium
독서 기반 소셜 앱.

## Stack
Next.js 14 (App Router) · TypeScript · Tailwind CSS · Supabase · Vercel
카카오 책검색 API · Recharts

## Design Tokens (B 프로토타입 기준)
Surface-BG  #F5F0E8 | Surface-Card #FFFFFF | Surface-Ink #3D2C24
Primary-500 #4A7C59 | Primary-300 #8CB89A  | Primary-100 #EBF3ED
Secondary-500 #C47D2E | Secondary-100 #FDF0E2
Gray-900 #1C1410 | Gray-700 #3D3530 | Gray-500 #6B5E57
Gray-400 #8C7B6E | Gray-200 #D4CAC2 | Gray-100 #EDE8E1
Error #B94040

Grid: 8px base · H-padding: 20px · Section gap: 32px
Card radius: rounded-2xl · Touch target: 44px min · WCAG AA 4.5:1 필수
Typography (Pretendard): title 22px Bold / section 17px SemiBold / card 15px SemiBold / body 14px / meta 13px / tag 12px

## IA (탭 순서)
홈(/home) → 탐색(/explore) → 기록(/records) → 친구(/friend) → 내서재(/mypage)

## Architecture
/app/(main)/          탭 라우트
/components/layout/   GNB
/components/shared/   Avatar, GenreTag, MatchBadge, SectionHeader, SettingRow, FAB
/components/home/     NotificationPanel
/components/friend/   ReadingDNACard, FriendListSection
/lib/supabase/        DB 클라이언트

## Rules
- 한국어 답변 · 핵심만 · 설명 생략
- 확인 질문 금지 → 바로 구현
- 지정 파일만 읽기, 전체 탐색 금지
- any 타입 금지 · Supabase 쿼리 항상 에러 핸들링
- Tailwind 우선, 커스텀 CSS 최소화
- 8px grid 준수: spacing은 2/4/6/8/10/12/16/20/24/32px만 사용

## MVP 순서
1. Supabase 셋업 + 소셜 로그인
2. 홈 + 책 추가 (카카오 API)
3. 기록 탭
4. 친구 탭 + 채팅 (Realtime)
5. 탐색 (취향 매칭)
6. 내서재 + 게이미피케이션
