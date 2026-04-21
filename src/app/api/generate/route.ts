import Anthropic from "@anthropic-ai/sdk";

const STYLE_GUIDE = `
## 소정님 문체 가이드 (네이버 블로그용)

### 호흡과 줄바꿈
- 한 문장 = 한 줄 (모바일 최적화)
- 문장 사이 빈 줄 넣어 시각적 여백 확보
- 한 단락이 3~5줄을 넘기지 않음

### 말투/종결어미
- 기본: "~요", "~해요", "~거든요", "~더라구요"
- 귀여운 변형: "~답니당", "~입니당", "~가넝!", "~이에요!"
- 감탄: "~잖아요?", "~아닐까요...?", "~같아요!"
- 강조 늘이기: "정~말", "너~무", "정!!!!!말"
- 줄임말/구어: "아싸리", "암튼", "큼큼...", "구럼 안녕~~"

### 효과음/전환 장치
- (두둥), (따란~), (두구두구...), (먼 산...), (불끈)
- "그.런.데", "확!실!하!게!"
- "★", "♡", "♬♪♩"
- 구분선 "---" 으로 섹션 분리

### 괄호 혼잣말 (핵심 특징)
- 본문 사이에 괄호로 속마음/부연 삽입
- 예: (내가 만들었지만 진짜 잘 만들었따...), (사람좋아 인간..ㅠㅠ), (완전 효자...)
- 자기 비하 유머 + 애정 섞인 자랑이 공존

### 감정 표현
- 이모티콘: ㅎ, 헤헤, ㅠㅠ, ^_ㅠ, >.<, *.*
- 카오모지: ( ͜♡･ω･) ͜♡, ღ'ᴗ'ღ
- 이모지: 적절히 섞되 과하지 않게 (😂🤯💦✨🫶🏻 정도)

### 강조 방식
- **볼드**: 핵심 키워드, 서비스명, 숫자
- *이탤릭*: 고객 후기, 내면의 생각/독백, 인용

### 글 구조 패턴
1. 도입: "혹시 ~하고 계신가요?" / 공감 질문
2. 문제 제기: 본인도 같은 고민 있었음 (경험담)
3. 전환: "그래서 만들었어요!" / "그래서!"
4. 솔루션 소개: 상품/서비스 장점 나열
5. 사회적 증거: 고객 반응, 후기, 숫자
6. CTA: 링크 + 가벼운 마무리 ("그럼 안녕~~", "제가 ~해드릴게요>.<")

### 설득 스타일
- 직접적 "사세요!" X → 자연스러운 경험 공유로 유도
- 본인 이야기 = 신뢰 구축
- 고객 후기를 이탤릭으로 자연스럽게 삽입
- 한정/긴급성 암시 ("조만간 종료될 수 있어요", "지금이 기회!")
- 가격 정당화: 비교 프레이밍 ("커피값으로 공유오피스가!")

### 피해야 할 것
- 딱딱한 존댓말/공식적 어투
- 긴 문단 (3줄 넘는 문단)
- 과도한 이모지 남발
- "~입니다", "~하겠습니다" 같은 격식체
- AI 느낌나는 정제된 문장
`;

interface CrawlResult {
  title: string;
  content: string;
  url: string;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      mainKeyword,
      subKeywords,
      morphemes,
      targetLength,
      keywordRepeat,
      extra,
      crawlResults,
    } = body as {
      mainKeyword: string;
      subKeywords: string;
      morphemes: string;
      targetLength: number;
      keywordRepeat: number;
      extra: string;
      crawlResults: CrawlResult[];
    };

    if (!mainKeyword) {
      return Response.json(
        { error: "메인키워드를 입력해주세요." },
        { status: 400 }
      );
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return Response.json(
        { error: "API 키가 설정되지 않았어요. 환경변수를 확인해주세요." },
        { status: 500 }
      );
    }

    const client = new Anthropic({ apiKey });

    // 크롤링 결과 정리
    let crawlContext = "";
    if (crawlResults && crawlResults.length > 0) {
      crawlContext = "\n\n## 네이버 상위노출 블로그 참고 자료\n";
      crawlResults.forEach((r, i) => {
        crawlContext += `\n### ${i + 1}위: ${r.title}\n${r.content.slice(0, 2000)}\n`;
      });
    }

    const userPrompt = `
다음 조건에 맞춰 네이버 블로그 원고를 작성해주세요.

## 조건
- **메인키워드**: ${mainKeyword}
- **메인키워드 반복 횟수**: 본문에 "${mainKeyword}"를 정확히 ${keywordRepeat}회 이상 자연스럽게 포함
- **목표 글자 수**: ${targetLength}자 내외
${subKeywords ? `- **필수키워드(서브)**: ${subKeywords} (모두 본문에 자연스럽게 포함)` : ""}
${morphemes ? `- **필수 형태소**: ${morphemes} (모두 본문에 포함)` : ""}
${extra ? `- **기타 요청사항**: ${extra}` : ""}
${crawlContext}

## 중요 규칙
1. 위의 문체 가이드를 철저히 따라주세요. 특히 괄호 혼잣말, 귀여운 종결어미, 효과음을 적절히 사용하세요.
2. 네이버 블로그용이므로 한 문장 = 한 줄, 문장 사이 빈 줄로 가독성을 확보하세요.
3. AI가 쓴 느낌이 나면 안 됩니다. 진짜 사람이 수다 떨듯이 써주세요.
4. 마크다운 문법(##, **, * 등)은 사용하지 마세요. 순수 텍스트로만 작성하세요.
5. 볼드 처리하고 싶은 부분은 그냥 텍스트로 쓰되, 네이버 블로그에 복붙할 수 있게 깔끔하게 작성하세요.
6. 상위노출 블로그 참고 자료가 있다면, 그 글들의 구조와 키워드 사용 패턴을 참고하되 절대 베끼지 마세요.

원고만 작성해주세요. 설명이나 부연은 필요 없습니다.
`;

    const message = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 4096,
      system: `당신은 네이버 블로그 마케팅 전문 카피라이터입니다. 아래 문체 가이드를 철저히 따라 글을 작성합니다.\n${STYLE_GUIDE}`,
      messages: [{ role: "user", content: userPrompt }],
    });

    const content =
      message.content[0].type === "text" ? message.content[0].text : "";

    return Response.json({ content });
  } catch (error) {
    console.error("Generate error:", error);
    const errMsg =
      error instanceof Error ? error.message : "원고 생성 중 오류가 발생했어요.";
    return Response.json({ error: errMsg }, { status: 500 });
  }
}
