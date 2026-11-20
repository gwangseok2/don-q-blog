import { type Author } from "./author";

export type Post = {
  slug: string;
  title: string;
  date: string;
  // 본문을 의미 있게 고쳤을 때만 적는 수정일 (YYYY-MM-DD). sitemap lastmod, dateModified에 쓰입니다.
  updated?: string;
  coverImage: string;
  author: Author;
  excerpt: string;
  ogImage: {
    url: string;
  };
  content: string;

  // 🚨 이 부분을 추가합니다. 카테고리 슬러그를 저장합니다.
  category: string;

  preview?: boolean;
};
