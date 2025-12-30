import { MetadataRoute } from "next";
import { getAllPages, getAllPosts, getAllCategorySlugs } from "@/lib/api";
import { getBaseUrl } from "@/lib/utils";

// =======================================================
// 🚨 Next.js 정적 내보내기(output: 'export') 오류 해결책
// =======================================================
export const dynamic = "force-static";
export const revalidate = false;
// =======================================================

function safeIso(dateLike?: string | number | Date, fallback = "2025-01-01") {
  // dateLike가 없으면 빌드타임(Date.now()) 쓰지 말고 "고정값" 사용(신뢰도↑)
  return new Date(dateLike ?? fallback).toISOString();
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = getBaseUrl();

  // ----------------------------------------------------
  // 1) 정적 페이지 (Pages)
  // ----------------------------------------------------
  const pages = getAllPages();
  const pageEntries: MetadataRoute.Sitemap = pages.map((page: any) => ({
    url: `${baseUrl}/page-info/${page.slug}`,
    // date 없으면 고정값(예: 정책 페이지 생성일)로
    lastModified: safeIso(page.date, "2025-12-12"),
    priority: 0.8,
  }));

  // ----------------------------------------------------
  // 2) 포스팅 (Posts)
  // ----------------------------------------------------
  const posts = getAllPosts();

  const postEntries: MetadataRoute.Sitemap = posts.map((post: any) => ({
    url: `${baseUrl}/posts/${post.slug}`,
    lastModified: safeIso(post.date, "2025-01-01"),
    priority: 0.7,
  }));

  // ----------------------------------------------------
  // 3) 카테고리 (Categories)
  // - 프론트매터의 category: "stock-analysis" 를 그대로 slug로 사용
  // - lastmod는 해당 카테고리의 "최신 글 날짜"
  // - 글 0개 카테고리는 sitemap에서 제외(얇은 페이지 줄이기)
  // ----------------------------------------------------
  const categorySlugs = getAllCategorySlugs();

  const latestByCategory = new Map<string, number>();
  for (const post of posts) {
    const catSlug = post.category; // ✅ 프론트매터 기준
    if (!catSlug) continue;

    const t = new Date(post.date).getTime();
    const prev = latestByCategory.get(catSlug) ?? 0;
    if (t > prev) latestByCategory.set(catSlug, t);
  }

  const categoryEntries: MetadataRoute.Sitemap = categorySlugs
    .filter((slug) => latestByCategory.has(slug)) // ✅ 글 없는 카테고리 제거
    .map((slug) => ({
      url: `${baseUrl}/category/${slug}`,
      lastModified: new Date(latestByCategory.get(slug)!).toISOString(),
      priority: 0.6,
    }));

  // ----------------------------------------------------
  // 4) 홈 (Home)
  // - lastmod는 "전체 최신 글 날짜"로 (빌드타임 금지)
  // ----------------------------------------------------
  const latestPostTime =
    posts.length > 0
      ? Math.max(...posts.map((p: any) => new Date(p.date).getTime()))
      : new Date("2025-01-01").getTime();

  const homeEntry: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(latestPostTime).toISOString(),
      priority: 1.0,
    },
  ];

  // 5) 병합
  return [...homeEntry, ...pageEntries, ...postEntries, ...categoryEntries];
}
