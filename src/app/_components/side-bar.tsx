// src/app/_components/Sidebar.tsx
"use client";

import { useState } from "react";
import CategoryList from "@/app/_components/category-list";
import { Category } from "@/lib/categories";

// 🚨 SidebarWrapper로부터 받을 props의 타입 정의
interface SidebarProps {
  initialCategories: Category[];
  initialTotalCount: number;
}

const Sidebar: React.FC<SidebarProps> = ({ initialCategories, initialTotalCount }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // 🚨 햄버거 메뉴를 닫는 함수 정의
  const handleLinkClick = () => {
    // 모바일 메뉴가 열려있을 때만 닫습니다.
    if (isMenuOpen) {
      setIsMenuOpen(false);
    }
  };

  // 🚨 props로 받은 초기 데이터로 state를 초기화합니다.
  const [categories] = useState<Category[]>(initialCategories);
  const [totalCount] = useState<number>(initialTotalCount);

  return (
    <>
      {/* 1. 모바일 햄버거 버튼 */}
      <button
        className="md:hidden fixed top-10 left-4 z-50 p-2 bg-white border rounded shadow-md"
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        aria-label="Toggle navigation menu"
      >
        {isMenuOpen ? "X" : "☰"}
      </button>

      {/* 2. 사이드바 본체 (UI 로직은 동일) */}
      <nav
        className={`
          fixed top-0 left-0 h-full w-64 bg-gray-50 p-6 pt-10
          shadow-xl transition-transform duration-300 z-40 
          md:sticky md:top-0 md:h-screen md:w-64 md:transform-none md:bg-gray-50 md:shadow-none
          ${isMenuOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        <div className="md:mt-0 mt-12">
          {/* <h2 className="text-xl font-bold mb-4 border-b pb-2 text-gray-800">분류 전체보기 ({totalCount})</h2> */}
          <CategoryList categories={categories} onLinkClick={handleLinkClick} />
        </div>
      </nav>

      {/* 3. 모바일 오버레이 */}
      {isMenuOpen && (
        <div className="md:hidden fixed inset-0 bg-black opacity-30 z-30" onClick={() => setIsMenuOpen(false)} />
      )}
    </>
  );
};

export default Sidebar;
