import Footer from "@/app/_components/footer";
import { BLOG_NAME, HOME_OG_IMAGE_URL } from "@/lib/constants";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import cn from "classnames";
// import { ThemeSwitcher } from "./_components/theme-switcher";
import "./globals.css";
import SidebarWrapper from "@/app/_components/side-bar-wrapper"; // 🚨 Wrapper 임포트
import Script from "next/script"; // next/script 임포트

import type { Viewport } from "next";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1.0,
  maximumScale: 1.0,
  userScalable: false,
};

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: BLOG_NAME,
    template: `%s | ${BLOG_NAME}`,
  },
  description: `돈큐(Don Q)는 해외주식, 부동산, 라이프스타일 전반의 실질적인 재테크 꿀팁과 깊이 있는 투자 정보를 제공합니다.`,
  alternates: {
    types: {
      "application/rss+xml": "/rss.xml",
    },
  },
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: "website",
    url: "https://donqlog.com",
    title: BLOG_NAME,
    description: `돈큐(Don Q)는 해외주식, 부동산, 라이프스타일 전반의 실질적인 재테크 꿀팁과 깊이 있는 투자 정보를 제공합니다.`,
    siteName: BLOG_NAME,
    locale: "ko_KR",
    images: [HOME_OG_IMAGE_URL],
  },
  twitter: {
    card: "summary_large_image",
    title: BLOG_NAME,
    description: `돈큐(Don Q)는 해외주식, 부동산, 라이프스타일 전반의 실질적인 재테크 꿀팁과 깊이 있는 투자 정보를 제공합니다.`,
    images: [HOME_OG_IMAGE_URL],
  },
  other: {
    "naver-site-verification": "ac682923470a49e562ddc6e508b56bbac27acae2",
    "google-adsense-account": "ca-pub-2473172921530585",
  },
};

const baseUrl = "https://donqlog.com";

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: BLOG_NAME,
  url: baseUrl,
  logo: `${baseUrl}${HOME_OG_IMAGE_URL.url}`,
  sameAs: [
    "https://www.youtube.com/@donqlog", // 예시: 실제 있으면 넣고 없어도 무방
    "https://blog.naver.com/donqlog",
  ],
  contactPoint: {
    "@type": "ContactPoint",
    telephone: "",
    contactType: "customer service",
  },
};

const navigationJsonLd = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  itemListElement: [
    {
      "@type": "SiteNavigationElement",
      position: 1,
      name: "해외주식",
      url: `${baseUrl}/category/market-analysis`,
    },
    {
      "@type": "SiteNavigationElement",
      position: 2,
      name: "부동산",
      url: `${baseUrl}/category/home-tip`,
    },
    {
      "@type": "SiteNavigationElement",
      position: 3,
      name: "금융정보",
      url: `${baseUrl}/category/stock-tip`,
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" suppressHydrationWarning>
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
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2473172921530585"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
        <meta name="theme-color" content="#000" />
        <Script
          id="schema-organization"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <Script
          id="schema-navigation"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(navigationJsonLd) }}
        />
      </head>
      {/* ... */}
      <body className={cn(inter.className, "dark:bg-slate-900 dark:text-slate-400 overflow-x-hidden")}>
        <div className="flex min-h-screen">
          {/* 🚨 SidebarWrapper를 사용합니다. */}
          <SidebarWrapper />

          <main className="flex-1 p-8">
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
