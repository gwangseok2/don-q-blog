// src/app/_components/SidebarWrapper.tsx
// (Server Component)

import { getDynamicCategories } from "@/lib/categories";
import Sidebar from "./side-bar"; // Client Component인 Sidebar 임포트

/**
 * Server Component로서, fs를 사용하는 getDynamicCategories를 안전하게 호출합니다.
 */
export default async function SidebarWrapper() {
  // 1. fs를 사용하는 함수를 여기서 호출합니다. (서버/빌드 시 실행)
  const dynamicCategories = await getDynamicCategories();

  // 2. 전체 글 수 계산
  const totalCount = dynamicCategories.reduce((sum, cat) => sum + cat.count, 0);

  // 3. Client Component인 Sidebar에게 데이터를 props로 전달합니다.
  return <Sidebar initialCategories={dynamicCategories} initialTotalCount={totalCount} />;
}
