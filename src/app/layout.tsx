import type { Metadata } from "next";
import { Noto_Sans_KR } from "next/font/google";
import { THEME_INIT_SCRIPT } from "@/lib/theme";
import "./globals.css";

const notoSansKr = Noto_Sans_KR({
  variable: "--font-noto-sans-kr",
  weight: ["400", "500", "700"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Ottugi",
  description: "간호사 병동 근무표 서비스",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    // data-theme은 <head>의 스크립트가 첫 그림 전에 걸어서 서버가 그린 html과 속성이 달라진다
    <html lang="ko" className={`${notoSansKr.variable} h-full antialiased`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body className="min-h-full">{children}</body>
    </html>
  );
}
