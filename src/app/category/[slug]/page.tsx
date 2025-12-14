import Container from "@/app/_components/container";
import { HeroPost } from "@/app/_components/hero-post";
import { MoreStories } from "@/app/_components/more-stories";
import { getPostsByCategory, getAllCategorySlugs } from "@/lib/api";
import Header from "@/app/_components/header";

// 🚨 categories.json 파일을 raw 데이터로 임포트합니다.
import rawCategories from "@/data/categories.json";

// 🚨 Header 컴포넌트에서 정의된 유효한 슬러그 목록을 가져옵니다.
import { CATEGORY_KEYS, CategorySlug } from "@/app/_components/header";

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
    if (cat.slug === slug) {
      return cat.name;
    }

    if (cat.children && cat.children.length > 0) {
      const foundName = findCategoryNameBySlug(slug, cat.children);
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

export default async function CategoryPage(props: { params: { slug: string } }) {
  const params = await props.params;

  // 🚨 1. URL 파라미터에서 string 타입의 slug를 가져옵니다.
  const rawCategorySlug: string = params.slug;

  // URL 경로가 유효하지 않은 경우 대비
  if (!rawCategorySlug) {
    return (
      <main>
        <Container>
          <h2>오류: 잘못된 카테고리 경로입니다.</h2>
        </Container>
      </main>
    );
  }

  //  2. 유효성 검사 및 타입 단언 로직 추가 (타입 오류 해결)
  // rawCategorySlug가 CATEGORY_KEYS의 키 목록에 포함되는지 확인합니다.
  const isCategoryValid = Object.keys(CATEGORY_KEYS).includes(rawCategorySlug);

  //  3. Header 컴포넌트에 전달할 안전한 categorySlug를 생성합니다.
  // 유효하면 CategorySlug 타입으로 단언하고, 아니면 undefined를 할당합니다.
  const safeCategorySlug: CategorySlug | undefined = isCategoryValid ? (rawCategorySlug as CategorySlug) : undefined;

  // 4. 나머지 로직은 safeCategorySlug 또는 rawCategorySlug를 사용하여 진행합니다.

  // getPostsByCategory는 string 타입 인수를 받도록 가정합니다.
  const allPosts = getPostsByCategory(rawCategorySlug);

  // 카테고리 이름 찾기: findCategoryNameBySlug는 string을 인수로 받습니다.
  const categoryName = findCategoryNameBySlug(rawCategorySlug, baseCategories) || rawCategorySlug;

  //  페이지 제목 설정 (기존과 동일)
  const pageTitle = `${categoryName}`;

  if (allPosts.length === 0) {
    // 포스트가 없을 경우
    return (
      <main>
        <Container>
          {/*  Header에 safeCategorySlug 전달 (undefined도 허용) */}
          <Header categorySlug={safeCategorySlug} />

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
        {/* 🚨 Header에 safeCategorySlug 전달 */}
        <Header categorySlug={safeCategorySlug} />

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
