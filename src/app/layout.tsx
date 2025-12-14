import Footer from "@/app/_components/footer";
import { BLOG_NAME, HOME_OG_IMAGE_URL } from "@/lib/constants";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import cn from "classnames";
// import { ThemeSwitcher } from "./_components/theme-switcher";
import "./globals.css";
import SidebarWrapper from "@/app/_components/side-bar-wrapper"; // 🚨 Wrapper 임포트
import Script from "next/script"; // next/script 임포트
const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: `${BLOG_NAME}`,
  description: `돈큐(Don Q)는 해외주식, 부동산, 라이프스타일 전반의 실질적인 재테크 꿀팁과 깊이 있는 투자 정보를 제공합니다.`,
  openGraph: {
    title: BLOG_NAME,
    images: [HOME_OG_IMAGE_URL],
    type: "website",
  },
  other: {
    "naver-site-verification": "ac682923470a49e562ddc6e508b56bbac27acae2",
    "google-adsense-account": "ca-pub-2473172921530585",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* GA */}
        <Script
          strategy="afterInteractive" // 중요: 상호 작용 후 로드하여 성능 개선
          src={`https://www.googletagmanager.com/gtag/js?id=G-TH6V971WLZ`} // YOUR_GA_MEASUREMENT_ID를 본인의 ID로 변경
        />
        {/* 2. GA 초기화 및 설정 스크립트 */}
        <Script
          id="google-analytics" // 스크립트 ID
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-TH6V971WLZ');
            `,
          }}
        />
        <link rel="canonical" href="https://donqlog.com/" />
        <link rel="icon" href="/favicon/favicon.ico?v=1" type="image/x-icon" />
        <meta name="theme-color" content="#000" />
      </head>
      {/* ... */}
      <body className={cn(inter.className, "dark:bg-slate-900 dark:text-slate-400")}>
        <div className="flex min-h-screen">
          {/* 🚨 SidebarWrapper를 사용합니다. */}
          <SidebarWrapper />

          <main className="flex-1 p-4">
            {/* ... */}
            {children}
          </main>
        </div>
        <Footer />
        {/* ... */}
      </body>
    </html>
  );
}
