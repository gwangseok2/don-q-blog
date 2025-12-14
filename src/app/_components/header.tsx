import Link from "next/link";
import { BLOG_NAME } from "@/lib/constants";
import { getDynamicCategories } from "@/lib/categories";

export const CATEGORY_KEYS = {
  // 대분류
  "foreign-stock": "해외주식",
  "real-estate-ipo": "부동산 · 청약",
  life: "라이프",
  "info-tip": "정보/팁",

  // 해외주식 하위
  "market-analysis": "시장·지표 분석",
  "stock-analysis": "종목 분석",
  "trading-log": "내 매매일지",
  "news-issue": "뉴스 & 이슈",

  // 부동산 · 청약 하위
  "apartment-analysis": "아파트 분석",

  // 라이프 하위
  "food-review": "맛집 후기",
  daily: "일상",
  travel: "여행",

  // 정보/팁 하위
  "stock-tip": "투자 정보",
  "home-tip": "부동산 정보",
  "common-tip": "꿀팁",
};

// CATEGORY_KEYS의 키들만 추출하여 타입으로 사용합니다.
export type CategorySlug = keyof typeof CATEGORY_KEYS;

// 🚨 Props 인터페이스 정의: categorySlug는 CategorySlug 타입이어야 합니다.
interface HeaderProps {
  // 현재 페이지의 카테고리 이름 (page.tsx에서 이미 변환해서 넘겨주는 것을 권장)
  categoryName?: String;
  // 현재 페이지의 카테고리 슬러그 (Link 경로를 위해)
  categorySlug?: CategorySlug; // 🚨 정확한 타입으로 제한
}

const Header = ({ categoryName, categorySlug }: HeaderProps) => {
  console.log(categorySlug, "하이 있제");
  // 1. 브레드크럼을 표시할지 여부를 판단합니다.
  if (categorySlug) {
    // categorySlug가 유효한 키인지 런타임에 확인하여 안전하게 이름 가져오기
    const displayCategoryName = CATEGORY_KEYS[categorySlug];

    // categorySlug는 있지만, CATEGORY_KEYS에 정의되지 않은 경우를 대비하여 렌더링을 피하거나 기본값을 설정합니다.
    if (!displayCategoryName) {
      // 유효하지 않은 슬러그일 경우 기본 헤더를 렌더링
      return (
        <h2 className="text-2xl md:text-2xl font-bold tracking-tight md:tracking-tighter leading-tight mb-10 mt-8 flex items-center">
          <Link href="/" className="hover:underline">
            {BLOG_NAME}
          </Link>
        </h2>
      );
    }

    return (
      <h2 className="text-2xl md:text-2xl font-bold tracking-tight md:tracking-tighter leading-tight mb-10 mt-8 flex items-center space-x-2">
        {/* 1. 메인 홈 링크 (돈큐의 투자 인사이트) */}
        <Link href="/" className="hover:underline text-gray-500 text-xl md:text-2xl">
          {BLOG_NAME}
        </Link>

        {/* 2. 구분자 */}
        <span className="text-gray-500">&gt;</span>

        {/* 3. 카테고리 링크: 슬러그를 URL에 사용하고, 이름을 표시합니다. */}
        <Link
          href={`/category/${categorySlug}`} // 🚨 슬러그를 사용해 정확한 URL 생성
          className="hover:underline text-gray-800 text-xl md:text-2xl"
        >
          {displayCategoryName}
        </Link>
      </h2>
    );
  }

  // 카테고리 정보가 없을 때 (메인 페이지, 카테고리 목록 페이지 등) 기존대로 렌더링
  return (
    <h2 className="text-2xl md:text-2xl font-bold tracking-tight md:tracking-tighter leading-tight mb-10 mt-8 flex items-center">
      <Link href="/" className="hover:underline">
        {BLOG_NAME}
      </Link>
    </h2>
  );
};

export default Header;
