import { getAllPosts } from "@/lib/api";
import { BLOG_NAME, getBaseUrl } from "@/lib/constants";

export const dynamic = "force-static";

export async function GET() {
  const allPosts = getAllPosts();
  const baseUrl = getBaseUrl();

  const itemsXml = allPosts
    .map((post) => {
      const url = `${baseUrl}/posts/${post.slug}`;
      return `    <item>
      <title><![CDATA[${post.title.trim()}]]></title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <pubDate>${new Date(post.date).toUTCString()}</pubDate>
      <description><![CDATA[${(post.excerpt || "").trim()}]]></description>
      <author><![CDATA[${post.author.name.trim()}]]></author>
      <category><![CDATA[${post.category.trim()}]]></category>
    </item>`;
    })
    .join("\n");

  // XML 선언문 바로 앞에 공백이나 줄바꿈이 없어야 합니다.
  const rssXml = `<?xml version="1.0" encoding="UTF-8"?>
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
</rss>`.trim();

  return new Response(rssXml, {
    headers: {
      // application/rss+xml 대신 application/xml을 사용해 브라우저 간섭을 줄입니다.
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "s-maxage=3600, stale-while-revalidate",
    },
  });
}
