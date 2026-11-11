/**
 * localStorage 안전 래퍼
 *
 * 애드센스 미리보기 같은 다른 도메인 iframe 안에서, 서드파티 쿠키가 차단돼 있거나
 * 시크릿 모드이면 `localStorage`에 접근하는 순간 SecurityError가 발생합니다.
 * (`typeof localStorage !== "undefined"` 검사로는 막을 수 없음)
 * 렌더링 중에 이 예외가 나면 페이지 전체가 "Application error"로 죽기 때문에
 * 모든 localStorage 접근은 이 함수들을 거치도록 합니다.
 */
export function storageGet(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

export function storageSet(key: string, value: string): void {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // 저장소를 쓸 수 없는 환경에서는 저장만 건너뜀
  }
}

export function storageGetJSON<T>(key: string, fallback: T): T {
  const raw = storageGet(key);
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}
