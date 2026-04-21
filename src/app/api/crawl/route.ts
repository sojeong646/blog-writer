import * as cheerio from "cheerio";

export async function POST(request: Request) {
  try {
    const { keyword } = await request.json();

    if (!keyword) {
      return Response.json({ error: "키워드를 입력해주세요." }, { status: 400 });
    }

    // 네이버 블로그 검색
    const searchUrl = `https://search.naver.com/search.naver?where=blog&query=${encodeURIComponent(keyword)}&sm=tab_opt&nso=so%3Ar%2Cp%3A1m`;

    const searchRes = await fetch(searchUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept-Language": "ko-KR,ko;q=0.9",
      },
    });

    const searchHtml = await searchRes.text();
    const $ = cheerio.load(searchHtml);

    // 블로그 링크 추출 (상위 5개)
    const blogLinks: { title: string; url: string }[] = [];

    $(".title_area a, .api_txt_lines.total_tit").each((_, el) => {
      if (blogLinks.length >= 5) return false;
      const href = $(el).attr("href");
      const title = $(el).text().trim();
      if (href && title && href.includes("blog.naver.com")) {
        blogLinks.push({ title, url: href });
      }
    });

    // 각 블로그 글 크롤링
    const results = await Promise.all(
      blogLinks.map(async (link) => {
        try {
          // 네이버 블로그는 iframe 구조 → postView URL로 변환
          const blogRes = await fetch(link.url, {
            headers: {
              "User-Agent":
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            },
          });
          const blogHtml = await blogRes.text();
          const blog$ = cheerio.load(blogHtml);

          // iframe src에서 실제 포스트 URL 추출
          let postUrl = "";
          blog$("iframe#mainFrame").each((_, el) => {
            const src = blog$(el).attr("src");
            if (src) {
              postUrl = src.startsWith("http")
                ? src
                : `https://blog.naver.com${src}`;
            }
          });

          let content = "";

          if (postUrl) {
            const postRes = await fetch(postUrl, {
              headers: {
                "User-Agent":
                  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
              },
            });
            const postHtml = await postRes.text();
            const post$ = cheerio.load(postHtml);

            // 본문 텍스트 추출
            content = post$(".se-main-container").text().trim();
            if (!content) {
              content = post$("#postViewArea").text().trim();
            }
            if (!content) {
              content = post$(".post-view").text().trim();
            }
          }

          // iframe이 없는 경우 (모바일 버전 등)
          if (!content) {
            content = blog$(".se-main-container").text().trim();
            if (!content) {
              content = blog$("#postViewArea").text().trim();
            }
          }

          return {
            title: link.title,
            url: link.url,
            content: content.slice(0, 3000), // 최대 3000자
          };
        } catch {
          return {
            title: link.title,
            url: link.url,
            content: "(크롤링 실패)",
          };
        }
      })
    );

    // 내용이 있는 결과만 필터링
    const validResults = results.filter(
      (r) => r.content && r.content !== "(크롤링 실패)" && r.content.length > 50
    );

    return Response.json({ results: validResults.length > 0 ? validResults : results });
  } catch (error) {
    console.error("Crawl error:", error);
    return Response.json(
      { error: "크롤링 중 오류가 발생했어요." },
      { status: 500 }
    );
  }
}
