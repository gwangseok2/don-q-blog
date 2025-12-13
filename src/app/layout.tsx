import Footer from "@/app/_components/footer";
import { BLOG_NAME, HOME_OG_IMAGE_URL } from "@/lib/constants";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import cn from "classnames";
// import { ThemeSwitcher } from "./_components/theme-switcher";
import "./globals.css";
import SidebarWrapper from "@/app/_components/side-bar-wrapper"; // 🚨 Wrapper 임포트
const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: `${BLOG_NAME}`,
  description: `돈큐(Don Q)는 연말정산, 해외주식, 부동산, 라이프스타일 전반의 실질적인 재테크 꿀팁과 깊이 있는 투자 정보를 제공합니다. 당신의 경제적 자유를 위한 실전 가이드.`,
  openGraph: {
    title: BLOG_NAME,
    images: [HOME_OG_IMAGE_URL],
    type: "website",
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
        <link rel="manifest" href="/favicon/site.webmanifest" />
        <link rel="mask-icon" href="/favicon/safari-pinned-tab.svg" color="#000000" />
        <link rel="shortcut icon" href="/favicon/favicon.ico" />
        <meta name="msapplication-TileColor" content="#000000" />
        <meta name="msapplication-config" content="/favicon/browserconfig.xml" />
        <meta name="theme-color" content="#000" />
        <link rel="alternate" type="application/rss+xml" href="/feed.xml" />
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
