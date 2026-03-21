# Otium

독서 기반 소셜 앱. 상세 스펙은 README.md 참고.

## Stack
Next.js 14 (App Router) · TypeScript · Tailwind CSS · Supabase · Vercel
책 검색: 카카오 API · 차트: Recharts

## Design Tokens
```
bg: #F0EDE8 | card: #FFFFFF | dark-card: #3D3730
primary: #4A7C5F | gold: #C4973A | orange: #D4824A | blue: #6B8FB5
text: #1A1A1A | sub: #666666 | muted: #999999 | border: #E5E1DC
```
폰트: Pretendard · 화면패딩: 20px · 카드radius: 16px

## Architecture
- `/app` App Router 페이지
- `/components` 재사용 컴포넌트
- `/lib/supabase.ts` DB 클라이언트
- `/lib/kakao.ts` 책 검색 API

## Rules
- 한국어 답변, 핵심만, 설명 생략
- 확인 질문 금지 → 바로 구현
- 지정 파일만 읽기, 전체 탐색 금지
- `any` 타입 금지
- Supabase 쿼리 항상 에러 핸들링
- Tailwind 우선, 커스텀 CSS 최소화

## MVP 순서
1. Supabase 셋업 + 소셜 로그인
2. 홈 + 책 추가 (카카오 API)
3. 기록 탭 차트
4. 친구 + 채팅 (Realtime)
5. 탐색 (취향 매칭)
6. 내서재 + 게이미피케이션