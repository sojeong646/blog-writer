"use client";

import { useState } from "react";

interface CrawlResult {
  title: string;
  content: string;
  url: string;
}

interface Analysis {
  avgCharCount: number;
  avgKeywordRepeat: number;
  morphemes: string[];
  totalCrawled: number;
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
  const [analysis, setAnalysis] = useState<Analysis | null>(null);

  const [generatedContent, setGeneratedContent] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  // 상위노출 분석 → 자동으로 폼 채움
  const handleCrawl = async () => {
    if (!mainKeyword.trim()) { alert("메인키워드를 입력해주세요!"); return; }
    setIsCrawling(true); setCrawlResults([]); setCrawlDone(false); setAnalysis(null);
    try {
      const res = await fetch("/api/crawl", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keyword: mainKeyword.trim() }),
      });
      const data = await res.json();
      if (data.error) { alert("크롤링 실패: " + data.error); }
      else {
        setCrawlResults(data.results || []);
        setCrawlDone(true);

        // 분석 결과로 폼 자동 채우기
        if (data.analysis) {
          setAnalysis(data.analysis);
          setTargetLength(data.analysis.avgCharCount);
          setKeywordRepeat(data.analysis.avgKeywordRepeat);
          setMorphemes(data.analysis.morphemes.join(", "));
        }
      }
    } catch { alert("크롤링 중 오류가 발생했어요."); }
    finally { setIsCrawling(false); }
  };

  const handleGenerate = async () => {
    if (!mainKeyword.trim()) { alert("메인키워드를 입력해주세요!"); return; }
    setIsGenerating(true); setGeneratedContent("");
    try {
      const res = await fetch("/api/generate", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mainKeyword: mainKeyword.trim(), subKeywords: subKeywords.trim(),
          morphemes: morphemes.trim(), targetLength, keywordRepeat,
          extra: extra.trim(), crawlResults,
        }),
      });
      const data = await res.json();
      if (data.error) { alert("원고 생성 실패: " + data.error); }
      else { setGeneratedContent(data.content || ""); }
    } catch { alert("원고 생성 중 오류가 발생했어요."); }
    finally { setIsGenerating(false); }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(generatedContent);
      setCopied(true); setTimeout(() => setCopied(false), 2000);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = generatedContent; document.body.appendChild(ta);
      ta.select(); document.execCommand("copy"); document.body.removeChild(ta);
      setCopied(true); setTimeout(() => setCopied(false), 2000);
    }
  };

  const Spinner = () => (
    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );

  return (
    <div className="h-screen flex flex-col overflow-hidden" style={{ background: "linear-gradient(135deg, #f8f9fc 0%, #eef1f8 50%, #f0faf6 100%)" }}>
      {/* 상단 헤더 */}
      <header className="shrink-0 px-6 py-4 flex items-center gap-4 border-b border-gray-200/50 bg-white/60 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-mint-500 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
            </svg>
          </div>
          <div>
            <h1 className="text-base font-bold text-gray-900">
              <span className="gradient-text">소정님</span>의 블로그 원고를 자동으로 써드려요
            </h1>
            <p className="text-[11px] text-gray-400">메인키워드만 입력하면 분석부터 원고 작성까지 한 번에!</p>
          </div>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-mint-50 text-mint-600 text-[11px] font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-mint-500 animate-pulse" />
            Ready
          </span>
        </div>
      </header>

      {/* 메인 대시보드 */}
      <div className="flex-1 flex overflow-hidden">
        {/* 왼쪽: 입력 패널 */}
        <aside className="w-[380px] shrink-0 border-r border-gray-200/50 bg-white/40 backdrop-blur-sm overflow-y-auto">
          <div className="p-5 space-y-4">
            {/* STEP 1: 메인키워드 + 분석 버튼 */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="w-5 h-5 rounded-full bg-primary-500 text-white text-[10px] font-bold flex items-center justify-center">1</span>
                <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                  메인키워드 입력 후 분석
                </label>
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={mainKeyword}
                  onChange={(e) => setMainKeyword(e.target.value)}
                  placeholder="예: 스레드 마케팅"
                  onKeyDown={(e) => { if (e.key === "Enter" && mainKeyword.trim()) handleCrawl(); }}
                  className="flex-1 px-4 py-3 text-base font-medium rounded-xl input-pretty"
                />
                <button
                  onClick={handleCrawl}
                  disabled={isCrawling || !mainKeyword.trim()}
                  className="shrink-0 px-4 py-3 bg-gradient-to-r from-mint-500 to-mint-600 text-white font-semibold rounded-xl hover:from-mint-600 hover:to-mint-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all btn-glow-mint flex items-center gap-1.5 text-sm"
                >
                  {isCrawling ? <><Spinner /> 분석 중</> : (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M9 9a2 2 0 114 0 2 2 0 01-4 0z" />
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a4 4 0 00-3.446 6.032l-2.261 2.26a1 1 0 101.414 1.415l2.261-2.261A4 4 0 1011 5z" clipRule="evenodd" />
                      </svg>
                      분석
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* 분석 결과 요약 카드 */}
            {analysis && (
              <div className="rounded-xl bg-gradient-to-r from-mint-50 to-primary-50 border border-mint-100 p-4">
                <p className="text-[11px] font-bold text-gray-600 mb-3">
                  상위 {analysis.totalCrawled}개 포스팅 분석 결과
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white/80 rounded-lg px-3 py-2 text-center">
                    <p className="text-[10px] text-gray-400">평균 글자수</p>
                    <p className="text-lg font-bold text-primary-600">{analysis.avgCharCount}</p>
                  </div>
                  <div className="bg-white/80 rounded-lg px-3 py-2 text-center">
                    <p className="text-[10px] text-gray-400">키워드 반복</p>
                    <p className="text-lg font-bold text-mint-600">{analysis.avgKeywordRepeat}회</p>
                  </div>
                </div>
                <div className="mt-3">
                  <p className="text-[10px] text-gray-400 mb-1.5">공통 형태소 (자동 입력됨)</p>
                  <div className="flex flex-wrap gap-1">
                    {analysis.morphemes.slice(0, 10).map((m, i) => (
                      <span key={i} className="px-2 py-0.5 bg-white/80 rounded-md text-[10px] text-gray-600 font-medium border border-gray-100">
                        {m}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: 추가 조건 (분석 후 수정 가능) */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="w-5 h-5 rounded-full bg-primary-500 text-white text-[10px] font-bold flex items-center justify-center">2</span>
                <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                  조건 확인 및 수정
                </label>
                {analysis && (
                  <span className="text-[10px] text-mint-500 font-medium ml-auto">자동 입력됨</span>
                )}
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-[11px] font-medium text-gray-400 mb-1">필수키워드 (서브)</label>
                  <input type="text" value={subKeywords} onChange={(e) => setSubKeywords(e.target.value)}
                    placeholder="띄어쓰기로 구분 (예: 스레드강의 스레드수익화 SNS마케팅)" className="w-full px-4 py-2.5 text-sm rounded-xl input-pretty" />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-gray-400 mb-1">필수 형태소</label>
                  <input type="text" value={morphemes} onChange={(e) => setMorphemes(e.target.value)}
                    placeholder="분석 버튼 누르면 자동 입력" className="w-full px-4 py-2.5 text-sm rounded-xl input-pretty" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-medium text-gray-400 mb-1">목표 글자수</label>
                    <input type="number" value={targetLength} onChange={(e) => setTargetLength(Number(e.target.value))}
                      className="w-full px-4 py-2.5 text-sm rounded-xl input-pretty" />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-gray-400 mb-1">키워드 반복</label>
                    <input type="number" value={keywordRepeat} onChange={(e) => setKeywordRepeat(Number(e.target.value))}
                      className="w-full px-4 py-2.5 text-sm rounded-xl input-pretty" />
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-gray-400 mb-1">기타 참고사항</label>
                  <textarea value={extra} onChange={(e) => setExtra(e.target.value)} rows={2}
                    placeholder="예: 가격 강조해줘" className="w-full px-4 py-2.5 text-sm rounded-xl input-pretty" />
                </div>
              </div>
            </div>

            {/* STEP 3: 원고 생성 */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="w-5 h-5 rounded-full bg-primary-500 text-white text-[10px] font-bold flex items-center justify-center">3</span>
                <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                  원고 생성
                </label>
              </div>
              <button
                onClick={handleGenerate}
                disabled={isGenerating || !mainKeyword.trim()}
                className="w-full py-3.5 bg-gradient-to-r from-primary-500 to-primary-600 text-white font-semibold rounded-xl hover:from-primary-600 hover:to-primary-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all btn-glow-blue flex items-center justify-center gap-2 text-sm"
              >
                {isGenerating ? <><Spinner /> 원고 생성 중...</> : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                    </svg>
                    원고 생성하기
                  </>
                )}
              </button>
            </div>

            {/* 크롤링 결과 아코디언 */}
            {crawlDone && crawlResults.length > 0 && (
              <div className="pt-3 border-t border-gray-100">
                <details className="group">
                  <summary className="flex items-center gap-2 cursor-pointer mb-2">
                    <h3 className="text-xs font-bold text-gray-600">크롤링된 포스팅</h3>
                    <span className="text-[10px] font-medium text-mint-600 bg-mint-50 px-2 py-0.5 rounded-full">
                      {crawlResults.length}건
                    </span>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-gray-300 ml-auto group-open:rotate-180 transition-transform" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </summary>
                  <div className="space-y-1.5">
                    {crawlResults.map((item, idx) => (
                      <details key={idx} className="group/item rounded-xl border border-gray-100 overflow-hidden hover:border-mint-200 transition-colors">
                        <summary className="px-3 py-2.5 cursor-pointer hover:bg-gray-50/50 text-xs text-gray-600 flex items-center gap-2">
                          <span className="w-5 h-5 rounded-md bg-mint-50 text-mint-600 text-[10px] font-bold flex items-center justify-center shrink-0">
                            {idx + 1}
                          </span>
                          <span className="truncate font-medium">{item.title}</span>
                        </summary>
                        <div className="px-3 py-3 border-t border-gray-50 text-[11px] text-gray-400 whitespace-pre-wrap max-h-32 overflow-y-auto leading-relaxed bg-gray-50/30">
                          {item.content.slice(0, 800)}
                          {item.content.length > 800 && "..."}
                        </div>
                      </details>
                    ))}
                  </div>
                </details>
              </div>
            )}
          </div>
        </aside>

        {/* 오른쪽: 결과 패널 */}
        <main className="flex-1 overflow-y-auto">
          {generatedContent ? (
            <div className="h-full flex flex-col">
              <div className="shrink-0 px-6 py-3.5 border-b border-gray-200/50 bg-white/40 backdrop-blur-sm flex items-center">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-primary-50 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-primary-600" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-sm font-bold text-gray-800">생성된 원고</span>
                  <span className="text-[11px] text-gray-400 ml-1">{generatedContent.replace(/\s/g, "").length}자 (공백제외)</span>
                </div>
                <button
                  onClick={handleCopy}
                  className={`ml-auto px-4 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                    copied ? "bg-mint-500 text-white" : "bg-gray-900 text-white hover:bg-gray-800"
                  }`}
                >
                  {copied ? "복사 완료!" : "복사하기"}
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-6">
                <div className="prose-result max-w-2xl mx-auto whitespace-pre-wrap text-[14px] leading-[2.2] text-gray-700">
                  {generatedContent}
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-300" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                  </svg>
                </div>
                <p className="text-sm font-medium text-gray-400 mb-1">아직 생성된 원고가 없어요</p>
                <p className="text-xs text-gray-300">
                  Step 1. 메인키워드 입력 → 분석<br />
                  Step 2. 조건 확인<br />
                  Step 3. 원고 생성하기
                </p>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
