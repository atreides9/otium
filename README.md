# Otium

> 독서를 기록하고, 취향이 맞는 사람과 조용히 연결되는 소셜 앱

## Tech Stack

| 영역 | 기술 |
|------|------|
| Frontend | Next.js 14 (App Router), TypeScript, Tailwind CSS |
| Backend | Supabase (Auth, PostgreSQL, Realtime) |
| 책 검색 | 카카오 책 검색 API |
| 차트 | Recharts |
| 배포 | Vercel |

## 화면 구조

```
├── 인증        로그인(소셜) → 닉네임 설정
├── 홈          스트릭 · 취향바 · 읽는중/완독 카드 · 최근기록
├── 탐색        취향 일치율 기반 친구 추천 (주간 갱신)
├── 기록        완독한책(월별 차트) · 독서지도(버블) · 선호작가
├── 친구        독서DNA · 친구목록(단계별) · 채팅
└── 내서재      프로필 · XP · 배지 · 설정
```

## 채팅 단계 시스템

| 단계 | 기간 | 제한 | 말풍선 색 |
|------|------|------|-----------|
| 새싹 | D+1~7 | 구절 공유만, 하루 3개 | 오렌지 |
| 나무 | D+8~30 | 텍스트 30자/30개/2시간 | 블루 |
| 숲 | D+31~ | 무제한 | 그린 |

## DB 스키마

```sql
users           (id, nickname, avatar_url, level, xp, streak)
books           (id, isbn, title, author, cover_url, genre)
reading_records (id, user_id, book_id, status, started_at, finished_at, memo, highlight)
friendships     (id, user_a, user_b, stage, created_at)
messages        (id, sender_id, receiver_id, type, content, created_at)
badges          (id, user_id, badge_type, earned_at)
```

## 게이미피케이션

- **레벨**: 책린이 → 책소년 → 책청년 → ...
- **XP 획득**: 독서 기록 추가, 연속 스트릭, 친구 활동
- **배지**: 첫완독, 7일연속, 장르탐험가 등

## 환경변수

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
KAKAO_API_KEY=
```

## 카카오 책 API

```
GET https://dapi.kakao.com/v3/search/book
Headers: Authorization: KakaoAK {KAKAO_API_KEY}
Params: query, target(isbn|title|author), size, page
```

## 로컬 실행

```bash
npm install
cp .env.example .env.local  # 환경변수 입력
npm run dev
```

## 디렉토리 구조

```
/app              페이지 (App Router)
/components       재사용 컴포넌트
/lib
  supabase.ts     Supabase 클라이언트
  kakao.ts        카카오 API 유틸
/types            TypeScript 타입 정의
/hooks            커스텀 훅
```