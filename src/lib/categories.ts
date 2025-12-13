// src/lib/categories.ts

import baseCategories from "@/data/categories.json";
import { getAllPostCategories } from "@/lib/api"; // 🚨 절대경로 사용

// 타입 정의
export interface Category {
  name: string;
  slug: string;
  count: number;
  children?: Category[];
}

interface PostCategory {
  category: string;
}

// ----------------------------------------------------------------
// Helper: 재귀적으로 카운트를 업데이트하는 함수
// ----------------------------------------------------------------
function updateCountsRecursively(categories: Category[], postCounts: Map<string, number>): Category[] {
  return categories.map((cat) => {
    let childCountSum = 0;

    if (cat.children && cat.children.length > 0) {
      cat.children = updateCountsRecursively(cat.children, postCounts);
      childCountSum = cat.children.reduce((sum, child) => sum + child.count, 0);
    }

    const directPostCount = postCounts.get(cat.slug) || 0;

    // 최종 카운트 = 직접 포함된 포스트 수 + 모든 하위 포스트 수
    cat.count = directPostCount + childCountSum;

    return cat;
  });
}

// ----------------------------------------------------------------
// Main: 동적 카테고리 데이터 생성 함수 (Server Component에서 호출)
// ----------------------------------------------------------------
export async function getDynamicCategories(): Promise<Category[]> {
  const allPosts: PostCategory[] = getAllPostCategories();

  // 각 카테고리 슬러그별 포스트 수 계산
  const postCounts = new Map<string, number>();
  allPosts.forEach((post) => {
    const count = postCounts.get(post.category) || 0;
    postCounts.set(post.category, count + 1);
  });

  const dynamicCategories: Category[] = JSON.parse(JSON.stringify(baseCategories));

  return updateCountsRecursively(dynamicCategories, postCounts);
}
