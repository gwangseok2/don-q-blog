// src/app/_components/CategoryList.tsx

import Link from "next/link";
import { FC } from "react";
import { Category } from "@/lib/categories"; // 🚨 절대경로 사용

// ----------------------------------------------------
// 1. 개별 카테고리 아이템 컴포넌트 (재귀 호출)
// ----------------------------------------------------
const CategoryItem: FC<{ category: Category; onLinkClick: () => void }> = ({ category, onLinkClick }) => {
  const isParent = category.children && category.children.length > 0;

  // 카테고리 페이지로 이동하는 URL 정의
  const href = `/category/${category.slug}`;

  return (
    <li className={isParent ? "mb-6" : "mb-1"}>
      <Link href={href} className="text-gray-700 hover:text-blue-600 transition-colors" onClick={onLinkClick}>
        <span className={isParent ? "font-bold text-base" : "text-sm"}>
          {category.name} ({category.count})
        </span>
      </Link>

      {/* 자식 카테고리가 있으면 재귀적으로 CategoryList 호출 */}
      {isParent && <CategoryList categories={category.children!} onLinkClick={onLinkClick} />}
    </li>
  );
};

// ----------------------------------------------------
// 2. 전체 목록 렌더링 컴포넌트 (Props로 데이터 받음)
// ----------------------------------------------------
const CategoryList: FC<{ categories: Category[]; onLinkClick: () => void }> = ({ categories, onLinkClick }) => {
  if (!categories || categories.length === 0) {
    return null;
  }

  return (
    // 중첩된 ul에 대해 들여쓰기 적용 (pl-4)
    <ul className="pl-4 list-none">
      {categories.map((cat) => (
        <CategoryItem key={cat.slug} category={cat} onLinkClick={onLinkClick} />
      ))}
    </ul>
  );
};

export default CategoryList;
