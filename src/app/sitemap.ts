import { MetadataRoute } from "next";
import { getAllPages, getAllPosts, getAllCategorySlugs } from "@/lib/api";
import { getBaseUrl } from "@/lib/utils";

// =======================================================
// 🚨 Next.js 정적 내보내기(output: 'export') 오류 해결책
// 빌드 시점에 정적으로 생성되도록 강제합니다.
// =======================================================
export const dynamic = "force-static";
export const revalidate = false;
// =======================================================

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = getBaseUrl(); // ---------------------------------------------------- // 1. 정적 페이지 항목 생성 (Pages) // ----------------------------------------------------

  const pages = getAllPages();

  const pageEntries: MetadataRoute.Sitemap = pages.map((page: any) => ({
    url: `${baseUrl}/page-info/${page.slug}`, // date가 없을 경우 (정적 페이지) 빌드 시점의 시간을 사용하도록 안전 장치 추가
    lastModified: new Date(page.date || Date.now()).toISOString(),
    priority: 0.8,
  })); // ---------------------------------------------------- // 2. 블로그 포스팅 항목 생성 (Posts) // ----------------------------------------------------

  const posts = getAllPosts();

  const postEntries: MetadataRoute.Sitemap = posts.map((post: any) => ({
    // 🚨 포스팅의 URL 구조를 /posts/[slug]로 가정합니다.
    url: `${baseUrl}/posts/${post.slug}`, // 포스팅은 date 속성이 필수라고 가정합니다.
    lastModified: new Date(post.date).toISOString(),
    priority: 0.7,
  }));

  // ----------------------------------------------------
  // 3. 카테고리 항목 생성 (Categories)
  // ----------------------------------------------------
  const categorySlugs = getAllCategorySlugs();

  const categoryEntries: MetadataRoute.Sitemap = categorySlugs.map((slug) => ({
    // 🚨 카테고리 URL 구조를 /category/[slug]로 가정합니다.
    url: `${baseUrl}/category/${slug}`,
    // 카테고리 페이지는 현재 시간(빌드 시점)으로 설정
    lastModified: new Date().toISOString(),
    priority: 0.6,
  })); // ---------------------------------------------------- // 4. 홈 페이지 항목 // ----------------------------------------------------

  const homeEntry: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date().toISOString(),
      priority: 1.0,
    },
  ]; // 5. 모든 항목을 병합하여 반환

  return [...homeEntry, ...pageEntries, ...postEntries, ...categoryEntries];
}
