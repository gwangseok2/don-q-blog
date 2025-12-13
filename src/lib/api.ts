import { Post } from "@/interfaces/post";
import fs from "fs";
import matter from "gray-matter";
import { join } from "path";

// ------------------------------------------------------------------
// 1. 포스팅 (Posts) 관련 로직 (기존 로직 유지)
// ------------------------------------------------------------------

const postsDirectory = join(process.cwd(), "_posts");

export function getPostSlugs() {
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

// ------------------------------------------------------------------
// 2. 정적 페이지 (Pages) 관련 로직 (새로 추가)
// ------------------------------------------------------------------

const pagesDirectory = join(process.cwd(), "_pages");

// 정적 페이지의 마크다운 파일 이름 목록을 가져옵니다.
export function getPageSlugs() {
  // _pages 폴더가 존재하지 않으면 빈 배열 반환하여 에러 방지
  if (!fs.existsSync(pagesDirectory)) {
    return [];
  }
  return fs.readdirSync(pagesDirectory);
}

// 특정 슬러그를 가진 페이지의 내용을 가져오는 함수
export function getPageBySlug(slug: string) {
  const realSlug = slug.replace(/\.md$/, "");
  const fullPath = join(pagesDirectory, `${realSlug}.md`);

  // 파일이 존재하지 않으면 null 반환 (404 처리용)
  if (!fs.existsSync(fullPath)) {
    return null;
  }

  const fileContents = fs.readFileSync(fullPath, "utf8");
  const { data, content } = matter(fileContents);

  // slug와 content를 포함한 데이터 객체를 반환
  return { ...data, slug: realSlug, content };
}

// 모든 정적 페이지의 슬러그와 기본 정보를 가져오는 함수
export function getAllPages() {
  const slugs = getPageSlugs();

  // getPageBySlug는 Post 타입이 아닌 일반 객체를 반환하므로 타입 캐스팅 주의
  const pages = slugs.map((slug) => getPageBySlug(slug)).filter((page) => page !== null); // null (파일 없음)인 경우 제거

  return pages;
}
