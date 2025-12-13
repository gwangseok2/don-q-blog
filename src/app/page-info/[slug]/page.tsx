// 약관

import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPageBySlug } from "@/lib/api"; // getPageBySlug 함수 사용
import { getAllPages } from "@/lib/api"; // getAllPages 함수 사용
import { BLOG_NAME } from "@/lib/constants";
import markdownToHtml from "@/lib/markdownToHtml";
import Container from "@/app/_components/container";
import Header from "@/app/_components/header";
import { PostBody } from "@/app/_components/post-body"; // 포스팅 본문 렌더링 컴포넌트 재활용

// 페이지 정보를 위한 타입 정의 (Post와 달리 필수 정보만 포함)
type Page = {
  slug: string;
  title: string;
  date: string;
  content: string;
  excerpt?: string;
};

// 라우팅 파라미터 타입을 정의
type Params = {
  params: {
    slug: string;
  };
};

// ----------------------------------------------------
// 1. 페이지 내용을 렌더링하는 기본 컴포넌트
// ----------------------------------------------------
export default async function PageInfo(props: Params) {
  // 🚨 문제 해결: props.params를 await로 안전하게 해제
  const currentParams = await props.params;

  // getPageBySlug 함수에 해제된 slug를 전달
  const page = getPageBySlug(currentParams.slug) as Page;

  if (!page) {
    // 페이지가 없으면 404를 반환
    return notFound();
  }

  // 마크다운 내용을 HTML로 변환
  const content = await markdownToHtml(page.content || "");

  return (
    <main>
      <Container>
        <Header />

        <article className="mb-32 pt-16">
          {/* 페이지 제목 */}
          <h1 className="text-4xl md:text-6xl font-bold tracking-tighter leading-tight md:leading-none mb-12 text-center md:text-left">
            {page.title}
          </h1>

          {/* 변환된 HTML 내용을 렌더링 */}
          <PostBody content={content} />

          {/* 업데이트 날짜 표시 */}
          {page.date && (
            <p className="mt-8 text-sm text-gray-500">
              최종 업데이트:{" "}
              {new Date(page.date).toLocaleDateString("ko-KR", { year: "numeric", month: "long", day: "numeric" })}
            </p>
          )}
        </article>
      </Container>
    </main>
  );
}

// ----------------------------------------------------
// 2. 정적 메타데이터 생성 (SEO)
// ----------------------------------------------------

export async function generateMetadata(props: Params): Promise<Metadata> {
  const currentParams = await props.params;

  const page = getPageBySlug(currentParams.slug) as Page;

  if (!page) {
    return notFound();
  }

  console.log("--- generateMetadata에서 로드된 페이지 객체 확인 ---");
  console.log(page);
  console.log("-------------------------------------------------------");

  const siteTitle = BLOG_NAME;
  const title = `${page.title} | ${siteTitle}`;
  const description = page.excerpt || page.title;

  return {
    title,
    description: description,
    // ogImage 등 기타 메타데이터는 필요에 따라 추가
  };
}

// ----------------------------------------------------
// 3. 정적 페이지 경로 생성 (SSG를 위한 필수)
// ----------------------------------------------------

export async function generateStaticParams() {
  // lib/api.ts에서 모든 정적 페이지의 slug 목록을 가져옵니다.
  const pages = getAllPages();

  // { slug: 'about' }, { slug: 'privacy-policy' } 형태의 배열을 반환
  return pages.map((page) => ({
    slug: page.slug,
  }));
}
