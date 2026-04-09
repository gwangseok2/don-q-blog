export const getBaseUrl = () => {
  // 🚨 Cloudflare 또는 Vercel 환경 변수가 설정되어 있어야 정확한 SEO 메타데이터가 생성됩니다.
  if (process.env.NEXT_PUBLIC_VERCEL_URL) {
    return `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`;
  }
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://donqlog.com"; // 기본 도메인으로 변경하여 로컬 호스트 유출 방지
  return baseUrl;
};
