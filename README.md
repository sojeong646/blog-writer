# 블로그 원고 생성기

조건 입력 → 상위 포스팅 참고 → 소정님 문체로 블로그 원고 자동 생성

**배포 URL:** https://blog-writer-yibm.vercel.app/

---

## 개발 환경

| 항목 | 기술 |
|------|------|
| 프레임워크 | Next.js 16.2.4 (App Router) |
| 언어 | TypeScript 5.x |
| 스타일링 | Tailwind CSS 4.x |
| AI | Google Gemini API (gemini-2.5-flash) |
| 크롤링 | Cheerio 1.2.x (네이버 모바일 블로그) |
| 런타임 | Node.js |
| 패키지 매니저 | npm |
| 폰트 | Pretendard (CDN) |

### 로컬 실행 방법

```bash
# 1. 의존성 설치
npm install

# 2. 환경변수 설정 (.env.local 파일 생성)
GEMINI_API_KEY=your-gemini-api-key-here

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
│       ├── layout.tsx          # 루트 레이아웃 (한국어, Pretendard 폰트 CDN)
│       ├── page.tsx            # 메인 대시보드 (2컬럼: 입력 + 결과)
│       ├── globals.css         # 전역 스타일 (커스텀 테마, 글래스모피즘)
│       └── api/
│           ├── crawl/
│           │   └── route.ts    # URL 기반 블로그 크롤링 API (모바일 버전)
│           └── generate/
│               └── route.ts    # Gemini API 원고 생성 API (문체 가이드 내장)
├── .env.local                  # 환경변수 (API 키, git 미포함)
├── package.json
└── README.md
```

### 데이터 흐름

```
사용자 입력 (메인키워드, URL, 형태소, 글자수 등)
    ↓
[포스팅 크롤링] → /api/crawl → 입력된 URL의 블로그 본문 크롤링 (모바일 버전)
    ↓
[원고 생성] → /api/generate → Gemini API 호출 (크롤링 결과 + 문체 가이드 + 조건)
    ↓
원고 출력 (공백제외 글자수 표시) → [복사] → 네이버 블로그에 붙여넣기
```

### API 엔드포인트

| 엔드포인트 | 메서드 | 설명 |
|------------|--------|------|
| `/api/crawl` | POST | 입력된 URL 1~3개의 블로그 본문 크롤링 |
| `/api/generate` | POST | 크롤링 결과 + 조건으로 블로그 원고 생성 |

### 입력 항목

| 항목 | 구분자 | 필수 | 설명 |
|------|--------|------|------|
| 메인키워드 | - | O | 원고의 핵심 키워드 |
| 상위 1~3위 URL | 각각 입력 | - | 네이버 상위노출 블로그 URL |
| 필수키워드 (서브) | 띄어쓰기 | - | 본문에 반드시 포함할 서브 키워드 |
| 필수 형태소 | 띄어쓰기 | - | 본문에 반드시 포함할 형태소 |
| 평균 글자수 | - | - | 목표 글자수 (공백 제외, 기본 2000) |
| 키워드 반복 | - | - | 메인키워드 반복 횟수 (기본 7) |
| 기타 참고사항 | - | - | 추가 요청사항 |

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
| `GEMINI_API_KEY` | Google Gemini API 키 | O |

---

## 디자인 가이드

### 레이아웃

- **대시보드 형태**: 풀스크린, 스크롤 없는 2컬럼 구조
- 왼쪽 사이드바 (400px): 입력 폼
- 오른쪽 메인: 원고 결과 (빈 상태 안내 포함)
- 상단 헤더: 로고 + 타이틀

### 컬러 시스템

