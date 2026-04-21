# 블로그 원고 생성기

키워드 입력 → 네이버 상위노출 분석 → 소정님 문체로 블로그 원고 자동 생성

**배포 URL:** https://blog-writer-yibm.vercel.app/

---

## 개발 환경

| 항목 | 기술 |
|------|------|
| 프레임워크 | Next.js 16.2.4 (App Router) |
| 언어 | TypeScript 5.x |
| 스타일링 | Tailwind CSS 4.x |
| AI | Anthropic Claude API (claude-sonnet-4-20250514) |
| 크롤링 | Cheerio 1.2.x |
| 런타임 | Node.js |
| 패키지 매니저 | npm |

### 로컬 실행 방법

```bash
# 1. 의존성 설치
npm install

# 2. 환경변수 설정 (.env.local 파일 생성)
ANTHROPIC_API_KEY=your-api-key-here

# 3. 개발 서버 실행
npm run dev
```

http://localhost:3000 에서 확인

---

## 아키텍처

```
blog-writer/
├── src/
│   └── app/
│       ├── layout.tsx          # 루트 레이아웃 (한국어, 메타데이터)
│       ├── page.tsx            # 메인 페이지 (입력 폼 + 결과 화면)
│       ├── globals.css         # 전역 스타일 (Tailwind + 원고 결과 스타일)
│       └── api/
│           ├── crawl/
│           │   └── route.ts    # 네이버 상위노출 블로그 크롤링 API
│           └── generate/
│               └── route.ts    # Claude API 원고 생성 API (문체 가이드 내장)
├── .env.local                  # 환경변수 (API 키, git 미포함)
├── package.json
└── README.md
```

### 데이터 흐름

```
사용자 입력 (키워드, 조건)
    ↓
[상위노출 분석 버튼] → /api/crawl → 네이버 블로그 검색 → 상위 5개 글 크롤링
    ↓
[원고 생성 버튼] → /api/generate → Claude API 호출 (크롤링 결과 + 문체 가이드 + 조건)
    ↓
원고 출력 → [복사 버튼] → 클립보드 복사 → 네이버 블로그에 붙여넣기
```

### API 엔드포인트

| 엔드포인트 | 메서드 | 설명 |
|------------|--------|------|
| `/api/crawl` | POST | 메인키워드로 네이버 상위 블로그 5개 크롤링 |
| `/api/generate` | POST | 크롤링 결과 + 조건으로 블로그 원고 생성 |

---

## 배포 환경

| 항목 | 설정 |
|------|------|
| 호스팅 | Vercel (무료 플랜) |
| 저장소 | GitHub (sojeong646/blog-writer) |
| 배포 방식 | GitHub 연동 자동 배포 (main 브랜치 push 시) |
| 환경변수 | Vercel Dashboard > Settings > Environment Variables |
| 도메인 | blog-writer-yibm.vercel.app |

### 환경변수

| 변수명 | 설명 | 필수 |
|--------|------|------|
| `ANTHROPIC_API_KEY` | Claude API 키 | O |

---

## 디자인 가이드

### 컬러

| 용도 | 색상 | 코드 |
|------|------|------|
| 배경 | 연한 회색 | `#f9fafb` (gray-50) |
| 카드 배경 | 흰색 | `#ffffff` |
| 텍스트 | 진한 회색 | `#111827` (gray-900) |
| 보조 텍스트 | 중간 회색 | `#6b7280` (gray-500) |
| 상위노출 분석 버튼 | 초록 | `bg-green-600` |
| 원고 생성 버튼 | 파랑 | `bg-blue-600` |
| 복사 버튼 | 검정 | `bg-gray-900` |
| 카드 테두리 | 연한 회색 | `border-gray-200` |

### 레이아웃

- 최대 너비: `max-w-5xl` (1024px)
- 카드 스타일: `rounded-2xl`, `shadow-sm`, `border`
- 입력 폼: 2컬럼 그리드 (모바일에서 1컬럼)
- 원고 결과: 회색 배경 박스 (`bg-gray-50`, `rounded-xl`)

### 타이포그래피

- 폰트: Pretendard (시스템 폰트 fallback)
- 제목: `text-3xl font-bold`
- 섹션 제목: `text-lg font-semibold`
- 본문: `text-sm leading-relaxed`

### 컴포넌트

- **입력 필드**: `rounded-lg`, `border-gray-300`, 포커스 시 `ring-blue-500`
- **버튼**: `rounded-lg`, `font-medium`, 로딩 시 스피너 애니메이션
- **크롤링 결과**: `<details>` 아코디언 (접고 펼치기)
- **원고 결과**: `whitespace-pre-wrap`으로 줄바꿈 보존

---

## 문체 가이드 (원고 생성 프롬프트에 내장)

소정님 블로그 16개 포스팅 분석 기반:
- 한 문장 = 한 줄 (모바일 최적화)
- 종결어미: ~요, ~해요, ~답니당, ~가넝!
- 괄호 혼잣말: (내가 만들었지만 진짜 잘 만들었따...)
- 효과음: (두둥), (따란~)
- SEO: 메인키워드 7회 반복, 평균 2,132자

---

## TODO 리스트

### 완료
- [x] Next.js 프로젝트 초기 세팅
- [x] 입력 폼 UI (메인키워드, 필수키워드, 형태소, 글자수, 반복횟수, 기타)
- [x] 네이버 상위노출 블로그 크롤링 API (`/api/crawl`)
- [x] Claude API 연동 원고 생성 API (`/api/generate`)
- [x] 원고 결과 화면 + 복사 버튼
- [x] Vercel 배포 완료
- [x] 프로젝트 문서화 (README)

### 수정 필요
- [ ] 네이버 크롤링 안정성 개선 (iframe 구조 변경 대응)
- [ ] 원고 생성 로딩 시간 UX 개선 (스트리밍 응답)
- [ ] 에러 메시지 사용자 친화적으로 개선

### 추가 예정
- [ ] 원고 히스토리 저장 (이전에 생성한 원고 다시 보기)
- [ ] 원고 재생성 기능 ("다시 써줘" 버튼)
- [ ] 강의 정보 프리셋 (스레드 VOD 소구점 자동 입력)
- [ ] 모바일 반응형 최적화
- [ ] 다크 모드 지원
- [ ] 원고 글자수 실시간 카운트
- [ ] 네이버 블로그 에디터에 맞는 HTML 형태로 복사 기능
