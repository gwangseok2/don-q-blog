import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import matter from "gray-matter";

const SITE_URL = "https://도메인주소";
const SITE_TITLE = "돈큐 블로그";
const SITE_DESC = "투자 · 테크 · 이슈 분석";

type Post = {
  title: string;
  excerpt: string;
  slug: string;
  date: string;
  coverImage?: string;
  category?: string;
  author?: string;
};

function getPosts(): Post[] {
  const postsDir = path.join(process.cwd(), "content/posts");

  return fs
    .readdirSync(postsDir)
    .filter((file) => file.endsWith(".mdx"))
    .map((file) => {
      const source = fs.readFileSync(path.join(postsDir, file), "utf8");

      const { data } = matter(source);

      return {
        title: data.title,
        excerpt: data.excerpt,
        slug: file.replace(/\.mdx$/, ""),
        date: data.date,
        coverImage: data.coverImage,
        category: data.category,
        author: data.author?.name,
      };
    })
    .sort((a, b) => +new Date(b.date) - +new Date(a.date))
    .slice(0, 30);
}

export async function GET() {
  const posts = getPosts();

  const items = posts
    .map((post) => {
      const link = `${SITE_URL}/blog/${post.slug}`;
      const imageUrl = post.coverImage ? `${SITE_URL}${post.coverImage}` : null;

      return `
<item>
  <title><![CDATA[${post.title}]]></title>
  <description><![CDATA[${post.excerpt}]]></description>
  <link>${link}</link>
  <guid>${link}</guid>
  <pubDate>${new Date(post.date).toUTCString()}</pubDate>
  ${post.category ? `<category>${post.category}</category>` : ""}
  ${post.author ? `<author>${post.author}</author>` : ""}
  ${imageUrl ? `<enclosure url="${imageUrl}" type="image/png" />` : ""}
</item>`;
    })
    .join("");

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"
  xmlns:media="http://search.yahoo.com/mrss/">
  <channel>
    <title>${SITE_TITLE}</title>
    <link>${SITE_URL}</link>
    <description>${SITE_DESC}</description>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    ${items}
  </channel>
</rss>`;

  return new NextResponse(rss, {
    headers: {
      "Content-Type": "application/rss+xml; charset=UTF-8",
      "Cache-Control": "no-store",
    },
  });
}
