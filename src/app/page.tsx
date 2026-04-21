"use client";

import { useState } from "react";

interface CrawlResult {
  title: string;
  content: string;
  url: string;
}

export default function Home() {
  const [mainKeyword, setMainKeyword] = useState("");
  const [subKeywords, setSubKeywords] = useState("");
  const [morphemes, setMorphemes] = useState("");
  const [targetLength, setTargetLength] = useState(2132);
  const [keywordRepeat, setKeywordRepeat] = useState(7);
  const [extra, setExtra] = useState("");

  const [crawlResults, setCrawlResults] = useState<CrawlResult[]>([]);
  const [isCrawling, setIsCrawling] = useState(false);
  const [crawlDone, setCrawlDone] = useState(false);

  const [generatedContent, setGeneratedContent] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCrawl = async () => {
    if (!mainKeyword.trim()) {
      alert("메인키워드를 입력해주세요!");
      return;
    }
    setIsCrawling(true);
    setCrawlResults([]);
    setCrawlDone(false);

    try {
      const res = await fetch("/api/crawl", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keyword: mainKeyword.trim() }),
      });
      const data = await res.json();
      if (data.error) {
        alert("크롤링 실패: " + data.error);
      } else {
        setCrawlResults(data.results || []);
        setCrawlDone(true);
      }
    } catch {
      alert("크롤링 중 오류가 발생했어요.");
    } finally {
      setIsCrawling(false);
    }
  };

  const handleGenerate = async () => {
    if (!mainKeyword.trim()) {
      alert("메인키워드를 입력해주세요!");
      return;
    }
    setIsGenerating(true);
    setGeneratedContent("");

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mainKeyword: mainKeyword.trim(),
          subKeywords: subKeywords.trim(),
          morphemes: morphemes.trim(),
          targetLength,
          keywordRepeat,
          extra: extra.trim(),
          crawlResults,
        }),
      });
      const data = await res.json();
      if (data.error) {
        alert("원고 생성 실패: " + data.error);
      } else {
        setGeneratedContent(data.content || "");
      }
    } catch {
      alert("원고 생성 중 오류가 발생했어요.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(generatedContent);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = generatedContent;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const Spinner = () => (
    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );

  return (
    <div className="min-h-screen" style={{ background: "linear-gradient(135deg, #f8f9fc 0%, #eef1f8 50%, #f0faf6 100%)" }}>
      {/* 헤더 */}
      <header className="pt-12 pb-8 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/70 border border-primary-200/50 text-primary-600 text-xs font-medium mb-5 backdrop-blur-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-mint-500 animate-pulse" />
            AI 블로그 원고 생성기
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight mb-3">
            <span className="gradient-text">블로그 원고</span>를
            <br className="sm:hidden" />
            {" "}자동으로 써드려요
          </h1>
          <p className="text-gray-400 text-sm max-w-md mx-auto leading-relaxed">
            키워드만 입력하면 네이버 상위노출 분석부터
            <br />
            소정님 문체로 원고 작성까지 한 번에!
          </p>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 pb-16">
        {/* 입력 카드 */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-[0_2px_20px_rgba(0,0,0,0.04)] border border-gray-100 p-7 mb-5 card-hover">
          {/* 메인키워드 - 특별 스타일 */}
          <div className="mb-6">
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              메인키워드
            </label>
            <input
              type="text"
              value={mainKeyword}
              onChange={(e) => setMainKeyword(e.target.value)}
              placeholder="예: 스레드 마케팅"
              className="w-full px-5 py-4 text-lg font-medium rounded-2xl input-pretty"
            />
          </div>

          {/* 나머지 입력 필드 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-gray-400 mb-1.5">
                필수키워드 (서브)
              </label>
              <input
                type="text"
                value={subKeywords}
                onChange={(e) => setSubKeywords(e.target.value)}
                placeholder="쉼표로 구분 (예: 스레드 강의, 스레드 수익화)"
                className="w-full px-4 py-3 text-sm rounded-xl input-pretty"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-gray-400 mb-1.5">
                필수 형태소
              </label>
              <input
                type="text"
                value={morphemes}
                onChange={(e) => setMorphemes(e.target.value)}
                placeholder="쉼표로 구분 (예: 매출, 광고비, 자영업자)"
                className="w-full px-4 py-3 text-sm rounded-xl input-pretty"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">
                목표 글자 수
              </label>
              <input
                type="number"
                value={targetLength}
                onChange={(e) => setTargetLength(Number(e.target.value))}
                className="w-full px-4 py-3 text-sm rounded-xl input-pretty"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">
                메인키워드 반복 횟수
              </label>
              <input
                type="number"
                value={keywordRepeat}
                onChange={(e) => setKeywordRepeat(Number(e.target.value))}
                className="w-full px-4 py-3 text-sm rounded-xl input-pretty"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-gray-400 mb-1.5">
                기타 참고사항
              </label>
              <textarea
                value={extra}
                onChange={(e) => setExtra(e.target.value)}
                rows={2}
                placeholder="예: 가격 강조해줘, 수강생 후기 많이 넣어줘"
                className="w-full px-4 py-3 text-sm rounded-xl input-pretty"
              />
            </div>
          </div>

          {/* 버튼 */}
          <div className="flex flex-wrap gap-3 mt-7">
            <button
              onClick={handleCrawl}
              disabled={isCrawling || !mainKeyword.trim()}
              className="flex-1 sm:flex-none px-7 py-3.5 bg-gradient-to-r from-mint-500 to-mint-600 text-white font-semibold rounded-2xl hover:from-mint-600 hover:to-mint-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all btn-glow-mint flex items-center justify-center gap-2 text-sm"
            >
              {isCrawling ? (
                <>
                  <Spinner />
                  분석 중...
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M9 9a2 2 0 114 0 2 2 0 01-4 0z" />
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a4 4 0 00-3.446 6.032l-2.261 2.26a1 1 0 101.414 1.415l2.261-2.261A4 4 0 1011 5z" clipRule="evenodd" />
                  </svg>
                  상위노출 분석
                </>
              )}
            </button>

            <button
              onClick={handleGenerate}
              disabled={isGenerating || !mainKeyword.trim()}
              className="flex-1 sm:flex-none px-7 py-3.5 bg-gradient-to-r from-primary-500 to-primary-600 text-white font-semibold rounded-2xl hover:from-primary-600 hover:to-primary-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all btn-glow-blue flex items-center justify-center gap-2 text-sm"
            >
              {isGenerating ? (
                <>
                  <Spinner />
                  생성 중...
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                  </svg>
                  원고 생성
                </>
              )}
            </button>
          </div>
        </div>

        {/* 크롤링 결과 */}
        {crawlDone && (
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-[0_2px_20px_rgba(0,0,0,0.04)] border border-gray-100 p-7 mb-5 card-hover">
            <div className="flex items-center gap-2 mb-5">
              <div className="w-8 h-8 rounded-xl bg-mint-50 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-mint-600" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M9 9a2 2 0 114 0 2 2 0 01-4 0z" />
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a4 4 0 00-3.446 6.032l-2.261 2.26a1 1 0 101.414 1.415l2.261-2.261A4 4 0 1011 5z" clipRule="evenodd" />
                </svg>
              </div>
              <h2 className="text-base font-bold text-gray-800">
                상위노출 분석 결과
              </h2>
              <span className="ml-auto text-xs font-medium text-mint-600 bg-mint-50 px-3 py-1 rounded-full">
                {crawlResults.length}건
              </span>
            </div>
            {crawlResults.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-6">크롤링 결과가 없어요.</p>
            ) : (
              <div className="space-y-2.5">
                {crawlResults.map((item, idx) => (
                  <details key={idx} className="group rounded-2xl border border-gray-100 overflow-hidden hover:border-mint-200 transition-colors">
                    <summary className="px-5 py-3.5 cursor-pointer hover:bg-gray-50/50 font-medium text-sm text-gray-700 flex items-center gap-3">
                      <span className="w-6 h-6 rounded-lg bg-mint-50 text-mint-600 text-xs font-bold flex items-center justify-center shrink-0">
                        {idx + 1}
                      </span>
                      <span className="truncate">{item.title}</span>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-300 ml-auto shrink-0 group-open:rotate-180 transition-transform" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </summary>
                    <div className="px-5 py-4 border-t border-gray-50 text-sm text-gray-500 whitespace-pre-wrap max-h-48 overflow-y-auto leading-relaxed bg-gray-50/30">
                      {item.content.slice(0, 1000)}
                      {item.content.length > 1000 && "..."}
                    </div>
                  </details>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 생성된 원고 */}
        {generatedContent && (
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-[0_2px_20px_rgba(0,0,0,0.04)] border border-gray-100 p-7 card-hover">
            <div className="flex items-center gap-2 mb-5">
              <div className="w-8 h-8 rounded-xl bg-primary-50 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-primary-600" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                </svg>
              </div>
              <h2 className="text-base font-bold text-gray-800">
                생성된 원고
              </h2>
              <div className="ml-auto flex items-center gap-2">
                <span className="text-xs text-gray-400 font-medium">
                  {generatedContent.length}자
                </span>
                <button
                  onClick={handleCopy}
                  className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all ${
                    copied
                      ? "bg-mint-500 text-white"
                      : "bg-gray-900 text-white hover:bg-gray-800"
                  }`}
                >
                  {copied ? "복사 완료!" : "복사하기"}
                </button>
              </div>
            </div>
            <div className="prose-result rounded-2xl p-6 whitespace-pre-wrap text-sm leading-[2] text-gray-700 border border-gray-100" style={{ background: "linear-gradient(135deg, #fafbff 0%, #f8faf9 100%)" }}>
              {generatedContent}
            </div>
          </div>
        )}
      </main>

      {/* 푸터 */}
      <footer className="text-center pb-8">
        <p className="text-xs text-gray-300">
          Made with Claude API
        </p>
      </footer>
    </div>
  );
}
