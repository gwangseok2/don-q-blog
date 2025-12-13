// src/lib/api.ts

import { Post } from "@/interfaces/post";
import fs from "fs";
import matter from "gray-matter";
import { join } from "path";
import baseCategories from "@/data/categories.json";

// ------------------------------------------------------------------
// Helper Types for Category Logic (Category 인터페이스를 정의하거나 임포트)
// ------------------------------------------------------------------

// Post 인터페이스 외에 Category 인터페이스를 정의 (혹은 "@/interfaces/category"에서 임포트)
interface Category {
  name: string;
  slug: string;
  children?: Category[];
}

const categories: Category[] = baseCategories as Category[];

// ------------------------------------------------------------------
// 🚨 NEW HELPER: 요청된 카테고리 객체와 그 하위 카테고리의 모든 슬러그를 추출
// ------------------------------------------------------------------

/**
 * 주어진 카테고리 배열(보통 baseCategories)에서 targetSlug를 가진 객체를 찾습니다.
 */
function findCategoryObject(targetSlug: string, categories: Category[]): Category | undefined {
  for (const cat of categories) {
    if (cat.slug === targetSlug) {
      return cat;
    }
    if (cat.children && cat.children.length > 0) {
      const found = findCategoryObject(targetSlug, cat.children);
      if (found) {
        return found;
      }
    }
  }
  return undefined;
}

/**
 * 특정 카테고리 객체와 그 하위 모든 자식의 슬러그를 재귀적으로 추출합니다.
 */
function extractAllSlugs(category: Category, slugs: Set<string>) {
  slugs.add(category.slug);
  if (category.children) {
    category.children.forEach((child) => {
      extractAllSlugs(child, slugs);
    });
  }
}

// ------------------------------------------------------------------
// 1. 포스팅 (Posts) 관련 로직
// ------------------------------------------------------------------

const postsDirectory = join(process.cwd(), "_posts");

export function getPostSlugs() {
  if (!fs.existsSync(postsDirectory)) {
    return [];
  }
  return fs.readdirSync(postsDirectory);
}

export function getPostBySlug(slug: string) {
  const realSlug = slug.replace(/\.md$/, "");
  const fullPath = join(postsDirectory, `${realSlug}.md`);
  const fileContents = fs.readFileSync(fullPath, "utf8");
  const { data, content } = matter(fileContents);

  return { ...data, slug: realSlug, content } as Post;
}

export function getAllPosts(): Post[] {
  const slugs = getPostSlugs();
  const posts = slugs
    .map((slug) => getPostBySlug(slug))
    // sort posts by date in descending order
    .sort((post1, post2) => (post1.date > post2.date ? -1 : 1));
  return posts;
}

/**
 * 특정 카테고리 슬러그에 해당하는 포스트 목록을 반환합니다. (하위 카테고리 포함)
 * @param categorySlug 필터링할 카테고리 슬러그 (대분류 또는 소분류)
 */
export function getPostsByCategory(categorySlug: string): Post[] {
  const allPosts = getAllPosts();

  // 🚨 1단계: 요청된 슬러그의 카테고리 객체를 찾습니다.
  const targetCategory = findCategoryObject(categorySlug, categories);

  const targetSlugs = new Set<string>();

  if (targetCategory) {
    // 🚨 2단계: 카테고리 객체를 찾았다면, 해당 카테고리와 모든 하위 슬러그를 수집합니다.
    extractAllSlugs(targetCategory, targetSlugs);
  } else {
    // 카테고리 객체를 찾지 못했더라도, 최소한 요청된 슬러그는 포함합니다.
    targetSlugs.add(categorySlug);
  }

  // 🚨 3단계: 수집된 슬러그 중 하나라도 일치하는지 확인하여 포스트를 필터링합니다.
  const filteredPosts = allPosts.filter((post) => {
    // post.category가 수집된 Set에 포함되는지 확인합니다.
    return targetSlugs.has(post.category);
  });

  return filteredPosts;
}

// ------------------------------------------------------------------
// 2. 카테고리 카운트 로직
// ------------------------------------------------------------------

interface PostCategory {
  category: string;
}

export function getAllPostCategories(): PostCategory[] {
  const slugs = getPostSlugs();

  return slugs.map((slug) => {
    const fullPath = join(postsDirectory, slug);
    const fileContents = fs.readFileSync(fullPath, "utf8");
    const { data } = matter(fileContents);

    const categorySlug = data.category || "uncategorized";

    return { category: categorySlug };
  });
}

// ------------------------------------------------------------------
// 3. 정적 페이지 (Pages) 관련 로직
// ------------------------------------------------------------------

const pagesDirectory = join(process.cwd(), "_pages");

export function getPageSlugs() {
  if (!fs.existsSync(pagesDirectory)) {
    return [];
  }
  return fs.readdirSync(pagesDirectory);
}

export function getPageBySlug(slug: string) {
  const realSlug = slug.replace(/\.md$/, "");
  const fullPath = join(pagesDirectory, `${realSlug}.md`);

  if (!fs.existsSync(fullPath)) {
    return null;
  }

  const fileContents = fs.readFileSync(fullPath, "utf8");
  const { data, content } = matter(fileContents);

  return { ...data, slug: realSlug, content };
}

export function getAllPages() {
  const slugs = getPageSlugs();
  const pages = slugs.map((slug) => getPageBySlug(slug)).filter((page) => page !== null);
  return pages;
}

// ------------------------------------------------------------------
// 4. 모든 카테고리 슬러그 목록을 반환하는 함수 (Static Params용)
// ------------------------------------------------------------------

export function getAllCategorySlugs(): string[] {
  const slugs: string[] = [];

  function extractSlugs(categories: any[]) {
    categories.forEach((cat) => {
      slugs.push(cat.slug);
      if (cat.children) {
        extractSlugs(cat.children);
      }
    });
  }

  extractSlugs(baseCategories);
  return slugs;
}
