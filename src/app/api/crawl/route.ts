import * as cheerio from "cheerio";

const UA =
  "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1";

async function fetchBlogContent(url: string): Promise<{ title: string; content: string }> {
  try {
    // PC URL → 모바일 URL 변환
    const mobileUrl = url.replace("blog.naver.com/", "m.blog.naver.com/");

    const res = await fetch(mobileUrl, {
      headers: { "User-Agent": UA, "Accept-Language": "ko-KR,ko;q=0.9" },
    });
    const html = await res.text();
    const $ = cheerio.load(html);

    // 제목
    const title =
      $("meta[property='og:title']").attr("content") ||
      $(".se-title-text").text().trim() ||
      $("title").text().trim() ||
      url;

    // 본문
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

    if (!content) {
      content = $("div[class*='post'], div[class*='content'], article").text().trim();
    }

    return { title, content };
  } catch {
    return { title: url, content: "" };
  }
}

export async function POST(request: Request) {
  try {
    const { urls } = await request.json();

    if (!urls || !Array.isArray(urls) || urls.length === 0) {
      return Response.json({ error: "URL을 입력해주세요." }, { status: 400 });
    }

    const validUrls = urls.filter((u: string) => u && u.trim());

    const results = await Promise.all(
      validUrls.map(async (url: string) => {
        const { title, content } = await fetchBlogContent(url.trim());
        return {
          title,
          url: url.trim(),
          content: content.slice(0, 3000),
        };
      })
    );

    return Response.json({
      results: results.filter((r) => r.content.length > 0),
    });
  } catch (error) {
    console.error("Crawl error:", error);
    return Response.json({ error: "크롤링 중 오류가 발생했어요." }, { status: 500 });
  }
}
