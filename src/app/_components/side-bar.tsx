// src/app/_components/Sidebar.tsx
"use client";

import { useState, useEffect } from "react"; // 🚨 useEffect를 추가합니다.
import CategoryList from "@/app/_components/category-list";
import { Category } from "@/lib/categories";
import CoupangAdsFrame from "@/app/_components/coupang-ads-frame";

// 🚨 SidebarWrapper로부터 받을 props의 타입 정의
interface SidebarProps {
  initialCategories: Category[];
  initialTotalCount: number;
}

const Sidebar: React.FC<SidebarProps> = ({ initialCategories, initialTotalCount }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  // 🚨 스크롤 방향에 따라 버튼을 숨길지 여부를 결정하는 상태입니다.
  const [isVisible, setIsVisible] = useState(true);
  // 🚨 이전 스크롤 위치를 저장하기 위한 상태입니다.
  const [lastScrollY, setLastScrollY] = useState(0);

  // 햄버거 메뉴를 닫는 함수 정의
  const handleLinkClick = () => {
    if (isMenuOpen) {
      setIsMenuOpen(false);
    }
  };

  // props로 받은 초기 데이터는 이 컴포넌트에서 상태로 관리할 필요가 없다면 그대로 props를 사용해도 무방합니다.
  // const [categories] = useState<Category[]>(initialCategories);
  // const [totalCount] = useState<number>(initialTotalCount);

  // 🚨 스크롤 감지 및 버튼 가시성 제어 로직
  useEffect(() => {
    const handleScroll = () => {
      // 메뉴가 열려있을 때는 스크롤 감지를 무시하고 항상 보이게 유지
      if (isMenuOpen) {
        setIsVisible(true);
        setLastScrollY(window.scrollY);
        return;
      }

      // 스크롤이 맨 위에 있을 때는 항상 보이게
      if (window.scrollY === 0) {
        setIsVisible(true);
      }
      // 스크롤을 올릴 때 (현재 스크롤 위치 < 이전 스크롤 위치)
      else if (window.scrollY < lastScrollY) {
        setIsVisible(true);
      }
      // 스크롤을 내릴 때 (현재 스크롤 위치 > 이전 스크롤 위치)
      else if (window.scrollY > lastScrollY && window.scrollY > 100) {
        // 100px 이상 내려갔을 때만 숨김
        setIsVisible(false);
      }

      // 현재 스크롤 위치를 저장
      setLastScrollY(window.scrollY);
    };

    // 스크롤 이벤트 리스너 등록
    window.addEventListener("scroll", handleScroll, { passive: true });

    // 컴포넌트 언마운트 시 리스너 제거 (클린업 함수)
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [isMenuOpen, lastScrollY]); // isMenuOpen이 변경될 때도 useEffect 재실행

  // 버튼에 적용할 Tailwind CSS 클래스를 동적으로 생성
  const buttonVisibilityClass = isVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-full";

  return (
    <>
      {/* 1. 모바일 햄버거 버튼 */}
      <button
        // 🚨 동적 클래스 추가 및 transition 적용
        className={`
          md:hidden fixed top-10 right-2 z-50 p-2 bg-white border rounded shadow-md 
          transition-all duration-300 ease-in-out ${buttonVisibilityClass}
        `}
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        aria-label="Toggle navigation menu"
        // 메뉴가 닫혀있고 보이지 않을 때 클릭 방지 (접근성 및 안전성)
        // disabled={!isVisible && !isMenuOpen}
      >
        {isMenuOpen ? "X" : "☰"}
      </button>

      {/* 2. 사이드바 본체 (기존 코드와 동일) */}
      <nav
        className={`
          fixed top-0 left-0 h-full w-64 bg-gray-50 lg:p-6 pt-10 px-6 pb-20
          shadow-xl transition-transform duration-300 z-40 
          md:sticky md:top-0 md:h-screen md:w-64 md:transform-none md:bg-gray-50 md:shadow-none overflow-y-scroll lg:overflow-hidden
          ${isMenuOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {/* coupang search */}
        <div className="coupang-search-container mb-2.5">
          <iframe
            src="https://coupa.ng/ck1Pnq"
            width="100%"
            height="36"
            frameBorder="0"
            scrolling="no"
            referrerPolicy="unsafe-url"
          ></iframe>
        </div>
        <div className="md:mt-0 mt-0">
          {/* <h2 className="text-xl font-bold mb-4 border-b pb-2 text-gray-800">분류 전체보기 ({totalCount})</h2> */}
          <CategoryList categories={initialCategories} onLinkClick={handleLinkClick} />
          <div className="coupang-container">
            <CoupangAdsFrame src={"https://coupa.ng/ck1OCq"} width="50%" height="240px" className="coupang-widget" />
            <CoupangAdsFrame src={"https://coupa.ng/ck2naW"} width="50%" height="240px" className="coupang-widget" />
          </div>
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
