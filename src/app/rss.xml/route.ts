import { getAllPosts } from "@/lib/api";
import { BLOG_NAME, getBaseUrl } from "@/lib/constants";

export const dynamic = "force-static";

export async function GET() {
  const allPosts = getAllPosts();
  const baseUrl = getBaseUrl();

  // RSS XML 아이템 리스트 생성
  const itemsXml = allPosts
    .map((post) => {
      const url = `${baseUrl}/posts/${post.slug}`;
      return `
    <item>
      <title><![CDATA[${post.title}]]></title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <pubDate>${new Date(post.date).toUTCString()}</pubDate>
      <description><![CDATA[${post.excerpt || ""}]]></description>
      <author><![CDATA[${post.author.name}]]></author>
      <category><![CDATA[${post.category}]]></category>
    </item>`;
    })
    .join("");

  // 전체 RSS XML 구조 생성
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
</rss>`;

  return new Response(rssXml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "s-maxage=3600, stale-while-revalidate",
    },
  });
}
