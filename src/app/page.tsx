"use client";

import { useState } from "react";

interface CrawlResult {
  title: string;
  content: string;
  url: string;
}

export default function Home() {
  // 입력 상태
  const [mainKeyword, setMainKeyword] = useState("");
  const [subKeywords, setSubKeywords] = useState("");
  const [morphemes, setMorphemes] = useState("");
  const [targetLength, setTargetLength] = useState(2132);
  const [keywordRepeat, setKeywordRepeat] = useState(7);
  const [extra, setExtra] = useState("");

  // 크롤링 상태
  const [crawlResults, setCrawlResults] = useState<CrawlResult[]>([]);
  const [isCrawling, setIsCrawling] = useState(false);
  const [crawlDone, setCrawlDone] = useState(false);

  // 원고 생성 상태
  const [generatedContent, setGeneratedContent] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  // 네이버 상위노출 크롤링
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

  // 원고 생성
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

  // 복사
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

  return (
    <main className="max-w-5xl mx-auto px-4 py-8 w-full">
      {/* 헤더 */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          블로그 원고 생성기
        </h1>
        <p className="text-gray-500">
          키워드 입력 → 상위노출 분석 → 원고 자동 생성
        </p>
      </div>

      {/* 입력 폼 */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">원고 조건 입력</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* 메인키워드 */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              메인키워드 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={mainKeyword}
              onChange={(e) => setMainKeyword(e.target.value)}
              placeholder="예: 스레드 마케팅"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
            />
          </div>

          {/* 필수키워드 */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              필수키워드 (서브)
            </label>
            <input
              type="text"
              value={subKeywords}
              onChange={(e) => setSubKeywords(e.target.value)}
              placeholder="쉼표로 구분 (예: 스레드 강의, 스레드 수익화, SNS 마케팅)"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
            />
          </div>

          {/* 필수 형태소 */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              필수 형태소
            </label>
            <input
              type="text"
              value={morphemes}
              onChange={(e) => setMorphemes(e.target.value)}
              placeholder="쉼표로 구분 (예: 매출, 광고비, 자영업자)"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
            />
          </div>

          {/* 목표 글자수 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              목표 글자 수
            </label>
            <input
              type="number"
              value={targetLength}
              onChange={(e) => setTargetLength(Number(e.target.value))}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
            />
          </div>

          {/* 키워드 반복 횟수 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              메인키워드 반복 횟수
            </label>
            <input
              type="number"
              value={keywordRepeat}
              onChange={(e) => setKeywordRepeat(Number(e.target.value))}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
            />
          </div>

          {/* 기타 */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              기타 (강조할 소구점, 참고사항)
            </label>
            <textarea
              value={extra}
              onChange={(e) => setExtra(e.target.value)}
              rows={3}
              placeholder="예: 가격 강조해줘, 수강생 후기 많이 넣어줘"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
            />
          </div>
        </div>

        {/* 버튼들 */}
        <div className="flex flex-wrap gap-3 mt-6">
          <button
            onClick={handleCrawl}
            disabled={isCrawling || !mainKeyword.trim()}
            className="px-6 py-2.5 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center gap-2"
          >
            {isCrawling ? (
              <>
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                상위노출 분석 중...
              </>
            ) : (
              "상위노출 분석"
            )}
          </button>

          <button
            onClick={handleGenerate}
            disabled={isGenerating || !mainKeyword.trim()}
            className="px-6 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center gap-2"
          >
            {isGenerating ? (
              <>
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                원고 생성 중...
              </>
            ) : (
              "원고 생성"
            )}
          </button>
        </div>
      </div>

      {/* 크롤링 결과 */}
      {crawlDone && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">
            상위노출 분석 결과 ({crawlResults.length}건)
          </h2>
          {crawlResults.length === 0 ? (
            <p className="text-gray-500">크롤링 결과가 없어요.</p>
          ) : (
            <div className="space-y-4">
              {crawlResults.map((item, idx) => (
                <details key={idx} className="border border-gray-200 rounded-lg">
                  <summary className="px-4 py-3 cursor-pointer hover:bg-gray-50 font-medium text-sm">
                    {idx + 1}. {item.title}
                  </summary>
                  <div className="px-4 py-3 border-t border-gray-100 text-sm text-gray-600 whitespace-pre-wrap max-h-48 overflow-y-auto">
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
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">생성된 원고</h2>
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-400">
                {generatedContent.length}자
              </span>
              <button
                onClick={handleCopy}
                className="px-4 py-1.5 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition"
              >
                {copied ? "복사 완료!" : "복사"}
              </button>
            </div>
          </div>
          <div className="prose-result bg-gray-50 rounded-xl p-6 whitespace-pre-wrap text-sm leading-relaxed border border-gray-100">
            {generatedContent}
          </div>
        </div>
      )}
    </main>
  );
}
