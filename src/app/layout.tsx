import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "블로그 원고 생성기",
  description: "키워드 입력 → 네이버 상위노출 분석 → 블로그 원고 자동 생성",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-gray-50 text-gray-900">
        {children}
      </body>
    </html>
  );
}
