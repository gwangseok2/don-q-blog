import { getAllPosts } from "@/lib/api";
import { BLOG_NAME, getBaseUrl } from "@/lib/constants";

// 정적 내보내기(output: export)를 위한 설정
export const dynamic = "force-static";

export async function GET() {
  const allPosts = getAllPosts();
  const baseUrl = getBaseUrl();

  // 1. 아이템 생성 시 앞뒤 공백 제거 (trim 사용)
  const itemsXml = allPosts
    .map((post) => {
      const url = `${baseUrl}/posts/${post.slug}`;
      return `
    <item>
      <title><![CDATA[${post.title.trim()}]]></title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <pubDate>${new Date(post.date).toUTCString()}</pubDate>
      <description><![CDATA[${(post.excerpt || "").trim()}]]></description>
      <author><![CDATA[${post.author.name.trim()}]]></author>
      <category><![CDATA[${post.category.trim()}]]></category>
    </item>`;
    })
    .join("");

  // 2. XML 구조 생성 (불필요한 공백 및 태그 제거)
  const rssXml = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title><![CDATA[${BLOG_NAME}]]></title>
    <link>${baseUrl}</link>
    <description><![CDATA[${BLOG_NAME} - 투자 인사이트 및 금융 정보 블로그]]></description>
    <language>ko</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${baseUrl}/rss.xml" rel="self" type="application/rss+xml" />
    ${itemsXml}
  </channel>
</rss>`.trim(); // 전체 문자열 앞뒤 공백 제거

  return new Response(rssXml, {
    headers: {
      // charset을 명시하여 한글 깨짐 방지
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "s-maxage=3600, stale-while-revalidate",
    },
  });
}
