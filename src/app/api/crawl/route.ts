import * as cheerio from "cheerio";

const UA =
  "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1";

// 네이버 모바일 블로그 본문 크롤링 (iframe 없음)
async function fetchBlogContent(url: string): Promise<string> {
  try {
    // PC URL → 모바일 URL 변환
    const mobileUrl = url
      .replace("blog.naver.com/", "m.blog.naver.com/")
      .replace("blog.naver.com\\", "m.blog.naver.com/");

    const res = await fetch(mobileUrl, {
      headers: { "User-Agent": UA },
    });
    const html = await res.text();
    const $ = cheerio.load(html);

    // 모바일 블로그 본문 셀렉터들
    let content = "";
    const selectors = [
      ".se-main-container",
      ".post_ct",
      "#postViewArea",
      "#viewTypeSelector",
      ".se_component_wrap",
      "div.__se_component_area",
      ".sect_dsc",
    ];

    for (const sel of selectors) {
      const text = $(sel).text().trim();
      if (text && text.length > 50) {
        content = text;
        break;
      }
    }

    // 그래도 없으면 본문 영역 전체
    if (!content) {
      content = $("div[class*='post'], div[class*='content'], article")
        .text()
        .trim();
    }

    return content;
  } catch {
    return "";
  }
}

// 형태소 분석 (간이 - 2글자 이상 명사/키워드 추출)
function extractMorphemes(texts: string[], mainKeyword: string): string[] {
  const combined = texts.join(" ");

  // 한글 단어 추출 (2~6글자)
  const words = combined.match(/[가-힣]{2,6}/g) || [];

  // 불용어
  const stopWords = new Set([
    "그리고", "하지만", "그래서", "때문에", "그러나", "또한", "이런", "저런",
    "이것", "저것", "그것", "여기", "거기", "우리", "나는", "저는", "에서",
    "으로", "까지", "부터", "라고", "이라", "라는", "하는", "있는", "없는",
    "되는", "같은", "다른", "많은", "적은", "좋은", "나쁜", "큰", "작은",
    "합니다", "합니당", "입니다", "입니당", "했어요", "했습니다", "하세요",
    "거든요", "인데요", "같아요", "있어요", "없어요", "해요", "돼요",
    "그런데", "그래도", "아니면", "만약에", "왜냐면", "그러면", "이렇게",
    "저렇게", "그렇게", "어떻게", "정말로", "진짜로", "사실은",
    "근데", "그럼", "암튼", "뭔가", "진짜", "정말", "너무",
    "이번", "다음", "지금", "오늘", "내일", "어제", "최근",
    "포스팅", "블로그", "구독", "좋아요", "댓글", "공감", "이웃",
    "사진", "이미지", "출처", "클릭", "링크", "확인",
  ]);

  // 메인키워드에 포함된 단어 제외
  const keywordParts = mainKeyword.replace(/\s/g, "");

  // 빈도 카운트
  const freq: Record<string, number> = {};
  for (const w of words) {
    if (stopWords.has(w)) continue;
    if (w === keywordParts || keywordParts.includes(w)) continue;
    if (w.length < 2) continue;
    freq[w] = (freq[w] || 0) + 1;
  }

  // 빈도순 정렬, 상위 15개
  return Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 15)
    .map(([word]) => word);
}

export async function POST(request: Request) {
  try {
    const { keyword } = await request.json();

    if (!keyword) {
      return Response.json({ error: "키워드를 입력해주세요." }, { status: 400 });
    }

    // 1. 네이버 모바일 블로그 검색 (상위 10개)
    const searchUrl = `https://m.search.naver.com/search.naver?where=m_blog&query=${encodeURIComponent(keyword)}&sm=mtb_viw.blog`;

    const searchRes = await fetch(searchUrl, {
      headers: {
        "User-Agent": UA,
        "Accept-Language": "ko-KR,ko;q=0.9",
      },
    });

    const searchHtml = await searchRes.text();
    const $ = cheerio.load(searchHtml);

    // 블로그 링크 추출
    const blogLinks: { title: string; url: string }[] = [];

    $("a").each((_, el) => {
      if (blogLinks.length >= 10) return false;
      const href = $(el).attr("href") || "";
      const title = $(el).text().trim();

      if (
        title.length > 5 &&
        (href.includes("blog.naver.com") || href.includes("m.blog.naver.com")) &&
        !blogLinks.some((l) => l.url === href)
      ) {
        blogLinks.push({ title: title.slice(0, 100), url: href });
      }
    });

    // 2. 각 블로그 글 크롤링
    const results = await Promise.all(
      blogLinks.map(async (link) => {
        const content = await fetchBlogContent(link.url);
        return {
          title: link.title,
          url: link.url,
          content: content.slice(0, 3000),
          charCount: content.replace(/\s/g, "").length,
        };
      })
    );

    // 유효한 결과만
    const validResults = results.filter((r) => r.content.length > 50);

    // 3. 자동 분석
    const contents = validResults.map((r) => r.content);

    // 평균 글자수 (공백 제외)
    const charCounts = validResults.map((r) => r.charCount);
    const avgCharCount =
      charCounts.length > 0
        ? Math.round(charCounts.reduce((a, b) => a + b, 0) / charCounts.length)
        : 2132;

    // 메인키워드 반복 횟수 분석
    const keywordCounts = contents.map((c) => {
      const regex = new RegExp(keyword.replace(/\s/g, "\\s*"), "gi");
      return (c.match(regex) || []).length;
    });
    const avgKeywordRepeat =
      keywordCounts.length > 0
        ? Math.round(
            keywordCounts.reduce((a, b) => a + b, 0) / keywordCounts.length
          )
        : 7;

    // 공통 형태소 추출
    const morphemes = extractMorphemes(contents, keyword);

    return Response.json({
      results: validResults.length > 0 ? validResults : results,
      analysis: {
        avgCharCount,
        avgKeywordRepeat,
        morphemes,
        totalCrawled: validResults.length,
      },
    });
  } catch (error) {
    console.error("Crawl error:", error);
    return Response.json(
      { error: "크롤링 중 오류가 발생했어요." },
      { status: 500 }
    );
  }
}
