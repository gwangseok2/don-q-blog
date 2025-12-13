import { type Author } from "./author";

export type Post = {
  slug: string;
  title: string;
  date: string;
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
