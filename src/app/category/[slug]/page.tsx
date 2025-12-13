import Container from "@/app/_components/container";
import { HeroPost } from "@/app/_components/hero-post";
import { MoreStories } from "@/app/_components/more-stories";
import { getPostsByCategory, getAllCategorySlugs } from "@/lib/api";
import Header from "@/app/_components/header";

// 🚨 categories.json 파일을 raw 데이터로 임포트합니다.
import rawCategories from "@/data/categories.json";

// ------------------------------------------------------------------
// Helper Type & Constants
// ------------------------------------------------------------------

interface Category {
  name: string;
  slug: string;
  children?: Category[];
}

// JSON 데이터를 안정적인 Category[] 타입으로 캐스팅하여 사용합니다.
const baseCategories: Category[] = rawCategories as Category[];

// ------------------------------------------------------------------
// 1. Static Params (빌드 시 생성할 경로 목록)
// ------------------------------------------------------------------
export async function generateStaticParams() {
  const slugs = getAllCategorySlugs();
  return slugs.map((slug) => ({ slug: slug }));
}

// ------------------------------------------------------------------
// 2. Helper: slug로 카테고리 name 찾기 (재귀 로직 안정화)
// ------------------------------------------------------------------

function findCategoryNameBySlug(slug: string, categories: Category[]): string | undefined {
  for (const cat of categories) {
    // 1. 현재 레벨의 슬러그와 일치하는지 확인
    if (cat.slug === slug) {
      return cat.name; // 찾았으면 이름 반환
    }

    // 2. 자식 카테고리가 있으면 재귀적으로 탐색
    if (cat.children && cat.children.length > 0) {
      // 자식 배열을 재귀 호출하여 결과를 받습니다.
      const foundName = findCategoryNameBySlug(slug, cat.children);

      // 재귀 호출에서 이름을 찾았다면, 여기서 바로 반환하고 탐색을 종료합니다.
      if (foundName) {
        return foundName;
      }
    }
  }
  return undefined;
}

// ------------------------------------------------------------------
// 3. Category Page Component
// ------------------------------------------------------------------

// 🚨 수정: props 객체를 받고 내부에서 await를 사용하여 params를 추출합니다.
export default async function CategoryPage(props: { params: { slug: string } }) {
  // 🚨 강제 수정: Next.js 에러 메시지에 따라 params를 await하여 Promise를 해제합니다.
  const params = await props.params;

  const { slug: categorySlug } = params;

  // URL 경로가 유효하지 않은 경우 대비
  if (!categorySlug) {
    return (
      <main>
        <Container>
          <h2>오류: 잘못된 카테고리 경로입니다.</h2>
        </Container>
      </main>
    );
  }

  const allPosts = getPostsByCategory(categorySlug);

  // 카테고리 이름 찾기: 실패하면 슬러그를 사용합니다. (예: foreign-stock)
  const categoryName = findCategoryNameBySlug(categorySlug, baseCategories) || categorySlug;

  // 🚨 페이지 제목 설정
  const pageTitle = `${categoryName}`;

  if (allPosts.length === 0) {
    // 포스트가 없을 경우
    return (
      <main>
        <Container>
          <Header />
          {/* 🚨 h2 태그로 제목을 직접 표시 */}
          <h2 className="text-4xl md:text-5xl font-bold tracking-tighter leading-tight md:pr-8 mb-8">{pageTitle}</h2>
          <p className="mt-8 text-lg text-gray-600">
            아직 &quot;{categoryName}&quot; 카테고리에 게시된 포스트가 없습니다. 다른 카테고리를 탐색해보세요!
          </p>
        </Container>
      </main>
    );
  }

  // 4. 포스트가 있을 경우
  const heroPost = allPosts[0];
  const morePosts = allPosts.slice(1);

  return (
    <main>
      <Container>
        <Header />
        <h2 className="text-4xl md:text-5xl font-bold tracking-tighter leading-tight md:pr-8 mb-8">{pageTitle}</h2>

        <HeroPost
          title={heroPost.title}
          coverImage={heroPost.coverImage}
          date={heroPost.date}
          author={heroPost.author}
          slug={heroPost.slug}
          excerpt={heroPost.excerpt}
        />

        {morePosts.length > 0 && <MoreStories posts={morePosts} />}
      </Container>
    </main>
  );
}