| 용도 | 색상 | 코드 |
|------|------|------|
| 배경 | 그라디언트 | `#f8f9fc → #eef1f8 → #f0faf6` |
| 카드/패널 | 반투명 흰색 | `bg-white/40`, `backdrop-blur-sm` |
| Primary (보라) | 버튼/강조 | `primary-500` (#5c7cfa) ~ `primary-600` (#4c6ef5) |
| Mint (민트) | 크롤링/성공 | `mint-500` (#20c997) ~ `mint-600` (#12b886) |
| 텍스트 | 진한 회색 | `#1a1a2e` |
| 보조 텍스트 | 중간 회색 | `gray-400`, `gray-500` |

### 타이포그래피

- 폰트: Pretendard Variable (CDN)
- 헤더 타이틀: `text-base font-bold`, 그라디언트 텍스트
- 라벨: `text-[11px] font-semibold uppercase tracking-wider`
- 입력: `text-sm` ~ `text-base`
- 원고 본문: `text-[14px] leading-[2.2]`

### 컴포넌트 스타일

- **입력 필드**: `rounded-xl`, 커스텀 포커스 (`input-pretty`)
- **버튼**: `rounded-xl`, 그라디언트 배경, 글로우 이펙트 (`btn-glow-blue`, `btn-glow-mint`)
- **카드**: `rounded-3xl`, 글래스모피즘, 호버 애니메이션 (`card-hover`)
- **크롤링 완료**: 체크 아이콘 + 민트색 텍스트
- **복사 버튼**: 클릭 시 민트색으로 전환 ("복사 완료!")

---

## 문체 가이드 (원고 생성 프롬프트에 내장)

소정님 블로그 16개 포스팅 분석 기반:
- 한 문장 = 한 줄 (모바일 최적화)
- 종결어미: ~요, ~해요, ~답니당, ~가넝!
- 괄호 혼잣말: (내가 만들었지만 진짜 잘 만들었따...)
- 효과음: (두둥), (따란~)
- 글 구조: 도입(공감) → 문제제기 → 전환 → 솔루션 → 사회적증거 → CTA
- 피해야 할 것: 격식체, 긴 문단, AI 느낌, 과도한 이모지

---

## TODO 리스트

### 완료
- [x] Next.js 프로젝트 초기 세팅
- [x] 입력 폼 UI (메인키워드, 필수키워드, 글자수, 반복횟수, 기타)
- [x] 네이버 블로그 크롤링 API (`/api/crawl`) - URL 직접 입력 방식
- [x] Claude API 연동 원고 생성 API (`/api/generate`)
- [x] 원고 결과 화면 + 복사 버튼 (공백제외 글자수 표시)
- [x] Vercel 배포 완료 (blog-writer-yibm.vercel.app)
- [x] 프로젝트 문서화 (README)
- [x] UI 리디자인 (그라디언트, 글래스모피즘, Pretendard 폰트)
- [x] 대시보드 레이아웃 (2컬럼: 왼쪽 입력 / 오른쪽 결과)
- [x] GitHub 저장소 연동 + Vercel 자동 배포 설정

### 수정 완료
- [x] 크롤링 방식 변경: 자동 검색 → URL 직접 입력 (안정성 확보)
- [x] 크롤링 엔진: PC 버전 → 모바일 버전 (iframe 문제 해결)
- [x] 헤더 문구: "소정님의 블로그 원고를 자동으로 써드려요"
- [x] 필수키워드/형태소를 '필수키워드' 하나로 통합 (띄어쓰기 구분)
- [x] 글자수: 입력값보다 10~20% 더 많이 작성하도록 변경
- [x] 키워드 반복: 제목+본문 합산 기준으로 변경
- [x] 제목도 함께 생성하도록 프롬프트 수정
- [x] AI 엔진 변경: Anthropic Claude → Google Gemini (gemini-2.5-flash)
- [x] Vercel 환경변수 설정 완료 (GEMINI_API_KEY)

### 추가 예정
- [ ] 실제 원고 생성 테스트 및 품질 검증
- [ ] 원고 생성 스트리밍 응답 (실시간으로 글이 써지는 효과)
- [ ] 원고 히스토리 저장 (이전에 생성한 원고 다시 보기)
- [ ] 원고 재생성 기능 ("다시 써줘" 버튼)
- [ ] 강의 정보 프리셋 (스레드 VOD 소구점 자동 입력)
- [ ] 모바일 반응형 최적화
- [ ] 네이버 블로그 에디터에 맞는 HTML 형태로 복사 기능
- [ ] 에러 메시지 사용자 친화적으로 개선
